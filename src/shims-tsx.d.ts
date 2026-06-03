declare global {
    interface Window {
        WKWebViewJavascriptBridge: any
        WKWVJBCallbacks: any
        WebViewJavascriptBridge: any
        webkit: any
        electron: any
        getCLodop: any
        MozWebSocket: any
        CLODOP?: any
        LodopToken: string
    }
}

export {}
