<template>
  <ContentPanel>
    <div class="group-info-item">
      <div class="group-title">群封面：</div>
      <div class="group-value">
        <Avatar :userId="groupInfo.groupId"></Avatar>
      </div>
      <el-dropdown placement="bottom-end" trigger="click">
        <span class="el-dropdown-link">
          <div class="iconfont icon-more"></div>
        </span>
        <template #dropdown>
          <el-dropdown-menu v-if="groupInfo.groupOwnerId == userStore.getInfo().userId">
            <el-dropdown-item @click="editGroupInfo">修改群信息</el-dropdown-item>
            <el-dropdown-item @click="dissolutionGroup">解散该群</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu v-else>
            <el-dropdown-item @click="leaveGroup">退出该群</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="group-info-item">
      <div class="group-title">群ID：</div>
      <div class="group-value">{{ groupInfo.groupId }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title">群成员：</div>
      <div class="group-value">{{ groupInfo.memberCount }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title">加入权限：</div>
      <div class="group-value">
        {{ groupInfo.joinType == 0 ? '直接加入' : '管理员同意后加入' }}
      </div>
    </div>
    <div class="group-info-item notice">
      <div class="group-title">公告：</div>
      <div class="group-value">{{ groupInfo.groupNotice || '-' }}</div>
    </div>
    <div class="group-info-item">
      <div class="group-title"></div>
      <div class="group-value">
        <el-button type="primary" @click="sendMessage">发送群消息</el-button>
      </div>
    </div>
  </ContentPanel>
  <GroupEditDialog ref="groupEditDialogRef" @reloadGroupInfo="getGroupInfo"></GroupEditDialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useContactStateStore } from '../../stores/ContactStateStore'
import GroupEditDialog from './GroupEditDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const contactStateStore = useContactStateStore()

const groupInfo = ref({})
const groupId = ref()

// 获取群聊详情
const getGroupInfo = async () => {
  let result = await proxy.Request({
    url: proxy.Api.getGroupInfo,
    method: 'GET',
    params: {
      groupId: groupId.value
    }
  })
  if (!result) {
    return
  }
  groupInfo.value = result.data
}

// 修改群聊详情
const groupEditDialogRef = ref()
const editGroupInfo = () => {
  groupEditDialogRef.value.show(groupInfo.value)
}

// 解散群聊
const dissolutionGroup = () => {
  proxy.Confirm({
    message: '确定要删除该群聊？（删除后无法恢复）',
    okfun: async () => {
      contactStateStore.setContactReload(null)
      let result = await proxy.Request({
        url: proxy.Api.dissolutionGroup,
        params: {
          groupId: groupInfo.value.groupId
        }
      })
      if (!result) {
        return
      }
      proxy.Message.success('解散成功')
      // 刷新我的群聊列表
      contactStateStore.setContactReload('DISSOLUTION_GROUP')
    }
  })
}

// 退出群组
const leaveGroup = () => {
  proxy.Confirm({
    message: '确定要退出该群聊吗？',
    okfun: async () => {
      contactStateStore.setContactReload(null)
      let result = await proxy.Request({
        url: proxy.Api.leaveGroup,
        params: {
          groupId: groupInfo.value.groupId
        }
      })
      if (!result) {
        return
      }
      proxy.Message.success('退出成功')
      contactStateStore.setContactReload('LEAVE_GROUP')
    }
  })
}

// 发送消息
const sendMessage = () => {
  router.push({
    path: '/chat',
    query: { chatId: groupInfo.value.groupId, timestamp: new Date().getTime() }
  })
}
watch(
  () => route.query.contactId,
  (newVal, oldVal) => {
    if (newVal) {
      groupId.value = newVal
      getGroupInfo()
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.group-info-item {
  display: flex;
  margin: 15px 0px;
  align-items: center;
  .group-title {
    width: 100px;
    text-align: right;
  }
  .group-value {
    flex: 1;
  }
}
.notice {
  align-items: flex-start;
}
</style>
