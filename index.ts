/*
 * @Author: Gomi
 * @Description: 根据监组件列表变化更新zindex
 */
import store from 'store';
import {
    selectComponents,
    selectCurrentComponents,
    selectCurrentPageStatus,
    selectCurrentPage
} from 'store/selectors/page';
import { updateComponentsZIndex, updateAllComponentsZIndex } from './utils';
import { FlattenComponentsObject } from './index.d';

let flattenComponents: FlattenComponentsObject = {}; // 组件列表hash表
let flattenComponentsSnapShot: FlattenComponentsObject = {}; // 组件列表hash快照
let oldComponents: any[] = []; // 组件列表数组
let currentPageId: string = ''; // 当前页面id
/**
 * @description: diff组件顺序变化，利用组件id作为key直接查找
 * @param {any} component
 */
const diffComponentsZIndex = (component: any): void => {
    const { id } = component;
    const { pid } = flattenComponents[id];

    // 若存在容器拖拽或者组合，则更新全部
    if (pid !== flattenComponentsSnapShot[id].pid || (pid === flattenComponentsSnapShot[id].pid && component.type === 'container')) {
        updateAllComponentsZIndex(oldComponents);
        return;
    }

    // 通过索引key直接查找出快照和当前组件顺序的区别
    const originIndex = flattenComponentsSnapShot[id].index;
    const targetIndex = flattenComponents[id].index;

    // 如果存在父容器id, 则找到当前这一层
    const currentComponents = pid !== 'root' ? flattenComponents[pid]?.component.children : oldComponents;
    if (!currentComponents) {
        return;
    }

    // 判断向上移动还是向下移动
    if (targetIndex > originIndex) {
        updateComponentsZIndex(originIndex, targetIndex, currentComponents, 'up');
    } else if (targetIndex < originIndex) {
        updateComponentsZIndex(originIndex, targetIndex, currentComponents, 'down');
    }
};

/**
 * @description: 深度优先，递归获取所有组件, 扁平化层级
 * @param {any} components
 * @param {string} pid
 */
const traverseFlattenComponents = (components: any[], pid: string = 'root'): void => {
    for (let i = 0; i < components.length; i++) {
        const item = components[i];

        flattenComponents[item.id] = {
            index: i, // 组件所在层级的下标
            component: {
                // 只存储组件对象中的id和children， 其他不需要的不存储，节约内存开销
                children: [...item.children],
                id: item.id
            },
            pid // 若是子组件则pid为父组件的id
        };

        if (item.children && item.children.length > 0) {
            traverseFlattenComponents(item.children, item.id);
        }
    }
};

/**
 * @description: 删除组件时，设置z-index; 新增组件时，设置z-index: 由于updateComponentsZIndex遍历的是固定值2，时间复杂度可看作O(n);
 * @param {*} componentsKeys
 */
const resetZIndexByType = (componentsKeys, type: string): void => {
    const compareComponents = type === 'add' ? flattenComponentsSnapShot : flattenComponents;
    const itemCompareComponents = type === 'add' ? flattenComponents : flattenComponentsSnapShot;

    // 匹配出增加或删除的组件, 重置组件所属层级的z-index
    componentsKeys.forEach((id) => {
        if (!compareComponents[id]) {
            // 如果是同一级，找到最底层的组件，修改后面的顺序
            const item = itemCompareComponents[id];
            const { pid } = item;
            const components = pid !== 'root' ? flattenComponents[pid]?.component.children : oldComponents;
            if (!components || components.length === 0) {
                return;
            }

            const originIndex = item.index;
            updateComponentsZIndex(originIndex, components.length - 1, components, 'up');
        }
    });
};

/**
 * @description: 当选中了组件，进行上移下移，置顶置底或拖入拖出容器时
 * @param {*} currentComponents
 */
const resetZIndexWhenSort = (currentComponents): void => {
    // 选中组件进行上移下移或置顶置底操作
    for (let i = 0; i < currentComponents.length; i++) {
        diffComponentsZIndex(currentComponents[i]);
    }
};

/**
 * @description: 根据监听组件列表变化修改zindex
 * @param {*}
 * @return {*}
 */
export default function updateZIndexByWatching(): Function {
    // TODO 性能优化，主要是容器组件一次操作多次更新updateComponents
    /**
     * @description: 监听组件列表变化
     * @param {*} store
     */
    const unsubscribe = store.subscribe(() => {
        // 判断页面是否切换
        const pageId = selectCurrentPage().id;

        if (pageId !== currentPageId) {
            oldComponents = [];
            currentPageId = pageId;
        }

        // 组件加载完成后才执行
        if (selectCurrentPageStatus() !== 'loaded') {
            return;
        }

        const newComponents = selectComponents();

        // 若组件列表未变化不执行
        if (oldComponents === newComponents) {
            return;
        }

        // 若画布无组件不执行
        if (newComponents.length === 0) {
            oldComponents = [];
            return;
        }

        // 重置扁平化对象
        flattenComponents = {};
        // 扁平化所有组件
        traverseFlattenComponents(newComponents);

        // 初始化页面时
        if (oldComponents.length === 0 && newComponents.length > 0) {
            updateAllComponentsZIndex((oldComponents = newComponents));
            flattenComponentsSnapShot = { ...flattenComponents };
            return;
        }

        oldComponents = newComponents;
        const currentComponents = selectCurrentComponents();
        const flattenComponentsSnapShotKeys = Object.keys(flattenComponentsSnapShot);
        const flattenComponentsKeys = Object.keys(flattenComponents);

        try {
            // 根据对比快照判断情况
            switch (true) {
                // 新增组件
                case flattenComponentsSnapShotKeys.length < flattenComponentsKeys.length:
                    resetZIndexByType(flattenComponentsKeys, 'add');
                    break;
                // 删除组件
                case flattenComponentsSnapShotKeys.length > flattenComponentsKeys.length:
                    // 匹配出删除的组件, 重置删除组件所属层级的z-index
                    resetZIndexByType(flattenComponentsSnapShotKeys, 'delete');
                    break;
                // 上移下移或置顶置底
                case currentComponents.length > 0:
                    resetZIndexWhenSort(currentComponents);
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error(e);
        }

        // 扁平化后的快照
        flattenComponentsSnapShot = { ...flattenComponents };
    });

    return unsubscribe;
}
