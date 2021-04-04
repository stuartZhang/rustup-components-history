interface DomainDigest {
    id: number;
    name: string;
}
interface GroupDigest {
    groupId: string;
    groupName: string;
}

export as namespace Vuex;
export {ActionContext, Store} from 'vuex';
export interface Size {
    width: number;
    height: number;
}
export interface Domain extends DomainDigest {
    level: number;
    leaf: boolean;
    rootId?: number;
    parentId?: number;
    children?: Domain[];
}
export interface State {
    window: Size;
    domains: Domain[];
    approval?: {
        data: GroupDigest[]
    }
}
