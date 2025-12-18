# 业务中心服务

## 项目简介
业务中心服务，基于 NestJS 框架开发，提供统一的业务服务接口和数据管理功能。

## 技术栈
- **框架**: NestJS ^9.0.0
- **数据库**: MySQL 5.7+
- **ORM**: TypeORM ^0.3.17
- **API文档**: Swagger ^7.2.0
- **缓存**: Redis
- **文件存储**: MinIO
- **日志**: Winston
- **验证码**: svg-captcha
- **监控**: Prometheus + Grafana + Exporters (Redis/MySQL/Node)
- **容器化**: Docker + Docker Compose
- **工具库**: lodash, axios, dayjs, prom-client

## 目录结构

```
├── .cz-config.js                # Commitizen 配置文件
├── .editorconfig                # 编辑器配置文件
├── .eslintrc.js                 # ESLint 配置文件
├── .gitignore                   # Git 忽略文件配置
├── .prettierrc                  # Prettier 代码格式化配置
├── .vscode/                     # VS Code 配置目录
│   └── settings.json            # VS Code 项目设置
├── README.md                    # 项目说明文档
├── application.dev.yml          # 开发环境配置文件
├── application.prod.yml         # 生产环境配置文件
├── code-gen.yml                 # 代码生成配置文件
├── commitlint.config.js         # Git 提交规范配置
├── database_menu.sql            # 菜单数据初始化脚本
├── database_schema.sql          # 数据库表结构脚本
├── ecosystem.config.js          # PM2 部署配置文件
├── MONITORING.md                # 监控系统说明文档
├── Dockerfile                   # Docker 构建文件
├── docker-compose.yml           # Docker Compose 配置文件
├── nest-cli.json                # NestJS CLI 配置文件
├── package.json                 # 项目依赖配置
├── prometheus.yml               # Prometheus 配置文件
├── grafana/                     # Grafana 配置目录
│   └── provisioning/            # Grafana 自动配置
│       ├── dashboards/          # 仪表盘配置
│       └── datasources/         # 数据源配置
├── src/                         # 源代码目录
│   ├── api/                     # API 模块目录
│   │   ├── algorithm/           # 算法模块
│   │   ├── api.module.ts        # API 总模块
│   │   ├── image/               # 镜像管理模块
│   │   ├── login/               # 登录模块
│   │   ├── menu/                # 菜单模块
│   │   ├── model/               # 模型管理模块
│   │   ├── resource/            # 资源管理模块
│   │   ├── role/                # 角色管理模块
│   │   ├── sample/              # 样本管理模块
│   │   └── user/                # 用户管理模块
│   ├── app.module.ts            # 应用主模块
│   ├── constants/               # 常量定义目录
│   │   ├── index.ts             # 常量导出
│   │   ├── redis.cache.ts       # Redis 缓存相关常量
│   │   ├── redis.limit.ts       # Redis 限流相关常量
│   │   └── reg.ts               # 正则表达式常量
│   ├── decorators/              # 自定义装饰器目录
│   │   ├── current-user.decorator.ts  # 当前用户装饰器
│   │   ├── index.ts             # 装饰器导出
│   │   ├── permission.decorator.ts  # 权限验证装饰器
│   │   ├── rate-limit-api.decorator.ts  # API 限流装饰器
│   │   └── redis-cache-api.decorator.ts  # API 缓存装饰器
│   ├── enums/                   # 枚举类型目录
│   │   ├── account.type.enum.ts # 账户类型枚举
│   │   ├── method.enum.ts       # 请求方法枚举
│   │   ├── page.enum.ts         # 分页相关枚举
│   │   └── resources.type.enum.ts # 资源类型枚举
│   ├── filters/                 # 异常过滤器目录
│   │   └── http-exception.filter.ts # HTTP 异常过滤器
│   ├── guard/                   # 守卫目录
│   │   ├── auth.guard.ts        # 身份验证守卫
│   │   └── permission.guard.ts  # 权限验证守卫
│   ├── interceptor/             # 拦截器目录（旧）
│   │   ├── api.interceptor.ts   # API 拦截器
│   │   └── index.ts             # 拦截器导出
│   └── interceptors/            # 拦截器目录（新）
│       ├── api.interceptor.ts   # API 拦截器
│       ├── http-metrics.interceptor.ts # HTTP 监控拦截器
│       ├── index.ts             # 拦截器导出
│       ├── logger.interceptor.ts # 日志拦截器
│       ├── redis-cache.interceptor.ts # Redis 缓存拦截器
│       ├── redis-limit.interceptor.ts # Redis 限流拦截器
│       └── transform.interceptor.ts # 数据转换拦截器
│   ├── main.ts                  # 应用入口文件
│   ├── microService/            # 微服务相关目录
│   │   ├── microService.controller.ts # 微服务控制器
│   │   └── microService.module.ts # 微服务模块
│   ├── minioClient/             # MinIO 客户端目录
│   │   ├── minioClient.controller.ts # MinIO 控制器
│   │   ├── minioClient.module.ts # MinIO 模块
│   │   └── minioClient.service.ts # MinIO 服务
│   ├── pipe/                    # 管道目录
│   │   └── validation.pipe.ts   # 数据验证管道
│   ├── plugin/                  # 插件目录
│   │   ├── logger/              # 日志插件
│   │   ├── metrics/             # 监控指标插件
│   │   ├── plugin.module.ts     # 插件模块
│   │   ├── redis/               # Redis 插件
│   │   └── tools/               # 工具插件
│   ├── shared/                  # 共享模块目录
│   │   ├── dto/                 # 数据传输对象
│   │   ├── entities/            # 数据库实体
│   │   ├── services/            # 共享服务
│   │   ├── shared.module.ts     # 共享模块
│   │   └── vo/                  # 视图对象
│   ├── swagger.ts               # Swagger 配置文件
│   ├── types/                   # TypeScript 类型定义目录
│   │   └── index.d.ts           # 类型声明文件
│   ├── utils/                   # 工具函数目录
│   │   ├── array.ts             # 数组工具函数
│   │   ├── config.ts            # 配置工具函数
│   │   ├── data-type.ts         # 数据类型工具函数
│   │   ├── date.ts              # 日期工具函数
│   │   ├── index.ts             # 工具函数导出
│   │   ├── map.ts               # Map 工具函数
│   │   ├── str.ts               # 字符串工具函数
│   │   └── url.ts               # URL 工具函数
│   └── validators/              # 自定义验证器目录
│       ├── IsDateFormatString.ts # 日期格式验证器
│       ├── IsEqual.ts           # 相等验证器
│       ├── IsIncludes.ts        # 包含验证器
│       ├── IsUserName.ts        # 用户名验证器
│       └── index.ts             # 验证器导出
├── test/                        # 测试文件目录
│   ├── app.e2e-spec.ts          # 应用端到端测试
│   └── jest-e2e.json            # Jest E2E 测试配置
├── tsconfig.build.json          # TypeScript 构建配置
└── tsconfig.json                # TypeScript 配置文件
```

