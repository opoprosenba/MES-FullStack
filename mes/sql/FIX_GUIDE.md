# 产品工艺查询页面问题修复指南

## 问题描述
产品工艺查询页面下拉框无选项、左侧工艺树显示「暂无 BOM 数据」

## 核心原因
数据库缺失产品 BOM、BOM 节点、工序、工序详情全套关联业务数据

## 修复步骤

### 第一步：导入测试数据

#### 方式1：使用 Navicat 或 MySQL Workbench
1. 连接到 MySQL 数据库 `mes_data`
2. 打开文件 `d:\guagua\MES-FullStack-main\MES-FullStack-main\mes\sql\import_product_bom_test_data.sql`
3. 执行 SQL 脚本

#### 方式2：使用命令行
```powershell
cd d:\guagua\MES-FullStack-main\MES-FullStack-main\mes\sql
mysql -uroot -prose@19345nba mes_data < import_product_bom_test_data.sql
```

### 第二步：验证数据导入

执行以下 SQL 查询，确认数据已正确导入：

```sql
-- 检查产品BOM主表
SELECT * FROM sp_product_bom WHERE is_deleted = 0;

-- 检查BOM节点数量（应该有9条）
SELECT COUNT(*) FROM sp_product_bom_node WHERE is_deleted = 0;

-- 检查工序表（应该有3条）
SELECT * FROM sp_process WHERE is_deleted = 0;

-- 检查工序详情表（应该有3条）
SELECT COUNT(*) FROM sp_process_detail WHERE is_deleted = 0;
```

### 第三步：重启后端服务

如果后端服务正在运行，需要重启以加载新数据：

```powershell
cd d:\guagua\MES-FullStack-main\MES-FullStack-main\mes
mvn spring-boot:run -DskipTests
```

### 第四步：验证页面功能

1. 打开浏览器访问产品工艺查询页面
2. 选择产品下拉框应该显示「台式电脑主机」
3. 左侧工艺树应显示完整的 BOM 结构
4. 选择节点后右侧应显示工艺详情

## 相关文件

### 后端文件
- 控制器：`mes\src\main\java\com\wangziyang\mes\technology\controller\SpProductBomController.java`
- 工序控制器：`mes\src\main\java\com\wangziyang\mes\technology\controller\SpProcessContentController.java`
- 实体类：
  - `mes\src\main\java\com\wangziyang\mes\technology\entity\SpProductBom.java`
  - `mes\src\main\java\com\wangziyang\mes\technology\entity\SpProductBomItem.java`
  - `mes\src\main\java\com\wangziyang\mes\basedata\entity\SpProcess.java`
  - `mes\src\main\java\com\wangziyang\mes\basedata\entity\SpProcessDetail.java`

### 前端文件
- 工序查询页面：`mes\frontend\apps\mes1\src\pages\technology\ProcessQueryPage.tsx`
- BOM列表页面：`mes\frontend\apps\mes1\src\pages\technology\ProductBomList.tsx`
- API定义：`mes\frontend\apps\mes1\src\api\technology\process-content.ts`

## 测试数据说明

### 产品BOM
- 产品编码：PROD-001
- 产品名称：台式电脑主机
- BOM版本：V1
- 状态：草稿（draft）

### BOM节点结构
```
台式电脑主机 (level 0)
├── 电脑半成品 (level 1) - 工序: GX000003
├── 主板单元 (level 1) - 工序: GX000001
└── 机箱单元 (level 1) - 工序: GX000002
    ├── 主板 (level 2)
    ├── CPU (level 2)
    ├── 内存条 (level 2)
    ├── 机箱 (level 2)
    └── 电源 (level 2)
```

### 工序信息
1. GX000001 - 主板组装工序
2. GX000002 - 机箱装配工序
3. GX000003 - 整机总装工序

每个工序都包含完整的详情（工序内容、要求、注意事项、设备、文档、备料清单）

## 注意事项

1. 数据库表结构必须与实体类定义匹配
2. `is_deleted` 字段必须为 0，否则数据不会显示
3. 工序 ID 需要正确关联到 BOM 节点
4. 前端 API 拦截器会自动解包 `Result` 中的 `data` 字段
