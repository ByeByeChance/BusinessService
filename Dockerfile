# 使用Node.js 16作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache bash git curl python3 make g++

# 复制package.json和yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --development
# RUN yarn install --production

# 复制源代码
COPY src ./src
COPY *.yml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# 构建应用
RUN yarn build

# 暴露端口
EXPOSE 9000

# 设置环境变量
ENV NODE_ENV=development
# ENV NODE_ENV=production

# 启动应用
CMD ["yarn", "start:dev"]
# CMD ["yarn", "start:prod"]
