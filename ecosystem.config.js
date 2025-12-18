module.exports = {
  apps: [
    {
      name: 'algorithm-platform-service',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        RUNNING_ENV: 'prod',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      pid_file: './logs/app.pid',
      // PM2监控配置
      min_uptime: '30s',
      max_restarts: 5,
      restart_delay: 5000,
      // 健康检查
      // health_check: {
      //   uri: 'http://localhost:9000/api/health',
      //   interval: 10000,
      //   timeout: 5000,
      //   max_retries: 3,
      // },
    },
  ],
};
