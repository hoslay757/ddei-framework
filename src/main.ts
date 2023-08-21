import { createApp } from 'vue'
import App from './App.vue'
// 完整引入组件库
import WeDesign from '../packages/index' // 可以配置alias
const app = createApp(App)
app.use(WeDesign).mount('#app')