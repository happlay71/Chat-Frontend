<template>
  <div>
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
      <el-form-item label="群名称" prop="groupName">
        <el-input
          :maxlength="150"
          clearable
          placeholder="请输入群名称"
          v-model.trim="formData.groupName"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="封面" prop="avatarFile">
        <AvatarUpload v-model="formData.avatarFile" ref="avatarUploadRef" @coverFile="saveCover">
        </AvatarUpload>
      </el-form-item>
      <el-form-item label="加入权限" prop="joinType">
        <el-radio-group v-model="formData.joinType">
          <el-radio :label="1">管理员同意后加入</el-radio>
          <el-radio :label="0">直接加入</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="公告" prop="groupNotice">
        <el-input
          clearable
          placeholder="请输入群公告"
          v-model.trim="formData.groupNotice"
          type="textarea"
          rows="5"
          maxlength="300"
          :show-word-limit="true"
          resize="none"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">
          {{ formData.groupId ? '修改群聊' : '创建群聊' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { useContactStateStore } from '../../stores/ContactStateStore'

const contactStateStore = useContactStateStore()
const formData = ref({})
const formDataRef = ref()
const rules = {
  groupName: [{ required: true, message: '请输入群名称' }],
  joinType: [{ required: true, message: '请选择加入权限' }]
  // avatarFile: [{ required: true, message: '请选择头像' }]
}

// 定义回调
const emit = defineEmits(['editBack'])
const submit = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {}
    // TODO 重新加载头像
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: proxy.Api.saveGroup,
      params
    })
    if (!result) {
      return
    }
    // 判断是新建还是修改
    if (params.groupId) {
      proxy.Message.success('群聊修改成功')
      emit('editBack')
    } else {
      proxy.Message.success('群聊创建成功')
    }

    // 清空表单
    formDataRef.value.resetFields()
    // TODO可以被Contact.vue监听到
    contactStateStore.setContactReload('MY')
    // TODO 重新加载头像
  })
}

// TODO 保存封面
const saveCover = () => {}
// 设置弹窗的初始化信息
const show = (data) => {
  formDataRef.value.resetFields()
  formData.value = Object.assign({}, data)
  formData.value.avatarFile = data.groupId
}

// 暴露出去
defineExpose({
  show
})
</script>

<style lang="scss" scoped></style>
