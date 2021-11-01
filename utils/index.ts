/*
 * @Author: Gomi
 * @Date: 2021-02-02 17:18:35
 * @Description: system zindex controller
 */

/**
 * 递归设置所有组件z-index
 * @param components any[]
 */
export function updateAllComponentsZIndex(components: any[]): void {
    // 递归修改层级样式
    for (let i = 0; i < components.length; i++) {
        const { id, children } = components[i];
        try {
            const com = document.getElementById(`component-root-${id}`);
            if (com) {
                com.style.zIndex = `${i}`;
            }
        } catch (e) {
            console.error(e);
        }

        if (children && children.length > 0) {
            updateAllComponentsZIndex(children);
        }
    }
}

/**
 * 拖拽组件进入画布时，添加zindex规则
 * @param id string
 * @param components any[]
 */
export function initComponentZIndex(target: JQuery, components: any[]): void {
    target.css('z-index', `${components.length}`);
}

/**
 * 上移或置顶
 * @param originIndex number
 * @param targetIndex number
 * @param components any[]
 */
export function updateZIndexUp(originIndex: number, targetIndex: number, components: any[]): void {
    while (originIndex <= targetIndex) {
        const { id } = components[originIndex];
        if (!id) return;
        try {
            document.getElementById(`component-root-${id}`).style.zIndex = `${originIndex}`;
        } catch (e) {
            console.warn(e); // TODO 复制后zindex优化
        }
        originIndex++;
    }
}

/**
 * 下移或置底
 * @param originIndex number
 * @param targetIndex number
 * @param components any[]
 */
export function updateZIndexDown(originIndex: number, targetIndex: number, components: any[]): void {
    while (targetIndex <= originIndex) {
        const { id } = components[targetIndex] || {};
        if (!id) return;
        try {
            document.getElementById(`component-root-${id}`).style.zIndex = `${targetIndex}`;
        } catch (e) {
            console.warn(e);
        }
        targetIndex++;
    }
}

/**
 * 根据类型执行方法上移或下移
 * @param originIndex 被移动元素下标
 * @param targetIndex 目标位置下标
 * @param components 组件列表
 * @param type 类型 up上移，down下移, top置顶， bottom置底
 */
export function updateComponentsZIndex(
    originIndex: number,
    targetIndex: number,
    components: any[],
    type: string
): void {
    if (type === 'up' || type === 'top') {
        updateZIndexUp(originIndex, targetIndex, components);
    } else if (type === 'down' || type === 'bottom') {
        updateZIndexDown(originIndex, targetIndex, components);
    }
}
