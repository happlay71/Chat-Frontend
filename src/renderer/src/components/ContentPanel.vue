<template>
  <div class="content-panel" :style="{ 'border-top': showTopBorder ? '1px solid #ddd' : 'none' }">
    <div class="content-inner">
      <!-- 插槽，用来动态插入内容，允许父组件传递自定义内容到这个面板组件中 -->
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// 显示边框
const props = defineProps({
  showTopBorder: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.content-panel {
  overflow: auto; // 表示当内容超出容器时，面板可以自动滚动
  height: calc(100vh - 62px);
  .content-inner {
    margin: 0px auto;
    width: 400px;
  }
}
</style>
