// =========== Macro Logger ===========
import * as Sentry from '@sentry/browser';
import {enableDBLogs, logAfterHook, setLogServer} from 'log2indexeddb';
import pcLog2 from 'mx-general.macros/dist/log-sync.macro';
import macroHookBuilder from 'mx-general.macros/dist/hooks/logger/admin';
if (process.env.NODE_ENV === 'development') {
    setLogServer('');
}
const hooks = macroHookBuilder({
    append2db: logAfterHook,
    transformKey: process.env.MACRO_LOG_TRANSFORMER,
    afterKey: process.env.MACRO_LOG_POST_PROCESSOR
});

window.__mxMacroHooks__ = window.__mxMacroHooks__ || {};
window.__mxMacroHooks__[process.env.MACRO_LOG_TRANSFORMER] = hooks[process.env.MACRO_LOG_TRANSFORMER];
window.__mxMacroHooks__[process.env.MACRO_LOG_POST_PROCESSOR] = (...args): MxMacroLogHookResult => {
    if (process.env.SENTRY_ERR_TRACE && args[0].level === 'error') {
        Sentry.withScope(scope => {
            const args_ = args.slice(2);
            const err = args_.find(arg => arg instanceof Error);
            scope.setExtra('details', args_);
            if (err) {
                Sentry.captureException(err);
            } else {
                const desc = args_.find(arg => typeof arg === 'string') as string;
                Sentry.captureException(new Error(desc || '请查看【附加数据】内的 details 字段'));
            }
        });
    }
    return hooks[process.env.MACRO_LOG_POST_PROCESSOR](...args);
};

pcLog2.transformRegister((...args) => window.__mxMacroHooks__[process.env.MACRO_LOG_TRANSFORMER](...args) as MxMacroLogHookParams); // 针对`ie 9`环境，请注释此行。否则，所有日志代码会被忽略，因为`ie 9`不支持`console.log.apply(...)`。
pcLog2.afterRegister((...args) => window.__mxMacroHooks__[process.env.MACRO_LOG_POST_PROCESSOR](...args) as boolean);

pcLog2.time('初始化数据库日志表');
enableDBLogs(6, 'diagonal-demo7', true).then(
    () => pcLog2.timeEnd('初始化数据库日志表'),
    () => {
        pcLog2.info('平台不支持 indexeddb');
        pcLog2.timeEnd('初始化数据库日志表');
    }
);
// =========== Global Error Capture ===
if (typeof performance === 'object' && typeof performance.timing === 'object') {
    window.addEventListener('load', () => setTimeout(() => {
        const {timing} = performance;
        pcLog2.info([
            `网页加载总耗时：${timing.loadEventEnd - timing.navigationStart}ms`,
            `|-> 准备新页面耗时：${timing.fetchStart - timing.navigationStart}ms`,
            `    |-> HTTP301/302重定向耗时：${timing.redirectEnd - timing.redirectStart}ms`,
            `    |-> 卸载（unload）前文档耗时：${timing.unloadEventEnd - timing.unloadEventStart}ms`,
            `|-> 本地缓存（App Cache）耗时：${timing.domainLookupStart - timing.fetchStart}ms`,
            `|-> DNS查询耗时：${timing.domainLookupEnd - timing.domainLookupStart}ms`,
            `|-> TCP/IP连接搭建耗时：${timing.connectEnd - timing.connectStart}ms`,
            `|-> 请求与下载网页（含被同步引入的js/css/图片/字体文件）耗时：${timing.responseEnd - timing.requestStart}ms`,
            `|-> 构建DOM树（含执行被同步引入的js程序）耗时：${timing.domInteractive - timing.responseEnd}ms`,
            `|-> 渲染DOM树耗时：${timing.domComplete - timing.domInteractive}ms`,
            `|-> load事件耗时：${timing.loadEventEnd - timing.loadEventStart}ms`
        ].join('\n'));
    }, 0));
}
window.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement ||
        event.target instanceof HTMLVideoElement ||
        event.target instanceof HTMLAudioElement ||
        event.target instanceof HTMLScriptElement ||
        event.target instanceof HTMLIFrameElement) {
        pcLog2.error(event.target.tagName, '加载资源失败', event.target.src);
    } else {
        const {stack} = event.error || event;
        if (stack) {
            pcLog2.error('window.onerror', stack);
        } else {
            pcLog2.error('window.onerror', event.message, `[${event.filename}:${event.lineno}:${event.colno}]`);
        }
    }
}, {
    capture: true
});
window.addEventListener('unhandledrejection', event => {
    pcLog2.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
});
// =========== Version Log ============
const date = new Date(process.env.CHECKNUM.timestamp);
const title = 'H5程序分支说明';
const identity = {
    'title': 'diagonal-demo7',
    'Git Branch': process.env.CHECKNUM.git.branchName,
    'Git Tag': process.env.CHECKNUM.git.tagName,
    '打包时间': `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
};
pcLog2.group(title);
pcLog2.table(identity);
pcLog2.info(JSON.stringify(identity, null, 2));
pcLog2.groupEnd();
