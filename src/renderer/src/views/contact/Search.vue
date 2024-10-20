<template>
  <ContentPanel>
    <div class="search-form">
      <!--input输入-->
      <el-input
        class="com-el-wrapper"
        clearable
        placeholder="请输入用户ID或群聊ID"
        v-model="contactId"
        size="large"
        @keydown.enter="search"
      ></el-input>
      <div class="search-btn iconfont icon-search" @click="search"></div>
    </div>
    <div v-if="searchResult && Object.keys(searchResult).length > 0" class="search-result-panel">
      <div class="search-result">
        <span class="contact-type">{{ contactTypeName }}</span>
        <UserBaseInfo
          :userInfo="searchResult"
          :showArea="searchResult.contactType == 'USER'"
        ></UserBaseInfo>
      </div>
      <div class="op-btn" v-if="searchResult.contactId != userStore.getInfo().userId">
        <el-button
          type="primary"
          v-if="
            searchResult.status == null ||
            searchResult.status == 0 ||
            searchResult.status == 2 ||
            searchResult.status == 3 ||
            searchResult.status == 4
          "
          @click="applyContact"
          >{{ searchResult.contactType == 'USER' ? '添加到联系人' : '申请加入群聊' }}</el-button
        >
        <el-button type="primary" v-if="searchResult.status == 1" @click="sendMessage"
          >发消息</el-button
        >
        <!-- TODO 首次被拉黑可能未处理 P15 -->
        <span v-if="searchResult.status == 5">对方拉黑了你</span>
      </div>
    </div>
    <div v-if="!searchResult" class="no-data">没有搜索到任何结果</div>
  </ContentPanel>
  <SearchAdd ref="searchAddRef" @reload="resetFrom"></SearchAdd>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { useUserStore } from '@/stores/UserStore'
import SearchAdd from './SearchAdd.vue'

// 判断用户类型
const userStore = useUserStore()
const contactTypeName = computed(() => {
  console.log(userStore.getInfo().userId)
  if (userStore.getInfo().userId === searchResult.value.contactId) {
    return '自己'
  }
  if (searchResult.value.contactType == 'USER') {
    return '用户'
  }
  if (searchResult.value.contactType == 'GROUP') {
    return '群聊'
  }
})

const contactId = ref()
const searchResult = ref({})
const search = async () => {
  if (!contactId.value) {
    proxy.Message.warning('请输入用户ID或群聊ID')
    return
  }
  let result = await proxy.Request({
    url: proxy.Api.search,
    method: 'GET',
    params: {
      contactId: contactId.value
    }
  })
  if (!result) {
    return
  }
  searchResult.value = result.data
}

const searchAddRef = ref()
const applyContact = () => {
  searchAddRef.value.show(searchResult.value)
}

// 清空搜索框文本
const resetFrom = () => {
  searchResult.value = {}
  contactId.value = undefined
}
</script>

<style lang="scss" scoped>
// .search-form {
//   padding-top: 50px;
//   display: flex;
//   align-items: center;
//   :deep(.el-input__wrapper) {
//     border-radius: 4px 0px 0px 4px;
//     border-right: none;
//   }
//   .search-btn {
//     background: #07c160;
//     color: #fff;
//     line-height: 40px;
//     width: 80px;
//     text-align: center;
//     border-radius: 0px 5px 5px 0px;
//     cursor: pointer;
//     &:hover {
//       background: #0dd36c;
//     }
//   }
// }

// .no-data {
//   padding: 30px 0px;
// }
// .search-result-panel {
//   .search-result {
//     padding: 30px 20px 20px 30px;
//     background: #fff;
//     border-radius: 5px;
//     margin-top: 10px;
//     position: relative;
//     .contact-type {
//       position: absolute;
//       left: 0px;
//       top: 0px;
//       background: #2cb6fe;
//       padding: 2px 5px;
//       color: #fff;
//       border-radius: 5px 0px 0px 0px;
//       font-size: 12px;
//     }
//   }
// }
// .op-btn {
//   border-radius: 5px;
//   margin-top: 10px;
//   padding: 10px;
//   background: #fff;
//   text-align: center;
// }

.search-form {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 1px solid #1fc6b5;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 默认阴影 */

  /* 输入框样式 */
  .el-input__inner {
    border-radius: 4px 0 0 4px;
    border: none;
    background-color: transparent;
    color: #333;
    box-shadow: none;
    height: 40px;
    line-height: 40px;
    padding: 0;
    margin: 0;
  }

  /* 搜索按钮样式 */
  .search-btn {
    background: #1fc6b5;
    color: #fff;
    line-height: 40px;
    width: 80px;
    text-align: center;
    border-radius: 0 4px 4px 0;
    border: none;
    height: 40px;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none; /* 移除默认的聚焦样式 */

    /* 聚焦时添加边框 */
    &:focus {
      box-shadow: 0 0 0 2px rgba(31, 198, 181, 0.5);
    }

    /* 悬停时变色和阴影效果 */
    &:hover {
      background: rgb(58, 219, 203);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  }

  /* 鼠标悬停和聚焦时的效果 */
  &:hover,
  &:focus-within {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* 聚焦/悬停时阴影加深 */
  }

  /* 添加点击时的缩放效果 */
  &:active {
    transform: scale(0.95);
  }
}

.no-data {
  padding: 30px 0;
}

.search-result-panel {
  .search-result {
    padding: 30px 20px 20px 30px;
    background: #fff;
    border-radius: 5px;
    margin-top: 10px;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 统一阴影 */
    border: 1px solid #ddd; /* 统一边框颜色 */
    transition: all 0.3s ease; /* 平滑过渡效果 */

    &:hover {
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* 鼠标悬停时阴影加深 */
    }

    .contact-type {
      position: absolute;
      left: 0;
      top: 0;
      background: #2cb6fe;
      padding: 2px 5px;
      color: #fff;
      border-radius: 5px 0 0 0;
      font-size: 12px;
    }
  }
}

// 添加到联系人按钮样式
::v-deep .el-button--primary {
  background-color: #1fc6b5;
  border-color: #1fc6b5;
  color: #fff;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: rgb(58, 219, 203); /* 悬停时背景色 */
    border-color: rgb(58, 219, 203); /* 悬停时边框色 */
    transform: translateY(-2px); /* 悬停时的轻微上浮效果 */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* 悬停时的阴影效果 */
  }

  &:active {
    background-color: #20bfaa; /* 点击时背景色 */
    border-color: #20bfaa; /* 点击时边框色 */
    transform: translateY(1px); /* 点击时轻微下压效果 */
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15); /* 点击时阴影效果 */
  }

  &:focus {
    outline: none; /* 去除点击后的默认外框 */
    box-shadow: 0 0 0 3px rgba(22, 176, 160, 0.4); /* 聚焦时的外框阴影 */
  }
}

.op-btn {
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 统一阴影 */
  border: 1px solid #ddd; /* 统一边框 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* 鼠标悬停时阴影加深 */
  }
}
</style>