## 主要模块说明

### API 模块
- **algorithm**: 算法管理相关接口
- **image**: 图像处理相关接口
- **login**: 用户登录认证接口
- **menu**: 菜单管理接口
- **model**: 模型训练与评测相关接口
- **resource**: 资源管理相关接口
- **role**: 角色与权限管理接口
- **sample**: 样本数据管理接口
- **user**: 用户信息管理接口

### 核心功能
- 用户认证与授权（基于JWT）
- 基于角色的访问控制（RBAC）
  - 角色创建、编辑、删除
  - 角色菜单权限分配
  - 用户角色关联管理
- 菜单与权限管理
- 算法服务调用
- 样本数据管理
- 微服务通信
- 文件存储管理
- API 限流与缓存
- 数据验证与异常处理
- 系统监控与指标采集
  - 应用性能监控
  - Redis性能监控
  - MySQL数据库监控
  - 主机资源监控

## 安装与运行

### 本地开发环境

#### 安装依赖
```bash
npm install
```

#### 开发环境运行
```bash
npm run start:dev
```

### Docker容器化部署

#### 使用Docker Compose启动所有服务
```bash
docker compose up -d
```

#### 构建生产镜像
```bash
docker build -t algorithm-platform-service .
```

### 生产环境

#### 构建生产包
```bash
npm run build
```

#### 生产环境运行
```bash
npm run start:prod
```

#### PM2部署（可选）
```bash
npm install pm2 -g
npm run build
# 使用脚本启动（内部使用PM2）
npm run start:prod
# 或使用PM2直接启动
pm2 start dist/main.js
```

## API 文档
启动服务后，可通过以下地址访问 Swagger API 文档：
```
http://localhost:9000/api
```

## 监控系统
项目集成了完整的监控系统，包括：

