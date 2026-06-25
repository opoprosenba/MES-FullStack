-- ============================================
-- 工序信息定义模块菜单和权限初始化脚本（完整版）
-- ============================================

-- 设置会话变量存储父菜单ID
SET @parent_id = (SELECT id FROM sp_sys_menu WHERE name = '产品数据中心' AND is_deleted = '0' LIMIT 1);

-- 工序信息定义主菜单
INSERT INTO sp_sys_menu (
    id,
    code,
    name,
    url,
    parent_id,
    grade,
    sort_num,
    type,
    permission,
    icon,
    descr,
    is_deleted,
    create_time
) VALUES (
    'menu_process_001',
    'basedata:process',
    '工序信息定义',
    '/basedata/process',
    @parent_id,
    '2',
    15,
    '1',
    NULL,
    'setting',
    '工序信息定义菜单',
    '0',
    NOW()
) ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 新增按钮权限
INSERT INTO sp_sys_menu (id, code, name, url, parent_id, grade, sort_num, type, permission, icon, descr, is_deleted, create_time)
VALUES (
    'menu_process_002',
    'basedata:process:add',
    '新增',
    NULL,
    'menu_process_001',
    '3',
    1,
    '2',
    'basedata:process:add',
    NULL,
    '工序新增权限',
    '0',
    NOW()
) ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 编辑按钮权限
INSERT INTO sp_sys_menu (id, code, name, url, parent_id, grade, sort_num, type, permission, icon, descr, is_deleted, create_time)
VALUES (
    'menu_process_003',
    'basedata:process:edit',
    '编辑',
    NULL,
    'menu_process_001',
    '3',
    2,
    '2',
    'basedata:process:edit',
    NULL,
    '工序编辑权限',
    '0',
    NOW()
) ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 删除按钮权限
INSERT INTO sp_sys_menu (id, code, name, url, parent_id, grade, sort_num, type, permission, icon, descr, is_deleted, create_time)
VALUES (
    'menu_process_004',
    'basedata:process:delete',
    '删除',
    NULL,
    'menu_process_001',
    '3',
    3,
    '2',
    'basedata:process:delete',
    NULL,
    '工序删除权限',
    '0',
    NOW()
) ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 为超级管理员角色分配工序相关权限
-- ============================================

INSERT INTO sp_sys_role_menu (
    id,
    role_id,
    menu_id,
    is_deleted,
    create_time
)
SELECT
    REPLACE(UUID(), '-', ''),
    r.id,
    m.id,
    '0',
    NOW()
FROM sp_sys_role r
CROSS JOIN sp_sys_menu m
WHERE r.name = '超级管理员'
    AND r.is_deleted = '0'
    AND m.code IN ('basedata:process', 'basedata:process:add', 'basedata:process:edit', 'basedata:process:delete')
    AND m.is_deleted = '0'
    AND NOT EXISTS (
        SELECT 1 FROM sp_sys_role_menu rm
        WHERE rm.role_id = r.id AND rm.menu_id = m.id AND rm.is_deleted = '0'
    );

-- ============================================
-- 验证查询
-- ============================================

SELECT '=== 工序菜单 ===' AS info;
SELECT id, code, name, parent_id, type FROM sp_sys_menu WHERE code LIKE 'basedata:process%';

SELECT '=== 超级管理员权限 ===' AS info;
SELECT r.name AS role_name, m.name AS menu_name, m.code AS permission
FROM sp_sys_role r
JOIN sp_sys_role_menu rm ON r.id = rm.role_id AND rm.is_deleted = '0'
JOIN sp_sys_menu m ON rm.menu_id = m.id AND m.is_deleted = '0'
WHERE r.name = '超级管理员' AND m.code LIKE 'basedata:process%';
