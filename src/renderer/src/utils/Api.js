const api = {
  prodDomain: 'http://127.0.0.1:5050',
  devDomain: 'http://127.0.0.1:5050',
  prodWsDomain: 'ws:/127.0.0.1:5051/ws',
  prodWsDomain: 'ws:/127.0.0.1:5051/ws',
  devWsDomain: 'ws:/127.0.0.1:5051/ws',
  checkCode: '/account/checkCode', // 验证码
  login: '/account/login', // 登录
  register: '/account/register', // 注册
  getSysSetting: '/account/getSysSetting', // 用户获取系统面板
  loadMyGroup: '/group/loadMyGroup', // 获取我创建的群组
  saveGroup: '/group/saveGroup', // 保存群组
  getGroupInfo: '/group/getGroupInfo', // 获取群组信息
  getGroupInfo4Chat: '/group/getGroupInfo4Chat', // 获取群聊详细信息
  dissolutionGroup: '/group/dissolutionGroup', // 解散群组
  leaveGroup: '/group/leaveGroup', // 退出群组
  addOrRemoveGroupUser: '/group/addOrRemoveGroupUser', // 群管理员添加或踢出群成员
  search: '/contact/search', // 搜索好友
  applyAdd: '/contact/applyAdd', // 向他人发送好友申请
  loadApply: '/contact/loadApply', // 获取申请列表
  dealWithApply: '/contact/dealWithApply', // 处理申请
  loadContact: '/contact/loadContact', // 获取联系人列表(包括群组)
  getContactUserInfo: '/contact/getContactUserInfo', // 获取联系人信息
  addContact2BlackList: '/contact/addContact2BlackList', // 拉黑联系人
  delContact: '/contact/delContact', // 删除联系人
  getContactInfo: '/contact/getContactInfo', // 获取联系人信息，不一定是好友
  saveUserInfo: '/userInfo/saveUserInfo', // 保存用户信息
  getUserInfo: '/userInfo/getUserInfo', // 获取用户信息
  updatePassword: '/userInfo/updatePassword',
  logout: '/userInfo/logout',
  sendMessage: '/chat/sendMessage', // 发送消息
  uploadFile: '/chat/uploadFile', // 上传文件地址
  loadAdminAccount: '/admin/loadUser', // 后台获取用户列表
  updateUserStatus: '/admin/updateUserStatus', // 后台更新用户状态
  forceOffLine: '/admin/forceOffLine', // 强制下线
  loadGroup: '/group/loadGroup', // 管理员加载所有群组列表
  adminDissolutionGroup: '/group/dissolutionGroupByAdmin', // 管理员解散群组
  saveSysSetting: '/admin/saveSysSetting', // 保存系统设置
  getSysSetting4Admin: '/admin/getSysSetting', // 获取系统设置
  loadUpdateDataList: '/appUpdate/loadList', // 管理员获取版本更新列表
  delUpdate: '/appUpdate/delete', // 管理员删除更新
  saveUpdate: '/appUpdate/saveOrUpdate', // 管理员保存更新
  postUpdate: '/appUpdate/post', // 管理员发布更新
  loadBeautyAccount: '/userBeauty/loadBeautyAccountList', // 靓号列表
  saveBeautyAccount: '/userBeauty/saveBeautyAccount', // 保存靓号
  delBeautyAccount: '/userBeauty/delBeautyAccount', // 删除靓号
  checkVersion: '/appUpdate/check' // 更新检测
}

export default api
