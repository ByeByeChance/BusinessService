# 生产环境部署文档

## 1. 环境要求

- Docker 19.03+ 
- Docker Compose 1.25+ 
- Linux 操作系统（推荐 CentOS 7+ 或 Ubuntu 18.04+）

## 2. 项目结构

```
AlgorithmPlatformService/
├── src/                      # 主应用源代码
├── decompress-microservice/  # 解压缩微服务源代码
├── Dockerfile                # 主应用Dockerfile
├── docker-compose.yml        # Docker Compose配置文件
├── application.prod.yml      # 生产环境配置文件
└── package.json              # 主应用依赖配置
```

## 3. 生产环境打包结构

### 3.1 主应用（AlgorithmPlatformService）

- **容器化**: 使用Docker容器化，基于Node.js 16 Alpine镜像
- **构建产物**: 编译后的JavaScript代码位于`dist/`目录
- **依赖**: 仅包含生产环境依赖
- **端口**: 容器内部使用9000端口，可通过Docker Compose映射到主机端口

### 3.2 解压缩微服务（decompress-microservice）

- **独立容器**: 作为独立微服务运行在单独的Docker容器中
- **构建产物**: 编译后的JavaScript代码位于`dist/`目录
- **依赖**: 包含解压缩所需的所有依赖（adm-zip, tar, zlib等）
- **端口**: 容器内部使用7777端口，可通过Docker Compose映射到主机端口

### 3.3 数据存储

- **MySQL**: 独立的MySQL 8.0容器，数据持久化到`mysql_data`卷
- **Redis**: 独立的Redis 7.0容器，数据持久化到`redis_data`卷
- **解压缩数据**: 解压缩文件存储到`decompress_data`卷，供微服务访问

## 4. 配置调整

### 4.1 主应用配置（application.prod.yml）

```yaml
PORT: 9000
PREFIX: api

# 数据库配置
datasource:
  driverName: mysql
  host: mysql  # 使用Docker Compose服务名
  port: 3306
  database: algorithm_platform
  username: root
  password: your_production_password
  charset: utf8mb4
  logging: false
  synchronize: false

# Redis配置
redis:
  host: redis  # 使用Docker Compose服务名
  port: 6379
  password: your_redis_password
  db: 0

# Minio配置（生产环境）
MINIO_CONFIG:
  MINIO_ENDPOINT: 'your_minio_endpoint'
  MINIO_PORT: 9000
  MINIO_ACCESSKEY: 'your_access_key'
  MINIO_SECRETKEY: 'your_secret_key'
  MINIO_BUCKET: 'your_bucket_name'
```

### 4.2 Docker Compose配置（docker-compose.yml）

```yaml
version: '3.8'

services:
  # 解压缩微服务
  decompress-microservice:
    build: ./decompress-microservice
    container_name: decompress-microservice
    ports:
      - "7777:7777"
    restart: always
    volumes:
      - decompress_data:/app/decompress
    environment:
      - NODE_ENV=production

  # 主应用服务
  app:
    build: .
    container_name: algorithm-platform-service
    ports:
      - "9000:9000"
    environment:
      - RUNNING_ENV=prod
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=your_redis_password
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=your_production_password
      - DB_DATABASE=algorithm_platform
    depends_on:
      - mysql
      - redis
      - decompress-microservice
    restart: always
    volumes:
      - ./logs:/app/logs

  mysql:
    image: mysql:8.0
    container_name: algorithm-platform-mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=your_production_password
      - MYSQL_DATABASE=algorithm_platform
    restart: always
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database_schema.sql:/docker-entrypoint-initdb.d/001_schema.sql
    command:
      - --default-authentication-plugin=mysql_native_password
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci

  redis:
    image: redis:7.0-alpine
    container_name: algorithm-platform-redis
    ports:
      - "6379:6379"
    restart: always
    volumes:
      - redis_data:/data
    command:
      - --appendonly yes
      - --requirepass your_redis_password

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
  decompress_data:
    driver: local
```

### 4.3 主应用Dockerfile调整

```dockerfile
# 使用Node.js 16作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache bash git curl python3 make g++

# 复制package.json和yarn.lock
COPY package.json yarn.lock ./

# 安装生产依赖
RUN yarn install --production

# 复制源代码
COPY src ./src
COPY *.yml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 9000

# 设置环境变量为生产环境
ENV NODE_ENV=production

# 启动应用
CMD ["yarn", "start:prod"]
```

## 5. 一键启动服务

### 5.1 构建和启动

在项目根目录执行以下命令：

```bash
# 构建并启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5.2 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 5.3 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务（如主应用）
docker-compose restart app
```

## 6. 服务访问

- **主应用API**: http://localhost:9000/api
- **MySQL**: localhost:3306（生产环境建议不暴露公网）
- **Redis**: localhost:6379（生产环境建议不暴露公网）
- **解压缩微服务**: 仅内部访问，通过7777端口

## 7. 监控和维护

### 7.1 查看容器状态

```bash
docker-compose ps
```

### 7.2 查看应用日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f decompress-microservice
```

### 7.3 进入容器

```bash
# 进入主应用容器
docker-compose exec app sh

# 进入MySQL容器
docker-compose exec mysql mysql -u root -p
```

## 8. 扩展建议

1. **负载均衡**: 对于高并发场景，可以使用Nginx作为API网关和负载均衡器
2. **服务发现**: 考虑集成Consul或Eureka实现服务发现
3. **监控系统**: 启用Prometheus和Grafana监控（已在docker-compose.yml中注释）
4. **CI/CD**: 配置Jenkins或GitLab CI实现自动构建和部署
5. **备份策略**: 定期备份MySQL数据库和重要文件

## 9. 故障排查

1. **服务无法启动**: 检查容器日志，查看错误信息
2. **数据库连接失败**: 确认MySQL容器是否正常运行，检查密码配置
3. **微服务通信失败**: 确认微服务容器是否正常运行，检查端口配置
4. **文件上传/解压缩失败**: 检查Minio配置和权限，查看解压缩微服务日志

通过以上配置和步骤，您可以快速搭建一个完整的生产环境，包括主应用和解压缩微服务，并通过docker-compose实现一键启动和管理。