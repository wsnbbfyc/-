<template>
  <div class="user-management">
    <!-- 加载遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">← 返回</button>
        <h1 class="page-title">用户管理</h1>
      </div>
      <div class="header-right">
        <button class="add-user-btn" @click="showAddModal = true">+ 添加用户</button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 搜索和筛选区域 -->
      <div class="search-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索用户名或邮箱..." 
            class="search-input"
            @input="filterUsers"
          >
          <button class="search-btn">🔍</button>
        </div>
        <div class="filter-controls">
          <select v-model="roleFilter" @change="filterUsers" class="filter-select">
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="operator">操作员</option>
            <option value="viewer">观察者</option>
          </select>
          <select v-model="statusFilter" @change="filterUsers" class="filter-select">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="locked">锁定</option>
          </select>
          <button class="refresh-btn" @click="refreshUsers">🔄 刷新</button>
        </div>
      </div>

      <!-- 用户统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🟢</div>
          <div class="stat-content">
            <div class="stat-number">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-content">
            <div class="stat-number">{{ adminUsers }}</div>
            <div class="stat-label">管理员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔒</div>
          <div class="stat-content">
            <div class="stat-number">{{ lockedUsers }}</div>
            <div class="stat-label">锁定用户</div>
          </div>
        </div>
      </div>

      <!-- 用户列表 -->
      <div class="user-list-section">
        <div class="section-header">
          <h3>用户列表</h3>
          <div class="list-controls">
            <span class="user-count">共 {{ filteredUsers.length }} 个用户</span>
          </div>
        </div>
        
        <div class="user-table">
          <div class="table-header">
            <div class="col-avatar">头像</div>
            <div class="col-name">用户名</div>
            <div class="col-email">邮箱</div>
            <div class="col-role">角色</div>
            <div class="col-status">状态</div>
            <div class="col-last-login">最后登录</div>
            <div class="col-actions">操作</div>
          </div>
          
          <div class="table-body">
            <div 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="table-row"
            >
              <div class="col-avatar">
                <div class="user-avatar">{{ user.avatar || '👤' }}</div>
              </div>
              <div class="col-name">
                <div class="user-info">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </div>
              <div class="col-email">{{ user.email }}</div>
              <div class="col-role">
                <span class="role-badge" :class="getRoleTextFromId(user.roleId)">
                  {{ getRoleText(user.roleId) }}
                </span>
              </div>
              <div class="col-status">
                <span class="status-badge" :class="user.isEnabled === 1 ? 'active' : 'inactive'">
                  {{ getStatusText(user.isEnabled) }}
                </span>
              </div>
              <div class="col-last-login">{{ formatTime(user.lastLoginTime) }}</div>
              <div class="col-actions">
                <button class="action-btn edit" @click="editUser(user)">编辑</button>
                <button class="action-btn reset" @click="resetPassword(user)">重置密码</button>
                <button 
                  class="action-btn" 
                  :class="user.isEnabled === 0 ? 'unlock' : 'lock'"
                  @click="toggleUserStatus(user)"
                >
                  {{ user.isEnabled === 0 ? '启用' : '禁用' }}
                </button>
                <button class="action-btn delete" @click="deleteUser(user)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加用户模态框 -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加用户</h3>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="formData.username" type="text" placeholder="请输入用户名" class="form-input">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="formData.email" type="email" placeholder="请输入邮箱" class="form-input">
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="formData.password" type="password" placeholder="请输入密码" class="form-input">
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" class="form-input">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="formData.role" class="form-select">
              <option value="viewer">观察者</option>
              <option value="operator">操作员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>真实姓名</label>
            <input v-model="formData.realName" type="text" placeholder="请输入真实姓名" class="form-input">
          </div>
          <div class="form-group">
            <label>部门</label>
            <input v-model="formData.department" type="text" placeholder="请输入部门" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddModal">取消</button>
          <button class="btn-confirm" @click="addUser">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑用户</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="formData.username" type="text" placeholder="请输入用户名" class="form-input">
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="formData.email" type="email" placeholder="请输入邮箱" class="form-input">
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="formData.role" class="form-select">
              <option value="viewer">观察者</option>
              <option value="operator">操作员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status" class="form-select">
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
              <option value="locked">锁定</option>
            </select>
          </div>
          <div class="form-group">
            <label>真实姓名</label>
            <input v-model="formData.realName" type="text" placeholder="请输入真实姓名" class="form-input">
          </div>
          <div class="form-group">
            <label>部门</label>
            <input v-model="formData.department" type="text" placeholder="请输入部门" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditModal">取消</button>
          <button class="btn-confirm" @click="updateUser">确认更新</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reqGet, reqPostJson, reqPutJson, reqDelete } from '@/util/request'

