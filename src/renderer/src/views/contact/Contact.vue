<template>
  <!-- 自定义的Layout组件 -->
  <Layout>
    <template #left-content>
      <div class="drag-panel drag"></div>
      <div class="top-search">
        <!--input输入-->
        <el-input
          class="custom-input"
          clearable
          placeholder="搜索"
          v-model="searchKey"
          size="small"
          @keyup="search"
        >
          <template #suffix>
            <span class="iconfont icon-search"></span>
          </template>
        </el-input>
      </div>
      <div class="contact-list">
        <template v-for="(item, index) in partList" :key="index">
          <div class="part-title">{{ item.partName }}</div>
          <div class="part-list">
            <div
              v-for="(sub, subIndex) in item.children"
              :key="subIndex"
              :class="['part-item', sub.path === route.path ? 'active' : '']"
              @click="partJump(sub)"
            >
              <div :class="['iconfont', sub.icon]" :style="{ background: sub.iconBgColor }"></div>
              <div class="text">{{ sub.name }}</div>
            </div>
            <template v-for="(contact, contactIndex) in item.contactData" :key="contactIndex">
              <div
                :class="[
                  'part-item',
                  contact[item.contactId] == route.query.contactId ? 'active' : ''
                ]"
                @click="contactDetail(contact, item)"
              >
                <Avatar :userId="contact[item.contactId]" :width="35"></Avatar>
                <div class="text">{{ contact[item.contactName] }}</div>
              </div>
            </template>
            <template v-if="item.contactData && item.contactData.length == 0">
              <div class="no-data">
                {{ item.emptyMsg }}
              </div>
            </template>
          </div>
        </template>
      </div>
    </template>
    <template #right-content>
      <!-- 增加拖动栏 -->
      <div class="title-panel drag">{{ rightTitle }}</div>
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="componentRef"></component>
      </router-view>
    </template>
  </Layout>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactStateStore } from '../../stores/ContactStateStore'
const { proxy } = getCurrentInstance()

const router = useRouter()
const route = useRoute()

const contactStateStore = useContactStateStore()

const searchKey = ref()
const search = () => {}

const partList = ref([
  {
    partName: '新朋友',
    children: [
      {
        name: '搜索好友',
        icon: 'icon-search',
        // iconBgColor: '#B0BEC5',
        iconBgColor: '#fa9d3b',
        path: '/contact/search'
      },
      {
        name: '新的朋友',
        icon: 'icon-adduser',
        // iconBgColor: '#A5D6A7',
        iconBgColor: '#08bf61',
        path: '/contact/contactNotice',
        showTitle: true,
        countKey: 'contactApplyCount'
      }
    ]
  },
  {
    partName: '我的群聊',
    children: [
      {
        name: '新建群聊',
        icon: 'icon-addteam',
        // iconBgColor: '#A393BF',
        iconBgColor: '#1485ee',
        path: '/contact/createGroup'
      }
    ],
    contactId: 'groupId',
    contactName: 'groupName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail'
  },
  {
    partName: '加入的群聊',
    contactId: 'contactId',
    contactName: 'contactName',
    showTitle: true,
    contactData: [],
    contactPath: '/contact/groupDetail',
    emptyMsg: '暂未加入群聊'
  },
  {
    partName: '我的好友',
    children: [],
    contactId: 'contactId',
    contactName: 'contactName',
    contactData: [],
    contactPath: '/contact/userDetail',
    emptyMsg: '暂无好友'
  }
])

const rightTitle = ref()
const partJump = (data) => {
  if (data.showTitle) {
    rightTitle.value = data.name
  } else {
    rightTitle.value = null
  }

  // 处理联系人申请数量已读
  router.push(data.path)
}

const loadContact = async (contactType) => {
  let result = await proxy.Request({
    url: proxy.Api.loadContact,
    method: 'GET',
    params: {
      contactType
    }
  })
  if (!result) {
    return
  }
  // 判断为群聊还是用户
  if (contactType === 'GROUP') {
    partList.value[2].contactData = result.data
  } else if (contactType === 'USER') {
    partList.value[3].contactData = result.data
  }
}
loadContact('USER')
loadContact('GROUP')

