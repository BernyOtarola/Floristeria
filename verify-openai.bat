@echo off
chcp 65001 >nul
echo ===============================================
echo    🤖 Verificación del Asistente IA - OpenAI
echo ===============================================
echo.

echo [INFO] Verificando archivo .env...
if not exist ".env" (
    echo [ERROR] Archivo .env no encontrado
    echo [INFO] Crea el archivo .env con tu OPENAI_API_KEY
    pause
    exit /b 1
)

echo [INFO] Verificando API Key...
findstr /C:"OPENAI_API_KEY=" .env >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] OPENAI_API_KEY no encontrada en .env
    echo [INFO] Agrega la línea: OPENAI_API_KEY=tu_api_key
    pause
    exit /b 1
)

echo [INFO] API Key encontrada ✓
echo.
echo [INFO] Ejecutando prueba de conexión...
echo [INFO] Esto puede tomar unos segundos...
echo.

node test-openai.js

echo.
echo [INFO] Verificación completada
pause