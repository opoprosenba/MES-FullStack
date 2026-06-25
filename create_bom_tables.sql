-- 产品 BOM 管理 - 数据库初始化脚本
-- Created: 2026-06-21
-- 适配 MySQL 5.7+/8.0 语法规范
-- 注意：此文件与后端实体类 SpProductBom.java 保持一致

CREATE TABLE IF NOT EXISTS `sp_product_bom` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '主键ID',
  `product_material_id` VARCHAR(64) NOT NULL COMMENT '关联产品物料ID',
  `product_material_code` VARCHAR(64) NOT NULL COMMENT '产品物料编码',
  `product_material_name` VARCHAR(128) NOT NULL COMMENT '产品物料名称',
  `version` INT NOT NULL DEFAULT 1 COMMENT '版本号',
  `validity` VARCHAR(16) DEFAULT '有效' COMMENT '有效性：有效/无效',
  `is_locked` TINYINT NOT NULL DEFAULT 0 COMMENT '是否锁定定版 0否 1是',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注信息',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0未删 1已删',
  `create_username` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_username` VARCHAR(64) DEFAULT NULL COMMENT '更新人',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  KEY `idx_material_id` (`product_material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品BOM主表';

CREATE TABLE IF NOT EXISTS `sp_product_bom_node` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '主键ID',
  `bom_id` VARCHAR(64) NOT NULL COMMENT '关联BOM主表ID',
  `parent_id` VARCHAR(64) NOT NULL DEFAULT '0' COMMENT '父节点ID 0为根节点',
  `node_type` VARCHAR(32) NOT NULL COMMENT '节点类型：产品/零部件/物料',
  `node_code` VARCHAR(64) NOT NULL COMMENT '节点编码',
  `node_name` VARCHAR(128) NOT NULL COMMENT '节点名称',
  `process_id` VARCHAR(64) DEFAULT NULL COMMENT '关联工序ID',
  `quantity` DECIMAL(10,2) NOT NULL DEFAULT 1 COMMENT '数量',
  `level` INT NOT NULL DEFAULT 0 COMMENT '层级',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0未删 1已删',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  KEY `idx_bom_id` (`bom_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品BOM节点表';

CREATE TABLE IF NOT EXISTS `sp_process_detail` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '主键ID',
  `process_id` VARCHAR(64) NOT NULL COMMENT '关联工序ID',
  `process_content` TEXT COMMENT '工序内容',
  `process_requirement` TEXT COMMENT '工序要求',
  `attention` TEXT COMMENT '注意事项',
  `equipment` TEXT COMMENT '工装设备',
  `tech_document` TEXT COMMENT '技术文档',
  `material_list` TEXT COMMENT '备料清单',
  `is_locked` TINYINT NOT NULL DEFAULT 0 COMMENT '是否锁定 0未锁定 1已锁定',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_process_id` (`process_id`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工序工艺详情表';