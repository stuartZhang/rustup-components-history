'use strict';
const {common: {checknum, sentryErrTrace}, build: {assetsSubDirectory, baseURL}} = require('./index');
module.exports = {
    MACRO_LOG_PRE_PROCESSOR: '"[__mx-log-macro/admin/rustup-components-history/pre-processor__]"',
    MACRO_LOG_TRANSFORMER: '"[__mx-log-macro/admin/rustup-components-history/transformer__]"',
    MACRO_LOG_POST_PROCESSOR: '"[__mx-log-macro/admin/rustup-components-history/post-processor__]"',
    SENTRY_DSN: '"https://6d559309450c4ccc82ac0c6f7a57879d@o267132.ingest.sentry.io/5705610"',
    SENTRY_ERR_TRACE: sentryErrTrace ? 'true' : 'false',
    RELEASE_VERSION: JSON.stringify(`rustup-components-history_${checknum.git.tagName}_${checknum.git.branchName}`),
    CHECKNUM: JSON.stringify(checknum),
    STATIC: JSON.stringify(assetsSubDirectory),
    baseURL: `"${baseURL}"`
};
