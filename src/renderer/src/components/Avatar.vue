<template>
  <div>
    <AvatarBase
      :userId="userId"
      :width="width"
      :borderRadius="borderRadius"
      :showDetail="false"
      v-if="userId == 'Urobot'"
    >
    </AvatarBase>
    <el-popover
      v-else
      :width="280"
      placement="right-start"
      :show-arrow="false"
      trigger="click"
      transition="none"
      :hide-after="0"
      @show="getContactInfo"
      ref="popoverRef"
    >
      <!-- TODO 这里点击群组头像会报错，因为没有判断是否为群组 -->
      <template #reference>
        <AvatarBase
          :userId="userId"
          :width="width"
          :borderRadius="borderRadius"
          :showDetail="false"
        >
        </AvatarBase>
      </template>
      <template #default>
        <div class="popover-user-panel">
          <UserBaseInfo :userInfo="userInfo"></UserBaseInfo>
          <div class="op-btn" v-if="userId !== userStore.getInfo().userId">
            <el-button v-if="userInfo.contactStatus == 1" type="primary" @click="sendMessage">
              发送消息
            </el-button>
            <el-button v-else type="primary" @click="addContact">添加好友</el-button>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { useUserStore } from '@/stores/UserStore'
import AvatarBase from './AvatarBase.vue'

const userStore = useUserStore()

const props = defineProps({
  userId: {
    type: String
  },
  width: {
    type: Number,
    default: 40
  },
  borderRadius: {
    type: Number,
    default: 0
  },
  groupId: {
    type: String
  }
})

const userInfo = ref({})
const getContactInfo = async () => {
  userInfo.value.userId = props.userId
  if (userStore.getInfo().userId == props.userId) {
    userInfo.value = userStore.getInfo()
  } else {
    let result = await proxy.Request({
      url: proxy.Api.getContactInfo,
      method: 'GET',
      params: {
        contactId: props.userId
      },
      showLoading: false
    })
    if (!result) {
      return
    }
    userInfo.value = Object.assign({}, result.data)
  }
}

// TODO 发消息
const sendMessage = () => {}

// TODO 添加好友
const addContact = () => {}
</script>

<style lang="scss" scoped>
.op-btn {
  text-align: center;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
}

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
</style>
