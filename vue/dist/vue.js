var Vue = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    // 测试ts路径导入
    var isArray = Array.isArray;
    var isObject = function (value) {
        return value !== null && typeof value === 'object';
    };
    /**
     * 对比数据是否改变
     * @param value
     * @param oldValue
     * @returns
     */
    var hasChanged = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };

    // 返回dep数据
    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    // 定义targetMap（当前对象）的weakMap类型
    var targetMap = new WeakMap();
    // 创建effect函数，执行依赖（第一次）
    function effect(fn) {
        var _effect = new ReactiveEffect(fn);
        _effect.run();
    }
    // 定义当前触发的标记类
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn) {
            this.fn = fn;
        }
        // 执行run函数 等于执行依赖函数返回结果
        ReactiveEffect.prototype.run = function () {
            // 标记当前触发的
            activeEffect = this;
            // 直接执行，这样第一次是有效果的，触发后会执行getter，在getter中会执行track进行依赖的收集！
            return this.fn();
        };
        return ReactiveEffect;
    }());
    /**
     * 收集依赖
     * @param target
     * @param key
     */
    // 触发getter时，触发track（本质就是建立数据与依赖之间的关联关系）
    function track(target, key) {
        console.log('收集依赖', target, key);
        // 触发getter时，触发了effect方法，可能记录了当前的依赖函数
        if (!activeEffect)
            return;
        // 从weakmap中寻找当前触发的对象
        var depsMap = targetMap.get(target);
        // 如果没有存储当前触发对象则添加当前触发对象，value为空map
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        // 创建了当前对象的weakmap对象关联关系后之后，在其value的map对象中添加当前target的目标key中所依赖的函数
        // 获取当前key值关联的依赖
        var dep = depsMap.get(key);
        // 如果没有存储当前触发对象key的依赖，则创建set结构的ReactiveEffect数据
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        // 创建后依赖数组后，将当前标记的依赖添加
        trackEffects(dep);
    }
    // 利用dep 依次跟踪指定key 的所有 effect
    function trackEffects(dep) {
        // 添加当前标记的依赖，主要目的为了存储ReactiveEffect实例从而执行run方法
        dep.add(activeEffect);
    }
    /**
     * 触发依赖
     * @param target
     * @param key
     * @param newValue
     */
    function trigger(target, key, newValue) {
        console.log('触发依赖', target, key, newValue);
        // 从缓存的weakmap中获取当前对象
        var depsMap = targetMap.get(target);
        if (!depsMap)
            return;
        // 从当前对象的缓存value map对象中取出dep依赖
        var dep = depsMap.get(key);
        if (!dep)
            return;
        // 执行依赖！
        triggerEffects(dep);
    }
    function triggerEffects(dep) {
        var e_1, _a;
        // 将其转化为真实数组
        var effets = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            // 循环依次执行
            for (var effets_1 = __values(effets), effets_1_1 = effets_1.next(); !effets_1_1.done; effets_1_1 = effets_1.next()) {
                var item = effets_1_1.value;
                item.run();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effets_1_1 && !effets_1_1.done && (_a = effets_1.return)) _a.call(effets_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }

    // 导入收集依赖和触发依赖方法
    var get = createGetter();
    // 创建getter函数
    function createGetter() {
        return function get(target, key, receiver) {
            // 获取当前get的值
            var res = Reflect.get(target, key, receiver);
            // 同时进行依赖收集
            track(target, key);
            // 返回数据
            return res;
        };
    }
    var set = createSetter();
    // 创建setter函数
    function createSetter() {
        return function set(target, key, value, receiver) {
            // 返回当前最新的值
            var res = Reflect.set(target, key, value, receiver);
            // 同时进行依赖触发
            trigger(target, key, value);
            // 返回数据
            return res;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    // 创建proxy代理对象时，传递的拦截方法handlers
    // 创建weakMap对象 作为缓存代理对象使用
    var reactiveMap = new WeakMap();
    // reactive方法
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    // 创建或者取到缓存：代理对象
    function createReactiveObject(target, baseHandlers, proxyMap) {
        // 查找缓存的代理对象
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        // 创建代理对象
        var proxy = new Proxy(target, baseHandlers);
        // 缓存代理对象
        proxyMap.set(target, proxy);
        // 返回代理对象
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };

    function ref(value) {
        return createRef(value, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                if (hasChanged(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    // 收集依赖
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    // 触发依赖
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }
    /**
     *
     * 是否为 ref
     * @returns
     */
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }

    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
