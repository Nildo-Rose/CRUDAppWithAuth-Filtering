# Build Docker Compose images (backend + frontend).
# Requires: Docker Desktop running, and Docker Compose (included in Docker Desktop).
Set-Location $PSScriptRoot

$compose = $null
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        docker compose version 2>$null
        if ($LASTEXITCODE -eq 0) { $compose = 'docker compose' }
    } catch {}
    if (-not $compose) {
        $dc = Get-Command docker-compose -ErrorAction SilentlyContinue
        if ($dc) { $compose = 'docker-compose' }
    }
}

if (-not $compose) {
    Write-Host "Docker Compose not found. Use Docker Desktop (includes Compose) or install docker-compose."
    exit 1
}

Write-Host "Building with: $compose build"
Invoke-Expression "$compose build"
exit $LASTEXITCODE
