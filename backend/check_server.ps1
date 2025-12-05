# Скрипт для проверки работы Django сервера

Write-Host "Проверка работы Django сервера..." -ForegroundColor Cyan
Write-Host ""

# Проверка 1: Порт 8000
Write-Host "1. Проверка порта 8000..." -ForegroundColor Yellow
$port8000 = netstat -ano | Select-String ":8000"
if ($port8000) {
    Write-Host "   ✓ Порт 8000 занят" -ForegroundColor Green
    Write-Host "   $port8000" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Порт 8000 свободен (сервер не запущен)" -ForegroundColor Red
}

Write-Host ""

# Проверка 2: Доступность localhost
Write-Host "2. Проверка доступности localhost:8000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✓ Сервер отвечает на localhost:8000" -ForegroundColor Green
    Write-Host "   Статус: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Сервер не отвечает на localhost:8000" -ForegroundColor Red
    Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Проверка 3: Локальный IP
Write-Host "3. Ваш локальный IP адрес:" -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
if ($ip) {
    Write-Host "   ✓ $ip" -ForegroundColor Green
    Write-Host "   Используйте этот IP в мобильном приложении" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Не удалось определить локальный IP" -ForegroundColor Red
}

Write-Host ""

# Проверка 4: Процессы Python
Write-Host "4. Запущенные процессы Python:" -ForegroundColor Yellow
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "   ✓ Найдено процессов: $($pythonProcesses.Count)" -ForegroundColor Green
    $pythonProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id), Запущен: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ Процессы Python не найдены" -ForegroundColor Red
}

Write-Host ""
Write-Host "Для запуска сервера выполните:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor White




