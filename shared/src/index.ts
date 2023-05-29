// 测试ts路径导入

export const isArray = Array.isArray

export const isObject = (value: unknown) => {
  return value !== null && typeof value === 'object' 
}

/**
 * 对比数据是否改变
 * @param value 
 * @param oldValue 
 * @returns 
 */
export const hasChanged = (value:any,oldValue:any): boolean => {
  return !Object.is(value,oldValue)
}

export const isFunction = (value: unknown): boolean => {
  return typeof value === 'function'
}