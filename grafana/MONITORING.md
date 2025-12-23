# Prometheus + Grafana 监控系统配置说明

本项目已集成 Prometheus + Grafana 监控系统，用于监控应用性能、数据库和Redis状态。

## 监控系统架构

- **Prometheus**: 负责采集和存储指标数据
- **Grafana**: 负责可视化展示监控数据
- **应用**: 暴露监控指标（`/api/metrics`）
- **Redis**: 提供缓存服务（可选监控）

## 配置文件说明

### Prometheus 配置

配置文件路径: `prometheus.yml`

主要配置项:
- `scrape_interval`: 全局采集间隔，默认15秒
- `scrape_configs`: 定义监控目标
  - `prometheus`: Prometheus自身监控
  - `algorithm-platform-service`: 应用服务监控
  - `redis`: Redis监控（可选）

### Grafana 配置

配置目录: `grafana/provisioning/`

- **数据源配置**: `datasources/prometheus.yml` - 连接到Prometheus
- **仪表盘配置**: `dashboards/provider.yml` - 自动加载仪表盘
- **默认仪表盘**: `dashboards/algorithm-platform-service.json` - 应用监控仪表盘

### Docker Compose 配置

配置文件路径: `docker-compose.yml`

包含服务:
- `app`: 应用服务
- `mysql`: 数据库服务
- `redis`: 缓存服务
- `prometheus`: 监控采集服务
- `grafana`: 监控展示服务

## 使用方法

### 1. 启动所有服务

```bash
docker-compose up -d
```

### 2. 访问监控页面

- **应用服务**: `http://localhost:9000/api/metrics` - 查看原始指标数据
- **Prometheus**: `http://localhost:9090` - Prometheus管理界面
- **Grafana**: `http://localhost:3000` - Grafana可视化界面

### 3. 查看Exporter指标

- **Redis Exporter**: `http://localhost:9121/metrics`
- **MySQL Exporter**: `http://localhost:9104/metrics`
- **Node Exporter**: `http://localhost:9100/metrics`

### 4. 登录 Grafana

- **用户名**: `admin`
- **密码**: `admin123`

首次登录需要修改密码。

### 5. 查看监控仪表盘

登录后，在左侧菜单选择 "Dashboards" -> "Manage"，即可看到 "Algorithm Platform Service Monitor" 仪表盘。

**注意**: 还可以使用 `grafana/provisioning/dashboards/algorithm-platform-service-full.json` 仪表盘，该仪表盘包含应用、Redis、MySQL和主机资源的完整监控指标。

### 6. 停止所有服务

```bash
docker-compose down
```

## 3. 监控指标说明

### 3.1 应用HTTP指标

- `http_requests_total`: HTTP请求总数，按状态码、方法和路径分组
- `http_response_time_seconds_bucket`: HTTP响应时间直方图，按路径分组
- `http_response_size_bytes_bucket`: HTTP响应大小直方图，按路径分组

### 3.2 数据库指标

- `database_connections_total`: 数据库连接总数
- `database_idle_connections_total`: 数据库空闲连接数
- `database_connections_waiting_total`: 数据库等待连接数
- `database_queries_total`: 数据库查询总数
- `database_query_time_seconds_bucket`: 数据库查询时间直方图
- `database_query_result_size_bytes_bucket`: 数据库查询结果大小直方图

### 3.3 Redis指标

- `redis_memory_used_bytes`: Redis使用的内存字节数
- `redis_memory_max_bytes`: Redis配置的最大内存字节数
- `redis_commands_processed_total`: Redis处理的命令总数
- `redis_connections_received_total`: Redis接收的连接总数
- `redis_connections_accepted_total`: Redis接受的连接总数
- `redis_keyspace_hits_total`: Redis键空间命中总数
- `redis_keyspace_misses_total`: Redis键空间未命中总数

### 3.4 MySQL指标

- `mysql_global_status_questions`: MySQL处理的查询总数
- `mysql_global_status_slow_queries`: MySQL慢查询总数
- `mysql_global_status_connections`: MySQL连接总数
- `mysql_global_status_threads_running`: MySQL当前运行的线程数
- `mysql_global_status_threads_connected`: MySQL当前连接的线程数
- `mysql_global_status_bytes_sent`: MySQL发送的字节总数
- `mysql_global_status_bytes_received`: MySQL接收的字节总数

