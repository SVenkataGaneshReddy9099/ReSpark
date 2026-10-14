# Run the 10-step hackathon end-to-end demonstration workflow
Write-Host "Running 10-Step ReSpark End-to-End Workflow Verification..." -ForegroundColor Cyan
& "$PSScriptRoot\backend\venv\Scripts\python.exe" "$PSScriptRoot\backend\test_workflow.py"
