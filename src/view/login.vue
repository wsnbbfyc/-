<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
          <div class="logo">
            <i class="fas fa-seedling"></i>
          </div>
          <h1 class="login-title">智能植物工厂环境控制系统</h1>
          <p class="login-subtitle">智能化植物生长环境监控与自动化控制平台</p>
        </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username" class="input-label">用户名</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="请输入用户名"
              required
              class="modern-input"
            />
          </div>
        </div>
        
        <div class="input-group">
          <label for="password" class="input-label">密码</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="请输入密码"
              required
              class="modern-input"
            />
            <button type="button" class="input-action-btn visibility-btn" @click="togglePasswordVisibility">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" class="input-action-btn clear-btn" @click="clearPassword" v-show="password">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="captcha">验证码</label>
          <div class="captcha-wrapper">
            <div class="input-wrapper">
              <i class="fas fa-shield-alt input-icon"></i>
              <input
                type="text"
                id="captcha"
                v-model="captcha"
                placeholder="请输入验证码"
                required
                class="modern-input captcha-input"
                maxlength="4"
              />
              <button type="button" class="input-action-btn clear-btn" @click="clearCaptcha" v-show="captcha">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="captcha-container" @click="refreshCaptcha">
              <span class="captcha-text">{{ captchaCode }}</span>
              <button type="button" class="refresh-btn" title="刷新验证码">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
        </div>
        
        <button type="submit" class="login-button" :disabled="isLoading">
          <span>{{ isLoading ? '登录中...' : '登录系统' }}</span>
          <i :class="isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right'"></i>
        </button>
        
        <div class="form-links">
          <router-link to="/register" class="link-text">
            <i class="fas fa-user-plus"></i>
            创建账号
          </router-link>
          <router-link to="/change-password" class="link-text">
            <i class="fas fa-key"></i>
            忘记密码
          </router-link>
        </div>
      </form>
    </div>
    
    <div class="background-animation">
      <div class="bubble"></div>
      <div class="bubble"></div>
      <div class="bubble"></div>
    </div>
  </div>
</template>

<script>
import { reqPostJson } from '@/util/request'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      captcha: '',
      captchaCode: '',
      showPassword: false,
      isLoading: false
    }
  },
  methods: {
    async handleLogin() {
      // 暂时跳过验证码验证
      // if (this.captcha.toLowerCase() !== this.captchaCode.toLowerCase()) {
      //   alert('验证码错误！')
      //   this.refreshCaptcha()
      //   this.captcha = ''
      //   return
      // }
      
      this.isLoading = true
      
      try {
        const response = await reqPostJson('/auth/login', {
          username: this.username,
          password: this.password,
          captcha: this.captcha
        })
        
        // 检查响应结构
        const responseData = response.data || response
        
        if (responseData.code === 200) {
          // 登录成功，保存用户信息和token
          localStorage.setItem('accessToken', responseData.data.accessToken)
          localStorage.setItem('userInfo', JSON.stringify(responseData.data.user))
          
          alert('登录成功！')
          this.$router.push('/dashboard')
        } else {
          alert(responseData.message || '登录失败')
          this.refreshCaptcha()
          this.captcha = ''
        }
      } catch (error) {
        console.error('登录错误:', error)
        alert('登录失败：' + (error.message || '网络错误'))
        this.refreshCaptcha()
        this.captcha = ''
      } finally {
        this.isLoading = false
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    clearPassword() {
      this.password = ''
    },
    clearCaptcha() {
      this.captcha = ''
    },
    refreshCaptcha() {
      // 生成4位随机验证码（数字+字母）
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.captchaCode = code
    }
  },
  mounted() {
    // 初始化验证码
    this.refreshCaptcha()
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  position: relative;
  overflow: hidden;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px 50px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
}

.logo i {
  font-size: 32px;
  color: white;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.input-group {
  margin-bottom: 25px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
}

.modern-input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.modern-input:focus {
  outline: none;
  border-color: #22c55e;
  background: white;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.modern-input::placeholder {
  color: #a0aec0;
}

.input-action-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  font-size: 14px;
  padding: 4px;
  transition: color 0.3s ease;
}

.input-action-btn:hover {
  color: #22c55e;
}

.input-action-btn.visibility-btn {
  right: 40px;
}

.input-action-btn.clear-btn {
  right: 15px;
}

.captcha-wrapper {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.captcha-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.captcha-text {
  font-size: 20px;
  font-weight: bold;
  color: white;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.refresh-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.form-links {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-text {
  color: #22c55e;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
}

.link-text:hover {
  color: #16a34a;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.bubble:nth-child(1) {
  width: 80px;
  height: 80px;
  left: 10%;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 120px;
  height: 120px;
  left: 70%;
  animation-delay: 2s;
}

.bubble:nth-child(3) {
  width: 60px;
  height: 60px;
  left: 40%;
  animation-delay: 4s;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 20px;
    padding: 40px 30px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .form-links {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
