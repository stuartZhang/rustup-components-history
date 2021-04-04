// 设置域信息
export const setDomains = (state: Vuex.State, payload: Vuex.Domain[]): void => {
    state.domains = payload;
};
// 跟踪窗体尺寸变化
export function setWindowSize(state: Vuex.State, {width, height}: Vuex.Size): void{
    state.window.height = height;
    state.window.width = width;
}
