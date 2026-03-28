// 模拟后端API服务
// 在实际项目中，这里会替换为真实的后端API调用

// 模拟植物工厂环境数据生成
const generateEnvironmentData = () => ({
  temperature: 20 + Math.random() * 15,        // 温度 20-35°C
  humidity: 60 + Math.random() * 30,           // 湿度 60-90%
  co2: 400 + Math.random() * 600,              // CO2 400-1000ppm
  ec: 1.0 + Math.random() * 2.0,               // EC值 1.0-3.0 mS/cm
  ph: 5.5 + Math.random() * 2.0,              // pH值 5.5-7.5
  lightIntensity: 10000 + Math.random() * 40000, // 光照强度 10000-50000 lux
  pressure: 990 + Math.random() * 40,          // 气压 990-1030 hPa
  onlineDevices: Math.floor(Math.random() * 10) + 5,
  totalDevices: 15
});

const generateDevices = () => [
  { id: 1, name: '温度传感器-01', location: '种植区A', status: 'online', icon: '🌡️' },
  { id: 2, name: '湿度传感器-01', location: '种植区A', status: 'online', icon: '💧' },
  { id: 3, name: 'CO2传感器-01', location: '种植区B', status: 'warning', icon: '💨' },
  { id: 4, name: 'pH传感器-01', location: '营养液池', status: 'online', icon: '🧪' },
  { id: 5, name: 'EC传感器-01', location: '营养液池', status: 'online', icon: '⚡' },
  { id: 6, name: '光照传感器-01', location: '种植区A', status: 'online', icon: '☀️' },
  { id: 7, name: '光照传感器-02', location: '种植区B', status: 'error', icon: '☀️' },
  { id: 8, name: '环境控制器-01', location: '控制室', status: 'online', icon: '🎛️' },
  { id: 9, name: '灌溉控制器-01', location: '设备间', status: 'maintenance', icon: '🚰' },
  { id: 10, name: '数据采集器', location: '中控室', status: 'online', icon: '💻' }
];

const generateMonitoringPoints = () => [
  { id: 1, name: '种植区A监测点', location: '温室东侧', temperature: 25.5, humidity: 75.0, threshold: 30, status: 'safe' },
  { id: 2, name: '种植区B监测点', location: '温室西侧', temperature: 28.2, humidity: 68.5, threshold: 30, status: 'warning' },
  { id: 3, name: '营养液池监测点', location: '营养液循环系统', temperature: 22.8, humidity: 85.0, threshold: 25, status: 'safe' },
  { id: 4, name: '育苗区监测点', location: '育苗室', temperature: 26.7, humidity: 80.2, threshold: 28, status: 'warning' },
  { id: 5, name: '控制室监测点', location: '环境控制中心', temperature: 24.3, humidity: 65.8, threshold: 26, status: 'safe' }
];

const generateUsers = () => [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', realName: '系统管理员', department: '技术部', lastLogin: new Date().getTime() - 1000 * 60 * 30 },
  { id: 2, username: 'operator1', email: 'operator1@example.com', role: 'operator', status: 'active', realName: '张三', department: '生产部', lastLogin: new Date().getTime() - 1000 * 60 * 60 * 2 },
  { id: 3, username: 'operator2', email: 'operator2@example.com', role: 'operator', status: 'active', realName: '李四', department: '生产部', lastLogin: new Date().getTime() - 1000 * 60 * 60 * 4 },
  { id: 4, username: 'viewer1', email: 'viewer1@example.com', role: 'viewer', status: 'active', realName: '王五', department: '安全部', lastLogin: new Date().getTime() - 1000 * 60 * 60 * 6 },
  { id: 5, username: 'viewer2', email: 'viewer2@example.com', role: 'viewer', status: 'inactive', realName: '赵六', department: '安全部', lastLogin: new Date().getTime() - 1000 * 60 * 60 * 24 * 3 },
  { id: 6, username: 'locked_user', email: 'locked@example.com', role: 'operator', status: 'locked', realName: '钱七', department: '生产部', lastLogin: new Date().getTime() - 1000 * 60 * 60 * 24 * 7 }
];

class ApiService {
  // 获取植物工厂环境数据 - 从后端获取真实数据
  static async getEnvironmentData() {
    try {
      const response = await fetch('http://localhost:8088/api/plant-factory/latest');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // 转换后端数据格式为前端需要的格式
      if (data.code === 200 && data.data) {
        const latestData = data.data;
        return {
          temperature: latestData.temperature || 0,
          humidity: latestData.humidity || 0,
          co2: latestData.co2 || 0,
          ec: latestData.ec || 0,
          ph: latestData.ph || 0,
          lightIntensity: latestData.lightIntensity || 0,
          pressure: latestData.pressure || 0,
          onlineDevices: 1, // 暂时固定值
          totalDevices: 1   // 暂时固定值
        };
      } else {
        // 如果后端没有数据，返回默认值
        return {
          temperature: 25,
          humidity: 70,
          co2: 600,
          ec: 1.5,
          ph: 6.5,
          lightIntensity: 25000,
          pressure: 1010,
          onlineDevices: 0,
          totalDevices: 1
        };
      }
    } catch (error) {
      console.error('获取植物工厂环境数据失败:', error);
      // 发生错误时返回默认值
      return {
        temperature: 25,
        humidity: 70,
        co2: 600,
        ec: 1.5,
        ph: 6.5,
        lightIntensity: 25000,
        pressure: 1010,
        onlineDevices: 0,
        totalDevices: 1
      };
    }
  }

  // 获取设备列表
  static async getDevices() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateDevices();
  }

  // 获取监测点数据
  static async getMonitoringPoints() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateMonitoringPoints();
  }

  // 添加监测点
  static async addMonitoringPoint(data) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newPoint = {
      id: Date.now(),
      ...data,
      temperature: 20 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
      status: data.threshold > 28 ? 'warning' : 'safe'
    };
    return newPoint;
  }

  // 更新监测点
  static async updateMonitoringPoint(id, data) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id,
      ...data,
      temperature: 20 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
      status: data.threshold > 28 ? 'warning' : 'safe'
    };
  }

  // 删除监测点
  static async deleteMonitoringPoint() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  // 订阅实时环境数据
  static subscribeToEnvironmentData(callback) {
    const interval = setInterval(() => {
      callback(generateEnvironmentData());
    }, 3000);

    return () => clearInterval(interval);
  }

  // 用户管理相关API
  static async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateUsers();
  }

  static async addUser(data) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newUser = {
      id: Date.now(),
      ...data,
      avatar: '👤',
      lastLogin: null
    };
    return newUser;
  }

  static async updateUser(id, data) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id,
      ...data
    };
  }

  static async deleteUser(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id };
  }

  static async resetUserPassword(id) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id };
  }

  static async updateUserStatus(id, status) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, id, status };
  }
}

export default ApiService;