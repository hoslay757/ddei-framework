import { fileURLToPath, URL } from 'node:url'


import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import px2rem from "postcss-px2rem"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    postcss: {
      plugins: [
        px2rem({
          remUnit: 192,
        })
      ]
    }
  }




  // [vite库模式配置](https://cn.vitejs.dev/guide/build.html#library-mode)
  // build: {
  //   outDir: 'lib',
  //   lib: {
  //     entry: resolve(__dirname, './packages/index.ts'),
  //     name: 'WebVue',
  //     fileName: 'web-vue'
  //   },
  //   rollupOptions: {
  //     // 确保外部化处理那些你不想打包进库的依赖
  //     external: ['vue'],
  //     output: {
  //       // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
  //       globals: {
  //         vue: 'Vue'
  //       }
  //     }
  //   }
  // }
})
