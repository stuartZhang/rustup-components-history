// 分组排序数组
type Approval = {id: string; name: string};
export const sortGroups = (state: Vuex.State): Approval[] => {
    const data: Approval[] = [];
    state.approval && state.approval.data.forEach(item => data.push({
        id: item.groupId,
        name: item.groupName
    }));
    return data;
};
