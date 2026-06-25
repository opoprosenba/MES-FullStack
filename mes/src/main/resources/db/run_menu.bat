@echo off
chcp 65001 >nul
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -prose@19345nba --default-character-set=utf8mb4 mes_data < "%~dp0init_menu.sql"