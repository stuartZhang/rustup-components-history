// =========== Sentry =================
import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import {Vue as VueIntegration} from '@sentry/integrations';
import {Integrations} from '@sentry/tracing';
import consoleBreadcrumb from 'mx-general.macros/dist/sentry/admin';

if (process.env.SENTRY_ERR_TRACE) {
    consoleBreadcrumb(Sentry);
    try {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            release: process.env.RELEASE_VERSION,
            environment: '管理端',
            tracesSampleRate: 1.0,
            integrations: [
                new VueIntegration({
                    Vue,
                    tracing: true,
                    attachProps: true,
                    logErrors: true
                }),
                new Integrations.BrowserTracing()
            ]
        });
    } catch (error) {/* nothing */}
}
