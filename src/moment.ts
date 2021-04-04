import moment from 'moment';
export default {
    install(Vue: Vue.VueConstructor): void{
        Vue.prototype.$moment = moment;
    }
};
