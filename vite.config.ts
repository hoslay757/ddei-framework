import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.ts'),
      },
    },
    //设置打包的文件和名称，名称这里可以先去npm官网搜索一下是否存在，否则后面发包不成功也要修改  
    lib: {
      entry: "./src/index.ts",
      name: "ddei-framework"
    },
  },
  resolve: {
    alias: {
      '@ddei-core': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
