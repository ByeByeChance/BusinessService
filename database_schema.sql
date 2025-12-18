-- 算法平台数据库表结构
-- 生成时间: 2025-12-10

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建算法表
DROP TABLE IF EXISTS `algorithm`;
CREATE TABLE `algorithm` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `name` varchar(100) NOT NULL COMMENT '算法名称',
  `version` varchar(50) DEFAULT NULL COMMENT '算法版本',
  `resourceId` varchar(36) NOT NULL COMMENT '资源ID (UUID)',
  `description` varchar(500) DEFAULT NULL COMMENT '算法描述',
  `userId` varchar(36) NOT NULL COMMENT '用户ID (UUID)',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算法表';

-- 创建样本分组表
DROP TABLE IF EXISTS `sampleGroup`;
CREATE TABLE `sampleGroup` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `name` varchar(255) NOT NULL COMMENT '数据集名称',
  `tag` enum('debug_training','debug_evaluation','training','evaluation') NOT NULL COMMENT '数据集标签',
  `sample_count` int(11) DEFAULT 0 COMMENT '样本数量',
  `description` text DEFAULT NULL COMMENT '描述',
  `path` varchar(500) NOT NULL COMMENT '路径',
  `user_id` varchar(36) NOT NULL COMMENT '用户ID (UUID)',
  `resource_id` varchar(255) NOT NULL COMMENT '资源ID',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='样本分组表';

-- 创建样本表
DROP TABLE IF EXISTS `sample`;
CREATE TABLE `sample` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `name` varchar(255) NOT NULL COMMENT '样本名称',
  `path` varchar(500) NOT NULL COMMENT '文件路径',
  `size` bigint(20) NOT NULL COMMENT '文件大小（字节）',
  `description` text DEFAULT NULL COMMENT '描述',
  `groupId` varchar(36) DEFAULT NULL COMMENT '所属数据集ID (UUID)',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='样本表';

-- 创建菜单表
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `parentId` varchar(36) NOT NULL COMMENT '父级id (UUID)',
  `path` varchar(255) NOT NULL COMMENT '菜单路径',
  `name` varchar(255) NOT NULL COMMENT '菜单name',
  `component` varchar(255) DEFAULT NULL COMMENT '组件路径',
  `redirect` varchar(255) NOT NULL COMMENT '重定向菜单路径',
  `icon` varchar(255) NOT NULL COMMENT '菜单图标',
  `title` varchar(255) NOT NULL COMMENT '菜单名称',
  `isLink` varchar(255) NOT NULL COMMENT '是否外链',
  `isHide` int(11) NOT NULL COMMENT '是否隐藏',
  `isFull` int(11) NOT NULL COMMENT '是否全屏',
  `isAffix` int(11) NOT NULL COMMENT '是否在标签栏固定',
  `isKeepAlive` int(11) NOT NULL COMMENT '是否缓存页面',
  `sort` int(11) NOT NULL COMMENT '排序',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

-- 创建访问令牌表
DROP TABLE IF EXISTS `accessToken`;
CREATE TABLE `accessToken` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `userId` varchar(36) NOT NULL COMMENT '用户id (UUID)',
  `token` varchar(255) NOT NULL COMMENT '登陆token',
  `refreshToken` varchar(255) NOT NULL COMMENT '刷新token',
  `expirationTime` datetime NOT NULL COMMENT '过期时间',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访问令牌表';

