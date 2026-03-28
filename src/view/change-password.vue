<template>
  <div class="change-password-container">
    <div class="background-animation">
      <div class="bubble"></div>
      <div class="bubble"></div>
      <div class="bubble"></div>
      <div class="bubble"></div>
    </div>
    
    <div class="change-password-card">
      <div class="change-password-header">
        <div class="logo">
          <i class="fas fa-seedling"></i>
        </div>
        <h1 class="change-password-title">修改密码</h1>
        <p class="change-password-subtitle">保护您的智能植物工厂账户安全</p>
      </div>
      
      <form @submit.prevent="handleChangePassword" class="change-password-form">
        <div class="input-group">
          <label class="input-label" for="currentPassword">当前密码</label>
          <div class="input-wrapper">
            <i class="fas fa-lock input-icon"></i>
            <input
              :type="showCurrentPassword ? 'text' : 'password'"
              id="currentPassword"
              v-model="currentPassword"
              class="modern-input"
              placeholder="请输入当前密码"
              required
            />
            <button type="button" class="input-action-btn visibility-btn" @click="toggleCurrentPasswordVisibility">
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" class="input-action-btn clear-btn" @click="clearCurrentPassword" v-show="currentPassword">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="newPassword">新密码</label>
          <div class="input-wrapper">
            <i class="fas fa-key input-icon"></i>
            <input
              :type="showNewPassword ? 'text' : 'password'"
              id="newPassword"
              v-model="newPassword"
              class="modern-input"
              placeholder="请输入新密码"
              required
            />
            <button type="button" class="input-action-btn visibility-btn" @click="toggleNewPasswordVisibility">
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" class="input-action-btn clear-btn" @click="clearNewPassword" v-show="newPassword">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label" for="confirmNewPassword">确认新密码</label>
          <div class="input-wrapper">
            <i class="fas fa-check-double input-icon"></i>
            <input
              :type="showConfirmNewPassword ? 'text' : 'password'"
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              class="modern-input"
              placeholder="请再次输入新密码"
              required
            />
            <button type="button" class="input-action-btn visibility-btn" @click="toggleConfirmNewPasswordVisibility">
              <i :class="showConfirmNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" class="input-action-btn clear-btn" @click="clearConfirmNewPassword" v-show="confirmNewPassword">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="password-strength-card" v-if="newPassword">
          <div class="strength-header">
            <span class="strength-label">密码强度</span>
            <span :class="['strength-badge', passwordStrengthClass]">
              {{ passwordStrengthText }}
            </span>
          </div>
          <div class="strength-bar">
            <div :class="['strength-fill', passwordStrengthClass]" :style="strengthBarWidth"></div>
          </div>
        </div>
        
        <div class="password-tips-card">
          <h4><i class="fas fa-lightbulb"></i> 密码安全提示</h4>
          <ul class="tips-list">
            <li><i class="fas fa-check" :class="{ active: newPassword.length >= 8 }"></i> 至少8个字符</li>
            <li><i class="fas fa-check" :class="{ active: /[a-z]/.test(newPassword) }"></i> 包含小写字母</li>
            <li><i class="fas fa-check" :class="{ active: /[A-Z]/.test(newPassword) }"></i> 包含大写字母</li>
            <li><i class="fas fa-check" :class="{ active: /[0-9]/.test(newPassword) }"></i> 包含数字</li>
            <li><i class="fas fa-check" :class="{ active: /[^A-Za-z0-9]/.test(newPassword) }"></i> 包含特殊字符</li>
          </ul>
        </div>
        
        <button type="submit" class="change-password-button" :disabled="isLoading">
          <i class="fas fa-save" v-if="!isLoading"></i>
          <i class="fas fa-spinner fa-spin" v-if="isLoading"></i>
          {{ isLoading ? '修改中...' : '确认修改' }}
        </button>
        
        <div class="back-link">
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
  name: 'ChangePasswordView',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      isLoading: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmNewPassword: false
    }
  },
  computed: {
    passwordStrengthClass() {
      const strength = this.calculatePasswordStrength(this.newPassword)
      return {
        'strength-weak': strength === 'weak',
        'strength-medium': strength === 'medium',
        'strength-strong': strength === 'strong'
      }
    },
    passwordStrengthText() {
      const strength = this.calculatePasswordStrength(this.newPassword)
      const texts = {
        'weak': '弱',
        'medium': '中',
        'strong': '强'
      }
      return texts[strength] || ''
    },
    strengthBarWidth() {
      const strength = this.calculatePasswordStrength(this.newPassword)
      const widths = {
        'weak': '33%',
        'medium': '66%',
        'strong': '100%'
      }
      return { width: widths[strength] || '0%' }
    }
  },
  methods: {
    calculatePasswordStrength(password) {
      if (!password) return ''
      
      let score = 0
      
      // 长度检查
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      
      // 字符类型检查
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++
      
      if (score <= 2) return 'weak'
      if (score <= 4) return 'medium'
      return 'strong'
    },
    async handleChangePassword() {
      if (this.newPassword !== this.confirmNewPassword) {
        alert('两次输入的新密码不一致！')
        return
      }
      
      if (this.newPassword.length < 8) {
        alert('新密码长度至少为8位！')
        return
      }
      
      this.isLoading = true
      
      try {
        // 从localStorage获取当前用户名
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const username = userInfo.username
        
        if (!username) {
          alert('请先登录！')
          this.$router.push('/login')
          return
        }
        
        const response = await reqPostJson('/auth/change-password', {
          username: username,
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        })
        
        if (response.code === 200) {
          alert('密码修改成功！')
          this.$router.push('/login')
        } else {
          alert(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码错误:', error)
        alert('密码修改失败：' + (error.message || '网络错误'))
      } finally {
        this.isLoading = false
      }
    },
    toggleCurrentPasswordVisibility() {
      this.showCurrentPassword = !this.showCurrentPassword
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword
    },
    toggleConfirmNewPasswordVisibility() {
      this.showConfirmNewPassword = !this.showConfirmNewPassword
    },
    clearCurrentPassword() {
      this.currentPassword = ''
    },
    clearNewPassword() {
      this.newPassword = ''
    },
    clearConfirmNewPassword() {
      this.confirmNewPassword = ''
    }
  }
}
</script>

<style scoped>
.change-password-container {
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
  width: 70px;
  height: 70px;
  left: 15%;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 90px;
  height: 90px;
  left: 50%;
  animation-delay: 2.5s;
}

.bubble:nth-child(3) {
  width: 50px;
  height: 50px;
  left: 75%;
  animation-delay: 5s;
}

.bubble:nth-child(4) {
  width: 110px;
  height: 110px;
  left: 30%;
  animation-delay: 7.5s;
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

.change-password-card {
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

.change-password-header {
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

.change-password-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.change-password-subtitle {
  font-size: 14px;
  color: #718096;
  font-weight: 400;
}

.change-password-form {
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

.password-strength-card {
  margin-bottom: 20px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.strength-label {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.strength-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.strength-badge.strength-weak {
  background: #f56565;
}

.strength-badge.strength-medium {
  background: #ed8936;
}

.strength-badge.strength-strong {
  background: #48bb78;
}

.strength-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-fill.strength-weak {
  background: #f56565;
  width: 33%;
}

.strength-fill.strength-medium {
  background: #ed8936;
  width: 66%;
}

.strength-fill.strength-strong {
  background: #48bb78;
  width: 100%;
}

.password-tips-card {
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.password-tips-card h4 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tips-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #4a5568;
}

.tips-list i {
  color: #cbd5e0;
  font-size: 12px;
  transition: color 0.3s ease;
}

.tips-list i.active {
  color: #48bb78;
}

.change-password-button {
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

.change-password-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.change-password-button:disabled {
  background: linear-gradient(135deg, #cbd5e0, #a0aec0);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.back-link {
  text-align: center;
  margin-top: 30px;
  color: #22c55e;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-link a {
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.back-link a:hover {
  color: #16a34a;
}

.back-link i {
  color: #22c55e;
}

@media (max-width: 480px) {
  .change-password-card {
    margin: 20px;
    padding: 40px 30px;
  }
  
  .change-password-title {
    font-size: 24px;
  }
  
  .back-link {
    flex-direction: column;
    gap: 10px;
  }
}
</style>