export default {
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      showAddModal: false,
      showEditModal: false,
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      
      // 用户列表
      users: [],
      filteredUsers: [],
      
      // 表单数据
      formData: {
        id: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        status: 'active',
        realName: '',
        department: ''
      },
      
      // 编辑的用户
      editingUser: null
    }
  },
  
  computed: {
    totalUsers() {
      return this.users.length
    },
    
    activeUsers() {
      return this.users.filter(user => user.isEnabled === 1).length
    },
    
    adminUsers() {
      return this.users.filter(user => user.roleId === 1).length
    },
    
    lockedUsers() {
      return this.users.filter(user => user.isEnabled === 0).length
    }
  },
  
  mounted() {
    this.fetchUsers()
  },
  
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await reqGet('/user/all')
        const resp = response.data // axios响应数据在response.data中
        if (resp && resp.code === 200) {
          this.users = resp.data || []
          console.log('获取用户列表成功:', this.users)
        } else {
          this.users = []
          console.error('获取用户列表失败:', resp?.message || '未知错误')
        }
        this.filterUsers()
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.users = []
        this.filterUsers()
        alert('获取用户列表失败: ' + (error.message || '网络错误'))
      } finally {
        this.loading = false
      }
    },
    
    filterUsers() {
      const query = (this.searchQuery || '').toLowerCase()
      this.filteredUsers = this.users.filter(user => {
        const matchesSearch = (user.username || '').toLowerCase().includes(query) || 
                            (user.email || '').toLowerCase().includes(query)
        
        // 修复角色过滤：将roleId转换为角色文本进行比较
        const userRoleText = this.getRoleTextFromId(user.roleId)
        const matchesRole = !this.roleFilter || userRoleText === this.roleFilter
        
        // 修复状态过滤：将isEnabled转换为状态文本进行比较
        const userStatusText = user.isEnabled === 1 ? 'active' : 'inactive'
        const matchesStatus = !this.statusFilter || userStatusText === this.statusFilter
        
        return matchesSearch && matchesRole && matchesStatus
      })
    },
    
    // 刷新用户列表
    refreshUsers() {
      this.fetchUsers()
    },
    
    // 添加用户
    async addUser() {
      // 表单验证（前端校验保持不变）
      if (!this.validateForm()) {
        return
      }
      try {
        this.loading = true
        const payload = {
          username: this.formData.username,
          password: this.formData.password,
          realName: this.formData.realName,
          roleId: this.getRoleId(this.formData.role),
          email: this.formData.email,
          phone: this.formData.phone || null
        }
        const response = await reqPostJson('/user', payload)
        const resp = response.data
        if (resp && resp.code === 200) {
          this.closeAddModal()
          await this.fetchUsers()
          alert('用户添加成功')
        } else {
          alert('添加用户失败: ' + (resp?.message || '未知错误'))
        }
      } catch (error) {
        console.error('添加用户失败:', error)
        alert('添加用户失败，请重试')
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户
    async updateUser() {
      // 表单验证
      if (!this.validateEditForm()) {
        return
      }
      try {
        this.loading = true
        const payload = {
          id: this.formData.id,
          username: this.formData.username,
          password: this.formData.password,
          realName: this.formData.realName,
          roleId: this.getRoleId(this.formData.role),
          email: this.formData.email,
          phone: this.formData.phone || null,
          isEnabled: this.formData.status === 'active' ? 1 : 0
        }
        const response = await reqPutJson('/user', payload)
        const resp = response.data
        if (resp && resp.code === 200) {
            await this.fetchUsers()
            this.closeEditModal()
            alert('用户更新成功')
          } else {
          alert('更新用户失败: ' + (resp?.message || '未知错误'))
        }
      } catch (error) {
        console.error('更新用户失败:', error)
        alert('更新用户失败，请重试')
      } finally {
        this.loading = false
      }
    },
    
    // 删除用户
    async deleteUser(user) {
      if (window.confirm(`确定要删除用户 ${user.username} 吗？`)) {
        try {
          this.loading = true
          const response = await reqDelete(`/user/${user.id}`)
          const resp = response.data
          if (resp && resp.code === 200) {
            await this.fetchUsers()
            alert('用户删除成功')
          } else {
            alert('删除用户失败: ' + (resp?.message || '未知错误'))
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          alert('删除用户失败，请重试')
        } finally {
          this.loading = false
        }
      }
    },

    // 重置用户密码（后端暂无明确接口，占位不调用）
    async resetPassword(/* user */) {
      this.$message?.info?.('请在后端提供重置密码接口后再启用该功能')
    },

    // 切换用户启用/禁用状态
    async toggleUserStatus(user) {
      const newStatus = user.isEnabled === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      if (window.confirm(`确定要${statusText}用户 ${user.username} 吗？`)) {
        try {
          this.loading = true
          const payload = {
            id: user.id,
            username: user.username,
            password: user.password || '123456', // 如果没有密码，使用默认密码
            realName: user.realName,
            roleId: user.roleId,
            email: user.email,
            phone: user.phone,
            isEnabled: newStatus
          }
          const response = await reqPutJson('/user', payload)
          const resp = response.data
          if (resp && resp.code === 200) {
            await this.fetchUsers()
            alert(`用户${statusText}成功`)
          } else {
            alert(`${statusText}用户失败: ` + (resp?.message || '未知错误'))
          }
        } catch (error) {
          console.error(`${statusText}用户失败:`, error)
          alert(`${statusText}用户失败，请重试`)
        } finally {
          this.loading = false
        }
      }
    },
    
    // 编辑用户
    editUser(user) {
      this.formData = {
        id: user.id,
        username: user.username,
        email: user.email,
        password: '', // 编辑时不显示密码
        confirmPassword: '',
        role: this.getRoleTextFromId(user.roleId),
        status: user.isEnabled === 1 ? 'active' : 'inactive',
        realName: user.realName,
        phone: user.phone || '',
        department: user.department || ''
      }
      this.showEditModal = true
    },
    
    // 查看用户
    viewUser(user) {
      this.formData = { ...user }
      this.showEditModal = true
    },
    
    // 表单验证
    validateForm() {
      this.errors = {}
      let isValid = true
      
      if (!this.formData.username) {
        this.errors.username = '用户名不能为空'
        isValid = false
      }
      
      if (!this.formData.email) {
        this.errors.email = '邮箱不能为空'
        isValid = false
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      if (!this.formData.password) {
        this.errors.password = '密码不能为空'
        isValid = false
      } else if (this.formData.password.length < 6) {
        this.errors.password = '密码长度不能少于6位'
        isValid = false
      }
      
      if (this.formData.password !== this.formData.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      return isValid
    },
    
    // 编辑表单验证
    validateEditForm() {
      this.errors = {}
      let isValid = true
      
      if (!this.formData.username) {
        this.errors.username = '用户名不能为空'
        isValid = false
      }
      
      if (!this.formData.email) {
        this.errors.email = '邮箱不能为空'
        isValid = false
      } else if (!this.isValidEmail(this.formData.email)) {
        this.errors.email = '请输入有效的邮箱地址'
        isValid = false
      }
      
      return isValid
    },
    
    // 邮箱格式验证
    isValidEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    
    // 重置表单
    resetForm() {
      this.formData = {
        id: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        status: 'active',
        realName: '',
        department: ''
      }
      this.errors = {}
    },
    
    // 获取角色文本
    getRoleText(role) {
      // 如果是数字ID，转换为文本
      if (typeof role === 'number') {
        const roleIdMap = {
          1: '管理员',
          2: '操作员', 
          3: '观察者'
        }
        return roleIdMap[role] || '未知角色'
      }
      // 如果是文本，直接映射
      const roleMap = {
        admin: '管理员',
        operator: '操作员',
        viewer: '观察者'
      }
      return roleMap[role] || role
    },

    // 获取角色ID
    getRoleId(roleText) {
      const roleMap = {
        admin: 1,
        operator: 2,
        viewer: 3,
        '管理员': 1,
        '操作员': 2,
        '观察者': 3
      }
      return roleMap[roleText] || 3 // 默认为观察者
    },

    // 获取角色文本（从ID）
    getRoleTextFromId(roleId) {
      const roleIdMap = {
        1: 'admin',
        2: 'operator',
        3: 'viewer'
      }
      return roleIdMap[roleId] || 'viewer'
    },
    
    // 获取状态文本
    getStatusText(status) {
      // 如果是数字（isEnabled字段）
      if (typeof status === 'number') {
        return status === 1 ? '活跃' : '禁用'
      }
      // 如果是文本状态
      const statusMap = {
        active: '活跃',
        inactive: '非活跃',
        locked: '锁定'
      }
      return statusMap[status] || status
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    // 兼容模板调用的时间格式化方法
    formatTime(value) {
      return this.formatDate(value)
    },
    
    // 返回上一页
    goBack() {
      this.$router.back()
    },
    

    
    // 关闭添加用户模态框
    closeAddModal() {
      this.showAddModal = false
      this.resetForm()
    },
    
    // 关闭编辑用户模态框
    closeEditModal() {
      this.showEditModal = false
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  padding: 20px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* 按钮样式 */
.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* 顶部添加与搜索按钮 */
.add-user-btn,
.refresh-btn,
.search-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

.add-user-btn:hover,
.refresh-btn:hover,
.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.45);
}

.add-user-btn:active,
.refresh-btn:active,
.search-btn:active {
  transform: translateY(0);
  opacity: 0.9;
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* 搜索区域 */
.search-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-select::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.filter-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.filter-select option {
  background: #16a34a;
  color: white;
  padding: 10px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 用户列表 */
.user-list-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* 表格样式 */
.user-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 2fr 1.5fr 1fr 1fr 1.5fr 2fr;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 2fr 1.5fr 1fr 1fr 1.5fr 2fr;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.col-avatar {
  display: flex;
  align-items: center;
}

.user-avatar {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.col-name {
  display: flex;
  align-items: center;
}

.user-info {
  flex: 1;
}

.user-name {
  color: white;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-id {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.col-email {
  color: white;
  display: flex;
  align-items: center;
}

.col-role {
  display: flex;
  align-items: center;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.role-badge.operator {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.role-badge.viewer {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.status-badge.inactive {
  background: rgba(158, 158, 158, 0.2);   
  color: #9E9E9E;
}

.status-badge.locked {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.col-last-login {
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
}

.col-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 列表操作按钮统一外观并细化色彩 */
.action-btn {
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.action-btn.edit {
  background: rgba(255, 193, 7, 0.18);
  border-color: rgba(255, 193, 7, 0.35);
  color: #FFC107;
}

.action-btn.reset {
  background: rgba(33, 150, 243, 0.18);
  border-color: rgba(33, 150, 243, 0.35);
  color: #2196F3;
}

.action-btn.lock {
  background: rgba(156, 39, 176, 0.18);
  border-color: rgba(156, 39, 176, 0.35);
  color: #BA68C8;
}

.action-btn.unlock {
  background: rgba(76, 175, 80, 0.18);
  border-color: rgba(76, 175, 80, 0.35);
  color: #4CAF50;
}

.action-btn.delete {
  background: rgba(244, 67, 54, 0.18);
  border-color: rgba(244, 67, 54, 0.35);
  color: #F44336;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
  opacity: 0.9;
}

.btn-view {
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.3);
  color: #2196F3;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: rgba(33, 150, 243, 0.3);
  border-color: rgba(33, 150, 243, 0.5);
  transform: translateY(-1px);
}

.btn-edit {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #FFC107;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.5);
  transform: translateY(-1px);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #F44336;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
  transform: translateY(-1px);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.form-select option {
  background: #16a34a;
  color: white;
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4757;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 2fr 1.5fr 1fr 1fr 1.5fr 1.5fr;
  }
}

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 80px 2fr 1.5fr 1fr 1fr 1fr 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .user-management {
    padding: 10px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-table {
    font-size: 12px;
  }
  
  .table-header,
  .table-row {
    gap: 8px;
    padding: 12px;
  }
  
  .col-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-view,
  .btn-edit,
  .btn-delete {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>

