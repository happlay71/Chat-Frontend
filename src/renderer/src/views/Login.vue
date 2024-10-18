<template>
    <div class="login-panel">
        <div class="title drag">Chat</div>
        <div v-if="showLoading" class="loading-panel">
            <img src="../assets/img/loading.gif">
        </div>
        <div class="login-form" v-else>
            <!-- <div class="error-msg">{{ backendErrorMsg }}</div> -->
            <el-form
              :model="formData"
              :rules="rules"
              ref="formDataRef"
              label-width="0px"
              @submit.prevent
            >
              <!-- 邮箱 -->
              <el-form-item prop="email" >
                <el-input size="large" clearable placeholder="请输入邮箱" maxlength="30" v-model.trim="formData.email">
                    <!-- #prefix 用于在输入框的前面（左侧）插入内容。在这里插入了一个图标。 -->
                    <template #prefix>
                        <span class="iconfont icon-email"></span>
                    </template>
                </el-input>
                <div v-if="errorMsg.email" class="error-msg">{{ errorMsg.email }}</div>
              </el-form-item>
              <!-- 昵称 -->
              <el-form-item prop="nickName"  v-if="!isLogin">
                <el-input size="large" clearable placeholder="请输入昵称" maxlength="15" v-model.trim="formData.nickName">
                    <!-- #prefix 用于在输入框的前面（左侧）插入内容。在这里插入了一个图标。 -->
                    <template #prefix>
                        <span class="iconfont icon-user-nick"></span>
                    </template>
                </el-input>
                <div v-if="errorMsg.nickName" class="error-msg">{{ errorMsg.nickName }}</div>
              </el-form-item>
              <!-- 密码 -->
              <el-form-item prop="password" >
                <el-input size="large" show-password clearable placeholder="请输入密码" v-model.trim="formData.password">
                    <template #prefix>
                        <span class="iconfont icon-password"></span>
                    </template>
                </el-input>
                <div v-if="errorMsg.password" class="error-msg">{{ errorMsg.password }}</div>
              </el-form-item>
              <!-- 密码确认 -->
              <el-form-item prop="rePassword"  v-if="!isLogin">
                <el-input size="large" show-password clearable placeholder="请输入确认密码" v-model.trim="formData.rePassword">
                    <template #prefix>
                        <span class="iconfont icon-password"></span>
                    </template>
                </el-input>
                <div v-if="errorMsg.rePassword" class="error-msg">{{ errorMsg.rePassword }}</div>
              </el-form-item>
              <!-- 验证码 -->
              <el-form-item prop="checkCode" >
                <div class="check-code-panel">
                    <el-input size="large" clearable placeholder="请输入验证码" v-model.trim="formData.checkCode">
                        <template #prefix>
                            <span class="iconfont icon-checkcode"></span>
                        </template>
                    </el-input>
                    <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode" />
                </div>
                <div v-if="errorMsg.checkCode" class="error-msg">{{ errorMsg.checkCode }}</div>
              </el-form-item>
              <el-form-item >
                <el-button type="primary" class="login-btn" @click="submit">
                    {{ isLogin ? '登录' : '注册' }}
                </el-button>
              </el-form-item>
              <div class="bottom-link">
                <span class="a-link" @click="changOpType">
                    {{ isLogin ? '无账号，请注册->' : '有账号，请登录->'}}
                </span>
              </div>
            </el-form>
        </div>
    </div>
    <WinOp :showSetTop="false" :showMin="false" :showMax="false" :closeType="0"></WinOp>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import { useUserStore } from "@/stores/UserStore";
import md5 from "js-md5";
import { useRouter } from "vue-router";

const router = useRouter()
const userStore = useUserStore()
const { proxy } = getCurrentInstance();
const formData = ref({});
const formDataRef = ref();

