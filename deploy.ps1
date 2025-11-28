# Deploy Edge Functions to Supabase

Write-Host "========================================"
Write-Host "  Edge Functions Deployment"
Write-Host "========================================"
Write-Host ""

# Get Resend API Key
Write-Host "Step 1: Get your Resend API Key"
Write-Host "   1. Go to https://resend.com"
Write-Host "   2. Sign up (free - 100 emails/day)"
Write-Host "   3. Go to API Keys - Create API Key"
Write-Host "   4. Copy the key (starts with re_)"
Write-Host ""
Write-Host "Enter your Resend API Key:"
$resendKey = Read-Host

if ([string]::IsNullOrWhiteSpace($resendKey)) {
    Write-Host "ERROR: Resend API Key is required!"
    exit 1
}

# Get Admin Email
Write-Host ""
Write-Host "Step 2: Enter Admin Email for notifications:"
$adminEmail = Read-Host

if ([string]::IsNullOrWhiteSpace($adminEmail)) {
    Write-Host "ERROR: Admin Email is required!"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Logging in to Supabase"
Write-Host "========================================"
Write-Host ""

npx supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login"
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Login successful!"
Write-Host ""

# Link project
Write-Host "========================================"
Write-Host "  Linking to project"
Write-Host "========================================"
Write-Host ""

npx supabase link --project-ref xqnqkzzqlkrhwuofbvhf

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to link project"
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Project linked!"
Write-Host ""

# Set secrets
Write-Host "========================================"
Write-Host "  Setting secrets"
Write-Host "========================================"
Write-Host ""

Write-Host "Setting RESEND_API_KEY..."
npx supabase secrets set RESEND_API_KEY=$resendKey

Write-Host "Setting ADMIN_EMAIL..."
npx supabase secrets set ADMIN_EMAIL=$adminEmail

Write-Host "Setting APP_URL..."
npx supabase secrets set APP_URL=http://localhost:8080

Write-Host ""
Write-Host "SUCCESS: Secrets configured!"
Write-Host ""

# Deploy functions
Write-Host "========================================"
Write-Host "  Deploying Functions"
Write-Host "========================================"
Write-Host ""

$functions = @(
    "send-enquiry-notification",
    "send-booking-link",
    "send-booking-confirmation",
    "send-chat-notification"
)

foreach ($function in $functions) {
    Write-Host "Deploying $function..."
    npx supabase functions deploy $function --no-verify-jwt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: $function deployed"
    } else {
        Write-Host "  WARNING: $function had issues"
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Deployment Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Test your setup:"
Write-Host "1. Go to http://localhost:8080/contact"
Write-Host "2. Submit a test enquiry"
Write-Host "3. Check $adminEmail for notification"
Write-Host ""
Write-Host "View logs with: npx supabase functions logs FUNCTION_NAME"
Write-Host ""
Write-Host "DONE! CORS errors should be gone!"
