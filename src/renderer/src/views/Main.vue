<template>
  <div class="main">
    <div class="left-sider">
      <div></div>
      <div class="menu-list">
        <template v-for="(item, index) in menuList" :key="index">
          <div
            :class="[
              'tab-item',
              'iconfont',
              item.icon,
              item.path == currentMenu.path ? 'active' : ''
            ]"
            v-if="item.position == 'top'"
            @click="changeMenu(item)"
          >
            <template v-if="item.name == 'chat'"></template>
          </div>
        </template>
      </div>
      <div class="menu-list menu-bottom">
        <template v-for="(item, index) in menuList" :key="index">
          <div
            :class="[
              'tab-item',
              'iconfont',
              item.icon,
              item.path == currentMenu.path ? 'active' : ''
            ]"
            v-if="item.position == 'bottom'"
            @click="changeMenu(item)"
          ></div>
        </template>
      </div>
    </div>
    <div class="right-container">
      <router-view v-slot="{ Component }">
        <keep-alive include="chat">
          <component :is="Component" ref="componentRef"></component>
        </keep-alive>
      </router-view>
    </div>
  </div>
  <WinOp></WinOp>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue'
const { proxy } = getCurrentInstance()
import { useRouter } from 'vue-router'
import WinOp from '../components/WinOp.vue'
import { useUserStore } from '@/stores/UserStore'

const router = useRouter()
const userStore = useUserStore()

const menuList = ref([
  {
    name: 'message',
    icon: 'icon-message',
    path: '/chat',
    countKey: 'chatCount',
    position: 'top'
  },
  {
    name: 'contact',
    icon: 'icon-user',
    path: '/contact',
    countKey: 'contactApplyCount',
    position: 'top'
  },
  {
    name: 'mysetting',
    icon: 'icon-setting',
    path: '/setting',
    position: 'bottom'
  }
])

const currentMenu = ref(menuList.value[0])
const changeMenu = (item) => {
  currentMenu.value = item
  router.push(item.path)
}

// 获取登录用户的信息
const getLoginInfo = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getUserInfo,
    method: 'GET'
  })
  if (!result) {
    return
  }
  userStore.setInfo(result.data)
}

//  Vue 组件完成首次渲染并挂载到 DOM 上时会被触发
// 此处用于防止刷新后登录信息消失
onMounted(() => {
  getLoginInfo()
})
</script>

<style lang="scss" scoped>
.main {
  background: #ddd;
  display: flex;
  border-radius: 0px 3px 3px 0px;
  overflow: hidden;
  .left-sider {
    width: 55px;
    background: #e8e8e8;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 35px;
    border: 1px solid #e8e8e8;
    border-right: none;
    padding-bottom: 10px;
    .menu-list {
      width: 100%;
      flex: 1;
      .tab-item {
        // color: #d3d3d3;
        font-size: 20px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        cursor: pointer;
        font-size: 22px;
        position: relative;
      }
      .active {
        color: #1fc6b5;
      }
    }
    .menu-bottom {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }
  .right-container {
    flex: 1;
    overflow: hidden;
    border: 1px solid #e8e8e8;
    border-left: none;
  }
}

.popover-user-panel {
  padding: 10px;
  .popover-user {
    display: flex;
    border-bottom: 1px solid #ddd;
    padding-bottom: 20px;
  }
  .send-message {
    margin-top: 10px;
    text-align: center;
    padding: 20px 0px 0px 0px;
  }
}
</style>
