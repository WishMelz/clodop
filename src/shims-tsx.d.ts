import Vue, { VNode } from 'vue'

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode {}
        // tslint:disable no-empty-interface
        interface ElementClass extends Vue {}
        interface IntrinsicElements {
            [elem: string]: any
        }
    }
    interface Window {
        WKWebViewJavascriptBridge: any
        WKWVJBCallbacks: any
        WebViewJavascriptBridge: any
        webkit: any
        electron: any
        getCLodop: any
        MozWebSocket: any
        CLODOP: any
        LodopToken: string
    }
}
