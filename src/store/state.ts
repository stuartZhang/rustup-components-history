export default function(): Vuex.State{
    return {
        domains: [],
        window: {
            height: window.innerHeight,
            width: window.innerWidth
        }
    };
}
