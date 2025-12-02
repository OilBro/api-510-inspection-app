# Cloudflare Integration Guide for API 510 Inspection App

This guide walks you through setting up Cloudflare R2 storage and CDN for your API 510 inspection application.

## Benefits of Cloudflare R2

- **Cost Savings**: ~40% cheaper than AWS S3 ($0.015/GB vs $0.023/GB)
- **Zero Egress Fees**: No bandwidth charges for downloads (AWS charges $0.09/GB)
- **S3 Compatible**: Drop-in replacement using existing S3 SDK
- **Global Performance**: Automatic edge caching and distribution
- **Built-in CDN**: Free Cloudflare CDN for all R2 assets

## Step 1: Create Cloudflare Account & R2 Bucket

### 1.1 Sign Up for Cloudflare
1. Go to https://dash.cloudflare.com/sign-up
2. Create account with your email (or use existing account)
3. Navigate to **R2 Object Storage** in the left sidebar

### 1.2 Enable R2
1. Click **"Create bucket"** button
2. Bucket name: `api-510-inspection-files`
3. Location: **Automatic** (Cloudflare will optimize)
4. Click **Create bucket**

### 1.3 Get R2 Credentials
1. Go to **R2 → Overview → Manage R2 API Tokens**
2. Click **Create API Token**
3. Token name: `API-510-App-Storage`
4. Permissions: **Object Read & Write**
5. TTL: **Forever** (or set expiration if preferred)
6. Click **Create API Token**
7. **IMPORTANT**: Copy these values immediately (shown only once):
   - **Access Key ID** (like: `abc123def456...`)
   - **Secret Access Key** (like: `xyz789...`)
   - **Endpoint URL** (like: `https://abc123.r2.cloudflarestorage.com`)

## Step 2: Configure R2 Public Access (Optional)

To allow direct browser access to uploaded PDFs and photos:

1. Go to your bucket → **Settings**
2. Scroll to **Public Access**
3. Click **Allow Access**
4. Copy the **Public Bucket URL** (like: `https://pub-abc123.r2.dev`)

**Alternative**: Use custom domain (e.g., `files.oilproconsulting.com`) - see Step 5

## Step 3: Add R2 Credentials to Your App

The app now supports both S3 and R2. Add these environment variables:

### Via Manus UI (Recommended)
1. Open your project in Manus
2. Go to **Settings → Secrets**
3. Add these new secrets:

```
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_ENDPOINT=<your-endpoint-url>
R2_BUCKET_NAME=api-510-inspection-files
R2_PUBLIC_URL=<your-public-bucket-url>
STORAGE_PROVIDER=r2
```

### Environment Variable Details

| Variable | Example | Description |
|----------|---------|-------------|
| `R2_ACCESS_KEY_ID` | `abc123def456...` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | `xyz789...` | R2 API token secret |
| `R2_ENDPOINT` | `https://abc123.r2.cloudflarestorage.com` | R2 endpoint URL |
| `R2_BUCKET_NAME` | `api-510-inspection-files` | Your R2 bucket name |
| `R2_PUBLIC_URL` | `https://pub-abc123.r2.dev` | Public access URL (optional) |
| `STORAGE_PROVIDER` | `r2` or `s3` | Which storage to use (defaults to `s3`) |

## Step 4: Test R2 Integration

After adding credentials:

1. **Restart your app** (Manus will auto-restart when secrets change)
2. **Upload a test PDF**:
   - Go to **Import from PDF (AI)**
   - Upload any inspection report
   - Check Cloudflare dashboard → R2 → your bucket → Objects
3. **Verify public access**:
   - Click on uploaded file in R2 dashboard
   - Copy **Public URL**
   - Open in browser - should display/download the PDF

## Step 5: Custom Domain for R2 (Optional)

Make your files accessible at `files.oilproconsulting.com` instead of `pub-abc123.r2.dev`:

### 5.1 Add Domain to Cloudflare
1. Go to **Cloudflare Dashboard → Add a Site**
2. Enter: `oilproconsulting.com`
3. Choose **Free plan**
4. Update nameservers at your domain registrar

### 5.2 Connect Domain to R2
1. Go to **R2 → your bucket → Settings**
2. Scroll to **Custom Domains**
3. Click **Connect Domain**
4. Enter: `files.oilproconsulting.com`
5. Cloudflare automatically creates DNS record
6. Update `R2_PUBLIC_URL` to `https://files.oilproconsulting.com`

## Step 6: Migrate Existing S3 Files (Optional)

If you have existing files in S3:

### Option A: Manual Migration (Small datasets)
1. Download all files from S3 bucket
2. Upload to R2 bucket via Cloudflare dashboard

### Option B: Automated Migration (Large datasets)
Use `rclone` to sync S3 → R2:

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure S3 source
rclone config create s3-source s3 \
  provider=AWS \
  access_key_id=<S3_ACCESS_KEY> \
  secret_access_key=<S3_SECRET_KEY> \
  region=us-east-1

# Configure R2 destination
rclone config create r2-dest s3 \
  provider=Cloudflare \
  access_key_id=<R2_ACCESS_KEY> \
  secret_access_key=<R2_SECRET_KEY> \
  endpoint=<R2_ENDPOINT>

# Sync files
rclone sync s3-source:<bucket-name> r2-dest:api-510-inspection-files --progress
```

## Step 7: Cost Comparison

### Current S3 Costs (Estimated)
- Storage: 10GB × $0.023/GB = **$0.23/month**
- Requests: 10K PUT × $0.005/1K = **$0.05/month**
- Bandwidth: 50GB × $0.09/GB = **$4.50/month**
- **Total: ~$4.78/month**

### With Cloudflare R2
- Storage: 10GB × $0.015/GB = **$0.15/month**
- Requests: 10K PUT × $0.0036/1K = **$0.036/month**
- Bandwidth: 50GB × $0/GB = **$0/month** ✅
- **Total: ~$0.19/month** (96% savings!)

## Step 8: Enable CDN Caching (Bonus)

If using custom domain, enable caching for faster global access:

1. Go to **Cloudflare → Caching → Configuration**
2. **Cache Level**: Standard
3. **Browser Cache TTL**: 4 hours
4. Create **Cache Rule**:
   - If: `Hostname equals files.oilproconsulting.com`
   - Then: **Cache Everything**
   - Edge TTL: 1 day

## Troubleshooting

### Files not uploading
- Check R2 credentials in Settings → Secrets
- Verify `STORAGE_PROVIDER=r2` is set
- Check server logs for errors

### Public URLs not working
- Ensure **Public Access** is enabled on bucket
- Verify `R2_PUBLIC_URL` matches your bucket's public URL
- Check CORS settings if uploading from browser

### Custom domain not working
- Verify DNS propagation (use https://dnschecker.org)
- Ensure domain is active in Cloudflare
- Check SSL/TLS mode is set to **Full** or **Flexible**

## Support

For Cloudflare-specific issues:
- Documentation: https://developers.cloudflare.com/r2/
- Community: https://community.cloudflare.com/
- Support: https://dash.cloudflare.com/?to=/:account/support

For app-specific issues:
- Check `server/storage.ts` for storage implementation
- Review server logs in Manus dashboard
- Contact: jerry@oilproconsulting.com
