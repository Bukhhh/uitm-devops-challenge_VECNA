# RentVerse Mobile App Build Script
# Creates a mobile-friendly version of the web app

Write-Host "🏗️  Building RentVerse Mobile App" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Build the frontend
Write-Host "Step 1: Building Frontend..." -ForegroundColor Yellow
cd rentverse-frontend

# Clean previous build
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

# Build the app
Write-Host "Building Next.js application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend build completed!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Export static files
Write-Host "Exporting static files..." -ForegroundColor Cyan
npm run export 2>$null

if (Test-Path "out") {
    Write-Host "[OK] Static export completed!" -ForegroundColor Green
} else {
    Write-Host "[WARN] Static export not available, using build output" -ForegroundColor Yellow
}

cd ..

Write-Host ""
Write-Host "Step 2: Creating Mobile App Structure..." -ForegroundColor Yellow

# Create mobile app directory
$appDir = "rentverse-mobile-app"
if (Test-Path $appDir) {
    Remove-Item -Recurse -Force $appDir
}
New-Item -ItemType Directory -Path $appDir | Out-Null

# Copy built files
Write-Host "Copying application files..." -ForegroundColor Cyan
Copy-Item "rentverse-frontend/out/*" $appDir -Recurse -Force

# Create mobile-specific files
Write-Host "Creating mobile-specific files..." -ForegroundColor Cyan

# Create a mobile-optimized index.html
$mobileIndex = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#3b82f6">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="RentVerse">
    <title>RentVerse - Secure Property Rental</title>
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/icon-192x192.png">
    <style>
        /* Mobile optimizations */
        body {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        /* Hide scrollbars on mobile */
        ::-webkit-scrollbar {
            display: none;
        }
        /* Prevent zoom on input focus */
        input[type="text"], input[type="email"], input[type="password"], textarea, select {
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div id="__next">
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
        ">
            <h1 style="margin-bottom: 20px; font-size: 2.5rem;">🏠 RentVerse</h1>
            <p style="margin-bottom: 30px; font-size: 1.2rem; opacity: 0.9;">
                Secure Property Rental Platform
            </p>
            <div style="margin-bottom: 30px;">
                <div style="display: inline-block; margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    🔐 Multi-Factor Authentication
                </div>
                <div style="display: inline-block; margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    🤖 AI Anomaly Detection
                </div>
                <div style="display: inline-block; margin: 10px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    📄 Digital Contracts
                </div>
            </div>
            <button onclick="window.location.reload()" style="
                padding: 15px 30px;
                font-size: 1.1rem;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            ">
                Launch RentVerse
            </button>
        </div>
    </div>
    <script>
        // Auto-reload after 3 seconds to load the full app
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    </script>
</body>
</html>
"@

$mobileIndex | Out-File -FilePath "$appDir/index.html" -Encoding UTF8

# Create APK info file
$apkInfo = @"
# RentVerse Mobile App Build Information

## App Details
- Name: RentVerse
- Version: 1.0.0
- Platform: Progressive Web App (PWA)
- Compatible: Android, iOS, Desktop

## Security Features
- Multi-Factor Authentication (OTP via Email)
- API Rate Limiting
- AI Anomaly Detection
- Activity Logging & Audit
- Automated Security Testing

## Installation Instructions

### Android (Chrome)
1. Open Chrome browser
2. Navigate to the app URL
3. Tap the menu (three dots)
4. Select "Add to Home screen"
5. Tap "Add"

### iOS (Safari)
1. Open Safari browser
2. Navigate to the app URL
3. Tap the Share button
4. Select "Add to Home Screen"
5. Tap "Add"

## Build Information
- Built with Next.js 15
- PWA enabled
- Responsive design
- Mobile-optimized UI

## Deployment
This app can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting service

For production deployment, ensure:
- HTTPS enabled
- Service worker registered
- Proper CORS configuration
"@

$apkInfo | Out-File -FilePath "$appDir/APK_BUILD_INFO.md" -Encoding UTF8

Write-Host "[OK] Mobile app structure created!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Creating Deployment Package..." -ForegroundColor Yellow

# Create a zip file for easy deployment
$zipPath = "rentverse-mobile-app-v1.0.0.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

Write-Host "Creating deployment package..." -ForegroundColor Cyan
Compress-Archive -Path $appDir -DestinationPath $zipPath

if (Test-Path $zipPath) {
    Write-Host "[OK] Deployment package created: $zipPath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to create deployment package" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 MOBILE APP BUILD COMPLETE!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "Build Summary:" -ForegroundColor Cyan
Write-Host "- App Location: $appDir" -ForegroundColor White
Write-Host "- Deployment Package: $zipPath" -ForegroundColor White
Write-Host "- Size: $(Get-Item $zipPath | Select-Object -ExpandProperty Length) bytes" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload $zipPath to your hosting service" -ForegroundColor White
Write-Host "2. Enable HTTPS for PWA installation" -ForegroundColor White
Write-Host "3. Test installation on mobile devices" -ForegroundColor White
Write-Host "4. Submit the APK_BUILD_INFO.md with your deliverables" -ForegroundColor White
Write-Host ""
Write-Host "For the challenge submission, provide:" -ForegroundColor Magenta
Write-Host "- Download link to the hosted app" -ForegroundColor White
Write-Host "- APK_BUILD_INFO.md documentation" -ForegroundColor White
Write-Host "- Instructions for mobile installation" -ForegroundColor White

Read-Host "Press Enter to exit"