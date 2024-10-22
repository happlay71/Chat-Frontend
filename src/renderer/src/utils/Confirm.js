import { ElMessageBox } from 'element-plus'

const confirm = ({ message, okfun, showCancelBin = true, okText = '确定' }) => {
  ElMessageBox.confirm(message, '提示', {
    'close-on-click-modal': false,
    confirmButtonText: okText,
    cancelButtonText: '取消',
    showCancelButton: showCancelBin,
    type: 'info'
  })
    .then(async () => {
      if (okfun) {
        okfun()
      }
    })
    .catch(() => {})
}

export default confirm
