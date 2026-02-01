@echo off
chcp 65001 >nul
cd /d "C:\mp\mealrush-mobile-v2"
python e2e_runner.py %*
