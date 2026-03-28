<template>
  <div class="alarm-management">
    <div class="page-header">
      <h2>报警记录管理</h2>
      <div class="header-actions">
        <button class="refresh-btn" @click="loadAlarmRecords">🔄 刷新</button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>设备ID：</label>
          <input v-model="filters.deviceId" placeholder="输入设备ID" @input="applyFilters">
        </div>
        <div class="filter-item">
          <label>报警状态：</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">全部</option>
            <option value="0">未处理</option>
            <option value="1">已处理</option>
            <option value="2">已忽略</option>
          </select>
        </div>
        <div class="filter-item">
          <label>报警级别：</label>
          <select v-model="filters.level" @change="applyFilters">
            <option value="">全部</option>
            <option value="1">低</option>
            <option value="2">中</option>
            <option value="3">高</option>
            <option value="4">紧急</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">总报警数</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">{{ stats.unhandled }}</div>
        <div class="stat-label">未处理</div>
      </div>
      <div class="stat-card success">
        <div class="stat-number">{{ stats.handled }}</div>
        <div class="stat-label">已处理</div>
      </div>
      <div class="stat-card info">
        <div class="stat-number">{{ stats.ignored }}</div>
        <div class="stat-label">已忽略</div>
      </div>
    </div>

    <!-- 报警记录列表 -->
    <div class="alarm-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="filteredAlarms.length === 0" class="no-data">暂无报警记录</div>
      <div v-else>
        <div v-for="alarm in filteredAlarms" :key="alarm.id" class="alarm-item" :class="getAlarmClass(alarm)">
          <div class="alarm-header">
            <div class="alarm-title">
              <span class="device-id">{{ alarm.deviceId }}</span>
              <span class="location">{{ alarm.locationName }}</span>
            </div>
            <div class="alarm-time">{{ formatTime(alarm.alarmTime) }}</div>
          </div>
          
          <div class="alarm-content">
            <div class="alarm-info">
              <div class="info-item">
                <span class="label">报警类型：</span>
                <span class="value">{{ getAlarmTypeText(alarm.alarmType) }}</span>
              </div>
              <div class="info-item">
                <span class="label">报警级别：</span>
                <span class="value level" :class="getLevelClass(alarm.alarmLevel)">
                  {{ getAlarmLevelText(alarm.alarmLevel) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">浓度值：</span>
                <span class="value">{{ alarm.concentration }} ppm</span>
              </div>
              <div class="info-item">
                <span class="label">阈值：</span>
                <span class="value">{{ alarm.threshold }} ppm</span>
              </div>
            </div>
            
            <div class="alarm-status">
              <span class="status-badge" :class="getStatusClass(alarm.status)">
                {{ getStatusText(alarm.status) }}
              </span>
            </div>
          </div>

          <div v-if="alarm.status !== 0" class="alarm-handle">
            <div class="handle-info">
              <span class="handler">处理人：{{ alarm.handler || '系统' }}</span>
              <span class="handle-time">处理时间：{{ formatTime(alarm.handleTime) }}</span>
            </div>
            <div v-if="alarm.handleRemark" class="handle-remark">
              备注：{{ alarm.handleRemark }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reqGet } from '../util/request'

export default {
  name: 'AlarmManagement',
  data() {
    return {
      loading: false,
      alarms: [],
      filteredAlarms: [],
      filters: {
        deviceId: '',
        status: '',
        level: ''
      },
      stats: {
        total: 0,
        unhandled: 0,
        handled: 0,
        ignored: 0
      }
    }
  },
  mounted() {
    this.loadAlarmRecords()
  },
  methods: {
    async loadAlarmRecords() {
      this.loading = true
      try {
        const response = await reqGet('/alarms')
        const data = response?.data?.data || []
        this.alarms = Array.isArray(data) ? data : []
        this.calculateStats()
        this.applyFilters()
      } catch (error) {
        console.error('加载报警记录失败:', error)
        this.alarms = []
      } finally {
        this.loading = false
      }
    },

    calculateStats() {
      this.stats.total = this.alarms.length
      this.stats.unhandled = this.alarms.filter(a => a.status === 0).length
      this.stats.handled = this.alarms.filter(a => a.status === 1).length
      this.stats.ignored = this.alarms.filter(a => a.status === 2).length
    },

    applyFilters() {
      let filtered = [...this.alarms]
      
      if (this.filters.deviceId) {
        filtered = filtered.filter(alarm => 
          alarm.deviceId && alarm.deviceId.toLowerCase().includes(this.filters.deviceId.toLowerCase())
        )
      }
      
      if (this.filters.status !== '') {
        filtered = filtered.filter(alarm => alarm.status === parseInt(this.filters.status))
      }
      
      if (this.filters.level !== '') {
        filtered = filtered.filter(alarm => alarm.alarmLevel === parseInt(this.filters.level))
      }
      
      this.filteredAlarms = filtered
    },

    getAlarmClass(alarm) {
      const classes = []
      if (alarm.alarmLevel >= 3) classes.push('high-level')
      else if (alarm.alarmLevel >= 2) classes.push('medium-level')
      else classes.push('low-level')
      
      if (alarm.status === 0) classes.push('unhandled')
      return classes.join(' ')
    },

    getLevelClass(level) {
      if (level >= 4) return 'emergency'
      if (level >= 3) return 'high'
      if (level >= 2) return 'medium'
      return 'low'
    },

    getStatusClass(status) {
      switch (status) {
        case 0: return 'unhandled'
        case 1: return 'handled'
        case 2: return 'ignored'
        default: return ''
      }
    },

    getAlarmTypeText(type) {
      switch (type) {
        case 1: return '预警'
        case 2: return '报警'
        case 3: return '设备离线'
        default: return '未知'
      }
    },

    getAlarmLevelText(level) {
      switch (level) {
        case 1: return '低'
        case 2: return '中'
        case 3: return '高'
        case 4: return '紧急'
        default: return '未知'
      }
    },

    getStatusText(status) {
      switch (status) {
        case 0: return '未处理'
        case 1: return '已处理'
        case 2: return '已忽略'
        default: return '未知'
      }
    },

    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.alarm-management {
  padding: 20px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: #666;
  white-space: nowrap;
}

.filter-item input,
.filter-item select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 4px solid #22c55e;
}

.stat-card.warning {
  border-left-color: #e6a23c;
}

.stat-card.success {
  border-left-color: #22c55e;
}

.stat-card.info {
  border-left-color: #16a34a;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.alarm-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.loading,
.no-data {
  padding: 40px;
  text-align: center;
  color: #666;
}

.alarm-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  border-left: 4px solid #ddd;
}

.alarm-item:last-child {
  border-bottom: none;
}

.alarm-item.high-level {
  border-left-color: #f56c6c;
}

.alarm-item.medium-level {
  border-left-color: #e6a23c;
}

.alarm-item.low-level {
  border-left-color: #22c55e;
}

.alarm-item.unhandled {
  background: #fef9e7;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.alarm-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-id {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.location {
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.alarm-time {
  color: #999;
  font-size: 14px;
}

.alarm-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.alarm-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  flex: 1;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-item .label {
  color: #666;
  font-size: 14px;
}

.info-item .value {
  color: #333;
  font-weight: 500;
}

.value.level.emergency {
  color: #f56c6c;
  font-weight: bold;
}

.value.level.high {
  color: #e6a23c;
}

.value.level.medium {
  color: #409eff;
}

.value.level.low {
  color: #22c55e;
}

.alarm-status {
  margin-left: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.unhandled {
  background: #fef0f0;
  color: #f56c6c;
}

.status-badge.handled {
  background: #f0fdf4;
  color: #22c55e;
}

.status-badge.ignored {
  background: #f5f5f5;
  color: #909399;
}

.alarm-handle {
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 14px;
}

.handle-info {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 4px;
}

.handle-remark {
  color: #333;
  font-style: italic;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .alarm-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .alarm-status {
    margin-left: 0;
  }
  
  .handle-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>