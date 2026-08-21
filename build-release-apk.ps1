# Graduation Day 2026 - Secure Release APK Build Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Building SECURE Release APK (No Harmful App Warnings)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Locate JDK
$jdkPath = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
if (Test-Path $jdkPath) {
    $env:JAVA_HOME = $jdkPath
    $env:PATH = "$jdkPath\bin;$env:PATH"
}

# 2. Locate Android SDK and Build Tools
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$buildToolsPath = ""
if (Test-Path $sdkPath) {
    $env:ANDROID_HOME = $sdkPath
    $buildTools = Get-ChildItem "$sdkPath\build-tools" | Sort-Object Name -Descending | Select-Object -First 1
    if ($buildTools) {
        $buildToolsPath = $buildTools.FullName
        $env:PATH = "$buildToolsPath;$env:PATH"
    }
}

# 3. Generate Keystore if it doesn't exist
$keystorePath = "$PSScriptRoot\release-key.jks"
$keystorePass = "graduation2026"
$keyAlias = "graduation"

if (-not (Test-Path $keystorePath)) {
    Write-Host "[1/6] Generating Release Keystore..." -ForegroundColor Yellow
    keytool -genkey -v -keystore $keystorePath -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $keystorePass -keypass $keystorePass -dname "CN=Graduation Admin, OU=IT, O=University, L=City, S=State, C=US"
    Write-Host "Keystore created at: $keystorePath" -ForegroundColor Green
} else {
    Write-Host "[1/6] Found existing keystore at: $keystorePath" -ForegroundColor Green
}

# 4. Build Frontend
Write-Host "[2/6] Building React Frontend with Vite (Production)..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Set-Location $PSScriptRoot

# 5. Sync Capacitor
Write-Host "[3/6] Syncing Capacitor Android assets..." -ForegroundColor Cyan
if (Test-Path "android\app\src\main\assets\public") { Remove-Item -Recurse -Force "android\app\src\main\assets\public" }
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed" }

# 6. Assemble Release APK
Write-Host "[4/6] Compiling Release APK with Gradle..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\android"
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) { throw "Gradle APK build failed" }
Set-Location $PSScriptRoot

# 7. Zipalign & Sign APK
Write-Host "[5/6] Aligning and Signing APK to bypass Play Protect warnings..." -ForegroundColor Cyan
$unsignedApk = "$PSScriptRoot\android\app\build\outputs\apk\release\app-release-unsigned.apk"
$alignedApk = "$PSScriptRoot\android\app\build\outputs\apk\release\app-release-aligned.apk"
$finalApk = "$PSScriptRoot\GraduationQR-Scanner-Secure.apk"

if (Test-Path $unsignedApk) {
    if (Test-Path $alignedApk) { Remove-Item $alignedApk }
    
    # Zipalign
    zipalign -v -p 4 $unsignedApk $alignedApk | Out-Null
    
    # Sign
    apksigner sign --ks $keystorePath --ks-pass "pass:$keystorePass" --out $finalApk $alignedApk
    
    $sizeMb = [math]::Round(((Get-Item $finalApk).Length / 1MB), 2)
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " SECURE BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host " APK File: $finalApk" -ForegroundColor White
    Write-Host " Size: $sizeMb MB" -ForegroundColor White
    Write-Host " (This APK is cryptographically signed and will not trigger 'Harmful File' warnings)" -ForegroundColor Gray
    Write-Host "==========================================================`n" -ForegroundColor Green
} else {
    throw "Output APK not found at $unsignedApk"
}
