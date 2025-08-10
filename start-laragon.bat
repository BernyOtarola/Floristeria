@echo off
chcp 65001 >nul
echo ===============================================
echo    🌸 FloraVista - Floristería Premium 🌸
echo ===============================================
echo [INFO] Verificando configuración del asistente IA...
if exist ".env" (
    findstr /C:"OPENAI_API_KEY=" .env >nul
    if %ERRORLEVEL% EQU 0 (
        set AI_STATUS=✅ Configurado
    ) else (
        set AI_STATUS=⚠️ No configurado
    )
) else (
    set AI_STATUS=⚠️ Archivo .env no encontrado
)

echo.

echo [INFO] Verificando Node.js...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado o no está en el PATH
    echo [INFO] Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Verificando npm...
npm --version

echo.
echo [INFO] Verificando dependencias...
if not exist "node_modules" (
    echo [INFO] Instalando dependencias por primera vez...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependencias ya instaladas ✓
)

echo.
echo [INFO] Iniciando servidor de desarrollo...
echo ===============================================
echo 🌐 Aplicación disponible en:
echo    http://localhost:5000
echo    http://floravista.test:5000 (si configuraste dominio en Laragon)
echo.
echo 📚 API disponible en:
echo    http://localhost:5000/api
echo.
echo 🤖 Asistente IA: %AI_STATUS%
echo 🛒 Carrito de compras: ✅ Habilitado
echo 💳 Sistema de cupones: ✅ Habilitado  
echo 📱 Integración WhatsApp: ✅ Habilitado
echo.
echo ⏹️  Presiona Ctrl+C para detener el servidor
echo ===============================================
echo.

call npm run dev