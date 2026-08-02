var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { DEFAULT_CONFIG } from './type';
//用双端口加载主JS文件Lodop.js(或CLodopfuncs.js兼容老版本)以防其中某端口被占:
// export const MainJS = "CLodopfuncs.js";
// export const URL_WS1 = `ws://localhost:8000/${MainJS}`;           // ws用8000/18000
// export const URL_WS2 = `ws://localhost:18000/${MainJS}`;
// export const URL_HTTP1 = `http://localhost:8000/${MainJS}`;       // http用8000/18000
// export const URL_HTTP2 = `http://localhost:18000/${MainJS}`;
// export const URL_HTTP3 = `https://localhost.lodop.net:8443/${MainJS}`; // https用8000/8443
var MainJS;
var URL_WS1;
var URL_WS2;
var URL_HTTP1;
var URL_HTTP2;
var URL_HTTP3;
var CreatedOKLodopObject;
var CLodopIsLocal;
var LoadJsState;
var LodopToken = DEFAULT_CONFIG.token;
function updateUrls(config) {
    LodopToken = config.token;
    if (typeof window !== 'undefined') {
        window.LodopToken = LodopToken;
    }
    MainJS = config.mainJS;
    URL_WS1 = "ws://localhost:".concat(config.wsPort1, "/").concat(MainJS);
    URL_WS2 = "ws://localhost:".concat(config.wsPort2, "/").concat(MainJS);
    URL_HTTP1 = "http://localhost:".concat(config.httpPort1, "/").concat(MainJS);
    URL_HTTP2 = "http://localhost:".concat(config.httpPort2, "/").concat(MainJS);
    URL_HTTP3 = "https://localhost.lodop.net:".concat(config.httpsPort, "/").concat(MainJS);
}
function compareVersion(version, target) {
    var parseVersion = function (value) {
        return String(value || '')
            .split('.')
            .map(function (item) { return parseInt(item, 10) || 0; });
    };
    var versionParts = parseVersion(version);
    var targetParts = parseVersion(target);
    var maxLength = Math.max(versionParts.length, targetParts.length);
    for (var index = 0; index < maxLength; index++) {
        var versionPart = versionParts[index] || 0;
        var targetPart = targetParts[index] || 0;
        if (versionPart > targetPart)
            return 1;
        if (versionPart < targetPart)
            return -1;
    }
    return 0;
}
// 初始化默认值
updateUrls(DEFAULT_CONFIG);
// 判断是否需要CLodop(那些不支持插件的浏览器)
export function needCLodop() {
    try {
        var ua = navigator.userAgent;
        if (ua.match(/Windows\sPhone/i) ||
            ua.match(/iPhone|iPod|iPad/i) ||
            ua.match(/Android/i) ||
            ua.match(/Edge\D?\d+/i)) {
            return true;
        }
        var verTrident = ua.match(/Trident\D?\d+/i);
        var verIE = ua.match(/MSIE\D?\d+/i);
        var verOPR = ua.match(/OPR\D?\d+/i);
        var verFF = ua.match(/Firefox\D?\d+/i);
        var x64 = ua.match(/x64/i);
        if (!verTrident && !verIE && x64)
            return true;
        if (verFF) {
            var version = verFF[0].match(/\d+/);
            if (version && (parseInt(version[0]) >= 41 || x64))
                return true;
        }
        else if (verOPR) {
            var version = verOPR[0].match(/\d+/);
            if (version && parseInt(version[0]) >= 32)
                return true;
        }
        else if (!verTrident && !verIE) {
            var verChrome = ua.match(/Chrome\D?\d+/i);
            if (verChrome) {
                var version = verChrome[0].match(/\d+/);
                if (version && parseInt(version[0]) >= 41)
                    return true;
            }
        }
        return false;
    }
    catch (err) {
        return true;
    }
}
export function checkOrTryHttp() {
    if (window === null || window === void 0 ? void 0 : window.getCLodop) {
        LoadJsState = 'complete';
        return true;
    }
    if (LoadJsState === 'loadingB' || LoadJsState === 'complete')
        return false;
    LoadJsState = 'loadingB';
    var head = document.head ||
        document.getElementsByTagName('head')[0] ||
        document.documentElement;
    var JS1 = document.createElement('script');
    var JS2 = document.createElement('script');
    var JS3 = document.createElement('script');
    JS1.src = URL_HTTP1;
    JS2.src = URL_HTTP2;
    JS3.src = URL_HTTP3;
    var completeHandler = function () {
        LoadJsState = 'complete';
    };
    JS1.onload =
        JS2.onload =
            JS3.onload =
                JS2.onerror =
                    JS3.onerror =
                        completeHandler;
    JS1.onerror = function () {
        if (window.location.protocol !== 'https:') {
            head.insertBefore(JS2, head.firstChild);
        }
        else {
            head.insertBefore(JS3, head.firstChild);
        }
    };
    head.insertBefore(JS1, head.firstChild);
    return false;
}
// 加载Lodop对象的主过程
export function initialize(config) {
    if (config) {
        // 合并配置
        var mergedConfig = __assign(__assign({}, DEFAULT_CONFIG), config);
        // 更新URLs
        updateUrls(mergedConfig);
    }
    if (typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof navigator === 'undefined') {
        return;
    }
    if (!needCLodop())
        return;
    if (window.getCLodop) {
        LoadJsState = 'complete';
        return;
    }
    if (LoadJsState)
        return;
    CLodopIsLocal = !!(URL_WS1 + URL_WS2).match(/\/\/localho|\/\/127.0.0./i);
    LoadJsState = 'loadingA';
    if (!window.WebSocket && window.MozWebSocket) {
        window.WebSocket = window.MozWebSocket;
    }
    try {
        var WSK1 = new WebSocket(URL_WS1);
        WSK1.onopen = function () {
            setTimeout(checkOrTryHttp, 200);
        };
        WSK1.onmessage = function (e) {
            if (!window.getCLodop)
                eval(e.data);
        };
        WSK1.onerror = function () {
            var WSK2 = new WebSocket(URL_WS2);
            WSK2.onopen = function () {
                setTimeout(checkOrTryHttp, 200);
            };
            WSK2.onmessage = function (e) {
                if (!window.getCLodop)
                    eval(e.data);
            };
            WSK2.onerror = function () {
                checkOrTryHttp();
            };
        };
    }
    catch (e) {
        checkOrTryHttp();
    }
}
function showLodopTip(title, description, actions) {
    var existingTip = document.getElementById('lodop-tip');
    if (existingTip && existingTip.parentNode) {
        existingTip.parentNode.removeChild(existingTip);
    }
    var tipElement = document.createElement('div');
    tipElement.id = 'lodop-tip';
    tipElement.style.cssText =
        'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;box-sizing:border-box;width:calc(100% - 32px);max-width:720px;padding:14px 16px;border:1px solid #fecaca;border-radius:8px;background:#fff1f2;color:#7f1d1d;font-size:14px;line-height:1.6;box-shadow:0 10px 24px rgba(127,29,29,.18);';
    var actionHtml = actions
        .map(function (action) {
        return "<a href=\"".concat(action.href, "\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:inline-block;margin-right:8px;margin-top:8px;padding:4px 10px;border-radius:4px;background:#dc2626;color:#fff;text-decoration:none;\">").concat(action.text, "</a>");
    })
        .join('');
    tipElement.innerHTML = "<strong style=\"display:block;margin-bottom:4px;font-size:15px;\">".concat(title, "</strong><span>").concat(description, "</span><div>").concat(actionHtml, "</div>");
    document.body.appendChild(tipElement);
}
export function getLodop(oOBJECT, oEMBED) {
    var _a;
    var lodopDownloadUrl = 'http://www.c-lodop.com/download.html';
    var cLodopSetupUrl = 'CLodop.protocol:setup';
    try {
        // Detect OS and browser
        var detection = {
            isWinIE: /MSIE/i.test(navigator.userAgent) ||
                /Trident/i.test(navigator.userAgent),
            isWinIE64: false,
            isLinuxX86: /Linux/i.test(navigator.platform) &&
                /x86/i.test(navigator.platform),
            isLinuxARM: /Linux/i.test(navigator.platform) &&
                /aarch/i.test(navigator.platform),
        };
        detection.isWinIE64 =
            detection.isWinIE && /x64/i.test(navigator.userAgent);
        var LODOP = void 0;
        if (needCLodop() || detection.isLinuxX86 || detection.isLinuxARM) {
            try {
                LODOP = window.getCLodop();
            }
            catch (err) { }
            if (!LODOP && LoadJsState !== 'complete') {
                if (!LoadJsState) {
                    alert('未曾加载Lodop主JS文件，请先调用loadCLodop过程.');
                }
                else {
                    alert('网页还没下载完毕，请稍等一下再操作.');
                }
                return;
            }
            if (!LODOP) {
                if (detection.isLinuxX86 || detection.isLinuxARM) {
                    showLodopTip('Web打印服务 Lodop7 未安装或未启动', '当前页面无法连接本机 Lodop7 服务。请前往官网下载并安装对应系统版本，安装成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
                }
                else {
                    showLodopTip('Web打印服务 CLodop 未安装或未启动', '当前页面无法连接本机 CLodop 服务。请确认已安装并启动服务，安装成功后刷新页面或重启浏览器。', __spreadArray([
                        { text: '前往官网下载', href: lodopDownloadUrl }
                    ], (CLodopIsLocal
                        ? [{ text: '尝试启动服务', href: cLodopSetupUrl }]
                        : []), true));
                }
                return;
            }
            else {
                if (detection.isLinuxX86 &&
                    compareVersion(LODOP.CVERSION, '7.1.1.9') < 0) {
                    showLodopTip('Web打印服务 Lodop7 需要升级', '当前 Lodop7 版本过低，可能无法正常打印。请前往官网下载新版，升级成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
                }
                else if (detection.isLinuxARM &&
                    compareVersion(LODOP.CVERSION, '7.1.1.9') < 0) {
                    showLodopTip('Web打印服务 Lodop7 需要升级', '当前 Lodop7 版本过低，可能无法正常打印。请前往官网下载新版，升级成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
                }
                else if (((_a = window.CLODOP) === null || _a === void 0 ? void 0 : _a.CVERSION) &&
                    compareVersion(window.CLODOP.CVERSION, '6.6.4.2') < 0) {
                    showLodopTip('Web打印服务 CLodop 需要升级', '当前 CLodop 版本过低，可能无法正常打印。请前往官网下载新版，升级成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
                }
            }
        }
        else {
            //==如果页面有Lodop插件就直接使用,否则新建:==
            if (oOBJECT || oEMBED) {
                if (detection.isWinIE)
                    LODOP = oOBJECT;
                else
                    LODOP = oEMBED;
            }
            else if (!CreatedOKLodopObject) {
                LODOP = document.createElement('object');
                LODOP.setAttribute('width', '0');
                LODOP.setAttribute('height', '0');
                LODOP.setAttribute('style', 'position:absolute;left:0px;top:-100px;width:0px;height:0px;');
                if (detection.isWinIE) {
                    LODOP.setAttribute('classid', 'clsid:2105C259-1E0C-4534-8141-A753534CB4CA');
                }
                else {
                    LODOP.setAttribute('type', 'application/x-print-lodop');
                }
                document.documentElement.appendChild(LODOP);
                CreatedOKLodopObject = LODOP;
            }
            else {
                LODOP = CreatedOKLodopObject;
            }
            //==Lodop插件未安装时提示下载地址:==
            if (!LODOP || !LODOP.VERSION) {
                showLodopTip(detection.isWinIE64
                    ? '64位打印控件 Lodop 未安装'
                    : '打印控件 Lodop 未安装', '当前页面无法检测到 Lodop 打印控件。请前往官网下载并安装，安装成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
                return LODOP;
            }
            if (compareVersion(LODOP.VERSION, '6.2.2.6') < 0) {
                showLodopTip(detection.isWinIE64
                    ? '64位打印控件 Lodop 需要升级'
                    : '打印控件 Lodop 需要升级', '当前 Lodop 打印控件版本过低，可能无法正常打印。请前往官网下载新版，升级成功后刷新页面或重启浏览器。', [{ text: '前往官网下载', href: lodopDownloadUrl }]);
            }
        }
        LODOP.SET_LICENSES('', LodopToken, '', '');
        return LODOP;
    }
    catch (err) {
        alert('getLodop出错:' + err);
    }
}
