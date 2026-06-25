-- 零部件主表
CREATE TABLE IF NOT EXISTS `sp_parts` (
  `id` varchar(64) NOT NULL COMMENT '主键ID',
  `part_code` varchar(32) NOT NULL COMMENT '零部件编号',
  `part_name` varchar(64) NOT NULL COMMENT '零部件名称',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注信息',
  `status` varchar(16) NOT NULL DEFAULT '正常' COMMENT '状态：正常/禁用',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除：0=未删除，1=已删除',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_username` varchar(64) DEFAULT NULL COMMENT '创建人',
  `update_username` varchar(64) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_part_code` (`part_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='零部件定义表';

-- 插入测试数据
INSERT INTO `sp_parts` (`id`, `part_code`, `part_name`, `remark`, `status`, `is_deleted`) VALUES
('1', 'BOM000001', '主板单元', '台式电脑核心控制组件，Z790芯片组', '正常', 0),
('2', 'BOM000002', '机箱单元', 'ATX标准台式机箱，容纳所有硬件', '正常', 0),
('3', 'BOM000003', '台式电脑半成品', '组装完成未包装整机半成品', '正常', 0);
