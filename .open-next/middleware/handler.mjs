
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.6";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream as ReadableStream2 } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var e = {}, r = {};
      function t(o) {
        var n = r[o];
        if (void 0 !== n) return n.exports;
        var i = r[o] = { exports: {} }, l = true;
        try {
          e[o](i, i.exports, t), l = false;
        } finally {
          l && delete r[o];
        }
        return i.exports;
      }
      t.m = e, t.amdO = {}, (() => {
        var e2 = [];
        t.O = (r2, o, n, i) => {
          if (o) {
            i = i || 0;
            for (var l = e2.length; l > 0 && e2[l - 1][2] > i; l--) e2[l] = e2[l - 1];
            e2[l] = [o, n, i];
            return;
          }
          for (var a = 1 / 0, l = 0; l < e2.length; l++) {
            for (var [o, n, i] = e2[l], f = true, u = 0; u < o.length; u++) a >= i && Object.keys(t.O).every((e3) => t.O[e3](o[u])) ? o.splice(u--, 1) : (f = false, i < a && (a = i));
            if (f) {
              e2.splice(l--, 1);
              var s = n();
              void 0 !== s && (r2 = s);
            }
          }
          return r2;
        };
      })(), t.d = (e2, r2) => {
        for (var o in r2) t.o(r2, o) && !t.o(e2, o) && Object.defineProperty(e2, o, { enumerable: true, get: r2[o] });
      }, t.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (e2) {
          if ("object" == typeof window) return window;
        }
      }(), t.o = (e2, r2) => Object.prototype.hasOwnProperty.call(e2, r2), t.r = (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, (() => {
        var e2 = { 993: 0 };
        t.O.j = (r3) => 0 === e2[r3];
        var r2 = (r3, o2) => {
          var n, i, [l, a, f] = o2, u = 0;
          if (l.some((r4) => 0 !== e2[r4])) {
            for (n in a) t.o(a, n) && (t.m[n] = a[n]);
            if (f) var s = f(t);
          }
          for (r3 && r3(o2); u < l.length; u++) i = l[u], t.o(e2, i) && e2[i] && e2[i][0](), e2[i] = 0;
          return t.O(s);
        }, o = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        o.forEach(r2.bind(null, 0)), o.push = r2.bind(null, o.push.bind(o));
      })();
    })();
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/src/middleware.js
var require_middleware = __commonJS({
  ".next/server/src/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[727], { 67: (e) => {
      "use strict";
      e.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 195: (e) => {
      "use strict";
      e.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 64: (e, t, r) => {
      "use strict";
      let s, i, n, a;
      r.r(t), r.d(t, { default: () => nn });
      var o, l, u, c, h, d, p, f, g, m, b, y, w, v, _, k, S, T, E, R, O = {};
      async function A() {
        let e10 = "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && (await _ENTRIES.middleware_instrumentation).register;
        if (e10) try {
          await e10();
        } catch (e11) {
          throw e11.message = `An error occurred while loading instrumentation hook: ${e11.message}`, e11;
        }
      }
      r.r(O), r.d(O, { config: () => nt, middleware: () => ne });
      let P = null;
      function C() {
        return P || (P = A()), P;
      }
      function x(e10) {
        return `The edge runtime does not support Node.js '${e10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== r.g.process && (process.env = r.g.process.env, r.g.process = process), Object.defineProperty(globalThis, "__import_unsupported", { value: function(e10) {
        let t10 = new Proxy(function() {
        }, { get(t11, r10) {
          if ("then" === r10) return {};
          throw Error(x(e10));
        }, construct() {
          throw Error(x(e10));
        }, apply(r10, s10, i10) {
          if ("function" == typeof i10[0]) return i10[0](t10);
          throw Error(x(e10));
        } });
        return new Proxy({}, { get: () => t10 });
      }, enumerable: false, configurable: false }), C();
      class I extends Error {
        constructor({ page: e10 }) {
          super(`The middleware "${e10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class j extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class N extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let $ = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", api: "api", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", appMetadataRoute: "app-metadata-route", appRouteHandler: "app-route-handler" };
      function L(e10) {
        var t10, r10, s10, i10, n2, a2 = [], o2 = 0;
        function l2() {
          for (; o2 < e10.length && /\s/.test(e10.charAt(o2)); ) o2 += 1;
          return o2 < e10.length;
        }
        for (; o2 < e10.length; ) {
          for (t10 = o2, n2 = false; l2(); ) if ("," === (r10 = e10.charAt(o2))) {
            for (s10 = o2, o2 += 1, l2(), i10 = o2; o2 < e10.length && "=" !== (r10 = e10.charAt(o2)) && ";" !== r10 && "," !== r10; ) o2 += 1;
            o2 < e10.length && "=" === e10.charAt(o2) ? (n2 = true, o2 = i10, a2.push(e10.substring(t10, s10)), t10 = o2) : o2 = s10 + 1;
          } else o2 += 1;
          (!n2 || o2 >= e10.length) && a2.push(e10.substring(t10, e10.length));
        }
        return a2;
      }
      function D(e10) {
        let t10 = {}, r10 = [];
        if (e10) for (let [s10, i10] of e10.entries()) "set-cookie" === s10.toLowerCase() ? (r10.push(...L(i10)), t10[s10] = 1 === r10.length ? r10[0] : r10) : t10[s10] = i10;
        return t10;
      }
      function U(e10) {
        try {
          return String(new URL(String(e10)));
        } catch (t10) {
          throw Error(`URL is malformed "${String(e10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t10 });
        }
      }
      ({ ...$, GROUP: { serverOnly: [$.reactServerComponents, $.actionBrowser, $.appMetadataRoute, $.appRouteHandler, $.instrument], clientOnly: [$.serverSideRendering, $.appPagesBrowser], nonClientServerTarget: [$.middleware, $.api], app: [$.reactServerComponents, $.actionBrowser, $.appMetadataRoute, $.appRouteHandler, $.serverSideRendering, $.appPagesBrowser, $.shared, $.instrument] } });
      let M = Symbol("response"), B = Symbol("passThrough"), q = Symbol("waitUntil");
      class H {
        constructor(e10) {
          this[q] = [], this[B] = false;
        }
        respondWith(e10) {
          this[M] || (this[M] = Promise.resolve(e10));
        }
        passThroughOnException() {
          this[B] = true;
        }
        waitUntil(e10) {
          this[q].push(e10);
        }
      }
      class V extends H {
        constructor(e10) {
          super(e10.request), this.sourcePage = e10.page;
        }
        get request() {
          throw new I({ page: this.sourcePage });
        }
        respondWith() {
          throw new I({ page: this.sourcePage });
        }
      }
      function F(e10) {
        return e10.replace(/\/$/, "") || "/";
      }
      function W(e10) {
        let t10 = e10.indexOf("#"), r10 = e10.indexOf("?"), s10 = r10 > -1 && (t10 < 0 || r10 < t10);
        return s10 || t10 > -1 ? { pathname: e10.substring(0, s10 ? r10 : t10), query: s10 ? e10.substring(r10, t10 > -1 ? t10 : void 0) : "", hash: t10 > -1 ? e10.slice(t10) : "" } : { pathname: e10, query: "", hash: "" };
      }
      function G(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: s10, hash: i10 } = W(e10);
        return "" + t10 + r10 + s10 + i10;
      }
      function K(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: s10, hash: i10 } = W(e10);
        return "" + r10 + t10 + s10 + i10;
      }
      function z(e10, t10) {
        if ("string" != typeof e10) return false;
        let { pathname: r10 } = W(e10);
        return r10 === t10 || r10.startsWith(t10 + "/");
      }
      function J(e10, t10) {
        let r10;
        let s10 = e10.split("/");
        return (t10 || []).some((t11) => !!s10[1] && s10[1].toLowerCase() === t11.toLowerCase() && (r10 = t11, s10.splice(1, 1), e10 = s10.join("/") || "/", true)), { pathname: e10, detectedLocale: r10 };
      }
      let X = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function Y(e10, t10) {
        return new URL(String(e10).replace(X, "localhost"), t10 && String(t10).replace(X, "localhost"));
      }
      let Z = Symbol("NextURLInternal");
      class Q {
        constructor(e10, t10, r10) {
          let s10, i10;
          "object" == typeof t10 && "pathname" in t10 || "string" == typeof t10 ? (s10 = t10, i10 = r10 || {}) : i10 = r10 || t10 || {}, this[Z] = { url: Y(e10, s10 ?? i10.base), options: i10, basePath: "" }, this.analyze();
        }
        analyze() {
          var e10, t10, r10, s10, i10;
          let n2 = function(e11, t11) {
            var r11, s11;
            let { basePath: i11, i18n: n3, trailingSlash: a3 } = null != (r11 = t11.nextConfig) ? r11 : {}, o3 = { pathname: e11, trailingSlash: "/" !== e11 ? e11.endsWith("/") : a3 };
            i11 && z(o3.pathname, i11) && (o3.pathname = function(e12, t12) {
              if (!z(e12, t12)) return e12;
              let r12 = e12.slice(t12.length);
              return r12.startsWith("/") ? r12 : "/" + r12;
            }(o3.pathname, i11), o3.basePath = i11);
            let l2 = o3.pathname;
            if (o3.pathname.startsWith("/_next/data/") && o3.pathname.endsWith(".json")) {
              let e12 = o3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/"), r12 = e12[0];
              o3.buildId = r12, l2 = "index" !== e12[1] ? "/" + e12.slice(1).join("/") : "/", true === t11.parseData && (o3.pathname = l2);
            }
            if (n3) {
              let e12 = t11.i18nProvider ? t11.i18nProvider.analyze(o3.pathname) : J(o3.pathname, n3.locales);
              o3.locale = e12.detectedLocale, o3.pathname = null != (s11 = e12.pathname) ? s11 : o3.pathname, !e12.detectedLocale && o3.buildId && (e12 = t11.i18nProvider ? t11.i18nProvider.analyze(l2) : J(l2, n3.locales)).detectedLocale && (o3.locale = e12.detectedLocale);
            }
            return o3;
          }(this[Z].url.pathname, { nextConfig: this[Z].options.nextConfig, parseData: true, i18nProvider: this[Z].options.i18nProvider }), a2 = function(e11, t11) {
            let r11;
            if ((null == t11 ? void 0 : t11.host) && !Array.isArray(t11.host)) r11 = t11.host.toString().split(":", 1)[0];
            else {
              if (!e11.hostname) return;
              r11 = e11.hostname;
            }
            return r11.toLowerCase();
          }(this[Z].url, this[Z].options.headers);
          this[Z].domainLocale = this[Z].options.i18nProvider ? this[Z].options.i18nProvider.detectDomainLocale(a2) : function(e11, t11, r11) {
            if (e11) for (let n3 of (r11 && (r11 = r11.toLowerCase()), e11)) {
              var s11, i11;
              if (t11 === (null == (s11 = n3.domain) ? void 0 : s11.split(":", 1)[0].toLowerCase()) || r11 === n3.defaultLocale.toLowerCase() || (null == (i11 = n3.locales) ? void 0 : i11.some((e12) => e12.toLowerCase() === r11))) return n3;
            }
          }(null == (t10 = this[Z].options.nextConfig) ? void 0 : null == (e10 = t10.i18n) ? void 0 : e10.domains, a2);
          let o2 = (null == (r10 = this[Z].domainLocale) ? void 0 : r10.defaultLocale) || (null == (i10 = this[Z].options.nextConfig) ? void 0 : null == (s10 = i10.i18n) ? void 0 : s10.defaultLocale);
          this[Z].url.pathname = n2.pathname, this[Z].defaultLocale = o2, this[Z].basePath = n2.basePath ?? "", this[Z].buildId = n2.buildId, this[Z].locale = n2.locale ?? o2, this[Z].trailingSlash = n2.trailingSlash;
        }
        formatPathname() {
          var e10;
          let t10;
          return t10 = function(e11, t11, r10, s10) {
            if (!t11 || t11 === r10) return e11;
            let i10 = e11.toLowerCase();
            return !s10 && (z(i10, "/api") || z(i10, "/" + t11.toLowerCase())) ? e11 : G(e11, "/" + t11);
          }((e10 = { basePath: this[Z].basePath, buildId: this[Z].buildId, defaultLocale: this[Z].options.forceLocale ? void 0 : this[Z].defaultLocale, locale: this[Z].locale, pathname: this[Z].url.pathname, trailingSlash: this[Z].trailingSlash }).pathname, e10.locale, e10.buildId ? void 0 : e10.defaultLocale, e10.ignorePrefix), (e10.buildId || !e10.trailingSlash) && (t10 = F(t10)), e10.buildId && (t10 = K(G(t10, "/_next/data/" + e10.buildId), "/" === e10.pathname ? "index.json" : ".json")), t10 = G(t10, e10.basePath), !e10.buildId && e10.trailingSlash ? t10.endsWith("/") ? t10 : K(t10, "/") : F(t10);
        }
        formatSearch() {
          return this[Z].url.search;
        }
        get buildId() {
          return this[Z].buildId;
        }
        set buildId(e10) {
          this[Z].buildId = e10;
        }
        get locale() {
          return this[Z].locale ?? "";
        }
        set locale(e10) {
          var t10, r10;
          if (!this[Z].locale || !(null == (r10 = this[Z].options.nextConfig) ? void 0 : null == (t10 = r10.i18n) ? void 0 : t10.locales.includes(e10))) throw TypeError(`The NextURL configuration includes no locale "${e10}"`);
          this[Z].locale = e10;
        }
        get defaultLocale() {
          return this[Z].defaultLocale;
        }
        get domainLocale() {
          return this[Z].domainLocale;
        }
        get searchParams() {
          return this[Z].url.searchParams;
        }
        get host() {
          return this[Z].url.host;
        }
        set host(e10) {
          this[Z].url.host = e10;
        }
        get hostname() {
          return this[Z].url.hostname;
        }
        set hostname(e10) {
          this[Z].url.hostname = e10;
        }
        get port() {
          return this[Z].url.port;
        }
        set port(e10) {
          this[Z].url.port = e10;
        }
        get protocol() {
          return this[Z].url.protocol;
        }
        set protocol(e10) {
          this[Z].url.protocol = e10;
        }
        get href() {
          let e10 = this.formatPathname(), t10 = this.formatSearch();
          return `${this.protocol}//${this.host}${e10}${t10}${this.hash}`;
        }
        set href(e10) {
          this[Z].url = Y(e10), this.analyze();
        }
        get origin() {
          return this[Z].url.origin;
        }
        get pathname() {
          return this[Z].url.pathname;
        }
        set pathname(e10) {
          this[Z].url.pathname = e10;
        }
        get hash() {
          return this[Z].url.hash;
        }
        set hash(e10) {
          this[Z].url.hash = e10;
        }
        get search() {
          return this[Z].url.search;
        }
        set search(e10) {
          this[Z].url.search = e10;
        }
        get password() {
          return this[Z].url.password;
        }
        set password(e10) {
          this[Z].url.password = e10;
        }
        get username() {
          return this[Z].url.username;
        }
        set username(e10) {
          this[Z].url.username = e10;
        }
        get basePath() {
          return this[Z].basePath;
        }
        set basePath(e10) {
          this[Z].basePath = e10.startsWith("/") ? e10 : `/${e10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new Q(String(this), this[Z].options);
        }
      }
      var ee = r(945);
      let et = Symbol("internal request");
      class er extends Request {
        constructor(e10, t10 = {}) {
          let r10 = "string" != typeof e10 && "url" in e10 ? e10.url : String(e10);
          U(r10), e10 instanceof Request ? super(e10, t10) : super(r10, t10);
          let s10 = new Q(r10, { headers: D(this.headers), nextConfig: t10.nextConfig });
          this[et] = { cookies: new ee.RequestCookies(this.headers), geo: t10.geo || {}, ip: t10.ip, nextUrl: s10, url: s10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, geo: this.geo, ip: this.ip, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[et].cookies;
        }
        get geo() {
          return this[et].geo;
        }
        get ip() {
          return this[et].ip;
        }
        get nextUrl() {
          return this[et].nextUrl;
        }
        get page() {
          throw new j();
        }
        get ua() {
          throw new N();
        }
        get url() {
          return this[et].url;
        }
      }
      class es {
        static get(e10, t10, r10) {
          let s10 = Reflect.get(e10, t10, r10);
          return "function" == typeof s10 ? s10.bind(e10) : s10;
        }
        static set(e10, t10, r10, s10) {
          return Reflect.set(e10, t10, r10, s10);
        }
        static has(e10, t10) {
          return Reflect.has(e10, t10);
        }
        static deleteProperty(e10, t10) {
          return Reflect.deleteProperty(e10, t10);
        }
      }
      let ei = Symbol("internal response"), en = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function ea(e10, t10) {
        var r10;
        if (null == e10 ? void 0 : null == (r10 = e10.request) ? void 0 : r10.headers) {
          if (!(e10.request.headers instanceof Headers)) throw Error("request.headers must be an instance of Headers");
          let r11 = [];
          for (let [s10, i10] of e10.request.headers) t10.set("x-middleware-request-" + s10, i10), r11.push(s10);
          t10.set("x-middleware-override-headers", r11.join(","));
        }
      }
      class eo extends Response {
        constructor(e10, t10 = {}) {
          super(e10, t10);
          let r10 = this.headers, s10 = new Proxy(new ee.ResponseCookies(r10), { get(e11, s11, i10) {
            switch (s11) {
              case "delete":
              case "set":
                return (...i11) => {
                  let n2 = Reflect.apply(e11[s11], e11, i11), a2 = new Headers(r10);
                  return n2 instanceof ee.ResponseCookies && r10.set("x-middleware-set-cookie", n2.getAll().map((e12) => (0, ee.stringifyCookie)(e12)).join(",")), ea(t10, a2), n2;
                };
              default:
                return es.get(e11, s11, i10);
            }
          } });
          this[ei] = { cookies: s10, url: t10.url ? new Q(t10.url, { headers: D(r10), nextConfig: t10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[ei].cookies;
        }
        static json(e10, t10) {
          let r10 = Response.json(e10, t10);
          return new eo(r10.body, r10);
        }
        static redirect(e10, t10) {
          let r10 = "number" == typeof t10 ? t10 : (null == t10 ? void 0 : t10.status) ?? 307;
          if (!en.has(r10)) throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
          let s10 = "object" == typeof t10 ? t10 : {}, i10 = new Headers(null == s10 ? void 0 : s10.headers);
          return i10.set("Location", U(e10)), new eo(null, { ...s10, headers: i10, status: r10 });
        }
        static rewrite(e10, t10) {
          let r10 = new Headers(null == t10 ? void 0 : t10.headers);
          return r10.set("x-middleware-rewrite", U(e10)), ea(t10, r10), new eo(null, { ...t10, headers: r10 });
        }
        static next(e10) {
          let t10 = new Headers(null == e10 ? void 0 : e10.headers);
          return t10.set("x-middleware-next", "1"), ea(e10, t10), new eo(null, { ...e10, headers: t10 });
        }
      }
      function el(e10, t10) {
        let r10 = "string" == typeof t10 ? new URL(t10) : t10, s10 = new URL(e10, t10), i10 = r10.protocol + "//" + r10.host;
        return s10.protocol + "//" + s10.host === i10 ? s10.toString().replace(i10, "") : s10.toString();
      }
      let eu = [["RSC"], ["Next-Router-State-Tree"], ["Next-Router-Prefetch"]], ec = ["__nextFallback", "__nextLocale", "__nextInferredLocaleFromDefault", "__nextDefaultLocale", "__nextIsNotFound", "_rsc"], eh = ["__nextDataReq"];
      class ed extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new ed();
        }
      }
      class ep extends Headers {
        constructor(e10) {
          super(), this.headers = new Proxy(e10, { get(t10, r10, s10) {
            if ("symbol" == typeof r10) return es.get(t10, r10, s10);
            let i10 = r10.toLowerCase(), n2 = Object.keys(e10).find((e11) => e11.toLowerCase() === i10);
            if (void 0 !== n2) return es.get(t10, n2, s10);
          }, set(t10, r10, s10, i10) {
            if ("symbol" == typeof r10) return es.set(t10, r10, s10, i10);
            let n2 = r10.toLowerCase(), a2 = Object.keys(e10).find((e11) => e11.toLowerCase() === n2);
            return es.set(t10, a2 ?? r10, s10, i10);
          }, has(t10, r10) {
            if ("symbol" == typeof r10) return es.has(t10, r10);
            let s10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === s10);
            return void 0 !== i10 && es.has(t10, i10);
          }, deleteProperty(t10, r10) {
            if ("symbol" == typeof r10) return es.deleteProperty(t10, r10);
            let s10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === s10);
            return void 0 === i10 || es.deleteProperty(t10, i10);
          } });
        }
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "append":
              case "delete":
              case "set":
                return ed.callable;
              default:
                return es.get(e11, t10, r10);
            }
          } });
        }
        merge(e10) {
          return Array.isArray(e10) ? e10.join(", ") : e10;
        }
        static from(e10) {
          return e10 instanceof Headers ? e10 : new ep(e10);
        }
        append(e10, t10) {
          let r10 = this.headers[e10];
          "string" == typeof r10 ? this.headers[e10] = [r10, t10] : Array.isArray(r10) ? r10.push(t10) : this.headers[e10] = t10;
        }
        delete(e10) {
          delete this.headers[e10];
        }
        get(e10) {
          let t10 = this.headers[e10];
          return void 0 !== t10 ? this.merge(t10) : null;
        }
        has(e10) {
          return void 0 !== this.headers[e10];
        }
        set(e10, t10) {
          this.headers[e10] = t10;
        }
        forEach(e10, t10) {
          for (let [r10, s10] of this.entries()) e10.call(t10, s10, r10, this);
        }
        *entries() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase(), r10 = this.get(t10);
            yield [t10, r10];
          }
        }
        *keys() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase();
            yield t10;
          }
        }
        *values() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = this.get(e10);
            yield t10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let ef = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class eg {
        disable() {
          throw ef;
        }
        getStore() {
        }
        run() {
          throw ef;
        }
        exit() {
          throw ef;
        }
        enterWith() {
          throw ef;
        }
      }
      let em = globalThis.AsyncLocalStorage;
      function eb() {
        return em ? new em() : new eg();
      }
      let ey = eb();
      class ew extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options");
        }
        static callable() {
          throw new ew();
        }
      }
      class ev {
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "clear":
              case "delete":
              case "set":
                return ew.callable;
              default:
                return es.get(e11, t10, r10);
            }
          } });
        }
      }
      let e_ = Symbol.for("next.mutated.cookies");
      class ek {
        static wrap(e10, t10) {
          let r10 = new ee.ResponseCookies(new Headers());
          for (let t11 of e10.getAll()) r10.set(t11);
          let s10 = [], i10 = /* @__PURE__ */ new Set(), n2 = () => {
            let e11 = ey.getStore();
            if (e11 && (e11.pathWasRevalidated = true), s10 = r10.getAll().filter((e12) => i10.has(e12.name)), t10) {
              let e12 = [];
              for (let t11 of s10) {
                let r11 = new ee.ResponseCookies(new Headers());
                r11.set(t11), e12.push(r11.toString());
              }
              t10(e12);
            }
          };
          return new Proxy(r10, { get(e11, t11, r11) {
            switch (t11) {
              case e_:
                return s10;
              case "delete":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    e11.delete(...t12);
                  } finally {
                    n2();
                  }
                };
              case "set":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.set(...t12);
                  } finally {
                    n2();
                  }
                };
              default:
                return es.get(e11, t11, r11);
            }
          } });
        }
      }
      !function(e10) {
        e10.handleRequest = "BaseServer.handleRequest", e10.run = "BaseServer.run", e10.pipe = "BaseServer.pipe", e10.getStaticHTML = "BaseServer.getStaticHTML", e10.render = "BaseServer.render", e10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", e10.renderToResponse = "BaseServer.renderToResponse", e10.renderToHTML = "BaseServer.renderToHTML", e10.renderError = "BaseServer.renderError", e10.renderErrorToResponse = "BaseServer.renderErrorToResponse", e10.renderErrorToHTML = "BaseServer.renderErrorToHTML", e10.render404 = "BaseServer.render404";
      }(o || (o = {})), function(e10) {
        e10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", e10.loadComponents = "LoadComponents.loadComponents";
      }(l || (l = {})), function(e10) {
        e10.getRequestHandler = "NextServer.getRequestHandler", e10.getServer = "NextServer.getServer", e10.getServerRequestHandler = "NextServer.getServerRequestHandler", e10.createServer = "createServer.createServer";
      }(u || (u = {})), function(e10) {
        e10.compression = "NextNodeServer.compression", e10.getBuildId = "NextNodeServer.getBuildId", e10.createComponentTree = "NextNodeServer.createComponentTree", e10.clientComponentLoading = "NextNodeServer.clientComponentLoading", e10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", e10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", e10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", e10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", e10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", e10.sendRenderResult = "NextNodeServer.sendRenderResult", e10.proxyRequest = "NextNodeServer.proxyRequest", e10.runApi = "NextNodeServer.runApi", e10.render = "NextNodeServer.render", e10.renderHTML = "NextNodeServer.renderHTML", e10.imageOptimizer = "NextNodeServer.imageOptimizer", e10.getPagePath = "NextNodeServer.getPagePath", e10.getRoutesManifest = "NextNodeServer.getRoutesManifest", e10.findPageComponents = "NextNodeServer.findPageComponents", e10.getFontManifest = "NextNodeServer.getFontManifest", e10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", e10.getRequestHandler = "NextNodeServer.getRequestHandler", e10.renderToHTML = "NextNodeServer.renderToHTML", e10.renderError = "NextNodeServer.renderError", e10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", e10.render404 = "NextNodeServer.render404", e10.startResponse = "NextNodeServer.startResponse", e10.route = "route", e10.onProxyReq = "onProxyReq", e10.apiResolver = "apiResolver", e10.internalFetch = "internalFetch";
      }(c || (c = {})), (h || (h = {})).startServer = "startServer.startServer", function(e10) {
        e10.getServerSideProps = "Render.getServerSideProps", e10.getStaticProps = "Render.getStaticProps", e10.renderToString = "Render.renderToString", e10.renderDocument = "Render.renderDocument", e10.createBodyResult = "Render.createBodyResult";
      }(d || (d = {})), function(e10) {
        e10.renderToString = "AppRender.renderToString", e10.renderToReadableStream = "AppRender.renderToReadableStream", e10.getBodyResult = "AppRender.getBodyResult", e10.fetch = "AppRender.fetch";
      }(p || (p = {})), (f || (f = {})).executeRoute = "Router.executeRoute", (g || (g = {})).runHandler = "Node.runHandler", (m || (m = {})).runHandler = "AppRouteRouteHandlers.runHandler", function(e10) {
        e10.generateMetadata = "ResolveMetadata.generateMetadata", e10.generateViewport = "ResolveMetadata.generateViewport";
      }(b || (b = {})), (y || (y = {})).execute = "Middleware.execute";
      let eS = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], eT = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"], { context: eE, propagation: eR, trace: eO, SpanStatusCode: eA, SpanKind: eP, ROOT_CONTEXT: eC } = s = r(439), ex = (e10) => null !== e10 && "object" == typeof e10 && "function" == typeof e10.then, eI = (e10, t10) => {
        (null == t10 ? void 0 : t10.bubble) === true ? e10.setAttribute("next.bubble", true) : (t10 && e10.recordException(t10), e10.setStatus({ code: eA.ERROR, message: null == t10 ? void 0 : t10.message })), e10.end();
      }, ej = /* @__PURE__ */ new Map(), eN = s.createContextKey("next.rootSpanId"), e$ = 0, eL = () => e$++;
      class eD {
        getTracerInstance() {
          return eO.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return eE;
        }
        getActiveScopeSpan() {
          return eO.getSpan(null == eE ? void 0 : eE.active());
        }
        withPropagatedContext(e10, t10, r10) {
          let s10 = eE.active();
          if (eO.getSpanContext(s10)) return t10();
          let i10 = eR.extract(s10, e10, r10);
          return eE.with(i10, t10);
        }
        trace(...e10) {
          var t10;
          let [r10, s10, i10] = e10, { fn: n2, options: a2 } = "function" == typeof s10 ? { fn: s10, options: {} } : { fn: i10, options: { ...s10 } }, o2 = a2.spanName ?? r10;
          if (!eS.includes(r10) && "1" !== process.env.NEXT_OTEL_VERBOSE || a2.hideSpan) return n2();
          let l2 = this.getSpanContext((null == a2 ? void 0 : a2.parentSpan) ?? this.getActiveScopeSpan()), u2 = false;
          l2 ? (null == (t10 = eO.getSpanContext(l2)) ? void 0 : t10.isRemote) && (u2 = true) : (l2 = (null == eE ? void 0 : eE.active()) ?? eC, u2 = true);
          let c2 = eL();
          return a2.attributes = { "next.span_name": o2, "next.span_type": r10, ...a2.attributes }, eE.with(l2.setValue(eN, c2), () => this.getTracerInstance().startActiveSpan(o2, a2, (e11) => {
            let t11 = "performance" in globalThis ? globalThis.performance.now() : void 0, s11 = () => {
              ej.delete(c2), t11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && eT.includes(r10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(r10.split(".").pop() || "").replace(/[A-Z]/g, (e12) => "-" + e12.toLowerCase())}`, { start: t11, end: performance.now() });
            };
            u2 && ej.set(c2, new Map(Object.entries(a2.attributes ?? {})));
            try {
              if (n2.length > 1) return n2(e11, (t13) => eI(e11, t13));
              let t12 = n2(e11);
              if (ex(t12)) return t12.then((t13) => (e11.end(), t13)).catch((t13) => {
                throw eI(e11, t13), t13;
              }).finally(s11);
              return e11.end(), s11(), t12;
            } catch (t12) {
              throw eI(e11, t12), s11(), t12;
            }
          }));
        }
        wrap(...e10) {
          let t10 = this, [r10, s10, i10] = 3 === e10.length ? e10 : [e10[0], {}, e10[1]];
          return eS.includes(r10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e11 = s10;
            "function" == typeof e11 && "function" == typeof i10 && (e11 = e11.apply(this, arguments));
            let n2 = arguments.length - 1, a2 = arguments[n2];
            if ("function" != typeof a2) return t10.trace(r10, e11, () => i10.apply(this, arguments));
            {
              let s11 = t10.getContext().bind(eE.active(), a2);
              return t10.trace(r10, e11, (e12, t11) => (arguments[n2] = function(e13) {
                return null == t11 || t11(e13), s11.apply(this, arguments);
              }, i10.apply(this, arguments)));
            }
          } : i10;
        }
        startSpan(...e10) {
          let [t10, r10] = e10, s10 = this.getSpanContext((null == r10 ? void 0 : r10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(t10, r10, s10);
        }
        getSpanContext(e10) {
          return e10 ? eO.setSpan(eE.active(), e10) : void 0;
        }
        getRootSpanAttributes() {
          let e10 = eE.active().getValue(eN);
          return ej.get(e10);
        }
      }
      let eU = (() => {
        let e10 = new eD();
        return () => e10;
      })(), eM = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(eM);
      class eB {
        constructor(e10, t10, r10, s10) {
          var i10;
          let n2 = e10 && function(e11, t11) {
            let r11 = ep.from(e11.headers);
            return { isOnDemandRevalidate: r11.get("x-prerender-revalidate") === t11.previewModeId, revalidateOnlyGenerated: r11.has("x-prerender-revalidate-if-generated") };
          }(t10, e10).isOnDemandRevalidate, a2 = null == (i10 = r10.get(eM)) ? void 0 : i10.value;
          this.isEnabled = !!(!n2 && a2 && e10 && a2 === e10.previewModeId), this._previewModeId = null == e10 ? void 0 : e10.previewModeId, this._mutableCookies = s10;
        }
        enable() {
          if (!this._previewModeId) throw Error("Invariant: previewProps missing previewModeId this should never happen");
          this._mutableCookies.set({ name: eM, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" });
        }
        disable() {
          this._mutableCookies.set({ name: eM, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) });
        }
      }
      function eq(e10, t10) {
        if ("x-middleware-set-cookie" in e10.headers && "string" == typeof e10.headers["x-middleware-set-cookie"]) {
          let r10 = e10.headers["x-middleware-set-cookie"], s10 = new Headers();
          for (let e11 of L(r10)) s10.append("set-cookie", e11);
          for (let e11 of new ee.ResponseCookies(s10).getAll()) t10.set(e11);
        }
      }
      let eH = { wrap(e10, { req: t10, res: r10, renderOpts: s10 }, i10) {
        let n2;
        function a2(e11) {
          r10 && r10.setHeader("Set-Cookie", e11);
        }
        s10 && "previewProps" in s10 && (n2 = s10.previewProps);
        let o2 = {}, l2 = { get headers() {
          return o2.headers || (o2.headers = function(e11) {
            let t11 = ep.from(e11);
            for (let e12 of eu) t11.delete(e12.toString().toLowerCase());
            return ep.seal(t11);
          }(t10.headers)), o2.headers;
        }, get cookies() {
          if (!o2.cookies) {
            let e11 = new ee.RequestCookies(ep.from(t10.headers));
            eq(t10, e11), o2.cookies = ev.seal(e11);
          }
          return o2.cookies;
        }, get mutableCookies() {
          if (!o2.mutableCookies) {
            let e11 = function(e12, t11) {
              let r11 = new ee.RequestCookies(ep.from(e12));
              return ek.wrap(r11, t11);
            }(t10.headers, (null == s10 ? void 0 : s10.onUpdateCookies) || (r10 ? a2 : void 0));
            eq(t10, e11), o2.mutableCookies = e11;
          }
          return o2.mutableCookies;
        }, get draftMode() {
          return o2.draftMode || (o2.draftMode = new eB(n2, t10, this.cookies, this.mutableCookies)), o2.draftMode;
        }, reactLoadableManifest: (null == s10 ? void 0 : s10.reactLoadableManifest) || {}, assetPrefix: (null == s10 ? void 0 : s10.assetPrefix) || "" };
        return e10.run(l2, i10, l2);
      } }, eV = eb();
      function eF() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID, previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      class eW extends er {
        constructor(e10) {
          super(e10.input, e10.init), this.sourcePage = e10.page;
        }
        get request() {
          throw new I({ page: this.sourcePage });
        }
        respondWith() {
          throw new I({ page: this.sourcePage });
        }
        waitUntil() {
          throw new I({ page: this.sourcePage });
        }
      }
      let eG = { keys: (e10) => Array.from(e10.keys()), get: (e10, t10) => e10.get(t10) ?? void 0 }, eK = (e10, t10) => eU().withPropagatedContext(e10.headers, t10, eG), ez = false;
      async function eJ(e10) {
        let t10, s10;
        !function() {
          if (!ez && (ez = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: e11, wrapRequestHandler: t11 } = r(177);
            e11(), eK = t11(eK);
          }
        }(), await C();
        let i10 = void 0 !== self.__BUILD_MANIFEST;
        e10.request.url = e10.request.url.replace(/\.rsc($|\?)/, "$1");
        let n2 = new Q(e10.request.url, { headers: e10.request.headers, nextConfig: e10.request.nextConfig });
        for (let e11 of [...n2.searchParams.keys()]) {
          let t11 = n2.searchParams.getAll(e11);
          !function(e12, t12) {
            for (let r10 of ["nxtP", "nxtI"]) e12 !== r10 && e12.startsWith(r10) && t12(e12.substring(r10.length));
          }(e11, (r10) => {
            for (let e12 of (n2.searchParams.delete(r10), t11)) n2.searchParams.append(r10, e12);
            n2.searchParams.delete(e11);
          });
        }
        let a2 = n2.buildId;
        n2.buildId = "";
        let o2 = e10.request.headers["x-nextjs-data"];
        o2 && "/index" === n2.pathname && (n2.pathname = "/");
        let l2 = function(e11) {
          let t11 = new Headers();
          for (let [r10, s11] of Object.entries(e11)) for (let e12 of Array.isArray(s11) ? s11 : [s11]) void 0 !== e12 && ("number" == typeof e12 && (e12 = e12.toString()), t11.append(r10, e12));
          return t11;
        }(e10.request.headers), u2 = /* @__PURE__ */ new Map();
        if (!i10) for (let e11 of eu) {
          let t11 = e11.toString().toLowerCase();
          l2.get(t11) && (u2.set(t11, l2.get(t11)), l2.delete(t11));
        }
        let c2 = new eW({ page: e10.page, input: function(e11, t11) {
          let r10 = "string" == typeof e11, s11 = r10 ? new URL(e11) : e11;
          for (let e12 of ec) s11.searchParams.delete(e12);
          if (t11) for (let e12 of eh) s11.searchParams.delete(e12);
          return r10 ? s11.toString() : s11;
        }(n2, true).toString(), init: { body: e10.request.body, geo: e10.request.geo, headers: l2, ip: e10.request.ip, method: e10.request.method, nextConfig: e10.request.nextConfig, signal: e10.request.signal } });
        o2 && Object.defineProperty(c2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && e10.IncrementalCache && (globalThis.__incrementalCache = new e10.IncrementalCache({ appDir: true, fetchCache: true, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: e10.request.headers, requestProtocol: "https", getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: eF() }) }));
        let h2 = new V({ request: c2, page: e10.page });
        if ((t10 = await eK(c2, () => "/middleware" === e10.page || "/src/middleware" === e10.page ? eU().trace(y.execute, { spanName: `middleware ${c2.method} ${c2.nextUrl.pathname}`, attributes: { "http.target": c2.nextUrl.pathname, "http.method": c2.method } }, () => eH.wrap(eV, { req: c2, renderOpts: { onUpdateCookies: (e11) => {
          s10 = e11;
        }, previewProps: eF() } }, () => e10.handler(c2, h2))) : e10.handler(c2, h2))) && !(t10 instanceof Response)) throw TypeError("Expected an instance of Response to be returned");
        t10 && s10 && t10.headers.set("set-cookie", s10);
        let d2 = null == t10 ? void 0 : t10.headers.get("x-middleware-rewrite");
        if (t10 && d2 && !i10) {
          let r10 = new Q(d2, { forceLocale: true, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          r10.host === c2.nextUrl.host && (r10.buildId = a2 || r10.buildId, t10.headers.set("x-middleware-rewrite", String(r10)));
          let s11 = el(String(r10), String(n2));
          o2 && t10.headers.set("x-nextjs-rewrite", s11);
        }
        let p2 = null == t10 ? void 0 : t10.headers.get("Location");
        if (t10 && p2 && !i10) {
          let r10 = new Q(p2, { forceLocale: false, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          t10 = new Response(t10.body, t10), r10.host === c2.nextUrl.host && (r10.buildId = a2 || r10.buildId, t10.headers.set("Location", String(r10))), o2 && (t10.headers.delete("Location"), t10.headers.set("x-nextjs-redirect", el(String(r10), String(n2))));
        }
        let f2 = t10 || eo.next(), g2 = f2.headers.get("x-middleware-override-headers"), m2 = [];
        if (g2) {
          for (let [e11, t11] of u2) f2.headers.set(`x-middleware-request-${e11}`, t11), m2.push(e11);
          m2.length > 0 && f2.headers.set("x-middleware-override-headers", g2 + "," + m2.join(","));
        }
        return { response: f2, waitUntil: Promise.all(h2[q]), fetchMetrics: c2.fetchMetrics };
      }
      let eX = Symbol.for("@supabase/supabase-js.traceContextExtractor");
      Object.create, Object.create, "function" == typeof SuppressedError && SuppressedError;
      let eY = (e10) => e10 ? (...t10) => e10(...t10) : (...e11) => fetch(...e11);
      class eZ extends Error {
        constructor(e10, t10 = "FunctionsError", r10) {
          super(e10), this.name = t10, this.context = r10;
        }
        toJSON() {
          return { name: this.name, message: this.message, context: this.context };
        }
      }
      class eQ extends eZ {
        constructor(e10) {
          super("Failed to send a request to the Edge Function", "FunctionsFetchError", e10);
        }
      }
      class e0 extends eZ {
        constructor(e10) {
          super("Relay Error invoking the Edge Function", "FunctionsRelayError", e10);
        }
      }
      class e1 extends eZ {
        constructor(e10) {
          super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e10);
        }
      }
      !function(e10) {
        e10.Any = "any", e10.ApNortheast1 = "ap-northeast-1", e10.ApNortheast2 = "ap-northeast-2", e10.ApSouth1 = "ap-south-1", e10.ApSoutheast1 = "ap-southeast-1", e10.ApSoutheast2 = "ap-southeast-2", e10.CaCentral1 = "ca-central-1", e10.EuCentral1 = "eu-central-1", e10.EuWest1 = "eu-west-1", e10.EuWest2 = "eu-west-2", e10.EuWest3 = "eu-west-3", e10.SaEast1 = "sa-east-1", e10.UsEast1 = "us-east-1", e10.UsWest1 = "us-west-1", e10.UsWest2 = "us-west-2";
      }(w || (w = {}));
      class e2 {
        constructor(e10, { headers: t10 = {}, customFetch: r10, region: s10 = w.Any } = {}) {
          this.url = e10, this.headers = t10, this.region = s10, this.fetch = eY(r10);
        }
        setAuth(e10) {
          this.headers.Authorization = `Bearer ${e10}`;
        }
        invoke(e10) {
          var t10, r10, s10, i10;
          return t10 = this, r10 = arguments, s10 = void 0, i10 = function* (e11, t11 = {}) {
            var r11, s11;
            let i11, n2, a2;
            try {
              let s12;
              let { headers: o2, method: l2, body: u2, signal: c2, timeout: h2 } = t11, d2 = {}, { region: p2 } = t11;
              p2 || (p2 = this.region);
              let f2 = new URL(`${this.url}/${e11}`);
              p2 && "any" !== p2 && (d2["x-region"] = p2, f2.searchParams.set("forceFunctionRegion", p2));
              let g2 = !!o2 && Object.keys(o2).some((e12) => "content-type" === e12.toLowerCase());
              u2 && !g2 ? "undefined" != typeof Blob && u2 instanceof Blob || u2 instanceof ArrayBuffer ? (d2["Content-Type"] = u2.type || "application/octet-stream", s12 = u2) : "string" == typeof u2 ? (d2["Content-Type"] = "text/plain", s12 = u2) : "undefined" != typeof FormData && u2 instanceof FormData ? s12 = u2 : (d2["Content-Type"] = "application/json", s12 = JSON.stringify(u2)) : !u2 || "string" == typeof u2 || "undefined" != typeof Blob && u2 instanceof Blob || u2 instanceof ArrayBuffer || "undefined" != typeof FormData && u2 instanceof FormData ? s12 = u2 : s12 = JSON.stringify(u2);
              let m2 = c2;
              h2 && (n2 = new AbortController(), i11 = setTimeout(() => n2.abort(), h2), c2 ? (m2 = n2.signal, a2 = () => n2.abort(), c2.addEventListener("abort", a2)) : m2 = n2.signal);
              let b2 = yield this.fetch(f2.toString(), { method: l2 || "POST", headers: Object.assign(Object.assign(Object.assign({}, d2), this.headers), o2), body: s12, signal: m2 }).catch((e12) => {
                throw new eQ(e12);
              }), y2 = b2.headers.get("x-relay-error");
              if (y2 && "true" === y2) throw new e0(b2);
              if (!b2.ok) throw new e1(b2);
              let w2 = (null !== (r11 = b2.headers.get("Content-Type")) && void 0 !== r11 ? r11 : "text/plain").split(";")[0].trim().toLowerCase();
              return { data: "application/json" === w2 ? yield b2.json() : "application/octet-stream" === w2 || "application/pdf" === w2 ? yield b2.blob() : "text/event-stream" === w2 ? b2 : "multipart/form-data" === w2 ? yield b2.formData() : yield b2.text(), error: null, response: b2 };
            } catch (e12) {
              return { data: null, error: e12, response: e12 instanceof e1 || e12 instanceof e0 ? e12.context : void 0 };
            } finally {
              i11 && clearTimeout(i11), a2 && (null === (s11 = t11.signal) || void 0 === s11 || s11.removeEventListener("abort", a2));
            }
          }, new (s10 || (s10 = Promise))(function(e11, n2) {
            function a2(e12) {
              try {
                l2(i10.next(e12));
              } catch (e13) {
                n2(e13);
              }
            }
            function o2(e12) {
              try {
                l2(i10.throw(e12));
              } catch (e13) {
                n2(e13);
              }
            }
            function l2(t11) {
              var r11;
              t11.done ? e11(t11.value) : ((r11 = t11.value) instanceof s10 ? r11 : new s10(function(e12) {
                e12(r11);
              })).then(a2, o2);
            }
            l2((i10 = i10.apply(t10, r10 || [])).next());
          });
        }
      }
      var e3 = class extends Error {
        constructor(e10) {
          super(e10.message), this.name = "PostgrestError", this.details = e10.details, this.hint = e10.hint, this.code = e10.code;
        }
        toJSON() {
          return { name: this.name, message: this.message, details: this.details, hint: this.hint, code: this.code };
        }
      };
      let e4 = (e10) => Math.min(1e3 * 2 ** e10, 3e4), e5 = [520, 503], e6 = ["GET", "HEAD", "OPTIONS"];
      function e8(e10) {
        return (e8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e11) {
          return typeof e11;
        } : function(e11) {
          return e11 && "function" == typeof Symbol && e11.constructor === Symbol && e11 !== Symbol.prototype ? "symbol" : typeof e11;
        })(e10);
      }
      function e9(e10, t10) {
        var r10 = Object.keys(e10);
        if (Object.getOwnPropertySymbols) {
          var s10 = Object.getOwnPropertySymbols(e10);
          t10 && (s10 = s10.filter(function(t11) {
            return Object.getOwnPropertyDescriptor(e10, t11).enumerable;
          })), r10.push.apply(r10, s10);
        }
        return r10;
      }
      function e7(e10) {
        for (var t10 = 1; t10 < arguments.length; t10++) {
          var r10 = null != arguments[t10] ? arguments[t10] : {};
          t10 % 2 ? e9(Object(r10), true).forEach(function(t11) {
            !function(e11, t12, r11) {
              var s10;
              (s10 = function(e12, t13) {
                if ("object" != e8(e12) || !e12) return e12;
                var r12 = e12[Symbol.toPrimitive];
                if (void 0 !== r12) {
                  var s11 = r12.call(e12, t13 || "default");
                  if ("object" != e8(s11)) return s11;
                  throw TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t13 ? String : Number)(e12);
              }(t12, "string"), (t12 = "symbol" == e8(s10) ? s10 : s10 + "") in e11) ? Object.defineProperty(e11, t12, { value: r11, enumerable: true, configurable: true, writable: true }) : e11[t12] = r11;
            }(e10, t11, r10[t11]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e10, Object.getOwnPropertyDescriptors(r10)) : e9(Object(r10)).forEach(function(t11) {
            Object.defineProperty(e10, t11, Object.getOwnPropertyDescriptor(r10, t11));
          });
        }
        return e10;
      }
      function te(e10, t10) {
        return new Promise((r10) => {
          if (null == t10 ? void 0 : t10.aborted) {
            r10();
            return;
          }
          let s10 = setTimeout(() => {
            null == t10 || t10.removeEventListener("abort", i10), r10();
          }, e10);
          function i10() {
            clearTimeout(s10), r10();
          }
          null == t10 || t10.addEventListener("abort", i10);
        });
      }
      async function tt(e10, t10, r10, s10) {
        let i10 = 0;
        for (; ; ) {
          var n2, a2, o2, l2, u2, c2;
          let h2;
          let d2 = e7({}, r10.headers);
          i10 > 0 && (d2["X-Retry-Count"] = String(i10));
          try {
            h2 = await e10(t10, { method: r10.method, headers: d2, body: r10.body, signal: r10.signal });
          } catch (e11) {
            if ((null == e11 ? void 0 : e11.name) === "AbortError" || (null == e11 ? void 0 : e11.code) === "ABORT_ERR" || (null == e11 ? void 0 : e11.name) === "TimeoutError" && (null === (n2 = r10.signal) || void 0 === n2 ? void 0 : n2.aborted) || !e6.includes(r10.method)) throw e11;
            if (s10 && i10 < 3) {
              let e12 = e4(i10);
              i10++, await te(e12, r10.signal);
              continue;
            }
            throw e11;
          }
          if (l2 = r10.method, u2 = h2.status, c2 = i10, s10 && !(c2 >= 3) && e6.includes(l2) && e5.includes(u2)) {
            let e11 = null !== (a2 = null === (o2 = h2.headers) || void 0 === o2 ? void 0 : o2.get("Retry-After")) && void 0 !== a2 ? a2 : null, t11 = null !== e11 ? 1e3 * Math.max(0, parseInt(e11, 10) || 0) : e4(i10);
            await h2.text(), i10++, await te(t11, r10.signal);
            continue;
          }
          return h2;
        }
      }
      var tr = class {
        constructor(e10) {
          var t10, r10, s10, i10, n2;
          this.shouldThrowOnError = false, this.retryEnabled = true, this.method = e10.method, this.url = e10.url, this.headers = new Headers(e10.headers), this.schema = e10.schema, this.body = e10.body, this.shouldThrowOnError = null !== (t10 = e10.shouldThrowOnError) && void 0 !== t10 && t10, this.signal = e10.signal, this.isMaybeSingle = null !== (r10 = e10.isMaybeSingle) && void 0 !== r10 && r10, this.shouldStripNulls = null !== (s10 = e10.shouldStripNulls) && void 0 !== s10 && s10, this.urlLengthLimit = null !== (i10 = e10.urlLengthLimit) && void 0 !== i10 ? i10 : 8e3, this.retryEnabled = null === (n2 = e10.retry) || void 0 === n2 || n2, e10.fetch ? this.fetch = e10.fetch : this.fetch = fetch;
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        stripNulls() {
          if ("text/csv" === this.headers.get("Accept")) throw Error("stripNulls() cannot be used with csv()");
          return this.shouldStripNulls = true, this;
        }
        setHeader(e10, t10) {
          return this.headers = new Headers(this.headers), this.headers.set(e10, t10), this;
        }
        retry(e10) {
          return this.retryEnabled = e10, this;
        }
        then(e10, t10) {
          var r10 = this;
          if (void 0 === this.schema || (["GET", "HEAD"].includes(this.method) ? this.headers.set("Accept-Profile", this.schema) : this.headers.set("Content-Profile", this.schema)), "GET" !== this.method && "HEAD" !== this.method && this.headers.set("Content-Type", "application/json"), this.shouldStripNulls) {
            let e11 = this.headers.get("Accept");
            "application/vnd.pgrst.object+json" === e11 ? this.headers.set("Accept", "application/vnd.pgrst.object+json;nulls=stripped") : e11 && "application/json" !== e11 || this.headers.set("Accept", "application/vnd.pgrst.array+json;nulls=stripped");
          }
          let s10 = this.fetch, i10 = (async () => {
            let e11 = {};
            r10.headers.forEach((t12, r11) => {
              e11[r11] = t12;
            });
            let t11 = await tt(s10, r10.url.toString(), { method: r10.method, headers: e11, body: JSON.stringify(r10.body, (e12, t12) => "bigint" == typeof t12 ? t12.toString() : t12), signal: r10.signal }, r10.retryEnabled);
            return await r10.processResponse(t11);
          })();
          return this.shouldThrowOnError || (i10 = i10.catch((e11) => {
            var t11, r11, s11, i11, n2, a2;
            let o2 = "", l2 = "", u2 = "", c2 = null == e11 ? void 0 : e11.cause;
            if (c2) {
              let t12 = null !== (r11 = null == c2 ? void 0 : c2.message) && void 0 !== r11 ? r11 : "", a3 = null !== (s11 = null == c2 ? void 0 : c2.code) && void 0 !== s11 ? s11 : "";
              o2 = `${null !== (i11 = null == e11 ? void 0 : e11.name) && void 0 !== i11 ? i11 : "FetchError"}: ${null == e11 ? void 0 : e11.message}

Caused by: ${null !== (n2 = null == c2 ? void 0 : c2.name) && void 0 !== n2 ? n2 : "Error"}: ${t12}`, a3 && (o2 += ` (${a3})`), (null == c2 ? void 0 : c2.stack) && (o2 += `
${c2.stack}`);
            } else o2 = null !== (a2 = null == e11 ? void 0 : e11.stack) && void 0 !== a2 ? a2 : "";
            let h2 = this.url.toString().length;
            return (null == e11 ? void 0 : e11.name) === "AbortError" || (null == e11 ? void 0 : e11.code) === "ABORT_ERR" ? (u2 = "", l2 = "Request was aborted (timeout or manual cancellation)", h2 > this.urlLengthLimit && (l2 += `. Note: Your request URL is ${h2} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`)) : ((null == c2 ? void 0 : c2.name) === "HeadersOverflowError" || (null == c2 ? void 0 : c2.code) === "UND_ERR_HEADERS_OVERFLOW") && (u2 = "", l2 = "HTTP headers exceeded server limits (typically 16KB)", h2 > this.urlLengthLimit && (l2 += `. Your request URL is ${h2} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`)), { success: false, error: { message: `${null !== (t11 = null == e11 ? void 0 : e11.name) && void 0 !== t11 ? t11 : "FetchError"}: ${null == e11 ? void 0 : e11.message}`, details: o2, hint: l2, code: u2 }, data: null, count: null, status: 0, statusText: "" };
          })), i10.then(e10, t10);
        }
        async processResponse(e10) {
          var t10, r10, s10, i10;
          let n2 = null, a2 = null, o2 = null, l2 = e10.status, u2 = e10.statusText;
          if (e10.ok) {
            if ("HEAD" !== this.method) {
              let t11 = await e10.text();
              if ("" === t11) ;
              else if ("text/csv" === this.headers.get("Accept")) a2 = t11;
              else if (this.headers.get("Accept") && (null === (s10 = this.headers.get("Accept")) || void 0 === s10 ? void 0 : s10.includes("application/vnd.pgrst.plan+text"))) a2 = t11;
              else try {
                a2 = JSON.parse(t11);
              } catch (e11) {
                if (n2 = { message: t11 }, a2 = null, this.shouldThrowOnError) throw new e3({ message: t11, details: "", hint: "", code: "" });
              }
            }
            let c2 = null === (t10 = this.headers.get("Prefer")) || void 0 === t10 ? void 0 : t10.match(/count=(exact|planned|estimated)/), h2 = null === (r10 = e10.headers.get("content-range")) || void 0 === r10 ? void 0 : r10.split("/");
            if (c2 && h2 && h2.length > 1 && (o2 = parseInt(h2[1])), this.isMaybeSingle && Array.isArray(a2)) {
              if (a2.length > 1) {
                if (n2 = { code: "PGRST116", details: `Results contain ${a2.length} rows, application/vnd.pgrst.object+json requires 1 row`, hint: null, message: "JSON object requested, multiple (or no) rows returned" }, a2 = null, o2 = null, l2 = 406, u2 = "Not Acceptable", this.shouldThrowOnError) throw new e3(e7(e7({}, n2), {}, { hint: null !== (i10 = n2.hint) && void 0 !== i10 ? i10 : "" }));
              } else a2 = 1 === a2.length ? a2[0] : null;
            }
          } else {
            let t11 = await e10.text();
            try {
              n2 = JSON.parse(t11), Array.isArray(n2) && 404 === e10.status && (a2 = [], n2 = null, l2 = 200, u2 = "OK");
            } catch (r11) {
              404 === e10.status && "" === t11 ? (l2 = 204, u2 = "No Content") : n2 = { message: t11 };
            }
            if (n2 && this.shouldThrowOnError) throw new e3(n2);
          }
          return { success: null === n2, error: n2, data: a2, count: o2, status: l2, statusText: u2 };
        }
        returns() {
          return this;
        }
        overrideTypes() {
          return this;
        }
      }, ts = class extends tr {
        throwOnError() {
          return super.throwOnError();
        }
        select(e10) {
          let t10 = false, r10 = (null != e10 ? e10 : "*").split("").map((e11) => /\s/.test(e11) && !t10 ? "" : ('"' === e11 && (t10 = !t10), e11)).join("");
          return this.url.searchParams.set("select", r10), this.headers.append("Prefer", "return=representation"), this;
        }
        order(e10, { ascending: t10 = true, nullsFirst: r10, foreignTable: s10, referencedTable: i10 = s10 } = {}) {
          let n2 = i10 ? `${i10}.order` : "order", a2 = this.url.searchParams.get(n2);
          return this.url.searchParams.set(n2, `${a2 ? `${a2},` : ""}${e10}.${t10 ? "asc" : "desc"}${void 0 === r10 ? "" : r10 ? ".nullsfirst" : ".nullslast"}`), this;
        }
        limit(e10, { foreignTable: t10, referencedTable: r10 = t10 } = {}) {
          let s10 = void 0 === r10 ? "limit" : `${r10}.limit`;
          return this.url.searchParams.set(s10, `${e10}`), this;
        }
        range(e10, t10, { foreignTable: r10, referencedTable: s10 = r10 } = {}) {
          let i10 = void 0 === s10 ? "offset" : `${s10}.offset`, n2 = void 0 === s10 ? "limit" : `${s10}.limit`;
          return this.url.searchParams.set(i10, `${e10}`), this.url.searchParams.set(n2, `${t10 - e10 + 1}`), this;
        }
        abortSignal(e10) {
          return this.signal = e10, this;
        }
        single() {
          return this.headers.set("Accept", "application/vnd.pgrst.object+json"), this;
        }
        maybeSingle() {
          return this.isMaybeSingle = true, this;
        }
        csv() {
          return this.headers.set("Accept", "text/csv"), this;
        }
        geojson() {
          return this.headers.set("Accept", "application/geo+json"), this;
        }
        explain({ analyze: e10 = false, verbose: t10 = false, settings: r10 = false, buffers: s10 = false, wal: i10 = false, format: n2 = "text" } = {}) {
          var a2;
          let o2 = [e10 ? "analyze" : null, t10 ? "verbose" : null, r10 ? "settings" : null, s10 ? "buffers" : null, i10 ? "wal" : null].filter(Boolean).join("|"), l2 = null !== (a2 = this.headers.get("Accept")) && void 0 !== a2 ? a2 : "application/json";
          return this.headers.set("Accept", `application/vnd.pgrst.plan+${n2}; for="${l2}"; options=${o2};`), this;
        }
        rollback() {
          return this.headers.append("Prefer", "tx=rollback"), this;
        }
        returns() {
          return this;
        }
        maxAffected(e10) {
          return this.headers.append("Prefer", "handling=strict"), this.headers.append("Prefer", `max-affected=${e10}`), this;
        }
      };
      let ti = RegExp("[,()]");
      var tn = class extends ts {
        throwOnError() {
          return super.throwOnError();
        }
        eq(e10, t10) {
          return this.url.searchParams.append(e10, `eq.${t10}`), this;
        }
        neq(e10, t10) {
          return this.url.searchParams.append(e10, `neq.${t10}`), this;
        }
        gt(e10, t10) {
          return this.url.searchParams.append(e10, `gt.${t10}`), this;
        }
        gte(e10, t10) {
          return this.url.searchParams.append(e10, `gte.${t10}`), this;
        }
        lt(e10, t10) {
          return this.url.searchParams.append(e10, `lt.${t10}`), this;
        }
        lte(e10, t10) {
          return this.url.searchParams.append(e10, `lte.${t10}`), this;
        }
        like(e10, t10) {
          return this.url.searchParams.append(e10, `like.${t10}`), this;
        }
        likeAllOf(e10, t10) {
          return this.url.searchParams.append(e10, `like(all).{${t10.join(",")}}`), this;
        }
        likeAnyOf(e10, t10) {
          return this.url.searchParams.append(e10, `like(any).{${t10.join(",")}}`), this;
        }
        ilike(e10, t10) {
          return this.url.searchParams.append(e10, `ilike.${t10}`), this;
        }
        ilikeAllOf(e10, t10) {
          return this.url.searchParams.append(e10, `ilike(all).{${t10.join(",")}}`), this;
        }
        ilikeAnyOf(e10, t10) {
          return this.url.searchParams.append(e10, `ilike(any).{${t10.join(",")}}`), this;
        }
        regexMatch(e10, t10) {
          return this.url.searchParams.append(e10, `match.${t10}`), this;
        }
        regexIMatch(e10, t10) {
          return this.url.searchParams.append(e10, `imatch.${t10}`), this;
        }
        is(e10, t10) {
          return this.url.searchParams.append(e10, `is.${t10}`), this;
        }
        isDistinct(e10, t10) {
          return this.url.searchParams.append(e10, `isdistinct.${t10}`), this;
        }
        in(e10, t10) {
          let r10 = Array.from(new Set(t10)).map((e11) => "string" == typeof e11 && ti.test(e11) ? `"${e11}"` : `${e11}`).join(",");
          return this.url.searchParams.append(e10, `in.(${r10})`), this;
        }
        notIn(e10, t10) {
          let r10 = Array.from(new Set(t10)).map((e11) => "string" == typeof e11 && ti.test(e11) ? `"${e11}"` : `${e11}`).join(",");
          return this.url.searchParams.append(e10, `not.in.(${r10})`), this;
        }
        contains(e10, t10) {
          return "string" == typeof t10 ? this.url.searchParams.append(e10, `cs.${t10}`) : Array.isArray(t10) ? this.url.searchParams.append(e10, `cs.{${t10.join(",")}}`) : this.url.searchParams.append(e10, `cs.${JSON.stringify(t10)}`), this;
        }
        containedBy(e10, t10) {
          return "string" == typeof t10 ? this.url.searchParams.append(e10, `cd.${t10}`) : Array.isArray(t10) ? this.url.searchParams.append(e10, `cd.{${t10.join(",")}}`) : this.url.searchParams.append(e10, `cd.${JSON.stringify(t10)}`), this;
        }
        rangeGt(e10, t10) {
          return this.url.searchParams.append(e10, `sr.${t10}`), this;
        }
        rangeGte(e10, t10) {
          return this.url.searchParams.append(e10, `nxl.${t10}`), this;
        }
        rangeLt(e10, t10) {
          return this.url.searchParams.append(e10, `sl.${t10}`), this;
        }
        rangeLte(e10, t10) {
          return this.url.searchParams.append(e10, `nxr.${t10}`), this;
        }
        rangeAdjacent(e10, t10) {
          return this.url.searchParams.append(e10, `adj.${t10}`), this;
        }
        overlaps(e10, t10) {
          return "string" == typeof t10 ? this.url.searchParams.append(e10, `ov.${t10}`) : this.url.searchParams.append(e10, `ov.{${t10.join(",")}}`), this;
        }
        textSearch(e10, t10, { config: r10, type: s10 } = {}) {
          let i10 = "";
          "plain" === s10 ? i10 = "pl" : "phrase" === s10 ? i10 = "ph" : "websearch" === s10 && (i10 = "w");
          let n2 = void 0 === r10 ? "" : `(${r10})`;
          return this.url.searchParams.append(e10, `${i10}fts${n2}.${t10}`), this;
        }
        match(e10) {
          return Object.entries(e10).filter(([e11, t10]) => void 0 !== t10).forEach(([e11, t10]) => {
            this.url.searchParams.append(e11, `eq.${t10}`);
          }), this;
        }
        not(e10, t10, r10) {
          return this.url.searchParams.append(e10, `not.${t10}.${r10}`), this;
        }
        or(e10, { foreignTable: t10, referencedTable: r10 = t10 } = {}) {
          let s10 = r10 ? `${r10}.or` : "or";
          return this.url.searchParams.append(s10, `(${e10})`), this;
        }
        filter(e10, t10, r10) {
          return this.url.searchParams.append(e10, `${t10}.${r10}`), this;
        }
      }, ta = class {
        constructor(e10, { headers: t10 = {}, schema: r10, fetch: s10, urlLengthLimit: i10 = 8e3, retry: n2 }) {
          this.url = e10, this.headers = new Headers(t10), this.schema = r10, this.fetch = s10, this.urlLengthLimit = i10, this.retry = n2;
        }
        cloneRequestState() {
          return { url: new URL(this.url.toString()), headers: new Headers(this.headers) };
        }
        select(e10, t10) {
          let { head: r10 = false, count: s10 } = null != t10 ? t10 : {}, i10 = false, n2 = (null != e10 ? e10 : "*").split("").map((e11) => /\s/.test(e11) && !i10 ? "" : ('"' === e11 && (i10 = !i10), e11)).join(""), { url: a2, headers: o2 } = this.cloneRequestState();
          return a2.searchParams.set("select", n2), s10 && o2.append("Prefer", `count=${s10}`), new tn({ method: r10 ? "HEAD" : "GET", url: a2, headers: o2, schema: this.schema, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        insert(e10, { count: t10, defaultToNull: r10 = true } = {}) {
          var s10;
          let { url: i10, headers: n2 } = this.cloneRequestState();
          if (t10 && n2.append("Prefer", `count=${t10}`), r10 || n2.append("Prefer", "missing=default"), Array.isArray(e10)) {
            let t11 = e10.reduce((e11, t12) => e11.concat(Object.keys(t12)), []);
            if (t11.length > 0) {
              let e11 = [...new Set(t11)].map((e12) => `"${e12}"`);
              i10.searchParams.set("columns", e11.join(","));
            }
          }
          return new tn({ method: "POST", url: i10, headers: n2, schema: this.schema, body: e10, fetch: null !== (s10 = this.fetch) && void 0 !== s10 ? s10 : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        upsert(e10, { onConflict: t10, ignoreDuplicates: r10 = false, count: s10, defaultToNull: i10 = true } = {}) {
          var n2;
          let { url: a2, headers: o2 } = this.cloneRequestState();
          if (o2.append("Prefer", `resolution=${r10 ? "ignore" : "merge"}-duplicates`), void 0 !== t10 && a2.searchParams.set("on_conflict", t10), s10 && o2.append("Prefer", `count=${s10}`), i10 || o2.append("Prefer", "missing=default"), Array.isArray(e10)) {
            let t11 = e10.reduce((e11, t12) => e11.concat(Object.keys(t12)), []);
            if (t11.length > 0) {
              let e11 = [...new Set(t11)].map((e12) => `"${e12}"`);
              a2.searchParams.set("columns", e11.join(","));
            }
          }
          return new tn({ method: "POST", url: a2, headers: o2, schema: this.schema, body: e10, fetch: null !== (n2 = this.fetch) && void 0 !== n2 ? n2 : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        update(e10, { count: t10 } = {}) {
          var r10;
          let { url: s10, headers: i10 } = this.cloneRequestState();
          return t10 && i10.append("Prefer", `count=${t10}`), new tn({ method: "PATCH", url: s10, headers: i10, schema: this.schema, body: e10, fetch: null !== (r10 = this.fetch) && void 0 !== r10 ? r10 : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        delete({ count: e10 } = {}) {
          var t10;
          let { url: r10, headers: s10 } = this.cloneRequestState();
          return e10 && s10.append("Prefer", `count=${e10}`), new tn({ method: "DELETE", url: r10, headers: s10, schema: this.schema, fetch: null !== (t10 = this.fetch) && void 0 !== t10 ? t10 : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
      };
      function to(e10, t10, r10) {
        var s10;
        return { success: false, error: new e3({ message: `${null !== (s10 = null == e10 ? void 0 : e10.name) && void 0 !== s10 ? s10 : "FetchError"}: ${null == e10 ? void 0 : e10.message}`, details: "", hint: "", code: "" }), data: null, count: null, status: t10, statusText: r10 };
      }
      var tl = class e10 {
        constructor(e11, { headers: t10 = {}, schema: r10, fetch: s10, timeout: i10, urlLengthLimit: n2 = 8e3, retry: a2 } = {}) {
          this.url = e11, this.headers = new Headers(t10), this.schemaName = r10, this.urlLengthLimit = n2;
          let o2 = null != s10 ? s10 : globalThis.fetch;
          void 0 !== i10 && i10 > 0 ? this.fetch = (e12, t11) => {
            let r11 = new AbortController(), s11 = setTimeout(() => r11.abort(), i10), n3 = null == t11 ? void 0 : t11.signal;
            if (n3) {
              if (n3.aborted) return clearTimeout(s11), o2(e12, t11);
              let i11 = () => {
                clearTimeout(s11), r11.abort();
              };
              return n3.addEventListener("abort", i11, { once: true }), o2(e12, e7(e7({}, t11), {}, { signal: r11.signal })).finally(() => {
                clearTimeout(s11), n3.removeEventListener("abort", i11);
              });
            }
            return o2(e12, e7(e7({}, t11), {}, { signal: r11.signal })).finally(() => clearTimeout(s11));
          } : this.fetch = o2, this.retry = a2;
        }
        from(e11) {
          if (!e11 || "string" != typeof e11 || "" === e11.trim()) throw Error("Invalid relation name: relation must be a non-empty string.");
          return new ta(new URL(`${this.url}/${e11}`), { headers: new Headers(this.headers), schema: this.schemaName, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        schema(t10) {
          return new e10(this.url, { headers: this.headers, schema: t10, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
        async getOpenApiSpec() {
          var e11, t10;
          let r10, s10;
          let i10 = new Headers(this.headers);
          i10.set("Accept", "application/openapi+json"), this.schemaName && i10.set("Accept-Profile", this.schemaName);
          let n2 = {};
          i10.forEach((e12, t11) => {
            n2[t11] = e12;
          });
          let a2 = null !== (e11 = this.fetch) && void 0 !== e11 ? e11 : globalThis.fetch;
          try {
            r10 = await tt(a2, `${this.url}/`, { method: "GET", headers: n2 }, null === (t10 = this.retry) || void 0 === t10 || t10);
          } catch (e12) {
            return to(e12, 0, "");
          }
          try {
            s10 = await r10.text();
          } catch (e12) {
            return to(e12, r10.status, r10.statusText);
          }
          if (r10.ok) try {
            return { success: true, error: null, data: JSON.parse(s10), count: null, status: r10.status, statusText: r10.statusText };
          } catch (e12) {
          }
          return { success: false, error: function(e12, t11) {
            try {
              let t12 = JSON.parse(e12);
              if (t12 && "object" == typeof t12 && !Array.isArray(t12)) {
                var r11, s11, i11, n3;
                return new e3({ message: String(null !== (r11 = t12.message) && void 0 !== r11 ? r11 : e12), details: null !== (s11 = t12.details) && void 0 !== s11 ? s11 : "", hint: null !== (i11 = t12.hint) && void 0 !== i11 ? i11 : "", code: null !== (n3 = t12.code) && void 0 !== n3 ? n3 : "" });
              }
            } catch (e13) {
            }
            return new e3({ message: e12 || t11, details: "", hint: "", code: "" });
          }(s10, r10.statusText), data: null, count: null, status: r10.status, statusText: r10.statusText };
        }
        rpc(e11, t10 = {}, { head: r10 = false, get: s10 = false, count: i10 } = {}) {
          var n2;
          let a2, o2;
          let l2 = new URL(`${this.url}/rpc/${e11}`), u2 = (e12) => null !== e12 && "object" == typeof e12 && (!Array.isArray(e12) || e12.some(u2)), c2 = r10 && Object.values(t10).some(u2);
          c2 ? (a2 = "POST", o2 = t10) : r10 || s10 ? (a2 = r10 ? "HEAD" : "GET", Object.entries(t10).filter(([e12, t11]) => void 0 !== t11).map(([e12, t11]) => [e12, Array.isArray(t11) ? `{${t11.join(",")}}` : `${t11}`]).forEach(([e12, t11]) => {
            l2.searchParams.append(e12, t11);
          })) : (a2 = "POST", o2 = t10);
          let h2 = new Headers(this.headers);
          return c2 ? h2.set("Prefer", i10 ? `count=${i10},return=minimal` : "return=minimal") : i10 && h2.set("Prefer", `count=${i10}`), new tn({ method: a2, url: l2, headers: h2, schema: this.schemaName, body: o2, fetch: null !== (n2 = this.fetch) && void 0 !== n2 ? n2 : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
        }
      };
      class tu {
        constructor() {
        }
        static detectEnvironment() {
          var e10;
          if ("undefined" != typeof WebSocket) return { type: "native", wsConstructor: WebSocket };
          let t10 = globalThis;
          if ("undefined" != typeof globalThis && void 0 !== t10.WebSocket) return { type: "native", wsConstructor: t10.WebSocket };
          let s10 = void 0 !== r.g ? r.g : void 0;
          if (s10 && void 0 !== s10.WebSocket) return { type: "native", wsConstructor: s10.WebSocket };
          if ("undefined" != typeof globalThis && void 0 !== t10.WebSocketPair && void 0 === globalThis.WebSocket) return { type: "cloudflare", error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.", workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime." };
          if ("undefined" != typeof globalThis && t10.EdgeRuntime || "undefined" != typeof navigator && (null === (e10 = navigator.userAgent) || void 0 === e10 ? void 0 : e10.includes("Vercel-Edge"))) return { type: "unsupported", error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.", workaround: "Use serverless functions or a different deployment target for WebSocket functionality." };
          let i10 = globalThis.process;
          if (i10) {
            let e11 = i10.versions;
            if (e11 && e11.node) return { type: "unsupported", error: "Node.js detected but native WebSocket not found.", workaround: "Ensure you are running Node.js 22+ or provide a WebSocket implementation via the transport option." };
          }
          return { type: "unsupported", error: "Unknown JavaScript runtime without WebSocket support.", workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation." };
        }
        static getWebSocketConstructor() {
          let e10 = this.detectEnvironment();
          if (e10.wsConstructor) return e10.wsConstructor;
          let t10 = e10.error || "WebSocket not supported in this environment.";
          throw e10.workaround && (t10 += `

Suggested solution: ${e10.workaround}`), Error(t10);
        }
        static isWebSocketSupported() {
          try {
            let e10 = this.detectEnvironment();
            return "native" === e10.type;
          } catch (e10) {
            return false;
          }
        }
      }
      let tc = "2.0.0", th = { closed: "closed", errored: "errored", joined: "joined", joining: "joining", leaving: "leaving" }, td = { close: "phx_close", error: "phx_error", join: "phx_join", reply: "phx_reply", leave: "phx_leave", access_token: "access_token" }, tp = { connecting: "connecting", closing: "closing", closed: "closed" };
      class tf {
        constructor(e10) {
          this.HEADER_LENGTH = 1, this.USER_BROADCAST_PUSH_META_LENGTH = 6, this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 }, this.BINARY_ENCODING = 0, this.JSON_ENCODING = 1, this.BROADCAST_EVENT = "broadcast", this.allowedMetadataKeys = [], this.allowedMetadataKeys = null != e10 ? e10 : [];
        }
        encode(e10, t10) {
          return e10.event !== this.BROADCAST_EVENT || e10.payload instanceof ArrayBuffer || "string" != typeof e10.payload.event ? t10(JSON.stringify([e10.join_ref, e10.ref, e10.topic, e10.event, e10.payload])) : t10(this._binaryEncodeUserBroadcastPush(e10));
        }
        _binaryEncodeUserBroadcastPush(e10) {
          var t10;
          return this._isArrayBuffer(null === (t10 = e10.payload) || void 0 === t10 ? void 0 : t10.payload) ? this._encodeBinaryUserBroadcastPush(e10) : this._encodeJsonUserBroadcastPush(e10);
        }
        _encodeBinaryUserBroadcastPush(e10) {
          var t10, r10;
          let s10 = null !== (r10 = null === (t10 = e10.payload) || void 0 === t10 ? void 0 : t10.payload) && void 0 !== r10 ? r10 : new ArrayBuffer(0);
          return this._encodeUserBroadcastPush(e10, this.BINARY_ENCODING, s10);
        }
        _encodeJsonUserBroadcastPush(e10) {
          var t10, r10;
          let s10 = null !== (r10 = null === (t10 = e10.payload) || void 0 === t10 ? void 0 : t10.payload) && void 0 !== r10 ? r10 : {}, i10 = new TextEncoder().encode(JSON.stringify(s10)).buffer;
          return this._encodeUserBroadcastPush(e10, this.JSON_ENCODING, i10);
        }
        _encodeUserBroadcastPush(e10, t10, r10) {
          let s10 = new TextEncoder(), i10 = s10.encode(e10.topic), n2 = s10.encode(null !== (g2 = e10.ref) && void 0 !== g2 ? g2 : ""), a2 = s10.encode(null !== (m2 = e10.join_ref) && void 0 !== m2 ? m2 : ""), o2 = s10.encode(e10.payload.event), l2 = this.allowedMetadataKeys ? this._pick(e10.payload, this.allowedMetadataKeys) : {}, u2 = s10.encode(0 === Object.keys(l2).length ? "" : JSON.stringify(l2));
          if (a2.length > 255) throw Error(`joinRef length ${a2.length} exceeds maximum of 255`);
          if (n2.length > 255) throw Error(`ref length ${n2.length} exceeds maximum of 255`);
          if (i10.length > 255) throw Error(`topic length ${i10.length} exceeds maximum of 255`);
          if (o2.length > 255) throw Error(`userEvent length ${o2.length} exceeds maximum of 255`);
          if (u2.length > 255) throw Error(`metadata length ${u2.length} exceeds maximum of 255`);
          let c2 = this.USER_BROADCAST_PUSH_META_LENGTH + a2.length + n2.length + i10.length + o2.length + u2.length, h2 = new ArrayBuffer(this.HEADER_LENGTH + c2), d2 = new DataView(h2), p2 = new Uint8Array(h2), f2 = 0;
          d2.setUint8(f2++, this.KINDS.userBroadcastPush), d2.setUint8(f2++, a2.length), d2.setUint8(f2++, n2.length), d2.setUint8(f2++, i10.length), d2.setUint8(f2++, o2.length), d2.setUint8(f2++, u2.length), d2.setUint8(f2++, t10), p2.set(a2, f2), f2 += a2.length, p2.set(n2, f2), f2 += n2.length, p2.set(i10, f2), f2 += i10.length, p2.set(o2, f2), f2 += o2.length, p2.set(u2, f2), f2 += u2.length;
          var g2, m2, b2 = new Uint8Array(h2.byteLength + r10.byteLength);
          return b2.set(new Uint8Array(h2), 0), b2.set(new Uint8Array(r10), h2.byteLength), b2.buffer;
        }
        decode(e10, t10) {
          if (this._isArrayBuffer(e10)) return t10(this._binaryDecode(e10));
          if ("string" == typeof e10) {
            let [r10, s10, i10, n2, a2] = JSON.parse(e10);
            return t10({ join_ref: r10, ref: s10, topic: i10, event: n2, payload: a2 });
          }
          return t10({});
        }
        _binaryDecode(e10) {
          let t10 = new DataView(e10), r10 = t10.getUint8(0), s10 = new TextDecoder();
          if (r10 === this.KINDS.userBroadcast) return this._decodeUserBroadcast(e10, t10, s10);
        }
        _decodeUserBroadcast(e10, t10, r10) {
          let s10 = t10.getUint8(1), i10 = t10.getUint8(2), n2 = t10.getUint8(3), a2 = t10.getUint8(4), o2 = this.HEADER_LENGTH + 4, l2 = r10.decode(e10.slice(o2, o2 + s10));
          o2 += s10;
          let u2 = r10.decode(e10.slice(o2, o2 + i10));
          o2 += i10;
          let c2 = r10.decode(e10.slice(o2, o2 + n2));
          o2 += n2;
          let h2 = e10.slice(o2, e10.byteLength), d2 = a2 === this.JSON_ENCODING ? JSON.parse(r10.decode(h2)) : h2, p2 = { type: this.BROADCAST_EVENT, event: u2, payload: d2 };
          return n2 > 0 && (p2.meta = JSON.parse(c2)), { join_ref: null, ref: null, topic: l2, event: this.BROADCAST_EVENT, payload: p2 };
        }
        _isArrayBuffer(e10) {
          var t10;
          return e10 instanceof ArrayBuffer || (null === (t10 = null == e10 ? void 0 : e10.constructor) || void 0 === t10 ? void 0 : t10.name) === "ArrayBuffer";
        }
        _pick(e10, t10) {
          return e10 && "object" == typeof e10 ? Object.fromEntries(Object.entries(e10).filter(([e11]) => t10.includes(e11))) : {};
        }
      }
      !function(e10) {
        e10.abstime = "abstime", e10.bool = "bool", e10.date = "date", e10.daterange = "daterange", e10.float4 = "float4", e10.float8 = "float8", e10.int2 = "int2", e10.int4 = "int4", e10.int4range = "int4range", e10.int8 = "int8", e10.int8range = "int8range", e10.json = "json", e10.jsonb = "jsonb", e10.money = "money", e10.numeric = "numeric", e10.oid = "oid", e10.reltime = "reltime", e10.text = "text", e10.time = "time", e10.timestamp = "timestamp", e10.timestamptz = "timestamptz", e10.timetz = "timetz", e10.tsrange = "tsrange", e10.tstzrange = "tstzrange";
      }(v || (v = {}));
      let tg = (e10, t10, r10 = {}) => {
        var s10;
        let i10 = null !== (s10 = r10.skipTypes) && void 0 !== s10 ? s10 : [];
        return t10 ? Object.keys(t10).reduce((r11, s11) => (r11[s11] = tm(s11, e10, t10, i10), r11), {}) : {};
      }, tm = (e10, t10, r10, s10) => {
        let i10 = t10.find((t11) => t11.name === e10), n2 = null == i10 ? void 0 : i10.type, a2 = r10[e10];
        return n2 && !s10.includes(n2) ? tb(n2, a2) : ty(a2);
      }, tb = (e10, t10) => {
        if ("_" === e10.charAt(0)) return tk(t10, e10.slice(1, e10.length));
        switch (e10) {
          case v.bool:
            return tw(t10);
          case v.float4:
          case v.float8:
          case v.int2:
          case v.int4:
          case v.int8:
          case v.numeric:
          case v.oid:
            return tv(t10);
          case v.json:
          case v.jsonb:
            return t_(t10);
          case v.timestamp:
            return tS(t10);
          case v.abstime:
          case v.date:
          case v.daterange:
          case v.int4range:
          case v.int8range:
          case v.money:
          case v.reltime:
          case v.text:
          case v.time:
          case v.timestamptz:
          case v.timetz:
          case v.tsrange:
          case v.tstzrange:
          default:
            return ty(t10);
        }
      }, ty = (e10) => e10, tw = (e10) => {
        switch (e10) {
          case "t":
            return true;
          case "f":
            return false;
          default:
            return e10;
        }
      }, tv = (e10) => {
        if ("string" == typeof e10) {
          let t10 = parseFloat(e10);
          if (!Number.isNaN(t10)) return t10;
        }
        return e10;
      }, t_ = (e10) => {
        if ("string" == typeof e10) try {
          return JSON.parse(e10);
        } catch (e11) {
        }
        return e10;
      }, tk = (e10, t10) => {
        if ("string" != typeof e10) return e10;
        let r10 = e10.length - 1, s10 = e10[r10];
        if ("{" === e10[0] && "}" === s10) {
          let s11;
          let i10 = e10.slice(1, r10);
          try {
            s11 = JSON.parse("[" + i10 + "]");
          } catch (e11) {
            s11 = i10 ? i10.split(",") : [];
          }
          return s11.map((e11) => tb(t10, e11));
        }
        return e10;
      }, tS = (e10) => "string" == typeof e10 ? e10.replace(" ", "T") : e10, tT = (e10) => {
        let t10 = new URL(e10);
        return t10.protocol = t10.protocol.replace(/^ws/i, "http"), t10.pathname = t10.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, ""), "" === t10.pathname || "/" === t10.pathname ? t10.pathname = "/api/broadcast" : t10.pathname = t10.pathname + "/api/broadcast", t10.href;
      };
      var tE = (e10) => "function" == typeof e10 ? e10 : function() {
        return e10;
      }, tR = "undefined" != typeof window ? window : null, tO = ("undefined" != typeof self ? self : null) || tR || globalThis, tA = { connecting: 0, open: 1, closing: 2, closed: 3 }, tP = { closed: "closed", errored: "errored", joined: "joined", joining: "joining", leaving: "leaving" }, tC = { close: "phx_close", error: "phx_error", join: "phx_join", reply: "phx_reply", leave: "phx_leave" }, tx = { longpoll: "longpoll", websocket: "websocket" }, tI = { complete: 4 }, tj = "base64url.bearer.phx.", tN = class {
        constructor(e10, t10, r10, s10) {
          this.channel = e10, this.event = t10, this.payload = r10 || function() {
            return {};
          }, this.receivedResp = null, this.timeout = s10, this.timeoutTimer = null, this.recHooks = [], this.sent = false, this.ref = void 0;
        }
        resend(e10) {
          this.timeout = e10, this.reset(), this.send();
        }
        send() {
          this.hasReceived("timeout") || (this.startTimeout(), this.sent = true, this.channel.socket.push({ topic: this.channel.topic, event: this.event, payload: this.payload(), ref: this.ref, join_ref: this.channel.joinRef() }));
        }
        receive(e10, t10) {
          return this.hasReceived(e10) && t10(this.receivedResp.response), this.recHooks.push({ status: e10, callback: t10 }), this;
        }
        reset() {
          this.cancelRefEvent(), this.ref = null, this.refEvent = null, this.receivedResp = null, this.sent = false;
        }
        destroy() {
          this.cancelRefEvent(), this.cancelTimeout();
        }
        matchReceive({ status: e10, response: t10, _ref: r10 }) {
          this.recHooks.filter((t11) => t11.status === e10).forEach((e11) => e11.callback(t10));
        }
        cancelRefEvent() {
          this.refEvent && this.channel.off(this.refEvent);
        }
        cancelTimeout() {
          clearTimeout(this.timeoutTimer), this.timeoutTimer = null;
        }
        startTimeout() {
          this.timeoutTimer && this.cancelTimeout(), this.ref = this.channel.socket.makeRef(), this.refEvent = this.channel.replyEventName(this.ref), this.channel.on(this.refEvent, (e10) => {
            this.cancelRefEvent(), this.cancelTimeout(), this.receivedResp = e10, this.matchReceive(e10);
          }), this.timeoutTimer = setTimeout(() => {
            this.trigger("timeout", {});
          }, this.timeout);
        }
        hasReceived(e10) {
          return this.receivedResp && this.receivedResp.status === e10;
        }
        trigger(e10, t10) {
          this.channel.trigger(this.refEvent, { status: e10, response: t10 });
        }
      }, t$ = class {
        constructor(e10, t10) {
          this.callback = e10, this.timerCalc = t10, this.timer = void 0, this.tries = 0;
        }
        reset() {
          this.tries = 0, clearTimeout(this.timer);
        }
        scheduleTimeout() {
          clearTimeout(this.timer), this.timer = setTimeout(() => {
            this.tries = this.tries + 1, this.callback();
          }, this.timerCalc(this.tries + 1));
        }
      }, tL = class {
        constructor(e10, t10, r10) {
          this.state = tP.closed, this.topic = e10, this.params = tE(t10 || {}), this.socket = r10, this.bindings = [], this.bindingRef = 0, this.timeout = this.socket.timeout, this.joinedOnce = false, this.joinPush = new tN(this, tC.join, this.params, this.timeout), this.pushBuffer = [], this.stateChangeRefs = [], this.rejoinTimer = new t$(() => {
            this.socket.isConnected() && this.rejoin();
          }, this.socket.rejoinAfterMs), this.stateChangeRefs.push(this.socket.onError(() => this.rejoinTimer.reset())), this.stateChangeRefs.push(this.socket.onOpen(() => {
            this.rejoinTimer.reset(), this.isErrored() && this.rejoin();
          })), this.joinPush.receive("ok", () => {
            this.state = tP.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((e11) => e11.send()), this.pushBuffer = [];
          }), this.joinPush.receive("error", (e11) => {
            this.state = tP.errored, this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e11), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
          }), this.onClose(() => {
            this.rejoinTimer.reset(), this.socket.hasLogger() && this.socket.log("channel", `close ${this.topic}`), this.state = tP.closed, this.socket.remove(this);
          }), this.onError((e11) => {
            this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, e11), this.isJoining() && this.joinPush.reset(), this.state = tP.errored, this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
          }), this.joinPush.receive("timeout", () => {
            this.socket.hasLogger() && this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), new tN(this, tC.leave, tE({}), this.timeout).send(), this.state = tP.errored, this.joinPush.reset(), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
          }), this.on(tC.reply, (e11, t11) => {
            this.trigger(this.replyEventName(t11), e11);
          });
        }
        join(e10 = this.timeout) {
          if (!this.joinedOnce) return this.timeout = e10, this.joinedOnce = true, this.rejoin(), this.joinPush;
          throw Error("tried to join multiple times. 'join' can only be called a single time per channel instance");
        }
        teardown() {
          this.pushBuffer.forEach((e10) => e10.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = tP.closed, this.bindings = [];
        }
        onClose(e10) {
          this.on(tC.close, e10);
        }
        onError(e10) {
          return this.on(tC.error, (t10) => e10(t10));
        }
        on(e10, t10) {
          let r10 = this.bindingRef++;
          return this.bindings.push({ event: e10, ref: r10, callback: t10 }), r10;
        }
        off(e10, t10) {
          this.bindings = this.bindings.filter((r10) => !(r10.event === e10 && (void 0 === t10 || t10 === r10.ref)));
        }
        canPush() {
          return this.socket.isConnected() && this.isJoined();
        }
        push(e10, t10, r10 = this.timeout) {
          if (t10 = t10 || {}, !this.joinedOnce) throw Error(`tried to push '${e10}' to '${this.topic}' before joining. Use channel.join() before pushing events`);
          let s10 = new tN(this, e10, function() {
            return t10;
          }, r10);
          return this.canPush() ? s10.send() : (s10.startTimeout(), this.pushBuffer.push(s10)), s10;
        }
        leave(e10 = this.timeout) {
          this.rejoinTimer.reset(), this.joinPush.cancelTimeout(), this.state = tP.leaving;
          let t10 = () => {
            this.socket.hasLogger() && this.socket.log("channel", `leave ${this.topic}`), this.trigger(tC.close, "leave");
          }, r10 = new tN(this, tC.leave, tE({}), e10);
          return r10.receive("ok", () => t10()).receive("timeout", () => t10()), r10.send(), this.canPush() || r10.trigger("ok", {}), r10;
        }
        onMessage(e10, t10, r10) {
          return t10;
        }
        filterBindings(e10, t10, r10) {
          return true;
        }
        isMember(e10, t10, r10, s10) {
          return this.topic === e10 && (!s10 || s10 === this.joinRef() || (this.socket.hasLogger() && this.socket.log("channel", "dropping outdated message", { topic: e10, event: t10, payload: r10, joinRef: s10 }), false));
        }
        joinRef() {
          return this.joinPush.ref;
        }
        rejoin(e10 = this.timeout) {
          this.isLeaving() || (this.socket.leaveOpenTopic(this.topic), this.state = tP.joining, this.joinPush.resend(e10));
        }
        trigger(e10, t10, r10, s10) {
          let i10 = this.onMessage(e10, t10, r10, s10);
          if (t10 && !i10) throw Error("channel onMessage callbacks must return the payload, modified or unmodified");
          let n2 = this.bindings.filter((s11) => s11.event === e10 && this.filterBindings(s11, t10, r10));
          for (let e11 = 0; e11 < n2.length; e11++) n2[e11].callback(i10, r10, s10 || this.joinRef());
        }
        replyEventName(e10) {
          return `chan_reply_${e10}`;
        }
        isClosed() {
          return this.state === tP.closed;
        }
        isErrored() {
          return this.state === tP.errored;
        }
        isJoined() {
          return this.state === tP.joined;
        }
        isJoining() {
          return this.state === tP.joining;
        }
        isLeaving() {
          return this.state === tP.leaving;
        }
      }, tD = class {
        static request(e10, t10, r10, s10, i10, n2, a2) {
          if (tO.XDomainRequest) {
            let r11 = new tO.XDomainRequest();
            return this.xdomainRequest(r11, e10, t10, s10, i10, n2, a2);
          }
          if (tO.XMLHttpRequest) {
            let o2 = new tO.XMLHttpRequest();
            return this.xhrRequest(o2, e10, t10, r10, s10, i10, n2, a2);
          }
          if (tO.fetch && tO.AbortController) return this.fetchRequest(e10, t10, r10, s10, i10, n2, a2);
          throw Error("No suitable XMLHttpRequest implementation found");
        }
        static fetchRequest(e10, t10, r10, s10, i10, n2, a2) {
          let o2 = { method: e10, headers: r10, body: s10 }, l2 = null;
          return i10 && (l2 = new AbortController(), setTimeout(() => l2.abort(), i10), o2.signal = l2.signal), tO.fetch(t10, o2).then((e11) => e11.text()).then((e11) => this.parseJSON(e11)).then((e11) => a2 && a2(e11)).catch((e11) => {
            "AbortError" === e11.name && n2 ? n2() : a2 && a2(null);
          }), l2;
        }
        static xdomainRequest(e10, t10, r10, s10, i10, n2, a2) {
          return e10.timeout = i10, e10.open(t10, r10), e10.onload = () => {
            let t11 = this.parseJSON(e10.responseText);
            a2 && a2(t11);
          }, n2 && (e10.ontimeout = n2), e10.onprogress = () => {
          }, e10.send(s10), e10;
        }
        static xhrRequest(e10, t10, r10, s10, i10, n2, a2, o2) {
          for (let [i11, a3] of (e10.open(t10, r10, true), e10.timeout = n2, Object.entries(s10))) e10.setRequestHeader(i11, a3);
          return e10.onerror = () => o2 && o2(null), e10.onreadystatechange = () => {
            e10.readyState === tI.complete && o2 && o2(this.parseJSON(e10.responseText));
          }, a2 && (e10.ontimeout = a2), e10.send(i10), e10;
        }
        static parseJSON(e10) {
          if (!e10 || "" === e10) return null;
          try {
            return JSON.parse(e10);
          } catch {
            return console && console.log("failed to parse JSON response", e10), null;
          }
        }
        static serialize(e10, t10) {
          let r10 = [];
          for (var s10 in e10) {
            if (!Object.prototype.hasOwnProperty.call(e10, s10)) continue;
            let i10 = t10 ? `${t10}[${s10}]` : s10, n2 = e10[s10];
            "object" == typeof n2 ? r10.push(this.serialize(n2, i10)) : r10.push(encodeURIComponent(i10) + "=" + encodeURIComponent(n2));
          }
          return r10.join("&");
        }
        static appendParams(e10, t10) {
          if (0 === Object.keys(t10).length) return e10;
          let r10 = e10.match(/\?/) ? "&" : "?";
          return `${e10}${r10}${this.serialize(t10)}`;
        }
      }, tU = (e10) => {
        let t10 = "", r10 = new Uint8Array(e10), s10 = r10.byteLength;
        for (let e11 = 0; e11 < s10; e11++) t10 += String.fromCharCode(r10[e11]);
        return btoa(t10);
      }, tM = class {
        constructor(e10, t10) {
          t10 && 2 === t10.length && t10[1].startsWith(tj) && (this.authToken = atob(t10[1].slice(tj.length))), this.endPoint = null, this.token = null, this.skipHeartbeat = true, this.reqs = /* @__PURE__ */ new Set(), this.awaitingBatchAck = false, this.currentBatch = null, this.currentBatchTimer = null, this.batchBuffer = [], this.onopen = function() {
          }, this.onerror = function() {
          }, this.onmessage = function() {
          }, this.onclose = function() {
          }, this.pollEndpoint = this.normalizeEndpoint(e10), this.readyState = tA.connecting, setTimeout(() => this.poll(), 0);
        }
        normalizeEndpoint(e10) {
          return e10.replace("ws://", "http://").replace("wss://", "https://").replace(RegExp("(.*)/" + tx.websocket), "$1/" + tx.longpoll);
        }
        endpointURL() {
          return tD.appendParams(this.pollEndpoint, { token: this.token });
        }
        closeAndRetry(e10, t10, r10) {
          this.close(e10, t10, r10), this.readyState = tA.connecting;
        }
        ontimeout() {
          this.onerror("timeout"), this.closeAndRetry(1005, "timeout", false);
        }
        isActive() {
          return this.readyState === tA.open || this.readyState === tA.connecting;
        }
        poll() {
          let e10 = { Accept: "application/json" };
          this.authToken && (e10["X-Phoenix-AuthToken"] = this.authToken), this.ajax("GET", e10, null, () => this.ontimeout(), (e11) => {
            if (e11) {
              var { status: t10, token: r10, messages: s10 } = e11;
              if (410 === t10 && null !== this.token) {
                this.onerror(410), this.closeAndRetry(3410, "session_gone", false);
                return;
              }
              this.token = r10;
            } else t10 = 0;
            switch (t10) {
              case 200:
                s10.forEach((e12) => {
                  setTimeout(() => this.onmessage({ data: e12 }), 0);
                }), this.poll();
                break;
              case 204:
                this.poll();
                break;
              case 410:
                this.readyState = tA.open, this.onopen({}), this.poll();
                break;
              case 403:
                this.onerror(403), this.close(1008, "forbidden", false);
                break;
              case 0:
              case 500:
                this.onerror(500), this.closeAndRetry(1011, "internal server error", 500);
                break;
              default:
                throw Error(`unhandled poll status ${t10}`);
            }
          });
        }
        send(e10) {
          "string" != typeof e10 && (e10 = tU(e10)), this.currentBatch ? this.currentBatch.push(e10) : this.awaitingBatchAck ? this.batchBuffer.push(e10) : (this.currentBatch = [e10], this.currentBatchTimer = setTimeout(() => {
            this.batchSend(this.currentBatch), this.currentBatch = null;
          }, 0));
        }
        batchSend(e10, t10 = 0) {
          this.awaitingBatchAck = true;
          let r10 = t10 + 100, s10 = e10.slice(t10, r10);
          this.ajax("POST", { "Content-Type": "application/x-ndjson" }, s10.join("\n"), () => this.onerror("timeout"), (t11) => {
            t11 && 200 === t11.status ? r10 < e10.length ? this.batchSend(e10, r10) : this.batchBuffer.length > 0 ? (this.batchSend(this.batchBuffer), this.batchBuffer = []) : this.awaitingBatchAck = false : (this.awaitingBatchAck = false, this.onerror(t11 && t11.status), this.closeAndRetry(1011, "internal server error", false));
          });
        }
        close(e10, t10, r10) {
          for (let e11 of this.reqs) e11.abort();
          this.readyState = tA.closed;
          let s10 = Object.assign({ code: 1e3, reason: void 0, wasClean: true }, { code: e10, reason: t10, wasClean: r10 });
          this.batchBuffer = [], clearTimeout(this.currentBatchTimer), this.currentBatchTimer = null, "undefined" != typeof CloseEvent ? this.onclose(new CloseEvent("close", s10)) : this.onclose(s10);
        }
        ajax(e10, t10, r10, s10, i10) {
          let n2;
          n2 = tD.request(e10, this.endpointURL(), t10, r10, this.timeout, () => {
            this.reqs.delete(n2), s10();
          }, (e11) => {
            this.reqs.delete(n2), this.isActive() && i10(e11);
          }), this.reqs.add(n2);
        }
      }, tB = class e10 {
        constructor(t10, r10 = {}) {
          let s10 = r10.events || { state: "presence_state", diff: "presence_diff" };
          this.state = /* @__PURE__ */ Object.create(null), this.pendingDiffs = [], this.channel = t10, this.joinRef = null, this.caller = { onJoin: function() {
          }, onLeave: function() {
          }, onSync: function() {
          } }, this.channel.on(s10.state, (t11) => {
            let { onJoin: r11, onLeave: s11, onSync: i10 } = this.caller;
            this.joinRef = this.channel.joinRef(), this.state = e10.syncState(this.state, t11, r11, s11), this.pendingDiffs.forEach((t12) => {
              this.state = e10.syncDiff(this.state, t12, r11, s11);
            }), this.pendingDiffs = [], i10();
          }), this.channel.on(s10.diff, (t11) => {
            let { onJoin: r11, onLeave: s11, onSync: i10 } = this.caller;
            this.inPendingSyncState() ? this.pendingDiffs.push(t11) : (this.state = e10.syncDiff(this.state, t11, r11, s11), i10());
          });
        }
        onJoin(e11) {
          this.caller.onJoin = e11;
        }
        onLeave(e11) {
          this.caller.onLeave = e11;
        }
        onSync(e11) {
          this.caller.onSync = e11;
        }
        list(t10) {
          return e10.list(this.state, t10);
        }
        inPendingSyncState() {
          return !this.joinRef || this.joinRef !== this.channel.joinRef();
        }
        static syncState(e11, t10, r10, s10) {
          let i10 = this.toNullProtoObj(this.clone(e11));
          t10 = this.toNullProtoObj(t10);
          let n2 = /* @__PURE__ */ Object.create(null), a2 = /* @__PURE__ */ Object.create(null);
          return this.map(i10, (e12, r11) => {
            t10[e12] || (a2[e12] = r11);
          }), this.map(t10, (e12, t11) => {
            let r11 = i10[e12];
            if (r11) {
              let s11 = t11.metas.map((e13) => e13.phx_ref), i11 = r11.metas.map((e13) => e13.phx_ref), o2 = t11.metas.filter((e13) => 0 > i11.indexOf(e13.phx_ref)), l2 = r11.metas.filter((e13) => 0 > s11.indexOf(e13.phx_ref));
              o2.length > 0 && (n2[e12] = t11, n2[e12].metas = o2), l2.length > 0 && (a2[e12] = this.clone(r11), a2[e12].metas = l2);
            } else n2[e12] = t11;
          }), this.syncDiff(i10, { joins: n2, leaves: a2 }, r10, s10);
        }
        static syncDiff(e11, t10, r10, s10) {
          e11 = this.toNullProtoObj(e11);
          let { joins: i10, leaves: n2 } = this.clone(t10);
          return r10 || (r10 = function() {
          }), s10 || (s10 = function() {
          }), this.map(i10, (t11, s11) => {
            let i11 = e11[t11];
            if (e11[t11] = this.clone(s11), i11) {
              let r11 = e11[t11].metas.map((e12) => e12.phx_ref), s12 = i11.metas.filter((e12) => 0 > r11.indexOf(e12.phx_ref));
              e11[t11].metas.unshift(...s12);
            }
            r10(t11, i11, s11);
          }), this.map(n2, (t11, r11) => {
            let i11 = e11[t11];
            if (!i11) return;
            let n3 = r11.metas.map((e12) => e12.phx_ref);
            i11.metas = i11.metas.filter((e12) => 0 > n3.indexOf(e12.phx_ref)), s10(t11, i11, r11), 0 === i11.metas.length && delete e11[t11];
          }), e11;
        }
        static list(e11, t10) {
          return t10 || (t10 = function(e12, t11) {
            return t11;
          }), this.map(e11, (e12, r10) => t10(e12, r10));
        }
        static map(e11, t10) {
          return Object.getOwnPropertyNames(e11).map((r10) => t10(r10, e11[r10]));
        }
        static toNullProtoObj(e11) {
          if (null === Object.getPrototypeOf(e11)) return e11;
          let t10 = /* @__PURE__ */ Object.create(null);
          return Object.getOwnPropertyNames(e11).forEach((r10) => {
            t10[r10] = e11[r10];
          }), t10;
        }
        static clone(e11) {
          return JSON.parse(JSON.stringify(e11));
        }
      }, tq = { HEADER_LENGTH: 1, META_LENGTH: 4, KINDS: { push: 0, reply: 1, broadcast: 2 }, encode(e10, t10) {
        return e10.payload.constructor === ArrayBuffer ? t10(this.binaryEncode(e10)) : t10(JSON.stringify([e10.join_ref, e10.ref, e10.topic, e10.event, e10.payload]));
      }, decode(e10, t10) {
        if (e10.constructor === ArrayBuffer) return t10(this.binaryDecode(e10));
        {
          let [r10, s10, i10, n2, a2] = JSON.parse(e10);
          return t10({ join_ref: r10, ref: s10, topic: i10, event: n2, payload: a2 });
        }
      }, binaryEncode(e10) {
        let { join_ref: t10, ref: r10, event: s10, topic: i10, payload: n2 } = e10, a2 = new TextEncoder(), o2 = a2.encode(t10), l2 = a2.encode(r10), u2 = a2.encode(i10), c2 = a2.encode(s10);
        this.assertFieldSize(o2.byteLength, "join_ref"), this.assertFieldSize(l2.byteLength, "ref"), this.assertFieldSize(u2.byteLength, "topic"), this.assertFieldSize(c2.byteLength, "event");
        let h2 = this.META_LENGTH + o2.byteLength + l2.byteLength + u2.byteLength + c2.byteLength, d2 = new ArrayBuffer(this.HEADER_LENGTH + h2), p2 = new Uint8Array(d2), f2 = new DataView(d2), g2 = 0;
        f2.setUint8(g2++, this.KINDS.push), f2.setUint8(g2++, o2.byteLength), f2.setUint8(g2++, l2.byteLength), f2.setUint8(g2++, u2.byteLength), f2.setUint8(g2++, c2.byteLength), p2.set(o2, g2), g2 += o2.byteLength, p2.set(l2, g2), g2 += l2.byteLength, p2.set(u2, g2), g2 += u2.byteLength, p2.set(c2, g2), g2 += c2.byteLength;
        var m2 = new Uint8Array(d2.byteLength + n2.byteLength);
        return m2.set(p2, 0), m2.set(new Uint8Array(n2), d2.byteLength), m2.buffer;
      }, assertFieldSize(e10, t10) {
        if (e10 > 255) throw Error(`unable to convert ${t10} to binary: must be less than or equal to 255 bytes, but is ${e10} bytes`);
      }, binaryDecode(e10) {
        let t10 = new DataView(e10), r10 = t10.getUint8(0), s10 = new TextDecoder();
        switch (r10) {
          case this.KINDS.push:
            return this.decodePush(e10, t10, s10);
          case this.KINDS.reply:
            return this.decodeReply(e10, t10, s10);
          case this.KINDS.broadcast:
            return this.decodeBroadcast(e10, t10, s10);
        }
      }, decodePush(e10, t10, r10) {
        let s10 = t10.getUint8(1), i10 = t10.getUint8(2), n2 = t10.getUint8(3), a2 = this.HEADER_LENGTH + this.META_LENGTH - 1, o2 = r10.decode(e10.slice(a2, a2 + s10));
        a2 += s10;
        let l2 = r10.decode(e10.slice(a2, a2 + i10));
        a2 += i10;
        let u2 = r10.decode(e10.slice(a2, a2 + n2));
        return a2 += n2, { join_ref: o2, ref: null, topic: l2, event: u2, payload: e10.slice(a2, e10.byteLength) };
      }, decodeReply(e10, t10, r10) {
        let s10 = t10.getUint8(1), i10 = t10.getUint8(2), n2 = t10.getUint8(3), a2 = t10.getUint8(4), o2 = this.HEADER_LENGTH + this.META_LENGTH, l2 = r10.decode(e10.slice(o2, o2 + s10));
        o2 += s10;
        let u2 = r10.decode(e10.slice(o2, o2 + i10));
        o2 += i10;
        let c2 = r10.decode(e10.slice(o2, o2 + n2));
        o2 += n2;
        let h2 = r10.decode(e10.slice(o2, o2 + a2));
        o2 += a2;
        let d2 = e10.slice(o2, e10.byteLength);
        return { join_ref: l2, ref: u2, topic: c2, event: tC.reply, payload: { status: h2, response: d2 } };
      }, decodeBroadcast(e10, t10, r10) {
        let s10 = t10.getUint8(1), i10 = t10.getUint8(2), n2 = this.HEADER_LENGTH + 2, a2 = r10.decode(e10.slice(n2, n2 + s10));
        n2 += s10;
        let o2 = r10.decode(e10.slice(n2, n2 + i10));
        return n2 += i10, { join_ref: null, ref: null, topic: a2, event: o2, payload: e10.slice(n2, e10.byteLength) };
      } }, tH = class {
        constructor(e10, t10 = {}) {
          this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] }, this.channels = [], this.sendBuffer = [], this.ref = 0, this.fallbackRef = null, this.timeout = t10.timeout || 1e4, this.transport = t10.transport || tO.WebSocket || tM, this.conn = void 0, this.primaryPassedHealthCheck = false, this.longPollFallbackMs = t10.longPollFallbackMs, this.fallbackTimer = null;
          let r10 = null;
          try {
            r10 = tO && tO.sessionStorage;
          } catch {
          }
          this.sessionStore = t10.sessionStorage || r10, this.establishedConnections = 0, this.defaultEncoder = tq.encode.bind(tq), this.defaultDecoder = tq.decode.bind(tq), this.closeWasClean = true, this.disconnecting = false, this.binaryType = t10.binaryType || "arraybuffer", this.connectClock = 1, this.pageHidden = false, this.encode = void 0, this.decode = void 0, this.transport !== tM ? (this.encode = t10.encode || this.defaultEncoder, this.decode = t10.decode || this.defaultDecoder) : (this.encode = this.defaultEncoder, this.decode = this.defaultDecoder);
          let s10 = null;
          tR && tR.addEventListener && (tR.addEventListener("pagehide", (e11) => {
            this.conn && (this.disconnect(), s10 = this.connectClock);
          }), tR.addEventListener("pageshow", (e11) => {
            s10 === this.connectClock && (s10 = null, this.connect());
          }), tR.addEventListener("visibilitychange", () => {
            "hidden" === document.visibilityState ? this.pageHidden = true : (this.pageHidden = false, this.isConnected() || this.closeWasClean || this.teardown(() => this.connect()));
          })), this.heartbeatIntervalMs = t10.heartbeatIntervalMs || 3e4, this.autoSendHeartbeat = t10.autoSendHeartbeat ?? true, this.heartbeatCallback = t10.heartbeatCallback ?? (() => {
          }), this.rejoinAfterMs = (e11) => t10.rejoinAfterMs ? t10.rejoinAfterMs(e11) : [1e3, 2e3, 5e3][e11 - 1] || 1e4, this.reconnectAfterMs = (e11) => t10.reconnectAfterMs ? t10.reconnectAfterMs(e11) : [10, 50, 100, 150, 200, 250, 500, 1e3, 2e3][e11 - 1] || 5e3, this.logger = t10.logger || null, !this.logger && t10.debug && (this.logger = (e11, t11, r11) => {
            console.log(`${e11}: ${t11}`, r11);
          }), this.longpollerTimeout = t10.longpollerTimeout || 2e4, this.params = tE(t10.params || {}), this.endPoint = `${e10}/${tx.websocket}`, this.vsn = t10.vsn || "2.0.0", this.heartbeatTimeoutTimer = null, this.heartbeatTimer = null, this.heartbeatSentAt = null, this.pendingHeartbeatRef = null, this.reconnectTimer = new t$(() => {
            if (this.pageHidden) {
              this.log("Not reconnecting as page is hidden!"), this.teardown();
              return;
            }
            this.teardown(async () => {
              t10.beforeReconnect && await t10.beforeReconnect(), this.connect();
            });
          }, this.reconnectAfterMs), this.authToken = t10.authToken && tE(t10.authToken);
        }
        getLongPollTransport() {
          return tM;
        }
        replaceTransport(e10) {
          this.connectClock++, this.closeWasClean = true, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.conn && (this.conn.close(), this.conn = null), this.transport = e10;
        }
        protocol() {
          return location.protocol.match(/^https/) ? "wss" : "ws";
        }
        endPointURL() {
          let e10 = tD.appendParams(tD.appendParams(this.endPoint, this.params()), { vsn: this.vsn });
          return "/" !== e10.charAt(0) ? e10 : "/" === e10.charAt(1) ? `${this.protocol()}:${e10}` : `${this.protocol()}://${location.host}${e10}`;
        }
        disconnect(e10, t10, r10) {
          this.connectClock++, this.disconnecting = true, this.closeWasClean = true, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.teardown(() => {
            this.disconnecting = false, e10 && e10();
          }, t10, r10);
        }
        connect(e10) {
          e10 && (console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"), this.params = tE(e10)), (!this.conn || this.disconnecting) && (this.longPollFallbackMs && this.transport !== tM ? this.connectWithFallback(tM, this.longPollFallbackMs) : this.transportConnect());
        }
        log(e10, t10, r10) {
          this.logger && this.logger(e10, t10, r10);
        }
        hasLogger() {
          return null !== this.logger;
        }
        onOpen(e10) {
          let t10 = this.makeRef();
          return this.stateChangeCallbacks.open.push([t10, e10]), t10;
        }
        onClose(e10) {
          let t10 = this.makeRef();
          return this.stateChangeCallbacks.close.push([t10, e10]), t10;
        }
        onError(e10) {
          let t10 = this.makeRef();
          return this.stateChangeCallbacks.error.push([t10, e10]), t10;
        }
        onMessage(e10) {
          let t10 = this.makeRef();
          return this.stateChangeCallbacks.message.push([t10, e10]), t10;
        }
        onHeartbeat(e10) {
          this.heartbeatCallback = e10;
        }
        ping(e10) {
          if (!this.isConnected()) return false;
          let t10 = this.makeRef(), r10 = Date.now();
          this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: t10 });
          let s10 = this.onMessage((i10) => {
            i10.ref === t10 && (this.off([s10]), e10(Date.now() - r10));
          });
          return true;
        }
        transportName(e10) {
          return e10 === tM ? "LongPoll" : e10.name;
        }
        transportConnect() {
          let e10;
          this.connectClock++, this.closeWasClean = false, this.authToken && (e10 = ["phoenix", `${tj}${btoa(this.authToken()).replace(/=/g, "")}`]), this.conn = new this.transport(this.endPointURL(), e10), this.conn.binaryType = this.binaryType, this.conn.timeout = this.longpollerTimeout, this.conn.onopen = () => this.onConnOpen(), this.conn.onerror = (e11) => this.onConnError(e11), this.conn.onmessage = (e11) => this.onConnMessage(e11), this.conn.onclose = (e11) => this.onConnClose(e11);
        }
        getSession(e10) {
          return this.sessionStore && this.sessionStore.getItem(e10);
        }
        storeSession(e10, t10) {
          this.sessionStore && this.sessionStore.setItem(e10, t10);
        }
        connectWithFallback(e10, t10 = 2500) {
          let r10, s10;
          clearTimeout(this.fallbackTimer);
          let i10 = false, n2 = true, a2 = this.transportName(e10), o2 = (t11) => {
            this.log("transport", `falling back to ${a2}...`, t11), this.off([r10, s10]), n2 = false, this.replaceTransport(e10), this.transportConnect();
          };
          if (this.getSession(`phx:fallback:${a2}`)) return o2("memorized");
          this.fallbackTimer = setTimeout(o2, t10), s10 = this.onError((e11) => {
            this.log("transport", "error", e11), n2 && !i10 && (clearTimeout(this.fallbackTimer), o2(e11));
          }), this.fallbackRef && this.off([this.fallbackRef]), this.fallbackRef = this.onOpen(() => {
            if (i10 = true, !n2) {
              let t11 = this.transportName(e10);
              return this.primaryPassedHealthCheck || this.storeSession(`phx:fallback:${t11}`, "true"), this.log("transport", `established ${t11} fallback`);
            }
            clearTimeout(this.fallbackTimer), this.fallbackTimer = setTimeout(o2, t10), this.ping((e11) => {
              this.log("transport", "connected to primary after", e11), this.primaryPassedHealthCheck = true, clearTimeout(this.fallbackTimer);
            });
          }), this.transportConnect();
        }
        clearHeartbeats() {
          clearTimeout(this.heartbeatTimer), clearTimeout(this.heartbeatTimeoutTimer);
        }
        onConnOpen() {
          this.hasLogger() && this.log("transport", `connected to ${this.endPointURL()}`), this.closeWasClean = false, this.disconnecting = false, this.establishedConnections++, this.flushSendBuffer(), this.reconnectTimer.reset(), this.autoSendHeartbeat && this.resetHeartbeat(), this.triggerStateCallbacks("open");
        }
        heartbeatTimeout() {
          if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.hasLogger() && this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
            try {
              this.heartbeatCallback("timeout");
            } catch (e10) {
              this.log("error", "error in heartbeat callback", e10);
            }
            this.triggerChanError(Error("heartbeat timeout")), this.closeWasClean = false, this.teardown(() => this.reconnectTimer.scheduleTimeout(), 1e3, "heartbeat timeout");
          }
        }
        resetHeartbeat() {
          this.conn && this.conn.skipHeartbeat || (this.pendingHeartbeatRef = null, this.clearHeartbeats(), this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
        }
        teardown(e10, t10, r10) {
          if (!this.conn) return e10 && e10();
          let s10 = this.conn;
          this.waitForBufferDone(s10, () => {
            t10 ? s10.close(t10, r10 || "") : s10.close(), this.waitForSocketClosed(s10, () => {
              this.conn === s10 && (this.conn.onopen = function() {
              }, this.conn.onerror = function() {
              }, this.conn.onmessage = function() {
              }, this.conn.onclose = function() {
              }, this.conn = null), e10 && e10();
            });
          });
        }
        waitForBufferDone(e10, t10, r10 = 1) {
          if (5 === r10 || !e10.bufferedAmount) {
            t10();
            return;
          }
          setTimeout(() => {
            this.waitForBufferDone(e10, t10, r10 + 1);
          }, 150 * r10);
        }
        waitForSocketClosed(e10, t10, r10 = 1) {
          if (5 === r10 || e10.readyState === tA.closed) {
            t10();
            return;
          }
          setTimeout(() => {
            this.waitForSocketClosed(e10, t10, r10 + 1);
          }, 150 * r10);
        }
        onConnClose(e10) {
          this.conn && (this.conn.onclose = () => {
          }), this.hasLogger() && this.log("transport", "close", e10), this.triggerChanError(e10), this.clearHeartbeats(), this.closeWasClean || this.reconnectTimer.scheduleTimeout(), this.triggerStateCallbacks("close", e10);
        }
        onConnError(e10) {
          this.hasLogger() && this.log("transport", "error", e10);
          let t10 = this.transport, r10 = this.establishedConnections;
          this.triggerStateCallbacks("error", e10, t10, r10), (t10 === this.transport || r10 > 0) && this.triggerChanError(e10);
        }
        triggerChanError(e10) {
          this.channels.forEach((t10) => {
            t10.isErrored() || t10.isLeaving() || t10.isClosed() || t10.trigger(tC.error, e10);
          });
        }
        connectionState() {
          switch (this.conn && this.conn.readyState) {
            case tA.connecting:
              return "connecting";
            case tA.open:
              return "open";
            case tA.closing:
              return "closing";
            default:
              return "closed";
          }
        }
        isConnected() {
          return "open" === this.connectionState();
        }
        remove(e10) {
          this.off(e10.stateChangeRefs), this.channels = this.channels.filter((t10) => t10 !== e10);
        }
        off(e10) {
          for (let t10 in this.stateChangeCallbacks) this.stateChangeCallbacks[t10] = this.stateChangeCallbacks[t10].filter(([t11]) => -1 === e10.indexOf(t11));
        }
        channel(e10, t10 = {}) {
          let r10 = new tL(e10, t10, this);
          return this.channels.push(r10), r10;
        }
        push(e10) {
          if (this.hasLogger()) {
            let { topic: t10, event: r10, payload: s10, ref: i10, join_ref: n2 } = e10;
            this.log("push", `${t10} ${r10} (${n2}, ${i10})`, s10);
          }
          this.isConnected() ? this.encode(e10, (e11) => this.conn.send(e11)) : this.sendBuffer.push(() => this.encode(e10, (e11) => this.conn.send(e11)));
        }
        makeRef() {
          let e10 = this.ref + 1;
          return e10 === this.ref ? this.ref = 0 : this.ref = e10, this.ref.toString();
        }
        sendHeartbeat() {
          if (!this.isConnected()) {
            try {
              this.heartbeatCallback("disconnected");
            } catch (e10) {
              this.log("error", "error in heartbeat callback", e10);
            }
            return;
          }
          if (this.pendingHeartbeatRef) {
            this.heartbeatTimeout();
            return;
          }
          this.pendingHeartbeatRef = this.makeRef(), this.heartbeatSentAt = Date.now(), this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
          try {
            this.heartbeatCallback("sent");
          } catch (e10) {
            this.log("error", "error in heartbeat callback", e10);
          }
          this.heartbeatTimeoutTimer = setTimeout(() => this.heartbeatTimeout(), this.heartbeatIntervalMs);
        }
        flushSendBuffer() {
          this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((e10) => e10()), this.sendBuffer = []);
        }
        onConnMessage(e10) {
          this.decode(e10.data, (e11) => {
            let { topic: t10, event: r10, payload: s10, ref: i10, join_ref: n2 } = e11;
            if (i10 && i10 === this.pendingHeartbeatRef) {
              let e12 = this.heartbeatSentAt ? Date.now() - this.heartbeatSentAt : void 0;
              this.clearHeartbeats();
              try {
                this.heartbeatCallback("ok" === s10.status ? "ok" : "error", e12);
              } catch (e13) {
                this.log("error", "error in heartbeat callback", e13);
              }
              this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.autoSendHeartbeat && (this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
            }
            this.hasLogger() && this.log("receive", `${s10.status || ""} ${t10} ${r10} ${i10 && "(" + i10 + ")" || ""}`.trim(), s10);
            for (let e12 = 0; e12 < this.channels.length; e12++) {
              let a2 = this.channels[e12];
              a2.isMember(t10, r10, s10, n2) && a2.trigger(r10, s10, i10, n2);
            }
            this.triggerStateCallbacks("message", e11);
          });
        }
        triggerStateCallbacks(e10, ...t10) {
          try {
            this.stateChangeCallbacks[e10].forEach(([r10, s10]) => {
              try {
                s10(...t10);
              } catch (t11) {
                this.log("error", `error in ${e10} callback`, t11);
              }
            });
          } catch (t11) {
            this.log("error", `error triggering ${e10} callbacks`, t11);
          }
        }
        leaveOpenTopic(e10) {
          let t10 = this.channels.find((t11) => t11.topic === e10 && (t11.isJoined() || t11.isJoining()));
          t10 && (this.hasLogger() && this.log("transport", `leaving duplicate topic "${e10}"`), t10.leave());
        }
      };
      class tV {
        constructor(e10, t10) {
          let r10 = function(e11) {
            return (null == e11 ? void 0 : e11.events) && { events: e11.events };
          }(t10);
          this.presence = new tB(e10.getChannel(), r10), this.presence.onJoin((t11, r11, s10) => {
            let i10 = tV.onJoinPayload(t11, r11, s10);
            e10.getChannel().trigger("presence", i10);
          }), this.presence.onLeave((t11, r11, s10) => {
            let i10 = tV.onLeavePayload(t11, r11, s10);
            e10.getChannel().trigger("presence", i10);
          }), this.presence.onSync(() => {
            e10.getChannel().trigger("presence", { event: "sync" });
          });
        }
        get state() {
          return tV.transformState(this.presence.state);
        }
        static transformState(e10) {
          return Object.getOwnPropertyNames(e10 = JSON.parse(JSON.stringify(e10))).reduce((t10, r10) => {
            let s10 = e10[r10];
            return t10[r10] = tF(s10), t10;
          }, {});
        }
        static onJoinPayload(e10, t10, r10) {
          return { event: "join", key: e10, currentPresences: tW(t10), newPresences: tF(r10) };
        }
        static onLeavePayload(e10, t10, r10) {
          return { event: "leave", key: e10, currentPresences: tW(t10), leftPresences: tF(r10) };
        }
      }
      function tF(e10) {
        return e10.metas.map((e11) => {
          let t10 = Object.defineProperties({}, Object.getOwnPropertyDescriptors(e11));
          return t10.presence_ref = t10.phx_ref, delete t10.phx_ref, delete t10.phx_ref_prev, t10;
        });
      }
      function tW(e10) {
        return (null == e10 ? void 0 : e10.metas) ? tF(e10) : [];
      }
      !function(e10) {
        e10.SYNC = "sync", e10.JOIN = "join", e10.LEAVE = "leave";
      }(_ || (_ = {}));
      class tG {
        get state() {
          return this.presenceAdapter.state;
        }
        constructor(e10, t10) {
          this.channel = e10, this.presenceAdapter = new tV(this.channel.channelAdapter, t10);
        }
      }
      class tK {
        constructor(e10, t10, r10) {
          let s10 = { config: Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, r10.config) };
          this.channel = e10.getSocket().channel(t10, s10), this.socket = e10;
        }
        get state() {
          return this.channel.state;
        }
        set state(e10) {
          this.channel.state = e10;
        }
        get joinedOnce() {
          return this.channel.joinedOnce;
        }
        get joinPush() {
          return this.channel.joinPush;
        }
        get rejoinTimer() {
          return this.channel.rejoinTimer;
        }
        on(e10, t10) {
          return this.channel.on(e10, t10);
        }
        off(e10, t10) {
          this.channel.off(e10, t10);
        }
        subscribe(e10) {
          return this.channel.join(e10);
        }
        unsubscribe(e10) {
          return this.channel.leave(e10);
        }
        teardown() {
          this.channel.teardown();
        }
        onClose(e10) {
          this.channel.onClose(e10);
        }
        onError(e10) {
          return this.channel.onError(e10);
        }
        push(e10, t10, r10) {
          let s10;
          try {
            s10 = this.channel.push(e10, t10, r10);
          } catch (t11) {
            throw Error(`tried to push '${e10}' to '${this.channel.topic}' before joining. Use channel.subscribe() before pushing events`);
          }
          if (this.channel.pushBuffer.length > 100) {
            let e11 = this.channel.pushBuffer.shift();
            e11.cancelTimeout(), this.socket.log("channel", `discarded push due to buffer overflow: ${e11.event}`, e11.payload());
          }
          return s10;
        }
        updateJoinPayload(e10) {
          let t10 = this.channel.joinPush.payload();
          this.channel.joinPush.payload = () => Object.assign(Object.assign({}, t10), e10);
        }
        canPush() {
          return this.socket.isConnected() && this.state === th.joined;
        }
        isJoined() {
          return this.state === th.joined;
        }
        isJoining() {
          return this.state === th.joining;
        }
        isClosed() {
          return this.state === th.closed;
        }
        isLeaving() {
          return this.state === th.leaving;
        }
        updateFilterBindings(e10) {
          this.channel.filterBindings = e10;
        }
        updatePayloadTransform(e10) {
          this.channel.onMessage = e10;
        }
        getChannel() {
          return this.channel;
        }
      }
      let tz = /[,()"\\]/, tJ = (e10) => tz.test(e10) || e10 !== e10.trim(), tX = (e10) => `"${e10.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`, tY = (e10) => {
        let t10 = null === e10 ? "null" : String(e10);
        return tJ(t10) ? tX(t10) : t10;
      }, tZ = (e10) => null === e10 ? "null" : String(e10), tQ = (e10, t10) => {
        if ("in" === e10) {
          let e11 = Array.isArray(t10) ? t10 : [t10];
          if (0 === e11.length) throw Error("Realtime `in` filter requires at least one value.");
          let r10 = Array.from(new Set(e11)).map((e12) => tY(e12)).join(",");
          return `in.(${r10})`;
        }
        return "is" === e10 ? `is.${tZ(t10)}` : `${e10}.${tY(t10)}`;
      };
      class t0 {
        constructor() {
          this.filters = [];
        }
        add(e10, t10, r10, s10 = false) {
          return this.filters.push(`${e10}=${s10 ? "not." : ""}${tQ(t10, r10)}`), this;
        }
        eq(e10, t10) {
          return this.add(e10, "eq", t10);
        }
        neq(e10, t10) {
          return this.add(e10, "neq", t10);
        }
        gt(e10, t10) {
          return this.add(e10, "gt", t10);
        }
        gte(e10, t10) {
          return this.add(e10, "gte", t10);
        }
        lt(e10, t10) {
          return this.add(e10, "lt", t10);
        }
        lte(e10, t10) {
          return this.add(e10, "lte", t10);
        }
        in(e10, t10) {
          return this.add(e10, "in", t10);
        }
        like(e10, t10) {
          return this.add(e10, "like", t10);
        }
        ilike(e10, t10) {
          return this.add(e10, "ilike", t10);
        }
        match(e10, t10) {
          return this.add(e10, "match", t10);
        }
        imatch(e10, t10) {
          return this.add(e10, "imatch", t10);
        }
        is(e10, t10) {
          return this.add(e10, "is", t10);
        }
        isDistinct(e10, t10) {
          return this.add(e10, "isdistinct", t10);
        }
        not(e10, t10, r10) {
          return this.add(e10, t10, r10, true);
        }
        build() {
          return this.filters.join(",");
        }
        toString() {
          return this.build();
        }
      }
      !function(e10) {
        e10.ALL = "*", e10.INSERT = "INSERT", e10.UPDATE = "UPDATE", e10.DELETE = "DELETE";
      }(k || (k = {})), function(e10) {
        e10.BROADCAST = "broadcast", e10.PRESENCE = "presence", e10.POSTGRES_CHANGES = "postgres_changes", e10.SYSTEM = "system";
      }(S || (S = {})), function(e10) {
        e10.SUBSCRIBED = "SUBSCRIBED", e10.TIMED_OUT = "TIMED_OUT", e10.CLOSED = "CLOSED", e10.CHANNEL_ERROR = "CHANNEL_ERROR";
      }(T || (T = {}));
      class t1 {
        get state() {
          return this.channelAdapter.state;
        }
        set state(e10) {
          this.channelAdapter.state = e10;
        }
        get joinedOnce() {
          return this.channelAdapter.joinedOnce;
        }
        get timeout() {
          return this.socket.timeout;
        }
        get joinPush() {
          return this.channelAdapter.joinPush;
        }
        get rejoinTimer() {
          return this.channelAdapter.rejoinTimer;
        }
        constructor(e10, t10 = { config: {} }, r10) {
          var s10, i10;
          if (this.topic = e10, this.params = t10, this.socket = r10, this.bindings = {}, this.subTopic = e10.replace(/^realtime:/i, ""), this.params.config = Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, t10.config), this.channelAdapter = new tK(this.socket.socketAdapter, e10, this.params), this.presence = new tG(this), this._onClose(() => {
            this.socket._remove(this);
          }), this._updateFilterTransform(), this.broadcastEndpointURL = tT(this.socket.socketAdapter.endPointURL()), this.private = this.params.config.private || false, !this.private && (null === (i10 = null === (s10 = this.params.config) || void 0 === s10 ? void 0 : s10.broadcast) || void 0 === i10 ? void 0 : i10.replay)) throw Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`);
        }
        subscribe(e10, t10 = this.timeout) {
          var r10, s10, i10, n2;
          if (this.socket.isConnected() || this.socket.connect(), this.channelAdapter.isClosed()) {
            let { config: { broadcast: a2, presence: o2, private: l2, postgres_changes_options: u2 } } = this.params, c2 = null !== (s10 = null === (r10 = this.bindings.postgres_changes) || void 0 === r10 ? void 0 : r10.map((e11) => e11.filter)) && void 0 !== s10 ? s10 : [], h2 = !!this.bindings[S.PRESENCE] && this.bindings[S.PRESENCE].length > 0 || (null === (i10 = this.params.config.presence) || void 0 === i10 ? void 0 : i10.enabled) === true, d2 = {}, p2 = Object.assign({ broadcast: a2, presence: Object.assign(Object.assign({}, o2), { enabled: h2 }), postgres_changes: c2, private: l2 }, u2 ? { postgres_changes_options: u2 } : {});
            this.socket.accessTokenValue && (d2.access_token = this.socket.accessTokenValue), this._onError((t11) => {
              null == e10 || e10(T.CHANNEL_ERROR, function(e11) {
                if (e11 instanceof Error) return e11;
                if ("string" == typeof e11) return Error(e11);
                if (e11 && "object" == typeof e11) {
                  if ("number" == typeof e11.code) {
                    let t12 = "string" == typeof e11.reason && e11.reason ? ` (${e11.reason})` : "";
                    return Error(`socket closed: ${e11.code}${t12}`, { cause: e11 });
                  }
                  return Error("channel error: transport failure", { cause: e11 });
                }
                return Error("channel error: connection lost");
              }(t11));
            }), this._onClose(() => null == e10 ? void 0 : e10(T.CLOSED)), this.updateJoinPayload(Object.assign({ config: p2 }, d2)), this._updateFilterMessage();
            let f2 = (null == u2 ? void 0 : u2.wait) && c2.length > 0 ? Math.max(t10, (null !== (n2 = u2.timeout) && void 0 !== n2 ? n2 : 15e3) + 1e4) : t10;
            this.channelAdapter.subscribe(f2).receive("ok", async ({ postgres_changes: t11 }) => {
              if (this.socket._isManualToken() || this.socket.setAuth(), void 0 === t11) {
                null == e10 || e10(T.SUBSCRIBED);
                return;
              }
              this._updatePostgresBindings(t11, e10);
            }).receive("error", (t11) => {
              this.state = th.errored;
              let r11 = Object.values(t11).join(", ") || "error";
              null == e10 || e10(T.CHANNEL_ERROR, Error(r11, { cause: t11 }));
            }).receive("timeout", () => {
              null == e10 || e10(T.TIMED_OUT);
            });
          }
          return this;
        }
        _updatePostgresBindings(e10, t10) {
          var r10;
          let s10 = this.bindings.postgres_changes, i10 = null !== (r10 = null == s10 ? void 0 : s10.length) && void 0 !== r10 ? r10 : 0, n2 = [];
          for (let r11 = 0; r11 < i10; r11++) {
            let i11 = s10[r11], { filter: { event: a2, schema: o2, table: l2, filter: u2 } } = i11, c2 = e10 && e10[r11];
            if (c2 && c2.event === a2 && t1.isFilterValueEqual(c2.schema, o2) && t1.isFilterValueEqual(c2.table, l2) && t1.isFilterValueEqual(c2.filter, u2)) n2.push(Object.assign(Object.assign({}, i11), { id: c2.id }));
            else {
              this.unsubscribe(), this.state = th.errored, null == t10 || t10(T.CHANNEL_ERROR, Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = n2, this.state != th.errored && t10 && t10(T.SUBSCRIBED);
        }
        presenceState() {
          return this.presence.state;
        }
        async track(e10, t10 = {}) {
          return await this.send({ type: "presence", event: "track", payload: e10 }, t10);
        }
        async untrack(e10 = {}) {
          return await this.send({ type: "presence", event: "untrack" }, e10);
        }
        on(e10, t10, r10) {
          let s10 = this.channelAdapter.isJoined() || this.channelAdapter.isJoining(), i10 = e10 === S.PRESENCE || e10 === S.POSTGRES_CHANGES;
          if (s10 && i10) throw this.socket.log("channel", `cannot add \`${e10}\` callbacks for ${this.topic} after \`subscribe()\`.`), Error(`cannot add \`${e10}\` callbacks for ${this.topic} after \`subscribe()\`.`);
          return this._on(e10, t10, r10);
        }
        async httpSend(e10, t10, r10 = {}) {
          var s10;
          if (null == t10) return Promise.reject(Error("Payload is required for httpSend()"));
          let i10 = t10 instanceof ArrayBuffer || ArrayBuffer.isView(t10), n2 = { apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": i10 ? "application/octet-stream" : "application/json" };
          this.socket.accessTokenValue && (n2.Authorization = `Bearer ${this.socket.accessTokenValue}`);
          let a2 = new URL(this.broadcastEndpointURL);
          a2.pathname += `/${encodeURIComponent(this.subTopic)}/events/${encodeURIComponent(e10)}`, this.private && a2.searchParams.set("private", "true");
          let o2 = { method: "POST", headers: n2, body: i10 ? t10 : JSON.stringify(t10) }, l2 = await this._fetchWithTimeout(a2.toString(), o2, null !== (s10 = r10.timeout) && void 0 !== s10 ? s10 : this.timeout);
          if (202 === l2.status) return { success: true };
          if (404 === l2.status) return Promise.reject(Error("httpSend() requires Realtime server v2.97.0 or newer; the endpoint returned 404. Update your Supabase CLI to a recent version, or upgrade the Realtime server in your self-hosted setup. See https://github.com/supabase/supabase-js/blob/master/packages/core/realtime-js/migrations/httpsend-server-version.md"));
          let u2 = l2.statusText;
          try {
            let e11 = await l2.json();
            u2 = e11.error || e11.message || u2;
          } catch (e11) {
          }
          return Promise.reject(Error(u2));
        }
        async send(e10, t10 = {}) {
          var r10, s10;
          if (this.channelAdapter.canPush() || "broadcast" !== e10.type) return new Promise((r11) => {
            var s11, i10, n2;
            let a2 = this.channelAdapter.push(e10.type, e10, t10.timeout || this.timeout);
            "broadcast" !== e10.type || (null === (n2 = null === (i10 = null === (s11 = this.params) || void 0 === s11 ? void 0 : s11.config) || void 0 === i10 ? void 0 : i10.broadcast) || void 0 === n2 ? void 0 : n2.ack) || r11("ok"), a2.receive("ok", () => r11("ok")), a2.receive("error", () => r11("error")), a2.receive("timeout", () => r11("timed out"));
          });
          {
            let i10 = "Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.";
            this.socket.hasLogger() ? this.socket.log("channel", i10) : console.warn(i10);
            let { event: n2, payload: a2 } = e10, o2 = { apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": "application/json" };
            this.socket.accessTokenValue && (o2.Authorization = `Bearer ${this.socket.accessTokenValue}`);
            let l2 = { method: "POST", headers: o2, body: JSON.stringify({ messages: [{ topic: this.subTopic, event: n2, payload: a2, private: this.private }] }) };
            try {
              let e11 = await this._fetchWithTimeout(this.broadcastEndpointURL, l2, null !== (r10 = t10.timeout) && void 0 !== r10 ? r10 : this.timeout);
              return await (null === (s10 = e11.body) || void 0 === s10 ? void 0 : s10.cancel()), e11.ok ? "ok" : "error";
            } catch (e11) {
              if (e11 instanceof Error && "AbortError" === e11.name) return "timed out";
              return "error";
            }
          }
        }
        updateJoinPayload(e10) {
          this.channelAdapter.updateJoinPayload(e10);
        }
        async unsubscribe(e10 = this.timeout) {
          return new Promise((t10) => {
            this.channelAdapter.unsubscribe(e10).receive("ok", () => t10("ok")).receive("timeout", () => t10("timed out")).receive("error", () => t10("error"));
          });
        }
        teardown() {
          this.channelAdapter.teardown();
        }
        async _fetchWithTimeout(e10, t10, r10) {
          let s10 = new AbortController(), i10 = setTimeout(() => s10.abort(), r10), n2 = await this.socket.fetch(e10, Object.assign(Object.assign({}, t10), { signal: s10.signal }));
          return clearTimeout(i10), n2;
        }
        _on(e10, t10, r10) {
          var s10;
          let i10 = e10.toLocaleLowerCase(), n2 = null == t10 ? void 0 : t10.filter;
          if ((n2 instanceof t0 || "object" == typeof n2 && null !== n2 && "function" == typeof n2.build) && (t10 = Object.assign(Object.assign({}, t10), { filter: n2.build() })), i10 === S.POSTGRES_CHANGES && (null === (s10 = this.bindings[i10]) || void 0 === s10 ? void 0 : s10.find((e11) => t1.isSamePostgresFilter(e11.filter, t10)))) return this.socket.log("error", `duplicate \`postgres_changes\` binding for ${this.topic} ignored`, t10), this;
          let a2 = this.channelAdapter.on(e10, r10), o2 = { type: i10, filter: t10, callback: r10, ref: a2 };
          return this.bindings[i10] ? this.bindings[i10].push(o2) : this.bindings[i10] = [o2], this._updateFilterMessage(), this;
        }
        _onClose(e10) {
          this.channelAdapter.onClose(e10);
        }
        _onError(e10) {
          this.channelAdapter.onError(e10);
        }
        _updateFilterMessage() {
          this.channelAdapter.updateFilterBindings((e10, t10, r10) => {
            var s10, i10, n2, a2, o2, l2, u2;
            let c2 = e10.event.toLocaleLowerCase();
            if (this._notThisChannelEvent(c2, r10)) return false;
            let h2 = null === (s10 = this.bindings[c2]) || void 0 === s10 ? void 0 : s10.find((t11) => t11.ref === e10.ref);
            if (!h2) return true;
            if (!["broadcast", "presence", "postgres_changes"].includes(c2)) return h2.type.toLocaleLowerCase() === c2;
            if ("id" in h2) {
              let e11 = h2.id, r11 = null === (i10 = h2.filter) || void 0 === i10 ? void 0 : i10.event;
              return e11 && (null === (n2 = t10.ids) || void 0 === n2 ? void 0 : n2.includes(e11)) && ("*" === r11 || (null == r11 ? void 0 : r11.toLocaleLowerCase()) === (null === (a2 = t10.data) || void 0 === a2 ? void 0 : a2.type.toLocaleLowerCase()));
            }
            {
              let e11 = null === (l2 = null === (o2 = null == h2 ? void 0 : h2.filter) || void 0 === o2 ? void 0 : o2.event) || void 0 === l2 ? void 0 : l2.toLocaleLowerCase();
              return "*" === e11 || e11 === (null === (u2 = null == t10 ? void 0 : t10.event) || void 0 === u2 ? void 0 : u2.toLocaleLowerCase());
            }
          });
        }
        _notThisChannelEvent(e10, t10) {
          let { close: r10, error: s10, leave: i10, join: n2 } = td;
          return t10 && [r10, s10, i10, n2].includes(e10) && t10 !== this.joinPush.ref;
        }
        _updateFilterTransform() {
          this.channelAdapter.updatePayloadTransform((e10, t10, r10) => {
            if ("object" == typeof t10 && "ids" in t10) {
              let e11 = t10.data, { schema: r11, table: s10, commit_timestamp: i10, type: n2, errors: a2 } = e11;
              return Object.assign(Object.assign({}, { schema: r11, table: s10, commit_timestamp: i10, eventType: n2, new: {}, old: {}, errors: a2 }), this._getPayloadRecords(e11));
            }
            return t10;
          });
        }
        copyBindings(e10) {
          if (this.joinedOnce) throw Error("cannot copy bindings into joined channel");
          for (let t10 in e10.bindings) for (let r10 of e10.bindings[t10]) this._on(r10.type, r10.filter, r10.callback);
        }
        static isFilterValueEqual(e10, t10) {
          return (null != e10 ? e10 : void 0) === (null != t10 ? t10 : void 0);
        }
        static isSamePostgresFilter(e10, t10) {
          var r10, s10, i10, n2;
          let a2 = null !== (s10 = null === (r10 = null == e10 ? void 0 : e10.select) || void 0 === r10 ? void 0 : r10.join()) && void 0 !== s10 ? s10 : void 0, o2 = null !== (n2 = null === (i10 = null == t10 ? void 0 : t10.select) || void 0 === i10 ? void 0 : i10.join()) && void 0 !== n2 ? n2 : void 0;
          return (null == e10 ? void 0 : e10.event) === (null == t10 ? void 0 : t10.event) && t1.isFilterValueEqual(null == e10 ? void 0 : e10.schema, null == t10 ? void 0 : t10.schema) && t1.isFilterValueEqual(null == e10 ? void 0 : e10.table, null == t10 ? void 0 : t10.table) && t1.isFilterValueEqual(null == e10 ? void 0 : e10.filter, null == t10 ? void 0 : t10.filter) && a2 === o2;
        }
        _getPayloadRecords(e10) {
          let t10 = { new: {}, old: {} };
          return ("INSERT" === e10.type || "UPDATE" === e10.type) && (t10.new = tg(e10.columns, e10.record)), ("UPDATE" === e10.type || "DELETE" === e10.type) && (t10.old = tg(e10.columns, e10.old_record)), t10;
        }
      }
      class t2 {
        constructor(e10, t10) {
          this.socket = new tH(e10, t10);
        }
        get timeout() {
          return this.socket.timeout;
        }
        get endPoint() {
          return this.socket.endPoint;
        }
        get transport() {
          return this.socket.transport;
        }
        get heartbeatIntervalMs() {
          return this.socket.heartbeatIntervalMs;
        }
        get heartbeatCallback() {
          return this.socket.heartbeatCallback;
        }
        set heartbeatCallback(e10) {
          this.socket.heartbeatCallback = e10;
        }
        get heartbeatTimer() {
          return this.socket.heartbeatTimer;
        }
        get pendingHeartbeatRef() {
          return this.socket.pendingHeartbeatRef;
        }
        get reconnectTimer() {
          return this.socket.reconnectTimer;
        }
        get vsn() {
          return this.socket.vsn;
        }
        get encode() {
          return this.socket.encode;
        }
        get decode() {
          return this.socket.decode;
        }
        get reconnectAfterMs() {
          return this.socket.reconnectAfterMs;
        }
        get sendBuffer() {
          return this.socket.sendBuffer;
        }
        get stateChangeCallbacks() {
          return this.socket.stateChangeCallbacks;
        }
        connect() {
          this.socket.connect();
        }
        disconnect(e10, t10, r10, s10 = 1e4) {
          return new Promise((i10) => {
            setTimeout(() => i10("timeout"), s10), this.socket.disconnect(() => {
              e10(), i10("ok");
            }, t10, r10);
          });
        }
        push(e10) {
          this.socket.push(e10);
        }
        log(e10, t10, r10) {
          this.socket.log(e10, t10, r10);
        }
        hasLogger() {
          return this.socket.hasLogger();
        }
        makeRef() {
          return this.socket.makeRef();
        }
        onOpen(e10) {
          this.socket.onOpen(e10);
        }
        onClose(e10) {
          this.socket.onClose(e10);
        }
        onError(e10) {
          this.socket.onError(e10);
        }
        onMessage(e10) {
          this.socket.onMessage(e10);
        }
        isConnected() {
          return this.socket.isConnected();
        }
        isConnecting() {
          return this.socket.connectionState() == tp.connecting;
        }
        isDisconnecting() {
          return this.socket.connectionState() == tp.closing;
        }
        connectionState() {
          return this.socket.connectionState();
        }
        endPointURL() {
          return this.socket.endPointURL();
        }
        sendHeartbeat() {
          this.socket.sendHeartbeat();
        }
        getSocket() {
          return this.socket;
        }
      }
      let t3 = { HEARTBEAT_INTERVAL: 25e3 }, t4 = [1e3, 2e3, 5e3, 1e4], t5 = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
      class t6 {
        get endPoint() {
          return this.socketAdapter.endPoint;
        }
        get timeout() {
          return this.socketAdapter.timeout;
        }
        get transport() {
          return this.socketAdapter.transport;
        }
        get heartbeatCallback() {
          return this.socketAdapter.heartbeatCallback;
        }
        get heartbeatIntervalMs() {
          return this.socketAdapter.heartbeatIntervalMs;
        }
        get heartbeatTimer() {
          return this.worker ? this._workerHeartbeatTimer : this.socketAdapter.heartbeatTimer;
        }
        get pendingHeartbeatRef() {
          return this.worker ? this._pendingWorkerHeartbeatRef : this.socketAdapter.pendingHeartbeatRef;
        }
        get reconnectTimer() {
          return this.socketAdapter.reconnectTimer;
        }
        get vsn() {
          return this.socketAdapter.vsn;
        }
        get encode() {
          return this.socketAdapter.encode;
        }
        get decode() {
          return this.socketAdapter.decode;
        }
        get reconnectAfterMs() {
          return this.socketAdapter.reconnectAfterMs;
        }
        get sendBuffer() {
          return this.socketAdapter.sendBuffer;
        }
        get stateChangeCallbacks() {
          return this.socketAdapter.stateChangeCallbacks;
        }
        constructor(e10, t10) {
          var r10;
          if (this.channels = [], this.accessTokenValue = null, this.accessToken = null, this.apiKey = null, this.httpEndpoint = "", this.headers = {}, this.params = {}, this.ref = 0, this.serializer = new tf(), this._manuallySetToken = false, this._authPromise = null, this._authGeneration = 0, this._workerHeartbeatTimer = void 0, this._pendingWorkerHeartbeatRef = null, this._pendingDisconnectTimer = null, this._disconnectOnEmptyChannelsAfterMs = 0, this._resolveFetch = (e11) => e11 ? (...t11) => e11(...t11) : (...e12) => fetch(...e12), !(null === (r10 = null == t10 ? void 0 : t10.params) || void 0 === r10 ? void 0 : r10.apikey)) throw Error("API key is required to connect to Realtime");
          this.apiKey = t10.params.apikey;
          let s10 = this._initializeOptions(t10);
          this.socketAdapter = new t2(e10, s10), this.httpEndpoint = tT(e10), this.fetch = this._resolveFetch(null == t10 ? void 0 : t10.fetch);
        }
        connect() {
          if (!(this.isConnecting() || this.isDisconnecting() || this.isConnected())) {
            this.accessToken && !this._authPromise && this._setAuthSafely("connect"), this._setupConnectionHandlers();
            try {
              this.socketAdapter.connect();
            } catch (t10) {
              let e10 = t10.message;
              throw Error(`WebSocket not available: ${e10}`);
            }
            this._handleNodeJsRaceCondition();
          }
        }
        endpointURL() {
          return this.socketAdapter.endPointURL();
        }
        async disconnect(e10, t10) {
          return (this._cancelPendingDisconnect(), this.isDisconnecting()) ? "ok" : await this.socketAdapter.disconnect(() => {
            clearInterval(this._workerHeartbeatTimer), this._terminateWorker();
          }, e10, t10);
        }
        getChannels() {
          return this.channels;
        }
        async removeChannel(e10) {
          let t10 = await e10.unsubscribe();
          return "ok" === t10 && e10.teardown(), t10;
        }
        async removeAllChannels() {
          let e10 = this.channels.map(async (e11) => {
            let t11 = await e11.unsubscribe();
            return e11.teardown(), t11;
          }), t10 = await Promise.all(e10);
          return await this.disconnect(), t10;
        }
        log(e10, t10, r10) {
          this.socketAdapter.log(e10, t10, r10);
        }
        hasLogger() {
          return this.socketAdapter.hasLogger();
        }
        connectionState() {
          return this.socketAdapter.connectionState() || tp.closed;
        }
        isConnected() {
          return this.socketAdapter.isConnected();
        }
        isConnecting() {
          return this.socketAdapter.isConnecting();
        }
        isDisconnecting() {
          return this.socketAdapter.isDisconnecting();
        }
        channel(e10, t10 = { config: {} }) {
          let r10 = `realtime:${e10}`, s10 = this.getChannels().find((e11) => e11.topic === r10);
          if (s10) return s10;
          {
            let r11 = new t1(`realtime:${e10}`, t10, this);
            return this._cancelPendingDisconnect(), this.channels.push(r11), r11;
          }
        }
        push(e10) {
          this.socketAdapter.push(e10);
        }
        async setAuth(e10 = null) {
          let t10 = ++this._authGeneration, r10 = this._performAuth(e10, t10);
          t10 === this._authGeneration && (this._authPromise = r10);
          try {
            await r10;
          } finally {
            this._authPromise === r10 && (this._authPromise = null);
          }
        }
        _isManualToken() {
          return this._manuallySetToken;
        }
        async sendHeartbeat() {
          this.socketAdapter.sendHeartbeat();
        }
        onHeartbeat(e10) {
          this.socketAdapter.heartbeatCallback = this._wrapHeartbeatCallback(e10);
        }
        _makeRef() {
          return this.socketAdapter.makeRef();
        }
        _remove(e10) {
          this.channels = this.channels.filter((t10) => t10.topic !== e10.topic), 0 === this.channels.length && (this.log("transport", "no channels remaining, scheduling disconnect"), this._schedulePendingDisconnect());
        }
        _schedulePendingDisconnect() {
          if (this._cancelPendingDisconnect(), 0 === this._disconnectOnEmptyChannelsAfterMs) {
            this.log("transport", "disconnecting immediately - no channels"), this.disconnect();
            return;
          }
          this._pendingDisconnectTimer = setTimeout(() => {
            this._pendingDisconnectTimer = null, 0 === this.channels.length && (this.log("transport", "deferred disconnect fired - no channels, disconnecting"), this.disconnect());
          }, this._disconnectOnEmptyChannelsAfterMs), this.log("transport", `deferred disconnect scheduled in ${this._disconnectOnEmptyChannelsAfterMs}ms`);
        }
        _cancelPendingDisconnect() {
          null !== this._pendingDisconnectTimer && (this.log("transport", "pending disconnect cancelled - channel activity detected"), clearTimeout(this._pendingDisconnectTimer), this._pendingDisconnectTimer = null);
        }
        async _performAuth(e10, t10) {
          let r10;
          let s10 = false;
          if (e10) r10 = e10, s10 = true;
          else if (this.accessToken) try {
            r10 = await this.accessToken();
          } catch (e11) {
            this.log("error", "Error fetching access token from callback", e11), r10 = this.accessTokenValue;
          }
          else r10 = this.accessTokenValue;
          t10 === this._authGeneration && (this.accessToken ? this._manuallySetToken = false : s10 && (this._manuallySetToken = true), this.accessTokenValue != r10 && (this.accessTokenValue = r10, this.channels.forEach((e11) => {
            let t11 = { access_token: r10, version: "realtime-js/2.118.0" };
            e11.updateJoinPayload(t11), e11.joinedOnce && e11.channelAdapter.isJoined() && e11.channelAdapter.push(td.access_token, { access_token: r10 });
          })));
        }
        async _waitForAuthIfNeeded() {
          this._authPromise && await this._authPromise;
        }
        _setAuthSafely(e10 = "general") {
          this._isManualToken() || this.setAuth().catch((t10) => {
            this.log("error", `Error setting auth in ${e10}`, t10);
          });
        }
        _setupConnectionHandlers() {
          this.socketAdapter.onOpen(() => {
            (this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve())).catch((e10) => {
              this.log("error", "error waiting for auth on connect", e10);
            }), this.worker && !this.workerRef && this._startWorkerHeartbeat();
          }), this.socketAdapter.onClose(() => {
            this.worker && this.workerRef && this._terminateWorker();
          }), this.socketAdapter.onMessage((e10) => {
            e10.ref && e10.ref === this._pendingWorkerHeartbeatRef && (this._pendingWorkerHeartbeatRef = null);
          });
        }
        _handleNodeJsRaceCondition() {
          this.socketAdapter.isConnected() && this.socketAdapter.getSocket().onConnOpen();
        }
        _wrapHeartbeatCallback(e10) {
          return (t10, r10) => {
            "disconnected" !== t10 && ("sent" == t10 && this._setAuthSafely(), e10 && e10(t10, r10));
          };
        }
        _startWorkerHeartbeat() {
          this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
          let e10 = this._workerObjectUrl(this.workerUrl);
          this.workerRef = new Worker(e10), this.workerRef.onerror = (e11) => {
            this.log("worker", "worker error", e11.message), this._terminateWorker(), this.disconnect();
          }, this.workerRef.onmessage = (e11) => {
            "keepAlive" === e11.data.event && this.sendHeartbeat();
          }, this.workerRef.postMessage({ event: "start", interval: this.heartbeatIntervalMs });
        }
        _terminateWorker() {
          this.workerRef && (this.log("worker", "terminating worker"), this.workerRef.terminate(), this.workerRef = void 0);
        }
        _workerObjectUrl(e10) {
          let t10;
          if (e10) t10 = e10;
          else {
            let e11 = new Blob([t5], { type: "application/javascript" });
            t10 = URL.createObjectURL(e11);
          }
          return t10;
        }
        _initializeOptions(e10) {
          var t10, r10, s10, i10, n2, a2, o2, l2, u2, c2, h2, d2;
          let p2, f2;
          this.worker = null !== (t10 = null == e10 ? void 0 : e10.worker) && void 0 !== t10 && t10, this.accessToken = null !== (r10 = null == e10 ? void 0 : e10.accessToken) && void 0 !== r10 ? r10 : null;
          let g2 = {};
          g2.timeout = null !== (s10 = null == e10 ? void 0 : e10.timeout) && void 0 !== s10 ? s10 : 1e4, g2.heartbeatIntervalMs = null !== (i10 = null == e10 ? void 0 : e10.heartbeatIntervalMs) && void 0 !== i10 ? i10 : t3.HEARTBEAT_INTERVAL, this._disconnectOnEmptyChannelsAfterMs = null !== (n2 = null == e10 ? void 0 : e10.disconnectOnEmptyChannelsAfterMs) && void 0 !== n2 ? n2 : 2 * (null !== (a2 = null == e10 ? void 0 : e10.heartbeatIntervalMs) && void 0 !== a2 ? a2 : t3.HEARTBEAT_INTERVAL), g2.transport = null !== (o2 = null == e10 ? void 0 : e10.transport) && void 0 !== o2 ? o2 : tu.getWebSocketConstructor(), g2.params = null == e10 ? void 0 : e10.params, g2.logger = null == e10 ? void 0 : e10.logger, g2.heartbeatCallback = this._wrapHeartbeatCallback(null == e10 ? void 0 : e10.heartbeatCallback), g2.sessionStorage = null !== (l2 = null == e10 ? void 0 : e10.sessionStorage) && void 0 !== l2 ? l2 : function() {
            try {
              if ("undefined" != typeof globalThis && globalThis.sessionStorage) return globalThis.sessionStorage;
            } catch (e11) {
            }
            return /* @__PURE__ */ function() {
              let e11 = /* @__PURE__ */ new Map();
              return { get length() {
                return e11.size;
              }, clear() {
                e11.clear();
              }, getItem: (t11) => e11.has(t11) ? e11.get(t11) : null, key(t11) {
                var r11;
                return null !== (r11 = Array.from(e11.keys())[t11]) && void 0 !== r11 ? r11 : null;
              }, removeItem(t11) {
                e11.delete(t11);
              }, setItem(t11, r11) {
                e11.set(t11, String(r11));
              } };
            }();
          }(), g2.reconnectAfterMs = null !== (u2 = null == e10 ? void 0 : e10.reconnectAfterMs) && void 0 !== u2 ? u2 : (e11) => t4[e11 - 1] || 1e4;
          let m2 = null !== (c2 = null == e10 ? void 0 : e10.vsn) && void 0 !== c2 ? c2 : tc;
          switch (m2) {
            case "1.0.0":
              p2 = (e11, t11) => t11(JSON.stringify(e11)), f2 = (e11, t11) => t11(JSON.parse(e11));
              break;
            case tc:
              p2 = this.serializer.encode.bind(this.serializer), f2 = this.serializer.decode.bind(this.serializer);
              break;
            default:
              throw Error(`Unsupported serializer version: ${g2.vsn}`);
          }
          if (g2.vsn = m2, g2.encode = null !== (h2 = null == e10 ? void 0 : e10.encode) && void 0 !== h2 ? h2 : p2, g2.decode = null !== (d2 = null == e10 ? void 0 : e10.decode) && void 0 !== d2 ? d2 : f2, g2.beforeReconnect = this._reconnectAuth.bind(this), ((null == e10 ? void 0 : e10.logLevel) || (null == e10 ? void 0 : e10.log_level)) && (this.logLevel = e10.logLevel || e10.log_level, g2.params = Object.assign(Object.assign({}, g2.params), { log_level: this.logLevel })), this.worker) {
            if ("undefined" != typeof window && !window.Worker) throw Error("Web Worker is not supported");
            this.workerUrl = null == e10 ? void 0 : e10.workerUrl, g2.autoSendHeartbeat = !this.worker;
          }
          return g2;
        }
        async _reconnectAuth() {
          await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
        }
      }
      var t8 = class extends Error {
        constructor(e10, t10) {
          super(e10), this.name = "IcebergError", this.status = t10.status, this.icebergType = t10.icebergType, this.icebergCode = t10.icebergCode, this.details = t10.details, this.isCommitStateUnknown = "CommitStateUnknownException" === t10.icebergType || [500, 502, 504].includes(t10.status) && t10.icebergType?.includes("CommitState") === true;
        }
        isNotFound() {
          return 404 === this.status;
        }
        isConflict() {
          return 409 === this.status;
        }
        isAuthenticationTimeout() {
          return 419 === this.status;
        }
      };
      async function t9(e10) {
        return e10 && "none" !== e10.type ? "bearer" === e10.type ? { Authorization: `Bearer ${e10.token}` } : "header" === e10.type ? { [e10.name]: e10.value } : "custom" === e10.type ? await e10.getHeaders() : {} : {};
      }
      function t7(e10) {
        return e10.join("");
      }
      var re = class {
        constructor(e10, t10 = "") {
          this.client = e10, this.prefix = t10;
        }
        async listNamespaces(e10) {
          let t10 = e10 ? { parent: t7(e10.namespace) } : void 0;
          return (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces`, query: t10 })).data.namespaces.map((e11) => ({ namespace: e11 }));
        }
        async createNamespace(e10, t10) {
          let r10 = { namespace: e10.namespace, properties: t10?.properties };
          return (await this.client.request({ method: "POST", path: `${this.prefix}/namespaces`, body: r10 })).data;
        }
        async dropNamespace(e10) {
          await this.client.request({ method: "DELETE", path: `${this.prefix}/namespaces/${t7(e10.namespace)}` });
        }
        async loadNamespaceMetadata(e10) {
          return { properties: (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${t7(e10.namespace)}` })).data.properties };
        }
        async namespaceExists(e10) {
          try {
            return await this.client.request({ method: "HEAD", path: `${this.prefix}/namespaces/${t7(e10.namespace)}` }), true;
          } catch (e11) {
            if (e11 instanceof t8 && 404 === e11.status) return false;
            throw e11;
          }
        }
        async createNamespaceIfNotExists(e10, t10) {
          try {
            return await this.createNamespace(e10, t10);
          } catch (e11) {
            if (e11 instanceof t8 && 409 === e11.status) return;
            throw e11;
          }
        }
      };
      function rt(e10) {
        return e10.join("");
      }
      var rr = class {
        constructor(e10, t10 = "", r10) {
          this.client = e10, this.prefix = t10, this.accessDelegation = r10;
        }
        async listTables(e10) {
          return (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables` })).data.identifiers;
        }
        async createTable(e10, t10) {
          let r10 = {};
          return this.accessDelegation && (r10["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({ method: "POST", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables`, body: t10, headers: r10 })).data.metadata;
        }
        async updateTable(e10, t10) {
          let r10 = await this.client.request({ method: "POST", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables/${e10.name}`, body: t10 });
          return { "metadata-location": r10.data["metadata-location"], metadata: r10.data.metadata };
        }
        async dropTable(e10, t10) {
          await this.client.request({ method: "DELETE", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables/${e10.name}`, query: { purgeRequested: String(t10?.purge ?? false) } });
        }
        async loadTable(e10) {
          let t10 = {};
          return this.accessDelegation && (t10["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables/${e10.name}`, headers: t10 })).data.metadata;
        }
        async tableExists(e10) {
          let t10 = {};
          this.accessDelegation && (t10["X-Iceberg-Access-Delegation"] = this.accessDelegation);
          try {
            return await this.client.request({ method: "HEAD", path: `${this.prefix}/namespaces/${rt(e10.namespace)}/tables/${e10.name}`, headers: t10 }), true;
          } catch (e11) {
            if (e11 instanceof t8 && 404 === e11.status) return false;
            throw e11;
          }
        }
        async createTableIfNotExists(e10, t10) {
          try {
            return await this.createTable(e10, t10);
          } catch (r10) {
            if (r10 instanceof t8 && 409 === r10.status) return await this.loadTable({ namespace: e10.namespace, name: t10.name });
            throw r10;
          }
        }
      }, rs = class {
        constructor(e10) {
          let t10 = "v1";
          e10.catalogName && (t10 += `/${e10.catalogName}`);
          let r10 = e10.baseUrl.endsWith("/") ? e10.baseUrl : `${e10.baseUrl}/`;
          this.client = function(e11) {
            let t11 = e11.fetchImpl ?? globalThis.fetch;
            return { async request({ method: r11, path: s10, query: i10, body: n2, headers: a2 }) {
              let o2 = function(e12, t12, r12) {
                let s11 = new URL(t12, e12);
                if (r12) for (let [e13, t13] of Object.entries(r12)) void 0 !== t13 && s11.searchParams.set(e13, t13);
                return s11.toString();
              }(e11.baseUrl, s10, i10), l2 = await t9(e11.auth), u2 = await t11(o2, { method: r11, headers: { ...n2 ? { "Content-Type": "application/json" } : {}, ...l2, ...a2 }, body: n2 ? JSON.stringify(n2) : void 0 }), c2 = await u2.text(), h2 = (u2.headers.get("content-type") || "").includes("application/json"), d2 = h2 && c2 ? JSON.parse(c2) : c2;
              if (!u2.ok) {
                let e12 = h2 ? d2 : void 0, t12 = e12?.error;
                throw new t8(t12?.message ?? `Request failed with status ${u2.status}`, { status: u2.status, icebergType: t12?.type, icebergCode: t12?.code, details: e12 });
              }
              return { status: u2.status, headers: u2.headers, data: d2 };
            } };
          }({ baseUrl: r10, auth: e10.auth, fetchImpl: e10.fetch }), this.accessDelegation = e10.accessDelegation?.join(","), this.namespaceOps = new re(this.client, t10), this.tableOps = new rr(this.client, t10, this.accessDelegation);
        }
        async listNamespaces(e10) {
          return this.namespaceOps.listNamespaces(e10);
        }
        async createNamespace(e10, t10) {
          return this.namespaceOps.createNamespace(e10, t10);
        }
        async dropNamespace(e10) {
          await this.namespaceOps.dropNamespace(e10);
        }
        async loadNamespaceMetadata(e10) {
          return this.namespaceOps.loadNamespaceMetadata(e10);
        }
        async listTables(e10) {
          return this.tableOps.listTables(e10);
        }
        async createTable(e10, t10) {
          return this.tableOps.createTable(e10, t10);
        }
        async updateTable(e10, t10) {
          return this.tableOps.updateTable(e10, t10);
        }
        async dropTable(e10, t10) {
          await this.tableOps.dropTable(e10, t10);
        }
        async loadTable(e10) {
          return this.tableOps.loadTable(e10);
        }
        async namespaceExists(e10) {
          return this.namespaceOps.namespaceExists(e10);
        }
        async tableExists(e10) {
          return this.tableOps.tableExists(e10);
        }
        async createNamespaceIfNotExists(e10, t10) {
          return this.namespaceOps.createNamespaceIfNotExists(e10, t10);
        }
        async createTableIfNotExists(e10, t10) {
          return this.tableOps.createTableIfNotExists(e10, t10);
        }
      }, ri = r(195).Buffer;
      function rn(e10) {
        return (rn = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e11) {
          return typeof e11;
        } : function(e11) {
          return e11 && "function" == typeof Symbol && e11.constructor === Symbol && e11 !== Symbol.prototype ? "symbol" : typeof e11;
        })(e10);
      }
      function ra(e10, t10) {
        var r10 = Object.keys(e10);
        if (Object.getOwnPropertySymbols) {
          var s10 = Object.getOwnPropertySymbols(e10);
          t10 && (s10 = s10.filter(function(t11) {
            return Object.getOwnPropertyDescriptor(e10, t11).enumerable;
          })), r10.push.apply(r10, s10);
        }
        return r10;
      }
      function ro(e10) {
        for (var t10 = 1; t10 < arguments.length; t10++) {
          var r10 = null != arguments[t10] ? arguments[t10] : {};
          t10 % 2 ? ra(Object(r10), true).forEach(function(t11) {
            !function(e11, t12, r11) {
              var s10;
              (s10 = function(e12, t13) {
                if ("object" != rn(e12) || !e12) return e12;
                var r12 = e12[Symbol.toPrimitive];
                if (void 0 !== r12) {
                  var s11 = r12.call(e12, t13 || "default");
                  if ("object" != rn(s11)) return s11;
                  throw TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t13 ? String : Number)(e12);
              }(t12, "string"), (t12 = "symbol" == rn(s10) ? s10 : s10 + "") in e11) ? Object.defineProperty(e11, t12, { value: r11, enumerable: true, configurable: true, writable: true }) : e11[t12] = r11;
            }(e10, t11, r10[t11]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e10, Object.getOwnPropertyDescriptors(r10)) : ra(Object(r10)).forEach(function(t11) {
            Object.defineProperty(e10, t11, Object.getOwnPropertyDescriptor(r10, t11));
          });
        }
        return e10;
      }
      var rl = class extends Error {
        constructor(e10, t10 = "storage", r10, s10) {
          super(e10), this.__isStorageError = true, this.namespace = t10, this.name = "vectors" === t10 ? "StorageVectorsError" : "StorageError", this.status = r10, this.statusCode = s10;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, statusCode: this.statusCode };
        }
      };
      function ru(e10) {
        return "object" == typeof e10 && null !== e10 && "__isStorageError" in e10;
      }
      var rc = class extends rl {
        constructor(e10, t10, r10, s10 = "storage", i10) {
          super(e10, s10, t10, r10), this.name = "vectors" === s10 ? "StorageVectorsApiError" : "StorageApiError", this.status = t10, this.statusCode = r10, this.code = i10;
        }
        toJSON() {
          return ro(ro({}, super.toJSON()), {}, { code: this.code });
        }
      }, rh = class extends rl {
        constructor(e10, t10, r10 = "storage") {
          super(e10, r10), this.name = "vectors" === r10 ? "StorageVectorsUnknownError" : "StorageUnknownError", this.originalError = t10;
        }
      };
      function rd(e10, t10, r10) {
        let s10 = ro({}, e10), i10 = t10.toLowerCase();
        for (let e11 of Object.keys(s10)) e11.toLowerCase() === i10 && delete s10[e11];
        return s10[i10] = r10, s10;
      }
      let rp = (e10) => e10 ? (...t10) => e10(...t10) : (...e11) => fetch(...e11), rf = (e10) => {
        if ("object" != typeof e10 || null === e10) return false;
        let t10 = Object.getPrototypeOf(e10);
        return (null === t10 || t10 === Object.prototype || null === Object.getPrototypeOf(t10)) && !(Symbol.toStringTag in e10) && !(Symbol.iterator in e10);
      }, rg = (e10) => {
        if (Array.isArray(e10)) return e10.map((e11) => rg(e11));
        if ("function" == typeof e10 || e10 !== Object(e10)) return e10;
        let t10 = {};
        return Object.entries(e10).forEach(([e11, r10]) => {
          t10[e11.replace(/([-_][a-z])/gi, (e12) => e12.toUpperCase().replace(/[-_]/g, ""))] = rg(r10);
        }), t10;
      }, rm = (e10) => !(!e10 || "string" != typeof e10 || 0 === e10.length || e10.length > 100 || e10.trim() !== e10 || e10.includes("/") || e10.includes("\\")) && /^[\w!.\*'() &$@=;:+,?-]+$/.test(e10), rb = (e10) => e10.split("/").map(encodeURIComponent).join("/"), ry = (e10) => {
        if ("object" == typeof e10 && null !== e10) {
          if ("string" == typeof e10.msg) return e10.msg;
          if ("string" == typeof e10.message) return e10.message;
          if ("string" == typeof e10.error_description) return e10.error_description;
          if ("string" == typeof e10.error) return e10.error;
          if ("object" == typeof e10.error && null !== e10.error) {
            let t10 = e10.error;
            if ("string" == typeof t10.message) return t10.message;
          }
        }
        return JSON.stringify(e10);
      }, rw = async (e10, t10, r10, s10) => {
        if (null !== e10 && "object" == typeof e10 && "json" in e10 && "function" == typeof e10.json) {
          let r11 = parseInt(String(e10.status), 10);
          Number.isFinite(r11) || (r11 = 500), e10.json().then((e11) => {
            let i10 = (null == e11 ? void 0 : e11.statusCode) || (null == e11 ? void 0 : e11.code) || r11 + "";
            t10(new rc(ry(e11), r11, i10, s10, null == e11 ? void 0 : e11.code));
          }).catch(() => {
            let i10 = r11 + "";
            t10(new rc(e10.statusText || `HTTP ${r11} error`, r11, i10, s10));
          });
        } else t10(new rh(ry(e10), e10, s10));
      }, rv = (e10, t10, r10, s10) => {
        let i10 = { method: e10, headers: (null == t10 ? void 0 : t10.headers) || {} };
        if ("GET" === e10 || "HEAD" === e10 || !s10) return ro(ro({}, i10), r10);
        if (rf(s10)) {
          var n2;
          let e11;
          let r11 = (null == t10 ? void 0 : t10.headers) || {};
          for (let [t11, s11] of Object.entries(r11)) "content-type" === t11.toLowerCase() && (e11 = s11);
          i10.headers = rd(r11, "Content-Type", null !== (n2 = e11) && void 0 !== n2 ? n2 : "application/json"), i10.body = JSON.stringify(s10);
        } else i10.body = s10;
        return (null == t10 ? void 0 : t10.duplex) && (i10.duplex = t10.duplex), ro(ro({}, i10), r10);
      };
      async function r_(e10, t10, r10, s10, i10, n2, a2) {
        return new Promise((o2, l2) => {
          e10(r10, rv(t10, s10, i10, n2)).then((e11) => {
            if (!e11.ok) throw e11;
            if (null == s10 ? void 0 : s10.noResolveJson) return e11;
            if ("vectors" === a2) {
              let t11 = e11.headers.get("content-type");
              if ("0" === e11.headers.get("content-length") || 204 === e11.status || !t11 || !t11.includes("application/json")) return {};
            }
            return e11.json();
          }).then((e11) => o2(e11)).catch((e11) => rw(e11, l2, s10, a2));
        });
      }
      function rk(e10 = "storage") {
        return { get: async (t10, r10, s10, i10) => r_(t10, "GET", r10, s10, i10, void 0, e10), post: async (t10, r10, s10, i10, n2) => r_(t10, "POST", r10, i10, n2, s10, e10), put: async (t10, r10, s10, i10, n2) => r_(t10, "PUT", r10, i10, n2, s10, e10), head: async (t10, r10, s10, i10) => r_(t10, "HEAD", r10, ro(ro({}, s10), {}, { noResolveJson: true }), i10, void 0, e10), remove: async (t10, r10, s10, i10, n2) => r_(t10, "DELETE", r10, i10, n2, s10, e10) };
      }
      let { get: rS, post: rT, put: rE, head: rR, remove: rO } = rk("storage"), rA = rk("vectors");
      var rP = class {
        constructor(e10, t10 = {}, r10, s10 = "storage") {
          this.shouldThrowOnError = false, this.url = e10, this.headers = function(e11) {
            let t11 = {};
            for (let [r11, s11] of Object.entries(e11)) t11[r11.toLowerCase()] = s11;
            return t11;
          }(t10), this.fetch = rp(r10), this.namespace = s10;
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        setHeader(e10, t10) {
          return this.headers = rd(this.headers, e10, t10), this;
        }
        async handleOperation(e10) {
          try {
            return { data: await e10(), error: null };
          } catch (e11) {
            if (this.shouldThrowOnError) throw e11;
            if (ru(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
      };
      i = Symbol.toStringTag;
      var rC = class {
        constructor(e10, t10) {
          this.downloadFn = e10, this.shouldThrowOnError = t10, this[i] = "StreamDownloadBuilder", this.promise = null;
        }
        then(e10, t10) {
          return this.getPromise().then(e10, t10);
        }
        catch(e10) {
          return this.getPromise().catch(e10);
        }
        finally(e10) {
          return this.getPromise().finally(e10);
        }
        getPromise() {
          return this.promise || (this.promise = this.execute()), this.promise;
        }
        async execute() {
          try {
            return { data: (await this.downloadFn()).body, error: null };
          } catch (e10) {
            if (this.shouldThrowOnError) throw e10;
            if (ru(e10)) return { data: null, error: e10 };
            throw e10;
          }
        }
      };
      n = Symbol.toStringTag;
      var rx = class {
        constructor(e10, t10) {
          this.downloadFn = e10, this.shouldThrowOnError = t10, this[n] = "BlobDownloadBuilder", this.promise = null;
        }
        asStream() {
          return new rC(this.downloadFn, this.shouldThrowOnError);
        }
        then(e10, t10) {
          return this.getPromise().then(e10, t10);
        }
        catch(e10) {
          return this.getPromise().catch(e10);
        }
        finally(e10) {
          return this.getPromise().finally(e10);
        }
        getPromise() {
          return this.promise || (this.promise = this.execute()), this.promise;
        }
        async execute() {
          try {
            return { data: await (await this.downloadFn()).blob(), error: null };
          } catch (e10) {
            if (this.shouldThrowOnError) throw e10;
            if (ru(e10)) return { data: null, error: e10 };
            throw e10;
          }
        }
      };
      let rI = { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } }, rj = { cacheControl: "3600", contentType: "text/plain;charset=UTF-8", upsert: false };
      var rN = class extends rP {
        constructor(e10, t10 = {}, r10, s10) {
          super(e10, t10, s10, "storage"), this.bucketId = r10;
        }
        async uploadOrUpdate(e10, t10, r10, s10) {
          var i10 = this;
          return i10.handleOperation(async () => {
            let n2;
            let a2 = ro(ro({}, rj), s10), o2 = ro(ro({}, i10.headers), "POST" === e10 && { "x-upsert": String(a2.upsert) }), l2 = a2.metadata;
            if ("undefined" != typeof Blob && r10 instanceof Blob || "undefined" != typeof FormData && r10 instanceof FormData ? n2 = i10.prepareUploadFormData(r10, a2) : (n2 = r10, o2["cache-control"] = `max-age=${a2.cacheControl}`, o2["content-type"] = a2.contentType, a2.contentEncoding && (o2["content-encoding"] = a2.contentEncoding), l2 && (o2["x-metadata"] = i10.toBase64(i10.encodeMetadata(l2))), ("undefined" != typeof ReadableStream && n2 instanceof ReadableStream || n2 && "object" == typeof n2 && "pipe" in n2 && "function" == typeof n2.pipe) && !a2.duplex && (a2.duplex = "half")), null == s10 ? void 0 : s10.headers) for (let [e11, t11] of Object.entries(s10.headers)) o2 = rd(o2, e11, t11);
            let u2 = i10._removeEmptyFolders(t10), c2 = i10._getFinalPath(u2), h2 = await ("PUT" == e10 ? rE : rT)(i10.fetch, `${i10.url}/object/${c2}`, n2, ro({ headers: o2 }, (null == a2 ? void 0 : a2.duplex) ? { duplex: a2.duplex } : {}));
            return { path: u2, id: h2.Id, fullPath: h2.Key };
          });
        }
        async upload(e10, t10, r10) {
          return this.uploadOrUpdate("POST", e10, t10, r10);
        }
        async uploadToSignedUrl(e10, t10, r10, s10) {
          var i10 = this;
          let n2 = i10._removeEmptyFolders(e10), a2 = i10._getFinalPath(n2), o2 = new URL(i10.url + `/object/upload/sign/${a2}`);
          return o2.searchParams.set("token", t10), i10.handleOperation(async () => {
            let e11;
            let t11 = ro(ro({}, rj), s10), a3 = ro(ro({}, i10.headers), { "x-upsert": String(t11.upsert) }), l2 = t11.metadata;
            if ("undefined" != typeof Blob && r10 instanceof Blob || "undefined" != typeof FormData && r10 instanceof FormData ? e11 = i10.prepareUploadFormData(r10, t11) : (e11 = r10, a3["cache-control"] = `max-age=${t11.cacheControl}`, a3["content-type"] = t11.contentType, t11.contentEncoding && (a3["content-encoding"] = t11.contentEncoding), l2 && (a3["x-metadata"] = i10.toBase64(i10.encodeMetadata(l2))), ("undefined" != typeof ReadableStream && e11 instanceof ReadableStream || e11 && "object" == typeof e11 && "pipe" in e11 && "function" == typeof e11.pipe) && !t11.duplex && (t11.duplex = "half")), null == s10 ? void 0 : s10.headers) for (let [e12, t12] of Object.entries(s10.headers)) a3 = rd(a3, e12, t12);
            return { path: n2, fullPath: (await rE(i10.fetch, o2.toString(), e11, ro({ headers: a3 }, (null == t11 ? void 0 : t11.duplex) ? { duplex: t11.duplex } : {}))).Key };
          });
        }
        async createSignedUploadUrl(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => {
            let s10 = r10._getFinalPath(e10), i10 = ro({}, r10.headers);
            (null == t10 ? void 0 : t10.upsert) && (i10["x-upsert"] = "true");
            let n2 = await rT(r10.fetch, `${r10.url}/object/upload/sign/${s10}`, {}, { headers: i10 }), a2 = new URL(r10.url + n2.url), o2 = a2.searchParams.get("token");
            if (!o2) throw new rl("No token returned by API");
            return { signedUrl: a2.toString(), path: e10, token: o2 };
          });
        }
        async update(e10, t10, r10) {
          return this.uploadOrUpdate("PUT", e10, t10, r10);
        }
        async move(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => await rT(s10.fetch, `${s10.url}/object/move`, { bucketId: s10.bucketId, sourceKey: e10, destinationKey: t10, destinationBucket: null == r10 ? void 0 : r10.destinationBucket, sourceVersionId: null == r10 ? void 0 : r10.sourceVersionId }, { headers: s10.headers }));
        }
        async copy(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => ({ path: (await rT(s10.fetch, `${s10.url}/object/copy`, { bucketId: s10.bucketId, sourceKey: e10, destinationKey: t10, destinationBucket: null == r10 ? void 0 : r10.destinationBucket, sourceVersionId: null == r10 ? void 0 : r10.sourceVersionId, copyMetadata: "boolean" == typeof (null == r10 ? void 0 : r10.copyMetadata) ? r10.copyMetadata : void 0, metadata: (null == r10 ? void 0 : r10.copyMetadata) === false ? r10.metadata : void 0 }, { headers: s10.headers })).Key }));
        }
        async createSignedUrl(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => {
            let i10 = s10._getFinalPath(e10), n2 = "object" == typeof (null == r10 ? void 0 : r10.transform) && null !== r10.transform && Object.keys(r10.transform).length > 0, a2 = await rT(s10.fetch, `${s10.url}/object/sign/${i10}`, ro(ro({ expiresIn: t10 }, n2 ? { transform: r10.transform } : {}), (null == r10 ? void 0 : r10.versionId) != null ? { versionId: r10.versionId } : {}), { headers: s10.headers }), o2 = new URLSearchParams();
            (null == r10 ? void 0 : r10.download) && o2.set("download", true === r10.download ? "" : r10.download), (null == r10 ? void 0 : r10.cacheNonce) != null && o2.set("cacheNonce", String(r10.cacheNonce));
            let l2 = o2.toString();
            return { signedUrl: encodeURI(`${s10.url}${a2.signedURL}${l2 ? `&${l2}` : ""}`) };
          });
        }
        async createSignedUrls(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => {
            let i10 = await rT(s10.fetch, `${s10.url}/object/sign/${s10.bucketId}`, { expiresIn: t10, paths: e10 }, { headers: s10.headers }), n2 = new URLSearchParams();
            (null == r10 ? void 0 : r10.download) && n2.set("download", true === r10.download ? "" : r10.download), (null == r10 ? void 0 : r10.cacheNonce) != null && n2.set("cacheNonce", String(r10.cacheNonce));
            let a2 = n2.toString();
            return i10.map((e11) => ro(ro({}, e11), {}, { signedUrl: e11.signedURL ? encodeURI(`${s10.url}${e11.signedURL}${a2 ? `&${a2}` : ""}`) : null }));
          });
        }
        download(e10, t10, r10) {
          let s10 = "object" == typeof (null == t10 ? void 0 : t10.transform) && null !== t10.transform && Object.keys(t10.transform).length > 0 ? "render/image/authenticated" : "object", i10 = new URLSearchParams();
          (null == t10 ? void 0 : t10.transform) && this.applyTransformOptsToQuery(i10, t10.transform), (null == t10 ? void 0 : t10.cacheNonce) != null && i10.set("cacheNonce", String(t10.cacheNonce)), (null == t10 ? void 0 : t10.versionId) != null && i10.set("versionId", String(t10.versionId));
          let n2 = i10.toString(), a2 = this._getFinalPath(e10);
          return new rx(() => rS(this.fetch, `${this.url}/${s10}/${a2}${n2 ? `?${n2}` : ""}`, { headers: this.headers, noResolveJson: true }, r10), this.shouldThrowOnError);
        }
        async info(e10, t10) {
          var r10 = this;
          let s10 = r10._getFinalPath(e10), i10 = new URLSearchParams();
          (null == t10 ? void 0 : t10.versionId) != null && i10.set("versionId", String(t10.versionId));
          let n2 = i10.toString();
          return r10.handleOperation(async () => rg(await rS(r10.fetch, `${r10.url}/object/info/${s10}${n2 ? `?${n2}` : ""}`, { headers: r10.headers })));
        }
        async exists(e10) {
          var t10;
          let r10 = this._getFinalPath(e10);
          try {
            return await rR(this.fetch, `${this.url}/object/${r10}`, { headers: this.headers }), { data: true, error: null };
          } catch (e11) {
            if (this.shouldThrowOnError) throw e11;
            if (ru(e11)) {
              let r11 = e11 instanceof rc ? e11.status : e11 instanceof rh ? null === (t10 = e11.originalError) || void 0 === t10 ? void 0 : t10.status : void 0;
              if (void 0 !== r11 && [400, 404].includes(r11)) return { data: false, error: e11 };
            }
            throw e11;
          }
        }
        getPublicUrl(e10, t10) {
          let r10 = this._getFinalPath(e10), s10 = new URLSearchParams();
          (null == t10 ? void 0 : t10.download) && s10.set("download", true === t10.download ? "" : t10.download), (null == t10 ? void 0 : t10.transform) && this.applyTransformOptsToQuery(s10, t10.transform), (null == t10 ? void 0 : t10.cacheNonce) != null && s10.set("cacheNonce", String(t10.cacheNonce)), (null == t10 ? void 0 : t10.versionId) != null && s10.set("versionId", String(t10.versionId));
          let i10 = s10.toString(), n2 = "object" == typeof (null == t10 ? void 0 : t10.transform) && null !== t10.transform && Object.keys(t10.transform).length > 0 ? "render/image" : "object";
          return { data: { publicUrl: encodeURI(`${this.url}/${n2}/public/${r10}`) + (i10 ? `?${i10}` : "") } };
        }
        async remove(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rO(t10.fetch, `${t10.url}/object/${t10.bucketId}`, { prefixes: e10 }, { headers: t10.headers }));
        }
        async purgeCache(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => {
            let i10 = rb(s10._getFinalPath(e10)), n2 = new URLSearchParams();
            (null == t10 ? void 0 : t10.transformations) && n2.set("transformations", "true");
            let a2 = n2.toString();
            return await rO(s10.fetch, `${s10.url}/cdn/${i10}${a2 ? `?${a2}` : ""}`, {}, { headers: s10.headers }, r10);
          });
        }
        async list(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => {
            let i10 = (null == t10 ? void 0 : t10.sortBy) ? ro(ro({}, rI.sortBy), t10.sortBy) : rI.sortBy, n2 = ro(ro(ro({}, rI), t10), {}, { sortBy: i10, prefix: e10 || "" });
            return await rT(s10.fetch, `${s10.url}/object/list/${s10.bucketId}`, n2, { headers: s10.headers }, r10);
          });
        }
        async listV2(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => {
            let s10 = ro({}, e10);
            return await rT(r10.fetch, `${r10.url}/object/list-v2/${r10.bucketId}`, s10, { headers: r10.headers }, t10);
          });
        }
        prepareUploadFormData(e10, t10) {
          let r10 = new FormData(), s10 = [];
          for (let [i10, n2] of (e10 instanceof FormData ? e10.forEach((e11, t11) => {
            "string" == typeof e11 ? r10.append(t11, e11) : s10.push([t11, e11]);
          }) : s10.push(["", e10]), r10.has("cacheControl") || r10.append("cacheControl", t10.cacheControl), t10.metadata && !r10.has("metadata") && r10.append("metadata", this.encodeMetadata(t10.metadata)), t10.contentEncoding && !r10.has("contentEncoding") && r10.append("contentEncoding", t10.contentEncoding), s10)) r10.append(i10, n2);
          return r10;
        }
        encodeMetadata(e10) {
          return JSON.stringify(e10);
        }
        toBase64(e10) {
          return void 0 !== ri ? ri.from(e10).toString("base64") : btoa(e10);
        }
        _getFinalPath(e10) {
          return `${this.bucketId}/${e10.replace(/^\/+/, "")}`;
        }
        _removeEmptyFolders(e10) {
          return e10.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
        }
        applyTransformOptsToQuery(e10, t10) {
          return t10.width && e10.set("width", t10.width.toString()), t10.height && e10.set("height", t10.height.toString()), t10.resize && e10.set("resize", t10.resize), t10.format && e10.set("format", t10.format), t10.quality && e10.set("quality", t10.quality.toString()), e10;
        }
      };
      let r$ = { "X-Client-Info": "storage-js/2.118.0" };
      var rL = class extends rP {
        constructor(e10, t10 = {}, r10, s10) {
          let i10 = new URL(e10);
          (null == s10 ? void 0 : s10.useNewHostname) && /supabase\.(co|in|red)$/.test(i10.hostname) && !i10.hostname.includes("storage.supabase.") && (i10.hostname = i10.hostname.replace("supabase.", "storage.supabase.")), super(i10.href.replace(/\/$/, ""), ro(ro({}, r$), t10), r10, "storage");
        }
        async listBuckets(e10) {
          var t10 = this;
          return t10.handleOperation(async () => {
            let r10 = t10.listBucketOptionsToQueryString(e10);
            return await rS(t10.fetch, `${t10.url}/bucket${r10}`, { headers: t10.headers });
          });
        }
        async getBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rS(t10.fetch, `${t10.url}/bucket/${e10}`, { headers: t10.headers }));
        }
        async createBucket(e10, t10 = { public: false }) {
          var r10 = this;
          return r10.handleOperation(async () => await rT(r10.fetch, `${r10.url}/bucket`, { id: e10, name: e10, type: t10.type, public: t10.public, file_size_limit: t10.fileSizeLimit, allowed_mime_types: t10.allowedMimeTypes, versioning_status: t10.versioningStatus }, { headers: r10.headers }));
        }
        async updateBucket(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => await rE(r10.fetch, `${r10.url}/bucket/${e10}`, { id: e10, name: e10, public: t10.public, file_size_limit: t10.fileSizeLimit, allowed_mime_types: t10.allowedMimeTypes, versioning_status: t10.versioningStatus }, { headers: r10.headers }));
        }
        async emptyBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rT(t10.fetch, `${t10.url}/bucket/${e10}/empty`, {}, { headers: t10.headers }));
        }
        async deleteBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rO(t10.fetch, `${t10.url}/bucket/${e10}`, {}, { headers: t10.headers }));
        }
        async getBucketLifecycle(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rS(t10.fetch, t10.bucketLifecycleUrl(e10), { headers: t10.headers }));
        }
        async updateBucketLifecycle(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => await rE(r10.fetch, r10.bucketLifecycleUrl(e10), t10, { headers: r10.headers }));
        }
        async deleteBucketLifecycle(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rO(t10.fetch, t10.bucketLifecycleUrl(e10), {}, { headers: t10.headers }));
        }
        async purgeBucketCache(e10, t10, r10) {
          var s10 = this;
          return s10.handleOperation(async () => {
            let i10 = new URLSearchParams();
            (null == t10 ? void 0 : t10.transformations) && i10.set("transformations", "true");
            let n2 = i10.toString();
            return await rO(s10.fetch, `${s10.url}/cdn/${rb(e10)}${n2 ? `?${n2}` : ""}`, {}, { headers: s10.headers }, r10);
          });
        }
        bucketLifecycleUrl(e10) {
          return `${this.url}/bucket/${rb(e10)}/lifecycle`;
        }
        listBucketOptionsToQueryString(e10) {
          let t10 = {};
          return e10 && ("limit" in e10 && (t10.limit = String(e10.limit)), "offset" in e10 && (t10.offset = String(e10.offset)), e10.search && (t10.search = e10.search), e10.sortColumn && (t10.sortColumn = e10.sortColumn), e10.sortOrder && (t10.sortOrder = e10.sortOrder)), Object.keys(t10).length > 0 ? "?" + new URLSearchParams(t10).toString() : "";
        }
      }, rD = class extends rP {
        constructor(e10, t10 = {}, r10) {
          super(e10.replace(/\/$/, ""), ro(ro({}, r$), t10), r10, "storage");
        }
        async createBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rT(t10.fetch, `${t10.url}/bucket`, { name: e10 }, { headers: t10.headers }));
        }
        async listBuckets(e10) {
          var t10 = this;
          return t10.handleOperation(async () => {
            let r10 = new URLSearchParams();
            (null == e10 ? void 0 : e10.limit) !== void 0 && r10.set("limit", e10.limit.toString()), (null == e10 ? void 0 : e10.offset) !== void 0 && r10.set("offset", e10.offset.toString()), (null == e10 ? void 0 : e10.sortColumn) && r10.set("sortColumn", e10.sortColumn), (null == e10 ? void 0 : e10.sortOrder) && r10.set("sortOrder", e10.sortOrder), (null == e10 ? void 0 : e10.search) && r10.set("search", e10.search);
            let s10 = r10.toString(), i10 = s10 ? `${t10.url}/bucket?${s10}` : `${t10.url}/bucket`;
            return await rS(t10.fetch, i10, { headers: t10.headers });
          });
        }
        async deleteBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rO(t10.fetch, `${t10.url}/bucket/${e10}`, {}, { headers: t10.headers }));
        }
        from(e10) {
          var t10 = this;
          if (!rm(e10)) throw new rl("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
          let r10 = new rs({ baseUrl: this.url, catalogName: e10, auth: { type: "custom", getHeaders: async () => t10.headers }, fetch: this.fetch }), s10 = this.shouldThrowOnError;
          return new Proxy(r10, { get(e11, t11) {
            let r11 = e11[t11];
            return "function" != typeof r11 ? r11 : async (...t12) => {
              try {
                return { data: await r11.apply(e11, t12), error: null };
              } catch (e12) {
                if (s10) throw e12;
                return { data: null, error: e12 };
              }
            };
          } });
        }
      }, rU = class extends rP {
        constructor(e10, t10 = {}, r10) {
          super(e10.replace(/\/$/, ""), ro(ro({}, r$), {}, { "Content-Type": "application/json" }, t10), r10, "vectors");
        }
        async createIndex(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/CreateIndex`, e10, { headers: t10.headers }) || {});
        }
        async getIndex(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => await rA.post(r10.fetch, `${r10.url}/GetIndex`, { vectorBucketName: e10, indexName: t10 }, { headers: r10.headers }));
        }
        async listIndexes(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/ListIndexes`, e10, { headers: t10.headers }));
        }
        async deleteIndex(e10, t10) {
          var r10 = this;
          return r10.handleOperation(async () => await rA.post(r10.fetch, `${r10.url}/DeleteIndex`, { vectorBucketName: e10, indexName: t10 }, { headers: r10.headers }) || {});
        }
      }, rM = class extends rP {
        constructor(e10, t10 = {}, r10) {
          super(e10.replace(/\/$/, ""), ro(ro({}, r$), {}, { "Content-Type": "application/json" }, t10), r10, "vectors");
        }
        async putVectors(e10) {
          var t10 = this;
          if (e10.vectors.length < 1 || e10.vectors.length > 500) throw Error("Vector batch size must be between 1 and 500 items");
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/PutVectors`, e10, { headers: t10.headers }) || {});
        }
        async getVectors(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/GetVectors`, e10, { headers: t10.headers }));
        }
        async listVectors(e10) {
          var t10 = this;
          if (void 0 !== e10.segmentCount) {
            if (e10.segmentCount < 1 || e10.segmentCount > 16) throw Error("segmentCount must be between 1 and 16");
            if (void 0 !== e10.segmentIndex && (e10.segmentIndex < 0 || e10.segmentIndex >= e10.segmentCount)) throw Error(`segmentIndex must be between 0 and ${e10.segmentCount - 1}`);
          }
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/ListVectors`, e10, { headers: t10.headers }));
        }
        async queryVectors(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/QueryVectors`, e10, { headers: t10.headers }));
        }
        async deleteVectors(e10) {
          var t10 = this;
          if (e10.keys.length < 1 || e10.keys.length > 500) throw Error("Keys batch size must be between 1 and 500 items");
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/DeleteVectors`, e10, { headers: t10.headers }) || {});
        }
      }, rB = class extends rP {
        constructor(e10, t10 = {}, r10) {
          super(e10.replace(/\/$/, ""), ro(ro({}, r$), {}, { "Content-Type": "application/json" }, t10), r10, "vectors");
        }
        async createBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/CreateVectorBucket`, { vectorBucketName: e10 }, { headers: t10.headers }) || {});
        }
        async getBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/GetVectorBucket`, { vectorBucketName: e10 }, { headers: t10.headers }));
        }
        async listBuckets(e10 = {}) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/ListVectorBuckets`, e10, { headers: t10.headers }));
        }
        async deleteBucket(e10) {
          var t10 = this;
          return t10.handleOperation(async () => await rA.post(t10.fetch, `${t10.url}/DeleteVectorBucket`, { vectorBucketName: e10 }, { headers: t10.headers }) || {});
        }
      }, rq = class extends rB {
        constructor(e10, t10 = {}) {
          super(e10, t10.headers || {}, t10.fetch);
        }
        from(e10) {
          return new rH(this.url, this.headers, e10, this.fetch);
        }
        async createBucket(e10) {
          return super.createBucket.call(this, e10);
        }
        async getBucket(e10) {
          return super.getBucket.call(this, e10);
        }
        async listBuckets(e10 = {}) {
          return super.listBuckets.call(this, e10);
        }
        async deleteBucket(e10) {
          return super.deleteBucket.call(this, e10);
        }
      }, rH = class extends rU {
        constructor(e10, t10, r10, s10) {
          super(e10, t10, s10), this.vectorBucketName = r10;
        }
        async createIndex(e10) {
          return super.createIndex.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName }));
        }
        async listIndexes(e10 = {}) {
          return super.listIndexes.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName }));
        }
        async getIndex(e10) {
          return super.getIndex.call(this, this.vectorBucketName, e10);
        }
        async deleteIndex(e10) {
          return super.deleteIndex.call(this, this.vectorBucketName, e10);
        }
        index(e10) {
          return new rV(this.url, this.headers, this.vectorBucketName, e10, this.fetch);
        }
      }, rV = class extends rM {
        constructor(e10, t10, r10, s10, i10) {
          super(e10, t10, i10), this.vectorBucketName = r10, this.indexName = s10;
        }
        async putVectors(e10) {
          return super.putVectors.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        }
        async getVectors(e10) {
          return super.getVectors.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        }
        async listVectors(e10 = {}) {
          return super.listVectors.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        }
        async queryVectors(e10) {
          return super.queryVectors.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        }
        async deleteVectors(e10) {
          return super.deleteVectors.call(this, ro(ro({}, e10), {}, { vectorBucketName: this.vectorBucketName, indexName: this.indexName }));
        }
      }, rF = class extends rL {
        constructor(e10, t10 = {}, r10, s10) {
          super(e10, t10, r10, s10);
        }
        from(e10) {
          return new rN(this.url, this.headers, e10, this.fetch);
        }
        get vectors() {
          return new rq(this.url + "/vector", { headers: this.headers, fetch: this.fetch });
        }
        get analytics() {
          return new rD(this.url + "/iceberg", this.headers, this.fetch);
        }
      };
      function rW(e10, t10) {
        var r10 = {};
        for (var s10 in e10) Object.prototype.hasOwnProperty.call(e10, s10) && 0 > t10.indexOf(s10) && (r10[s10] = e10[s10]);
        if (null != e10 && "function" == typeof Object.getOwnPropertySymbols) for (var i10 = 0, s10 = Object.getOwnPropertySymbols(e10); i10 < s10.length; i10++) 0 > t10.indexOf(s10[i10]) && Object.prototype.propertyIsEnumerable.call(e10, s10[i10]) && (r10[s10[i10]] = e10[s10[i10]]);
        return r10;
      }
      Object.create, Object.create, "function" == typeof SuppressedError && SuppressedError;
      let rG = "2.118.0", rK = { "X-Client-Info": `gotrue-js/${rG}` }, rz = "X-Supabase-Api-Version", rJ = { "2024-01-01": { timestamp: Date.parse("2024-01-01T00:00:00.0Z"), name: "2024-01-01" } }, rX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, rY = "sb_flow_id";
      class rZ extends Error {
        constructor(e10, t10, r10) {
          super(e10), this.__isAuthError = true, this.name = "AuthError", this.status = t10, this.code = r10;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, code: this.code };
        }
      }
      function rQ(e10) {
        return "object" == typeof e10 && null !== e10 && "__isAuthError" in e10;
      }
      class r0 extends rZ {
        constructor(e10, t10, r10) {
          super(e10, t10, r10), this.name = "AuthApiError", this.status = t10, this.code = r10;
        }
      }
      function r1(e10) {
        return rQ(e10) && "AuthApiError" === e10.name;
      }
      class r2 extends rZ {
        constructor(e10, t10) {
          super(e10), this.name = "AuthUnknownError", this.originalError = t10;
        }
      }
      class r3 extends rZ {
        constructor(e10, t10, r10, s10) {
          super(e10, r10, s10), this.name = t10, this.status = r10;
        }
      }
      class r4 extends r3 {
        constructor() {
          super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
        }
      }
      function r5(e10) {
        return rQ(e10) && "AuthSessionMissingError" === e10.name;
      }
      class r6 extends r3 {
        constructor() {
          super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
        }
      }
      class r8 extends r3 {
        constructor(e10) {
          super(e10, "AuthInvalidCredentialsError", 400, void 0);
        }
      }
      class r9 extends r3 {
        constructor(e10, t10 = null) {
          super(e10, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = t10;
        }
        toJSON() {
          return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
        }
      }
      class r7 extends r3 {
        constructor(e10, t10 = null) {
          super(e10, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = t10;
        }
        toJSON() {
          return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
        }
      }
      class se extends r3 {
        constructor() {
          super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
        }
      }
      class st extends r3 {
        constructor(e10, t10) {
          super(e10, "AuthRetryableFetchError", t10, void 0);
        }
      }
      function sr(e10) {
        return rQ(e10) && "AuthRetryableFetchError" === e10.name;
      }
      class ss extends r3 {
        constructor(e10 = "Refresh result discarded: session state changed mid-flight (e.g., concurrent signOut)") {
          super(e10, "AuthRefreshDiscardedError", 409, void 0);
        }
      }
      function si(e10) {
        return rQ(e10) && "AuthRefreshDiscardedError" === e10.name;
      }
      class sn extends r3 {
        constructor(e10, t10, r10) {
          super(e10, "AuthWeakPasswordError", t10, "weak_password"), this.reasons = r10;
        }
        toJSON() {
          return Object.assign(Object.assign({}, super.toJSON()), { reasons: this.reasons });
        }
      }
      class sa extends r3 {
        constructor(e10) {
          super(e10, "AuthInvalidJwtError", 400, "invalid_jwt");
        }
      }
      let so = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), sl = " 	\n\r=".split(""), su = (() => {
        let e10 = Array(128);
        for (let t10 = 0; t10 < e10.length; t10 += 1) e10[t10] = -1;
        for (let t10 = 0; t10 < sl.length; t10 += 1) e10[sl[t10].charCodeAt(0)] = -2;
        for (let t10 = 0; t10 < so.length; t10 += 1) e10[so[t10].charCodeAt(0)] = t10;
        return e10;
      })();
      function sc(e10, t10, r10) {
        if (null !== e10) for (t10.queue = t10.queue << 8 | e10, t10.queuedBits += 8; t10.queuedBits >= 6; ) r10(so[t10.queue >> t10.queuedBits - 6 & 63]), t10.queuedBits -= 6;
        else if (t10.queuedBits > 0) for (t10.queue = t10.queue << 6 - t10.queuedBits, t10.queuedBits = 6; t10.queuedBits >= 6; ) r10(so[t10.queue >> t10.queuedBits - 6 & 63]), t10.queuedBits -= 6;
      }
      function sh(e10, t10, r10) {
        let s10 = su[e10];
        if (s10 > -1) for (t10.queue = t10.queue << 6 | s10, t10.queuedBits += 6; t10.queuedBits >= 8; ) r10(t10.queue >> t10.queuedBits - 8 & 255), t10.queuedBits -= 8;
        else if (-2 === s10) return;
        else throw Error(`Invalid Base64-URL character "${String.fromCharCode(e10)}"`);
      }
      function sd(e10) {
        let t10 = [], r10 = (e11) => {
          t10.push(String.fromCodePoint(e11));
        }, s10 = { utf8seq: 0, codepoint: 0 }, i10 = { queue: 0, queuedBits: 0 }, n2 = (e11) => {
          !function(e12, t11, r11) {
            if (0 === t11.utf8seq) {
              if (e12 <= 127) {
                r11(e12);
                return;
              }
              for (let r12 = 1; r12 < 6; r12 += 1) if ((e12 >> 7 - r12 & 1) == 0) {
                t11.utf8seq = r12;
                break;
              }
              if (2 === t11.utf8seq) t11.codepoint = 31 & e12;
              else if (3 === t11.utf8seq) t11.codepoint = 15 & e12;
              else if (4 === t11.utf8seq) t11.codepoint = 7 & e12;
              else throw Error("Invalid UTF-8 sequence");
              t11.utf8seq -= 1;
            } else if (t11.utf8seq > 0) {
              if (e12 <= 127) throw Error("Invalid UTF-8 sequence");
              t11.codepoint = t11.codepoint << 6 | 63 & e12, t11.utf8seq -= 1, 0 === t11.utf8seq && r11(t11.codepoint);
            }
          }(e11, s10, r10);
        };
        for (let t11 = 0; t11 < e10.length; t11 += 1) sh(e10.charCodeAt(t11), i10, n2);
        return t10.join("");
      }
      function sp(e10) {
        let t10 = [], r10 = { queue: 0, queuedBits: 0 }, s10 = (e11) => {
          t10.push(e11);
        };
        for (let t11 = 0; t11 < e10.length; t11 += 1) sh(e10.charCodeAt(t11), r10, s10);
        return new Uint8Array(t10);
      }
      function sf(e10) {
        let t10 = [], r10 = { queue: 0, queuedBits: 0 }, s10 = (e11) => {
          t10.push(e11);
        };
        return e10.forEach((e11) => sc(e11, r10, s10)), sc(null, r10, s10), t10.join("");
      }
      function sg(e10) {
        return Math.round(Date.now() / 1e3) + e10;
      }
      let sm = () => "undefined" != typeof window && "undefined" != typeof document, sb = { tested: false, writable: false }, sy = () => {
        if (!sm()) return false;
        try {
          if ("object" != typeof globalThis.localStorage) return false;
        } catch (e11) {
          return false;
        }
        if (sb.tested) return sb.writable;
        let e10 = `lswt-${Math.random()}${Math.random()}`;
        try {
          globalThis.localStorage.setItem(e10, e10), globalThis.localStorage.removeItem(e10), sb.tested = true, sb.writable = true;
        } catch (e11) {
          sb.tested = true, sb.writable = false;
        }
        return sb.writable;
      };
      function sw(e10) {
        let t10 = {}, r10 = new URL(e10);
        if (r10.hash && "#" === r10.hash[0]) try {
          new URLSearchParams(r10.hash.substring(1)).forEach((e11, r11) => {
            t10[r11] = e11;
          });
        } catch (e11) {
        }
        return r10.searchParams.forEach((e11, r11) => {
          t10[r11] = e11;
        }), t10;
      }
      let sv = (e10) => e10 ? (...t10) => e10(...t10) : (...e11) => fetch(...e11), s_ = (e10) => "object" == typeof e10 && null !== e10 && "status" in e10 && "ok" in e10 && "json" in e10 && "function" == typeof e10.json, sk = async (e10, t10, r10) => {
        await e10.setItem(t10, JSON.stringify(r10));
      }, sS = async (e10, t10) => {
        let r10 = await e10.getItem(t10);
        if (!r10) return null;
        try {
          return JSON.parse(r10);
        } catch (e11) {
          return null;
        }
      }, sT = async (e10, t10) => {
        await e10.removeItem(t10);
      };
      class sE {
        constructor() {
          this.promise = new sE.promiseConstructor((e10, t10) => {
            this.resolve = e10, this.reject = t10;
          });
        }
      }
      function sR(e10) {
        let t10 = e10.split(".");
        if (3 !== t10.length) throw new sa("Invalid JWT structure");
        for (let e11 = 0; e11 < t10.length; e11++) if (!rX.test(t10[e11])) throw new sa("JWT not in base64url format");
        return { header: JSON.parse(sd(t10[0])), payload: JSON.parse(sd(t10[1])), signature: sp(t10[2]), raw: { header: t10[0], payload: t10[1] } };
      }
      async function sO(e10) {
        return await new Promise((t10) => {
          setTimeout(() => t10(null), e10);
        });
      }
      function sA(e10) {
        return ("0" + e10.toString(16)).substr(-2);
      }
      async function sP(e10) {
        let t10 = new TextEncoder().encode(e10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", t10))).map((e11) => String.fromCharCode(e11)).join("");
      }
      async function sC(e10) {
        return "undefined" != typeof crypto && void 0 !== crypto.subtle && "undefined" != typeof TextEncoder ? btoa(await sP(e10)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : (console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), e10);
      }
      sE.promiseConstructor = Promise;
      let sx = /^[a-zA-Z0-9_-]{8,64}$/;
      function sI(e10) {
        return "string" == typeof e10 && sx.test(e10) ? e10 : null;
      }
      let sj = (e10, t10) => `${e10}-flow-${t10}-code-verifier`, sN = (e10) => `${e10}-flows-code-verifier`;
      async function s$(e10, t10) {
        let r10 = await sS(e10, sN(t10));
        return Array.isArray(r10) ? r10.filter((e11) => null !== sI(e11)) : [];
      }
      async function sL(e10, t10, r10, s10, i10) {
        await sk(e10, sj(t10, r10), s10);
        let n2 = (await s$(e10, t10)).filter((e11) => e11 !== r10);
        for (n2.push(r10); n2.length > 5; ) {
          let r11 = n2.shift();
          await sT(e10, sj(t10, r11)), null == i10 || i10(r11);
        }
        await sk(e10, sN(t10), n2), await sk(e10, `${t10}-code-verifier`, s10);
      }
      async function sD(e10, t10, r10) {
        if (r10) {
          let s11 = await sS(e10, sj(t10, r10));
          return { verifier: "string" == typeof s11 ? s11 : null, flowId: r10 };
        }
        let s10 = await sS(e10, `${t10}-code-verifier`);
        return { verifier: "string" == typeof s10 ? s10 : null, flowId: null };
      }
      async function sU(e10, t10, r10) {
        let s10 = `${t10}-code-verifier`;
        if (!r10) {
          await sT(e10, s10);
          return;
        }
        let i10 = sj(t10, r10), n2 = await sS(e10, i10);
        await sT(e10, i10);
        let a2 = await s$(e10, t10), o2 = a2.filter((e11) => e11 !== r10);
        o2.length !== a2.length && (o2.length > 0 ? await sk(e10, sN(t10), o2) : await sT(e10, sN(t10))), null != n2 && n2 === await sS(e10, s10) && await sT(e10, s10);
      }
      async function sM(e10, t10) {
        for (let r10 of await s$(e10, t10)) await sT(e10, sj(t10, r10));
        await sT(e10, sN(t10)), await sT(e10, `${t10}-code-verifier`);
      }
      async function sB(e10, t10, r10 = false, s10) {
        let i10 = function() {
          let e11 = new Uint32Array(56);
          if ("undefined" == typeof crypto) {
            let e12 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", t11 = e12.length, r11 = "";
            for (let s11 = 0; s11 < 56; s11++) r11 += e12.charAt(Math.floor(Math.random() * t11));
            return r11;
          }
          return crypto.getRandomValues(e11), Array.from(e11, sA).join("");
        }(), n2 = i10;
        r10 && (n2 += "/recovery");
        let a2 = function() {
          if ("undefined" != typeof crypto && "function" == typeof crypto.getRandomValues) {
            let e12 = new Uint8Array(16);
            return crypto.getRandomValues(e12), Array.from(e12, sA).join("");
          }
          let e11 = "";
          for (let t11 = 0; t11 < 32; t11++) e11 += Math.floor(16 * Math.random()).toString(16);
          return e11;
        }();
        await sL(e10, t10, a2, n2, s10);
        let o2 = await sC(i10), l2 = i10 === o2 ? "plain" : "s256";
        return [o2, l2, a2];
      }
      let sq = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i, sH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      function sV(e10) {
        if (!sH.test(e10)) throw Error("@supabase/auth-js: Expected parameter to be UUID but is not");
      }
      function sF(e10) {
        if (!e10.recoveryCodes) throw Error("@supabase/auth-js: the MFA recovery codes API is experimental and disabled by default. Enable it by passing `auth: { experimental: { recoveryCodes: true } }` to createClient (or to the GoTrueClient constructor).");
      }
      function sW() {
        return new Proxy({}, { get: (e10, t10) => {
          if ("__isUserNotAvailableProxy" === t10) return true;
          if ("symbol" == typeof t10) {
            let e11 = t10.toString();
            if ("Symbol(Symbol.toPrimitive)" === e11 || "Symbol(Symbol.toStringTag)" === e11 || "Symbol(util.inspect.custom)" === e11) return;
          }
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t10}" property of the session object is not supported. Please use getUser() instead.`);
        }, set: (e10, t10) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t10}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        }, deleteProperty: (e10, t10) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t10}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        } });
      }
      function sG(e10) {
        return JSON.parse(JSON.stringify(e10));
      }
      let sK = (e10) => {
        if ("object" == typeof e10 && null !== e10) {
          if ("string" == typeof e10.msg) return e10.msg;
          if ("string" == typeof e10.message) return e10.message;
          if ("string" == typeof e10.error_description) return e10.error_description;
          if ("string" == typeof e10.error) return e10.error;
        }
        return JSON.stringify(e10);
      }, sz = [500, 501, 502, 503, 504, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530];
      async function sJ(e10) {
        var t10;
        let r10, s10;
        if (!s_(e10)) throw new st(sK(e10), 0);
        try {
          r10 = await e10.json();
        } catch (t11) {
          if (sz.includes(e10.status)) throw new st(e10.statusText || `HTTP ${e10.status}`, e10.status);
          throw new r2(sK(t11), t11);
        }
        if (sz.includes(e10.status)) throw new st(sK(r10), e10.status);
        let i10 = function(e11) {
          let t11 = e11.headers.get(rz);
          if (!t11 || !t11.match(sq)) return null;
          try {
            return /* @__PURE__ */ new Date(`${t11}T00:00:00.0Z`);
          } catch (e12) {
            return null;
          }
        }(e10);
        if (i10 && i10.getTime() >= rJ["2024-01-01"].timestamp && "object" == typeof r10 && r10 && "string" == typeof r10.code ? s10 = r10.code : "object" == typeof r10 && r10 && "string" == typeof r10.error_code && (s10 = r10.error_code), s10) {
          if ("weak_password" === s10) throw new sn(sK(r10), e10.status, (null === (t10 = r10.weak_password) || void 0 === t10 ? void 0 : t10.reasons) || []);
          if ("session_not_found" === s10) throw new r4();
        } else if ("object" == typeof r10 && r10 && "object" == typeof r10.weak_password && r10.weak_password && Array.isArray(r10.weak_password.reasons) && r10.weak_password.reasons.length && r10.weak_password.reasons.reduce((e11, t11) => e11 && "string" == typeof t11, true)) throw new sn(sK(r10), e10.status, r10.weak_password.reasons);
        throw new r0(sK(r10), e10.status || 500, s10);
      }
      let sX = (e10, t10, r10, s10) => {
        let i10 = { method: e10, headers: (null == t10 ? void 0 : t10.headers) || {} };
        return "GET" === e10 ? i10 : (i10.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, null == t10 ? void 0 : t10.headers), i10.body = JSON.stringify(s10), Object.assign(Object.assign({}, i10), r10));
      };
      async function sY(e10, t10, r10, s10) {
        var i10;
        let n2 = Object.assign({}, null == s10 ? void 0 : s10.headers);
        n2[rz] || (n2[rz] = rJ["2024-01-01"].name), (null == s10 ? void 0 : s10.jwt) && (n2.Authorization = `Bearer ${s10.jwt}`);
        let a2 = null !== (i10 = null == s10 ? void 0 : s10.query) && void 0 !== i10 ? i10 : {};
        (null == s10 ? void 0 : s10.redirectTo) && (a2.redirect_to = s10.redirectTo);
        let o2 = Object.keys(a2).length ? "?" + new URLSearchParams(a2).toString() : "", l2 = await sZ(e10, t10, r10 + o2, { headers: n2, noResolveJson: null == s10 ? void 0 : s10.noResolveJson }, {}, null == s10 ? void 0 : s10.body);
        return (null == s10 ? void 0 : s10.xform) ? null == s10 ? void 0 : s10.xform(l2) : { data: Object.assign({}, l2), error: null };
      }
      async function sZ(e10, t10, r10, s10, i10, n2) {
        let a2;
        let o2 = sX(t10, s10, i10, n2);
        try {
          a2 = await e10(r10, Object.assign({}, o2));
        } catch (e11) {
          throw new st(sK(e11), 0);
        }
        if (a2.ok || await sJ(a2), null == s10 ? void 0 : s10.noResolveJson) return a2;
        try {
          return await a2.json();
        } catch (e11) {
          await sJ(e11);
        }
      }
      function sQ(e10) {
        var t10;
        let r10 = null;
        return e10.access_token && e10.refresh_token && e10.expires_in && (r10 = Object.assign({}, e10), e10.expires_at || (r10.expires_at = sg(e10.expires_in))), { data: { session: r10, user: null !== (t10 = e10.user) && void 0 !== t10 ? t10 : "string" == typeof (null == e10 ? void 0 : e10.id) ? e10 : null }, error: null };
      }
      function s0(e10) {
        let t10 = sQ(e10);
        return !t10.error && e10.weak_password && "object" == typeof e10.weak_password && Array.isArray(e10.weak_password.reasons) && e10.weak_password.reasons.length && e10.weak_password.message && "string" == typeof e10.weak_password.message && e10.weak_password.reasons.reduce((e11, t11) => e11 && "string" == typeof t11, true) && (t10.data.weak_password = e10.weak_password), t10;
      }
      function s1(e10) {
        var t10;
        return { data: { user: null !== (t10 = e10.user) && void 0 !== t10 ? t10 : e10 }, error: null };
      }
      function s2(e10) {
        return { data: e10, error: null };
      }
      function s3(e10) {
        let { action_link: t10, email_otp: r10, hashed_token: s10, redirect_to: i10, verification_type: n2 } = e10;
        return { data: { properties: { action_link: t10, email_otp: r10, hashed_token: s10, redirect_to: i10, verification_type: n2 }, user: Object.assign({}, rW(e10, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"])) }, error: null };
      }
      function s4(e10) {
        return e10;
      }
      let s5 = ["global", "local", "others"];
      class s6 {
        constructor({ url: e10 = "", headers: t10 = {}, fetch: r10, experimental: s10 }) {
          this.url = e10, this.headers = t10, this.fetch = sv(r10), this.experimental = null != s10 ? s10 : {}, this.mfa = { listFactors: this._listFactors.bind(this), deleteFactor: this._deleteFactor.bind(this) }, this.oauth = { listClients: this._listOAuthClients.bind(this), createClient: this._createOAuthClient.bind(this), getClient: this._getOAuthClient.bind(this), updateClient: this._updateOAuthClient.bind(this), deleteClient: this._deleteOAuthClient.bind(this), regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this) }, this.customProviders = { listProviders: this._listCustomProviders.bind(this), createProvider: this._createCustomProvider.bind(this), getProvider: this._getCustomProvider.bind(this), updateProvider: this._updateCustomProvider.bind(this), deleteProvider: this._deleteCustomProvider.bind(this) }, this.passkey = { listPasskeys: this._adminListPasskeys.bind(this), deletePasskey: this._adminDeletePasskey.bind(this) };
        }
        async signOut(e10, t10 = s5[0]) {
          if (0 > s5.indexOf(t10)) throw Error(`@supabase/auth-js: Parameter scope must be one of ${s5.join(", ")}`);
          try {
            return await sY(this.fetch, "POST", `${this.url}/logout?scope=${t10}`, { headers: this.headers, jwt: e10, noResolveJson: true }), { data: null, error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async inviteUserByEmail(e10, t10 = {}) {
          try {
            return await sY(this.fetch, "POST", `${this.url}/invite`, { body: { email: e10, data: t10.data }, headers: this.headers, redirectTo: t10.redirectTo, xform: s1 });
          } catch (e11) {
            if (rQ(e11)) return { data: { user: null }, error: e11 };
            throw e11;
          }
        }
        async generateLink(e10) {
          try {
            let { options: t10 } = e10, r10 = rW(e10, ["options"]), s10 = Object.assign(Object.assign({}, r10), t10);
            return "newEmail" in r10 && (s10.new_email = null == r10 ? void 0 : r10.newEmail, delete s10.newEmail), await sY(this.fetch, "POST", `${this.url}/admin/generate_link`, { body: s10, headers: this.headers, xform: s3, redirectTo: null == t10 ? void 0 : t10.redirectTo });
          } catch (e11) {
            if (rQ(e11)) return { data: { properties: null, user: null }, error: e11 };
            throw e11;
          }
        }
        async createUser(e10) {
          try {
            return await sY(this.fetch, "POST", `${this.url}/admin/users`, { body: e10, headers: this.headers, xform: s1 });
          } catch (e11) {
            if (rQ(e11)) return { data: { user: null }, error: e11 };
            throw e11;
          }
        }
        async listUsers(e10) {
          var t10, r10, s10, i10, n2, a2, o2;
          try {
            let l2 = { nextPage: null, lastPage: 0, total: 0 }, u2 = await sY(this.fetch, "GET", `${this.url}/admin/users`, { headers: this.headers, noResolveJson: true, query: { page: null !== (r10 = null === (t10 = null == e10 ? void 0 : e10.page) || void 0 === t10 ? void 0 : t10.toString()) && void 0 !== r10 ? r10 : "", per_page: null !== (i10 = null === (s10 = null == e10 ? void 0 : e10.perPage) || void 0 === s10 ? void 0 : s10.toString()) && void 0 !== i10 ? i10 : "" }, xform: s4 });
            if (u2.error) throw u2.error;
            let c2 = await u2.json(), h2 = null !== (n2 = u2.headers.get("x-total-count")) && void 0 !== n2 ? n2 : 0, d2 = null !== (o2 = null === (a2 = u2.headers.get("link")) || void 0 === a2 ? void 0 : a2.split(",")) && void 0 !== o2 ? o2 : [];
            return d2.length > 0 && (d2.forEach((e11) => {
              let t11 = parseInt(e11.split(";")[0].split("=")[1].substring(0, 1)), r11 = JSON.parse(e11.split(";")[1].split("=")[1]);
              l2[`${r11}Page`] = t11;
            }), l2.total = parseInt(h2)), { data: Object.assign(Object.assign({}, c2), l2), error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: { users: [] }, error: e11 };
            throw e11;
          }
        }
        async getUserById(e10) {
          sV(e10);
          try {
            return await sY(this.fetch, "GET", `${this.url}/admin/users/${e10}`, { headers: this.headers, xform: s1 });
          } catch (e11) {
            if (rQ(e11)) return { data: { user: null }, error: e11 };
            throw e11;
          }
        }
        async updateUserById(e10, t10) {
          sV(e10);
          try {
            return await sY(this.fetch, "PUT", `${this.url}/admin/users/${e10}`, { body: t10, headers: this.headers, xform: s1 });
          } catch (e11) {
            if (rQ(e11)) return { data: { user: null }, error: e11 };
            throw e11;
          }
        }
        async deleteUser(e10, t10 = false) {
          sV(e10);
          try {
            return await sY(this.fetch, "DELETE", `${this.url}/admin/users/${e10}`, { headers: this.headers, body: { should_soft_delete: t10 }, xform: s1 });
          } catch (e11) {
            if (rQ(e11)) return { data: { user: null }, error: e11 };
            throw e11;
          }
        }
        async _listFactors(e10) {
          sV(e10.userId);
          try {
            let { data: t10, error: r10 } = await sY(this.fetch, "GET", `${this.url}/admin/users/${e10.userId}/factors`, { headers: this.headers, xform: (e11) => ({ data: { factors: e11 }, error: null }) });
            return { data: t10, error: r10 };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _deleteFactor(e10) {
          sV(e10.userId), sV(e10.id);
          try {
            return { data: await sY(this.fetch, "DELETE", `${this.url}/admin/users/${e10.userId}/factors/${e10.id}`, { headers: this.headers }), error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _listOAuthClients(e10) {
          var t10, r10, s10, i10, n2, a2, o2;
          try {
            let l2 = { nextPage: null, lastPage: 0, total: 0 }, u2 = await sY(this.fetch, "GET", `${this.url}/admin/oauth/clients`, { headers: this.headers, noResolveJson: true, query: { page: null !== (r10 = null === (t10 = null == e10 ? void 0 : e10.page) || void 0 === t10 ? void 0 : t10.toString()) && void 0 !== r10 ? r10 : "", per_page: null !== (i10 = null === (s10 = null == e10 ? void 0 : e10.perPage) || void 0 === s10 ? void 0 : s10.toString()) && void 0 !== i10 ? i10 : "" }, xform: s4 });
            if (u2.error) throw u2.error;
            let c2 = await u2.json(), h2 = null !== (n2 = u2.headers.get("x-total-count")) && void 0 !== n2 ? n2 : 0, d2 = null !== (o2 = null === (a2 = u2.headers.get("link")) || void 0 === a2 ? void 0 : a2.split(",")) && void 0 !== o2 ? o2 : [];
            return d2.length > 0 && (d2.forEach((e11) => {
              let t11 = parseInt(e11.split(";")[0].split("=")[1].substring(0, 1)), r11 = JSON.parse(e11.split(";")[1].split("=")[1]);
              l2[`${r11}Page`] = t11;
            }), l2.total = parseInt(h2)), { data: Object.assign(Object.assign({}, c2), l2), error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: { clients: [] }, error: e11 };
            throw e11;
          }
        }
        async _createOAuthClient(e10) {
          try {
            return await sY(this.fetch, "POST", `${this.url}/admin/oauth/clients`, { body: e10, headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _getOAuthClient(e10) {
          try {
            return await sY(this.fetch, "GET", `${this.url}/admin/oauth/clients/${e10}`, { headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _updateOAuthClient(e10, t10) {
          try {
            return await sY(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${e10}`, { body: t10, headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _deleteOAuthClient(e10) {
          try {
            return await sY(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${e10}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _regenerateOAuthClientSecret(e10) {
          try {
            return await sY(this.fetch, "POST", `${this.url}/admin/oauth/clients/${e10}/regenerate_secret`, { headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _listCustomProviders(e10) {
          try {
            let t10 = {};
            return (null == e10 ? void 0 : e10.type) && (t10.type = e10.type), await sY(this.fetch, "GET", `${this.url}/admin/custom-providers`, { headers: this.headers, query: t10, xform: (e11) => {
              var t11;
              return { data: { providers: null !== (t11 = null == e11 ? void 0 : e11.providers) && void 0 !== t11 ? t11 : [] }, error: null };
            } });
          } catch (e11) {
            if (rQ(e11)) return { data: { providers: [] }, error: e11 };
            throw e11;
          }
        }
        async _createCustomProvider(e10) {
          try {
            return await sY(this.fetch, "POST", `${this.url}/admin/custom-providers`, { body: e10, headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _getCustomProvider(e10) {
          try {
            return await sY(this.fetch, "GET", `${this.url}/admin/custom-providers/${e10}`, { headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _updateCustomProvider(e10, t10) {
          try {
            return await sY(this.fetch, "PUT", `${this.url}/admin/custom-providers/${e10}`, { body: t10, headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _deleteCustomProvider(e10) {
          try {
            return await sY(this.fetch, "DELETE", `${this.url}/admin/custom-providers/${e10}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _adminListPasskeys(e10) {
          sV(e10.userId);
          try {
            return await sY(this.fetch, "GET", `${this.url}/admin/users/${e10.userId}/passkeys`, { headers: this.headers, xform: (e11) => ({ data: e11, error: null }) });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
        async _adminDeletePasskey(e10) {
          sV(e10.userId), sV(e10.passkeyId);
          try {
            return await sY(this.fetch, "DELETE", `${this.url}/admin/users/${e10.userId}/passkeys/${e10.passkeyId}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            throw e11;
          }
        }
      }
      function s8(e10 = {}) {
        return { getItem: (t10) => e10[t10] || null, setItem: (t10, r10) => {
          e10[t10] = r10;
        }, removeItem: (t10) => {
          delete e10[t10];
        } };
      }
      globalThis && sy() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug");
      class s9 extends Error {
        constructor(e10) {
          super(e10), this.isAcquireTimeout = true;
        }
      }
      function s7(e10) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(e10)) throw Error(`@supabase/auth-js: Address "${e10}" is invalid.`);
        return e10.toLowerCase();
      }
      class ie extends Error {
        constructor({ message: e10, code: t10, cause: r10, name: s10 }) {
          var i10;
          super(e10, { cause: r10 }), this.__isWebAuthnError = true, this.name = null !== (i10 = null != s10 ? s10 : r10 instanceof Error ? r10.name : void 0) && void 0 !== i10 ? i10 : "Unknown Error", this.code = t10;
        }
        toJSON() {
          return { name: this.name, message: this.message, code: this.code };
        }
      }
      class it extends ie {
        constructor(e10, t10) {
          super({ code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: t10, message: e10 }), this.name = "WebAuthnUnknownError", this.originalError = t10;
        }
      }
      class ir {
        createNewAbortSignal() {
          if (this.controller) {
            let e11 = Error("Cancelling existing WebAuthn API call for new one");
            e11.name = "AbortError", this.controller.abort(e11);
          }
          let e10 = new AbortController();
          return this.controller = e10, e10.signal;
        }
        cancelCeremony() {
          if (this.controller) {
            let e10 = Error("Manually cancelling existing WebAuthn API call");
            e10.name = "AbortError", this.controller.abort(e10), this.controller = void 0;
          }
        }
      }
      let is = new ir();
      function ii(e10) {
        if (!e10) throw Error("Credential creation options are required");
        if ("undefined" != typeof PublicKeyCredential && "parseCreationOptionsFromJSON" in PublicKeyCredential && "function" == typeof PublicKeyCredential.parseCreationOptionsFromJSON) return PublicKeyCredential.parseCreationOptionsFromJSON(e10);
        let { challenge: t10, user: r10, excludeCredentials: s10 } = e10, i10 = rW(e10, ["challenge", "user", "excludeCredentials"]), n2 = sp(t10).buffer, a2 = Object.assign(Object.assign({}, r10), { id: sp(r10.id).buffer }), o2 = Object.assign(Object.assign({}, i10), { challenge: n2, user: a2 });
        if (s10 && s10.length > 0) {
          o2.excludeCredentials = Array(s10.length);
          for (let e11 = 0; e11 < s10.length; e11++) {
            let t11 = s10[e11];
            o2.excludeCredentials[e11] = Object.assign(Object.assign({}, t11), { id: sp(t11.id).buffer, type: t11.type || "public-key", transports: t11.transports });
          }
        }
        return o2;
      }
      function ia(e10) {
        if (!e10) throw Error("Credential request options are required");
        if ("undefined" != typeof PublicKeyCredential && "parseRequestOptionsFromJSON" in PublicKeyCredential && "function" == typeof PublicKeyCredential.parseRequestOptionsFromJSON) return PublicKeyCredential.parseRequestOptionsFromJSON(e10);
        let { challenge: t10, allowCredentials: r10 } = e10, s10 = rW(e10, ["challenge", "allowCredentials"]), i10 = sp(t10).buffer, n2 = Object.assign(Object.assign({}, s10), { challenge: i10 });
        if (r10 && r10.length > 0) {
          n2.allowCredentials = Array(r10.length);
          for (let e11 = 0; e11 < r10.length; e11++) {
            let t11 = r10[e11];
            n2.allowCredentials[e11] = Object.assign(Object.assign({}, t11), { id: sp(t11.id).buffer, type: t11.type || "public-key", transports: t11.transports });
          }
        }
        return n2;
      }
      function io(e10) {
        var t10;
        return "toJSON" in e10 && "function" == typeof e10.toJSON ? e10.toJSON() : { id: e10.id, rawId: e10.id, response: { attestationObject: sf(new Uint8Array(e10.response.attestationObject)), clientDataJSON: sf(new Uint8Array(e10.response.clientDataJSON)) }, type: "public-key", clientExtensionResults: e10.getClientExtensionResults(), authenticatorAttachment: null !== (t10 = e10.authenticatorAttachment) && void 0 !== t10 ? t10 : void 0 };
      }
      function il(e10) {
        var t10;
        if ("toJSON" in e10 && "function" == typeof e10.toJSON) return e10.toJSON();
        let r10 = e10.getClientExtensionResults(), s10 = e10.response;
        return { id: e10.id, rawId: e10.id, response: { authenticatorData: sf(new Uint8Array(s10.authenticatorData)), clientDataJSON: sf(new Uint8Array(s10.clientDataJSON)), signature: sf(new Uint8Array(s10.signature)), userHandle: s10.userHandle ? sf(new Uint8Array(s10.userHandle)) : void 0 }, type: "public-key", clientExtensionResults: r10, authenticatorAttachment: null !== (t10 = e10.authenticatorAttachment) && void 0 !== t10 ? t10 : void 0 };
      }
      function iu(e10) {
        return "localhost" === e10 || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(e10);
      }
      function ic() {
        var e10, t10;
        return !!(sm() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && "function" == typeof (null === (e10 = null == navigator ? void 0 : navigator.credentials) || void 0 === e10 ? void 0 : e10.create) && "function" == typeof (null === (t10 = null == navigator ? void 0 : navigator.credentials) || void 0 === t10 ? void 0 : t10.get));
      }
      async function ih(e10) {
        try {
          let t10 = await navigator.credentials.create(e10);
          if (!t10) return { data: null, error: new it("Empty credential response", t10) };
          if (!(t10 instanceof PublicKeyCredential)) return { data: null, error: new it("Browser returned unexpected credential type", t10) };
          return { data: t10, error: null };
        } catch (t10) {
          return { data: null, error: function({ error: e11, options: t11 }) {
            var r10, s10, i10;
            let { publicKey: n2 } = t11;
            if (!n2) throw Error("options was missing required publicKey property");
            if ("AbortError" === e11.name) {
              if (t11.signal instanceof AbortSignal) return new ie({ message: "Registration ceremony was sent an abort signal", code: "ERROR_CEREMONY_ABORTED", cause: e11 });
            } else if ("ConstraintError" === e11.name) {
              if ((null === (r10 = n2.authenticatorSelection) || void 0 === r10 ? void 0 : r10.requireResidentKey) === true) return new ie({ message: "Discoverable credentials were required but no available authenticator supported it", code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT", cause: e11 });
              if ("conditional" === t11.mediation && (null === (s10 = n2.authenticatorSelection) || void 0 === s10 ? void 0 : s10.userVerification) === "required") return new ie({ message: "User verification was required during automatic registration but it could not be performed", code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE", cause: e11 });
              if ((null === (i10 = n2.authenticatorSelection) || void 0 === i10 ? void 0 : i10.userVerification) === "required") return new ie({ message: "User verification was required but no available authenticator supported it", code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT", cause: e11 });
            } else if ("InvalidStateError" === e11.name) return new ie({ message: "The authenticator was previously registered", code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED", cause: e11 });
            else if ("NotAllowedError" === e11.name) return new ie({ message: e11.message, code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: e11 });
            else if ("NotSupportedError" === e11.name) return new ie(0 === n2.pubKeyCredParams.filter((e12) => "public-key" === e12.type).length ? { message: 'No entry in pubKeyCredParams was of type "public-key"', code: "ERROR_MALFORMED_PUBKEYCREDPARAMS", cause: e11 } : { message: "No available authenticator supported any of the specified pubKeyCredParams algorithms", code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG", cause: e11 });
            else if ("SecurityError" === e11.name) {
              let t12 = window.location.hostname;
              if (!iu(t12)) return new ie({ message: `${window.location.hostname} is an invalid domain`, code: "ERROR_INVALID_DOMAIN", cause: e11 });
              if (n2.rp.id !== t12) return new ie({ message: `The RP ID "${n2.rp.id}" is invalid for this domain`, code: "ERROR_INVALID_RP_ID", cause: e11 });
            } else if ("TypeError" === e11.name) {
              if (n2.user.id.byteLength < 1 || n2.user.id.byteLength > 64) return new ie({ message: "User ID was not between 1 and 64 characters", code: "ERROR_INVALID_USER_ID_LENGTH", cause: e11 });
            } else if ("UnknownError" === e11.name) return new ie({ message: "The authenticator was unable to process the specified options, or could not create a new credential", code: "ERROR_AUTHENTICATOR_GENERAL_ERROR", cause: e11 });
            return new ie({ message: "a Non-Webauthn related error has occurred", code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: e11 });
          }({ error: t10, options: e10 }) };
        }
      }
      async function id(e10) {
        try {
          let t10 = await navigator.credentials.get(e10);
          if (!t10) return { data: null, error: new it("Empty credential response", t10) };
          if (!(t10 instanceof PublicKeyCredential)) return { data: null, error: new it("Browser returned unexpected credential type", t10) };
          return { data: t10, error: null };
        } catch (t10) {
          return { data: null, error: function({ error: e11, options: t11 }) {
            let { publicKey: r10 } = t11;
            if (!r10) throw Error("options was missing required publicKey property");
            if ("AbortError" === e11.name) {
              if (t11.signal instanceof AbortSignal) return new ie({ message: "Authentication ceremony was sent an abort signal", code: "ERROR_CEREMONY_ABORTED", cause: e11 });
            } else if ("NotAllowedError" === e11.name) return new ie({ message: e11.message, code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: e11 });
            else if ("SecurityError" === e11.name) {
              let t12 = window.location.hostname;
              if (!iu(t12)) return new ie({ message: `${window.location.hostname} is an invalid domain`, code: "ERROR_INVALID_DOMAIN", cause: e11 });
              if (r10.rpId !== t12) return new ie({ message: `The RP ID "${r10.rpId}" is invalid for this domain`, code: "ERROR_INVALID_RP_ID", cause: e11 });
            } else if ("UnknownError" === e11.name) return new ie({ message: "The authenticator was unable to process the specified options, or could not create a new assertion signature", code: "ERROR_AUTHENTICATOR_GENERAL_ERROR", cause: e11 });
            return new ie({ message: "a Non-Webauthn related error has occurred", code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: e11 });
          }({ error: t10, options: e10 }) };
        }
      }
      let ip = { hints: ["security-key"], authenticatorSelection: { authenticatorAttachment: "cross-platform", requireResidentKey: false, userVerification: "preferred", residentKey: "discouraged" }, attestation: "direct" }, ig = { userVerification: "preferred", hints: ["security-key"], attestation: "direct" };
      function im(...e10) {
        let t10 = (e11) => null !== e11 && "object" == typeof e11 && !Array.isArray(e11), r10 = (e11) => e11 instanceof ArrayBuffer || ArrayBuffer.isView(e11), s10 = {};
        for (let i10 of e10) if (i10) for (let e11 in i10) {
          let n2 = i10[e11];
          if (void 0 !== n2) {
            if (Array.isArray(n2)) s10[e11] = n2;
            else if (r10(n2)) s10[e11] = n2;
            else if (t10(n2)) {
              let r11 = s10[e11];
              t10(r11) ? s10[e11] = im(r11, n2) : s10[e11] = im(n2);
            } else s10[e11] = n2;
          }
        }
        return s10;
      }
      class ib {
        constructor(e10) {
          this.client = e10, this.enroll = this._enroll.bind(this), this.challenge = this._challenge.bind(this), this.verify = this._verify.bind(this), this.authenticate = this._authenticate.bind(this), this.register = this._register.bind(this);
        }
        async _enroll(e10) {
          return this.client.mfa.enroll(Object.assign(Object.assign({}, e10), { factorType: "webauthn" }));
        }
        async _challenge({ factorId: e10, webauthn: t10, friendlyName: r10, signal: s10 }, i10) {
          var n2, a2, o2, l2, u2;
          try {
            let { data: c2, error: h2 } = await this.client.mfa.challenge({ factorId: e10, webauthn: t10 });
            if (!c2) return { data: null, error: h2 };
            let d2 = null != s10 ? s10 : is.createNewAbortSignal();
            if ("create" === c2.webauthn.type) {
              let { user: e11 } = c2.webauthn.credential_options.publicKey;
              if (!e11.name) {
                if (r10) e11.name = `${e11.id}:${r10}`;
                else {
                  let t11 = (await this.client.getUser()).data.user, r11 = (null === (n2 = null == t11 ? void 0 : t11.user_metadata) || void 0 === n2 ? void 0 : n2.name) || (null == t11 ? void 0 : t11.email) || (null == t11 ? void 0 : t11.id) || "User";
                  e11.name = `${e11.id}:${r11}`;
                }
              }
              e11.displayName || (e11.displayName = e11.name);
            }
            switch (c2.webauthn.type) {
              case "create": {
                let t11 = (a2 = c2.webauthn.credential_options.publicKey, o2 = null == i10 ? void 0 : i10.create, im(ip, a2, o2 || {})), { data: r11, error: s11 } = await ih({ publicKey: t11, signal: d2 });
                if (r11) return { data: { factorId: e10, challengeId: c2.id, webauthn: { type: c2.webauthn.type, credential_response: r11 } }, error: null };
                return { data: null, error: s11 };
              }
              case "request": {
                let t11 = (l2 = c2.webauthn.credential_options.publicKey, u2 = null == i10 ? void 0 : i10.request, im(ig, l2, u2 || {})), { data: r11, error: s11 } = await id(Object.assign(Object.assign({}, c2.webauthn.credential_options), { publicKey: t11, signal: d2 }));
                if (r11) return { data: { factorId: e10, challengeId: c2.id, webauthn: { type: c2.webauthn.type, credential_response: r11 } }, error: null };
                return { data: null, error: s11 };
              }
            }
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            return { data: null, error: new r2("Unexpected error in challenge", e11) };
          }
        }
        async _verify({ challengeId: e10, factorId: t10, webauthn: r10 }) {
          return this.client.mfa.verify({ factorId: t10, challengeId: e10, webauthn: r10 });
        }
        async _authenticate({ factorId: e10, webauthn: { rpId: t10 = "undefined" != typeof window ? window.location.hostname : void 0, rpOrigins: r10 = "undefined" != typeof window ? [window.location.origin] : void 0, signal: s10 } = {} }, i10) {
          if (!t10) return { data: null, error: new rZ("rpId is required for WebAuthn authentication") };
          try {
            if (!ic()) return { data: null, error: new r2("Browser does not support WebAuthn", null) };
            let { data: n2, error: a2 } = await this.challenge({ factorId: e10, webauthn: { rpId: t10, rpOrigins: r10 }, signal: s10 }, { request: i10 });
            if (!n2) return { data: null, error: a2 };
            let { webauthn: o2 } = n2;
            return this._verify({ factorId: e10, challengeId: n2.challengeId, webauthn: { type: o2.type, rpId: t10, rpOrigins: r10, credential_response: o2.credential_response } });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            return { data: null, error: new r2("Unexpected error in authenticate", e11) };
          }
        }
        async _register({ friendlyName: e10, webauthn: { rpId: t10 = "undefined" != typeof window ? window.location.hostname : void 0, rpOrigins: r10 = "undefined" != typeof window ? [window.location.origin] : void 0, signal: s10 } = {} }, i10) {
          if (!t10) return { data: null, error: new rZ("rpId is required for WebAuthn registration") };
          try {
            if (!ic()) return { data: null, error: new r2("Browser does not support WebAuthn", null) };
            let { data: n2, error: a2 } = await this._enroll({ friendlyName: e10 });
            if (!n2) return await this.client.mfa.listFactors().then((t11) => {
              var r11;
              return null === (r11 = t11.data) || void 0 === r11 ? void 0 : r11.all.find((t12) => "webauthn" === t12.factor_type && t12.friendly_name === e10 && "unverified" === t12.status);
            }).then((e11) => e11 ? this.client.mfa.unenroll({ factorId: null == e11 ? void 0 : e11.id }) : void 0), { data: null, error: a2 };
            let { data: o2, error: l2 } = await this._challenge({ factorId: n2.id, friendlyName: n2.friendly_name, webauthn: { rpId: t10, rpOrigins: r10 }, signal: s10 }, { create: i10 });
            if (!o2) return { data: null, error: l2 };
            return this._verify({ factorId: n2.id, challengeId: o2.challengeId, webauthn: { rpId: t10, rpOrigins: r10, type: o2.webauthn.type, credential_response: o2.webauthn.credential_response } });
          } catch (e11) {
            if (rQ(e11)) return { data: null, error: e11 };
            return { data: null, error: new r2("Unexpected error in register", e11) };
          }
        }
      }
      !function() {
        if ("object" != typeof globalThis) try {
          Object.defineProperty(Object.prototype, "__magic__", { get: function() {
            return this;
          }, configurable: true }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
        } catch (e10) {
          "undefined" != typeof self && (self.globalThis = self);
        }
      }();
      let iy = { url: "http://localhost:9999", storageKey: "supabase.auth.token", autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, headers: rK, flowType: "implicit", debug: false, hasCustomAuthorizationHeader: false, throwOnError: false, lockAcquireTimeout: 5e3, skipAutoInitialize: false, experimental: {} }, iw = {}, iv = false;
      class i_ {
        get jwks() {
          var e10, t10;
          return null !== (t10 = null === (e10 = iw[this.storageKey]) || void 0 === e10 ? void 0 : e10.jwks) && void 0 !== t10 ? t10 : { keys: [] };
        }
        set jwks(e10) {
          iw[this.storageKey] = Object.assign(Object.assign({}, iw[this.storageKey]), { jwks: e10 });
        }
        get jwks_cached_at() {
          var e10, t10;
          return null !== (t10 = null === (e10 = iw[this.storageKey]) || void 0 === e10 ? void 0 : e10.cachedAt) && void 0 !== t10 ? t10 : Number.MIN_SAFE_INTEGER;
        }
        set jwks_cached_at(e10) {
          iw[this.storageKey] = Object.assign(Object.assign({}, iw[this.storageKey]), { cachedAt: e10 });
        }
        constructor(e10) {
          var t10, r10, s10;
          this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.autoRefreshTickTimeout = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.lastRefreshFailure = null, this._sessionRemovalEpoch = 0, this.initializePromise = null, this._pendingInitNotifications = null, this.detectSessionInUrl = true, this.hasCustomAuthorizationHeader = false, this.suppressGetSessionWarning = false, this.lock = null, this.lockAcquired = false, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log;
          let i10 = Object.assign(Object.assign({}, iy), e10);
          if (this.storageKey = i10.storageKey, this.instanceID = null !== (t10 = i_.nextInstanceID[this.storageKey]) && void 0 !== t10 ? t10 : 0, i_.nextInstanceID[this.storageKey] = this.instanceID + 1, this.logDebugMessages = !!i10.debug, "function" == typeof i10.debug && (this.logger = i10.debug), this.instanceID > 0 && sm()) {
            let e11 = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
            console.warn(e11), this.logDebugMessages && console.trace(e11);
          }
          if (this.persistSession = i10.persistSession, this.autoRefreshToken = i10.autoRefreshToken, this.experimental = null !== (r10 = i10.experimental) && void 0 !== r10 ? r10 : {}, this.admin = new s6({ url: i10.url, headers: i10.headers, fetch: i10.fetch, experimental: this.experimental }), this.url = i10.url, this.headers = i10.headers, this.fetch = sv(i10.fetch), this.detectSessionInUrl = i10.detectSessionInUrl, this.flowType = i10.flowType, this.hasCustomAuthorizationHeader = i10.hasCustomAuthorizationHeader, this.throwOnError = i10.throwOnError, this.lockAcquireTimeout = i10.lockAcquireTimeout, null == i10.lock || (this.lock = i10.lock, iv || (iv = true, console.warn(`${this._logPrefix()} The "lock" option is deprecated and will be removed in v3. The client now coordinates session refreshes without a lock, so most apps can drop the option. See https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/migrations/lockless-coordination.md`))), this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = { verify: this._verify.bind(this), enroll: this._enroll.bind(this), unenroll: this._unenroll.bind(this), challenge: this._challenge.bind(this), listFactors: this._listFactors.bind(this), challengeAndVerify: this._challengeAndVerify.bind(this), getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this), webauthn: new ib(this), recoveryCodes: { getStatus: this._getRecoveryCodesStatus.bind(this), generate: this._generateRecoveryCodes.bind(this), verify: this._verifyRecoveryCode.bind(this), regenerate: this._regenerateRecoveryCodes.bind(this), unenroll: this._unenrollRecoveryCodes.bind(this) } }, this.oauth = { getAuthorizationDetails: this._getAuthorizationDetails.bind(this), approveAuthorization: this._approveAuthorization.bind(this), denyAuthorization: this._denyAuthorization.bind(this), listGrants: this._listOAuthGrants.bind(this), revokeGrant: this._revokeOAuthGrant.bind(this) }, this.passkey = { startRegistration: this._startPasskeyRegistration.bind(this), verifyRegistration: this._verifyPasskeyRegistration.bind(this), startAuthentication: this._startPasskeyAuthentication.bind(this), verifyAuthentication: this._verifyPasskeyAuthentication.bind(this), list: this._listPasskeys.bind(this), update: this._updatePasskey.bind(this), delete: this._deletePasskey.bind(this) }, this.persistSession ? (i10.storage ? this.storage = i10.storage : sy() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = s8(this.memoryStorage)), i10.userStorage && (this.userStorage = i10.userStorage)) : (this.memoryStorage = {}, this.storage = s8(this.memoryStorage)), sm() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
              this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            } catch (e11) {
              console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e11);
            }
            null === (s10 = this.broadcastChannel) || void 0 === s10 || s10.addEventListener("message", async (e11) => {
              this._debug("received broadcast notification from other tab or client", e11), ("TOKEN_REFRESHED" === e11.data.event || "SIGNED_IN" === e11.data.event) && (this.lastRefreshFailure = null);
              try {
                await this._notifyAllSubscribers(e11.data.event, e11.data.session, false);
              } catch (e12) {
                this._debug("#broadcastChannel", "error", e12);
              }
            });
          }
          i10.skipAutoInitialize || this.initialize().catch((e11) => {
            this._debug("#initialize()", "error", e11);
          });
        }
        isThrowOnErrorEnabled() {
          return this.throwOnError;
        }
        _returnResult(e10) {
          if (this.throwOnError && e10 && e10.error) throw e10.error;
          return e10;
        }
        _logPrefix() {
          return `GoTrueClient@${this.storageKey}:${this.instanceID} (${rG}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
        }
        _debug(...e10) {
          return this.logDebugMessages && this.logger(this._logPrefix(), ...e10), this;
        }
        async initialize() {
          var e10;
          if (this.initializePromise) return await this.initializePromise;
          this._pendingInitNotifications = [], this.initializePromise = (async () => null != this.lock ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._initialize()) : await this._initialize())();
          let t10 = await this.initializePromise, r10 = null !== (e10 = this._pendingInitNotifications) && void 0 !== e10 ? e10 : [];
          for (let e11 of (this._pendingInitNotifications = null, r10)) await this._notifyAllSubscribers(e11.event, e11.session, e11.broadcast);
          return t10;
        }
        async _initialize() {
          var e10;
          try {
            let t10 = {}, r10 = "none";
            if (sm() && (t10 = sw(window.location.href), this._isImplicitGrantCallback(t10) ? r10 = "implicit" : await this._isPKCECallback(t10) && (r10 = "pkce")), sm() && this.detectSessionInUrl && "none" !== r10) {
              let { data: s10, error: i10 } = await this._getSessionFromURL(t10, r10);
              if (i10) return this._debug("#_initialize()", "error detecting session from URL", i10), rQ(i10) && "AuthImplicitGrantRedirectError" === i10.name && (null === (e10 = i10.details) || void 0 === e10 || e10.code), { error: i10 };
              let { session: n2, redirectType: a2 } = s10;
              return this._debug("#_initialize()", "detected session in URL", n2, "redirect type", a2), await this._saveSession(n2), setTimeout(async () => {
                "recovery" === a2 ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", n2) : await this._notifyAllSubscribers("SIGNED_IN", n2);
              }, 0), { error: null };
            }
            return await this._recoverAndRefresh(), { error: null };
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ error: e11 });
            return this._returnResult({ error: new r2("Unexpected error during initialization", e11) });
          } finally {
            await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
          }
        }
        async signInAnonymously(e10) {
          var t10, r10, s10;
          try {
            let { data: i10, error: n2 } = await sY(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { data: null !== (r10 = null === (t10 = null == e10 ? void 0 : e10.options) || void 0 === t10 ? void 0 : t10.data) && void 0 !== r10 ? r10 : {}, gotrue_meta_security: { captcha_token: null === (s10 = null == e10 ? void 0 : e10.options) || void 0 === s10 ? void 0 : s10.captchaToken } }, xform: sQ });
            if (n2 || !i10) return this._returnResult({ data: { user: null, session: null }, error: n2 });
            let a2 = i10.session, o2 = i10.user;
            return i10.session && (await this._saveSession(i10.session), await this._notifyAllSubscribers("SIGNED_IN", a2)), this._returnResult({ data: { user: o2, session: a2 }, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signUp(e10) {
          var t10, r10, s10;
          let i10 = null;
          try {
            let n2;
            if ("email" in e10) {
              let { email: r11, password: s11, options: a3 } = e10, o3 = null, l3 = null;
              "pkce" === this.flowType && ([o3, l3, i10] = await this._getCodeChallengeAndMethod()), n2 = await sY(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, redirectTo: this._maybeAppendFlowIdToRedirect(null == a3 ? void 0 : a3.emailRedirectTo, i10), body: { email: r11, password: s11, data: null !== (t10 = null == a3 ? void 0 : a3.data) && void 0 !== t10 ? t10 : {}, gotrue_meta_security: { captcha_token: null == a3 ? void 0 : a3.captchaToken }, code_challenge: o3, code_challenge_method: l3 }, xform: sQ });
            } else if ("phone" in e10) {
              let { phone: t11, password: i11, options: a3 } = e10;
              n2 = await sY(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { phone: t11, password: i11, data: null !== (r10 = null == a3 ? void 0 : a3.data) && void 0 !== r10 ? r10 : {}, channel: null !== (s10 = null == a3 ? void 0 : a3.channel) && void 0 !== s10 ? s10 : "sms", gotrue_meta_security: { captcha_token: null == a3 ? void 0 : a3.captchaToken } }, xform: sQ });
            } else throw new r8("You must provide either an email or phone number and a password");
            let { data: a2, error: o2 } = n2;
            if (o2 || !a2) return await sU(this.storage, this.storageKey, i10), this._returnResult({ data: { user: null, session: null }, error: o2 });
            let l2 = a2.session, u2 = a2.user;
            return a2.session && (await this._saveSession(a2.session), await this._notifyAllSubscribers("SIGNED_IN", l2)), this._returnResult({ data: { user: u2, session: l2 }, error: null });
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, i10), rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithPassword(e10) {
          try {
            let t10;
            if ("email" in e10) {
              let { email: r11, password: s11, options: i10 } = e10;
              t10 = await sY(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { email: r11, password: s11, gotrue_meta_security: { captcha_token: null == i10 ? void 0 : i10.captchaToken } }, xform: s0 });
            } else if ("phone" in e10) {
              let { phone: r11, password: s11, options: i10 } = e10;
              t10 = await sY(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { phone: r11, password: s11, gotrue_meta_security: { captcha_token: null == i10 ? void 0 : i10.captchaToken } }, xform: s0 });
            } else throw new r8("You must provide either an email or phone number and a password");
            let { data: r10, error: s10 } = t10;
            if (s10) return this._returnResult({ data: { user: null, session: null }, error: s10 });
            if (!r10 || !r10.session || !r10.user) {
              let e11 = new r6();
              return this._returnResult({ data: { user: null, session: null }, error: e11 });
            }
            return r10.session && (await this._saveSession(r10.session), await this._notifyAllSubscribers("SIGNED_IN", r10.session)), this._returnResult({ data: Object.assign({ user: r10.user, session: r10.session }, r10.weak_password ? { weakPassword: r10.weak_password } : null), error: s10 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithOAuth(e10) {
          var t10, r10, s10, i10;
          return await this._handleProviderSignIn(e10.provider, { redirectTo: null === (t10 = e10.options) || void 0 === t10 ? void 0 : t10.redirectTo, scopes: null === (r10 = e10.options) || void 0 === r10 ? void 0 : r10.scopes, queryParams: null === (s10 = e10.options) || void 0 === s10 ? void 0 : s10.queryParams, skipBrowserRedirect: null === (i10 = e10.options) || void 0 === i10 ? void 0 : i10.skipBrowserRedirect });
        }
        async exchangeCodeForSession(e10, t10) {
          return (await this.initializePromise, null != this.lock) ? this._acquireLock(this.lockAcquireTimeout, async () => this._exchangeCodeForSession(e10, t10)) : this._exchangeCodeForSession(e10, t10);
        }
        async signInWithWeb3(e10) {
          let { chain: t10 } = e10;
          switch (t10) {
            case "ethereum":
              return await this.signInWithEthereum(e10);
            case "solana":
              return await this.signInWithSolana(e10);
            default:
              throw Error(`@supabase/auth-js: Unsupported chain "${t10}"`);
          }
        }
        async signInWithEthereum(e10) {
          var t10, r10, s10, i10, n2, a2, o2, l2, u2, c2, h2, d2;
          let p2, f2;
          if ("message" in e10) p2 = e10.message, f2 = e10.signature;
          else {
            let c3;
            let { chain: h3, wallet: g2, statement: m2, options: b2 } = e10;
            if (sm()) {
              if ("object" == typeof g2) c3 = g2;
              else {
                let e11 = window;
                if ("ethereum" in e11 && "object" == typeof e11.ethereum && "request" in e11.ethereum && "function" == typeof e11.ethereum.request) c3 = e11.ethereum;
                else throw Error("@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.");
              }
            } else {
              if ("object" != typeof g2 || !(null == b2 ? void 0 : b2.url)) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
              c3 = g2;
            }
            let y2 = new URL(null !== (t10 = null == b2 ? void 0 : b2.url) && void 0 !== t10 ? t10 : window.location.href), w2 = await c3.request({ method: "eth_requestAccounts" }).then((e11) => e11).catch(() => {
              throw Error("@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid");
            });
            if (!w2 || 0 === w2.length) throw Error("@supabase/auth-js: No accounts available. Please ensure the wallet is connected.");
            let v2 = s7(w2[0]), _2 = null === (r10 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === r10 ? void 0 : r10.chainId;
            _2 || (_2 = parseInt(await c3.request({ method: "eth_chainId" }), 16)), p2 = function(e11) {
              var t11;
              let { chainId: r11, domain: s11, expirationTime: i11, issuedAt: n3 = /* @__PURE__ */ new Date(), nonce: a3, notBefore: o3, requestId: l3, resources: u3, scheme: c4, uri: h4, version: d3 } = e11;
              if (!Number.isInteger(r11)) throw Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${r11}`);
              if (!s11) throw Error('@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.');
              if (a3 && a3.length < 8) throw Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${a3}`);
              if (!h4) throw Error('@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.');
              if ("1" !== d3) throw Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${d3}`);
              if (null === (t11 = e11.statement) || void 0 === t11 ? void 0 : t11.includes("\n")) throw Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${e11.statement}`);
              let p3 = s7(e11.address), f3 = c4 ? `${c4}://${s11}` : s11, g3 = e11.statement ? `${e11.statement}
` : "", m3 = `${f3} wants you to sign in with your Ethereum account:
${p3}

${g3}`, b3 = `URI: ${h4}
Version: ${d3}
Chain ID: ${r11}${a3 ? `
Nonce: ${a3}` : ""}
Issued At: ${n3.toISOString()}`;
              if (i11 && (b3 += `
Expiration Time: ${i11.toISOString()}`), o3 && (b3 += `
Not Before: ${o3.toISOString()}`), l3 && (b3 += `
Request ID: ${l3}`), u3) {
                let e12 = "\nResources:";
                for (let t12 of u3) {
                  if (!t12 || "string" != typeof t12) throw Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${t12}`);
                  e12 += `
- ${t12}`;
                }
                b3 += e12;
              }
              return `${m3}
${b3}`;
            }({ domain: y2.host, address: v2, statement: m2, uri: y2.href, version: "1", chainId: _2, nonce: null === (s10 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === s10 ? void 0 : s10.nonce, issuedAt: null !== (n2 = null === (i10 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === i10 ? void 0 : i10.issuedAt) && void 0 !== n2 ? n2 : /* @__PURE__ */ new Date(), expirationTime: null === (a2 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === a2 ? void 0 : a2.expirationTime, notBefore: null === (o2 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === o2 ? void 0 : o2.notBefore, requestId: null === (l2 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === l2 ? void 0 : l2.requestId, resources: null === (u2 = null == b2 ? void 0 : b2.signInWithEthereum) || void 0 === u2 ? void 0 : u2.resources }), f2 = await c3.request({ method: "personal_sign", params: [(d2 = p2, "0x" + Array.from(new TextEncoder().encode(d2), (e11) => e11.toString(16).padStart(2, "0")).join("")), v2] });
          }
          try {
            let { data: t11, error: r11 } = await sY(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "ethereum", message: p2, signature: f2 }, (null === (c2 = e10.options) || void 0 === c2 ? void 0 : c2.captchaToken) ? { gotrue_meta_security: { captcha_token: null === (h2 = e10.options) || void 0 === h2 ? void 0 : h2.captchaToken } } : null), xform: sQ });
            if (r11) throw r11;
            if (!t11 || !t11.session || !t11.user) {
              let e11 = new r6();
              return this._returnResult({ data: { user: null, session: null }, error: e11 });
            }
            return t11.session && (await this._saveSession(t11.session), await this._notifyAllSubscribers("SIGNED_IN", t11.session)), this._returnResult({ data: Object.assign({}, t11), error: r11 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithSolana(e10) {
          var t10, r10, s10, i10, n2, a2, o2, l2, u2, c2, h2, d2;
          let p2, f2;
          if ("message" in e10) p2 = e10.message, f2 = e10.signature;
          else {
            let h3;
            let { chain: d3, wallet: g2, statement: m2, options: b2 } = e10;
            if (sm()) {
              if ("object" == typeof g2) h3 = g2;
              else {
                let e11 = window;
                if ("solana" in e11 && "object" == typeof e11.solana && ("signIn" in e11.solana && "function" == typeof e11.solana.signIn || "signMessage" in e11.solana && "function" == typeof e11.solana.signMessage)) h3 = e11.solana;
                else throw Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
              }
            } else {
              if ("object" != typeof g2 || !(null == b2 ? void 0 : b2.url)) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
              h3 = g2;
            }
            let y2 = new URL(null !== (t10 = null == b2 ? void 0 : b2.url) && void 0 !== t10 ? t10 : window.location.href);
            if ("signIn" in h3 && h3.signIn) {
              let e11;
              let t11 = await h3.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, null == b2 ? void 0 : b2.signInWithSolana), { version: "1", domain: y2.host, uri: y2.href }), m2 ? { statement: m2 } : null));
              if (Array.isArray(t11) && t11[0] && "object" == typeof t11[0]) e11 = t11[0];
              else if (t11 && "object" == typeof t11 && "signedMessage" in t11 && "signature" in t11) e11 = t11;
              else throw Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
              if ("signedMessage" in e11 && "signature" in e11 && ("string" == typeof e11.signedMessage || e11.signedMessage instanceof Uint8Array) && e11.signature instanceof Uint8Array) p2 = "string" == typeof e11.signedMessage ? e11.signedMessage : new TextDecoder().decode(e11.signedMessage), f2 = e11.signature;
              else throw Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
            } else {
              if (!("signMessage" in h3) || "function" != typeof h3.signMessage || !("publicKey" in h3) || "object" != typeof h3 || !h3.publicKey || !("toBase58" in h3.publicKey) || "function" != typeof h3.publicKey.toBase58) throw Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
              p2 = [`${y2.host} wants you to sign in with your Solana account:`, h3.publicKey.toBase58(), ...m2 ? ["", m2, ""] : [""], "Version: 1", `URI: ${y2.href}`, `Issued At: ${null !== (s10 = null === (r10 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === r10 ? void 0 : r10.issuedAt) && void 0 !== s10 ? s10 : (/* @__PURE__ */ new Date()).toISOString()}`, ...(null === (i10 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === i10 ? void 0 : i10.notBefore) ? [`Not Before: ${b2.signInWithSolana.notBefore}`] : [], ...(null === (n2 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === n2 ? void 0 : n2.expirationTime) ? [`Expiration Time: ${b2.signInWithSolana.expirationTime}`] : [], ...(null === (a2 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === a2 ? void 0 : a2.chainId) ? [`Chain ID: ${b2.signInWithSolana.chainId}`] : [], ...(null === (o2 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === o2 ? void 0 : o2.nonce) ? [`Nonce: ${b2.signInWithSolana.nonce}`] : [], ...(null === (l2 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === l2 ? void 0 : l2.requestId) ? [`Request ID: ${b2.signInWithSolana.requestId}`] : [], ...(null === (c2 = null === (u2 = null == b2 ? void 0 : b2.signInWithSolana) || void 0 === u2 ? void 0 : u2.resources) || void 0 === c2 ? void 0 : c2.length) ? ["Resources", ...b2.signInWithSolana.resources.map((e12) => `- ${e12}`)] : []].join("\n");
              let e11 = await h3.signMessage(new TextEncoder().encode(p2), "utf8");
              if (!e11 || !(e11 instanceof Uint8Array)) throw Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
              f2 = e11;
            }
          }
          try {
            let { data: t11, error: r11 } = await sY(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "solana", message: p2, signature: sf(f2) }, (null === (h2 = e10.options) || void 0 === h2 ? void 0 : h2.captchaToken) ? { gotrue_meta_security: { captcha_token: null === (d2 = e10.options) || void 0 === d2 ? void 0 : d2.captchaToken } } : null), xform: sQ });
            if (r11) throw r11;
            if (!t11 || !t11.session || !t11.user) {
              let e11 = new r6();
              return this._returnResult({ data: { user: null, session: null }, error: e11 });
            }
            return t11.session && (await this._saveSession(t11.session), await this._notifyAllSubscribers("SIGNED_IN", t11.session)), this._returnResult({ data: Object.assign({}, t11), error: r11 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async _exchangeCodeForSession(e10, t10) {
          let r10 = (null == t10 ? void 0 : t10.flowId) != null, s10 = r10 ? sI(null == t10 ? void 0 : t10.flowId) : sm() ? sI(sw(window.location.href)[rY]) : null;
          r10 && !s10 && this._debug("#_exchangeCodeForSession()", "provided flowId is not a valid flow id", null == t10 ? void 0 : t10.flowId);
          let { verifier: i10, flowId: n2 } = r10 && !s10 ? { verifier: null, flowId: null } : await sD(this.storage, this.storageKey, s10), [a2, o2] = (null != i10 ? i10 : "").split("/");
          try {
            if (!a2 && "pkce" === this.flowType) throw new se();
            let { data: t11, error: r11 } = await sY(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, { headers: this.headers, body: { auth_code: e10, code_verifier: a2 }, xform: sQ });
            if (await sU(this.storage, this.storageKey, n2), r11) throw r11;
            if (!t11 || !t11.session || !t11.user) {
              let e11 = new r6();
              return this._returnResult({ data: { user: null, session: null, redirectType: null }, error: e11 });
            }
            return t11.session && (await this._saveSession(t11.session), await this._notifyAllSubscribers("recovery" === o2 ? "PASSWORD_RECOVERY" : "SIGNED_IN", t11.session)), this._returnResult({ data: Object.assign(Object.assign({}, t11), { redirectType: null != o2 ? o2 : null }), error: r11 });
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, n2), rQ(e11)) return this._returnResult({ data: { user: null, session: null, redirectType: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithIdToken(e10) {
          try {
            let { options: t10, provider: r10, token: s10, access_token: i10, nonce: n2 } = e10, { data: a2, error: o2 } = await sY(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, body: { provider: r10, id_token: s10, access_token: i10, nonce: n2, gotrue_meta_security: { captcha_token: null == t10 ? void 0 : t10.captchaToken } }, xform: sQ });
            if (o2) return this._returnResult({ data: { user: null, session: null }, error: o2 });
            if (!a2 || !a2.session || !a2.user) {
              let e11 = new r6();
              return this._returnResult({ data: { user: null, session: null }, error: e11 });
            }
            return a2.session && (await this._saveSession(a2.session), await this._notifyAllSubscribers("SIGNED_IN", a2.session)), this._returnResult({ data: a2, error: o2 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithOtp(e10) {
          var t10, r10, s10, i10, n2;
          let a2 = null;
          try {
            if ("email" in e10) {
              let { email: s11, options: i11 } = e10, n3 = null, o2 = null;
              "pkce" === this.flowType && ([n3, o2, a2] = await this._getCodeChallengeAndMethod());
              let { error: l2 } = await sY(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { email: s11, data: null !== (t10 = null == i11 ? void 0 : i11.data) && void 0 !== t10 ? t10 : {}, create_user: null === (r10 = null == i11 ? void 0 : i11.shouldCreateUser) || void 0 === r10 || r10, gotrue_meta_security: { captcha_token: null == i11 ? void 0 : i11.captchaToken }, code_challenge: n3, code_challenge_method: o2 }, redirectTo: this._maybeAppendFlowIdToRedirect(null == i11 ? void 0 : i11.emailRedirectTo, a2) });
              return this._returnResult({ data: { user: null, session: null }, error: l2 });
            }
            if ("phone" in e10) {
              let { phone: t11, options: r11 } = e10, { data: a3, error: o2 } = await sY(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { phone: t11, data: null !== (s10 = null == r11 ? void 0 : r11.data) && void 0 !== s10 ? s10 : {}, create_user: null === (i10 = null == r11 ? void 0 : r11.shouldCreateUser) || void 0 === i10 || i10, gotrue_meta_security: { captcha_token: null == r11 ? void 0 : r11.captchaToken }, channel: null !== (n2 = null == r11 ? void 0 : r11.channel) && void 0 !== n2 ? n2 : "sms" } });
              return this._returnResult({ data: { user: null, session: null, messageId: null == a3 ? void 0 : a3.message_id }, error: o2 });
            }
            throw new r8("You must provide either an email or phone number.");
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, a2), rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async verifyOtp(e10) {
          var t10, r10;
          try {
            let s10, i10;
            "options" in e10 && (s10 = null === (t10 = e10.options) || void 0 === t10 ? void 0 : t10.redirectTo, i10 = null === (r10 = e10.options) || void 0 === r10 ? void 0 : r10.captchaToken);
            let { data: n2, error: a2 } = await sY(this.fetch, "POST", `${this.url}/verify`, { headers: this.headers, body: Object.assign(Object.assign({}, e10), { gotrue_meta_security: { captcha_token: i10 } }), redirectTo: s10, xform: sQ });
            if (a2) throw a2;
            if (!n2) throw Error("An error occurred on token verification.");
            let o2 = n2.session, l2 = n2.user;
            return (null == o2 ? void 0 : o2.access_token) && (await this._saveSession(o2), await this._notifyAllSubscribers("recovery" == e10.type ? "PASSWORD_RECOVERY" : "SIGNED_IN", o2)), this._returnResult({ data: { user: l2, session: o2 }, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async signInWithSSO(e10) {
          var t10, r10, s10, i10;
          let n2 = null;
          try {
            let a2 = null, o2 = null;
            "pkce" === this.flowType && ([a2, o2, n2] = await this._getCodeChallengeAndMethod());
            let l2 = await sY(this.fetch, "POST", `${this.url}/sso`, { body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e10 ? { provider_id: e10.providerId } : null), "domain" in e10 ? { domain: e10.domain } : null), { redirect_to: this._maybeAppendFlowIdToRedirect(null === (t10 = e10.options) || void 0 === t10 ? void 0 : t10.redirectTo, n2) }), (null === (r10 = null == e10 ? void 0 : e10.options) || void 0 === r10 ? void 0 : r10.captchaToken) ? { gotrue_meta_security: { captcha_token: e10.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: a2, code_challenge_method: o2 }), headers: this.headers, xform: s2 });
            return (null === (s10 = l2.data) || void 0 === s10 ? void 0 : s10.url) && sm() && !(null === (i10 = e10.options) || void 0 === i10 ? void 0 : i10.skipBrowserRedirect) && window.location.assign(l2.data.url), this._returnResult(l2);
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, n2), rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async reauthenticate() {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._reauthenticate()) : await this._reauthenticate();
        }
        async _reauthenticate() {
          try {
            return await this._useSession(async (e10) => {
              let { data: { session: t10 }, error: r10 } = e10;
              if (r10) throw r10;
              if (!t10) throw new r4();
              let { error: s10 } = await sY(this.fetch, "GET", `${this.url}/reauthenticate`, { headers: this.headers, jwt: t10.access_token });
              return this._returnResult({ data: { user: null, session: null }, error: s10 });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: { user: null, session: null }, error: e10 });
            throw e10;
          }
        }
        async resend(e10) {
          let t10 = null;
          try {
            let r10 = `${this.url}/resend`;
            if ("email" in e10) {
              let { email: s10, type: i10, options: n2 } = e10, a2 = null, o2 = null;
              "pkce" === this.flowType && ([a2, o2, t10] = await this._getCodeChallengeAndMethod());
              let { error: l2 } = await sY(this.fetch, "POST", r10, { headers: this.headers, body: { email: s10, type: i10, gotrue_meta_security: { captcha_token: null == n2 ? void 0 : n2.captchaToken }, code_challenge: a2, code_challenge_method: o2 }, redirectTo: this._maybeAppendFlowIdToRedirect(null == n2 ? void 0 : n2.emailRedirectTo, t10) });
              return l2 && await sU(this.storage, this.storageKey, t10), this._returnResult({ data: { user: null, session: null }, error: l2 });
            }
            if ("phone" in e10) {
              let { phone: t11, type: s10, options: i10 } = e10, { data: n2, error: a2 } = await sY(this.fetch, "POST", r10, { headers: this.headers, body: { phone: t11, type: s10, gotrue_meta_security: { captcha_token: null == i10 ? void 0 : i10.captchaToken } } });
              return this._returnResult({ data: { user: null, session: null, messageId: null == n2 ? void 0 : n2.message_id }, error: a2 });
            }
            throw new r8("You must provide either an email or phone number and a type");
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, t10), rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async getSession() {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => this._useSession(async (e10) => e10)) : await this._useSession(async (e10) => e10);
        }
        async _acquireLock(e10, t10) {
          this._debug("#_acquireLock", "begin", e10);
          try {
            if (this.lockAcquired) {
              let e11 = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), r10 = (async () => (await e11, await t10()))();
              return this.pendingInLock.push((async () => {
                try {
                  await r10;
                } catch (e12) {
                }
              })()), r10;
            }
            return await this.lock(`lock:${this.storageKey}`, e10, async () => {
              this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
              try {
                this.lockAcquired = true;
                let e11 = t10();
                for (this.pendingInLock.push((async () => {
                  try {
                    await e11;
                  } catch (e12) {
                  }
                })()), await e11; this.pendingInLock.length; ) {
                  let e12 = [...this.pendingInLock];
                  await Promise.all(e12), this.pendingInLock.splice(0, e12.length);
                }
                return await e11;
              } finally {
                this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = false;
              }
            });
          } finally {
            this._debug("#_acquireLock", "end");
          }
        }
        async _useSession(e10) {
          this._debug("#_useSession", "begin");
          try {
            let t10 = await this.__loadSession();
            return await e10(t10);
          } finally {
            this._debug("#_useSession", "end");
          }
        }
        async __loadSession() {
          this._debug("#__loadSession()", "begin"), null == this.lock || this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", Error().stack);
          try {
            let e10 = null, t10 = await sS(this.storage, this.storageKey);
            if (this._debug("#getSession()", "session from storage", t10), null !== t10 && (this._isValidSession(t10) ? e10 = t10 : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e10) return { data: { session: null }, error: null };
            let r10 = !!e10.expires_at && 1e3 * e10.expires_at - Date.now() < 9e4;
            if (this._debug("#__loadSession()", `session has${r10 ? "" : " not"} expired`, "expires_at", e10.expires_at), !r10) return { data: { session: await this._hydrateSessionUser(e10) }, error: null };
            let { data: s10, error: i10 } = await this._callRefreshToken(e10.refresh_token);
            if (i10) {
              let e11 = await sS(this.storage, this.storageKey);
              if (e11 && this._isValidSession(e11) && e11.expires_at && 1e3 * e11.expires_at > Date.now()) return this._returnResult({ data: { session: await this._hydrateSessionUser(e11) }, error: null });
              return this._returnResult({ data: { session: null }, error: i10 });
            }
            return this._returnResult({ data: { session: s10 }, error: null });
          } finally {
            this._debug("#__loadSession()", "end");
          }
        }
        async _hydrateSessionUser(e10) {
          if (this.userStorage) {
            let t10 = await sS(this.userStorage, this.storageKey + "-user");
            e10.user = (null == t10 ? void 0 : t10.user) ? t10.user : sW();
          }
          if (this.storage.isServer && e10.user && !e10.user.__isUserNotAvailableProxy) {
            let t10 = { value: this.suppressGetSessionWarning };
            e10.user = new Proxy(e10.user, { get: (e11, r10, s10) => {
              if ("__isInsecureUserWarningProxy" === r10) return true;
              if ("symbol" == typeof r10) {
                let t11 = r10.toString();
                if ("Symbol(Symbol.toPrimitive)" === t11 || "Symbol(Symbol.toStringTag)" === t11 || "Symbol(util.inspect.custom)" === t11 || "Symbol(nodejs.util.inspect.custom)" === t11) return Reflect.get(e11, r10, s10);
              }
              return t10.value || "string" != typeof r10 || (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), t10.value = true), Reflect.get(e11, r10, s10);
            } }), t10.value && (this.suppressGetSessionWarning = true);
          }
          return e10;
        }
        async getUser(e10) {
          let t10;
          return e10 ? await this._getUser(e10) : (await this.initializePromise, (t10 = null != this.lock ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._getUser()) : await this._getUser()).data.user && (this.suppressGetSessionWarning = true), t10);
        }
        async _getUser(e10) {
          try {
            if (e10) return await sY(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: e10, xform: s1 });
            return await this._useSession(async (e11) => {
              var t10, r10, s10;
              let { data: i10, error: n2 } = e11;
              if (n2) throw n2;
              return (null === (t10 = i10.session) || void 0 === t10 ? void 0 : t10.access_token) || this.hasCustomAuthorizationHeader ? await sY(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: null !== (s10 = null === (r10 = i10.session) || void 0 === r10 ? void 0 : r10.access_token) && void 0 !== s10 ? s10 : void 0, xform: s1 }) : { data: { user: null }, error: new r4() };
            });
          } catch (e11) {
            if (rQ(e11)) return r5(e11) && await this._removeSession(), this._returnResult({ data: { user: null }, error: e11 });
            throw e11;
          }
        }
        async updateUser(e10, t10 = {}) {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._updateUser(e10, t10)) : await this._updateUser(e10, t10);
        }
        async _updateUser(e10, t10 = {}) {
          let r10 = null;
          try {
            return await this._useSession(async (s10) => {
              let { data: i10, error: n2 } = s10;
              if (n2) throw n2;
              if (!i10.session) throw new r4();
              let a2 = i10.session, o2 = null, l2 = null;
              "pkce" === this.flowType && null != e10.email && ([o2, l2, r10] = await this._getCodeChallengeAndMethod());
              let { data: u2, error: c2 } = await sY(this.fetch, "PUT", `${this.url}/user`, { headers: this.headers, redirectTo: this._maybeAppendFlowIdToRedirect(null == t10 ? void 0 : t10.emailRedirectTo, r10), body: Object.assign(Object.assign({}, e10), { code_challenge: o2, code_challenge_method: l2 }), jwt: a2.access_token, xform: s1 });
              if (c2) throw c2;
              return a2.user = u2.user, await this._saveSession(a2), await this._notifyAllSubscribers("USER_UPDATED", a2), this._returnResult({ data: { user: a2.user }, error: null });
            });
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, r10), rQ(e11)) return this._returnResult({ data: { user: null }, error: e11 });
            throw e11;
          }
        }
        async setSession(e10) {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._setSession(e10)) : await this._setSession(e10);
        }
        async _setSession(e10) {
          try {
            if (!e10.access_token || !e10.refresh_token) throw new r4();
            let t10 = Date.now() / 1e3, r10 = t10, s10 = true, i10 = null, { payload: n2 } = sR(e10.access_token);
            if (n2.exp && (s10 = (r10 = n2.exp) <= t10), s10) {
              let { data: t11, error: r11 } = await this._callRefreshToken(e10.refresh_token);
              if (r11) return this._returnResult({ data: { user: null, session: null }, error: r11 });
              if (!t11) return { data: { user: null, session: null }, error: null };
              i10 = t11;
            } else {
              let { data: s11, error: n3 } = await this._getUser(e10.access_token);
              if (n3) return this._returnResult({ data: { user: null, session: null }, error: n3 });
              i10 = { access_token: e10.access_token, refresh_token: e10.refresh_token, user: s11.user, token_type: "bearer", expires_in: r10 - t10, expires_at: r10 }, await this._saveSession(i10), await this._notifyAllSubscribers("SIGNED_IN", i10);
            }
            return this._returnResult({ data: { user: i10.user, session: i10 }, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { session: null, user: null }, error: e11 });
            throw e11;
          }
        }
        async refreshSession(e10) {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._refreshSession(e10)) : await this._refreshSession(e10);
        }
        async _refreshSession(e10) {
          try {
            return await this._useSession(async (t10) => {
              var r10;
              if (!e10) {
                let { data: s11, error: i11 } = t10;
                if (i11) throw i11;
                e10 = null !== (r10 = s11.session) && void 0 !== r10 ? r10 : void 0;
              }
              if (!(null == e10 ? void 0 : e10.refresh_token)) throw new r4();
              let { data: s10, error: i10 } = await this._callRefreshToken(e10.refresh_token);
              return i10 ? this._returnResult({ data: { user: null, session: null }, error: i10 }) : s10 ? this._returnResult({ data: { user: s10.user, session: s10 }, error: null }) : this._returnResult({ data: { user: null, session: null }, error: null });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
            throw e11;
          }
        }
        async _getSessionFromURL(e10, t10) {
          var r10;
          try {
            if (!sm()) throw new r9("No browser detected.");
            if (e10.error || e10.error_description || e10.error_code) throw new r9(e10.error_description || "Error in URL with unspecified error_description", { error: e10.error || "unspecified_error", code: e10.error_code || "unspecified_code" });
            switch (t10) {
              case "implicit":
                if ("pkce" === this.flowType) throw new r7("Not a valid PKCE flow url.");
                break;
              case "pkce":
                if ("implicit" === this.flowType) throw new r9("Not a valid implicit grant flow url.");
            }
            if ("pkce" === t10) {
              if (this._debug("#_initialize()", "begin", "is PKCE flow", true), !e10.code) throw new r7("No code detected.");
              let { data: t11, error: s11 } = await this._exchangeCodeForSession(e10.code, { flowId: e10[rY] });
              if (s11) throw s11;
              let i11 = new URL(window.location.href);
              return i11.searchParams.delete("code"), i11.searchParams.delete(rY), window.history.replaceState(window.history.state, "", i11.toString()), { data: { session: t11.session, redirectType: null !== (r10 = t11.redirectType) && void 0 !== r10 ? r10 : null }, error: null };
            }
            let { provider_token: s10, provider_refresh_token: i10, access_token: n2, refresh_token: a2, expires_in: o2, expires_at: l2, token_type: u2 } = e10;
            if (!n2 || !o2 || !a2 || !u2) throw new r9("No session defined in URL");
            let c2 = Math.round(Date.now() / 1e3), h2 = parseInt(o2), d2 = c2 + h2;
            l2 && (d2 = parseInt(l2));
            let p2 = d2 - c2;
            1e3 * p2 <= 3e4 && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${p2}s, should have been closer to ${h2}s`);
            let f2 = d2 - h2;
            c2 - f2 >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", f2, d2, c2) : c2 - f2 < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", f2, d2, c2);
            let { data: g2, error: m2 } = await this._getUser(n2);
            if (m2) throw m2;
            let b2 = { provider_token: s10, provider_refresh_token: i10, access_token: n2, expires_in: h2, expires_at: d2, refresh_token: a2, token_type: u2, user: g2.user };
            return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), this._returnResult({ data: { session: b2, redirectType: e10.type }, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: { session: null, redirectType: null }, error: e11 });
            throw e11;
          }
        }
        _isImplicitGrantCallback(e10) {
          return "function" == typeof this.detectSessionInUrl ? this.detectSessionInUrl(new URL(window.location.href), e10) : !!(e10.access_token || e10.error || e10.error_description || e10.error_code);
        }
        async _isPKCECallback(e10) {
          if (!e10.code) return false;
          let t10 = sI(e10[rY]);
          return !!(t10 && await sS(this.storage, sj(this.storageKey, t10))) || !!await sS(this.storage, `${this.storageKey}-code-verifier`);
        }
        async signOut(e10 = { scope: "global" }) {
          return (await this.initializePromise, null != this.lock) ? await this._acquireLock(this.lockAcquireTimeout, async () => await this._signOut(e10)) : await this._signOut(e10);
        }
        async _signOut({ scope: e10 } = { scope: "global" }) {
          return await this._useSession(async (t10) => {
            var r10;
            let s10 = async () => {
              await this._removeSession();
            }, { data: i10, error: n2 } = t10;
            if (n2 && !r5(n2)) return this._returnResult({ error: n2 });
            let a2 = null === (r10 = i10.session) || void 0 === r10 ? void 0 : r10.access_token;
            if (a2) {
              let { error: t11 } = await this.admin.signOut(a2, e10);
              if (t11 && !(r1(t11) && (404 === t11.status || 401 === t11.status || 403 === t11.status) || r5(t11))) return "others" !== e10 && await s10(), this._returnResult({ error: t11 });
            }
            return "others" !== e10 && await s10(), this._returnResult({ error: null });
          });
        }
        onAuthStateChange(e10) {
          let t10 = Symbol("auth-callback"), r10 = { id: t10, callback: e10, unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", t10), this.stateChangeEmitters.delete(t10);
          } };
          return this._debug("#onAuthStateChange()", "registered callback with id", t10), this.stateChangeEmitters.set(t10, r10), (async () => {
            await this.initializePromise, null != this.lock ? await this._acquireLock(this.lockAcquireTimeout, async () => {
              this._emitInitialSession(t10);
            }) : await this._emitInitialSession(t10);
          })(), { data: { subscription: r10 } };
        }
        async _emitInitialSession(e10) {
          return await this._useSession(async (t10) => {
            var r10, s10;
            try {
              let { data: { session: s11 }, error: i10 } = t10;
              if (i10) throw i10;
              await (null === (r10 = this.stateChangeEmitters.get(e10)) || void 0 === r10 ? void 0 : r10.callback("INITIAL_SESSION", s11)), this._debug("INITIAL_SESSION", "callback id", e10, "session", s11);
            } catch (t11) {
              if (await (null === (s10 = this.stateChangeEmitters.get(e10)) || void 0 === s10 ? void 0 : s10.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", e10, "error", t11), si(t11)) return;
              r5(t11) || sr(t11) || r1(t11) && ("refresh_token_not_found" === t11.code || "refresh_token_already_used" === t11.code || "session_expired" === t11.code) ? console.warn(t11) : console.error(t11);
            }
          });
        }
        async resetPasswordForEmail(e10, t10 = {}) {
          let r10 = null, s10 = null, i10 = null;
          "pkce" === this.flowType && ([r10, s10, i10] = await this._getCodeChallengeAndMethod(true));
          try {
            return await sY(this.fetch, "POST", `${this.url}/recover`, { body: { email: e10, code_challenge: r10, code_challenge_method: s10, gotrue_meta_security: { captcha_token: t10.captchaToken } }, headers: this.headers, redirectTo: this._maybeAppendFlowIdToRedirect(t10.redirectTo, i10) });
          } catch (e11) {
            if (await sU(this.storage, this.storageKey, i10), rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async getUserIdentities() {
          var e10;
          try {
            let { data: t10, error: r10 } = await this.getUser();
            if (r10) throw r10;
            return this._returnResult({ data: { identities: null !== (e10 = t10.user.identities) && void 0 !== e10 ? e10 : [] }, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async linkIdentity(e10) {
          return "token" in e10 ? this.linkIdentityIdToken(e10) : this.linkIdentityOAuth(e10);
        }
        async linkIdentityOAuth(e10) {
          var t10;
          let r10 = null;
          try {
            let { data: s10, error: i10 } = await this._useSession(async (t11) => {
              var s11, i11, n2, a2, o2;
              let { data: l2, error: u2 } = t11;
              if (u2) throw u2;
              let { url: c2, flowId: h2 } = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e10.provider, { redirectTo: null === (s11 = e10.options) || void 0 === s11 ? void 0 : s11.redirectTo, scopes: null === (i11 = e10.options) || void 0 === i11 ? void 0 : i11.scopes, queryParams: null === (n2 = e10.options) || void 0 === n2 ? void 0 : n2.queryParams, skipBrowserRedirect: true });
              return r10 = h2, await sY(this.fetch, "GET", c2, { headers: this.headers, jwt: null !== (o2 = null === (a2 = l2.session) || void 0 === a2 ? void 0 : a2.access_token) && void 0 !== o2 ? o2 : void 0 });
            });
            if (i10) throw i10;
            return !sm() || (null === (t10 = e10.options) || void 0 === t10 ? void 0 : t10.skipBrowserRedirect) || window.location.assign(null == s10 ? void 0 : s10.url), this._returnResult({ data: { provider: e10.provider, url: null == s10 ? void 0 : s10.url, flowId: r10 }, error: null });
          } catch (t11) {
            if (rQ(t11)) return this._returnResult({ data: { provider: e10.provider, url: null, flowId: r10 }, error: t11 });
            throw t11;
          }
        }
        async linkIdentityIdToken(e10) {
          return await this._useSession(async (t10) => {
            var r10;
            try {
              let { error: s10, data: { session: i10 } } = t10;
              if (s10) throw s10;
              let { options: n2, provider: a2, token: o2, access_token: l2, nonce: u2 } = e10, { data: c2, error: h2 } = await sY(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, jwt: null !== (r10 = null == i10 ? void 0 : i10.access_token) && void 0 !== r10 ? r10 : void 0, body: { provider: a2, id_token: o2, access_token: l2, nonce: u2, link_identity: true, gotrue_meta_security: { captcha_token: null == n2 ? void 0 : n2.captchaToken } }, xform: sQ });
              if (h2) return this._returnResult({ data: { user: null, session: null }, error: h2 });
              if (!c2 || !c2.session || !c2.user) return this._returnResult({ data: { user: null, session: null }, error: new r6() });
              return c2.session && (await this._saveSession(c2.session), await this._notifyAllSubscribers("USER_UPDATED", c2.session)), this._returnResult({ data: c2, error: h2 });
            } catch (e11) {
              if (await sU(this.storage, this.storageKey, null), rQ(e11)) return this._returnResult({ data: { user: null, session: null }, error: e11 });
              throw e11;
            }
          });
        }
        async unlinkIdentity(e10) {
          try {
            return await this._useSession(async (t10) => {
              var r10, s10;
              let { data: i10, error: n2 } = t10;
              if (n2) throw n2;
              return await sY(this.fetch, "DELETE", `${this.url}/user/identities/${e10.identity_id}`, { headers: this.headers, jwt: null !== (s10 = null === (r10 = i10.session) || void 0 === r10 ? void 0 : r10.access_token) && void 0 !== s10 ? s10 : void 0 });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _refreshAccessToken(e10) {
          let t10 = "#_refreshAccessToken()";
          this._debug(t10, "begin");
          try {
            var r10, s10;
            let i10 = Date.now();
            return await (r10 = async (r11) => (r11 > 0 && await sO(200 * Math.pow(2, r11 - 1)), this._debug(t10, "refreshing attempt", r11), await sY(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, { body: { refresh_token: e10 }, headers: this.headers, xform: sQ })), s10 = (e11, t11) => t11 && sr(t11) && Date.now() + 200 * Math.pow(2, e11) - i10 < 3e4, new Promise((e11, t11) => {
              (async () => {
                for (let i11 = 0; i11 < 1 / 0; i11++) try {
                  let t12 = await r10(i11);
                  if (!s10(i11, null, t12)) {
                    e11(t12);
                    return;
                  }
                } catch (e12) {
                  if (!s10(i11, e12)) {
                    t11(e12);
                    return;
                  }
                }
              })();
            }));
          } catch (e11) {
            if (this._debug(t10, "error", e11), rQ(e11)) return this._returnResult({ data: { session: null, user: null }, error: e11 });
            throw e11;
          } finally {
            this._debug(t10, "end");
          }
        }
        _isValidSession(e10) {
          return "object" == typeof e10 && null !== e10 && "access_token" in e10 && "refresh_token" in e10 && "expires_at" in e10;
        }
        async _handleProviderSignIn(e10, t10) {
          let { url: r10, flowId: s10 } = await this._getUrlForProvider(`${this.url}/authorize`, e10, { redirectTo: t10.redirectTo, scopes: t10.scopes, queryParams: t10.queryParams });
          return this._debug("#_handleProviderSignIn()", "provider", e10, "options", t10, "url", r10), sm() && !t10.skipBrowserRedirect && window.location.assign(r10), { data: { provider: e10, url: r10, flowId: s10 }, error: null };
        }
        async _recoverAndRefresh() {
          var e10, t10;
          let r10 = "#_recoverAndRefresh()";
          this._debug(r10, "begin");
          try {
            let s10 = await sS(this.storage, this.storageKey);
            if (s10 && this.userStorage) {
              let t11 = await sS(this.userStorage, this.storageKey + "-user");
              !this.storage.isServer && Object.is(this.storage, this.userStorage) && !t11 && (t11 = { user: s10.user }, await sk(this.userStorage, this.storageKey + "-user", t11)), s10.user = null !== (e10 = null == t11 ? void 0 : t11.user) && void 0 !== e10 ? e10 : sW();
            } else if (s10 && !s10.user && !s10.user) {
              let e11 = await sS(this.storage, this.storageKey + "-user");
              e11 && (null == e11 ? void 0 : e11.user) ? (s10.user = e11.user, await sT(this.storage, this.storageKey + "-user"), await sk(this.storage, this.storageKey, s10)) : s10.user = sW();
            }
            if (this._debug(r10, "session from storage", s10), !this._isValidSession(s10)) {
              this._debug(r10, "session is not valid"), null !== s10 && await this._removeSession();
              return;
            }
            let i10 = (null !== (t10 = s10.expires_at) && void 0 !== t10 ? t10 : 1 / 0) * 1e3 - Date.now() < 9e4;
            if (this._debug(r10, `session has${i10 ? "" : " not"} expired with margin of 90000s`), i10) {
              if (this.autoRefreshToken && s10.refresh_token) {
                let { error: e11 } = await this._callRefreshToken(s10.refresh_token);
                e11 && (si(e11) ? this._debug(r10, "refresh discarded by commit guard", e11) : this._debug(r10, "refresh failed", e11));
              }
            } else if (s10.user && true === s10.user.__isUserNotAvailableProxy) try {
              let { data: e11, error: t11 } = await this._getUser(s10.access_token);
              !t11 && (null == e11 ? void 0 : e11.user) ? (s10.user = e11.user, await this._saveSession(s10), await this._notifyAllSubscribers("SIGNED_IN", s10)) : this._debug(r10, "could not get user data, skipping SIGNED_IN notification");
            } catch (e11) {
              console.error("Error getting user data:", e11), this._debug(r10, "error getting user data, skipping SIGNED_IN notification", e11);
            }
            else await this._notifyAllSubscribers("SIGNED_IN", s10);
          } catch (e11) {
            this._debug(r10, "error", e11), sr(e11) ? console.warn(e11) : console.error(e11);
            return;
          } finally {
            this._debug(r10, "end");
          }
        }
        async _callRefreshToken(e10) {
          var t10, r10;
          if (!e10) throw new r4();
          if (this.refreshingDeferred) return this.refreshingDeferred.promise;
          if (this.lastRefreshFailure && this.lastRefreshFailure.refreshToken === e10 && Date.now() < this.lastRefreshFailure.expiresAt) return this._debug("#_callRefreshToken()", "returning cached failure (cooldown active)"), this.lastRefreshFailure.result;
          let s10 = "#_callRefreshToken()";
          this._debug(s10, "begin");
          try {
            this.refreshingDeferred = new sE(), this.refreshingDeferred.promise.then(void 0, () => {
            });
            let t11 = await sS(this.storage, this.storageKey), { data: r11, error: i10 } = await this._refreshAccessToken(e10);
            if (i10) throw i10;
            if (!r11.session) throw new r4();
            let n2 = await sS(this.storage, this.storageKey);
            if (null !== t11 && (null === n2 || n2.refresh_token !== t11.refresh_token)) {
              this._debug(s10, "commit guard: storage changed since refresh started, discarding rotated tokens", { startedWith: "present", nowHolds: n2 ? "replaced" : "cleared" });
              let e11 = { data: null, error: new ss() };
              return this.refreshingDeferred.resolve(e11), e11;
            }
            let a2 = this._sessionRemovalEpoch;
            if (await this._saveSession(r11.session), this._sessionRemovalEpoch !== a2) {
              this._debug(s10, "commit guard (post-save): _removeSession ran during _saveSession, undoing write"), await sT(this.storage, this.storageKey), this.userStorage && await sT(this.userStorage, this.storageKey + "-user");
              let e11 = { data: null, error: new ss() };
              return this.refreshingDeferred.resolve(e11), e11;
            }
            await this._notifyAllSubscribers("TOKEN_REFRESHED", r11.session);
            let o2 = { data: r11.session, error: null };
            return this.lastRefreshFailure = null, this.refreshingDeferred.resolve(o2), o2;
          } catch (i10) {
            if (this._debug(s10, "error", i10), rQ(i10)) {
              let r11 = { data: null, error: i10 };
              if (!sr(i10)) {
                let e11 = await sS(this.storage, this.storageKey);
                (null == e11 ? void 0 : e11.expires_at) && 1e3 * e11.expires_at > Date.now() ? this._debug(s10, "proactive refresh failed, access token still valid \u2014 preserving session") : await this._removeSession();
              }
              return this.lastRefreshFailure = { refreshToken: e10, result: r11, expiresAt: Date.now() + 6e4 }, null === (t10 = this.refreshingDeferred) || void 0 === t10 || t10.resolve(r11), r11;
            }
            throw null === (r10 = this.refreshingDeferred) || void 0 === r10 || r10.reject(i10), i10;
          } finally {
            this.refreshingDeferred = null, this._debug(s10, "end");
          }
        }
        async _notifyAllSubscribers(e10, t10, r10 = true) {
          if (null !== this._pendingInitNotifications && r10) {
            this._pendingInitNotifications.push({ event: e10, session: t10, broadcast: r10 });
            return;
          }
          let s10 = `#_notifyAllSubscribers(${e10})`;
          this._debug(s10, "begin", t10, `broadcast = ${r10}`);
          try {
            this.broadcastChannel && r10 && this.broadcastChannel.postMessage({ event: e10, session: t10 });
            let s11 = [], i10 = Array.from(this.stateChangeEmitters.values()).map(async (r11) => {
              try {
                await r11.callback(e10, t10);
              } catch (e11) {
                s11.push(e11);
              }
            });
            if (await Promise.all(i10), s11.length > 0) {
              for (let e11 = 0; e11 < s11.length; e11 += 1) console.error(s11[e11]);
              throw s11[0];
            }
          } finally {
            this._debug(s10, "end");
          }
        }
        async _saveSession(e10) {
          this._debug("#_saveSession()", e10), this.suppressGetSessionWarning = true;
          let t10 = Object.assign({}, e10), r10 = t10.user && true === t10.user.__isUserNotAvailableProxy;
          if (this.userStorage) {
            !r10 && t10.user && await sk(this.userStorage, this.storageKey + "-user", { user: t10.user });
            let e11 = Object.assign({}, t10);
            delete e11.user;
            let s10 = sG(e11);
            await sk(this.storage, this.storageKey, s10);
          } else {
            let e11 = sG(t10);
            await sk(this.storage, this.storageKey, e11);
          }
        }
        async _removeSession() {
          this._sessionRemovalEpoch += 1, this._debug("#_removeSession()"), this.lastRefreshFailure = null, this.suppressGetSessionWarning = false, await sT(this.storage, this.storageKey), await sM(this.storage, this.storageKey), await sT(this.storage, this.storageKey + "-user"), this.userStorage && await sT(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
        }
        _removeVisibilityChangedCallback() {
          this._debug("#_removeVisibilityChangedCallback()");
          let e10 = this.visibilityChangedCallback;
          this.visibilityChangedCallback = null;
          try {
            e10 && sm() && (null == window ? void 0 : window.removeEventListener) && window.removeEventListener("visibilitychange", e10);
          } catch (e11) {
            console.error("removing visibilitychange callback failed", e11);
          }
        }
        async _startAutoRefresh() {
          await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
          let e10 = setInterval(() => this._autoRefreshTokenTick(), 3e4);
          this.autoRefreshTicker = e10, e10 && "object" == typeof e10 && "function" == typeof e10.unref ? e10.unref() : "undefined" != typeof Deno && "function" == typeof Deno.unrefTimer && Deno.unrefTimer(e10);
          let t10 = setTimeout(async () => {
            await this.initializePromise, await this._autoRefreshTokenTick();
          }, 0);
          this.autoRefreshTickTimeout = t10, t10 && "object" == typeof t10 && "function" == typeof t10.unref ? t10.unref() : "undefined" != typeof Deno && "function" == typeof Deno.unrefTimer && Deno.unrefTimer(t10);
        }
        async _stopAutoRefresh() {
          this._debug("#_stopAutoRefresh()");
          let e10 = this.autoRefreshTicker;
          this.autoRefreshTicker = null, e10 && clearInterval(e10);
          let t10 = this.autoRefreshTickTimeout;
          this.autoRefreshTickTimeout = null, t10 && clearTimeout(t10);
        }
        async startAutoRefresh() {
          this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
        }
        async stopAutoRefresh() {
          this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
        }
        async dispose() {
          var e10;
          this._removeVisibilityChangedCallback(), await this._stopAutoRefresh(), null === (e10 = this.broadcastChannel) || void 0 === e10 || e10.close(), this.broadcastChannel = null, this.stateChangeEmitters.clear();
        }
        async _autoRefreshTokenTick() {
          if (this._debug("#_autoRefreshTokenTick()", "begin"), null != this.lock) {
            try {
              await this._acquireLock(0, async () => {
                try {
                  let e10 = Date.now();
                  try {
                    return await this._useSession(async (t10) => {
                      let { data: { session: r10 } } = t10;
                      if (!r10 || !r10.refresh_token || !r10.expires_at) {
                        this._debug("#_autoRefreshTokenTick()", "no session");
                        return;
                      }
                      let s10 = Math.floor((1e3 * r10.expires_at - e10) / 3e4);
                      this._debug("#_autoRefreshTokenTick()", `access token expires in ${s10} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`), s10 <= 3 && await this._callRefreshToken(r10.refresh_token);
                    });
                  } catch (e11) {
                    console.error("Auto refresh tick failed with error. This is likely a transient error.", e11);
                  }
                } finally {
                  this._debug("#_autoRefreshTokenTick()", "end");
                }
              });
            } catch (e10) {
              if (e10 instanceof s9) this._debug("auto refresh token tick lock not available");
              else throw e10;
            }
            return;
          }
          if (null !== this.refreshingDeferred) {
            this._debug("#_autoRefreshTokenTick()", "refresh already in flight, skipping");
            return;
          }
          try {
            let e10 = Date.now();
            try {
              await this._useSession(async (t10) => {
                let { data: { session: r10 } } = t10;
                if (!r10 || !r10.refresh_token || !r10.expires_at) {
                  this._debug("#_autoRefreshTokenTick()", "no session");
                  return;
                }
                let s10 = Math.floor((1e3 * r10.expires_at - e10) / 3e4);
                this._debug("#_autoRefreshTokenTick()", `access token expires in ${s10} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`), s10 <= 3 && await this._callRefreshToken(r10.refresh_token);
              });
            } catch (e11) {
              console.error("Auto refresh tick failed with error. This is likely a transient error.", e11);
            }
          } finally {
            this._debug("#_autoRefreshTokenTick()", "end");
          }
        }
        async _handleVisibilityChange() {
          if (this._debug("#_handleVisibilityChange()"), !sm() || !(null == window ? void 0 : window.addEventListener)) return this.autoRefreshToken && this.startAutoRefresh(), false;
          try {
            this.visibilityChangedCallback = async () => {
              try {
                await this._onVisibilityChanged(false);
              } catch (e10) {
                this._debug("#visibilityChangedCallback", "error", e10);
              }
            }, null == window || window.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(true);
          } catch (e10) {
            console.error("_handleVisibilityChange", e10);
          }
        }
        async _onVisibilityChanged(e10) {
          let t10 = `#_onVisibilityChanged(${e10})`;
          if (this._debug(t10, "visibilityState", document.visibilityState), "visible" === document.visibilityState) {
            if (this.autoRefreshToken && this._startAutoRefresh(), !e10) {
              if (await this.initializePromise, null != this.lock) await this._acquireLock(this.lockAcquireTimeout, async () => {
                if ("visible" !== document.visibilityState) {
                  this._debug(t10, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
                  return;
                }
                await this._recoverAndRefresh();
              });
              else {
                if ("visible" !== document.visibilityState) {
                  this._debug(t10, "visibilityState is no longer visible, skipping recovery");
                  return;
                }
                await this._recoverAndRefresh();
              }
            }
          } else "hidden" === document.visibilityState && this.autoRefreshToken && this._stopAutoRefresh();
        }
        async _getUrlForProvider(e10, t10, r10) {
          let s10 = null == r10 ? void 0 : r10.redirectTo, i10 = null, n2 = null, a2 = null;
          "pkce" === this.flowType && ([i10, n2, a2] = await this._getCodeChallengeAndMethod(), s10 = this._maybeAppendFlowIdToRedirect(s10, a2));
          let o2 = [`provider=${encodeURIComponent(t10)}`];
          if (s10 && o2.push(`redirect_to=${encodeURIComponent(s10)}`), (null == r10 ? void 0 : r10.scopes) && o2.push(`scopes=${encodeURIComponent(r10.scopes)}`), null != i10 && null != n2) {
            let e11 = new URLSearchParams({ code_challenge: `${encodeURIComponent(i10)}`, code_challenge_method: `${encodeURIComponent(n2)}` });
            o2.push(e11.toString());
          }
          if (null == r10 ? void 0 : r10.queryParams) {
            let e11 = new URLSearchParams(r10.queryParams);
            o2.push(e11.toString());
          }
          return (null == r10 ? void 0 : r10.skipBrowserRedirect) && o2.push(`skip_http_redirect=${r10.skipBrowserRedirect}`), { url: `${e10}?${o2.join("&")}`, flowId: a2 };
        }
        _maybeAppendFlowIdToRedirect(e10, t10) {
          return e10 && t10 && this.experimental.appendPkceFlowIdToRedirects ? function(e11, t11) {
            let r10 = e11.indexOf("#"), s10 = -1 === r10 ? e11 : e11.slice(0, r10), i10 = -1 === r10 ? "" : e11.slice(r10), n2 = s10.indexOf("?");
            if (-1 !== n2) {
              let e12 = s10.slice(0, n2), t12 = s10.slice(n2 + 1).split("&").filter((e13) => "" !== e13 && e13 !== rY && !e13.startsWith(`${rY}=`));
              s10 = t12.length > 0 ? `${e12}?${t12.join("&")}` : e12;
            }
            let a2 = s10.includes("?") ? "&" : "?";
            return `${s10}${a2}${rY}=${encodeURIComponent(t11)}${i10}`;
          }(e10, t10) : null != e10 ? e10 : void 0;
        }
        async _getCodeChallengeAndMethod(e10 = false) {
          return sB(this.storage, this.storageKey, e10, (e11) => this._debug("#_getCodeChallengeAndMethod()", "evicted oldest pending PKCE verifier slot", e11));
        }
        async _unenroll(e10) {
          try {
            return await this._useSession(async (t10) => {
              var r10;
              let { data: s10, error: i10 } = t10;
              return i10 ? this._returnResult({ data: null, error: i10 }) : await sY(this.fetch, "DELETE", `${this.url}/factors/${e10.factorId}`, { headers: this.headers, jwt: null === (r10 = null == s10 ? void 0 : s10.session) || void 0 === r10 ? void 0 : r10.access_token });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _enroll(e10) {
          try {
            return await this._useSession(async (t10) => {
              var r10, s10;
              let { data: i10, error: n2 } = t10;
              if (n2) return this._returnResult({ data: null, error: n2 });
              let a2 = Object.assign({ friendly_name: e10.friendlyName, factor_type: e10.factorType }, "phone" === e10.factorType ? { phone: e10.phone } : "totp" === e10.factorType ? { issuer: e10.issuer } : {}), { data: o2, error: l2 } = await sY(this.fetch, "POST", `${this.url}/factors`, { body: a2, headers: this.headers, jwt: null === (r10 = null == i10 ? void 0 : i10.session) || void 0 === r10 ? void 0 : r10.access_token });
              return l2 ? this._returnResult({ data: null, error: l2 }) : ("totp" === e10.factorType && "totp" === o2.type && (null === (s10 = null == o2 ? void 0 : o2.totp) || void 0 === s10 ? void 0 : s10.qr_code) && (o2.totp.qr_code = `data:image/svg+xml;utf-8,${o2.totp.qr_code}`), this._returnResult({ data: o2, error: null }));
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _verify(e10) {
          let t10 = async () => {
            try {
              return await this._useSession(async (t11) => {
                var r10;
                let { data: s10, error: i10 } = t11;
                if (i10) return this._returnResult({ data: null, error: i10 });
                let n2 = Object.assign({ challenge_id: e10.challengeId }, "webauthn" in e10 ? { webauthn: Object.assign(Object.assign({}, e10.webauthn), { credential_response: "create" === e10.webauthn.type ? io(e10.webauthn.credential_response) : il(e10.webauthn.credential_response) }) } : { code: e10.code }), { data: a2, error: o2 } = await sY(this.fetch, "POST", `${this.url}/factors/${e10.factorId}/verify`, { body: n2, headers: this.headers, jwt: null === (r10 = null == s10 ? void 0 : s10.session) || void 0 === r10 ? void 0 : r10.access_token });
                return o2 ? this._returnResult({ data: null, error: o2 }) : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + a2.expires_in }, a2)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", a2), this._returnResult({ data: a2, error: o2 }));
              });
            } catch (e11) {
              if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
              throw e11;
            }
          };
          return null != this.lock ? this._acquireLock(this.lockAcquireTimeout, t10) : t10();
        }
        async _challenge(e10) {
          let t10 = async () => {
            try {
              return await this._useSession(async (t11) => {
                var r10;
                let { data: s10, error: i10 } = t11;
                if (i10) return this._returnResult({ data: null, error: i10 });
                let n2 = await sY(this.fetch, "POST", `${this.url}/factors/${e10.factorId}/challenge`, { body: e10, headers: this.headers, jwt: null === (r10 = null == s10 ? void 0 : s10.session) || void 0 === r10 ? void 0 : r10.access_token });
                if (n2.error) return n2;
                let { data: a2 } = n2;
                if ("webauthn" !== a2.type) return { data: a2, error: null };
                switch (a2.webauthn.type) {
                  case "create":
                    return { data: Object.assign(Object.assign({}, a2), { webauthn: Object.assign(Object.assign({}, a2.webauthn), { credential_options: Object.assign(Object.assign({}, a2.webauthn.credential_options), { publicKey: ii(a2.webauthn.credential_options.publicKey) }) }) }), error: null };
                  case "request":
                    return { data: Object.assign(Object.assign({}, a2), { webauthn: Object.assign(Object.assign({}, a2.webauthn), { credential_options: Object.assign(Object.assign({}, a2.webauthn.credential_options), { publicKey: ia(a2.webauthn.credential_options.publicKey) }) }) }), error: null };
                }
              });
            } catch (e11) {
              if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
              throw e11;
            }
          };
          return null != this.lock ? this._acquireLock(this.lockAcquireTimeout, t10) : t10();
        }
        async _challengeAndVerify(e10) {
          let { data: t10, error: r10 } = await this._challenge({ factorId: e10.factorId });
          return r10 ? this._returnResult({ data: null, error: r10 }) : await this._verify({ factorId: e10.factorId, challengeId: t10.id, code: e10.code });
        }
        async _listFactors() {
          var e10;
          let { data: { user: t10 }, error: r10 } = await this.getUser();
          if (r10) return { data: null, error: r10 };
          let s10 = { all: [], phone: [], totp: [], webauthn: [], recovery_code: [] };
          for (let r11 of null !== (e10 = null == t10 ? void 0 : t10.factors) && void 0 !== e10 ? e10 : []) s10.all.push(r11), "verified" === r11.status && r11.factor_type in s10 && Array.isArray(s10[r11.factor_type]) && s10[r11.factor_type].push(r11);
          return { data: s10, error: null };
        }
        async _getAuthenticatorAssuranceLevel(e10) {
          var t10, r10, s10, i10;
          if (e10) try {
            let { payload: s11 } = sR(e10), i11 = null;
            s11.aal && (i11 = s11.aal);
            let n3 = i11, { data: { user: a3 }, error: o3 } = await this.getUser(e10);
            if (o3) return this._returnResult({ data: null, error: o3 });
            (null !== (r10 = null === (t10 = null == a3 ? void 0 : a3.factors) || void 0 === t10 ? void 0 : t10.filter((e11) => "verified" === e11.status)) && void 0 !== r10 ? r10 : []).length > 0 && (n3 = "aal2");
            let l3 = s11.amr || [];
            return { data: { currentLevel: i11, nextLevel: n3, currentAuthenticationMethods: l3 }, error: null };
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
          let { data: { session: n2 }, error: a2 } = await this.getSession();
          if (a2) return this._returnResult({ data: null, error: a2 });
          if (!n2) return { data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] }, error: null };
          let { payload: o2 } = sR(n2.access_token), l2 = null;
          o2.aal && (l2 = o2.aal);
          let u2 = l2;
          return (null !== (i10 = null === (s10 = n2.user.factors) || void 0 === s10 ? void 0 : s10.filter((e11) => "verified" === e11.status)) && void 0 !== i10 ? i10 : []).length > 0 && (u2 = "aal2"), { data: { currentLevel: l2, nextLevel: u2, currentAuthenticationMethods: o2.amr || [] }, error: null };
        }
        async _getRecoveryCodesStatus() {
          sF(this.experimental);
          try {
            return await this._useSession(async (e10) => {
              var t10;
              let { data: r10, error: s10 } = e10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              let { data: i10, error: n2 } = await sY(this.fetch, "GET", `${this.url}/factors/recovery-codes`, { headers: this.headers, jwt: null === (t10 = null == r10 ? void 0 : r10.session) || void 0 === t10 ? void 0 : t10.access_token });
              return n2 ? this._returnResult({ data: null, error: n2 }) : this._returnResult({ data: i10, error: null });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _generateRecoveryCodes(e10) {
          sF(this.experimental);
          try {
            return await this._useSession(async (t10) => {
              var r10;
              let { data: s10, error: i10 } = t10;
              if (i10) return this._returnResult({ data: null, error: i10 });
              let { data: n2, error: a2 } = await sY(this.fetch, "POST", `${this.url}/factors/recovery-codes`, { body: (null == e10 ? void 0 : e10.friendlyName) ? { friendly_name: e10.friendlyName } : void 0, headers: this.headers, jwt: null === (r10 = null == s10 ? void 0 : s10.session) || void 0 === r10 ? void 0 : r10.access_token });
              return a2 ? this._returnResult({ data: null, error: a2 }) : this._returnResult({ data: n2, error: null });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _verifyRecoveryCode(e10) {
          sF(this.experimental);
          let t10 = async () => {
            try {
              return await this._useSession(async (t11) => {
                var r10;
                let { data: s10, error: i10 } = t11;
                if (i10) return this._returnResult({ data: null, error: i10 });
                let { data: n2, error: a2 } = await sY(this.fetch, "POST", `${this.url}/factors/recovery-codes/verify`, { body: { code: e10.code }, headers: this.headers, jwt: null === (r10 = null == s10 ? void 0 : s10.session) || void 0 === r10 ? void 0 : r10.access_token });
                if (a2) return this._returnResult({ data: null, error: a2 });
                let o2 = Object.assign({ expires_at: sg(n2.expires_in) }, n2);
                return await this._saveSession(o2), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", o2), this._returnResult({ data: n2, error: null });
              });
            } catch (e11) {
              if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
              throw e11;
            }
          };
          return null != this.lock ? this._acquireLock(this.lockAcquireTimeout, t10) : t10();
        }
        async _regenerateRecoveryCodes() {
          sF(this.experimental);
          try {
            return await this._useSession(async (e10) => {
              var t10;
              let { data: r10, error: s10 } = e10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              let { data: i10, error: n2 } = await sY(this.fetch, "POST", `${this.url}/factors/recovery-codes/regenerate`, { headers: this.headers, jwt: null === (t10 = null == r10 ? void 0 : r10.session) || void 0 === t10 ? void 0 : t10.access_token });
              return n2 ? this._returnResult({ data: null, error: n2 }) : this._returnResult({ data: i10, error: null });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _unenrollRecoveryCodes() {
          sF(this.experimental);
          try {
            return await this._useSession(async (e10) => {
              var t10;
              let { data: r10, error: s10 } = e10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              let { data: i10, error: n2 } = await sY(this.fetch, "DELETE", `${this.url}/factors/recovery-codes`, { headers: this.headers, jwt: null === (t10 = null == r10 ? void 0 : r10.session) || void 0 === t10 ? void 0 : t10.access_token });
              return n2 ? this._returnResult({ data: null, error: n2 }) : this._returnResult({ data: i10, error: null });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _getAuthorizationDetails(e10) {
          try {
            return await this._useSession(async (t10) => {
              let { data: { session: r10 }, error: s10 } = t10;
              return s10 ? this._returnResult({ data: null, error: s10 }) : r10 ? await sY(this.fetch, "GET", `${this.url}/oauth/authorizations/${e10}`, { headers: this.headers, jwt: r10.access_token, xform: (e11) => ({ data: e11, error: null }) }) : this._returnResult({ data: null, error: new r4() });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _approveAuthorization(e10, t10) {
          try {
            return await this._useSession(async (r10) => {
              let { data: { session: s10 }, error: i10 } = r10;
              if (i10) return this._returnResult({ data: null, error: i10 });
              if (!s10) return this._returnResult({ data: null, error: new r4() });
              let n2 = await sY(this.fetch, "POST", `${this.url}/oauth/authorizations/${e10}/consent`, { headers: this.headers, jwt: s10.access_token, body: { action: "approve" }, xform: (e11) => ({ data: e11, error: null }) });
              return n2.data && n2.data.redirect_url && sm() && !(null == t10 ? void 0 : t10.skipBrowserRedirect) && window.location.assign(n2.data.redirect_url), n2;
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _denyAuthorization(e10, t10) {
          try {
            return await this._useSession(async (r10) => {
              let { data: { session: s10 }, error: i10 } = r10;
              if (i10) return this._returnResult({ data: null, error: i10 });
              if (!s10) return this._returnResult({ data: null, error: new r4() });
              let n2 = await sY(this.fetch, "POST", `${this.url}/oauth/authorizations/${e10}/consent`, { headers: this.headers, jwt: s10.access_token, body: { action: "deny" }, xform: (e11) => ({ data: e11, error: null }) });
              return n2.data && n2.data.redirect_url && sm() && !(null == t10 ? void 0 : t10.skipBrowserRedirect) && window.location.assign(n2.data.redirect_url), n2;
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _listOAuthGrants() {
          try {
            return await this._useSession(async (e10) => {
              let { data: { session: t10 }, error: r10 } = e10;
              return r10 ? this._returnResult({ data: null, error: r10 }) : t10 ? await sY(this.fetch, "GET", `${this.url}/user/oauth/grants`, { headers: this.headers, jwt: t10.access_token, xform: (e11) => ({ data: e11, error: null }) }) : this._returnResult({ data: null, error: new r4() });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _revokeOAuthGrant(e10) {
          try {
            return await this._useSession(async (t10) => {
              let { data: { session: r10 }, error: s10 } = t10;
              return s10 ? this._returnResult({ data: null, error: s10 }) : r10 ? (await sY(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, { headers: this.headers, jwt: r10.access_token, query: { client_id: e10.clientId }, noResolveJson: true }), { data: {}, error: null }) : this._returnResult({ data: null, error: new r4() });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async fetchJwk(e10, t10 = { keys: [] }) {
          let r10 = t10.keys.find((t11) => t11.kid === e10);
          if (r10) return r10;
          let s10 = Date.now();
          if ((r10 = this.jwks.keys.find((t11) => t11.kid === e10)) && this.jwks_cached_at + 6e5 > s10) return r10;
          let { data: i10, error: n2 } = await sY(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
          if (n2) throw n2;
          return i10.keys && 0 !== i10.keys.length && (this.jwks = i10, this.jwks_cached_at = s10, r10 = i10.keys.find((t11) => t11.kid === e10)) ? r10 : null;
        }
        async getClaims(e10, t10 = {}) {
          try {
            let r10 = e10;
            if (!r10) {
              let { data: e11, error: t11 } = await this.getSession();
              if (t11 || !e11.session) return this._returnResult({ data: null, error: t11 });
              r10 = e11.session.access_token;
            }
            let { header: s10, payload: i10, signature: n2, raw: { header: a2, payload: o2 } } = sR(r10);
            if (!(null == t10 ? void 0 : t10.allowExpired)) try {
              !function(e11) {
                if (!e11) throw Error("Missing exp claim");
                if (e11 <= Math.floor(Date.now() / 1e3)) throw Error("JWT has expired");
              }(i10.exp);
            } catch (e11) {
              throw new sa(e11 instanceof Error ? e11.message : "JWT validation failed");
            }
            let l2 = !s10.alg || s10.alg.startsWith("HS") || !s10.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(s10.kid, (null == t10 ? void 0 : t10.keys) ? { keys: t10.keys } : null == t10 ? void 0 : t10.jwks);
            if (!l2) {
              let { error: e11 } = await this.getUser(r10);
              if (e11) throw e11;
              return { data: { claims: i10, header: s10, signature: n2 }, error: null };
            }
            let u2 = function(e11) {
              switch (e11) {
                case "RS256":
                  return { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } };
                case "ES256":
                  return { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } };
                default:
                  throw Error("Invalid alg claim");
              }
            }(s10.alg), c2 = await crypto.subtle.importKey("jwk", l2, u2, true, ["verify"]);
            if (!await crypto.subtle.verify(u2, c2, n2, function(e11) {
              let t11 = [];
              return function(e12, t12) {
                for (let r11 = 0; r11 < e12.length; r11 += 1) {
                  let s11 = e12.charCodeAt(r11);
                  if (s11 > 55295 && s11 <= 56319) {
                    let t13 = (s11 - 55296) * 1024 & 65535;
                    s11 = (e12.charCodeAt(r11 + 1) - 56320 & 65535 | t13) + 65536, r11 += 1;
                  }
                  !function(e13, t13) {
                    if (e13 <= 127) {
                      t13(e13);
                      return;
                    }
                    if (e13 <= 2047) {
                      t13(192 | e13 >> 6), t13(128 | 63 & e13);
                      return;
                    }
                    if (e13 <= 65535) {
                      t13(224 | e13 >> 12), t13(128 | e13 >> 6 & 63), t13(128 | 63 & e13);
                      return;
                    }
                    if (e13 <= 1114111) {
                      t13(240 | e13 >> 18), t13(128 | e13 >> 12 & 63), t13(128 | e13 >> 6 & 63), t13(128 | 63 & e13);
                      return;
                    }
                    throw Error(`Unrecognized Unicode codepoint: ${e13.toString(16)}`);
                  }(s11, t12);
                }
              }(e11, (e12) => t11.push(e12)), new Uint8Array(t11);
            }(`${a2}.${o2}`))) throw new sa("Invalid JWT signature");
            return { data: { claims: i10, header: s10, signature: n2 }, error: null };
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async signInWithPasskey(e10) {
          var t10, r10, s10, i10;
          try {
            if (!ic()) return this._returnResult({ data: null, error: new r2("Browser does not support WebAuthn", null) });
            let { data: n2, error: a2 } = await this._startPasskeyAuthentication({ options: { captchaToken: null === (t10 = null == e10 ? void 0 : e10.options) || void 0 === t10 ? void 0 : t10.captchaToken } });
            if (a2 || !n2) return this._returnResult({ data: null, error: a2 });
            let o2 = ia(n2.options), l2 = null !== (s10 = null === (r10 = null == e10 ? void 0 : e10.options) || void 0 === r10 ? void 0 : r10.signal) && void 0 !== s10 ? s10 : is.createNewAbortSignal(), { data: u2, error: c2 } = await id({ publicKey: o2, signal: l2, mediation: null === (i10 = null == e10 ? void 0 : e10.options) || void 0 === i10 ? void 0 : i10.mediation });
            if (c2 || !u2) return this._returnResult({ data: null, error: null != c2 ? c2 : new r2("WebAuthn ceremony failed", null) });
            let h2 = il(u2);
            return this._verifyPasskeyAuthentication({ challengeId: n2.challenge_id, credential: h2 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async registerPasskey(e10) {
          var t10, r10;
          try {
            if (!ic()) return this._returnResult({ data: null, error: new r2("Browser does not support WebAuthn", null) });
            let { data: s10, error: i10 } = await this._startPasskeyRegistration();
            if (i10 || !s10) return this._returnResult({ data: null, error: i10 });
            let n2 = ii(s10.options), a2 = null !== (r10 = null === (t10 = null == e10 ? void 0 : e10.options) || void 0 === t10 ? void 0 : t10.signal) && void 0 !== r10 ? r10 : is.createNewAbortSignal(), { data: o2, error: l2 } = await ih({ publicKey: n2, signal: a2 });
            if (l2 || !o2) return this._returnResult({ data: null, error: null != l2 ? l2 : new r2("WebAuthn ceremony failed", null) });
            let u2 = io(o2);
            return this._verifyPasskeyRegistration({ challengeId: s10.challenge_id, credential: u2 });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _startPasskeyRegistration() {
          try {
            return await this._useSession(async (e10) => {
              let { data: { session: t10 }, error: r10 } = e10;
              if (r10) return this._returnResult({ data: null, error: r10 });
              if (!t10) return this._returnResult({ data: null, error: new r4() });
              let { data: s10, error: i10 } = await sY(this.fetch, "POST", `${this.url}/passkeys/registration/options`, { headers: this.headers, jwt: t10.access_token, body: {} });
              return i10 ? this._returnResult({ data: null, error: i10 }) : this._returnResult({ data: s10, error: null });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _verifyPasskeyRegistration(e10) {
          try {
            return await this._useSession(async (t10) => {
              let { data: { session: r10 }, error: s10 } = t10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              if (!r10) return this._returnResult({ data: null, error: new r4() });
              let { data: i10, error: n2 } = await sY(this.fetch, "POST", `${this.url}/passkeys/registration/verify`, { headers: this.headers, jwt: r10.access_token, body: { challenge_id: e10.challengeId, credential: e10.credential } });
              return n2 ? this._returnResult({ data: null, error: n2 }) : this._returnResult({ data: i10, error: null });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _startPasskeyAuthentication(e10) {
          var t10;
          try {
            let { data: r10, error: s10 } = await sY(this.fetch, "POST", `${this.url}/passkeys/authentication/options`, { headers: this.headers, body: { gotrue_meta_security: { captcha_token: null === (t10 = null == e10 ? void 0 : e10.options) || void 0 === t10 ? void 0 : t10.captchaToken } } });
            if (s10) return this._returnResult({ data: null, error: s10 });
            return this._returnResult({ data: r10, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _verifyPasskeyAuthentication(e10) {
          try {
            let { data: t10, error: r10 } = await sY(this.fetch, "POST", `${this.url}/passkeys/authentication/verify`, { headers: this.headers, body: { challenge_id: e10.challengeId, credential: e10.credential }, xform: sQ });
            if (r10) return this._returnResult({ data: null, error: r10 });
            return t10.session && (await this._saveSession(t10.session), await this._notifyAllSubscribers("SIGNED_IN", t10.session)), this._returnResult({ data: t10, error: null });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _listPasskeys() {
          try {
            return await this._useSession(async (e10) => {
              let { data: { session: t10 }, error: r10 } = e10;
              if (r10) return this._returnResult({ data: null, error: r10 });
              if (!t10) return this._returnResult({ data: null, error: new r4() });
              let { data: s10, error: i10 } = await sY(this.fetch, "GET", `${this.url}/passkeys`, { headers: this.headers, jwt: t10.access_token, xform: (e11) => ({ data: e11, error: null }) });
              return i10 ? this._returnResult({ data: null, error: i10 }) : this._returnResult({ data: s10, error: null });
            });
          } catch (e10) {
            if (rQ(e10)) return this._returnResult({ data: null, error: e10 });
            throw e10;
          }
        }
        async _updatePasskey(e10) {
          try {
            return await this._useSession(async (t10) => {
              let { data: { session: r10 }, error: s10 } = t10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              if (!r10) return this._returnResult({ data: null, error: new r4() });
              let { data: i10, error: n2 } = await sY(this.fetch, "PATCH", `${this.url}/passkeys/${e10.passkeyId}`, { headers: this.headers, jwt: r10.access_token, body: { friendly_name: e10.friendlyName } });
              return n2 ? this._returnResult({ data: null, error: n2 }) : this._returnResult({ data: i10, error: null });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
        async _deletePasskey(e10) {
          try {
            return await this._useSession(async (t10) => {
              let { data: { session: r10 }, error: s10 } = t10;
              if (s10) return this._returnResult({ data: null, error: s10 });
              if (!r10) return this._returnResult({ data: null, error: new r4() });
              let { error: i10 } = await sY(this.fetch, "DELETE", `${this.url}/passkeys/${e10.passkeyId}`, { headers: this.headers, jwt: r10.access_token, noResolveJson: true });
              return i10 ? this._returnResult({ data: null, error: i10 }) : this._returnResult({ data: null, error: null });
            });
          } catch (e11) {
            if (rQ(e11)) return this._returnResult({ data: null, error: e11 });
            throw e11;
          }
        }
      }
      i_.nextInstanceID = {};
      let ik = i_, iS = "";
      if ("undefined" != typeof Deno) iS = "deno", a = null === (E = Deno.version) || void 0 === E ? void 0 : E.deno;
      else if ("undefined" != typeof document) iS = "web";
      else if ("undefined" != typeof navigator && "ReactNative" === navigator.product) iS = "react-native";
      else {
        iS = "node";
        let e10 = globalThis.process;
        a = null == e10 || null === (R = e10.version) || void 0 === R ? void 0 : R.replace(/^v/, "");
      }
      let iT = [`runtime=${iS}`];
      a && iT.push(`runtime-version=${a}`);
      let iE = { headers: { "X-Client-Info": `supabase-js/2.118.0; ${iT.join("; ")}` } }, iR = { schema: "public" }, iO = { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: "implicit" }, iA = {}, iP = { enabled: false, respectSamplingDecision: true };
      function iC(e10) {
        return (iC = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e11) {
          return typeof e11;
        } : function(e11) {
          return e11 && "function" == typeof Symbol && e11.constructor === Symbol && e11 !== Symbol.prototype ? "symbol" : typeof e11;
        })(e10);
      }
      function ix(e10, t10) {
        var r10 = Object.keys(e10);
        if (Object.getOwnPropertySymbols) {
          var s10 = Object.getOwnPropertySymbols(e10);
          t10 && (s10 = s10.filter(function(t11) {
            return Object.getOwnPropertyDescriptor(e10, t11).enumerable;
          })), r10.push.apply(r10, s10);
        }
        return r10;
      }
      function iI(e10) {
        for (var t10 = 1; t10 < arguments.length; t10++) {
          var r10 = null != arguments[t10] ? arguments[t10] : {};
          t10 % 2 ? ix(Object(r10), true).forEach(function(t11) {
            !function(e11, t12, r11) {
              var s10;
              (s10 = function(e12, t13) {
                if ("object" != iC(e12) || !e12) return e12;
                var r12 = e12[Symbol.toPrimitive];
                if (void 0 !== r12) {
                  var s11 = r12.call(e12, t13 || "default");
                  if ("object" != iC(s11)) return s11;
                  throw TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === t13 ? String : Number)(e12);
              }(t12, "string"), (t12 = "symbol" == iC(s10) ? s10 : s10 + "") in e11) ? Object.defineProperty(e11, t12, { value: r11, enumerable: true, configurable: true, writable: true }) : e11[t12] = r11;
            }(e10, t11, r10[t11]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e10, Object.getOwnPropertyDescriptors(r10)) : ix(Object(r10)).forEach(function(t11) {
            Object.defineProperty(e10, t11, Object.getOwnPropertyDescriptor(r10, t11));
          });
        }
        return e10;
      }
      let ij = (e10) => e10 ? (...t10) => e10(...t10) : (...e11) => fetch(...e11), iN = () => Headers, i$ = (e10) => e10.startsWith("sb_publishable_") || e10.startsWith("sb_secret_"), iL = /* @__PURE__ */ new Set(), iD = (e10) => {
        var t10, r10;
        if (!e10.startsWith("sb_") || i$(e10) || e10.startsWith("sb_temp_")) return;
        let s10 = null !== (t10 = null === (r10 = e10.match(/^sb_[a-zA-Z0-9]+_/)) || void 0 === r10 ? void 0 : r10[0]) && void 0 !== t10 ? t10 : "unknown";
        iL.has(s10) || (iL.add(s10), console.warn("@supabase/supabase-js: Unrecognized Supabase API key format. The client will proceed and send this key as-is; if you see authentication errors you may need to upgrade @supabase/supabase-js to a version that recognizes this key type."));
      }, iU = (e10, t10, r10, s10, i10, n2) => {
        let a2 = ij(s10), o2 = iN(), l2 = (null == i10 ? void 0 : i10.enabled) === true, u2 = (null == i10 ? void 0 : i10.respectSamplingDecision) !== false, c2 = l2 ? function(e11) {
          let t11 = [];
          try {
            let r11 = new URL(e11);
            t11.push(r11.hostname);
          } catch (e12) {
          }
          return t11.push("*.supabase.co", "*.supabase.in"), t11.push("localhost", "127.0.0.1", "[::1]"), t11;
        }(t10) : null, h2 = !((null == n2 ? void 0 : n2.omitApiKeyAsBearer) && i$(e10));
        return async (t11, s11) => {
          let i11 = await r10(), n3 = new o2(null == s11 ? void 0 : s11.headers);
          if (n3.has("apikey") || n3.set("apikey", e10), !n3.has("Authorization")) {
            let t12 = null != i11 ? i11 : h2 ? e10 : null;
            t12 && n3.set("Authorization", `Bearer ${t12}`);
          }
          if (c2) {
            let e11 = function(e12, t12, r11) {
              let s12 = globalThis[eX];
              if (!s12) return iM || (iM = true, console.warn("@supabase/supabase-js: tracePropagation is enabled but the tracing runtime is not loaded, so trace headers will not be attached. Add `import '@supabase/supabase-js/tracing'` at your application entry point (requires the OpenTelemetry API package to be installed). The CDN/UMD build does not support trace propagation.")), null;
              if (!function(e13, t13) {
                let r12;
                if (!e13 || !t13 || 0 === t13.length) return false;
                if (e13 instanceof URL) r12 = e13;
                else try {
                  r12 = new URL(e13);
                } catch (e14) {
                  return false;
                }
                for (let e14 of t13) try {
                  if ("string" == typeof e14) {
                    if (function(e15, t14) {
                      if (t14 === e15) return true;
                      if (t14.startsWith("*.")) {
                        let r13 = t14.slice(2);
                        if (e15.endsWith(r13) && (e15 === r13 || e15.endsWith("." + r13))) return true;
                      }
                      return false;
                    }(r12.hostname, e14)) return true;
                  } else if (e14 instanceof RegExp) {
                    if (e14.test(r12.hostname)) return true;
                  } else if ("function" == typeof e14 && e14(r12)) return true;
                } catch (e15) {
                  continue;
                }
                return false;
              }("string" == typeof e12 ? e12 : e12 instanceof URL ? e12 : e12.url, t12)) return null;
              let i12 = s12();
              if (!i12 || !i12.traceparent) {
                var n4;
                if ((null == i12 || null === (n4 = i12.carrierKeys) || void 0 === n4 ? void 0 : n4.length) && !iB) {
                  iB = true;
                  let e13 = i12.carrierKeys.includes("sentry-trace") ? " Sentry detected: set `propagateTraceparent: true` in Sentry.init() to emit it." : " Configure your tracing SDK to emit W3C trace context on outgoing requests.";
                  console.warn(`@supabase/supabase-js: tracePropagation is enabled and a tracing SDK is active, but its propagator wrote [${i12.carrierKeys.join(", ")}] and no W3C traceparent header, so trace headers will not be attached.` + e13);
                }
                return null;
              }
              if (r11) {
                let e13 = function(e14) {
                  if (!e14 || "string" != typeof e14) return null;
                  let t13 = e14.split("-");
                  if (4 !== t13.length) return null;
                  let [r12, s13, i13, n5] = t13;
                  if (2 !== r12.length || 32 !== s13.length || 16 !== i13.length || 2 !== n5.length) return null;
                  let a3 = /^[0-9a-f]+$/i;
                  return a3.test(r12) && a3.test(s13) && a3.test(i13) && a3.test(n5) && "00000000000000000000000000000000" !== s13 && "0000000000000000" !== i13 ? { version: r12, traceId: s13, parentId: i13, traceFlags: n5, isSampled: (1 & parseInt(n5, 16)) == 1 } : null;
                }(i12.traceparent);
                if (e13 && !e13.isSampled) return { traceparent: i12.traceparent };
              }
              return i12;
            }(t11, c2, u2);
            e11 && (e11.traceparent && !n3.has("traceparent") && n3.set("traceparent", e11.traceparent), e11.tracestate && !n3.has("tracestate") && n3.set("tracestate", e11.tracestate), e11.baggage && !n3.has("baggage") && n3.set("baggage", e11.baggage));
          }
          return a2(t11, iI(iI({}, s11), {}, { headers: n3 }));
        };
      }, iM = false, iB = false;
      function iq(e10) {
        return "boolean" == typeof e10 ? { enabled: e10 } : e10;
      }
      let iH = false;
      var iV = class extends ik {
        constructor(e10) {
          super(e10);
        }
      }, iF = class {
        constructor(e10, t10, r10) {
          var s10, i10, n2;
          this.supabaseUrl = e10, this.supabaseKey = t10;
          let a2 = function(e11) {
            let t11 = null == e11 ? void 0 : e11.trim();
            if (!t11) throw Error("supabaseUrl is required.");
            if (!t11.match(/^https?:\/\//i)) throw Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
            try {
              return new URL(t11.endsWith("/") ? t11 : t11 + "/");
            } catch (e12) {
              throw Error("Invalid supabaseUrl: Provided URL is malformed.");
            }
          }(e10);
          if (!t10) throw Error("supabaseKey is required.");
          iD(t10), function(e11) {
            !iH && "object" == typeof e11 && null !== e11 && "schema" in e11 && void 0 !== e11.schema && (iH = true, console.warn(`@supabase/supabase-js: The "schema" option must be nested under "db", e.g. createClient(url, key, { db: { schema: 'myschema' } }). A top-level "schema" is ignored and queries go to the default schema.`));
          }(r10), this.realtimeUrl = new URL("realtime/v1", a2), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", a2), this.storageUrl = new URL("storage/v1", a2), this.functionsUrl = new URL("functions/v1", a2);
          let o2 = `sb-${a2.hostname.split(".")[0]}-auth-token`, l2 = function(e11, t11) {
            var r11, s11, i11, n3, a3, o3;
            let { db: l3, auth: u2, realtime: c2, global: h2 } = e11, { db: d2, auth: p2, realtime: f2, global: g2 } = t11, m2 = iq(e11.tracePropagation), b2 = iq(t11.tracePropagation), y2 = { db: iI(iI({}, d2), l3), auth: iI(iI({}, p2), u2), realtime: iI(iI({}, f2), c2), storage: {}, global: iI(iI(iI({}, g2), h2), {}, { headers: iI(iI({}, null !== (r11 = null == g2 ? void 0 : g2.headers) && void 0 !== r11 ? r11 : {}), null !== (s11 = null == h2 ? void 0 : h2.headers) && void 0 !== s11 ? s11 : {}) }), tracePropagation: { enabled: null !== (i11 = null !== (n3 = null == m2 ? void 0 : m2.enabled) && void 0 !== n3 ? n3 : null == b2 ? void 0 : b2.enabled) && void 0 !== i11 && i11, respectSamplingDecision: null === (a3 = null !== (o3 = null == m2 ? void 0 : m2.respectSamplingDecision) && void 0 !== o3 ? o3 : null == b2 ? void 0 : b2.respectSamplingDecision) || void 0 === a3 || a3 }, accessToken: async () => "" };
            return e11.accessToken ? y2.accessToken = e11.accessToken : delete y2.accessToken, y2;
          }(null != r10 ? r10 : {}, { db: iR, realtime: iA, auth: iI(iI({}, iO), {}, { storageKey: o2 }), global: iE, tracePropagation: iP });
          this.settings = l2, this.storageKey = null !== (s10 = l2.auth.storageKey) && void 0 !== s10 ? s10 : "", this.headers = null !== (i10 = l2.global.headers) && void 0 !== i10 ? i10 : {}, l2.accessToken ? (this.accessToken = l2.accessToken, this.auth = new Proxy({}, { get: (e11, t11) => {
            throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t11)} is not possible`);
          } })) : this.auth = this._initSupabaseAuthClient(null !== (n2 = l2.auth) && void 0 !== n2 ? n2 : {}, this.headers, l2.global.fetch), this.fetch = iU(t10, e10, this._getSessionToken.bind(this), l2.global.fetch, l2.tracePropagation), this.functionsFetch = iU(t10, e10, this._getSessionToken.bind(this), l2.global.fetch, l2.tracePropagation, { omitApiKeyAsBearer: true }), this.realtime = this._initRealtimeClient(iI({ headers: this.headers, accessToken: this._getAccessToken.bind(this), fetch: this.fetch }, l2.realtime)), this.accessToken && Promise.resolve(this.accessToken()).then((e11) => this.realtime.setAuth(e11)).catch((e11) => console.warn("Failed to set initial Realtime auth token:", e11)), this.rest = new tl(new URL("rest/v1", a2).href, { headers: this.headers, schema: l2.db.schema, fetch: this.fetch, timeout: l2.db.timeout, urlLengthLimit: l2.db.urlLengthLimit, retry: l2.db.retry }), this.storage = new rF(this.storageUrl.href, this.headers, this.fetch, null == r10 ? void 0 : r10.storage), l2.accessToken || this._listenForAuthEvents();
        }
        get functions() {
          return new e2(this.functionsUrl.href, { headers: this.headers, customFetch: this.functionsFetch });
        }
        from(e10) {
          return this.rest.from(e10);
        }
        schema(e10) {
          return this.rest.schema(e10);
        }
        getOpenApiSpec() {
          return this.rest.getOpenApiSpec();
        }
        rpc(e10, t10 = {}, r10 = { head: false, get: false, count: void 0 }) {
          return this.rest.rpc(e10, t10, r10);
        }
        channel(e10, t10 = { config: {} }) {
          return this.realtime.channel(e10, t10);
        }
        getChannels() {
          return this.realtime.getChannels();
        }
        removeChannel(e10) {
          return this.realtime.removeChannel(e10);
        }
        removeAllChannels() {
          return this.realtime.removeAllChannels();
        }
        async _getSessionToken() {
          var e10, t10;
          if (this.accessToken) return await this.accessToken();
          let { data: r10 } = await this.auth.getSession();
          return null !== (e10 = null === (t10 = r10.session) || void 0 === t10 ? void 0 : t10.access_token) && void 0 !== e10 ? e10 : null;
        }
        async _getAccessToken() {
          var e10;
          return null !== (e10 = await this._getSessionToken()) && void 0 !== e10 ? e10 : this.supabaseKey;
        }
        _initSupabaseAuthClient({ autoRefreshToken: e10, persistSession: t10, detectSessionInUrl: r10, storage: s10, userStorage: i10, storageKey: n2, flowType: a2, lock: o2, debug: l2, throwOnError: u2, experimental: c2, lockAcquireTimeout: h2, skipAutoInitialize: d2 }, p2, f2) {
          let g2 = { Authorization: `Bearer ${this.supabaseKey}`, apikey: `${this.supabaseKey}` };
          return new iV({ url: this.authUrl.href, headers: iI(iI({}, g2), p2), storageKey: n2, autoRefreshToken: e10, persistSession: t10, detectSessionInUrl: r10, storage: s10, userStorage: i10, flowType: a2, lock: o2, debug: l2, throwOnError: u2, experimental: c2, fetch: f2, lockAcquireTimeout: h2, skipAutoInitialize: d2, hasCustomAuthorizationHeader: Object.keys(this.headers).some((e11) => "authorization" === e11.toLowerCase()) });
        }
        _initRealtimeClient(e10) {
          return new t6(this.realtimeUrl.href, iI(iI({}, e10), {}, { params: iI(iI({}, { apikey: this.supabaseKey }), null == e10 ? void 0 : e10.params) }));
        }
        _listenForAuthEvents() {
          return this.auth.onAuthStateChange((e10, t10) => {
            this._handleTokenChanged(e10, "CLIENT", null == t10 ? void 0 : t10.access_token);
          });
        }
        _handleTokenChanged(e10, t10, r10) {
          ("TOKEN_REFRESHED" === e10 || "SIGNED_IN" === e10 || "INITIAL_SESSION" === e10) && this.changedAccessToken !== r10 ? (this.changedAccessToken = r10, this.realtime.setAuth(r10)) : "SIGNED_OUT" === e10 && (this.realtime.setAuth(), "STORAGE" == t10 && this.auth.signOut(), this.changedAccessToken = void 0);
        }
      };
      let iW = (e10, t10, r10) => new iF(e10, t10, r10);
      (function() {
        if ("undefined" != typeof window || void 0 !== globalThis.Deno) return false;
        let e10 = globalThis.process;
        if (!e10) return false;
        let t10 = e10.version;
        if (null == t10) return false;
        let r10 = t10.match(/^v(\d+)\./);
        return !!r10 && 20 >= parseInt(r10[1], 10);
      })() && console.warn("\u26A0\uFE0F  Node.js 20 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 22 or later. For more information, visit: https://github.com/orgs/supabase/discussions/45715");
      var iG = r(322);
      let iK = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), iz = " 	\n\r=".split(""), iJ = (() => {
        let e10 = Array(128);
        for (let t10 = 0; t10 < e10.length; t10 += 1) e10[t10] = -1;
        for (let t10 = 0; t10 < iz.length; t10 += 1) e10[iz[t10].charCodeAt(0)] = -2;
        for (let t10 = 0; t10 < iK.length; t10 += 1) e10[iK[t10].charCodeAt(0)] = t10;
        return e10;
      })();
      function iX(e10) {
        let t10 = [], r10 = 0, s10 = 0;
        if (function(e11, t11) {
          for (let r11 = 0; r11 < e11.length; r11 += 1) {
            let s11 = e11.charCodeAt(r11);
            if (s11 > 55295 && s11 <= 56319) {
              let t12 = (s11 - 55296) * 1024 & 65535;
              s11 = (e11.charCodeAt(r11 + 1) - 56320 & 65535 | t12) + 65536, r11 += 1;
            }
            !function(e12, t12) {
              if (e12 <= 127) {
                t12(e12);
                return;
              }
              if (e12 <= 2047) {
                t12(192 | e12 >> 6), t12(128 | 63 & e12);
                return;
              }
              if (e12 <= 65535) {
                t12(224 | e12 >> 12), t12(128 | e12 >> 6 & 63), t12(128 | 63 & e12);
                return;
              }
              if (e12 <= 1114111) {
                t12(240 | e12 >> 18), t12(128 | e12 >> 12 & 63), t12(128 | e12 >> 6 & 63), t12(128 | 63 & e12);
                return;
              }
              throw Error(`Unrecognized Unicode codepoint: ${e12.toString(16)}`);
            }(s11, t11);
          }
        }(e10, (e11) => {
          for (r10 = r10 << 8 | e11, s10 += 8; s10 >= 6; ) {
            let e12 = r10 >> s10 - 6 & 63;
            t10.push(iK[e12]), s10 -= 6;
          }
        }), s10 > 0) for (r10 <<= 6 - s10, s10 = 6; s10 >= 6; ) {
          let e11 = r10 >> s10 - 6 & 63;
          t10.push(iK[e11]), s10 -= 6;
        }
        return t10.join("");
      }
      function iY() {
        return "undefined" != typeof window && void 0 !== window.document;
      }
      iG.Qc, iG.qC;
      let iZ = /^(.*)[.](0|[1-9][0-9]*)$/;
      function iQ(e10, t10) {
        if (e10 === t10) return true;
        let r10 = e10.match(iZ);
        return !!r10 && r10[1] === t10;
      }
      function i0(e10, t10, r10) {
        let s10 = r10 ?? 3180, i10 = encodeURIComponent(t10);
        if (i10.length <= s10) return [{ name: e10, value: t10 }];
        let n2 = [];
        for (; i10.length > 0; ) {
          let e11 = i10.slice(0, s10), t11 = e11.lastIndexOf("%");
          t11 > s10 - 3 && (e11 = e11.slice(0, t11));
          let r11 = "";
          for (; e11.length > 0; ) try {
            r11 = decodeURIComponent(e11);
            break;
          } catch (t12) {
            if (t12 instanceof URIError && "%" === e11.at(-3) && e11.length > 3) e11 = e11.slice(0, e11.length - 3);
            else throw t12;
          }
          n2.push(r11), i10 = i10.slice(e11.length);
        }
        return n2.map((t11, r11) => ({ name: `${e10}.${r11}`, value: t11 }));
      }
      async function i1(e10, t10) {
        let r10 = await t10(e10);
        if (r10) return r10;
        let s10 = [];
        for (let r11 = 0; ; r11++) {
          let i10 = `${e10}.${r11}`, n2 = await t10(i10);
          if (!n2) break;
          s10.push(n2);
        }
        return s10.length > 0 ? s10.join("") : null;
      }
      let i2 = { path: "/", sameSite: "lax", httpOnly: false, maxAge: 3456e4 }, i3 = "base64-", i4 = /-flow-[A-Za-z0-9_-]{8,64}-code-verifier$/;
      function i5(e10) {
        let t10;
        if (!e10.startsWith(i3)) return e10;
        try {
          t10 = function(e11) {
            let t11 = [], r10 = (e12) => {
              t11.push(String.fromCodePoint(e12));
            }, s10 = { utf8seq: 0, codepoint: 0 }, i10 = 0, n2 = 0;
            for (let t12 = 0; t12 < e11.length; t12 += 1) {
              let a2 = iJ[e11.charCodeAt(t12)];
              if (a2 > -1) for (i10 = i10 << 6 | a2, n2 += 6; n2 >= 8; ) (function(e12, t13, r11) {
                if (0 === t13.utf8seq) {
                  if (e12 <= 127) {
                    r11(e12);
                    return;
                  }
                  for (let r12 = 1; r12 < 6; r12 += 1) if ((e12 >> 7 - r12 & 1) == 0) {
                    t13.utf8seq = r12;
                    break;
                  }
                  if (2 === t13.utf8seq) t13.codepoint = 31 & e12;
                  else if (3 === t13.utf8seq) t13.codepoint = 15 & e12;
                  else if (4 === t13.utf8seq) t13.codepoint = 7 & e12;
                  else throw Error("Invalid UTF-8 sequence");
                  t13.utf8seq -= 1;
                } else if (t13.utf8seq > 0) {
                  if (e12 <= 127) throw Error("Invalid UTF-8 sequence");
                  t13.codepoint = t13.codepoint << 6 | 63 & e12, t13.utf8seq -= 1, 0 === t13.utf8seq && r11(t13.codepoint);
                }
              })(i10 >> n2 - 8 & 255, s10, r10), n2 -= 8;
              else if (-2 === a2) continue;
              else throw Error(`Invalid Base64-URL character "${e11.at(t12)}" at position ${t12}`);
            }
            return t11.join("");
          }(e10.substring(i3.length));
        } catch (e11) {
          return console.warn("@supabase/ssr: could not base64url-decode chunked cookie value, treating as absent. Cookie chunks may have been written partially across responses.", e11), null;
        }
        try {
          JSON.parse(t10);
        } catch {
          return console.warn("@supabase/ssr: chunked cookie decoded to invalid JSON, treating as absent. This usually indicates that cookie chunks from different writes were combined (e.g. response committed before all Set-Cookie headers were sent)."), null;
        }
        return t10;
      }
      async function i6({ getAll: e10, setAll: t10, setItems: r10, removedItems: s10 }, i10) {
        let n2 = i10.cookieEncoding, a2 = i10.cookieOptions ?? null, o2 = await e10([...r10 ? Object.keys(r10) : [], ...s10 ? Object.keys(s10) : []]), l2 = o2?.map(({ name: e11 }) => e11) || [], u2 = new Map(o2?.map(({ name: e11, value: t11 }) => [e11, t11]) || []), c2 = Object.keys(s10).flatMap((e11) => l2.filter((t11) => iQ(t11, e11))), h2 = Object.keys(r10).flatMap((e11) => {
          let t11 = new Set(l2.filter((t12) => iQ(t12, e11))), s11 = r10[e11];
          "base64url" === n2 && (s11 = i3 + iX(s11));
          let i11 = i0(e11, s11);
          return i11.forEach((e12) => {
            t11.delete(e12.name);
          }), c2.push(...t11), i11;
        }).filter(({ name: e11, value: t11 }) => u2.get(e11) !== t11), d2 = c2.filter((e11) => u2.has(e11)), p2 = { ...i2, ...a2, maxAge: 0 }, f2 = { ...i2, ...a2, maxAge: i2.maxAge };
        delete p2.name, delete f2.name;
        let g2 = p2.domain && d2.length > 0 ? (() => {
          let { domain: e11, ...t11 } = p2;
          return t11;
        })() : null;
        (0 !== d2.length || 0 !== h2.length) && await t10([...g2 ? d2.map((e11) => ({ name: e11, value: "", options: g2 })) : [], ...d2.map((e11) => ({ name: e11, value: "", options: p2 })), ...h2.map(({ name: e11, value: t11 }) => ({ name: e11, value: t11, options: f2 }))], { "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0", Expires: "0", Pragma: "no-cache" });
      }
      let i8 = /* @__PURE__ */ new Set(), i9 = false, i7 = ["@supabase/auth-helpers-nextjs", "@supabase/auth-helpers-react", "@supabase/auth-helpers-remix", "@supabase/auth-helpers-sveltekit"];
      async function ne(e10) {
        let t10 = eo.next({ request: e10 }), r10 = function(e11, t11, r11) {
          var s11;
          if (!function() {
            if (i9 || "undefined" == typeof process || !process.env?.npm_package_name) return;
            let e12 = process.env.npm_package_name;
            i7.includes(e12) && (i9 = true, console.warn(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551 \u26A0\uFE0F  IMPORTANT: Package Consolidation Notice                                \u2551
\u2551                                                                            \u2551
\u2551 The ${e12.padEnd(35)} package name is deprecated.  \u2551
\u2551                                                                            \u2551
\u2551 You are now using @supabase/ssr - a unified solution for all frameworks.  \u2551
\u2551                                                                            \u2551
\u2551 The auth-helpers packages have been consolidated into @supabase/ssr       \u2551
\u2551 to provide better maintenance and consistent APIs across frameworks.      \u2551
\u2551                                                                            \u2551
\u2551 Please update your package.json to use @supabase/ssr directly:            \u2551
\u2551   npm uninstall ${e12.padEnd(42)} \u2551
\u2551   npm install @supabase/ssr                                               \u2551
\u2551                                                                            \u2551
\u2551 For more information, visit:                                              \u2551
\u2551 https://supabase.com/docs/guides/auth/server-side                         \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
    `));
          }(), !e11 || !t11) throw Error(`Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api`);
          r11?.auth?.storage && (s11 = "@supabase/ssr: createServerClient always manages the session via cookies, so the `auth.storage` option you passed is ignored. If you want to source the session from somewhere other than the request cookies, use @supabase/supabase-js's createClient directly with your own `storage` instead.", i8.has(s11) || (i8.add(s11), console.warn(s11)));
          let { storage: i10, getAll: n2, setAll: a2, setItems: o2, removedItems: l2 } = function(e12, t12) {
            let r12, s12;
            let i11 = e12.cookies && ("get" in e12.cookies || "getAll" in e12.cookies) ? e12.cookies : null, n3 = e12.cookieEncoding, a3 = {}, o3 = {}, l3 = () => {
              let e13 = (0, iG.Qc)(document.cookie);
              return Object.keys(e13).map((t13) => ({ name: t13, value: e13[t13] ?? "" }));
            };
            if (i11) {
              if ("get" in i11) {
                let e13 = async (e14) => {
                  let t13 = e14.flatMap((e15) => [e15, ...Array.from({ length: 5 }).map((t14, r14) => `${e15}.${r14}`)]), r13 = [];
                  for (let e15 = 0; e15 < t13.length; e15 += 1) {
                    let s13 = await i11.get(t13[e15]);
                    (s13 || "string" == typeof s13) && r13.push({ name: t13[e15], value: s13 });
                  }
                  return r13;
                };
                if (r12 = async (t13) => await e13(t13), "set" in i11 && "remove" in i11) s12 = async (e14) => {
                  for (let t13 = 0; t13 < e14.length; t13 += 1) {
                    let { name: r13, value: s13, options: n4 } = e14[t13];
                    s13 ? await i11.set(r13, s13, n4) : await i11.remove(r13, n4);
                  }
                };
                else if (t12) s12 = async () => {
                  console.warn("@supabase/ssr: createServerClient was configured without set and remove cookie methods, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness. Consider switching to the getAll and setAll cookie methods instead of get, set and remove which are deprecated and can be difficult to use correctly.");
                };
                else throw Error("@supabase/ssr: createBrowserClient requires configuring a getAll and setAll cookie method (deprecated: alternatively both get, set and remove can be used)");
              } else if ("getAll" in i11) {
                if (r12 = async () => await i11.getAll(), "setAll" in i11) s12 = i11.setAll;
                else if (t12) s12 = async () => {
                  console.warn("@supabase/ssr: createServerClient was configured without the setAll cookie method, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness.");
                };
                else throw Error("@supabase/ssr: createBrowserClient requires configuring both getAll and setAll cookie methods (deprecated: alternatively both get, set and remove can be used)");
              } else throw Error(`@supabase/ssr: ${t12 ? "createServerClient" : "createBrowserClient"} requires configuring getAll and setAll cookie methods (deprecated: alternatively use get, set and remove).${iY() ? " As this is called in a browser runtime, consider removing the cookies option object to use the document.cookie API automatically." : ""}`);
            } else if (!t12 && iY()) r12 = () => l3(), s12 = (e13) => {
              e13.forEach(({ name: e14, value: t13, options: r13 }) => {
                document.cookie = (0, iG.qC)(e14, t13, r13);
              });
            };
            else if (t12) throw Error("@supabase/ssr: createServerClient must be initialized with cookie options that specify getAll and setAll functions (deprecated, not recommended: alternatively use get, set and remove)");
            else r12 = () => [], s12 = () => {
              throw Error("@supabase/ssr: createBrowserClient in non-browser runtimes (including Next.js pre-rendering mode) was not initialized cookie options that specify getAll and setAll functions (deprecated: alternatively use get, set and remove), but they were needed");
            };
            if (!t12) return { getAll: r12, setAll: s12, setItems: a3, removedItems: o3, storage: { isServer: false, getItem: async (e13) => {
              let t13 = await r12([e13]), s13 = await i1(e13, async (e14) => {
                let r13 = t13?.find(({ name: t14 }) => t14 === e14) || null;
                return r13 ? r13.value : null;
              });
              return s13 ? i5(s13) : null;
            }, setItem: async (t13, i12) => {
              let a4 = await r12([t13]), o4 = new Set((a4?.map(({ name: e13 }) => e13) || []).filter((e13) => iQ(e13, t13))), l4 = i12;
              "base64url" === n3 && (l4 = i3 + iX(i12));
              let u4 = i0(t13, l4);
              u4.forEach(({ name: e13 }) => {
                o4.delete(e13);
              });
              let c3 = { ...i2, ...e12?.cookieOptions, maxAge: 0 }, h2 = { ...i2, ...e12?.cookieOptions, maxAge: i2.maxAge };
              delete c3.name, delete h2.name;
              let d2 = c3.domain ? (() => {
                let { domain: e13, ...t14 } = c3;
                return t14;
              })() : null, p2 = [...d2 ? [...o4].map((e13) => ({ name: e13, value: "", options: d2 })) : [], ...[...o4].map((e13) => ({ name: e13, value: "", options: c3 })), ...u4.map(({ name: e13, value: t14 }) => ({ name: e13, value: t14, options: h2 }))];
              p2.length > 0 && await s12(p2, {});
            }, removeItem: async (t13) => {
              let i12 = await r12([t13]), n4 = (i12?.map(({ name: e13 }) => e13) || []).filter((e13) => iQ(e13, t13));
              if (0 === n4.length) return;
              let a4 = { ...i2, ...e12?.cookieOptions, maxAge: 0 };
              delete a4.name;
              let o4 = a4.domain ? (() => {
                let { domain: e13, ...t14 } = a4;
                return t14;
              })() : null, l4 = [...o4 ? n4.map((e13) => ({ name: e13, value: "", options: o4 })) : [], ...n4.map((e13) => ({ name: e13, value: "", options: a4 }))];
              await s12(l4, {});
            } } };
            let u3 = s12, c2 = false;
            return { getAll: r12, setAll: s12 = async (e13, t13) => {
              let r13 = !c2 && Object.keys(t13).length > 0;
              await u3(e13, r13 ? t13 : {}), r13 && (c2 = true);
            }, setItems: a3, removedItems: o3, storage: { isServer: true, getItem: async (e13) => {
              if ("string" == typeof a3[e13]) return a3[e13];
              if (o3[e13]) return null;
              let t13 = await r12([e13]), s13 = await i1(e13, async (e14) => {
                let r13 = t13?.find(({ name: t14 }) => t14 === e14) || null;
                return r13 ? r13.value : null;
              });
              return s13 ? "string" != typeof s13 ? s13 : i5(s13) : null;
            }, setItem: async (t13, i12) => {
              t13.endsWith("-code-verifier") && await i6({ getAll: r12, setAll: s12, setItems: { [t13]: i12 }, removedItems: {} }, { cookieOptions: e12?.cookieOptions ?? null, cookieEncoding: n3 }), a3[t13] = i12, delete o3[t13];
            }, removeItem: async (t13) => {
              (i4.test(t13) || t13.endsWith("-flows-code-verifier")) && await i6({ getAll: r12, setAll: s12, setItems: {}, removedItems: { [t13]: true } }, { cookieOptions: e12?.cookieOptions ?? null, cookieEncoding: n3 }), delete a3[t13], o3[t13] = true;
            } } };
          }({ ...r11, cookieEncoding: r11?.cookieEncoding ?? "base64url" }, true), u2 = iW(e11, t11, { ...r11, global: { ...r11?.global, headers: { ...r11?.global?.headers, "X-Client-Info": "supabase-ssr/0.12.7 createServerClient" } }, auth: { ...r11?.cookieOptions?.name ? { storageKey: r11.cookieOptions.name } : null, ...r11?.auth, flowType: "pkce", autoRefreshToken: false, detectSessionInUrl: false, persistSession: true, skipAutoInitialize: true, storage: i10, ...r11?.cookies && "encode" in r11.cookies && "tokens-only" === r11.cookies.encode ? { userStorage: r11?.auth?.userStorage ?? /* @__PURE__ */ function(e12 = {}) {
            return { getItem: (t12) => e12[t12] || null, setItem: (t12, r12) => {
              e12[t12] = r12;
            }, removeItem: (t12) => {
              delete e12[t12];
            } };
          }() } : null } });
          return u2.auth.onAuthStateChange(async (e12) => {
            (Object.keys(o2).length > 0 || Object.keys(l2).length > 0) && ("SIGNED_IN" === e12 || "TOKEN_REFRESHED" === e12 || "USER_UPDATED" === e12 || "PASSWORD_RECOVERY" === e12 || "SIGNED_OUT" === e12 || "MFA_CHALLENGE_VERIFIED" === e12) && await i6({ getAll: n2, setAll: a2, setItems: o2, removedItems: l2 }, { cookieOptions: r11?.cookieOptions ?? null, cookieEncoding: r11?.cookieEncoding ?? "base64url" });
          }), u2;
        }("https://placeholder.supabase.co", "placeholder-key", { cookies: { getAll: () => e10.cookies.getAll(), setAll(r11) {
          r11.forEach(({ name: t11, value: r12, options: s11 }) => e10.cookies.set(t11, r12)), t10 = eo.next({ request: e10 }), r11.forEach(({ name: e11, value: r12, options: s11 }) => t10.cookies.set(e11, r12, s11));
        } } }), { data: { user: s10 } } = await r10.auth.getUser();
        if (!s10 && e10.nextUrl.pathname.startsWith("/dashboard")) {
          let t11 = e10.nextUrl.clone();
          return t11.pathname = "/login", eo.redirect(t11);
        }
        if (s10 && "/login" === e10.nextUrl.pathname) {
          let t11 = e10.nextUrl.clone();
          return t11.pathname = "/dashboard", eo.redirect(t11);
        }
        return t10;
      }
      r(340), "undefined" == typeof URLPattern || URLPattern;
      let nt = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] }, nr = { ...O }, ns = nr.middleware || nr.default, ni = "/src/middleware";
      if ("function" != typeof ns) throw Error(`The Middleware "${ni}" must export a \`middleware\` or a \`default\` function`);
      function nn(e10) {
        return eJ({ ...e10, page: ni, handler: ns });
      }
    }, 322: (e, t) => {
      "use strict";
      t.Qc = function(e2, t2) {
        let r2 = new o(), s2 = e2.length;
        if (s2 < 2) return r2;
        let i2 = t2?.decode || c, n2 = 0;
        do {
          let t3 = function(e3, t4, r3) {
            let s3 = e3.indexOf("=", t4);
            return s3 < r3 ? s3 : -1;
          }(e2, n2, s2);
          if (-1 === t3) break;
          let a2 = function(e3, t4, r3) {
            let s3 = e3.indexOf(";", t4);
            return -1 === s3 ? r3 : s3;
          }(e2, n2, s2);
          if (t3 > a2) {
            n2 = e2.lastIndexOf(";", t3 - 1) + 1;
            continue;
          }
          let o2 = u(e2, n2, t3);
          void 0 === r2[o2] && (r2[o2] = i2(u(e2, t3 + 1, a2))), n2 = a2 + 1;
        } while (n2 < s2);
        return r2;
      }, t.qC = l, t.qC = l;
      let r = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/, s = /^[\u0021-\u003A\u003C-\u007E]*$/, i = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, n = /^[\u0020-\u003A\u003D-\u007E]*$/, a = Object.prototype.toString, o = (() => {
        let e2 = function() {
        };
        return e2.prototype = /* @__PURE__ */ Object.create(null), e2;
      })();
      function l(e2, t2, o2) {
        let l2 = "object" == typeof e2 ? e2 : { ...o2, name: e2, value: String(t2) }, u2 = ("object" == typeof t2 ? t2 : o2)?.encode || encodeURIComponent;
        if (!r.test(l2.name)) throw TypeError(`argument name is invalid: ${l2.name}`);
        let c2 = l2.value ? u2(l2.value) : "";
        if (!s.test(c2)) throw TypeError(`argument val is invalid: ${l2.value}`);
        let h = l2.name + "=" + c2;
        if (void 0 !== l2.maxAge) {
          if (!Number.isInteger(l2.maxAge)) throw TypeError(`option maxAge is invalid: ${l2.maxAge}`);
          h += "; Max-Age=" + l2.maxAge;
        }
        if (l2.domain) {
          if (!i.test(l2.domain)) throw TypeError(`option domain is invalid: ${l2.domain}`);
          h += "; Domain=" + l2.domain;
        }
        if (l2.path) {
          if (!n.test(l2.path)) throw TypeError(`option path is invalid: ${l2.path}`);
          h += "; Path=" + l2.path;
        }
        if (l2.expires) {
          var d;
          if (d = l2.expires, "[object Date]" !== a.call(d) || !Number.isFinite(l2.expires.valueOf())) throw TypeError(`option expires is invalid: ${l2.expires}`);
          h += "; Expires=" + l2.expires.toUTCString();
        }
        if (l2.httpOnly && (h += "; HttpOnly"), l2.secure && (h += "; Secure"), l2.partitioned && (h += "; Partitioned"), l2.priority) switch ("string" == typeof l2.priority ? l2.priority.toLowerCase() : void 0) {
          case "low":
            h += "; Priority=Low";
            break;
          case "medium":
            h += "; Priority=Medium";
            break;
          case "high":
            h += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${l2.priority}`);
        }
        if (l2.sameSite) switch ("string" == typeof l2.sameSite ? l2.sameSite.toLowerCase() : l2.sameSite) {
          case true:
          case "strict":
            h += "; SameSite=Strict";
            break;
          case "lax":
            h += "; SameSite=Lax";
            break;
          case "none":
            h += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${l2.sameSite}`);
        }
        return h;
      }
      function u(e2, t2, r2) {
        let s2 = t2, i2 = r2;
        do {
          let t3 = e2.charCodeAt(s2);
          if (32 !== t3 && 9 !== t3) break;
        } while (++s2 < i2);
        for (; i2 > s2; ) {
          let t3 = e2.charCodeAt(i2 - 1);
          if (32 !== t3 && 9 !== t3) break;
          i2--;
        }
        return e2.slice(s2, i2);
      }
      function c(e2) {
        if (-1 === e2.indexOf("%")) return e2;
        try {
          return decodeURIComponent(e2);
        } catch (t2) {
          return e2;
        }
      }
    }, 945: (e) => {
      "use strict";
      var t = Object.defineProperty, r = Object.getOwnPropertyDescriptor, s = Object.getOwnPropertyNames, i = Object.prototype.hasOwnProperty, n = {};
      function a(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), s2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? s2 : `${s2}; ${r2.join("; ")}`;
      }
      function o(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [s2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(s2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function l(e2) {
        var t2, r2;
        if (!e2) return;
        let [[s2, i2], ...n2] = o(e2), { domain: a2, expires: l2, httponly: h2, maxage: d2, path: p, samesite: f, secure: g, partitioned: m, priority: b } = Object.fromEntries(n2.map(([e3, t3]) => [e3.toLowerCase(), t3]));
        return function(e3) {
          let t3 = {};
          for (let r3 in e3) e3[r3] && (t3[r3] = e3[r3]);
          return t3;
        }({ name: s2, value: decodeURIComponent(i2), domain: a2, ...l2 && { expires: new Date(l2) }, ...h2 && { httpOnly: true }, ..."string" == typeof d2 && { maxAge: Number(d2) }, path: p, ...f && { sameSite: u.includes(t2 = (t2 = f).toLowerCase()) ? t2 : void 0 }, ...g && { secure: true }, ...b && { priority: c.includes(r2 = (r2 = b).toLowerCase()) ? r2 : void 0 }, ...m && { partitioned: true } });
      }
      ((e2, r2) => {
        for (var s2 in r2) t(e2, s2, { get: r2[s2], enumerable: true });
      })(n, { RequestCookies: () => h, ResponseCookies: () => d, parseCookie: () => o, parseSetCookie: () => l, stringifyCookie: () => a }), e.exports = ((e2, n2, a2, o2) => {
        if (n2 && "object" == typeof n2 || "function" == typeof n2) for (let l2 of s(n2)) i.call(e2, l2) || l2 === a2 || t(e2, l2, { get: () => n2[l2], enumerable: !(o2 = r(n2, l2)) || o2.enumerable });
        return e2;
      })(t({}, "__esModule", { value: true }), n);
      var u = ["strict", "lax", "none"], c = ["low", "medium", "high"], h = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let t2 = e2.get("cookie");
          if (t2) for (let [e3, r2] of o(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let s2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === s2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, s2 = this._parsed;
          return s2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(s2).map(([e3, t3]) => a(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => a(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, d = class {
        constructor(e2) {
          var t2, r2, s2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let i2 = null != (s2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? s2 : [];
          for (let e3 of Array.isArray(i2) ? i2 : function(e4) {
            if (!e4) return [];
            var t3, r3, s3, i3, n2, a2 = [], o2 = 0;
            function l2() {
              for (; o2 < e4.length && /\s/.test(e4.charAt(o2)); ) o2 += 1;
              return o2 < e4.length;
            }
            for (; o2 < e4.length; ) {
              for (t3 = o2, n2 = false; l2(); ) if ("," === (r3 = e4.charAt(o2))) {
                for (s3 = o2, o2 += 1, l2(), i3 = o2; o2 < e4.length && "=" !== (r3 = e4.charAt(o2)) && ";" !== r3 && "," !== r3; ) o2 += 1;
                o2 < e4.length && "=" === e4.charAt(o2) ? (n2 = true, o2 = i3, a2.push(e4.substring(t3, s3)), t3 = o2) : o2 = s3 + 1;
              } else o2 += 1;
              (!n2 || o2 >= e4.length) && a2.push(e4.substring(t3, e4.length));
            }
            return a2;
          }(i2)) {
            let t3 = l(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let s2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === s2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, s2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          }({ name: t2, value: r2, ...s2 })), function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = a(r3);
              t3.append("set-cookie", e4);
            }
          }(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2, s2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0].path, e2[0].domain];
          return this.set({ name: t2, path: r2, domain: s2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(a).join("; ");
        }
      };
    }, 439: (e, t, r) => {
      (() => {
        "use strict";
        var t2 = { 491: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ContextAPI = void 0;
          let s2 = r2(223), i2 = r2(172), n2 = r2(930), a = "context", o = new s2.NoopContextManager();
          class l {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalContextManager(e3) {
              return (0, i2.registerGlobal)(a, e3, n2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(e3, t4, r3, ...s3) {
              return this._getContextManager().with(e3, t4, r3, ...s3);
            }
            bind(e3, t4) {
              return this._getContextManager().bind(e3, t4);
            }
            _getContextManager() {
              return (0, i2.getGlobal)(a) || o;
            }
            disable() {
              this._getContextManager().disable(), (0, i2.unregisterGlobal)(a, n2.DiagAPI.instance());
            }
          }
          t3.ContextAPI = l;
        }, 930: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagAPI = void 0;
          let s2 = r2(56), i2 = r2(912), n2 = r2(957), a = r2(172);
          class o {
            constructor() {
              function e3(e4) {
                return function(...t5) {
                  let r3 = (0, a.getGlobal)("diag");
                  if (r3) return r3[e4](...t5);
                };
              }
              let t4 = this;
              t4.setLogger = (e4, r3 = { logLevel: n2.DiagLogLevel.INFO }) => {
                var s3, o2, l;
                if (e4 === t4) {
                  let e5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return t4.error(null !== (s3 = e5.stack) && void 0 !== s3 ? s3 : e5.message), false;
                }
                "number" == typeof r3 && (r3 = { logLevel: r3 });
                let u = (0, a.getGlobal)("diag"), c = (0, i2.createLogLevelDiagLogger)(null !== (o2 = r3.logLevel) && void 0 !== o2 ? o2 : n2.DiagLogLevel.INFO, e4);
                if (u && !r3.suppressOverrideMessage) {
                  let e5 = null !== (l = Error().stack) && void 0 !== l ? l : "<failed to generate stacktrace>";
                  u.warn(`Current logger will be overwritten from ${e5}`), c.warn(`Current logger will overwrite one already registered from ${e5}`);
                }
                return (0, a.registerGlobal)("diag", c, t4, true);
              }, t4.disable = () => {
                (0, a.unregisterGlobal)("diag", t4);
              }, t4.createComponentLogger = (e4) => new s2.DiagComponentLogger(e4), t4.verbose = e3("verbose"), t4.debug = e3("debug"), t4.info = e3("info"), t4.warn = e3("warn"), t4.error = e3("error");
            }
            static instance() {
              return this._instance || (this._instance = new o()), this._instance;
            }
          }
          t3.DiagAPI = o;
        }, 653: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.MetricsAPI = void 0;
          let s2 = r2(660), i2 = r2(172), n2 = r2(930), a = "metrics";
          class o {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new o()), this._instance;
            }
            setGlobalMeterProvider(e3) {
              return (0, i2.registerGlobal)(a, e3, n2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, i2.getGlobal)(a) || s2.NOOP_METER_PROVIDER;
            }
            getMeter(e3, t4, r3) {
              return this.getMeterProvider().getMeter(e3, t4, r3);
            }
            disable() {
              (0, i2.unregisterGlobal)(a, n2.DiagAPI.instance());
            }
          }
          t3.MetricsAPI = o;
        }, 181: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.PropagationAPI = void 0;
          let s2 = r2(172), i2 = r2(874), n2 = r2(194), a = r2(277), o = r2(369), l = r2(930), u = "propagation", c = new i2.NoopTextMapPropagator();
          class h {
            constructor() {
              this.createBaggage = o.createBaggage, this.getBaggage = a.getBaggage, this.getActiveBaggage = a.getActiveBaggage, this.setBaggage = a.setBaggage, this.deleteBaggage = a.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
            setGlobalPropagator(e3) {
              return (0, s2.registerGlobal)(u, e3, l.DiagAPI.instance());
            }
            inject(e3, t4, r3 = n2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(e3, t4, r3);
            }
            extract(e3, t4, r3 = n2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(e3, t4, r3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, s2.unregisterGlobal)(u, l.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, s2.getGlobal)(u) || c;
            }
          }
          t3.PropagationAPI = h;
        }, 997: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceAPI = void 0;
          let s2 = r2(172), i2 = r2(846), n2 = r2(139), a = r2(607), o = r2(930), l = "trace";
          class u {
            constructor() {
              this._proxyTracerProvider = new i2.ProxyTracerProvider(), this.wrapSpanContext = n2.wrapSpanContext, this.isSpanContextValid = n2.isSpanContextValid, this.deleteSpan = a.deleteSpan, this.getSpan = a.getSpan, this.getActiveSpan = a.getActiveSpan, this.getSpanContext = a.getSpanContext, this.setSpan = a.setSpan, this.setSpanContext = a.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new u()), this._instance;
            }
            setGlobalTracerProvider(e3) {
              let t4 = (0, s2.registerGlobal)(l, this._proxyTracerProvider, o.DiagAPI.instance());
              return t4 && this._proxyTracerProvider.setDelegate(e3), t4;
            }
            getTracerProvider() {
              return (0, s2.getGlobal)(l) || this._proxyTracerProvider;
            }
            getTracer(e3, t4) {
              return this.getTracerProvider().getTracer(e3, t4);
            }
            disable() {
              (0, s2.unregisterGlobal)(l, o.DiagAPI.instance()), this._proxyTracerProvider = new i2.ProxyTracerProvider();
            }
          }
          t3.TraceAPI = u;
        }, 277: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.deleteBaggage = t3.setBaggage = t3.getActiveBaggage = t3.getBaggage = void 0;
          let s2 = r2(491), i2 = (0, r2(780).createContextKey)("OpenTelemetry Baggage Key");
          function n2(e3) {
            return e3.getValue(i2) || void 0;
          }
          t3.getBaggage = n2, t3.getActiveBaggage = function() {
            return n2(s2.ContextAPI.getInstance().active());
          }, t3.setBaggage = function(e3, t4) {
            return e3.setValue(i2, t4);
          }, t3.deleteBaggage = function(e3) {
            return e3.deleteValue(i2);
          };
        }, 993: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.BaggageImpl = void 0;
          class r2 {
            constructor(e3) {
              this._entries = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
            }
            getEntry(e3) {
              let t4 = this._entries.get(e3);
              if (t4) return Object.assign({}, t4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([e3, t4]) => [e3, t4]);
            }
            setEntry(e3, t4) {
              let s2 = new r2(this._entries);
              return s2._entries.set(e3, t4), s2;
            }
            removeEntry(e3) {
              let t4 = new r2(this._entries);
              return t4._entries.delete(e3), t4;
            }
            removeEntries(...e3) {
              let t4 = new r2(this._entries);
              for (let r3 of e3) t4._entries.delete(r3);
              return t4;
            }
            clear() {
              return new r2();
            }
          }
          t3.BaggageImpl = r2;
        }, 830: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataSymbol = void 0, t3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataFromString = t3.createBaggage = void 0;
          let s2 = r2(930), i2 = r2(993), n2 = r2(830), a = s2.DiagAPI.instance();
          t3.createBaggage = function(e3 = {}) {
            return new i2.BaggageImpl(new Map(Object.entries(e3)));
          }, t3.baggageEntryMetadataFromString = function(e3) {
            return "string" != typeof e3 && (a.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`), e3 = ""), { __TYPE__: n2.baggageEntryMetadataSymbol, toString: () => e3 };
          };
        }, 67: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.context = void 0;
          let s2 = r2(491);
          t3.context = s2.ContextAPI.getInstance();
        }, 223: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopContextManager = void 0;
          let s2 = r2(780);
          class i2 {
            active() {
              return s2.ROOT_CONTEXT;
            }
            with(e3, t4, r3, ...s3) {
              return t4.call(r3, ...s3);
            }
            bind(e3, t4) {
              return t4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          t3.NoopContextManager = i2;
        }, 780: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ROOT_CONTEXT = t3.createContextKey = void 0, t3.createContextKey = function(e3) {
            return Symbol.for(e3);
          };
          class r2 {
            constructor(e3) {
              let t4 = this;
              t4._currentContext = e3 ? new Map(e3) : /* @__PURE__ */ new Map(), t4.getValue = (e4) => t4._currentContext.get(e4), t4.setValue = (e4, s2) => {
                let i2 = new r2(t4._currentContext);
                return i2._currentContext.set(e4, s2), i2;
              }, t4.deleteValue = (e4) => {
                let s2 = new r2(t4._currentContext);
                return s2._currentContext.delete(e4), s2;
              };
            }
          }
          t3.ROOT_CONTEXT = new r2();
        }, 506: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.diag = void 0;
          let s2 = r2(930);
          t3.diag = s2.DiagAPI.instance();
        }, 56: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagComponentLogger = void 0;
          let s2 = r2(172);
          class i2 {
            constructor(e3) {
              this._namespace = e3.namespace || "DiagComponentLogger";
            }
            debug(...e3) {
              return n2("debug", this._namespace, e3);
            }
            error(...e3) {
              return n2("error", this._namespace, e3);
            }
            info(...e3) {
              return n2("info", this._namespace, e3);
            }
            warn(...e3) {
              return n2("warn", this._namespace, e3);
            }
            verbose(...e3) {
              return n2("verbose", this._namespace, e3);
            }
          }
          function n2(e3, t4, r3) {
            let i3 = (0, s2.getGlobal)("diag");
            if (i3) return r3.unshift(t4), i3[e3](...r3);
          }
          t3.DiagComponentLogger = i2;
        }, 972: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagConsoleLogger = void 0;
          let r2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class s2 {
            constructor() {
              for (let e3 = 0; e3 < r2.length; e3++) this[r2[e3].n] = /* @__PURE__ */ function(e4) {
                return function(...t4) {
                  if (console) {
                    let r3 = console[e4];
                    if ("function" != typeof r3 && (r3 = console.log), "function" == typeof r3) return r3.apply(console, t4);
                  }
                };
              }(r2[e3].c);
            }
          }
          t3.DiagConsoleLogger = s2;
        }, 912: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createLogLevelDiagLogger = void 0;
          let s2 = r2(957);
          t3.createLogLevelDiagLogger = function(e3, t4) {
            function r3(r4, s3) {
              let i2 = t4[r4];
              return "function" == typeof i2 && e3 >= s3 ? i2.bind(t4) : function() {
              };
            }
            return e3 < s2.DiagLogLevel.NONE ? e3 = s2.DiagLogLevel.NONE : e3 > s2.DiagLogLevel.ALL && (e3 = s2.DiagLogLevel.ALL), t4 = t4 || {}, { error: r3("error", s2.DiagLogLevel.ERROR), warn: r3("warn", s2.DiagLogLevel.WARN), info: r3("info", s2.DiagLogLevel.INFO), debug: r3("debug", s2.DiagLogLevel.DEBUG), verbose: r3("verbose", s2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagLogLevel = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.ERROR = 30] = "ERROR", e3[e3.WARN = 50] = "WARN", e3[e3.INFO = 60] = "INFO", e3[e3.DEBUG = 70] = "DEBUG", e3[e3.VERBOSE = 80] = "VERBOSE", e3[e3.ALL = 9999] = "ALL";
          }(t3.DiagLogLevel || (t3.DiagLogLevel = {}));
        }, 172: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.unregisterGlobal = t3.getGlobal = t3.registerGlobal = void 0;
          let s2 = r2(200), i2 = r2(521), n2 = r2(130), a = i2.VERSION.split(".")[0], o = Symbol.for(`opentelemetry.js.api.${a}`), l = s2._globalThis;
          t3.registerGlobal = function(e3, t4, r3, s3 = false) {
            var n3;
            let a2 = l[o] = null !== (n3 = l[o]) && void 0 !== n3 ? n3 : { version: i2.VERSION };
            if (!s3 && a2[e3]) {
              let t5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
              return r3.error(t5.stack || t5.message), false;
            }
            if (a2.version !== i2.VERSION) {
              let t5 = Error(`@opentelemetry/api: Registration of version v${a2.version} for ${e3} does not match previously registered API v${i2.VERSION}`);
              return r3.error(t5.stack || t5.message), false;
            }
            return a2[e3] = t4, r3.debug(`@opentelemetry/api: Registered a global for ${e3} v${i2.VERSION}.`), true;
          }, t3.getGlobal = function(e3) {
            var t4, r3;
            let s3 = null === (t4 = l[o]) || void 0 === t4 ? void 0 : t4.version;
            if (s3 && (0, n2.isCompatible)(s3)) return null === (r3 = l[o]) || void 0 === r3 ? void 0 : r3[e3];
          }, t3.unregisterGlobal = function(e3, t4) {
            t4.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${i2.VERSION}.`);
            let r3 = l[o];
            r3 && delete r3[e3];
          };
        }, 130: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.isCompatible = t3._makeCompatibilityCheck = void 0;
          let s2 = r2(521), i2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function n2(e3) {
            let t4 = /* @__PURE__ */ new Set([e3]), r3 = /* @__PURE__ */ new Set(), s3 = e3.match(i2);
            if (!s3) return () => false;
            let n3 = { major: +s3[1], minor: +s3[2], patch: +s3[3], prerelease: s3[4] };
            if (null != n3.prerelease) return function(t5) {
              return t5 === e3;
            };
            function a(e4) {
              return r3.add(e4), false;
            }
            return function(e4) {
              if (t4.has(e4)) return true;
              if (r3.has(e4)) return false;
              let s4 = e4.match(i2);
              if (!s4) return a(e4);
              let o = { major: +s4[1], minor: +s4[2], patch: +s4[3], prerelease: s4[4] };
              return null != o.prerelease || n3.major !== o.major ? a(e4) : 0 === n3.major ? n3.minor === o.minor && n3.patch <= o.patch ? (t4.add(e4), true) : a(e4) : n3.minor <= o.minor ? (t4.add(e4), true) : a(e4);
            };
          }
          t3._makeCompatibilityCheck = n2, t3.isCompatible = n2(s2.VERSION);
        }, 886: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.metrics = void 0;
          let s2 = r2(653);
          t3.metrics = s2.MetricsAPI.getInstance();
        }, 901: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ValueType = void 0, function(e3) {
            e3[e3.INT = 0] = "INT", e3[e3.DOUBLE = 1] = "DOUBLE";
          }(t3.ValueType || (t3.ValueType = {}));
        }, 102: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createNoopMeter = t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t3.NOOP_OBSERVABLE_GAUGE_METRIC = t3.NOOP_OBSERVABLE_COUNTER_METRIC = t3.NOOP_UP_DOWN_COUNTER_METRIC = t3.NOOP_HISTOGRAM_METRIC = t3.NOOP_COUNTER_METRIC = t3.NOOP_METER = t3.NoopObservableUpDownCounterMetric = t3.NoopObservableGaugeMetric = t3.NoopObservableCounterMetric = t3.NoopObservableMetric = t3.NoopHistogramMetric = t3.NoopUpDownCounterMetric = t3.NoopCounterMetric = t3.NoopMetric = t3.NoopMeter = void 0;
          class r2 {
            constructor() {
            }
            createHistogram(e3, r3) {
              return t3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(e3, r3) {
              return t3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(e3, r3) {
              return t3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(e3, r3) {
              return t3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(e3, t4) {
            }
            removeBatchObservableCallback(e3) {
            }
          }
          t3.NoopMeter = r2;
          class s2 {
          }
          t3.NoopMetric = s2;
          class i2 extends s2 {
            add(e3, t4) {
            }
          }
          t3.NoopCounterMetric = i2;
          class n2 extends s2 {
            add(e3, t4) {
            }
          }
          t3.NoopUpDownCounterMetric = n2;
          class a extends s2 {
            record(e3, t4) {
            }
          }
          t3.NoopHistogramMetric = a;
          class o {
            addCallback(e3) {
            }
            removeCallback(e3) {
            }
          }
          t3.NoopObservableMetric = o;
          class l extends o {
          }
          t3.NoopObservableCounterMetric = l;
          class u extends o {
          }
          t3.NoopObservableGaugeMetric = u;
          class c extends o {
          }
          t3.NoopObservableUpDownCounterMetric = c, t3.NOOP_METER = new r2(), t3.NOOP_COUNTER_METRIC = new i2(), t3.NOOP_HISTOGRAM_METRIC = new a(), t3.NOOP_UP_DOWN_COUNTER_METRIC = new n2(), t3.NOOP_OBSERVABLE_COUNTER_METRIC = new l(), t3.NOOP_OBSERVABLE_GAUGE_METRIC = new u(), t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new c(), t3.createNoopMeter = function() {
            return t3.NOOP_METER;
          };
        }, 660: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NOOP_METER_PROVIDER = t3.NoopMeterProvider = void 0;
          let s2 = r2(102);
          class i2 {
            getMeter(e3, t4, r3) {
              return s2.NOOP_METER;
            }
          }
          t3.NoopMeterProvider = i2, t3.NOOP_METER_PROVIDER = new i2();
        }, 200: function(e2, t3, r2) {
          var s2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, s3) {
            void 0 === s3 && (s3 = r3), Object.defineProperty(e3, s3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, s3) {
            void 0 === s3 && (s3 = r3), e3[s3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || s2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(46), t3);
        }, 651: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3._globalThis = void 0, t3._globalThis = "object" == typeof globalThis ? globalThis : r.g;
        }, 46: function(e2, t3, r2) {
          var s2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, s3) {
            void 0 === s3 && (s3 = r3), Object.defineProperty(e3, s3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, s3) {
            void 0 === s3 && (s3 = r3), e3[s3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || s2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(651), t3);
        }, 939: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.propagation = void 0;
          let s2 = r2(181);
          t3.propagation = s2.PropagationAPI.getInstance();
        }, 874: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTextMapPropagator = void 0;
          class r2 {
            inject(e3, t4) {
            }
            extract(e3, t4) {
              return e3;
            }
            fields() {
              return [];
            }
          }
          t3.NoopTextMapPropagator = r2;
        }, 194: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.defaultTextMapSetter = t3.defaultTextMapGetter = void 0, t3.defaultTextMapGetter = { get(e3, t4) {
            if (null != e3) return e3[t4];
          }, keys: (e3) => null == e3 ? [] : Object.keys(e3) }, t3.defaultTextMapSetter = { set(e3, t4, r2) {
            null != e3 && (e3[t4] = r2);
          } };
        }, 845: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.trace = void 0;
          let s2 = r2(997);
          t3.trace = s2.TraceAPI.getInstance();
        }, 403: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NonRecordingSpan = void 0;
          let s2 = r2(476);
          class i2 {
            constructor(e3 = s2.INVALID_SPAN_CONTEXT) {
              this._spanContext = e3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(e3, t4) {
              return this;
            }
            setAttributes(e3) {
              return this;
            }
            addEvent(e3, t4) {
              return this;
            }
            setStatus(e3) {
              return this;
            }
            updateName(e3) {
              return this;
            }
            end(e3) {
            }
            isRecording() {
              return false;
            }
            recordException(e3, t4) {
            }
          }
          t3.NonRecordingSpan = i2;
        }, 614: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracer = void 0;
          let s2 = r2(491), i2 = r2(607), n2 = r2(403), a = r2(139), o = s2.ContextAPI.getInstance();
          class l {
            startSpan(e3, t4, r3 = o.active()) {
              if (null == t4 ? void 0 : t4.root) return new n2.NonRecordingSpan();
              let s3 = r3 && (0, i2.getSpanContext)(r3);
              return "object" == typeof s3 && "string" == typeof s3.spanId && "string" == typeof s3.traceId && "number" == typeof s3.traceFlags && (0, a.isSpanContextValid)(s3) ? new n2.NonRecordingSpan(s3) : new n2.NonRecordingSpan();
            }
            startActiveSpan(e3, t4, r3, s3) {
              let n3, a2, l2;
              if (arguments.length < 2) return;
              2 == arguments.length ? l2 = t4 : 3 == arguments.length ? (n3 = t4, l2 = r3) : (n3 = t4, a2 = r3, l2 = s3);
              let u = null != a2 ? a2 : o.active(), c = this.startSpan(e3, n3, u), h = (0, i2.setSpan)(u, c);
              return o.with(h, l2, void 0, c);
            }
          }
          t3.NoopTracer = l;
        }, 124: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracerProvider = void 0;
          let s2 = r2(614);
          class i2 {
            getTracer(e3, t4, r3) {
              return new s2.NoopTracer();
            }
          }
          t3.NoopTracerProvider = i2;
        }, 125: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracer = void 0;
          let s2 = new (r2(614)).NoopTracer();
          class i2 {
            constructor(e3, t4, r3, s3) {
              this._provider = e3, this.name = t4, this.version = r3, this.options = s3;
            }
            startSpan(e3, t4, r3) {
              return this._getTracer().startSpan(e3, t4, r3);
            }
            startActiveSpan(e3, t4, r3, s3) {
              let i3 = this._getTracer();
              return Reflect.apply(i3.startActiveSpan, i3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return e3 ? (this._delegate = e3, this._delegate) : s2;
            }
          }
          t3.ProxyTracer = i2;
        }, 846: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracerProvider = void 0;
          let s2 = r2(125), i2 = new (r2(124)).NoopTracerProvider();
          class n2 {
            getTracer(e3, t4, r3) {
              var i3;
              return null !== (i3 = this.getDelegateTracer(e3, t4, r3)) && void 0 !== i3 ? i3 : new s2.ProxyTracer(this, e3, t4, r3);
            }
            getDelegate() {
              var e3;
              return null !== (e3 = this._delegate) && void 0 !== e3 ? e3 : i2;
            }
            setDelegate(e3) {
              this._delegate = e3;
            }
            getDelegateTracer(e3, t4, r3) {
              var s3;
              return null === (s3 = this._delegate) || void 0 === s3 ? void 0 : s3.getTracer(e3, t4, r3);
            }
          }
          t3.ProxyTracerProvider = n2;
        }, 996: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SamplingDecision = void 0, function(e3) {
            e3[e3.NOT_RECORD = 0] = "NOT_RECORD", e3[e3.RECORD = 1] = "RECORD", e3[e3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(t3.SamplingDecision || (t3.SamplingDecision = {}));
        }, 607: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.getSpanContext = t3.setSpanContext = t3.deleteSpan = t3.setSpan = t3.getActiveSpan = t3.getSpan = void 0;
          let s2 = r2(780), i2 = r2(403), n2 = r2(491), a = (0, s2.createContextKey)("OpenTelemetry Context Key SPAN");
          function o(e3) {
            return e3.getValue(a) || void 0;
          }
          function l(e3, t4) {
            return e3.setValue(a, t4);
          }
          t3.getSpan = o, t3.getActiveSpan = function() {
            return o(n2.ContextAPI.getInstance().active());
          }, t3.setSpan = l, t3.deleteSpan = function(e3) {
            return e3.deleteValue(a);
          }, t3.setSpanContext = function(e3, t4) {
            return l(e3, new i2.NonRecordingSpan(t4));
          }, t3.getSpanContext = function(e3) {
            var t4;
            return null === (t4 = o(e3)) || void 0 === t4 ? void 0 : t4.spanContext();
          };
        }, 325: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceStateImpl = void 0;
          let s2 = r2(564);
          class i2 {
            constructor(e3) {
              this._internalState = /* @__PURE__ */ new Map(), e3 && this._parse(e3);
            }
            set(e3, t4) {
              let r3 = this._clone();
              return r3._internalState.has(e3) && r3._internalState.delete(e3), r3._internalState.set(e3, t4), r3;
            }
            unset(e3) {
              let t4 = this._clone();
              return t4._internalState.delete(e3), t4;
            }
            get(e3) {
              return this._internalState.get(e3);
            }
            serialize() {
              return this._keys().reduce((e3, t4) => (e3.push(t4 + "=" + this.get(t4)), e3), []).join(",");
            }
            _parse(e3) {
              !(e3.length > 512) && (this._internalState = e3.split(",").reverse().reduce((e4, t4) => {
                let r3 = t4.trim(), i3 = r3.indexOf("=");
                if (-1 !== i3) {
                  let n2 = r3.slice(0, i3), a = r3.slice(i3 + 1, t4.length);
                  (0, s2.validateKey)(n2) && (0, s2.validateValue)(a) && e4.set(n2, a);
                }
                return e4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let e3 = new i2();
              return e3._internalState = new Map(this._internalState), e3;
            }
          }
          t3.TraceStateImpl = i2;
        }, 564: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.validateValue = t3.validateKey = void 0;
          let r2 = "[_0-9a-z-*/]", s2 = `[a-z]${r2}{0,255}`, i2 = `[a-z0-9]${r2}{0,240}@[a-z]${r2}{0,13}`, n2 = RegExp(`^(?:${s2}|${i2})$`), a = /^[ -~]{0,255}[!-~]$/, o = /,|=/;
          t3.validateKey = function(e3) {
            return n2.test(e3);
          }, t3.validateValue = function(e3) {
            return a.test(e3) && !o.test(e3);
          };
        }, 98: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createTraceState = void 0;
          let s2 = r2(325);
          t3.createTraceState = function(e3) {
            return new s2.TraceStateImpl(e3);
          };
        }, 476: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.INVALID_SPAN_CONTEXT = t3.INVALID_TRACEID = t3.INVALID_SPANID = void 0;
          let s2 = r2(475);
          t3.INVALID_SPANID = "0000000000000000", t3.INVALID_TRACEID = "00000000000000000000000000000000", t3.INVALID_SPAN_CONTEXT = { traceId: t3.INVALID_TRACEID, spanId: t3.INVALID_SPANID, traceFlags: s2.TraceFlags.NONE };
        }, 357: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanKind = void 0, function(e3) {
            e3[e3.INTERNAL = 0] = "INTERNAL", e3[e3.SERVER = 1] = "SERVER", e3[e3.CLIENT = 2] = "CLIENT", e3[e3.PRODUCER = 3] = "PRODUCER", e3[e3.CONSUMER = 4] = "CONSUMER";
          }(t3.SpanKind || (t3.SpanKind = {}));
        }, 139: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.wrapSpanContext = t3.isSpanContextValid = t3.isValidSpanId = t3.isValidTraceId = void 0;
          let s2 = r2(476), i2 = r2(403), n2 = /^([0-9a-f]{32})$/i, a = /^[0-9a-f]{16}$/i;
          function o(e3) {
            return n2.test(e3) && e3 !== s2.INVALID_TRACEID;
          }
          function l(e3) {
            return a.test(e3) && e3 !== s2.INVALID_SPANID;
          }
          t3.isValidTraceId = o, t3.isValidSpanId = l, t3.isSpanContextValid = function(e3) {
            return o(e3.traceId) && l(e3.spanId);
          }, t3.wrapSpanContext = function(e3) {
            return new i2.NonRecordingSpan(e3);
          };
        }, 847: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanStatusCode = void 0, function(e3) {
            e3[e3.UNSET = 0] = "UNSET", e3[e3.OK = 1] = "OK", e3[e3.ERROR = 2] = "ERROR";
          }(t3.SpanStatusCode || (t3.SpanStatusCode = {}));
        }, 475: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceFlags = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.SAMPLED = 1] = "SAMPLED";
          }(t3.TraceFlags || (t3.TraceFlags = {}));
        }, 521: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.VERSION = void 0, t3.VERSION = "1.6.0";
        } }, s = {};
        function i(e2) {
          var r2 = s[e2];
          if (void 0 !== r2) return r2.exports;
          var n2 = s[e2] = { exports: {} }, a = true;
          try {
            t2[e2].call(n2.exports, n2, n2.exports, i), a = false;
          } finally {
            a && delete s[e2];
          }
          return n2.exports;
        }
        i.ab = "//";
        var n = {};
        (() => {
          Object.defineProperty(n, "__esModule", { value: true }), n.trace = n.propagation = n.metrics = n.diag = n.context = n.INVALID_SPAN_CONTEXT = n.INVALID_TRACEID = n.INVALID_SPANID = n.isValidSpanId = n.isValidTraceId = n.isSpanContextValid = n.createTraceState = n.TraceFlags = n.SpanStatusCode = n.SpanKind = n.SamplingDecision = n.ProxyTracerProvider = n.ProxyTracer = n.defaultTextMapSetter = n.defaultTextMapGetter = n.ValueType = n.createNoopMeter = n.DiagLogLevel = n.DiagConsoleLogger = n.ROOT_CONTEXT = n.createContextKey = n.baggageEntryMetadataFromString = void 0;
          var e2 = i(369);
          Object.defineProperty(n, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return e2.baggageEntryMetadataFromString;
          } });
          var t3 = i(780);
          Object.defineProperty(n, "createContextKey", { enumerable: true, get: function() {
            return t3.createContextKey;
          } }), Object.defineProperty(n, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return t3.ROOT_CONTEXT;
          } });
          var r2 = i(972);
          Object.defineProperty(n, "DiagConsoleLogger", { enumerable: true, get: function() {
            return r2.DiagConsoleLogger;
          } });
          var s2 = i(957);
          Object.defineProperty(n, "DiagLogLevel", { enumerable: true, get: function() {
            return s2.DiagLogLevel;
          } });
          var a = i(102);
          Object.defineProperty(n, "createNoopMeter", { enumerable: true, get: function() {
            return a.createNoopMeter;
          } });
          var o = i(901);
          Object.defineProperty(n, "ValueType", { enumerable: true, get: function() {
            return o.ValueType;
          } });
          var l = i(194);
          Object.defineProperty(n, "defaultTextMapGetter", { enumerable: true, get: function() {
            return l.defaultTextMapGetter;
          } }), Object.defineProperty(n, "defaultTextMapSetter", { enumerable: true, get: function() {
            return l.defaultTextMapSetter;
          } });
          var u = i(125);
          Object.defineProperty(n, "ProxyTracer", { enumerable: true, get: function() {
            return u.ProxyTracer;
          } });
          var c = i(846);
          Object.defineProperty(n, "ProxyTracerProvider", { enumerable: true, get: function() {
            return c.ProxyTracerProvider;
          } });
          var h = i(996);
          Object.defineProperty(n, "SamplingDecision", { enumerable: true, get: function() {
            return h.SamplingDecision;
          } });
          var d = i(357);
          Object.defineProperty(n, "SpanKind", { enumerable: true, get: function() {
            return d.SpanKind;
          } });
          var p = i(847);
          Object.defineProperty(n, "SpanStatusCode", { enumerable: true, get: function() {
            return p.SpanStatusCode;
          } });
          var f = i(475);
          Object.defineProperty(n, "TraceFlags", { enumerable: true, get: function() {
            return f.TraceFlags;
          } });
          var g = i(98);
          Object.defineProperty(n, "createTraceState", { enumerable: true, get: function() {
            return g.createTraceState;
          } });
          var m = i(139);
          Object.defineProperty(n, "isSpanContextValid", { enumerable: true, get: function() {
            return m.isSpanContextValid;
          } }), Object.defineProperty(n, "isValidTraceId", { enumerable: true, get: function() {
            return m.isValidTraceId;
          } }), Object.defineProperty(n, "isValidSpanId", { enumerable: true, get: function() {
            return m.isValidSpanId;
          } });
          var b = i(476);
          Object.defineProperty(n, "INVALID_SPANID", { enumerable: true, get: function() {
            return b.INVALID_SPANID;
          } }), Object.defineProperty(n, "INVALID_TRACEID", { enumerable: true, get: function() {
            return b.INVALID_TRACEID;
          } }), Object.defineProperty(n, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return b.INVALID_SPAN_CONTEXT;
          } });
          let y = i(67);
          Object.defineProperty(n, "context", { enumerable: true, get: function() {
            return y.context;
          } });
          let w = i(506);
          Object.defineProperty(n, "diag", { enumerable: true, get: function() {
            return w.diag;
          } });
          let v = i(886);
          Object.defineProperty(n, "metrics", { enumerable: true, get: function() {
            return v.metrics;
          } });
          let _ = i(939);
          Object.defineProperty(n, "propagation", { enumerable: true, get: function() {
            return _.propagation;
          } });
          let k = i(845);
          Object.defineProperty(n, "trace", { enumerable: true, get: function() {
            return k.trace;
          } }), n.default = { context: y.context, diag: w.diag, metrics: v.metrics, propagation: _.propagation, trace: k.trace };
        })(), e.exports = n;
      })();
    }, 133: (e) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var t = {};
        (() => {
          t.parse = function(t2, r2) {
            if ("string" != typeof t2) throw TypeError("argument str must be a string");
            for (var i2 = {}, n = t2.split(s), a = (r2 || {}).decode || e2, o = 0; o < n.length; o++) {
              var l = n[o], u = l.indexOf("=");
              if (!(u < 0)) {
                var c = l.substr(0, u).trim(), h = l.substr(++u, l.length).trim();
                '"' == h[0] && (h = h.slice(1, -1)), void 0 == i2[c] && (i2[c] = function(e3, t3) {
                  try {
                    return t3(e3);
                  } catch (t4) {
                    return e3;
                  }
                }(h, a));
              }
            }
            return i2;
          }, t.serialize = function(e3, t2, s2) {
            var n = s2 || {}, a = n.encode || r;
            if ("function" != typeof a) throw TypeError("option encode is invalid");
            if (!i.test(e3)) throw TypeError("argument name is invalid");
            var o = a(t2);
            if (o && !i.test(o)) throw TypeError("argument val is invalid");
            var l = e3 + "=" + o;
            if (null != n.maxAge) {
              var u = n.maxAge - 0;
              if (isNaN(u) || !isFinite(u)) throw TypeError("option maxAge is invalid");
              l += "; Max-Age=" + Math.floor(u);
            }
            if (n.domain) {
              if (!i.test(n.domain)) throw TypeError("option domain is invalid");
              l += "; Domain=" + n.domain;
            }
            if (n.path) {
              if (!i.test(n.path)) throw TypeError("option path is invalid");
              l += "; Path=" + n.path;
            }
            if (n.expires) {
              if ("function" != typeof n.expires.toUTCString) throw TypeError("option expires is invalid");
              l += "; Expires=" + n.expires.toUTCString();
            }
            if (n.httpOnly && (l += "; HttpOnly"), n.secure && (l += "; Secure"), n.sameSite) switch ("string" == typeof n.sameSite ? n.sameSite.toLowerCase() : n.sameSite) {
              case true:
              case "strict":
                l += "; SameSite=Strict";
                break;
              case "lax":
                l += "; SameSite=Lax";
                break;
              case "none":
                l += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return l;
          };
          var e2 = decodeURIComponent, r = encodeURIComponent, s = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), e.exports = t;
      })();
    }, 340: (e, t, r) => {
      var s;
      (() => {
        var i = { 226: function(i2, n2) {
          !function(a2, o2) {
            "use strict";
            var l = "function", u = "undefined", c = "object", h = "string", d = "major", p = "model", f = "name", g = "type", m = "vendor", b = "version", y = "architecture", w = "console", v = "mobile", _ = "tablet", k = "smarttv", S = "wearable", T = "embedded", E = "Amazon", R = "Apple", O = "ASUS", A = "BlackBerry", P = "Browser", C = "Chrome", x = "Firefox", I = "Google", j = "Huawei", N = "Microsoft", $ = "Motorola", L = "Opera", D = "Samsung", U = "Sharp", M = "Sony", B = "Xiaomi", q = "Zebra", H = "Facebook", V = "Chromium OS", F = "Mac OS", W = function(e2, t2) {
              var r2 = {};
              for (var s2 in e2) t2[s2] && t2[s2].length % 2 == 0 ? r2[s2] = t2[s2].concat(e2[s2]) : r2[s2] = e2[s2];
              return r2;
            }, G = function(e2) {
              for (var t2 = {}, r2 = 0; r2 < e2.length; r2++) t2[e2[r2].toUpperCase()] = e2[r2];
              return t2;
            }, K = function(e2, t2) {
              return typeof e2 === h && -1 !== z(t2).indexOf(z(e2));
            }, z = function(e2) {
              return e2.toLowerCase();
            }, J = function(e2, t2) {
              if (typeof e2 === h) return e2 = e2.replace(/^\s\s*/, ""), typeof t2 === u ? e2 : e2.substring(0, 350);
            }, X = function(e2, t2) {
              for (var r2, s2, i3, n3, a3, u2, h2 = 0; h2 < t2.length && !a3; ) {
                var d2 = t2[h2], p2 = t2[h2 + 1];
                for (r2 = s2 = 0; r2 < d2.length && !a3 && d2[r2]; ) if (a3 = d2[r2++].exec(e2)) for (i3 = 0; i3 < p2.length; i3++) u2 = a3[++s2], typeof (n3 = p2[i3]) === c && n3.length > 0 ? 2 === n3.length ? typeof n3[1] == l ? this[n3[0]] = n3[1].call(this, u2) : this[n3[0]] = n3[1] : 3 === n3.length ? typeof n3[1] !== l || n3[1].exec && n3[1].test ? this[n3[0]] = u2 ? u2.replace(n3[1], n3[2]) : void 0 : this[n3[0]] = u2 ? n3[1].call(this, u2, n3[2]) : void 0 : 4 === n3.length && (this[n3[0]] = u2 ? n3[3].call(this, u2.replace(n3[1], n3[2])) : void 0) : this[n3] = u2 || o2;
                h2 += 2;
              }
            }, Y = function(e2, t2) {
              for (var r2 in t2) if (typeof t2[r2] === c && t2[r2].length > 0) {
                for (var s2 = 0; s2 < t2[r2].length; s2++) if (K(t2[r2][s2], e2)) return "?" === r2 ? o2 : r2;
              } else if (K(t2[r2], e2)) return "?" === r2 ? o2 : r2;
              return e2;
            }, Z = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, Q = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [b, [f, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [b, [f, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [f, b], [/opios[\/ ]+([\w\.]+)/i], [b, [f, L + " Mini"]], [/\bopr\/([\w\.]+)/i], [b, [f, L]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [f, b], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [b, [f, "UC" + P]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [b, [f, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [b, [f, "WeChat"]], [/konqueror\/([\w\.]+)/i], [b, [f, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [b, [f, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [b, [f, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[f, /(.+)/, "$1 Secure " + P], b], [/\bfocus\/([\w\.]+)/i], [b, [f, x + " Focus"]], [/\bopt\/([\w\.]+)/i], [b, [f, L + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [b, [f, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [b, [f, "Dolphin"]], [/coast\/([\w\.]+)/i], [b, [f, L + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [b, [f, "MIUI " + P]], [/fxios\/([-\w\.]+)/i], [b, [f, x]], [/\bqihu|(qi?ho?o?|360)browser/i], [[f, "360 " + P]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[f, /(.+)/, "$1 " + P], b], [/(comodo_dragon)\/([\w\.]+)/i], [[f, /_/g, " "], b], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [f, b], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [f], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[f, H], b], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [f, b], [/\bgsa\/([\w\.]+) .*safari\//i], [b, [f, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [b, [f, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [b, [f, C + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[f, C + " WebView"], b], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [b, [f, "Android " + P]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [f, b], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [b, [f, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [b, f], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [f, [b, Y, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [f, b], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[f, "Netscape"], b], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [b, [f, x + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [f, b], [/(cobalt)\/([\w\.]+)/i], [f, [b, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[y, "amd64"]], [/(ia32(?=;))/i], [[y, z]], [/((?:i[346]|x)86)[;\)]/i], [[y, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[y, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[y, "armhf"]], [/windows (ce|mobile); ppc;/i], [[y, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[y, /ower/, "", z]], [/(sun4\w)[;\)]/i], [[y, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[y, z]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [p, [m, D], [g, _]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [p, [m, D], [g, v]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [p, [m, R], [g, v]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [p, [m, R], [g, _]], [/(macintosh);/i], [p, [m, R]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [p, [m, U], [g, v]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [p, [m, j], [g, _]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [p, [m, j], [g, v]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[p, /_/g, " "], [m, B], [g, v]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[p, /_/g, " "], [m, B], [g, _]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [p, [m, "OPPO"], [g, v]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [p, [m, "Vivo"], [g, v]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [p, [m, "Realme"], [g, v]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [p, [m, $], [g, v]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [p, [m, $], [g, _]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [p, [m, "LG"], [g, _]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [p, [m, "LG"], [g, v]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [p, [m, "Lenovo"], [g, _]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[p, /_/g, " "], [m, "Nokia"], [g, v]], [/(pixel c)\b/i], [p, [m, I], [g, _]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [p, [m, I], [g, v]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [p, [m, M], [g, v]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[p, "Xperia Tablet"], [m, M], [g, _]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [p, [m, "OnePlus"], [g, v]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [p, [m, E], [g, _]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[p, /(.+)/g, "Fire Phone $1"], [m, E], [g, v]], [/(playbook);[-\w\),; ]+(rim)/i], [p, m, [g, _]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [p, [m, A], [g, v]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [p, [m, O], [g, _]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [p, [m, O], [g, v]], [/(nexus 9)/i], [p, [m, "HTC"], [g, _]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [m, [p, /_/g, " "], [g, v]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [p, [m, "Acer"], [g, _]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [p, [m, "Meizu"], [g, v]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [m, p, [g, v]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [m, p, [g, _]], [/(surface duo)/i], [p, [m, N], [g, _]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [p, [m, "Fairphone"], [g, v]], [/(u304aa)/i], [p, [m, "AT&T"], [g, v]], [/\bsie-(\w*)/i], [p, [m, "Siemens"], [g, v]], [/\b(rct\w+) b/i], [p, [m, "RCA"], [g, _]], [/\b(venue[\d ]{2,7}) b/i], [p, [m, "Dell"], [g, _]], [/\b(q(?:mv|ta)\w+) b/i], [p, [m, "Verizon"], [g, _]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [p, [m, "Barnes & Noble"], [g, _]], [/\b(tm\d{3}\w+) b/i], [p, [m, "NuVision"], [g, _]], [/\b(k88) b/i], [p, [m, "ZTE"], [g, _]], [/\b(nx\d{3}j) b/i], [p, [m, "ZTE"], [g, v]], [/\b(gen\d{3}) b.+49h/i], [p, [m, "Swiss"], [g, v]], [/\b(zur\d{3}) b/i], [p, [m, "Swiss"], [g, _]], [/\b((zeki)?tb.*\b) b/i], [p, [m, "Zeki"], [g, _]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[m, "Dragon Touch"], p, [g, _]], [/\b(ns-?\w{0,9}) b/i], [p, [m, "Insignia"], [g, _]], [/\b((nxa|next)-?\w{0,9}) b/i], [p, [m, "NextBook"], [g, _]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[m, "Voice"], p, [g, v]], [/\b(lvtel\-)?(v1[12]) b/i], [[m, "LvTel"], p, [g, v]], [/\b(ph-1) /i], [p, [m, "Essential"], [g, v]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [p, [m, "Envizen"], [g, _]], [/\b(trio[-\w\. ]+) b/i], [p, [m, "MachSpeed"], [g, _]], [/\btu_(1491) b/i], [p, [m, "Rotor"], [g, _]], [/(shield[\w ]+) b/i], [p, [m, "Nvidia"], [g, _]], [/(sprint) (\w+)/i], [m, p, [g, v]], [/(kin\.[onetw]{3})/i], [[p, /\./g, " "], [m, N], [g, v]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [p, [m, q], [g, _]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [p, [m, q], [g, v]], [/smart-tv.+(samsung)/i], [m, [g, k]], [/hbbtv.+maple;(\d+)/i], [[p, /^/, "SmartTV"], [m, D], [g, k]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[m, "LG"], [g, k]], [/(apple) ?tv/i], [m, [p, R + " TV"], [g, k]], [/crkey/i], [[p, C + "cast"], [m, I], [g, k]], [/droid.+aft(\w)( bui|\))/i], [p, [m, E], [g, k]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [p, [m, U], [g, k]], [/(bravia[\w ]+)( bui|\))/i], [p, [m, M], [g, k]], [/(mitv-\w{5}) bui/i], [p, [m, B], [g, k]], [/Hbbtv.*(technisat) (.*);/i], [m, p, [g, k]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[m, J], [p, J], [g, k]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[g, k]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [m, p, [g, w]], [/droid.+; (shield) bui/i], [p, [m, "Nvidia"], [g, w]], [/(playstation [345portablevi]+)/i], [p, [m, M], [g, w]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [p, [m, N], [g, w]], [/((pebble))app/i], [m, p, [g, S]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [p, [m, R], [g, S]], [/droid.+; (glass) \d/i], [p, [m, I], [g, S]], [/droid.+; (wt63?0{2,3})\)/i], [p, [m, q], [g, S]], [/(quest( 2| pro)?)/i], [p, [m, H], [g, S]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [m, [g, T]], [/(aeobc)\b/i], [p, [m, E], [g, T]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [p, [g, v]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [p, [g, _]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[g, _]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[g, v]], [/(android[-\w\. ]{0,9});.+buil/i], [p, [m, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [b, [f, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [b, [f, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [f, b], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [b, f]], os: [[/microsoft (windows) (vista|xp)/i], [f, b], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [f, [b, Y, Z]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[f, "Windows"], [b, Y, Z]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[b, /_/g, "."], [f, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[f, F], [b, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [b, f], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [f, b], [/\(bb(10);/i], [b, [f, A]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [b, [f, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [b, [f, x + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [b, [f, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [b, [f, "watchOS"]], [/crkey\/([\d\.]+)/i], [b, [f, C + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[f, V], b], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [f, b], [/(sunos) ?([\w\.\d]*)/i], [[f, "Solaris"], b], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [f, b]] }, ee = function(e2, t2) {
              if (typeof e2 === c && (t2 = e2, e2 = o2), !(this instanceof ee)) return new ee(e2, t2).getResult();
              var r2 = typeof a2 !== u && a2.navigator ? a2.navigator : o2, s2 = e2 || (r2 && r2.userAgent ? r2.userAgent : ""), i3 = r2 && r2.userAgentData ? r2.userAgentData : o2, n3 = t2 ? W(Q, t2) : Q, w2 = r2 && r2.userAgent == s2;
              return this.getBrowser = function() {
                var e3, t3 = {};
                return t3[f] = o2, t3[b] = o2, X.call(t3, s2, n3.browser), t3[d] = typeof (e3 = t3[b]) === h ? e3.replace(/[^\d\.]/g, "").split(".")[0] : o2, w2 && r2 && r2.brave && typeof r2.brave.isBrave == l && (t3[f] = "Brave"), t3;
              }, this.getCPU = function() {
                var e3 = {};
                return e3[y] = o2, X.call(e3, s2, n3.cpu), e3;
              }, this.getDevice = function() {
                var e3 = {};
                return e3[m] = o2, e3[p] = o2, e3[g] = o2, X.call(e3, s2, n3.device), w2 && !e3[g] && i3 && i3.mobile && (e3[g] = v), w2 && "Macintosh" == e3[p] && r2 && typeof r2.standalone !== u && r2.maxTouchPoints && r2.maxTouchPoints > 2 && (e3[p] = "iPad", e3[g] = _), e3;
              }, this.getEngine = function() {
                var e3 = {};
                return e3[f] = o2, e3[b] = o2, X.call(e3, s2, n3.engine), e3;
              }, this.getOS = function() {
                var e3 = {};
                return e3[f] = o2, e3[b] = o2, X.call(e3, s2, n3.os), w2 && !e3[f] && i3 && "Unknown" != i3.platform && (e3[f] = i3.platform.replace(/chrome os/i, V).replace(/macos/i, F)), e3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return s2;
              }, this.setUA = function(e3) {
                return s2 = typeof e3 === h && e3.length > 350 ? J(e3, 350) : e3, this;
              }, this.setUA(s2), this;
            };
            ee.VERSION = "1.0.35", ee.BROWSER = G([f, b, d]), ee.CPU = G([y]), ee.DEVICE = G([p, m, g, w, v, k, _, S, T]), ee.ENGINE = ee.OS = G([f, b]), typeof n2 !== u ? (i2.exports && (n2 = i2.exports = ee), n2.UAParser = ee) : r.amdO ? void 0 !== (s = function() {
              return ee;
            }.call(t, r, t, e)) && (e.exports = s) : typeof a2 !== u && (a2.UAParser = ee);
            var et = typeof a2 !== u && (a2.jQuery || a2.Zepto);
            if (et && !et.ua) {
              var er = new ee();
              et.ua = er.getResult(), et.ua.get = function() {
                return er.getUA();
              }, et.ua.set = function(e2) {
                er.setUA(e2);
                var t2 = er.getResult();
                for (var r2 in t2) et.ua[r2] = t2[r2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, n = {};
        function a(e2) {
          var t2 = n[e2];
          if (void 0 !== t2) return t2.exports;
          var r2 = n[e2] = { exports: {} }, s2 = true;
          try {
            i[e2].call(r2.exports, r2, r2.exports, a), s2 = false;
          } finally {
            s2 && delete n[e2];
          }
          return r2.exports;
        }
        a.ab = "//";
        var o = a(226);
        e.exports = o;
      })();
    }, 488: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { getTestReqInfo: function() {
        return a;
      }, withRequest: function() {
        return n;
      } });
      let s = new (r(67)).AsyncLocalStorage();
      function i(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (r2) return { url: t2.url(e2), proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function n(e2, t2, r2) {
        let n2 = i(e2, t2);
        return n2 ? s.run(n2, r2) : r2();
      }
      function a(e2, t2) {
        return s.getStore() || (e2 && t2 ? i(e2, t2) : void 0);
      }
    }, 375: (e, t, r) => {
      "use strict";
      var s = r(195).Buffer;
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { handleFetch: function() {
        return o;
      }, interceptFetch: function() {
        return l;
      }, reader: function() {
        return n;
      } });
      let i = r(488), n = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function a(e2, t2) {
        let { url: r2, method: i2, headers: n2, body: a2, cache: o2, credentials: l2, integrity: u, mode: c, redirect: h, referrer: d, referrerPolicy: p } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(n2), ["next-test-stack", function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: a2 ? s.from(await t2.arrayBuffer()).toString("base64") : null, cache: o2, credentials: l2, integrity: u, mode: c, redirect: h, referrer: d, referrerPolicy: p } };
      }
      async function o(e2, t2) {
        let r2 = (0, i.getTestReqInfo)(t2, n);
        if (!r2) return e2(t2);
        let { testData: o2, proxyPort: l2 } = r2, u = await a(o2, t2), c = await e2(`http://localhost:${l2}`, { method: "POST", body: JSON.stringify(u), next: { internal: true } });
        if (!c.ok) throw Error(`Proxy request failed: ${c.status}`);
        let h = await c.json(), { api: d } = h;
        switch (d) {
          case "continue":
            return e2(t2);
          case "abort":
          case "unhandled":
            throw Error(`Proxy request aborted [${t2.method} ${t2.url}]`);
        }
        return function(e3) {
          let { status: t3, headers: r3, body: i2 } = e3.response;
          return new Response(i2 ? s.from(i2, "base64") : null, { status: t3, headers: new Headers(r3) });
        }(h);
      }
      function l(e2) {
        return r.g.fetch = function(t2, r2) {
          var s2;
          return (null == r2 ? void 0 : null == (s2 = r2.next) ? void 0 : s2.internal) ? e2(t2, r2) : o(e2, new Request(t2, r2));
        }, () => {
          r.g.fetch = e2;
        };
      }
    }, 177: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { interceptTestApis: function() {
        return n;
      }, wrapRequestHandler: function() {
        return a;
      } });
      let s = r(488), i = r(375);
      function n() {
        return (0, i.interceptFetch)(r.g.fetch);
      }
      function a(e2) {
        return (t2, r2) => (0, s.withRequest)(t2, i.reader, () => e2(t2, r2));
      }
    } }, (e) => {
      var t = e(e.s = 64);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = t;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*))(.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": false, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.js", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "analyticsId": "", "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "inline", "remotePatterns": [], "unoptimized": false }, "devIndicators": { "buildActivity": true, "buildActivityPosition": "bottom-right" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "optimizeFonts": true, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": true, "httpAgentOptions": { "keepAlive": true }, "outputFileTracing": true, "staticPageGenerationTimeout": 60, "swcMinify": true, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "experimental": { "multiZoneDraftMode": false, "prerenderEarlyExit": false, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 1, "memoryBasedWorkersCount": false, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "outputFileTracingRoot": "/home/janhdonline/Documents/AEO Visibility Tracker/aeo-tracker", "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "adjustFontFallbacks": false, "adjustFontFallbacksWithSizeAdjust": false, "typedRoutes": false, "instrumentationHook": false, "bundlePagesExternals": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "missingSuspenseWithCSRBailout": true, "optimizeServerReact": true, "useEarlyImport": false, "staleTimes": { "dynamic": 30, "static": 300 }, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "configFileName": "next.config.js" };
var BuildId = "MDuJR45fZxCA-v57nmCw0";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/dashboard", "regex": "^/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard(?:/)?$" }, { "page": "/dashboard/projects/new", "regex": "^/dashboard/projects/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/projects/new(?:/)?$" }, { "page": "/favicon.ico", "regex": "^/favicon\\.ico(?:/)?$", "routeKeys": {}, "namedRegex": "^/favicon\\.ico(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }], "dynamic": [{ "page": "/dashboard/projects/[id]", "regex": "^/dashboard/projects/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/dashboard/projects/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/dashboard/projects/[id]/briefs", "regex": "^/dashboard/projects/([^/]+?)/briefs(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/dashboard/projects/(?<nxtPid>[^/]+?)/briefs(?:/)?$" }, { "page": "/dashboard/projects/[id]/keywords", "regex": "^/dashboard/projects/([^/]+?)/keywords(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/dashboard/projects/(?<nxtPid>[^/]+?)/keywords(?:/)?$" }, { "page": "/report/[domain]", "regex": "^/report/([^/]+?)(?:/)?$", "routeKeys": { "nxtPdomain": "nxtPdomain" }, "namedRegex": "^/report/(?<nxtPdomain>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/favicon.ico": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico" }, "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/favicon.ico", "dataRoute": null }, "/dashboard/projects/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/dashboard/projects/new", "dataRoute": "/dashboard/projects/new.rsc" }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc" }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc" } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "445a3c84e5717f783a326e09a355b1cb", "previewModeSigningKey": "92cf02b184bd815810fe1b99eb4214551efe4cc3e9be7411d1019ff2e56967ec", "previewModeEncryptionKey": "116fb2acc5494fda7ea0baa2c2abe5f5bdba027fc0b6dace1fdca617d40d872c" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*))(.json)?[\\/#\\?]?$", "originalSource": "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "MDuJR45fZxCA-v57nmCw0", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "xx6QclyF9X7oEqUKDfeJtXXWJMXrCQ+qJfkV/4bbFdY=", "__NEXT_PREVIEW_MODE_ID": "445a3c84e5717f783a326e09a355b1cb", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "116fb2acc5494fda7ea0baa2c2abe5f5bdba027fc0b6dace1fdca617d40d872c", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "92cf02b184bd815810fe1b99eb4214551efe4cc3e9be7411d1019ff2e56967ec" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/api/free-check/route": "/api/free-check", "/api/scan/run/route": "/api/scan/run", "/api/webhooks/lemonsqueezy/route": "/api/webhooks/lemonsqueezy", "/dashboard/projects/new/page": "/dashboard/projects/new", "/favicon.ico/route": "/favicon.ico", "/login/page": "/login", "/page": "/", "/api/cron/scan/route": "/api/cron/scan", "/api/export/csv/route": "/api/export/csv", "/dashboard/page": "/dashboard", "/dashboard/projects/[id]/keywords/page": "/dashboard/projects/[id]/keywords", "/dashboard/projects/[id]/briefs/page": "/dashboard/projects/[id]/briefs", "/dashboard/projects/[id]/page": "/dashboard/projects/[id]", "/report/[domain]/page": "/report/[domain]" };
var FunctionsConfigManifest = { "version": 1, "functions": { "/api/cron/scan": {}, "/api/export/csv": {}, "/dashboard": {}, "/dashboard/projects/[id]/briefs": {}, "/dashboard/projects/[id]/keywords": {}, "/dashboard/projects/[id]": {}, "/report/[domain]": {} } };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream3 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location2, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location2)) {
    return location2;
  }
  const locationURL = new URL(location2);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
