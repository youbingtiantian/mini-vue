import { ReactiveEffect } from "./effect";

// 创建Dep 类型 为 ReactiveEffect 的 set结构
export type Dep = Set<ReactiveEffect>

// 返回dep数据
export const createDep = (effects? : ReactiveEffect[]) => {
  const dep = new Set<ReactiveEffect>(effects)

  return dep
}