-- 产品 BOM 管理 - 数据库初始化脚本
-- Created: 2026-06-21
-- 适配 MySQL 5.7+/8.0 语法规范

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

INSERT IGNORE INTO `sp_materile` (`id`, `materiel`, `materiel_desc`, `mat_type`, `unit`, `is_deleted`, `create_time`)
VALUES
('mat-prod-001', 'PROD-001', '台式电脑主机', '产品', '台', 0, NOW()),
('mat-part-001', 'PART-001', 'CPU i7-13700K', '零件', '个', 0, NOW()),
('mat-part-002', 'PART-002', 'DDR5 32GB 内存', '零件', '条', 0, NOW()),
('mat-part-003', 'PART-003', 'SSD 1TB NVMe', '零件', '个', 0, NOW()),
('mat-part-004', 'PART-004', '主板 Z790', '零件', '个', 0, NOW()),
('mat-part-005', 'PART-005', 'CPU散热器', '零件', '个', 0, NOW()),
('mat-part-006', 'PART-006', '机箱外壳 ATX', '零件', '个', 0, NOW()),
('mat-part-007', 'PART-007', '电源 750W 金牌', '零件', '个', 0, NOW()),
('mat-part-008', 'PART-008', '散热风扇 120mm', '零件', '个', 0, NOW());

INSERT IGNORE INTO `sp_product_bom` (`id`, `product_material_id`, `product_material_code`, `product_material_name`, `version`, `validity`, `remark`, `create_time`)
VALUES
('bom-root-001', 'mat-prod-001', 'PROD-001', '台式电脑主机', 1, '有效', '台式电脑主机产品BOM，首批量产版本', NOW());

INSERT IGNORE INTO `sp_product_bom_node` (`id`, `bom_id`, `parent_id`, `node_type`, `node_code`, `node_name`, `quantity`, `level`, `sort`, `create_time`)
VALUES
('bom-sub-001', 'bom-root-001', '0', '产品', 'PROD-001', '台式电脑主机', 1, 0, 1, NOW()),
('bom-comp-001', 'bom-root-001', 'bom-sub-001', '零部件', 'PART-001', '台式电脑半成品', 1, 1, 1, NOW()),
('bom-comp-002', 'bom-root-001', 'bom-comp-001', '零部件', 'PART-002', '主板单元', 1, 2, 1, NOW()),
('bom-comp-003', 'bom-root-001', 'bom-comp-001', '零部件', 'PART-003', '机箱单元', 1, 2, 2, NOW()),
('bom-item-001', 'bom-root-001', 'bom-comp-002', '物料', 'PART-001', 'CPU i7-13700K', 1, 3, 1, NOW()),
('bom-item-002', 'bom-root-001', 'bom-comp-002', '物料', 'PART-002', 'DDR5 32GB 内存', 2, 3, 2, NOW()),
('bom-item-003', 'bom-root-001', 'bom-comp-002', '物料', 'PART-003', 'SSD 1TB NVMe', 1, 3, 3, NOW()),
('bom-item-004', 'bom-root-001', 'bom-comp-002', '物料', 'PART-004', '主板 Z790', 1, 3, 4, NOW()),
('bom-item-005', 'bom-root-001', 'bom-comp-002', '物料', 'PART-005', 'CPU散热器', 1, 3, 5, NOW()),
('bom-item-006', 'bom-root-001', 'bom-comp-003', '物料', 'PART-006', '机箱外壳 ATX', 1, 3, 1, NOW()),
('bom-item-007', 'bom-root-001', 'bom-comp-003', '物料', 'PART-007', '电源 750W 金牌', 1, 3, 2, NOW()),
('bom-item-008', 'bom-root-001', 'bom-comp-003', '物料', 'PART-008', '散热风扇 120mm', 3, 3, 3, NOW());

INSERT IGNORE INTO `sys_menu` (`id`, `title`, `name`, `parent_id`, `type`, `permission`, `icon`, `sort`, `create_time`)
VALUES ('112', '产品BOM管理', '/technology/product-bom', '5', '1', 'product-bom:list', 'fa fa-cubes', 8, NOW());

INSERT IGNORE INTO `sys_menu` (`id`, `title`, `name`, `parent_id`, `type`, `permission`, `sort`, `create_time`)
VALUES
('1121', '新增BOM', '', '112', '2', 'product-bom:add', 1, NOW()),
('1122', '编辑BOM', '', '112', '2', 'product-bom:edit', 2, NOW()),
('1123', '删除BOM', '', '112', '2', 'product-bom:delete', 3, NOW()),
('1124', '锁定BOM', '', '112', '2', 'product-bom:lock', 4, NOW());