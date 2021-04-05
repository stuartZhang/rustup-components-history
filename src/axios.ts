import axios, {AxiosError} from 'axios';
import _ from 'underscore';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
import {Message} from 'element-ui';

const TIME_OUT = 999999;
const instance = axios.create({
    baseURL: process.env.baseURL,
    timeout: TIME_OUT
});

function install(Vue: Vue.VueConstructor): void{
    _.extendOwn(Vue.prototype, {
        $axios: instance
    });
}

instance.interceptors.request.use(config => {
    if (config.data instanceof URLSearchParams) {
        _.extendOwn(config.headers, {'Content-Type': 'application/x-www-form-urlencoded'});
        _.extendOwn(config, {data: config.data.toString()});
    } else if (!(config.data instanceof FormData)) {
        _.defaults(config.headers, {'Content-Type': 'application/json;charset=UTF-8'});
    }
    return config;
}, error => Promise.reject(error));

instance.interceptors.response.use(response => response, onAxiosErr);
export function onAxiosErr(err: AxiosError): Promise<AxiosError | void>{
    pcLog.error(err);
    let message = err.message || '请求失败';
    if (err.response) {
        const {data, status, statusText} = err.response;
        if (typeof data?.errors === 'object') {
            message = `[${data.errors.status_code}] ${data.errors.message}`;
        } else {
            message = `[${status}] ${statusText}`;
        }
    } else if (err.code === 'ECONNABORTED') {
        message = err.message = `连接超时，超过了 ${TIME_OUT / 1000} 秒`;
    }
    Message.error({
        duration: 0,
        showClose: true,
        dangerouslyUseHTMLString: true,
        message
    });
    return Promise.reject(err);
}
export {
    instance as axios,
    install as default
};