### 监控组件
- **Prometheus**: 指标收集与存储
- **Grafana**: 可视化仪表盘
- **Exporters**:
  - Redis Exporter: Redis性能监控
  - MySQL Exporter: MySQL数据库监控  
  - Node Exporter: 主机资源监控

### 监控访问地址
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (默认用户名/密码: admin/admin)
- **Redis Exporter**: http://localhost:9121/metrics
- **MySQL Exporter**: http://localhost:9104/metrics
- **Node Exporter**: http://localhost:9100/metrics

### 详细监控说明
请查看专门的监控文档：[MONITORING.md](MONITORING.md)

## 权限验证

### 权限装饰器使用示例
```typescript
import { Permission } from '@/common/decorators/permission.decorator';

@Controller('role')
export class RoleController {
  @Post()
  @Permission('role:create') // 添加权限验证装饰器
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    // 角色创建逻辑
  }
}
```

### 权限验证流程
1. 用户登录获取 JWT Token
2. 请求 API 时在 Header 中携带 Token
3. AuthGuard 验证 Token 有效性
4. PermissionGuard 验证用户是否拥有所需权限
5. 验证通过后执行 API 逻辑

## RBAC 功能说明

### 角色管理
- **角色创建与编辑**：支持创建、修改、删除角色
- **角色权限分配**：为角色分配菜单访问权限
- **角色列表查询**：支持分页查询角色列表
- **角色详情查看**：查看角色的权限分配情况

### 用户角色关联
- **用户角色分配**：为用户分配一个或多个角色
- **角色用户管理**：查看角色下的所有用户
- **权限继承**：用户自动继承所有关联角色的权限

## 数据库初始化
1. 执行 `database_schema.sql` 创建数据库表结构
2. 执行 `database_menu.sql` 初始化菜单数据

## 配置文件
根据环境需求修改相应的配置文件：
- 开发环境: `application.dev.yml`
- 生产环境: `application.prod.yml`

## 开发规范
- 使用 TypeScript 编写代码，严格遵循类型定义
- 采用 NestJS 推荐的模块化架构
- 使用 Swagger 为 API 添加文档注释
- 遵循 Git 提交规范（使用 Commitizen）
- 代码风格统一（ESLint + Prettier）

## 注意事项
- 确保 MySQL、Redis 和 MinIO 服务正常运行
- 首次运行需执行数据库初始化脚本
- 开发环境默认端口为 9000

## 系统优化记录

### 2025-12-9 性能优化

#### 1. 并发能力优化
- **Node.js进程集群**：配置了基于CPU核心数的进程集群，充分利用多核CPU资源
- **MySQL连接池优化**：
  - 动态调整poolMax（32-64）和poolMin（16-32）连接数
  - 设置合理的连接超时参数
  - 启用连接等待机制，避免连接池满时直接拒绝请求

#### 2. 文件上传优化
- **分片上传并发控制**：实现基于Redis的分片上传并发控制，限制同一资源5个并发上传
- **文件合并优化**：采用流式合并替代同步读取写入，避免阻塞Event Loop
- **临时文件管理**：添加临时文件定期清理机制，自动清理2小时前的过期文件

#### 3. 限流策略优化
- **分片上传接口特殊限流**：为分片上传相关接口配置宽松限流策略
  - `initUpload`：10秒内最多100次请求
  - `uploadChunk`：10秒内最多100次请求  
  - `mergeChunks`：30秒内最多50次请求

#### 4. 系统稳定性提升
- 优化了大文件处理逻辑，提高系统资源利用率
- 完善了错误处理和资源清理机制
- 增加了系统监控日志输出

### 2025-12-10 监控系统集成

#### 1. 应用监控
- 集成了NestJS Prometheus指标采集
- 实现了HTTP请求监控（状态码、响应时间、响应大小）
- 添加了数据库连接池监控

#### 2. 基础设施监控
- 集成Redis Exporter监控Redis性能
- 集成MySQL Exporter监控数据库状态
- 集成Node Exporter监控主机资源

#### 3. 可视化仪表盘
- 创建了完整的Grafana仪表盘
- 支持应用性能、Redis、MySQL和主机资源的实时监控
- 支持自定义告警规则配置

### 优化后性能提升
- **API并发能力**：从单进程约30-50 QPS提升至多进程约120-200 QPS
- **文件上传**：支持更大文件和更高并发上传（推荐15-25个并发）
- **系统稳定性**：减少了大文件处理时的内存占用和CPU负载
- **可观测性**：全面监控应用和基础设施性能指标，快速定位问题

