import { isArray } from "@vue/shared"
import { Dep, createDep } from "./dep"
import { ComputedRefImpl } from "./computed"


export type EffectScheduler = (...args: any[]) => any
// 定义map类型
type keyToDepMap = Map<any, Dep>

// 定义targetMap（当前对象）的weakMap类型
const targetMap = new WeakMap<any, keyToDepMap>()

// 创建effect函数，执行依赖（第一次）
export function effect<T = any>(fn: () => T){
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// 定义当前触发的标记类
export let activeEffect: ReactiveEffect | undefined
export class ReactiveEffect<T = any> {

  computed?: ComputedRefImpl<T>

  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null){}

  // 执行run函数 等于执行依赖函数返回结果
  run () {
    // 标记当前触发的
    activeEffect = this

    // 直接执行，这样第一次是有效果的，触发后会执行getter，在getter中会执行track进行依赖的收集！
    return this.fn()
  }
}

/**
 * 收集依赖
 * @param target 
 * @param key 
 */
// 触发getter时，触发track（本质就是建立数据与依赖之间的关联关系）
export function track(target: object, key: unknown){

  // 触发getter时，触发了effect方法，可能记录了当前的依赖函数
  if(!activeEffect) return

  // 从weakmap中寻找当前触发的对象
  let depsMap = targetMap.get(target)
  // 如果没有存储当前触发对象则添加当前触发对象，value为空map
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()))
  }

  // 创建了当前对象的weakmap对象关联关系后之后，在其value的map对象中添加当前target的目标key中所依赖的函数
  // 获取当前key值关联的依赖
  let dep =depsMap.get(key)
  // 如果没有存储当前触发对象key的依赖，则创建set结构的ReactiveEffect数据
  if(!dep){
    depsMap.set(key, (dep = createDep()))
  }
  // 创建后依赖数组后，将当前标记的依赖添加
  trackEffects(dep)
}

// 利用dep 依次跟踪指定key 的所有 effect
export function trackEffects (dep: Dep) {
  // 添加当前标记的依赖，主要目的为了存储ReactiveEffect实例从而执行run方法
  dep.add(activeEffect!)
}

/**
 * 触发依赖
 * @param target 
 * @param key 
 * @param newValue 
 */
export function trigger(target: object, key: unknown, newValue: unknown){

  // 从缓存的weakmap中获取当前对象
  const depsMap = targetMap.get(target)
  if(!depsMap) return

  // 从当前对象的缓存value map对象中取出dep依赖
  const dep: Dep | undefined = depsMap.get(key)
  if(!dep) return

  // 执行依赖！
  triggerEffects(dep)
}

export function triggerEffects (dep: Dep) {
  // 将其转化为真实数组
  const effets = isArray(dep) ? dep : [...dep]
  // 循环依次执行
  for(const item of effets) {
    if(item.computed){
      if(item.scheduler){
        item.scheduler()
      }else{
        item.run()
      }
    }
  }

  for(const item of effets) {
    if(!item.computed){
      if(item.scheduler){
        item.scheduler()
      }else{
        item.run()
      }
    }
  }
}