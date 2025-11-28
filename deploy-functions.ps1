# Deploy Edge Functions to Supabase
# Run this script after setting up Resend API key

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Edge Functions Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it using:" -ForegroundColor Yellow
    Write-Host "npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Get project ref from user
Write-Host "📋 Enter your Supabase Project Reference ID:" -ForegroundColor Yellow
Write-Host "(Find it in your Supabase Dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_REF)" -ForegroundColor Gray
$projectRef = Read-Host "Project Ref"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "❌ Project Ref is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Linking to project: $projectRef" -ForegroundColor Cyan
supabase link --project-ref $projectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project. Make sure you're logged in with 'supabase login'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setting Up Environment Secrets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get Resend API Key
Write-Host "📧 Enter your Resend API Key:" -ForegroundColor Yellow
Write-Host "(Get it from https://resend.com/api-keys)" -ForegroundColor Gray
$resendKey = Read-Host "Resend API Key" -AsSecureString
$resendKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($resendKey))

if ([string]::IsNullOrWhiteSpace($resendKeyPlain)) {
    Write-Host "❌ Resend API Key is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting RESEND_API_KEY secret..." -ForegroundColor Cyan
supabase secrets set RESEND_API_KEY=$resendKeyPlain

# Get Admin Email
Write-Host ""
Write-Host "📧 Enter Admin Email for notifications:" -ForegroundColor Yellow
$adminEmail = Read-Host "Admin Email"

if ([string]::IsNullOrWhiteSpace($adminEmail)) {
    Write-Host "❌ Admin Email is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting ADMIN_EMAIL secret..." -ForegroundColor Cyan
supabase secrets set ADMIN_EMAIL=$adminEmail

# Get App URL (optional)
Write-Host ""
Write-Host "🌐 Enter your App URL (optional, press Enter to use http://localhost:5173):" -ForegroundColor Yellow
$appUrl = Read-Host "App URL"

if (-not [string]::IsNullOrWhiteSpace($appUrl)) {
    Write-Host ""
    Write-Host "Setting APP_URL secret..." -ForegroundColor Cyan
    supabase secrets set APP_URL=$appUrl
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying Edge Functions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$functions = @(
    "send-enquiry-notification",
    "send-booking-link",
    "send-booking-confirmation",
    "send-chat-notification"
)

foreach ($function in $functions) {
    Write-Host "🚀 Deploying $function..." -ForegroundColor Cyan
    supabase functions deploy $function --no-verify-jwt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $function deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to deploy $function" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test contact form submission at http://localhost:8080/contact" -ForegroundColor White
Write-Host "2. Login to admin panel at http://localhost:8080/admin" -ForegroundColor White
Write-Host "3. Send a booking link from an enquiry" -ForegroundColor White
Write-Host "4. Check your email for notifications" -ForegroundColor White
Write-Host ""
Write-Host "📊 View function logs:" -ForegroundColor Yellow
Write-Host "supabase functions logs FUNCTION_NAME" -ForegroundColor White
Write-Host ""
Write-Host "✅ Happy coding!" -ForegroundColor Green
