declare module "*.vue" {
    import Vue, {ComponentOptions} from 'vue';
    const component: ComponentOptions<Vue>;
    export default component;
}
declare module "*.ico" {
    const content: string;
    export default content;
}
declare module "vue-fragment" {
    import Vue, {ComponentOptions, PluginObject} from 'vue';
    export const Fragment: ComponentOptions<Vue>;
    export const Plugin: PluginObject<never>;
    const obj: {
        Fragment: typeof Fragment,
        Plugin: typeof Plugin
    };
    export default obj;
}
interface ElMessageBoxOptions {
    type?: 'success' | 'warning' | 'info' | 'error';
}
interface Window {
    alertAsync(message: string, title?: string, config?: ElMessageBoxOptions): Promise<void>;
    confirmAsync(message: string, title?: string, config?: ElMessageBoxOptions): Promise<boolean>;
    __mxMacroHooks__: MxMacroLogHooks;
}
declare function alertAsync(message: string, title?: string, config?: ElMessageBoxOptions): Promise<void>;
declare function confirmAsync(message: string, title?: string, config?: ElMessageBoxOptions): Promise<boolean>;
declare namespace NodeJS {
    interface ProcessEnv {
        baseURL: string;
        CHECKNUM: {
            timestamp: number;
            git: {
                branchName: string;
                tagName: string;
            }
        },
        MACRO_LOG_TRANSFORMER: string;
        MACRO_LOG_POST_PROCESSOR: string;
        NODE_ENV: string;
        SENTRY_ERR_TRACE: boolean;
        SENTRY_DSN: string;
        RELEASE_VERSION: string;
        STATIC: string;
    }
}
