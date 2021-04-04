import ElementUI from 'element-ui';
import _ from 'underscore';
import './assets/element-ui/theme/index.scss';

export default {
    install(Vue: Vue.VueConstructor): void{
        Vue.use(ElementUI, {size: 'medium'});
        window.alertAsync = (msg, title = '提示'): Promise<void> => Vue.prototype.$alert(msg, title, {type: 'info'});
        window.confirmAsync = (msg, title = '询问', config = {}): Promise<boolean> => Vue.prototype.$confirm(msg, title, _.defaults(config, {type: 'info'})).then(() => true, () => false);
    }
};
