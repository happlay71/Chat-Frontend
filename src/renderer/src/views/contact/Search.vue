<template>
  <ContentPanel>
    <div class="search-form">
      <!--input输入-->
      <el-input
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
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from 'vue'
const { proxy } = getCurrentInstance()
import { useUserStore } from '@/stores/UserStore'

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
</script>

<style lang="scss" scoped>
.search-form {
  padding-top: 50px;
  display: flex;
  align-items: center;
  :deep(.el-input__wrapper) {
    border-radius: 4px 0px 0px 4px;
    border-right: none;
  }
  .search-btn {
    background: #07c160;
    color: #fff;
    line-height: 40px;
    width: 80px;
    text-align: center;
    border-radius: 0px 5px 5px 0px;
    cursor: pointer;
    &:hover {
      background: #0dd36c;
    }
  }
}
.no-data {
  padding: 30px 0px;
}
.search-result-panel {
  .search-result {
    padding: 30px 20px 20px 30px;
    background: #fff;
    border-radius: 5px;
    margin-top: 10px;
    position: relative;
    .contact-type {
      position: absolute;
      left: 0px;
      top: 0px;
      background: #2cb6fe;
      padding: 2px 5px;
      color: #fff;
      border-radius: 5px 0px 0px 0px;
      font-size: 12px;
    }
  }
}
.op-btn {
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  text-align: center;
}
</style>
