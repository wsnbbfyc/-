<template>
  <div class="register-container">
    <div class="background-animation">
      <div class="bubble"></div>
      <div class="bubble"></div>
      <div class="bubble"></div>
      <div class="bubble"></div>
    </div>
    
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <i class="fas fa-seedling"></i>
        </div>
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">加入智能植物工厂环境控制系统</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label class="input-label" for="username">用户名</label>
          <div class="input-wrapper">
            <i class="fas fa-user input-icon"></i>
            <input
              type="text"
              id="username"
              v-model="username"
              class="modern-input"
              placeholder="请输入用户名"
              required
            />
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="email">邮箱地址</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope input-icon"></i>
            <input
              type="email"
              id="email"
              v-model="email"
              class="modern-input"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="password">密码</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="modern-input"
              placeholder="请输入密码"
              required
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
          <label class="input-label" for="confirmPassword">确认密码</label>
          <div class="input-wrapper">
            <i class="fas fa-check-circle input-icon"></i>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              class="modern-input"
              placeholder="请再次输入密码"
              required
            />
            <button type="button" class="input-action-btn visibility-btn" @click="toggleConfirmPasswordVisibility">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" class="input-action-btn clear-btn" @click="clearConfirmPassword" v-show="confirmPassword">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="phone">手机号码</label>
          <div class="input-wrapper">
            <i class="fas fa-phone input-icon"></i>
            <input
              type="tel"
              id="phone"
              v-model="phone"
              class="modern-input"
              placeholder="请输入手机号码"
            />
          </div>
        </div>
        
        <button type="submit" class="register-button" :disabled="isLoading">
          <i class="fas fa-user-plus" v-if="!isLoading"></i>
          <i class="fas fa-spinner fa-spin" v-if="isLoading"></i>
          {{ isLoading ? '注册中...' : '立即注册' }}
        </button>
        
        <div class="login-link">
          <i class="fas fa-arrow-left"></i>
          <router-link to="/login">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reqPostJson } from '@/util/request'

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false
    }
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('两次输入的密码不一致！')
        return
      }
      
      if (this.password.length < 8) {
        alert('密码长度至少为8位！')
        return
      }
      
      this.isLoading = true
      
      try {
        const response = await reqPostJson('/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password,
          phone: this.phone,
          realName: this.username // 使用用户名作为真实姓名
        })
        
        if (response.code === 200) {
          alert('注册成功！')
          this.$router.push('/login')
        } else {
          alert(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        alert('注册失败：' + (error.message || '网络错误'))
      } finally {
        this.isLoading = false
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword
    },
    clearPassword() {
      this.password = ''
    },
    clearConfirmPassword() {
      this.confirmPassword = ''
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
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
  width: 60px;
  height: 60px;
  left: 20%;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 100px;
  height: 100px;
  left: 60%;
  animation-delay: 3s;
}

.bubble:nth-child(3) {
  width: 80px;
  height: 80px;
  left: 80%;
  animation-delay: 6s;
}

.bubble:nth-child(4) {
  width: 40px;
  height: 40px;
  left: 10%;
  animation-delay: 9s;
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

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px 50px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 10;
}

.register-header {
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

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.register-form {
  width: 100%;
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

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #11998e, #38ef7d);
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

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.register-button:disabled {
  background: linear-gradient(135deg, #a0aec0, #cbd5e0);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-link {
  text-align: center;
  margin-top: 30px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-link a {
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #16a34a;
}

.login-link i {
  color: #11998e;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.3);
}

.register-button:disabled {
  background: linear-gradient(135deg, #cbd5e0, #a0aec0);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 480px) {
  .register-card {
    margin: 20px;
    padding: 40px 30px;
  }
  
  .register-title {
    font-size: 24px;
  }
  
  .login-link {
    flex-direction: column;
    gap: 10px;
  }
}
</style>