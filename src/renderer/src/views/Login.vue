<template>
    <div class="login-panel">
        <div class="title drag">Chat</div>
        <div class="login-form">
            <!-- <div class="error-msg">{{ errorMsg }}</div> -->
            <el-form
              :model="formData"
              :rules="rules"
              ref="formDataRef"
              label-width="0px"
              @submit.prevent
            >
              <!-- 邮箱 -->
              <el-form-item prop="email" >
                <el-input size="large" clearable placeholder="请输入邮箱" v-model.trim="formData.email">
                    <!-- #prefix 用于在输入框的前面（左侧）插入内容。在这里插入了一个图标。 -->
                    <template #prefix>
                        <span class="iconfont icon-email"></span>
                    </template>
                </el-input>
                <div v-if="errorMsg.email" class="error-msg">{{ errorMsg.email }}</div>
              </el-form-item>
              <!-- 昵称 -->
              <el-form-item prop="nickName"  v-if="!isLogin">
                <el-input size="large" clearable placeholder="请输入昵称" v-model.trim="formData.nickName">
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
                <el-input size="large" show-password clearable placeholder="请输入验证码" v-model.trim="formData.checkCode">
                    <template #prefix>
                        <span class="iconfont icon-checkcode"></span>
                    </template>
                </el-input>
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
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
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
}

const errorMsg = ref({
  email: null,
  nickName: null,
  password: null,
  rePassword: null,
  checkCode: null
})

// 提交表单
const submit = () => {
    cleanVerify()

    // 使用 checkValue 进行校验
    if (!checkValue('checkEmail', formData.value.email, '请输入邮箱', '邮箱格式不正确，请检查')) {
        return;
    }
    if (!checkValue('checkPassword', formData.value.password, '请输入密码', '密码必须包含字母和数字(可含特殊字符)，8-18位')) {
        return;
    }
    if (!checkValue(null, formData.value.checkCode, '请输入验证码')) {
        return;
    }

    // 检查密码是否一致
    if (formData.value.password !== formData.value.rePassword) {
        errorMsg.value.rePassword = '两次密码不一致';
        return;
    }

    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
        console.log('表单验证通过，准备提交...')
    })
    
}

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
                widows: 120px;
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