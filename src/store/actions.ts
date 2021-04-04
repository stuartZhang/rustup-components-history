import pcLog from 'mx-general.macros/dist/log-sync.macro';
import {axios} from '../axios';

export const getDomainIds = ({commit}: Vuex.ActionContext<Vuex.State, Vuex.State>/* , payload */): Promise<Vuex.Domain[]> => axios.get('/mxapproval/api_admin/v2/approval/oauth/domainIds').then(response => {
    pcLog.log('getDomainIds - /mxapproval/api_admin/v2/approval/oauth/domainIds', response.data);
    if (response.data.code === 0) {
        const result = response.data.data;
        commit('setDomains', result);
        return result;
    }
    return Promise.reject(response.data.message);
}, (/* error */) => Promise.reject(new Error('非常抱歉,程序异常!')));
