<template>
  <div class="dashboard">
    <!-- 加载遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 顶部状态栏 -->
    <header class="header">
      <div class="header-left">
        <h1 class="system-title">智能植物工厂环境控制系统</h1>
        <div class="status-indicator">
          <span class="status-dot" :class="{ online: systemStatus.online, offline: !systemStatus.online }"></span>
          <span class="status-text">{{ systemStatus.online ? '系统在线' : '系统离线' }} - {{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="system-info">
          <div class="info-item">
            <span class="info-label">运行模式:</span>
            <span class="info-value">{{ systemStatus.mode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">植物生长阶段:</span>
            <span class="info-value">{{ growthStage }}</span>
          </div>
        </div>
        <div class="user-info">
          <div class="user-avatar">👨‍💼</div>
          <span class="user-name">{{ currentUser.username || '管理员' }}</span>
        </div>
        <button class="logout-btn" @click="logout" title="退出登录">
          <i class="logout-icon">🚪</i>
          <span>退出</span>
        </button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 系统状态概览卡片 -->
      <div class="system-overview">
        <div class="overview-card main-status">
          <div class="card-header">
            <div class="card-title">
              <span class="system-name">智能植物工厂</span>
              <span class="location">生产车间A区</span>
            </div>
            <div class="update-time">{{ lastUpdateTime || '未更新' }}</div>
          </div>
          
          <div class="card-content">
            <div class="system-info">
              <div class="info-item main-value">
                <span class="label">系统状态:</span>
                <span class="value" :class="getSystemStatusClass()">{{ getSystemStatusText() }}</span>
              </div>
              <div class="info-item">
                <span class="label">运行时长:</span>
                <span class="value">{{ systemStatus.runTime }}小时</span>
              </div>
              <div class="info-item">
                <span class="label">当前模式:</span>
                <span class="value">{{ systemStatus.mode }}</span>
              </div>
              <div class="info-item">
                <span class="label">生长阶段:</span>
                <span class="value">{{ growthStage }}</span>
              </div>
            </div>
            
            <div class="status-section">
              <span class="status-badge" :class="getSystemStatusBadgeClass()">
                {{ getSystemStatusText() }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <div class="trend-info">
              <span class="trend-label">系统效率:</span>
              <span class="trend-value" :class="getEfficiencyClass()">
                {{ systemStatus.efficiency }}%
              </span>
            </div>
            <div class="data-quality">
              <span class="quality-indicator" :class="{ online: systemStatus.online, offline: !systemStatus.online }">
                {{ systemStatus.online ? '● 系统正常' : '● 系统离线' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 环境参数监控卡片 -->
      <div class="environment-metrics">
        <div class="metric-card temperature-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">🌡️</span>
              <span class="metric-name">温度</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.temperature) }}°C</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getTemperatureStatusClass()">
              {{ getTemperatureStatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 18-25°C
            </div>
          </div>
        </div>

        <div class="metric-card humidity-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">💧</span>
              <span class="metric-name">湿度</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.humidity) }}%</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getHumidityStatusClass()">
              {{ getHumidityStatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 60-80%
            </div>
          </div>
        </div>

        <div class="metric-card co2-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">🌿</span>
              <span class="metric-name">CO₂浓度</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.co2) }} ppm</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getCO2StatusClass()">
              {{ getCO2StatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 800-1200 ppm
            </div>
          </div>
        </div>

        <div class="metric-card light-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">💡</span>
              <span class="metric-name">光照强度</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.lightIntensity) }} lux</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getLightStatusClass()">
              {{ getLightStatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 10000-20000 lux
            </div>
          </div>
        </div>

        <div class="metric-card ph-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">⚗️</span>
              <span class="metric-name">pH值</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.ph) }}</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getPHStatusClass()">
              {{ getPHStatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 5.5-6.5
            </div>
          </div>
        </div>

        <div class="metric-card ec-card">
          <div class="card-header">
            <div class="card-title">
              <span class="metric-icon">⚡</span>
              <span class="metric-name">EC值</span>
            </div>
            <div class="metric-value">{{ formatNumber(environmentData.ec) }} μS/cm</div>
          </div>
          <div class="card-content">
            <div class="status-indicator" :class="getECStatusClass()">
              {{ getECStatusText() }}
            </div>
            <div class="metric-range">
              适宜范围: 1200-1800 μS/cm
            </div>
          </div>
        </div>
      </div>

      <!-- 环境参数趋势图 -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h3>{{ getChartParameterName() }}趋势图</h3>
            <div class="chart-controls">
              <div class="control-group">
                <span class="control-label">参数类型:</span>
                <button class="control-btn" :class="{ active: selectedParameter === 'temperature' }" @click="switchChartParameter('temperature')">温度</button>
                <button class="control-btn" :class="{ active: selectedParameter === 'humidity' }" @click="switchChartParameter('humidity')">湿度</button>
                <button class="control-btn" :class="{ active: selectedParameter === 'co2' }" @click="switchChartParameter('co2')">CO₂</button>
                <button class="control-btn" :class="{ active: selectedParameter === 'lightIntensity' }" @click="switchChartParameter('lightIntensity')">光照</button>
                <button class="control-btn" :class="{ active: selectedParameter === 'ph' }" @click="switchChartParameter('ph')">pH值</button>
                <button class="control-btn" :class="{ active: selectedParameter === 'ec' }" @click="switchChartParameter('ec')">EC值</button>
              </div>
              <div class="control-group">
                <span class="control-label">时间范围:</span>
                <button class="control-btn" :class="{ active: chartTimeRange === '30m' }" @click="setTimeRange('30m')">半小时</button>
                <button class="control-btn" :class="{ active: chartTimeRange === '1h' }" @click="setTimeRange('1h')">1小时</button>
                <button class="control-btn" :class="{ active: chartTimeRange === '24h' }" @click="setTimeRange('24h')">24小时</button>
                <button class="control-btn" :class="{ active: chartTimeRange === 'all' }" @click="setTimeRange('all')">全部</button>
              </div>
              <button class="update-btn" @click="updateChartFromAlarms">🔄 更新图表</button>
            </div>
          </div>
          <div class="chart-info">
            <div class="info-item">
              <span class="info-label">数据点数量:</span>
              <span class="info-value">{{ chartDataPoints }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新:</span>
              <span class="info-value">{{ lastUpdateTime }}</span>
            </div>
          </div>
          <div class="chart-wrapper">
            <canvas ref="concentrationCanvas" class="chart-area"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3>植物生长管理</h3>
          </div>
          <div class="management-info">
            <div class="info-card" @click="goToGrowthManagement">
              <div class="info-icon">🌱</div>
              <div class="info-content">
                <h4>生长阶段管理</h4>
                <p>管理植物生长阶段和参数设置</p>
              </div>
            </div>
            <div class="info-card" @click="goToUserManagement">
              <div class="info-icon">👥</div>
              <div class="info-content">
                <h4>用户管理</h4>
                <p>管理系统用户和权限</p>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3>系统报警概览</h3>
            <div class="chart-controls">
              <button class="view-all-btn" @click="goToAlarmManagement">查看全部</button>
              <button class="refresh-btn" @click="refreshData">🔄 刷新</button>
              <button class="batch-handle-btn" @click="batchHandleUnprocessedAlarms" 
                      :disabled="alarmStats.unhandled === 0"
                      title="一键处理所有未处理的报警">
                ⚡ 一键处理
              </button>
            </div>
          </div>
          <div class="alarm-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-number">{{ alarmStats.total }}</span>
                <span class="stat-label">总报警数</span>
              </div>
              <div class="stat-item warning">
                <span class="stat-number">{{ alarmStats.unhandled }}</span>
                <span class="stat-label">未处理</span>
              </div>
              <div class="stat-item success">
                <span class="stat-number">{{ alarmStats.handled }}</span>
                <span class="stat-label">已处理</span>
              </div>
            </div>
          </div>
          <div class="recent-alarms">
            <div class="alarms-list">
              <div v-if="recentAlarms.length === 0" class="no-alarms">暂无最近报警记录</div>
              <div v-else>
                <div v-for="alarm in recentAlarms.slice(0, 3)" :key="alarm.id" class="alarm-item" :class="getAlarmLevelClass(alarm.alarmLevel)">
                  <div class="alarm-info">
                    <div class="alarm-device">{{ alarm.deviceId }}</div>
                    <div class="alarm-desc">{{ getAlarmTypeText(alarm.alarmType) }} - {{ alarm.concentration }} ppm</div>
                    <div class="alarm-time">{{ formatTime(alarm.alarmTime) }}</div>
                  </div>
                  <div class="alarm-status" :class="getAlarmStatusClass(alarm.status)">
                    {{ getAlarmStatusText(alarm.status) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 监测点管理 -->
      <div class="monitoring-section">
        <div class="section-header">
          <h3>监测点管理</h3>
          <button class="add-btn" @click="showAddModal = true">+ 新增监测点</button>
        </div>
        <div class="monitoring-grid">
          <div v-for="point in monitoringPoints" :key="point.id" 
               class="monitoring-card">
            <div class="monitoring-header">
              <h4>{{ point.name }}</h4>
              <div class="monitoring-status" :class="getStatusClass(point.status)">
                {{ getPointStatusText(point.status) }}
              </div>
            </div>
            <div class="monitoring-data">
              <div class="data-item">
                <span class="data-label">位置</span>
                <span class="data-value">{{ point.location }}</span>
              </div>
              <div class="data-item">
                <span class="data-label">氯气浓度</span>
                <span class="data-value" :class="{ warning: point.chlorineLevel > point.threshold }">
                  {{ formatNumber(point.chlorineLevel) }} ppm
                </span>
              </div>
              <div class="data-item">
                <span class="data-label">报警阈值</span>
                <span class="data-value">{{ point.threshold }} ppm</span>
              </div>
            </div>
            <div class="monitoring-actions">
              <button class="action-btn edit" @click="editMonitoringPoint(point)">编辑</button>
              <button class="action-btn delete" @click="deleteMonitoringPoint(point)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 添加监测点模态框 -->
    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>新增监测点</h3>
          <button class="close-btn" @click="showAddModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>监测点名称</label>
            <input v-model="formData.name" type="text" placeholder="请输入监测点名称" class="form-input">
          </div>
          <div class="form-group">
            <label>位置</label>
            <input v-model="formData.location" type="text" placeholder="请输入具体位置" class="form-input">
          </div>
          <div class="form-group">
            <label>报警阈值 (ppm)</label>
            <input v-model.number="formData.threshold" type="number" placeholder="30" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="addMonitoringPoint">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 编辑监测点模态框 -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑监测点</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>监测点名称</label>
            <input v-model="formData.name" type="text" placeholder="请输入监测点名称" class="form-input">
          </div>
          <div class="form-group">
            <label>位置</label>
            <input v-model="formData.location" type="text" placeholder="请输入具体位置" class="form-input">
          </div>
          <div class="form-group">
            <label>报警阈值 (ppm)</label>
            <input v-model.number="formData.threshold" type="number" placeholder="30" class="form-input">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showEditModal = false">取消</button>
          <button class="btn-confirm" @click="updateMonitoringPoint">确认更新</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { reqGet, reqPutJson } from '@/util/request'
import { io } from 'socket.io-client'

export default {
  name: 'ChlorineDashboard',
  data() {
    return {
      showAddModal: false,
      showEditModal: false,
      currentTime: new Date().toLocaleString('zh-CN'),
      
      // 当前用户信息
      currentUser: {},
      
      // 环境数据
      environmentData: {
        temperature: 22.5,
        humidity: 65,
        co2: 1000,
        ec: 1500,
        ph: 6.2,
        lightIntensity: 15000,
        pressure: 101.3
      },
      
      // 系统状态
      systemStatus: {
        online: true,
        mode: '自动模式',
        runTime: 168,
        efficiency: 92
      },
      
      // 生长阶段
      growthStage: '生长期',
      
      // 监测点列表
      monitoringPoints: [],
      
      // 表单数据
      formData: {
        name: '',
        location: '',
        threshold: 30
      },
      
      // 编辑的监测点
      editingPoint: null,
      
      // 加载状态
      loading: false,
      
      // 实时更新订阅
      unsubscribeRealTime: null,

      // 告警
      recentAlerts: [],
      alertConfig: {
        warningMin: 30,
        warningMax: 50,
        errorMin: 50,
        errorMax: 100
      },

      // 报警记录相关数据
      recentAlarms: [],
      alarmStats: {
        total: 0,
        unhandled: 0,
        handled: 0
      },

      // 环境参数趋势图
      concentrationChartInstance: null,
      chartTimeRange: '30m', // 默认显示半小时数据
      chartDataPoints: 0,
      lastUpdateTime: '未更新',
      concentrationData: [], // 存储浓度数据点
      selectedParameter: 'temperature', // 当前选中的图表参数
      historicalData: {
        temperature: [],
        humidity: [],
        co2: [],
        lightIntensity: [],
        ph: [],
        ec: [],
        pressure: []
      }, // 各参数历史数据
      
      // WebSocket相关
      socket: null, // WebSocket实例
      socketConnected: false, // WebSocket连接状态
      
      // 实时更新相关
      realTimeTimer: null, // 实时更新定时器（备用）
      updateInterval: 1000 // 更新间隔1秒，匹配数据库更新频率
    }
  },
  
  computed: {
  },
  
  async mounted() {
    console.log('🚀 Dashboard 组件开始初始化')
    
    // 获取当前用户信息
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      this.currentUser = userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.currentUser = {}
    }
    
    // 更新时间
    setInterval(() => {
      this.currentTime = new Date().toLocaleString('zh-CN')
    }, 1000)
    
    // 加载初始数据
    console.log('📊 加载初始数据')
    await this.loadInitialData()
    
    // 等待DOM渲染完成后初始化图表
    await this.$nextTick()
    console.log('📈 初始化氯气浓度图')
    this.initConcentrationChart()
    
    // 初始化氯气浓度图数据
    console.log('🔄 加载氯气浓度图数据')
    await this.updateChartFromAlarms()
    
    // 启动WebSocket连接
    this.initWebSocket()
    
    // 保留HTTP轮询作为备用，仅在WebSocket连接失败时使用
    this.startRealTimeUpdate()
  },
  
  beforeUnmount() {
    // 关闭WebSocket连接
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    // 停止实时更新
    if (this.unsubscribeRealTime) {
      this.unsubscribeRealTime()
    }
    // 清理实时更新定时器
    if (this.realTimeTimer) {
      clearInterval(this.realTimeTimer)
      this.realTimeTimer = null
    }
    // 销毁氯气浓度图
    if (this.concentrationChartInstance) {
      this.concentrationChartInstance.destroy()
      this.concentrationChartInstance = null
    }
  },
  
  methods: {
    // 获取系统状态
    getSystemStatusClass() {
      return this.systemStatus.online ? 'online' : 'offline';
    },
    
    // 获取系统状态文本
    getSystemStatusText() {
      return this.systemStatus.online ? '系统正常' : '系统离线';
    },
    
    // 获取系统状态徽章样式
    getSystemStatusBadgeClass() {
      return this.systemStatus.online ? 'success' : 'danger';
    },
    
    // 获取系统效率样式
    getEfficiencyClass() {
      const efficiency = this.systemStatus.efficiency;
      if (efficiency >= 90) return 'success';
      if (efficiency >= 70) return 'warning';
      return 'danger';
    },
    
    // 获取图表参数名称
    getChartParameterName() {
      const paramMap = {
        temperature: '温度',
        humidity: '湿度',
        co2: 'CO₂浓度',
        lightIntensity: '光照强度',
        ph: 'pH值',
        ec: 'EC值'
      };
      return paramMap[this.currentChartParameter] || '温度';
    },
    
    // 跳转到生长管理页面
    goToGrowthManagement() {
      this.$router.push('/growth-management');
    },

    // 温度状态相关方法
    getTemperatureStatusClass() {
      const temp = this.environmentData.temperature;
      if (temp >= 35 || temp <= 15) return 'danger';
      if (temp >= 30 || temp <= 18) return 'warning';
      return 'normal';
    },

    getTemperatureStatusText() {
      const temp = this.environmentData.temperature;
      if (temp >= 35 || temp <= 15) return '异常';
      if (temp >= 30 || temp <= 18) return '警告';
      return '适宜';
    },

    // 湿度状态相关方法
    getHumidityStatusClass() {
      const humidity = this.environmentData.humidity;
      if (humidity >= 85 || humidity <= 40) return 'danger';
      if (humidity >= 75 || humidity <= 50) return 'warning';
      return 'normal';
    },

    getHumidityStatusText() {
      const humidity = this.environmentData.humidity;
      if (humidity >= 85 || humidity <= 40) return '异常';
      if (humidity >= 75 || humidity <= 50) return '警告';
      return '适宜';
    },

    // CO2状态相关方法
    getCO2StatusClass() {
      const co2 = this.environmentData.co2;
      if (co2 >= 2000 || co2 <= 400) return 'danger';
      if (co2 >= 1500 || co2 <= 600) return 'warning';
      return 'normal';
    },

    getCO2StatusText() {
      const co2 = this.environmentData.co2;
      if (co2 >= 2000 || co2 <= 400) return '异常';
      if (co2 >= 1500 || co2 <= 600) return '警告';
      return '适宜';
    },

    // EC值状态相关方法
    getECStatusClass() {
      const ec = this.environmentData.ec;
      if (ec >= 3000 || ec <= 800) return 'danger';
      if (ec >= 2500 || ec <= 1000) return 'warning';
      return 'normal';
    },

    getECStatusText() {
      const ec = this.environmentData.ec;
      if (ec >= 3000 || ec <= 800) return '异常';
      if (ec >= 2500 || ec <= 1000) return '警告';
      return '适宜';
    },

    // pH值状态相关方法
    getPHStatusClass() {
      const ph = this.environmentData.ph;
      if (ph >= 8.0 || ph <= 5.0) return 'danger';
      if (ph >= 7.5 || ph <= 5.5) return 'warning';
      return 'normal';
    },

    getPHStatusText() {
      const ph = this.environmentData.ph;
      if (ph >= 8.0 || ph <= 5.0) return '异常';
      if (ph >= 7.5 || ph <= 5.5) return '警告';
      return '适宜';
    },

    // 光照强度状态相关方法
    getLightStatusClass() {
      const light = this.environmentData.lightIntensity;
      if (light >= 50000 || light <= 5000) return 'danger';
      if (light >= 30000 || light <= 8000) return 'warning';
      return 'normal';
    },

    getLightStatusText() {
      const light = this.environmentData.lightIntensity;
      if (light >= 50000 || light <= 5000) return '异常';
      if (light >= 30000 || light <= 8000) return '警告';
      return '适宜';
    },

    // 气压状态相关方法
    getPressureStatusClass() {
      const pressure = this.environmentData.pressure;
      if (pressure >= 110 || pressure <= 90) return 'danger';
      if (pressure >= 105 || pressure <= 95) return 'warning';
      return 'normal';
    },

    getPressureStatusText() {
      const pressure = this.environmentData.pressure;
      if (pressure >= 110 || pressure <= 90) return '异常';
      if (pressure >= 105 || pressure <= 95) return '警告';
      return '适宜';
    },

    // 获取监测点状态文本
    getPointStatusText(status) {
      const statusMap = {
        safe: '安全',
        warning: '警告',
        error: '危险'
      };
      return statusMap[status] || '未知';
    },
    
    // 加载初始数据
    async loadInitialData() {
      this.loading = true
      try {
        // 模拟从后端获取植物工厂环境数据
        // 实际项目中应该调用真实的API
        const response = await reqGet('/plant-factory/latest')
        if (response.code === 200 && response.data) {
          const latestData = response.data
          this.environmentData = {
            temperature: latestData.temperature || 22.5,
            humidity: latestData.humidity || 65,
            co2: latestData.co2 || 1000,
            ec: latestData.ec || 1500,
            ph: latestData.ph || 6.2,
            lightIntensity: latestData.lightIntensity || 15000,
            pressure: latestData.pressure || 101.3
          }
          this.systemStatus = {
            online: latestData.online !== false,
            mode: latestData.mode || '自动模式',
            runTime: latestData.runTime || 168,
            efficiency: latestData.efficiency || 92
          }
          this.growthStage = latestData.growthStage || '生长期'
        } else {
          // 设置默认值
          this.environmentData = {
            temperature: 22.5,
            humidity: 65,
            co2: 1000,
            ec: 1500,
            ph: 6.2,
            lightIntensity: 15000,
            pressure: 101.3
          }
          this.systemStatus = {
            online: true,
            mode: '自动模式',
            runTime: 168,
            efficiency: 92
          }
          this.growthStage = '生长期'
        }

        // 创建监测区域数据（基于真实数据）
        this.monitoringPoints = [
          {
            id: 1,
            name: '生产区A',
            location: '温室1号',
            temperature: this.environmentData.temperature,
            status: this.getTemperatureStatus()
          },
          {
            id: 2,
            name: '生产区B',
            location: '温室2号',
            temperature: this.environmentData.temperature,
            status: this.getTemperatureStatus()
          }
        ]

        // 加载报警记录数据
        await this.loadAlarmData()
        
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message?.error?.('加载数据失败，请检查网络连接')
      } finally {
        this.loading = false
      }
    },
    




    // 初始化环境参数趋势图
    initConcentrationChart() {
      console.log('🎨 开始初始化环境参数趋势图')
      const canvas = this.$refs.concentrationCanvas
      if (!canvas) {
        console.error('❌ 无法找到图表Canvas元素')
        return
      }
      console.log('✅ Canvas元素找到:', canvas)
      
      // 获取Canvas 2D上下文
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('❌ 无法获取Canvas 2D上下文')
        return
      }
      console.log('✅ Canvas 2D上下文获取成功:', ctx)
      
      // 如果已有图表实例，先销毁
      if (this.concentrationChartInstance) {
        console.log('🗑️ 销毁旧图表实例')
        this.concentrationChartInstance.destroy()
        this.concentrationChartInstance = null
      }
      
      // 创建适合植物工厂的渐变色
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)')    // 顶部绿色
      gradient.addColorStop(0.3, 'rgba(139, 195, 74, 0.3)') // 中上部浅绿
      gradient.addColorStop(0.6, 'rgba(255, 193, 7, 0.2)')  // 中下部黄色
      gradient.addColorStop(0.85, 'rgba(255, 152, 0, 0.1)') // 底部橙色
      gradient.addColorStop(1, 'rgba(76, 175, 80, 0.02)')    // 底部几乎透明

      const config = {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: this.getChartParameterName(),
            data: [],
            backgroundColor: gradient,
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(76, 175, 80, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 2000,
            easing: 'easeInOutQuart',
            onComplete: function() {
              console.log('📈 环境参数图表动画完成')
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  hour: 'HH:mm',
                  day: 'MM-dd',
                  month: 'MM-dd'
                }
              },
              title: {
                display: true,
                text: '时间',
                color: 'rgba(255,255,255,0.9)',
                font: { size: 14, weight: 'bold' }
              },
              ticks: {
                color: 'rgba(255,255,255,0.8)',
                maxTicksLimit: 8,
                font: { size: 11 }
              },
              grid: { 
                color: 'rgba(255,255,255,0.15)',
                lineWidth: 1,
                drawBorder: false,
                drawTicks: false,
                z: 1
              }
            },
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: this.getChartParameterUnit(),
                color: 'rgba(255,255,255,0.9)',
                font: { size: 14, weight: 'bold' }
              },
              grid: { 
                color: 'rgba(255,255,255,0.15)',
                lineWidth: 1,
                drawBorder: false,
                drawTicks: false,
                z: 1
              },
              ticks: { 
                color: 'rgba(255,255,255,0.8)',
                font: { size: 11 },
                padding: 8
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'rgba(255,255,255,0.9)',
                font: { size: 12, weight: 'bold' },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: 'rgba(76, 175, 80, 0.5)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: function(context) {
                  return '时间: ' + new Date(context[0].parsed.x).toLocaleString('zh-CN')
                },
                label: function(context) {
                  const paramName = context.dataset.label
                  const value = context.parsed.y
                  return `${paramName}: ${value}${this.getChartParameterUnit()}`
                }.bind(this)
              }
            }
          }
        }
      }

      // 创建图表实例
      this.concentrationChartInstance = new Chart(ctx, config)
      console.log('✅ 环境参数趋势图创建成功:', this.concentrationChartInstance)
      
      // 初始化数据
      this.updateChartData()
    },

    // 获取图表参数单位
    getChartParameterUnit() {
      const unitMap = {
        temperature: '°C',
        humidity: '%',
        co2: 'ppm',
        lightIntensity: 'lux',
        ph: '',
        ec: 'μS/cm',
        pressure: 'hPa'
      }
      return unitMap[this.selectedParameter] || '°C'
    },

    // 切换图表参数
    switchChartParameter(parameter) {
      this.selectedParameter = parameter
      this.updateChartData()
    },

    // 更新图表数据
    updateChartData() {
      if (!this.concentrationChartInstance) return

      // 获取当前选中参数的历史数据
      const paramData = this.historicalData[this.selectedParameter] || []
      
      // 更新图表数据
      this.concentrationChartInstance.data.labels = paramData.map(item => item.timestamp)
      this.concentrationChartInstance.data.datasets[0].data = paramData.map(item => item.value)
      this.concentrationChartInstance.data.datasets[0].label = this.getChartParameterName()
      
      // 更新Y轴标题
      this.concentrationChartInstance.options.scales.y.title.text = this.getChartParameterUnit()
      
      // 更新图表
      this.concentrationChartInstance.update()
    },

    // 根据最新数据生成告警
    pushAlertIfNeeded(newData) {
      const value = newData?.chlorineLevel ?? 0
      const { warningMin, warningMax, errorMin, errorMax } = this.alertConfig
      let alertLevel = null
      if (value >= errorMin && value <= errorMax) alertLevel = 'high'
      else if (value >= warningMin && value <= warningMax) alertLevel = 'medium'
      else return

      const alert = {
        id: Date.now(),
        name: alertLevel === 'high' ? '高等级告警' : '中等级告警',
        value,
        threshold: alertLevel === 'high' ? `${errorMin}-${errorMax}` : `${warningMin}-${warningMax}`,
        level: alertLevel
      }
      this.recentAlerts.unshift(alert)
      // 只保留最近 10 条
      if (this.recentAlerts.length > 10) this.recentAlerts.pop()
    },

    // 规范化范围配置，确保上下界正确且有序
    normalizeAlertConfig() {
      const c = this.alertConfig
      if (c.warningMin > c.warningMax) [c.warningMin, c.warningMax] = [c.warningMax, c.warningMin]
      if (c.errorMin > c.errorMax) [c.errorMin, c.errorMax] = [c.errorMax, c.errorMin]
      // 保证区间不反向重叠：warningMax <= errorMin
      if (c.warningMax > c.errorMin) c.warningMax = c.errorMin
    },

    // 根据浓度值获取颜色
    getColorByConcentration(value) {
      if (value >= 50) {
        return {
          border: '#ff4757',      // 红色 - 危险
          background: 'rgba(255, 71, 87, 0.1)',
          point: '#ff4757'
        }
      } else if (value >= 20) {
        return {
          border: '#ffa502',      // 橙色 - 警告
          background: 'rgba(255, 165, 2, 0.1)',
          point: '#ffa502'
        }
      } else {
        return {
          border: '#00ff88',      // 绿色 - 安全
          background: 'rgba(0, 255, 136, 0.1)',
          point: '#00ff88'
        }
      }
    },

    // 绘制氯气浓度图
    drawConcentrationChart() {
      console.log('🎨 开始绘制氯气浓度图')
      
      if (!this.concentrationChartInstance) {
        console.log('❌ 图表实例不存在，先初始化')
        this.initConcentrationChart()
        if (!this.concentrationChartInstance) {
          console.error('❌ 图表初始化失败')
          return
        }
      }
      
      if (!this.concentrationData || this.concentrationData.length === 0) {
        console.log('❌ 没有浓度数据')
        return
      }
      
      // 准备图表数据，区分报警数据点和普通数据点
      const chartData = this.concentrationData.map(point => ({
        x: point.time,
        y: point.concentration,
        isAlarmData: point.isAlarmData,
        alarmLevel: point.alarmLevel
      }))
      
      // 根据浓度值范围动态调整颜色
      const maxConcentration = Math.max(...this.concentrationData.map(p => p.concentration))
      // eslint-disable-next-line no-unused-vars
      let colors = {
        border: '#00d4ff',
        background: 'rgba(0, 212, 255, 0.1)',
        point: '#00d4ff'
      }
      
      if (maxConcentration >= 1.0) {
        // eslint-disable-next-line no-unused-vars
        colors = {
          border: '#ff4757',
          background: 'rgba(255, 71, 87, 0.1)',
          point: '#ff4757'
        }
      } else if (maxConcentration >= 0.5) {
        // eslint-disable-next-line no-unused-vars
        colors = {
          border: '#ffa502',
          background: 'rgba(255, 165, 2, 0.1)',
          point: '#ffa502'
        }
      } else if (maxConcentration >= 0.2) {
        // eslint-disable-next-line no-unused-vars
        colors = {
          border: '#2ed573',
          background: 'rgba(46, 213, 115, 0.1)',
          point: '#2ed573'
        }
      }
      
      // 找出峰值点（局部最大值）
      const peaks = []
      for (let i = 1; i < chartData.length - 1; i++) {
        const prev = chartData[i - 1].y
        const curr = chartData[i].y
        const next = chartData[i + 1].y
        
        // 如果当前点比前后两点都高，且浓度超过一定阈值，则认为是峰值
        if (curr > prev && curr > next && curr >= 20) {
          peaks.push(i)
        }
      }
      

      
      // 根据时间范围动态配置时间轴
      let timeConfig = {
        displayFormats: {
          hour: 'HH:mm',
          day: 'MM-dd HH:mm',
          month: 'MM-dd'
        },
        unit: 'hour',
        stepSize: 1
      }
      
      if (this.chartTimeRange === '30m') {
        timeConfig = {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm'
          },
          unit: 'minute',
          stepSize: 5
        }
      } else if (this.chartTimeRange === '1h') {
        timeConfig = {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm'
          },
          unit: 'minute',
          stepSize: 10
        }
      } else if (this.chartTimeRange === '24h') {
        timeConfig = {
          displayFormats: {
            hour: 'HH:mm',
            day: 'MM-dd HH:mm'
          },
          unit: 'hour',
          stepSize: 2
        }
      } else { // 'all'
        timeConfig = {
          displayFormats: {
            hour: 'HH:mm',
            day: 'MM-dd',
            month: 'MM-dd'
          },
          unit: 'day',
          stepSize: 1
        }
      }
      
      // 更新图表数据和配置
      const chart = this.concentrationChartInstance
      chart.data.datasets[0].data = chartData
      
      // 同时更新散点图数据集，显示在柱子顶端
      chart.data.datasets[1].data = chartData.map(point => ({
        x: point.x,
        y: point.y
      }))
      
      // 更新时间轴配置
      chart.options.scales.x.time = timeConfig
      
      chart.update()
      
      console.log('✅ 氯气浓度图绘制完成', {
        dataPoints: chartData.length,
        timeRange: this.chartTimeRange,
        maxConcentration: maxConcentration.toFixed(3)
      })
    },

    // 设置时间范围
    setTimeRange(range) {
      this.chartTimeRange = range
      this.updateChartFromAlarms()
    },
    
    // 从环境数据API更新图表
    async updateChartFromAlarms() {
      try {
        console.log('🔄 开始获取环境数据历史记录...')
        // 获取环境数据历史记录
        const response = await reqGet('/plant-factory/history')
        console.log('📡 API响应:', response)
        
        if (response.data && response.data.code === 200 && response.data.data) {
          console.log('✅ 成功获取环境数据，数量:', response.data.data.length)
          this.generateHistoricalData(response.data.data)
          this.updateChartData()
          this.lastUpdateTime = new Date().toLocaleString()
          console.log('📊 图表更新完成，最后更新时间:', this.lastUpdateTime)
        } else {
          console.warn('⚠️ API响应异常:', response)
          // 生成模拟数据作为备用
          this.generateSimulatedData()
          this.updateChartData()
          this.lastUpdateTime = new Date().toLocaleString()
        }
      } catch (error) {
        console.error('❌ 更新环境数据图表失败:', error)
        console.error('错误详情:', error.message, error.stack)
        // 生成模拟数据作为备用
        this.generateSimulatedData()
        this.updateChartData()
        this.lastUpdateTime = new Date().toLocaleString()
      }
    },

    // 生成历史数据结构
    generateHistoricalData(data) {
      console.log('🔄 开始处理历史数据，记录数量:', data ? data.length : 0)
      
      // 初始化各参数数据
      this.historicalData = {
        temperature: [],
        humidity: [],
        co2: [],
        lightIntensity: [],
        ph: [],
        ec: [],
        pressure: []
      }
      
      if (data && data.length > 0) {
        data.forEach(record => {
          const timestamp = new Date(record.timestamp || record.createdAt)
          
          // 填充各参数数据
          if (record.temperature !== undefined) {
            this.historicalData.temperature.push({
              timestamp,
              value: Number(record.temperature)
            })
          }
          if (record.humidity !== undefined) {
            this.historicalData.humidity.push({
              timestamp,
              value: Number(record.humidity)
            })
          }
          if (record.co2 !== undefined) {
            this.historicalData.co2.push({
              timestamp,
              value: Number(record.co2)
            })
          }
          if (record.lightIntensity !== undefined) {
            this.historicalData.lightIntensity.push({
              timestamp,
              value: Number(record.lightIntensity)
            })
          }
          if (record.ph !== undefined) {
            this.historicalData.ph.push({
              timestamp,
              value: Number(record.ph)
            })
          }
          if (record.ec !== undefined) {
            this.historicalData.ec.push({
              timestamp,
              value: Number(record.ec)
            })
          }
          if (record.pressure !== undefined) {
            this.historicalData.pressure.push({
              timestamp,
              value: Number(record.pressure)
            })
          }
        })
      }
      
      // 更新数据点数量
      const currentParamData = this.historicalData[this.selectedParameter] || []
      this.chartDataPoints = currentParamData.length
      
      console.log('✅ 历史数据处理完成')
      console.log('📊 各参数数据点数量:', {
        temperature: this.historicalData.temperature.length,
        humidity: this.historicalData.humidity.length,
        co2: this.historicalData.co2.length,
        lightIntensity: this.historicalData.lightIntensity.length,
        ph: this.historicalData.ph.length,
        ec: this.historicalData.ec.length,
        pressure: this.historicalData.pressure.length
      })
    },
    
    // 查找时间点附近的报警记录
    findNearbyAlarm(alarmData, targetTime) {
      const threshold = 30 * 60 * 1000 // 30分钟阈值
      
      return alarmData.find(alarm => {
        const alarmTime = new Date(alarm.alarmTime).getTime()
        return Math.abs(alarmTime - targetTime) <= threshold
      })
    },
    
    // 根据报警级别生成浓度值
    generateConcentrationFromLevel(level) {
      switch (level) {
        case 1: return 0.1 + Math.random() * 0.2 // 低级别: 0.1-0.3
        case 2: return 0.3 + Math.random() * 0.4 // 中级别: 0.3-0.7
        case 3: return 0.7 + Math.random() * 0.5 // 高级别: 0.7-1.2
        case 4: return 1.2 + Math.random() * 0.8 // 紧急: 1.2-2.0
        default: return 0.05 + Math.random() * 0.1 // 默认: 0.05-0.15
      }
    },
    
    // 生成正常范围的浓度值
    generateNormalConcentration() {
      return 0.02 + Math.random() * 0.08 // 0.02-0.1 ppm
    },
    
    // 初始化WebSocket连接
    initWebSocket() {
      console.log('🌐 初始化WebSocket连接')
      
      try {
        // 创建WebSocket连接（根据实际后端地址配置）
        this.socket = io('http://localhost:5000', {
          transports: ['websocket'],
          timeout: 5000
        })
        
        // 连接成功事件
        this.socket.on('connect', () => {
          console.log('✅ WebSocket连接成功')
          this.socketConnected = true
          
          // 如果WebSocket连接成功，停止HTTP轮询
          if (this.realTimeTimer) {
            clearInterval(this.realTimeTimer)
            this.realTimeTimer = null
            console.log('⏹️ HTTP轮询已停止（WebSocket连接成功）')
          }
        })
        
        // 监听环境数据更新事件
        this.socket.on('env_data_update', (data) => {
          console.log('📊 接收到环境数据更新:', data)
          this.handleRealTimeData(data)
        })
        
        // 监听报警更新事件
        this.socket.on('alarm_update', (alarm) => {
          console.log('🚨 接收到报警更新:', alarm)
          this.handleAlarmUpdate(alarm)
        })
        
        // 连接错误事件
        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket连接错误:', error)
          this.socketConnected = false
          
          // 如果连接错误，重新启动HTTP轮询作为备用
          if (!this.realTimeTimer) {
            this.startRealTimeUpdate()
            console.log('🔄 HTTP轮询已启动（WebSocket连接失败）')
          }
        })
        
        // 断开连接事件
        this.socket.on('disconnect', () => {
          console.log('❌ WebSocket连接断开')
          this.socketConnected = false
          
          // 如果断开连接，重新启动HTTP轮询作为备用
          if (!this.realTimeTimer) {
            this.startRealTimeUpdate()
            console.log('🔄 HTTP轮询已启动（WebSocket连接断开）')
          }
        })
        
      } catch (error) {
        console.error('❌ WebSocket初始化失败:', error)
        this.socketConnected = false
      }
    },
    
    // 处理WebSocket实时数据
    handleRealTimeData(data) {
      if (!data) return
      
      try {
        // 更新环境数据
        const oldData = { ...this.environmentData }
        this.environmentData = {
          temperature: data.temperature || this.environmentData.temperature,
          humidity: data.humidity || this.environmentData.humidity,
          co2: data.co2 || this.environmentData.co2,
          ec: data.ec || this.environmentData.ec,
          ph: data.ph || this.environmentData.ph,
          lightIntensity: data.lightIntensity || this.environmentData.lightIntensity,
          pressure: data.pressure || this.environmentData.pressure
        }
        
        // 更新系统状态（如果有）
        if (data.systemStatus) {
          this.systemStatus = { ...this.systemStatus, ...data.systemStatus }
        }
        
        // 更新生长阶段（如果有）
        if (data.growthStage) {
          this.growthStage = data.growthStage
        }
        
        console.log('📊 环境数据更新:', {
          温度: `${oldData.temperature}→${this.environmentData.temperature}`,
          湿度: `${oldData.humidity}→${this.environmentData.humidity}`,
          CO2: `${oldData.co2}→${this.environmentData.co2}`,
          光照: `${oldData.lightIntensity}→${this.environmentData.lightIntensity}`,
          pH: `${oldData.ph}→${this.environmentData.ph}`,
          EC: `${oldData.ec}→${this.environmentData.ec}`,
          气压: `${oldData.pressure}→${this.environmentData.pressure}`
        })
        
        // 更新监测点数据
        this.monitoringPoints.forEach(point => {
          point.temperature = this.environmentData.temperature
          point.status = this.getTemperatureStatus()
        })
        
        console.log('🎯 监测点数据已更新:', this.monitoringPoints.length, '个点')
        
        // 更新最后更新时间
        this.lastUpdateTime = new Date().toLocaleString()
        console.log('⏰ 更新时间:', this.lastUpdateTime)
        
        // 动态更新图表数据
        this.addRealTimeDataToChart(data)
        
        console.log('✅ 实时数据更新成功:', {
          temperature: this.environmentData.temperature,
          humidity: this.environmentData.humidity,
          updateTime: this.lastUpdateTime
        })
        
      } catch (error) {
        console.error('❌ 处理实时数据失败:', error)
      }
    },
    
    // 处理WebSocket报警更新
    handleAlarmUpdate(alarm) {
      if (!alarm) return
      
      try {
        // 更新报警统计
        this.alarmStats.total++
        if (alarm.status === 0) {
          this.alarmStats.unhandled++
        }
        
        // 添加到最近报警列表
        this.recentAlerts.unshift(alarm)
        if (this.recentAlerts.length > 10) {
          this.recentAlerts.pop()
        }
        
        // 更新图表
        this.updateChartFromAlarms()
        
        console.log('✅ 报警更新处理成功:', alarm)
        
      } catch (error) {
        console.error('❌ 处理报警更新失败:', error)
      }
    },
    
    // 添加/更新/删除监测点（前端映射，保持原交互，不调后端）
    async addMonitoringPoint() {
      if (!this.validateForm()) return
      try {
        const newPoint = {
          id: Date.now(),
          ...this.formData,
          temperature: this.environmentData.temperature,
          status: this.getTemperatureStatus()
        }
        this.monitoringPoints.push(newPoint)
        this.showAddModal = false
        this.resetForm()
        this.$message?.success?.('监测点添加成功')
      } catch (error) {
        console.error('添加监测点失败:', error)
        this.$message?.error?.('添加失败，请重试')
      }
    },
    
    editMonitoringPoint(point) {
      this.editingPoint = point
      this.formData = {
        name: point.name,
        location: point.location,
        threshold: point.threshold
      }
      this.showEditModal = true
    },
    
    async updateMonitoringPoint() {
      if (!this.validateForm()) return
      try {
        const index = this.monitoringPoints.findIndex(p => p.id === this.editingPoint.id)
        if (index !== -1) {
          this.monitoringPoints[index] = { ...this.monitoringPoints[index], ...this.formData }
        }
        this.showEditModal = false
        this.resetForm()
        this.$message?.success?.('监测点更新成功')
      } catch (error) {
        console.error('更新监测点失败:', error)
        this.$message?.error?.('更新失败，请重试')
      }
    },

    
    async deleteMonitoringPoint(point) {
      if (!confirm(`确定要删除监测点 "${point.name}" 吗？`)) return
      try {
        this.monitoringPoints = this.monitoringPoints.filter(p => p.id !== point.id)
        this.$message?.success?.('监测点删除成功')
      } catch (error) {
        console.error('删除监测点失败:', error)
        this.$message?.error?.('删除失败，请重试')
      }
    },
    
    // 验证表单
    validateForm() {
      if (!this.formData.name.trim()) {
        this.$message?.error?.('请输入监测点名称')
        return false
      }
      if (!this.formData.location.trim()) {
        this.$message?.error?.('请输入监测点位置')
        return false
      }
      if (!this.formData.threshold || this.formData.threshold <= 0) {
        this.$message?.error?.('请输入有效的报警阈值')
        return false
      }
      return true
    },
    
    // 重置表单
    resetForm() {
      this.formData = {
        name: '',
        location: '',
        threshold: 30
      }
      this.editingPoint = null
    },
    
    // 获取状态样式
    getStatusClass(status) {
      const statusMap = {
        safe: 'safe',
        warning: 'warning',
        error: 'danger',
        online: 'online',
        offline: 'offline'
      }
      return statusMap[status] || ''
    },
    
    // 格式化数值
    formatNumber(value, decimals = 1) {
      return Number(value).toFixed(decimals)
    },
    
    // 刷新数据
    async refreshData() {
      await this.loadInitialData()
    },
    
    // 跳转到用户管理页面
    goToUserManagement() {
      this.$router.push('/user-management')
    },

    // 跳转到报警记录管理页面
    goToAlarmManagement() {
      this.$router.push('/alarm-management')
    },

    // 获取报警级别样式类
    getAlarmLevelClass(level) {
      switch (level) {
        case 4: return 'emergency'
        case 3: return 'high'
        case 2: return 'medium'
        case 1: return 'low'
        default: return ''
      }
    },

    // 获取报警状态样式类
    getAlarmStatusClass(status) {
      switch (status) {
        case 0: return 'unhandled'
        case 1: return 'handled'
        case 2: return 'ignored'
        default: return ''
      }
    },

    // 获取报警类型文本
    getAlarmTypeText(type) {
      switch (type) {
        case 1: return '预警'
        case 2: return '报警'
        case 3: return '设备离线'
        default: return '未知'
      }
    },

    // 获取报警状态文本
    getAlarmStatusText(status) {
      switch (status) {
        case 0: return '未处理'
        case 1: return '已处理'
        case 2: return '已忽略'
        default: return '未知'
      }
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    },

    // 加载报警记录数据
    async loadAlarmData() {
      try {
        const response = await reqGet('/plant-factory/alarms')
        const data = response?.data?.data || []
        this.recentAlarms = Array.isArray(data) ? data : []
        
        // 计算统计数据
        this.alarmStats.total = this.recentAlarms.length
        this.alarmStats.unhandled = this.recentAlarms.filter(a => a.status === 0).length
        this.alarmStats.handled = this.recentAlarms.filter(a => a.status === 1).length
      } catch (error) {
        console.error('加载植物工厂报警数据失败:', error)
        this.recentAlarms = []
        this.alarmStats = { total: 0, unhandled: 0, handled: 0 }
      }
    },

    // 一键处理所有未处理的报警
    async batchHandleUnprocessedAlarms() {
      try {
        // 获取所有未处理的报警ID
        const unhandledAlarms = this.recentAlarms.filter(alarm => alarm.status === 0)
        
        if (unhandledAlarms.length === 0) {
          this.$message.warning('当前没有未处理的报警记录')
          return
        }

        // 确认对话框
        const confirmed = await this.$confirm(
          `确定要一键处理所有 ${unhandledAlarms.length} 条未处理的报警记录吗？`,
          '确认操作',
          {
            confirmButtonText: '确定处理',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        ).catch(() => false)

        if (!confirmed) return

        // 获取当前用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const handler = userInfo.username || 'admin'

        // 提取报警ID列表
        const alarmIds = unhandledAlarms.map(alarm => alarm.id)

        // 调用批量处理API
        const response = await reqPutJson('/plant-factory/alarms/batch/handle', null, {
          alarmIds: alarmIds,
          handler: handler,
          handleRemark: '系统一键批量处理'
        })

        if (response?.data?.code === 200) {
          this.$message.success(`成功处理 ${alarmIds.length} 条报警记录`)
          // 刷新数据
          await this.loadAlarmData()
        } else {
          throw new Error(response?.data?.message || '处理失败')
        }

      } catch (error) {
        console.error('一键处理植物工厂报警失败:', error)
        this.$message.error('一键处理失败: ' + (error.message || '未知错误'))
      }
    },

    // 退出登录
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除本地存储的用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // 显示退出成功消息
        this.$message.success('退出登录成功')
        
        // 跳转到登录页面
        this.$router.push('/login')
      }).catch(() => {
        // 用户取消退出
      })
    },

    // 启动实时数据更新
    startRealTimeUpdate() {
      console.log('🔄 启动实时数据更新，间隔:', this.updateInterval + 'ms')
      
      // 清除之前的定时器
      if (this.realTimeTimer) {
        clearInterval(this.realTimeTimer)
        console.log('🗑️ 清除旧定时器')
      }
      
      // 设置新的定时器
      this.realTimeTimer = setInterval(async () => {
        console.log('⏰ 定时器触发，执行数据更新')
        await this.updateRealTimeData()
      }, this.updateInterval)
      console.log('✅ 实时更新定时器已启动，ID:', this.realTimeTimer)
    },

    // 停止实时数据更新
    stopRealTimeUpdate() {
      if (this.realTimeTimer) {
        clearInterval(this.realTimeTimer)
        this.realTimeTimer = null
        console.log('⏹️ 实时数据更新已停止')
      }
    },

    // 更新实时数据
    async updateRealTimeData() {
      try {
        console.log('🔄 开始获取最新植物工厂环境数据...')
        // 获取最新植物工厂环境数据
        const response = await reqGet('/plant-factory/latest')
        console.log('📡 API响应:', response)
        console.log('🔍 响应检查:', {
          code: response.code,
          hasData: !!response.data,
          dataType: typeof response.data,
          dataContent: response.data,
          directResponse: response
        })
        
        // 检查响应结构 - 根据实际的axios响应结构
        let latestData = null
        if (response.data && response.data.code === 200 && response.data.data) {
          // axios包装结构：{data: {code: 200, data: {...}}}
          latestData = response.data.data
          console.log('✅ 使用axios包装结构提取数据')
        } else if (response.data && response.data.temperature !== undefined) {
          // 直接数据结构：{data: {temperature: 25.5, ...}}
          latestData = response.data
          console.log('✅ 使用直接数据结构')
        } else if (response.temperature !== undefined) {
          // 最直接结构：响应本身就是数据
          latestData = response
          console.log('✅ 使用最直接结构')
        } else {
          console.log('❌ 无法识别响应结构:', response)
        }
        
        if (latestData) {
          
          // 更新环境数据
          const oldData = { ...this.environmentData }
          this.environmentData = {
            temperature: latestData.temperature || this.environmentData.temperature,
            humidity: latestData.humidity || this.environmentData.humidity,
            co2: latestData.co2 || this.environmentData.co2,
            ec: latestData.ec || this.environmentData.ec,
            ph: latestData.ph || this.environmentData.ph,
            lightIntensity: latestData.lightIntensity || this.environmentData.lightIntensity,
            pressure: latestData.pressure || this.environmentData.pressure
          }
          
          // 更新系统状态（如果有）
          if (latestData.systemStatus) {
            this.systemStatus = { ...this.systemStatus, ...latestData.systemStatus }
          }
          
          // 更新生长阶段（如果有）
          if (latestData.growthStage) {
            this.growthStage = latestData.growthStage
          }
          
          console.log('📊 环境数据更新:', {
            温度: `${oldData.temperature}→${this.environmentData.temperature}`,
            湿度: `${oldData.humidity}→${this.environmentData.humidity}`,
            CO2: `${oldData.co2}→${this.environmentData.co2}`,
            光照: `${oldData.lightIntensity}→${this.environmentData.lightIntensity}`,
            pH: `${oldData.ph}→${this.environmentData.ph}`,
            EC: `${oldData.ec}→${this.environmentData.ec}`,
            气压: `${oldData.pressure}→${this.environmentData.pressure}`
          })
          
          // 更新监测点数据
          this.monitoringPoints.forEach(point => {
            point.temperature = this.environmentData.temperature
            point.status = this.getTemperatureStatus()
          })
          console.log('🎯 监测点数据已更新:', this.monitoringPoints.length, '个点')
          
          // 更新最后更新时间
          this.lastUpdateTime = new Date().toLocaleString()
          console.log('⏰ 更新时间:', this.lastUpdateTime)
          
          // 动态更新图表数据
          await this.addRealTimeDataToChart(latestData)
          
          console.log('✅ 实时数据更新成功:', {
            temperature: this.environmentData.temperature,
            humidity: this.environmentData.humidity,
            updateTime: this.lastUpdateTime
          })
        }
      } catch (error) {
        console.error('❌ 实时数据更新失败:', error)
        // 不显示错误消息，避免频繁弹窗
      }
    },

    // 添加实时数据到图表
    async addRealTimeDataToChart(latestData) {
      if (!this.concentrationChartInstance || !latestData) {
        return
      }

      const chart = this.concentrationChartInstance
      const now = new Date()
      
      // 获取当前选中参数的值
      const parameterValue = latestData[this.selectedParameter] || 0
      const newDataPoint = {
        x: now.getTime(),
        y: parameterValue
      }

      // 添加新数据点到对应的数据集
      const datasetIndex = this.getParameterDatasetIndex(this.selectedParameter)
      if (datasetIndex !== -1) {
        chart.data.datasets[datasetIndex].data.push(newDataPoint)
        
        // 保持数据点数量在合理范围内（最多保留50个点）
        const maxDataPoints = 50
        if (chart.data.datasets[datasetIndex].data.length > maxDataPoints) {
          chart.data.datasets[datasetIndex].data.shift()
        }
        
        // 更新图表
        chart.update('active')
        
        console.log('📈 图表实时数据已更新:', {
          参数: this.getChartParameterName(this.selectedParameter),
          时间: now.toLocaleTimeString(),
          数值: parameterValue,
          数据点数: chart.data.datasets[datasetIndex].data.length
        })
      }
    },

    // 获取参数对应的数据集索引
    getParameterDatasetIndex(parameter) {
      const parameterMap = {
        'temperature': 0,
        'humidity': 1,
        'co2': 2,
        'ec': 3,
        'ph': 4,
        'lightIntensity': 5,
        'pressure': 6
      }
      return parameterMap[parameter] || 0
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.system-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.online {
  background: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.weather-info, .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(244, 67, 54, 0.3);
  border-color: rgba(244, 67, 54, 0.5);
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 16px;
}

.main-content {
  padding: 40px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

/* 氯气浓度卡片样式 */
.chlorine-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.chlorine-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 不同状态的卡片边框颜色 */
.chlorine-card.normal {
  border-left: 4px solid #4CAF50;
}

.chlorine-card.warning {
  border-left: 4px solid #FF9800;
}

.chlorine-card.danger {
  border-left: 4px solid #f44336;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-id {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.location {
  font-size: 12px;
  color: #666;
}

.update-time {
  font-size: 12px;
  color: #999;
}

/* 卡片内容 */
.card-content {
  margin-bottom: 16px;
}

.concentration-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item.main-value {
  grid-column: 1 / -1;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.info-item.main-value .label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.info-item.main-value .value {
  font-size: 24px;
  font-weight: 700;
  color: #2196F3;
}

.info-item .label {
  font-size: 12px;
  color: #666;
}

.info-item .value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

/* 状态部分 */
.status-section {
  text-align: center;
  margin: 16px 0;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.safe {
  background: #e8f5e8;
  color: #4CAF50;
  border: 1px solid #4CAF50;
}

.status-badge.warning {
  background: #fff3e0;
  color: #FF9800;
  border: 1px solid #FF9800;
}

.status-badge.danger {
  background: #ffebee;
  color: #f44336;
  border: 1px solid #f44336;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
}

.trend-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-label {
  color: #666;
}

.trend-value {
  font-weight: 500;
}

.trend-value.up {
  color: #f44336;
}

.trend-value.down {
  color: #4CAF50;
}

.trend-value.stable {
  color: #666;
}

.data-quality {
  display: flex;
  align-items: center;
}

.quality-indicator {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.quality-indicator.online {
  color: #4CAF50;
}

.quality-indicator.offline {
  color: #f44336;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-header h3 {
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.metric-unit {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.value {
  color: white;
  font-size: 32px;
  font-weight: 700;
}

.trend {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
}

.trend.up {
  color: #4CAF50;
}

.trend.down {
  color: #2196F3;
}

.trend.stable {
  color: #FFC107;
}

.metric-status {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: inline-block;
}

.metric-status.safe {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.metric-status.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.metric-status.error {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.metric-status.normal {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.chart-wrapper {
  height: 400px;
  position: relative;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.chart-area {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.control-btn {
  padding: 6px 12px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.control-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.15);
}

.refresh-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 12px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.update-btn {
  padding: 6px 12px;
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.update-btn:hover {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.5);
}

.management-buttons {
  display: flex;
  gap: 12px;
}

.management-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.management-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.management-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}



/* 报警记录概览样式 */
.view-all-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.batch-handle-btn {
  padding: 6px 12px;
  background: rgba(255, 152, 0, 0.2);
  color: #FF9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.batch-handle-btn:hover:not(:disabled) {
  background: rgba(255, 152, 0, 0.3);
  border-color: rgba(255, 152, 0, 0.5);
  transform: translateY(-1px);
}

.batch-handle-btn:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  transform: none;
}

.alarm-summary {
  margin-bottom: 16px;
}

.summary-stats {
  display: flex;
  gap: 20px;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-item.warning .stat-number {
  color: #ffc107;
}

.stat-item.success .stat-number {
  color: #28a745;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.recent-alarms {
  max-height: 200px;
  overflow-y: auto;
}

.alarms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-alarms {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 20px;
  font-size: 14px;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid rgba(255, 255, 255, 0.3);
}

.alarm-item.emergency {
  border-left-color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.alarm-item.high {
  border-left-color: #fd7e14;
  background: rgba(253, 126, 20, 0.1);
}

.alarm-item.medium {
  border-left-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.alarm-item.low {
  border-left-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.alarm-info {
  flex: 1;
}

.alarm-device {
  font-weight: bold;
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
}

.alarm-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 2px;
}

.alarm-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
}

.alarm-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.alarm-status.unhandled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.alarm-status.handled {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.alarm-status.ignored {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

/* 告警中心样式 */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alerts-box {
  max-height: 220px;
  overflow-y: auto;
  padding-right: 6px;
}

.alerts-box::-webkit-scrollbar {
  width: 8px;
}

.alerts-box::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
}

.alerts-box::-webkit-scrollbar-track {
  background: transparent;
}

.alert-config {
  margin-bottom: 12px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.config-input {
  width: 70px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
}

.config-split {
  opacity: 0.6;
  margin: 0 4px;
}

.no-alerts {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.alert-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 14px;
}

.alert-item .alert-title {
  color: white;
  font-weight: 600;
  margin-bottom: 6px;
}

.alert-item .alert-desc {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.alert-item.medium {
  border-color: rgba(255, 193, 7, 0.35);
  background: rgba(255, 193, 7, 0.12);
}

.alert-item.high {
  border-color: rgba(244, 67, 54, 0.35);
  background: rgba(244, 67, 54, 0.12);
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.info-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.info-content h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.info-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.monitoring-section {
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

.add-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.monitoring-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.monitoring-card:hover {
  background: rgba(255, 255, 255, 0.15);
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.monitoring-header h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.monitoring-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.monitoring-status.safe {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.monitoring-status.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.monitoring-status.error {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.monitoring-data {
  margin-bottom: 16px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.data-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.data-value {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.data-value.warning {
  color: #FFC107;
}

.monitoring-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.action-btn.delete {
  background: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.action-btn:hover {
  opacity: 0.8;
}

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
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: #22c55e;
  color: white;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .monitoring-grid {
    grid-template-columns: 1fr;
  }
  
  .management-info {
    grid-template-columns: 1fr;
  }
}
</style>