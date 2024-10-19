// 判空
const isEmpty = (str) => {
  if (str == null || str == '' || str == undefined) {
    return true
  }
  return false
}

// 处理字符串中的 ,
const getAreaInfo = (data) => {
  if (isEmpty(data)) {
    return '-'
  }
  return data.replace(/[，,;；:：\/\\、.。]/g, ' ')
}

export default {
  isEmpty,
  getAreaInfo
}
