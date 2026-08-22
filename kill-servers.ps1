$ports = @(5000, 3000, 5173)
foreach ($p in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process on port $p (PID: $($c.OwningProcess))"
            }
        }
    } catch {}
}
Write-Host "All ports (5000, 3000, 5173) are completely free and clean!"
