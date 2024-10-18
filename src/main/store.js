const Store = require('electron-store')
const store = new Store()

// 调用内存中的值更快
let userId = null
const initUserId = (_userId) => {
  userId = _userId
}

const getUserId = () => {
  return userId
}

const setData = (key, value) => {
  store.set(key, value)
}

const getData = (key) => {
  return store.get(key)
}
// 防止多个用户干扰
const setUserData = (key, value) => {
  setData(userId + key, value)
}
const getUserData = (key) => {
  return getData(userId + key)
}
// 清除数据
const deleteUserData = (key) => {
  store.delete(userId + key)
}

export default {
  initUserId,
  getUserId,
  setData,
  getData,
  setUserData,
  getUserData,
  deleteUserData
}
