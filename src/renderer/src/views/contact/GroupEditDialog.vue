vue
<template>
  <Dialog
    :show="dialogConfig.show"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <GroupEditForm ref="groupEditRef" @editBack="editBack"></GroupEditForm>
  </Dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, watch } from 'vue'
const { proxy } = getCurrentInstance()
import { useRoute, useRouter } from 'vue-router'
import { useContactStateStore } from '../../stores/ContactStateStore'
import GroupEditForm from './GroupEditForm.vue'

const route = useRoute()
const router = useRouter()
const contactStateStore = useContactStateStore()

const dialogConfig = ref({
  show: false,
  title: '修改群聊',
  buttons: []
})

// 展示编辑弹窗
const groupEditRef = ref()
// 调用GroupEditForm里的show方法
const show = (data) => {
  dialogConfig.value.show = true
  nextTick(() => {
    groupEditRef.value.show(data)
  })
}

// 刷新
const emit = defineEmits(['reloadGroupInfo'])
const editBack = () => {
  dialogConfig.value.show = false
  emit('reloadGroupInfo')
}

// 抛出show方法
defineExpose({
  show
})
</script>

<style lang="scss" scoped></style>