## 监控与维护

### 系统监控
项目已集成完整的监控系统，建议：
- 通过Grafana仪表盘监控系统整体运行状态
- 定期检查Prometheus指标趋势
- 设置关键指标告警规则

### 日志监控
- 使用Winston记录详细日志
- 关注错误日志和性能瓶颈
- 定期清理过期日志文件

### 数据库维护
- 定期备份数据库
- 监控MySQL连接池使用情况
- 关注慢查询日志

### 维护建议
- 根据实际负载情况调整进程数和连接池大小
- 定期检查临时文件清理任务执行情况
- 大文件上传高峰期可适当调整分片大小和并发限制
- 定期更新监控告警规则

## 微服务集成

项目集成了两个关键的微服务：

### 解压缩微服务 (decompress-microservice)
- **功能**: 处理文件解压缩操作，支持ZIP、TAR等格式
- **技术栈**: NestJS
- **通信方式**: TCP
- **端口**: 9003
- **部署方式**: 独立Docker容器
- **详细文档**: [DECOMPRESS_MICROSERVICE_IMPLEMENTATION.md](DECOMPRESS_MICROSERVICE_IMPLEMENTATION.md)

### 文件合并微服务 (merge-microservice)
- **功能**: 处理大文件分片合并操作
- **技术栈**: NestJS
- **通信方式**: TCP
- **端口**: 9004
- **部署方式**: 独立Docker容器
- **详细文档**: 参考[RESOURCE_MICROSERVICE_INTEGRATION.md](RESOURCE_MICROSERVICE_INTEGRATION.md)

### 微服务通信
- 使用NestJS的`ClientsModule`进行微服务间通信
- 主服务通过TCP协议调用微服务接口
- 支持同步和异步调用方式

## MinIO文件存储

### 功能说明
- **对象存储**: 提供S3兼容的对象存储服务
- **分片上传**: 支持大文件分片上传功能
- **生命周期管理**: 自动管理文件生命周期
- **权限控制**: 细粒度的访问控制

### 配置说明
- 配置文件: `application.dev.yml`和`application.prod.yml`中的`minio`部分
- 主要参数:
  - `endpoint`: MinIO服务地址
  - `port`: MinIO服务端口
  - `accessKey`: 访问密钥
  - `secretKey`: 密钥
  - `useSSL`: 是否使用SSL连接
  - `bucket`: 默认存储桶名称

### 分片上传指南
详细分片上传实现说明请参考: [MINIO_MULTIPART_UPLOAD_GUIDE.md](MINIO_MULTIPART_UPLOAD_GUIDE.md)

## Docker相关配置

### 环境变量配置
根据实际环境修改docker-compose.yml中的环境变量：

### 数据持久化
- MySQL数据: 使用本地挂载卷
- Redis数据: 使用本地挂载卷
- Prometheus数据: 使用命名卷
- Grafana数据: 使用命名卷
- MinIO数据: 使用本地挂载卷

### 网络配置
所有服务通过自定义网络通信，确保安全隔离

## 贡献指南

### 代码贡献流程
1. Fork项目仓库
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m "feat: add some feature"`
4. 推送到分支: `git push origin feature/your-feature`
5. 创建Pull Request

### 代码规范
- 遵循TypeScript编码规范
- 遵循NestJS最佳实践
- 使用ESLint和Prettier进行代码检查和格式化
- 为新功能添加单元测试
- 为API添加Swagger文档注释

### 提交规范
使用Commitizen进行规范化提交:
```bash
npm run commit
```

## 许可证信息

本项目采用MIT许可证:

```
MIT License

Copyright (c) [2025] [Leda Algorithm Platform]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 联系方式

### 开发团队
- 团队名称: 莱达四维算法平台开发组
- 邮箱: [algorithm-platform@leda.com]

### 问题反馈
- 提交Issue: 在GitHub仓库提交问题报告
- 邮件反馈: 发送邮件至上述邮箱

### 技术支持
- 提供工作日技术支持
- 紧急问题可通过电话联系(请先发送邮件获取联系方式)

## 版本历史

### v1.0.0 (2025-12-10)
- 初始版本发布
- 实现核心功能模块
- 集成监控系统
- 支持容器化部署

## 生产部署指南

详细生产部署步骤请参考: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
