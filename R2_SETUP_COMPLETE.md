# Cloudflare R2 Setup Complete ✅

Your R2 bucket has been successfully created!

## Bucket Information

- **Bucket Name**: `api-510-inspection-files`
- **Creation Date**: December 3, 2025
- **Location**: ENAM (Eastern North America)
- **Storage Class**: Standard
- **Jurisdiction**: default

## Next Steps: Get Your R2 Credentials

### Step 1: Create R2 API Token

1. Go to **Cloudflare Dashboard**: https://dash.cloudflare.com
2. Navigate to **R2 → Overview**
3. Click **"Manage R2 API Tokens"** (top right)
4. Click **"Create API Token"**
5. Configure the token:
   - **Token name**: `API-510-App-Storage`
   - **Permissions**: Select **"Object Read & Write"**
   - **Specify bucket** (recommended): Select `api-510-inspection-files`
   - **TTL**: Forever (or set expiration if preferred)
6. Click **"Create API Token"**
7. **IMPORTANT**: Copy these values (shown only once):
   - **Access Key ID**
   - **Secret Access Key**  
   - **Endpoint URL for S3 Clients** (looks like: `https://abc123.r2.cloudflarestorage.com`)

### Step 2: Enable Public Access (Optional but Recommended)

To allow direct browser access to PDFs and photos:

1. Go to **R2 → Buckets → api-510-inspection-files**
2. Click **Settings** tab
3. Scroll to **Public Access** section
4. Click **"Allow Access"** button
5. **Copy the Public Bucket URL** (looks like: `https://pub-abc123.r2.dev`)

### Step 3: Add Credentials to Your App

Go to your Manus project → **Settings → Secrets** and add these environment variables:

```
R2_ACCESS_KEY_ID=<paste-your-access-key-id>
R2_SECRET_ACCESS_KEY=<paste-your-secret-access-key>
R2_ENDPOINT=<paste-your-endpoint-url>
R2_BUCKET_NAME=api-510-inspection-files
R2_PUBLIC_URL=<paste-your-public-bucket-url>
STORAGE_PROVIDER=r2
```

### Example Values

```
R2_ACCESS_KEY_ID=abc123def456ghi789jkl012mno345pqr678
R2_SECRET_ACCESS_KEY=xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234
R2_ENDPOINT=https://1234567890abcdef.r2.cloudflarestorage.com
R2_BUCKET_NAME=api-510-inspection-files
R2_PUBLIC_URL=https://pub-1234567890abcdef.r2.dev
STORAGE_PROVIDER=r2
```

### Step 4: Test the Integration

After adding the credentials:

1. Your app will **automatically restart** when secrets are updated
2. Go to **Import from PDF (AI)** in your app
3. Upload a test inspection report
4. Verify the file appears in **Cloudflare Dashboard → R2 → api-510-inspection-files → Objects**
5. Click on the uploaded file and verify the **Public URL** works

## Cost Savings

With R2 enabled, you'll save approximately **96%** on storage costs:

| Service | Monthly Cost (10GB storage, 50GB bandwidth) |
|---------|---------------------------------------------|
| AWS S3  | $4.78/month                                 |
| Cloudflare R2 | $0.19/month                           |
| **Savings** | **$4.59/month (96%)**                   |

## Troubleshooting

### "Access Denied" errors
- Verify all 6 environment variables are set correctly in Settings → Secrets
- Ensure `STORAGE_PROVIDER=r2` (not `s3`)
- Check that API token has "Object Read & Write" permissions

### Files upload but can't be accessed
- Enable **Public Access** on the bucket (Step 2 above)
- Verify `R2_PUBLIC_URL` is set correctly
- Check that the URL format is `https://pub-xxx.r2.dev` (not the endpoint URL)

### App still using S3
- Confirm `STORAGE_PROVIDER=r2` is set in Secrets
- Restart the app manually if needed
- Check server logs for "Using storage provider: r2" message

## Custom Domain (Optional)

Want files at `files.oilproconsulting.com` instead of `pub-xxx.r2.dev`?

1. Add your domain to Cloudflare (if not already added)
2. Go to **R2 → api-510-inspection-files → Settings**
3. Scroll to **Custom Domains**
4. Click **"Connect Domain"**
5. Enter: `files.oilproconsulting.com`
6. Update `R2_PUBLIC_URL` to `https://files.oilproconsulting.com`

## Support

- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **App Setup Guide**: See `CLOUDFLARE_SETUP_GUIDE.md` in your project
- **Questions**: Contact jerry@oilproconsulting.com
