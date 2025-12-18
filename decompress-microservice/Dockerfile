# 使用Node.js 16作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache bash git curl python3 make g++

# 复制package.json
COPY package.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 7777

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]