import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
// import { terser } from 'vite-plugin-terser'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Watermark',
      fileName: (format) => {
        const formatsMap = {
          es: `esm/watermark.js`,
          umd: `umd/watermark.js`,
        }
        return formatsMap[format]
      },
    },
    rollupOptions: {
      external: [],
      output: [
        // ES 模块（未压缩）
        {
          format: 'es',
          entryFileNames: `esm/watermark.js`,
          preserveModules: false,
        },
        // // ES 模块（压缩）
        // {
        //   format: 'es',
        //   entryFileNames: `esm/watermark.v${version}.min.js`,
        //   plugins: [terser()],
        // },
        // UMD 格式（未压缩）
        {
          format: 'umd',
          name: 'MyLib',
          entryFileNames: `umd/watermark.js`,
        },
        // // UMD 格式（压缩）
        // {
        //   format: 'umd',
        //   name: 'MyLib',
        //   entryFileNames: `umd/watermark.v${version}.min.js`,
        //   plugins: [terser()],
        // },
      ],
    },
  },
  // 添加 server 配置项
  server: {
    open: true
  },
})

