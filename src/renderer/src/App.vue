<script setup>
import Versions from './components/Versions.vue'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div>我的第一个桌面应用！！！</div>
</template>
