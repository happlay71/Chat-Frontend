import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/cust-elementplus.scss'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import Utils from './utils/Utils'
import Verify from './utils/Verify'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

app.config.globalProperties.Utils = Utils
app.config.globalProperties.Verify = Verify
app.mount('#app')
