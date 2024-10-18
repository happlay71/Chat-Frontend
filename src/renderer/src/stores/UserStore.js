import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: {}
    }
  },
  actions: {
    setInfo(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    getInfo() {
      return this.user
    }
  }
})
