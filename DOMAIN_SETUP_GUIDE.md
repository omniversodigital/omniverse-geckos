# 🌐 Domain Setup Guide - Omniverse Geckos

## Quick Domain Configuration

### Option 1: Use Existing Domain

If you already own `omniversegeckos.com`:

1. **Point DNS to Vercel:**
   ```bash
   # Add these DNS records in your domain provider:
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61

   Type: A
   Name: @  
   Value: 76.223.126.88
   ```

2. **Configure in Vercel:**
   ```bash
   # In Vercel dashboard:
   Project → Settings → Domains
   Add: omniversegeckos.com
   Add: www.omniversegeckos.com
   ```

### Option 2: Register New Domain

**Recommended Domain Registrars:**
- **Namecheap** - Good pricing, easy management
- **Google Domains** - Simple interface, reliable
- **Cloudflare** - Best security features
- **GoDaddy** - Popular, widely supported

**Domain Suggestions:**
- `omniversegeckos.com` ⭐ (Primary choice)
- `geckoverse.com` 
- `omnigeckos.com`
- `geckoworld.io`
- `playomniverse.com`

### Option 3: Free Subdomain (Development)

For testing/development, use free options:
- `omniversegeckos.vercel.app` (Auto-generated)
- `omniversegeckos.netlify.app` 
- Custom subdomain on existing domain

---

## Step-by-Step Setup

### 1. Domain Registration

**If buying a new domain:**

```bash
# Check availability
curl https://api.namecheap.com/domain/check?domain=omniversegeckos.com

# Or use web interface:
# namecheap.com, godaddy.com, etc.
```

**Cost:** ~$12-15/year for .com

### 2. DNS Configuration

**For Vercel (Recommended):**

```bash
# DNS Records to add:
Record Type: A
Name: @
Value: 76.76.19.61
TTL: 300

Record Type: A
Name: @
Value: 76.223.126.88  
TTL: 300

Record Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

**For Netlify (Alternative):**
```bash
Record Type: A
Name: @
Value: 75.2.60.5
TTL: 300

Record Type: CNAME
Name: www
Value: [your-site].netlify.app
TTL: 300
```

### 3. Vercel Domain Setup

**Via Vercel Dashboard:**
1. Go to your project dashboard
2. Settings → Domains  
3. Add Domain: `omniversegeckos.com`
4. Add Domain: `www.omniversegeckos.com`
5. Wait for SSL certificate (automatic)

**Via Vercel CLI:**
```bash
# Add domains
vercel domains add omniversegeckos.com
vercel domains add www.omniversegeckos.com

# Link to project
vercel domains link omniversegeckos.com your-project
```

### 4. Environment Variables Update

Update your environment variables:

```bash
# Update .env.local and Vercel environment variables
NEXT_PUBLIC_APP_URL=https://omniversegeckos.com
NEXTAUTH_URL=https://omniversegeckos.com

# Update any API callbacks
RESEND_DOMAIN=omniversegeckos.com
```

### 5. SSL Certificate Verification

**Automatic SSL (Vercel):**
- SSL certificates are automatically provided and renewed
- Usually takes 1-2 minutes after domain setup
- Supports wildcard certificates

**Check SSL Status:**
```bash
# Test SSL certificate
curl -I https://omniversegeckos.com
# Should return 200 OK with valid certificate