// 加载群组
const loadMyGroup = async () => {
  let result = await proxy.Request({
    url: proxy.Api.loadMyGroup,
    method: 'GET',
    showLoading: false
  })
  if (!result) {
    return
  }
  partList.value[1].contactData = result.data
}
loadMyGroup()

// 获取用户或群聊详情
const contactDetail = (contact, part) => {
  // TODO 修改自己创建的群聊后右标题不改变
  if (part.showTitle) {
    rightTitle.value = contact[part.contactName]
  } else {
    rightTitle.value = null
  }
  router.push({
    path: part.contactPath,
    query: {
      contactId: contact[part.contactId]
    }
  })
}
// 监听响应式数据的变化
watch(
  () => contactStateStore.contactReload,
  (newVal, oldVal) => {
    if (!newVal) {
      return
    }
    switch (newVal) {
      case 'MY':
        loadMyGroup() // 数据变化，加载我创建的群组的信息
        break
      case 'USER':
      case 'GROUP':
        loadContact(newVal)
        break
      case 'DISSOLUTION_GROUP':
        loadMyGroup()
        router.push('/contact/blank') // 删除后跳转到空白页面
        rightTitle.value = null // 将标题（用户名称）置空
        break
      case 'LEAVE_GROUP':
        loadContact('GROUP')
        router.push('/contact/blank') // 删除后跳转到空白页面
        rightTitle.value = null // 将标题（用户名称）置空
        break
      case 'REMOVE_USER':
        loadContact('USER')
        router.push('/contact/blank') // 删除后跳转到空白页面
        rightTitle.value = null // 将标题（用户名称）置空
        break
    }
  },
  { immediate: true, deep: true } // 初始化时立即执行一次回调函数,深度监听对象内部的变化
)
</script>

<style lang="scss" scoped>
.drag-panel {
  height: 25px;
  background: #ffffff;
}

// 仿QQ
// .top-search {
//     padding: 0px 10px 9px 10px;
//     background: #f7f7f7;
//     display: flex;
//     align-items: center;
//     .iconfont {
//         font-size: 12px;
//     }
// }
.top-search {
  padding: 0 10px 9px 10px; // 调整内边距
  background: #ffffff; // 背景色为白色
  display: flex; // 使用flex布局
  align-items: center; // 垂直居中

  .iconfont {
    font-size: 14px; // 搜索图标的大小调整
    color: #888; // 图标颜色仿QQ风格，浅灰色
    margin-right: 8px; // 图标与输入框之间的间距
  }

  // 自定义 el-input 内部 input 样式
  // 使用 ::v-deep（穿透 scoped）
  ::v-deep .custom-input .el-input__wrapper {
    background-color: #f4f4f4; // 修改背景颜色
    padding: 5px 10px; // 调整内边距
    border-radius: 4px; // 添加圆角
    box-shadow: 0 0 0 1px #f2f2f2 inset; // 自定义阴影或边框
    &:focus-within {
      box-shadow: 0 0 0 1px #1fc6b5 inset; // 自定义阴影或边框
    }
  }
}

