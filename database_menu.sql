-- 算法平台服务菜单数据SQL脚本
-- 生成时间：2024-05-18

-- 清空现有菜单数据（如需保留可注释此行）
-- TRUNCATE TABLE menu;

-- 插入主菜单数据

-- 首页菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-home-001',
     '',
     '/home/index',
     'home',
     '/home/index',
     '',
     'HomeOutlined',
     '首页',
     '',
     0,
     0,
     1,
     0,
     1,
     NOW(),
     NOW()
 );

-- 样本管理主菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-sample-001',
     '',
     'sampleManage',
     'sampleManage',
     '',
     '/sampleManage/sampleGroup/index',
     'PictureOutlined',
     '样本管理',
     '',
     0,
     0,
     0,
     0,
     2,
     NOW(),
     NOW()
 );

-- 算法管理菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-algorithm-001',
     '',
     '/algorithmManage',
     'algorithmManage',
     '/algorithmManage/index',
     '',
     'CodeSandboxOutlined',
     '算法管理',
     '',
     0,
     0,
     0,
     0,
     3,
     NOW(),
     NOW()
 );

-- 镜像管理主菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-image-001',
     '',
     '/imageManage',
     'imageManage',
     '',
     '/imageManage/imageLibrary',
     'DockerOutlined',
     '镜像管理',
     '',
     0,
     0,
     0,
     0,
     4,
     NOW(),
     NOW()
 );

-- 模型管理主菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-model-001',
     '',
     '/modelManage',
     'modelManage',
     '',
     '/modelManage/modelLibrary',
     'CodeSandboxOutlined',
     '模型管理',
     '',
     0,
     0,
     0,
     0,
     5,
     NOW(),
     NOW()
 );

-- 智能助手菜单
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-assistant-001',
     '',
     '/smartAssistantManage',
     'smartAssistantManage',
     '/smartAssistantManage/index',
     '',
     'OpenAIFilled',
     '智能助手',
     '',
     0,
     0,
     0,
     0,
     6,
     NOW(),
     NOW()
 );

-- 插入子菜单数据

-- 样本管理子菜单 - 样本组管理
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-sample-002',
     'menu-sample-001',
     '/sampleManage/sampleGroup/index',
     'sampleGroup',
     '/sampleManage/index',
     '',
     'GroupOutlined',
     '样本组管理',
     '',
     0,
     0,
     0,
     0,
     1,
     NOW(),
     NOW()
 );

-- 镜像管理子菜单 - 镜像库管理
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-image-002',
     'menu-image-001',
     '/imageManage/imageLibrary/index',
     'imageLibrary',
     '/imageManage/imageLibrary/index',
     '',
     'CodepenOutlined',
     '镜像库管理',
     '',
     0,
     0,
     0,
     0,
     1,
     NOW(),
     NOW()
 );

-- 镜像管理子菜单 - 镜像调试记录
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-image-003',
     'menu-image-001',
     '/imageManage/imageDebugRecord/index',
     'imageDebugRecord',
     '/imageManage/imageDebugRecord/index',
     '',
     'CodepenOutlined',
     '镜像调试记录',
     '',
     0,
     0,
     0,
     0,
     2,
     NOW(),
     NOW()
 );

-- 模型管理子菜单 - 模型库管理
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-model-002',
     'menu-model-001',
     '/modelManage/modelLibrary/index',
     'modelLibrary',
     '/modelManage/modelLibrary/index',
     '',
     'CodepenOutlined',
     '模型库管理',
     '',
     0,
     0,
     0,
     0,
     1,
     NOW(),
     NOW()
 );

-- 模型管理子菜单 - 模型训练
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-model-003',
     'menu-model-001',
     '/modelManage/modelTraining/index',
     'modelTraining',
     '/modelManage/modelTraining/index',
     '',
     'FileSyncOutlined',
     '模型训练',
     '',
     0,
     0,
     0,
     0,
     2,
     NOW(),
     NOW()
 );

-- 模型管理子菜单 - 模型评测
INSERT INTO menu (id, parentId, path, name, component, redirect, icon, title, isLink, isHide, isFull, isAffix, isKeepAlive, sort, createdTime, updatedTime)
 VALUES (
     'menu-model-004',
     'menu-model-001',
     '/modelManage/modelEvaluation/index',
     'modelEvaluation',
     '/modelManage/modelEvaluation/index',
     '',
     'FileSyncOutlined',
     '模型评测',
     '',
     0,
     0,
     0,
     0,
     3,
     NOW(),
     NOW()
 );

-- 插入完成提示
SELECT '菜单数据插入完成' AS result;
