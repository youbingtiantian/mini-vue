// 导入收集依赖和触发依赖方法
import { track, trigger } from "./effect"

const get = createGetter()

// 创建getter函数
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object){

    // 获取当前get的值
    const res = Reflect.get(target, key, receiver)

    // 同时进行依赖收集
    track(target, key)

    // 返回数据
    return res
  }
}

const set = createSetter()

// 创建setter函数
function createSetter() {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object){
    // 返回当前最新的值
    const res = Reflect.set(target, key, value, receiver)

    // 同时进行依赖触发
    trigger(target, key, value)

    // 返回数据
    return res
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}



