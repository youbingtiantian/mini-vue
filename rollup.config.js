import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"

export default [
  {
    // 入口文件
    input: './vue/src/index.ts',
    // 出口文件
    output: [
      {
        // 开启sourcemap
        sourcemap: true,
        // 导出文件地址
        file: './vue/dist/vue.js',
        // 生成包的格式
        format: 'iife',
        // 变量名
        name: 'Vue'
      }
    ],
    // 插件
    plugins: [
      // ts
      typescript({
        sourceMap:true
      }),
      // 模块导入的路径补全
      resolve(),
      // 转 commonjs 为 ESM
      commonjs()
    ]
  }
]