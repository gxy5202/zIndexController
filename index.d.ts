// 需要移动的层级对象
export interface IndexTarget {
    id: string, // 组件id
    index: number // 组件在当前层级的下标
}

// 扁平化组件对象
export interface ComponentItem {
    index: number,
    component: {
        id: string,
        children: any[]
    },
    pid: string
}

export interface FlattenComponentsObject {
    [key: string]: ComponentItem,
}