const rules = {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    rePassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
    checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const isLogin = ref(true)

// 注册和登录页面切换
const changOpType  = () => {
    // 渲染进程向主进程发送消息
    window.ipcRenderer.send('loginOrRegister', !isLogin.value)
    isLogin.value = !isLogin.value
    nextTick(() => {
        formDataRef.value.resetFields()
        formData.value = {}
        cleanVerify()
        changeCheckCode()
    })
}

// 获取验证码
const checkCodeUrl = ref(null)
const changeCheckCode = async () => {
    let result = await proxy.Request({
       url: proxy.Api.checkCode,
       method: 'GET'
    })
    if(!result){
      return
    }
    checkCodeUrl.value = result.data.checkCode
    localStorage.setItem('checkCodeKey', result.data.checkCodeKey)  // 将服务器返回的 checkCodeKey 存储到浏览器的 localStorage
}
changeCheckCode()

const errorMsg = ref({
  email: null,
  nickName: null,
  password: null,
  rePassword: null,
  checkCode: null
})

// 校验方法，支持空值和格式校验
const checkValue = (type, value, emptyMsg, formatMsg = null) => {
    const errorField = type ? type.replace('check', '').toLowerCase() : null;

    // 检查空值
    if (!value) {
        if (errorField) errorMsg.value[errorField] = emptyMsg;
        return false;
    }

    // 格式校验
    if (type && formatMsg && !proxy.Verify[type](value)) {
        if (errorField) errorMsg.value[errorField] = formatMsg;
        return false;
    }

    return true;
}

const cleanVerify = () => {
    errorMsg.value = {
        email: null,
        nickName: null,
        password: null,
        rePassword: null,
        checkCode: null
    }
}

const showLoading = ref(false)
const backendErrorMsg = ref(null); // 专门用于存储后端返回的错误信息

// 提交表单
const submit = async () => {
    cleanVerify()
    backendErrorMsg.value = null; // 清空后端错误消息

    // 使用 checkValue 进行校验
    if (!checkValue('checkEmail', formData.value.email, '', '邮箱格式不正确，请检查')) {
        return;
    }
    if (!checkValue('checkPassword', formData.value.password, '', '密码必须包含字母和数字(可含特殊字符)，8-18位')) {
        return;
    }
    if (!checkValue(null, formData.value.checkCode, '')) {
        return;
    }

    // 检查密码是否一致
    if (!isLogin && formData.value.password !== formData.value.rePassword) {
        errorMsg.value.rePassword = '两次密码不一致';
        return;
    }
    
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
    })

    // 登录前加载遮罩
    if (isLogin.value) {
        showLoading.value = true
    }

    let result = await proxy.Request({
        url: isLogin.value ? proxy.Api.login : proxy.Api.register,
        showLoading: isLogin.value ? false : true,
        showError: false,
        params: {
            email: formData.value.email,
            password: isLogin.value ? md5(formData.value.password) : formData.value.password,
            checkCode: formData.value.checkCode,
            nickName: formData.value.nickName,
            checkCodeKey: localStorage.getItem('checkCodeKey')
        },
        // errorCallback: (response) => {
        //     showLoading.value = false
        //     changeCheckCode()
        //     errorMsg.value = response.info
        // }
        errorCallback: (response) => {
            showLoading.value = false;
            changeCheckCode();
            backendErrorMsg.value = response.info; // 假设后端错误信息在 response.info 中
            proxy.Message.error(backendErrorMsg.value); // 可选，弹出全局错误提示
        }
    })

    if (!result) {
        return
    }
    // 如果登录
    if (isLogin.value) {
        // pinia状态管理--返回result和token
        userStore.setInfo(result.data)
        localStorage.setItem('token', result.data.token)
        // 跳转到主窗口
        router.push('/main')

        const screenWidth = window.screen.width
        const screenHeight = window.screen.height
        window.ipcRenderer.send('openChat', {
            email: formData.value.email,
            token: result.data.token,
            userId: result.data.userId,
            nickName: result.data.nickName,
            admin: result.data.admin,
            screenWidth: screenWidth,
            screenHeight: screenHeight
        })
        proxy.Message.success('登录成功')
    } else {
        proxy.Message.success('注册成功')
        changOpType()
    }
    
}


</script>

<style lang="scss" scoped>
.email-select {
    width: 250px;
}

.loading-panel {
    height: calc(100vh - 32px);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    img {
        width: 300px;
    }
}

.login-panel {
    background: #fff;
    border-radius: 3px;
    border: 1px solid #ddd;
    .title {
        height: 30px;
        padding: 5px 0px 0px 10px;
    }

    .login-form {
        padding: 0px 15px 29px 15px;
        :deep(.el-input__wrapper) {
            box-shadow: none;
            border-radius: none;
        }
        .el-form-item {
            border-bottom: 1px solid #ddd;
        }
        .email-panel {
            align-items: center;
            width: 100%;
            display: flex;
            .input {
                flex: 1;
            }
            .icon-down {
                margin-left: 3px;
                width: 16px;
                cursor: pointer;
                border: none;
            }
        }
        .error-msg {
            color: #fb7373;
            font-size: 12px;
            line-height: 1.5;
            margin-top: 5px;
            white-space: pre-line; /* 支持换行 */
        }
        .check-code-panel {
            display: flex;
            .check-code {
                cursor: pointer;
                width: 120px;
                margin-left: 5px;
            }
        }
        .login-btn {
            margin-top: 20px;
            width: 100%;
            background: #76e2cc;
            height: 36px;
            font-size: 16px;
        }
        .bottom-link {
            text-align: right;
        }
    }
}


</style>