### 3.5 主机资源指标

- `node_cpu_seconds_total`: CPU时间统计，按模式分组
- `node_memory_MemTotal_bytes`: 总内存字节数
- `node_memory_MemAvailable_bytes`: 可用内存字节数
- `node_filesystem_size_bytes`: 文件系统总大小，按挂载点分组
- `node_filesystem_free_bytes`: 文件系统可用大小，按挂载点分组
- `node_network_receive_bytes_total`: 网络接收字节总数，按设备分组
- `node_network_transmit_bytes_total`: 网络发送字节总数，按设备分组
- `node_load1`: 1分钟负载平均值
- `node_load5`: 5分钟负载平均值
- `node_load15`: 15分钟负载平均值

## 自定义监控

### 添加新的监控指标

1. 在需要监控的服务中注入 `MetricService`
2. 使用 Prometheus 的 Counter、Gauge、Histogram 等指标类型
3. 在业务代码中记录指标数据

### 自定义仪表盘

1. 在 Grafana 界面中创建新仪表盘
2. 使用 PromQL 查询语言构建图表
3. 保存仪表盘到 `grafana/provisioning/dashboards/` 目录

## 最佳实践

1. **设置合理的采集间隔**: 根据指标的重要性和变化频率调整
2. **使用标签进行分类**: 便于多维度分析指标
3. **设置告警规则**: 当指标超过阈值时发送告警
4. **定期清理历史数据**: 避免存储过大
5. **优化查询性能**: 复杂查询使用预计算或缓存

## 注意事项

1. 确保应用配置中的 `PREFIX` 与 Prometheus 配置中的 `metrics_path` 一致
2. 首次启动需要等待所有服务就绪
3. 如果修改了配置文件，需要重启相应的服务
4. 生产环境中建议使用持久化存储保存监控数据
5. 定期备份监控配置和数据

## 常见问题

### 1. Grafana 无法连接到 Prometheus

- 检查网络连接：`docker-compose logs grafana`
- 确认 Prometheus 地址：`http://prometheus:9090`
- 检查 Prometheus 状态：`http://localhost:9090/targets`

### 2. 应用指标无法采集

- 检查应用是否正常运行：`docker-compose logs app`
- 确认指标路径：`http://localhost:9000/api/metrics`
- 检查 Prometheus 配置中的 `metrics_path` 和 `targets`

### 3. 仪表盘显示无数据

- 检查时间范围是否正确
- 确认 PromQL 查询是否有效
- 检查数据源配置是否正确

## 扩展功能

### 1. 添加 Redis Exporter

```yaml
# docker-compose.yml
redis_exporter:
  image: oliver006/redis_exporter:latest
  container_name: algorithm-platform-redis-exporter
  ports:
    - "9121:9121"
  depends_on:
    - redis
  environment:
    - REDIS_ADDR=redis://redis:6379
  networks:
    - algorithm-platform-network
```

### 2. 添加 MySQL Exporter

```yaml
# docker-compose.yml
mysql_exporter:
  image: prom/mysqld-exporter:latest
  container_name: algorithm-platform-mysql-exporter
  ports:
    - "9104:9104"
  depends_on:
    - mysql
  environment:
    - DATA_SOURCE_NAME=root:chance..@(mysql:3306)/algorithm_platform
  networks:
    - algorithm-platform-network
```

### 3. 添加 Node Exporter

```yaml
# docker-compose.yml
node_exporter:
  image: prom/node-exporter:latest
  container_name: algorithm-platform-node-exporter
  ports:
    - "9100:9100"
  networks:
    - algorithm-platform-network
```

添加这些组件后，需要在 `prometheus.yml` 中相应地配置监控目标。

## 参考文档

- [Prometheus 官方文档](https://prometheus.io/docs/introduction/overview/)
- [Grafana 官方文档](https://grafana.com/docs/)
- [Prometheus Node Exporter](https://github.com/prometheus/node_exporter)
- [Prometheus MySQL Exporter](https://github.com/prometheus/mysqld_exporter)
- [Prometheus Redis Exporter](https://github.com/oliver006/redis_exporter)