# Check certificate details
openssl s_client -connect omniversegeckos.com:443 -servername omniversegeckos.com
```

---

## Domain Configuration by Provider

### Namecheap
```bash
# Login to Namecheap
# Domain List → Manage → Advanced DNS
# Add the Vercel DNS records above
# TTL: Automatic or 300 seconds
```

### GoDaddy
```bash
# Login to GoDaddy
# DNS → Manage Zones → Add Records
# Add A and CNAME records as specified
# TTL: 1 Hour or Custom (300 seconds)
```

### Cloudflare
```bash
# Login to Cloudflare
# DNS → Records → Add record
# Add A and CNAME records
# TTL: Auto or Custom
# Proxy status: DNS only (gray cloud)
```

### Google Domains
```bash
# Login to Google Domains
# DNS → Custom records
# Add A and CNAME records as specified
# TTL: 300 seconds
```

---

## Advanced Configuration

### Subdomain Setup

For additional subdomains:

```bash
# Add these subdomains:
blog.omniversegeckos.com    → CNAME to main domain
api.omniversegeckos.com     → A records to Vercel
app.omniversegeckos.com     → A records to Vercel
admin.omniversegeckos.com   → A records to Vercel
```

### Email Setup

**Option 1: Google Workspace**
```bash
# Add MX records:
Priority: 1  | Value: aspmx.l.google.com
Priority: 5  | Value: alt1.aspmx.l.google.com  
Priority: 5  | Value: alt2.aspmx.l.google.com
Priority: 10 | Value: alt3.aspmx.l.google.com
Priority: 10 | Value: alt4.aspmx.l.google.com
```

**Option 2: Resend (for transactional emails)**
```bash
# Add TXT record for domain verification:
Name: _resend
Value: [verification-code-from-resend]

# Add DKIM records (provided by Resend):
Type: CNAME
Name: resend._domainkey
Value: [dkim-value-from-resend]
```

### CDN & Security (Cloudflare)

**Enable Cloudflare:**
1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Configure security settings:
   ```bash
   SSL/TLS: Full (strict)
   Always Use HTTPS: On
   Automatic HTTPS Rewrites: On
   Security Level: Medium
   Bot Fight Mode: On
   ```

---

## Verification & Testing

### 1. DNS Propagation Check
```bash
# Check DNS propagation globally
nslookup omniversegeckos.com 8.8.8.8

# Online tools:
# whatsmydns.net
# dnschecker.org
```

### 2. Site Accessibility Test
```bash
# Test main domain
curl -I https://omniversegeckos.com

# Test www redirect
curl -I https://www.omniversegeckos.com

# Test HTTP to HTTPS redirect  
curl -I http://omniversegeckos.com
```

### 3. Performance Test
```bash
# Page speed
curl -o /dev/null -s -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total: %{time_total}\n" https://omniversegeckos.com

# Online tools:
# pagespeed.web.dev
# gtmetrix.com  
```

---

## Troubleshooting

### Common Issues

**DNS Not Propagating:**
```bash
# Clear local DNS cache
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns             # Windows
sudo systemctl restart systemd-resolved  # Ubuntu

# Wait 24-48 hours for full global propagation
```

**SSL Certificate Issues:**
```bash
# Check certificate status in Vercel
vercel certs ls

# Force certificate renewal
# Usually automatic, contact Vercel support if needed
```

**Redirect Loops:**
```bash
# Check for redirect chains
curl -L -v https://omniversegeckos.com

# Common fix: ensure NEXTAUTH_URL matches actual domain
```

**Email Delivery Issues:**
```bash
# Check SPF record
nslookup -type=TXT omniversegeckos.com

# Add SPF record if missing:
Type: TXT
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"
```

---

## Maintenance & Monitoring

### Domain Monitoring
- **Uptime monitoring:** UptimeRobot, Pingdom
- **SSL monitoring:** SSL Labs, Qualys
- **DNS monitoring:** DNS Checker tools

### Renewal Reminders
- Most registrars offer auto-renewal
- Set calendar reminders 60 days before expiration
- Monitor WHOIS data for accuracy

---

## Cost Summary

| Service | Cost | Notes |
|---------|------|-------|
| Domain Registration | $12-15/year | .com domain |
| DNS Hosting | Free | Included with registrar |
| SSL Certificate | Free | Automatic with Vercel |
| Cloudflare (optional) | Free | Basic plan sufficient |
| Email (Google Workspace) | $6/month | Optional |
| **Total** | **~$12-15/year** | + optional email |

---

## Next Steps After Domain Setup

1. ✅ **Update Environment Variables**
2. ✅ **Test All Functionality**
3. ✅ **Set up Email Addresses**
4. ✅ **Configure Analytics**
5. ✅ **Update Social Media Links**
6. ✅ **Submit to Search Engines**
7. ✅ **Monitor Performance**

---

**🎉 Your domain is ready! Time to launch Omniverse Geckos to the world! 🦎🚀**

---

*Need help? Check our [MVP Setup Guide](MVP_SETUP_GUIDE.md) or create an issue.*