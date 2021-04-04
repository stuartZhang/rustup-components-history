import axios, {AxiosError} from 'axios';
import _ from 'underscore';
import pcLog from 'mx-general.macros/dist/log-sync.macro';
import {Message} from 'element-ui';


class SessionLost{
    public isLogout: boolean;
    private promise?: Promise<void>;
    static INSTANCE = new SessionLost();
    constructor(){
        this.isLogout = false;
        this.promise = undefined;
    }
    action(force = false): Promise<void>{
        if (this.isLogout || force) {
            this.promise = this.promise || alertAsync('会话已登出').then(() => {
                location.replace('/web_client/#/login');
                return Promise.reject(new Error('Logout'));
            });
            return this.promise;
        }
        return Promise.resolve();
    }
}

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

instance.interceptors.request.use(config => SessionLost.INSTANCE.action().then(() => {
    if (config.data instanceof URLSearchParams) {
        _.extendOwn(config.headers, {'Content-Type': 'application/x-www-form-urlencoded'});
        _.extendOwn(config, {data: config.data.toString()});
    } else if (!(config.data instanceof FormData)) {
        _.defaults(config.headers, {'Content-Type': 'application/json;charset=UTF-8'});
    }
    return config;
}), error => Promise.reject(error));

instance.interceptors.response.use(response => {
    const {code, message, responseCode, msg, data} = response.data || {};
    if (code != null && String(code) !== '0' && String(code) !== '200' ||
        responseCode != null && String(responseCode) !== '80000') {
        const errMsg = message || msg;
        Message.error({
            duration: 0,
            showClose: true,
            dangerouslyUseHTMLString: true,
            message: errMsg ? errMsg.replace(/\n/ug, '<br>').replace(/\s+/gu, '&nbsp;') : '没有错误描述'
        });
        
        pcLog.error('Axios 拦截到后端异常响应', response.config.method, response.config.url, response);
        return Promise.reject(response);
    }
    if (data == null && /^get$/ui.test(response.config.method || '') &&
        !Array.isArray(response.data) && typeof response.data === 'object') {
        Message.error({
            duration: 0,
            showClose: true,
            dangerouslyUseHTMLString: true,
            message: `${response.config.method}-${response.config.url} 没有返回 data`
        });
        
        pcLog.error(`Axios 拦截到后端异常响应 ${response.config.method}-${response.config.url} 没有返回 data`);
        return Promise.reject(response);
    }
    return response;
}, onAxiosErr);
export function onAxiosErr(err: AxiosError): Promise<AxiosError | void>{
    pcLog.error(err);
    if (err.response) {
        const {data, status, statusText} = err.response;
        if (~[401, 402].indexOf(status)) {
            return SessionLost.INSTANCE.action(true);
        }
        let message;
        if (typeof data?.errors === 'object') {
            message = `[${data.errors.status_code}] ${data.errors.message}`;
        } else {
            message = `[${status}] ${statusText}`;
        }
        Message.error({
            duration: 0,
            showClose: true,
            dangerouslyUseHTMLString: true,
            message
        });
    } else if (err.code === 'ECONNABORTED') {
        err.message = `连接超时，超过了 ${TIME_OUT / 1000} 秒`;
    }
    return Promise.reject(err);
}
export {
    instance as axios,
    install as default
};
