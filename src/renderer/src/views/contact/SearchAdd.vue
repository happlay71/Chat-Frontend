<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="false"
      @close="dialogConfig.show = false"
    >
      <el-form :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
        <!--input输入-->
        <el-form-item label="" prop="">
          <el-input
            type="textarea"
            :rows="5"
            clearable
            placeholder="输入申请信息，更容易被通过"
            v-model.trim="formData.applyInfo"
            resize="none"
            show-word-limit
            maxlength="100"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()

// 按钮配置，动态控制 disabled 属性
const dialogConfig = ref({
  show: false,
  title: '申请信息',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitApply()
      }
    }
  ]
})

const formData = ref({})
const formDataRef = ref()
const rules = {
  title: [{ required: true, message: '请输入内容' }]
}

const emit = defineEmits(['reload'])
const submitApply = async () => {
  const { contactId, contactType, applyInfo } = formData.value
  let result = await proxy.Request({
    url: proxy.Api.applyAdd,
    params: {
      contactId,
      applyInfo,
      contactType
    }
  })
  if (!result) {
    return
  }
  // 判断是否需要申请
  if (result.data == 0) {
    proxy.Message.success('添加成功')
  } else {
    proxy.Message.success('申请成功，等待对方同意')
  }
  dialogConfig.value.show = false
  emit('reload') // 刷新数据
}

const show = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    formData.value.show = true
    formData.value = Object.assign({}, data)
    formData.value.applyInfo = '我是' + userStore.getInfo().nickName // 自动填充 applyInfo
  })
}

defineExpose({
  show
})
</script>

<style lang="scss" scoped>
::v-deep .el-button--primary {
  background-color: #1fc6b5;
  border-color: #1fc6b5;
  color: #fff;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease;

  &:hover {
    background-color: #17a599; /* 悬停时背景色 */
    border-color: #17a599; /* 悬停时边框色 */
    transform: translateY(-2px); /* 悬停时的轻微上浮效果 */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* 悬停时的阴影效果 */
  }

  &:active {
    background-color: #149382; /* 点击时背景色 */
    border-color: #149382; /* 点击时边框色 */
    transform: translateY(1px); /* 点击时轻微下压效果 */
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15); /* 点击时阴影效果 */
  }

  &:focus {
    outline: none; /* 去除点击后的默认外框 */
    box-shadow: 0 0 0 3px rgba(31, 198, 181, 0.4); /* 聚焦时的外框阴影 */
  }
}
</style>
