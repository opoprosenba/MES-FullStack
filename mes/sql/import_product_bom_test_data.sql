-- =====================================================
-- 产品工艺查询页面 - 测试数据导入脚本
-- 基于实际数据库表结构生成
-- =====================================================

-- 1. 插入产品BOM主数据
INSERT INTO sp_product_bom (id, product_material_id, product_material_code, product_material_name, version, remark, validity, is_locked, is_deleted, create_time) 
VALUES 
(1, '1', 'PROD-001', '台式电脑主机', 1, '主机标准BOM V1', '有效', 0, 0, NOW())
ON DUPLICATE KEY UPDATE product_material_name = VALUES(product_material_name);

-- 2. 插入BOM树形分层节点数据
INSERT INTO sp_product_bom_node (id, bom_id, parent_id, node_type, node_code, node_name, process_id, quantity, level, sort, is_deleted, create_time) 
VALUES 
(1, 1, 0, '产品', 'PROD-001', '台式电脑主机', NULL, 1, 0, 1, 0, NOW()),
(2, 1, 1, '零部件', 'PART-001', '电脑半成品', 3, 1, 1, 1, 0, NOW()),
(3, 1, 1, '零部件', 'PART-002', '主板单元', 1, 1, 1, 2, 0, NOW()),
(4, 1, 1, '零部件', 'PART-003', '机箱单元', 2, 1, 1, 3, 0, NOW()),
(5, 1, 2, '物料', 'MAT-001', '主板', NULL, 1, 2, 1, 0, NOW()),
(6, 1, 2, '物料', 'MAT-002', 'CPU', NULL, 1, 2, 2, 0, NOW()),
(7, 1, 2, '物料', 'MAT-003', '内存条', NULL, 2, 2, 3, 0, NOW()),
(8, 1, 3, '物料', 'MAT-004', '机箱', NULL, 1, 2, 1, 0, NOW()),
(9, 1, 3, '物料', 'MAT-005', '电源', NULL, 1, 2, 2, 0, NOW())
ON DUPLICATE KEY UPDATE node_name = VALUES(node_name);

-- 3. 插入工序数据
INSERT INTO sp_process (id, process_code, process_name, work_unit_id, work_unit_name, work_hour, manufacture_cycle, is_generate_plan, remark, status, is_deleted, create_time) 
VALUES 
(1, 'GX000001', '主板组装工序', '1', '电脑组装单元', 1, 2, '是', '主板装配标准工序', '正常', 0, NOW()),
(2, 'GX000002', '机箱装配工序', '1', '电脑组装单元', 1, 2, '是', '机箱组装标准工序', '正常', 0, NOW()),
(3, 'GX000003', '整机总装工序', '1', '电脑组装单元', 1, 2, '是', '成品整机装配', '正常', 0, NOW())
ON DUPLICATE KEY UPDATE process_name = VALUES(process_name);

-- 4. 插入工序完整详情（右侧标签页展示内容）
INSERT INTO sp_process_detail (process_id, process_content, process_requirement, attention, equipment, tech_document, material_list, is_locked, is_deleted, create_time) 
VALUES 
(1, 
'1.放置主板至工装台；2.CPU平稳安装；3.内存条垂直卡紧；4.检查无松动', 
'CPU针脚不得磕碰，内存条卡扣完全锁紧，目视无歪斜', 
'全程佩戴防静电手环，禁止触碰元器件金手指，轻拿轻放', 
'防静电手环、十字螺丝刀、导热硅脂', 
'《主板组装SOP-V1.0》', 
'主板×1、CPU×1、内存条×2、导热硅脂', 
1, 0, NOW()),
(2, 
'1.固定机箱电源；2.安装前置排线；3.固定主板铜柱；4.内部线材整理', 
'电源螺丝全部紧固，排线正负极不反插，铜柱匹配主板孔位', 
'机箱边缘锋利防止划伤，线材分类捆扎避免遮挡散热风扇', 
'十字螺丝刀、尼龙扎带、防静电手环', 
'《机箱装配工艺指导书》', 
'机箱×1、电源×1、固定螺丝套件', 
1, 0, NOW()),
(3, 
'1.将主板组件装入机箱；2.连接供电线；3.安装硬盘；4.盖盖板通电自检', 
'所有供电接口插紧，硬盘固定无晃动，开机自检无报错方可流入下工序', 
'通电前检查内部无金属杂物，故障机单独放置标记', 
'螺丝刀、万用表、扎带', 
'《整机总装作业规范V1》', 
'主板组件1套、SATA硬盘1块、数据线', 
1, 0, NOW())
ON DUPLICATE KEY UPDATE process_content = VALUES(process_content);

-- 5. 验证数据插入结果
SELECT '产品BOM主表数据:' AS info;
SELECT id, product_material_code, product_material_name, version, validity FROM sp_product_bom WHERE is_deleted = 0;

SELECT 'BOM节点数量:' AS info;
SELECT COUNT(*) FROM sp_product_bom_node WHERE is_deleted = 0;

SELECT '工序表数据:' AS info;
SELECT id, process_code, process_name, work_unit_name, work_hour, status FROM sp_process WHERE is_deleted = 0;

SELECT '工序详情数量:' AS info;
SELECT COUNT(*) FROM sp_process_detail WHERE is_deleted = 0;
