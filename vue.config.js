const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    // 禁用WebSocket热重载以避免连接错误
    webSocketServer: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8088',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/ws': '/ws'
        }
      }
    }
  }
})
