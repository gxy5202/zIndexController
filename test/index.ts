import { updateComponentsZIndex } from '../index';

/**
  * 组件排序（测试用）
  * @param components any[]
  * @param id string
  * @param selectComponentsArray any[]
  */
export function sort(components: any[], id: string, selectComponentsArray: any[], type: string, pid?): void {
    const len = components.length - 1;
    for (let i = len; i >= 0; i--) {
        const target = components[i];
        if (target.id === id) {
            // const currentArr = selectComponentsArray.filter((item) => item[0].pid === pid);

            const obj = {
                pid,
                originIndex: i,
                targetIndex: 0,
                components
            };

            if (components.length === 1) {
                break;
            }

            switch (type) {
                case 'up':
                    obj.targetIndex = i + 1;
                    components[i] = components[i + 1];
                    components[i + 1] = target;
                    break;
                case 'down':
                    obj.targetIndex = i - 1;
                    components[i] = components[i - 1];
                    components[i - 1] = target;
                    break;
                case 'top':
                    obj.targetIndex = components.length - 1;
                    components.splice(i, 1);
                    components.push(target);
                    break;
                case 'bottom':
                    obj.targetIndex = 0;
                    components.splice(i, 1);
                    components.unshift(target);
                    break;
                default:
                    break;
            }

            // eslint-disable-next-line no-unused-expressions
            selectComponentsArray.push(obj);

            break;
        }

        const { children } = target;
        // 递归
        if (children && children.length > 0) {
            sort(children, id, selectComponentsArray, type, target.id);
        }
    }
}

/**
 * 排序（测试用）
 * @param currentComponents any[]
 * @param components any[]
 * @param type string
 */
export function sortComponentsZIndex<T>(currentComponents: any[], components: any[], type: string): T[] {
    const selectComponentsArray: any[] = [];
    // 若当前选中组件大于1个
    if (currentComponents.length > 0) {
        for (let i = currentComponents.length - 1; i >= 0; i--) {
            const { id } = currentComponents[i];
            sort(components, id, selectComponentsArray, type);
        }
        console.log(selectComponentsArray);
        console.log(components);
    }

    // 设置z-index
    for (let i = 0; i < selectComponentsArray.length; i++) {
        const target = selectComponentsArray[i];
        updateComponentsZIndex(target.originIndex, target.targetIndex, target.components, type);
    }

    return components;
}
