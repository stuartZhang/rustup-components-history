/* eslint-disable no-unused-expressions */
const MockData = require('webpack-dev-server-ssoproxy/MockData');
// const {itemsBuilder} = require('webpack-dev-server-ssoproxy/helpers');
const path = require('path');
const chai = require('chai');
const _ = require('underscore');
module.exports = new MockData(path.resolve(__dirname, 'mock.conf.json'), [{
    runAs: 'interceptor', // null | 'interceptor' | 'interpolator'
    method: 'get',
    urlPattern: '/mxapproval/api_admin/v2/approval/oauth/domainIds',
    data(req, Mock, mockConf){
        chai.expect(req.query.domain_id).to.be.undefined;
        const {'/mxapproval/api_admin/v2/approval/oauth/domainIds': conf} = mockConf;
        if (conf.feedbackErr) {
            const err = _.extendOwn(new Error(), {
                code: 500,
                stack: JSON.stringify({
                    errors: {
                        message: conf.errMsg,
                        status_code: conf.errCode // eslint-disable-line camelcase
                    }
                })
            });
            throw err;
        }
        return {
            message: 'OK',
            code: 0,
            data: [{
                'id': '@INCREMENT(1, 1000)',
                'name': '@CNAME(3)',
                'children|2-36': [{
                    id: '@INCREMENT(1, 2000)',
                    name: '@CNAME(3)',
                    children: Mock.Random.boolean() ?
                        Mock.mock({
                            '_V_NODE_KEY_|3-8': [{
                                id: '@INCREMENT(1, 3000)',
                                name: '@CNAME(3)'
                            }]
                        })._V_NODE_KEY_ :
                        []
                }]
            }]
        };
    }
}, {
    runAs: 'interceptor', // null | 'interceptor' | 'interpolator'
    method: 'get',
    urlPattern: '/websocket/test',
    data(/* req, msg, Mock, mockConf */){
        return 'OK. I\'ve received it.';
    }
}]);
