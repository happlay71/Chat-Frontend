import { defineStore } from 'pinia'
export const useContactStateStore = defineStore('contactStateInfo', {
  state: () => {
    return {
      contactReload: null // 是否要重新加载
    }
  },
  actions: {
    setContactReload(state) {
      this.contactReload = state
    }
  }
})
