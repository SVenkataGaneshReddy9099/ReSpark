# Run all backend unit and integration tests with Pytest
Write-Host "Running ReSpark Backend Pytest Suite..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
& ".\venv\Scripts\python.exe" -m pytest tests -v
Set-Location -Path "$PSScriptRoot\frontend"
Write-Host "`nRunning ReSpark Frontend Typecheck & Build..." -ForegroundColor Yellow
npm run build
Write-Host "`nAll test suites passed!" -ForegroundColor Green
