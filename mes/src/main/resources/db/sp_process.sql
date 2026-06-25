CREATE TABLE IF NOT EXISTS sp_process (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '工序主键ID',
  process_code VARCHAR(32) NOT NULL COMMENT '工序编号 GX+6位流水',
  process_name VARCHAR(64) NOT NULL COMMENT '工序名称',
  work_unit_id BIGINT NOT NULL COMMENT '关联加工单元ID',
  work_unit_name VARCHAR(64) NOT NULL COMMENT '加工单元名称（冗余）',
  work_hour INT NOT NULL DEFAULT 0 COMMENT '工序工时 单位：小时 整数',
  manufacture_cycle INT NOT NULL DEFAULT 0 COMMENT '制造周期 单位：小时 整数',
  is_generate_plan VARCHAR(8) NOT NULL DEFAULT '是' COMMENT '是否生成生产计划：是/否',
  remark VARCHAR(500) DEFAULT NULL COMMENT '备注信息',
  status VARCHAR(16) NOT NULL DEFAULT '正常' COMMENT '状态：正常/禁用',
  is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除 0未删 1已删',
  create_time DATETIME DEFAULT NULL COMMENT '创建时间',
  update_time DATETIME DEFAULT NULL COMMENT '更新时间',
  create_username VARCHAR(32) DEFAULT NULL COMMENT '创建人',
  update_username VARCHAR(32) DEFAULT NULL COMMENT '更新人',
  UNIQUE KEY uk_process_code (process_code) COMMENT '工序编号唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工序信息定义表';