-- 创建角色表
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `description` varchar(100) DEFAULT NULL COMMENT '角色描述',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '状态(0:禁用,1:启用)',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 创建用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(36) NOT NULL COMMENT '主键id (UUID)',
  `username` varchar(50) DEFAULT NULL COMMENT '账号',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `status` int(11) NOT NULL COMMENT '账号状态',
  `roleId` varchar(36) NOT NULL COMMENT '角色类型 (UUID)',
  `salt` varchar(100) DEFAULT NULL COMMENT '密码盐',
  `lastLoginDate` datetime DEFAULT NULL COMMENT '最后登录时间',
  `createdTime` datetime DEFAULT NULL COMMENT '创建时间',
  `updatedTime` datetime NOT NULL COMMENT '更新时间',
  `deletedTime` datetime NOT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建角色-菜单关联表
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu` (
  `role_id` varchar(36) NOT NULL COMMENT '角色ID (UUID)',
  `menu_id` varchar(36) NOT NULL COMMENT '菜单ID (UUID)',
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `FK_role_menu_role` (`role_id`),
  KEY `FK_role_menu_menu` (`menu_id`),
  CONSTRAINT `FK_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  CONSTRAINT `FK_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-菜单关联表';

SET FOREIGN_KEY_CHECKS = 1;

-- 插入默认角色
INSERT INTO `role` (`id`, `name`, `description`, `status`, `sort`, `createdTime`, `updatedTime`, `deletedTime`)
VALUES (UUID(), 'admin', '系统管理员', 1, 1, NOW(), NOW(), NOW());

-- 插入默认管理员账号
INSERT INTO `user` (`id`, `username`, `password`, `email`, `status`, `roleId`, `salt`, `createdTime`, `updatedTime`, `deletedTime`)
SELECT UUID(), 'admin', 'e10adc3949ba59abbe56e057f20f883e', 'admin@example.com', 1, id, 'salt123', NOW(), NOW(), NOW()
FROM `role` WHERE `name` = 'admin';

-- 创建触发器为新插入的记录自动生成UUID
-- 创建训练记录表
drop table if exists `trainingRecord`;
create table `trainingRecord` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `name` varchar(255) not null comment '任务名称',
  `status` int not null comment '任务状态 (0: 待训练, 1: 训练中, 2: 已完成, 3: 已取消, 4: 训练失败)',
  `sampleGroupIds` varchar(255) not null comment '样本组ID集合',
  `sampleGroupNames` varchar(255) not null comment '样本组名称集合 (sampleGroup-1, sampleGroup-2, ...)',
  `debugRecordId` varchar(36) not null comment '训练调试记录ID (UUID)',
  `imageId` varchar(36) not null comment '训练镜像ID (UUID)',
  `imageName` varchar(36) not null comment '训练镜像名称',
  `algorithmId` varchar(36) not null comment '训练算法ID (UUID)',
  `algorithmName` varchar(255) not null comment '训练算法名称',
  `description` text null comment '任务描述',
  `resultMessage` text null comment '任务结果消息',
  `startTime` int null comment '开始时间',
  `endTime` int null comment '结束时间',
  `duration` int null comment '持续时间 (秒)',
  `metrics` text null comment '指标数据',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间',
  primary key (`id`)
) engine=InnoDB default charset=utf8mb4 comment='训练记录表';

-- 创建调试记录表
drop table if exists `debugRecord`;
create table `debugRecord` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `name` varchar(255) not null comment '任务名称',
  `type` varchar(255) not null comment '任务类型',
  `status` int not null comment '状态 (0: 待开始, 1: 进行中, 2: 已完成, 3: 失败)',
  `imageId` varchar(36) not null comment '评测镜像ID (UUID)',
  `imageName` varchar(36) not null comment '评测镜像名称',
  `sampleGroupIds` varchar(36) not null comment '所属样本组ID集合 (UUID)(sampleGroup-1, sampleGroup-2, ...)',
  `sampleGroupNames` varchar(255) not null comment '所属样本组名称集合 (sampleGroup-1, sampleGroup-2, ...)',
  `modelId` varchar(36) null comment '模型ID',
  `modelName` varchar(36) null comment '模型名称',
  `algorithmId` varchar(36) not null comment '评测算法ID (UUID)',
  `algorithmName` varchar(255) not null comment '评测算法名称',
  `description` text null comment '描述',
  `resultMessage` text null comment '结果消息',
  `userId` varchar(36) not null comment '用户ID',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间',
  primary key (`id`)
) engine=InnoDB default charset=utf8mb4 comment='调试记录表';

-- 创建评测记录表
drop table if exists `evalRecord`;
create table `evalRecord` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `name` varchar(255) not null comment '任务名称',
  `status` int not null comment '状态 (0: 待评测, 1: 评测中, 2: 已完成, 3: 已取消, 4: 评测失败)',
  `score` float null comment '评分',
  `sampleGroupIds` varchar(36) not null comment '所属样本组ID集合 (UUID)(sampleGroup-1, sampleGroup-2, ...)',
  `sampleGroupNames` varchar(255) not null comment '所属样本组名称集合 (sampleGroup-1, sampleGroup-2, ...)',
  `debugRecordId` varchar(36) not null comment '评测调试记录ID (UUID)',
  `imageId` varchar(36) not null comment '评测镜像ID (UUID)',
  `imageName` varchar(36) not null comment '评测镜像名称',
  `algorithmId` varchar(36) not null comment '评测算法ID (UUID)',
  `algorithmName` varchar(255) not null comment '评测算法名称',
  `modelId` varchar(36) not null comment '评测模型ID',
  `modelName` varchar(255) not null comment '评测模型名称',
  `description` text null comment '描述',
  `resultMessage` text null comment '结果消息',
  `startTime` int null comment '开始时间',
  `endTime` int null comment '结束时间',
  `duration` int null comment '持续时间 (秒)',
  `metrics` text null comment '指标数据',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间',
  primary key (`id`)
) engine=InnoDB default charset=utf8mb4 comment='评测记录表';

-- 创建资源表
drop table if exists `resource`;
create table `resource` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `filename` varchar(255) not null comment '文件名',
  `originalFilename` varchar(255) not null comment '原始文件名',
  `mimeType` varchar(255) null comment '文件MIME类型',
  `size` bigint not null comment '文件大小（字节）',
  `path` varchar(255) null comment '存储路径',
  `filePath` varchar(255) null comment '上传文件的源地址',
  `status` varchar(255) not null comment '资源状态',
  `type` varchar(255) not null comment '资源类型',
  `etag` varchar(255) null comment '文件校验值（MD5/SHA1等）',
  `chunkSize` int null comment '分片大小（字节）',
  `chunkTotal` int null comment '分片总数',
  `chunkUploaded` json null comment '已上传分片索引列表',
  `storageUrl` varchar(255) null comment '存储地址',
  `storageBucket` varchar(255) null comment '存储桶',
  `storageKey` varchar(255) null comment '存储键',
  `failedReason` varchar(255) null comment '失败原因',
  `userId` varchar(36) not null comment '上传用户ID',
  `metadata` json null comment '附加元数据',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间',
  primary key (`id`),
  index idx_filename_deletedTime (`filename`, `deletedTime`),
  index idx_type_deletedTime (`type`, `deletedTime`),
  index idx_status_deletedTime (`status`, `deletedTime`)
) engine=InnoDB default charset=utf8mb4 comment='资源表';

-- 创建镜像表
drop table if exists `image`;
create table `image` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `name` varchar(255) not null comment '镜像名称',
  `size` bigint not null comment '文件大小（字节）',
  `resourceId` varchar(36) not null comment '资源ID (UUID)',
  `description` text null comment '描述',
  `userId` varchar(36) not null comment '用户ID',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间'
) engine=InnoDB default charset=utf8mb4 comment='镜像表';

-- 创建模型表
drop table if exists `model`;
create table `model` (
  `id` varchar(36) not null comment '主键id (UUID)',
  `name` varchar(255) not null comment '模型名称',
  `size` bigint not null comment '文件大小（字节）',
  `status` int null comment '模型状态',
  `score` float null comment '最新模型评分',
  `minScore` float null comment '最低模型评分',
  `maxScore` float null comment '最高模型评分',
  `path` varchar(500) not null comment '文件路径',
  `description` text null comment '模型描述',
  `debugRecordId` varchar(36) null comment '调试记录ID',
  `createdTime` datetime null comment '创建时间',
  `updatedTime` datetime null comment '更新时间',
  `deletedTime` datetime null comment '软删除时间',
  primary key (`id`)
) engine=InnoDB default charset=utf8mb4 comment='模型表';

-- 创建触发器为新插入的记录自动生成UUID
DELIMITER //
CREATE TRIGGER before_algorithm_insert BEFORE INSERT ON algorithm
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_sampleGroup_insert BEFORE INSERT ON sampleGroup
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_sample_insert BEFORE INSERT ON sample
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_menu_insert BEFORE INSERT ON menu
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_accessToken_insert BEFORE INSERT ON accessToken
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_user_insert BEFORE INSERT ON user
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_role_insert BEFORE INSERT ON role
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_trainingRecord_insert BEFORE INSERT ON trainingRecord
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_debugRecord_insert BEFORE INSERT ON debugRecord
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_evalRecord_insert BEFORE INSERT ON evalRecord
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_resource_insert BEFORE INSERT ON resource
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_image_insert BEFORE INSERT ON image
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//

CREATE TRIGGER before_model_insert BEFORE INSERT ON model
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL THEN
    SET NEW.id = UUID();
  END IF;
END;//
DELIMITER ;
