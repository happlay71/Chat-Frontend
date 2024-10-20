import { defineStore } from 'pinia'
export const useContactSateStore = defineStore('contactSate', {
  state: () => {
    return {
      contactReload: null, // 是否要重新加载
      delContactId: null
    }
  },
  actions: {}
})
