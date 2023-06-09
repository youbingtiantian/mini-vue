// 创建proxy代理对象时，传递的拦截方法handlers
import { mutableHandlers } from "./baseHandlers"
import { isObject } from "@vue/shared"

// 创建weakMap对象 作为缓存代理对象使用
export const reactiveMap = new WeakMap<object, any>()

// reactive方法
export function reactive(target: object){

  return createReactiveObject(target, mutableHandlers, reactiveMap)
  
}

// 创建或者取到缓存：代理对象
function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {

  // 查找缓存的代理对象
  const existingProxy = proxyMap.get(target)
  if(existingProxy){
    return existingProxy
  }

  // 创建代理对象
  const proxy = new Proxy(target, baseHandlers)

  // 缓存代理对象
  proxyMap.set(target, proxy)

  // 返回代理对象
  return proxy
}

export const toReactive = <T extends unknown>(value: T): T => {
  return isObject(value) ? reactive(value as object) : value
}

