# Start ReSpark React Vite Frontend
Write-Host "Starting ReSpark Frontend on http://127.0.0.1:5173..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
npm run dev -- --host 127.0.0.1 --port 5173