.contact-list {
  border-top: 1px solid #ededed;
  height: calc(100vh - 70px);
  overflow: hidden;
  &:hover {
    overflow: auto;
  }

  .part-title {
    color: #515151;
    padding-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  //   .part-list {
  //     border-bottom: 0px solid #ededed;

  //     .part-item {
  //       display: flex;
  //       align-items: center;
  //       padding: 10px 10px;
  //       position: relative;
  //       background: #fff; /* 默认背景色 */
  //       transition: all 0.3s ease; /* 过渡效果 */

  //       &:hover {
  //         cursor: pointer;
  //         background: #f5f5f5; /* 悬停时的背景色 */
  //       }

  //       /* 聚焦时的效果 */
  //       &.focus {
  //         background: #e0e0e0; /* 聚焦时背景 */
  //         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 聚焦时的阴影 */
  //       }

  //       /* 选中时的效果 */
  //       &.active {
  //         background: #cfcfcf; /* 选中时的背景颜色 */
  //         box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 选中时的阴影 */

  //         &:hover {
  //           background: #cfcfcf; /* 保持选中时的颜色不变 */
  //           box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* 保持选中时的阴影 */
  //         }
  //       }

  //       .iconfont {
  //         width: 35px;
  //         height: 35px;
  //         display: flex;
  //         align-items: center;
  //         justify-content: center;
  //         font-size: 20px;
  //         color: #fff;
  //       }

  //       .text {
  //         flex: 1;
  //         color: #000000;
  //         margin-left: 10px;
  //         overflow: hidden;
  //         text-overflow: ellipsis;
  //         white-space: nowrap;
  //       }
  //     }

  //     .no-data {
  //       text-align: center;
  //       font-size: 12px;
  //       color: #9d9d9d;
  //       line-height: 30px;
  //     }
  //   }

  //   .part-list {
  //     border-bottom: 1px solid #ededed;
  //     .part-item {
  //       display: flex;
  //       align-items: center;
  //       padding: 10px 10px;
  //       position: relative;
  //       // &:hover {
  //       //     cursor: pointer;
  //       //     background: #d6d6d7;
  //       // }
  //       &:hover {
  //         cursor: pointer;
  //         background: #e0e0e0; /* 悬停时的背景颜色 */
  //         box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 悬停时的阴影效果 */
  //       }
  //       .iconfont {
  //         width: 35px;
  //         height: 35px;
  //         display: flex;
  //         align-items: center;
  //         justify-content: center;
  //         font-size: 20px;
  //         color: #fff;
  //       }
  //       .text {
  //         flex: 1;
  //         color: #000000;
  //         margin-left: 10px;
  //         overflow: hidden;
  //         text-overflow: ellipsis;
  //         white-space: nowrap;
  //       }
  //     }
  //     .no-data {
  //       text-align: center;
  //       font-size: 12px;
  //       color: #9d9d9d;
  //       line-height: 30px;
  //     }
  //     // .active {
  //     //     background: #c4c4c4;
  //     //     &:hover {
  //     //         background: #c4c4c4;
  //     //     }
  //     // }
  //     .active {
  //       background: #e3e3e3; /* 点击时的背景颜色 */
  //       box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* 点击时的阴影效果 */

  //       &:hover {
  //         background: #b0b0b0; /* 保持点击后的背景颜色一致 */
  //         box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* 保持点击后的阴影效果一致 */
  //       }

  //       /* 点击状态下的按压效果 */
  //       &:active {
  //         background: #b0b0b0; /* 按压时背景保持一致 */
  //         transform: scale(0.98); /* 点击时的缩放效果 */
  //         box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* 点击时的阴影变小 */
  //       }
  //     }
  //   }
  .part-list {
    border-bottom: 1px solid #ededed;

    .part-item {
      display: flex;
      align-items: center;
      padding: 10px 10px;
      position: relative;
      transition:
        background 0.3s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease; /* 添加过渡效果 */

      &:hover {
        cursor: pointer;
        background: #e0e0e0; /* 悬停时的背景颜色 */
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 悬停时的阴影效果 */
      }

      /* 点击时的按压效果 */
      &:active {
        background: #d0d0d0; /* 按压时的背景颜色 */
        transform: scale(0.98); /* 按压时的缩放效果 */
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* 按压时的阴影变小 */
      }

      .iconfont {
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }

      .text {
        flex: 1;
        color: #000000;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .no-data {
      text-align: center;
      font-size: 12px;
      color: #9d9d9d;
      line-height: 30px;
    }

    .active {
      background: #e3e3e3; /* 点击后的背景颜色 */
      transition:
        background 0.3s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease; /* 添加过渡效果 */
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* 点击后的阴影效果 */

      &:hover {
        background: #b0b0b0; /* 保持点击后的背景颜色一致 */
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* 保持点击后的阴影效果一致 */
      }

      /* 点击状态下的按压效果 */
      &:active {
        background: #b0b0b0; /* 按压时背景保持一致 */
        transform: scale(0.98); /* 点击时的缩放效果 */
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* 点击时的阴影变小 */
      }
    }
  }
}
.title-panel {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 18px;
  color: #000000;
}
</style>
