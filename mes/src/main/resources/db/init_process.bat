@echo off
chcp 65001 >nul
echo ============================================
echo 工序信息定义模块初始化脚本
echo ============================================
echo.

set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe
set DB_NAME=mes_springboot
set DB_USER=root
set DB_PASS=123456

echo [1/3] 正在创建工序表 sp_process...
type "d:\guagua\MES-FullStack-main\MES-FullStack-main\mes\src\main\resources\db\sp_process.sql" | "%MYSQL_BIN%" -u%DB_USER% -p%DB_PASS% %DB_NAME%
if %errorlevel% equ 0 (
    echo   [OK] 工序表创建成功
) else (
    echo   [FAIL] 工序表创建失败
)

echo.
echo [2/3] 正在创建工序菜单和权限...
type "d:\guagua\MES-FullStack-main\MES-FullStack-main\mes\src\main\resources\db\sp_process_menu.sql" | "%MYSQL_BIN%" -u%DB_USER% -p%DB_PASS% %DB_NAME%
if %errorlevel% equ 0 (
    echo   [OK] 菜单和权限创建成功
) else (
    echo   [FAIL] 菜单和权限创建失败
)

echo.
echo [3/3] 验证数据...
"%MYSQL_BIN%" -u%DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT '工序表' as tbl, COUNT(*) as cnt FROM sp_process UNION ALL SELECT '工序菜单', COUNT(*) FROM sp_sys_menu WHERE code LIKE 'basedata:process%';"
echo.
echo ============================================
echo 初始化完成！
echo ============================================
pause
