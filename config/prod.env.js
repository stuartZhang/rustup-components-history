'use strict';
const {common: {checknum, sentryErrTrace}, build: {assetsSubDirectory, baseURL}} = require('./index');
module.exports = {
    MACRO_LOG_PRE_PROCESSOR: '"[__mx-log-macro/admin/diagonal-demo7/pre-processor__]"',
    MACRO_LOG_TRANSFORMER: '"[__mx-log-macro/admin/diagonal-demo7/transformer__]"',
    MACRO_LOG_POST_PROCESSOR: '"[__mx-log-macro/admin/diagonal-demo7/post-processor__]"',
    SENTRY_DSN: '"https://17250e8623f74c17997023086f228caf@o267132.ingest.sentry.io/1472860"',
    SENTRY_ERR_TRACE: sentryErrTrace ? 'true' : 'false',
    RELEASE_VERSION: JSON.stringify(`diagonal-demo7_${checknum.git.tagName}_${checknum.git.branchName}`),
    CHECKNUM: JSON.stringify(checknum),
    STATIC: JSON.stringify(assetsSubDirectory),
    baseURL: `"${baseURL}"`
};
