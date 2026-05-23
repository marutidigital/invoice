# Supabase Setup Guide for ProInvoice

## Step 1 — Run the database schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/bcskjlkaebiplahvfbid
2. Click **SQL Editor** in the left sidebar
3. Click **+ New query**
4. Open the file `supabase/schema.sql` from this project
5. Paste the entire contents into the SQL editor
6. Click **Run**

You should see all tables created: `profiles`, `clients`, `invoices`, `invoice_items`.

---

## Step 2 — Create the logos storage bucket

1. In the Supabase dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Set the name to: `logos`
4. Toggle **Public bucket** to ON
5. Click **Create bucket**
6. Go to **Policies** tab for the logos bucket
7. Add the following policies (or use the SQL editor):

```sql
-- Public read access for all logos
create policy "logos: public read"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Users can upload to their own folder
create policy "logos: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own logos
create policy "logos: authenticated update"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own logos
create policy "logos: authenticated delete"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Step 3 — Set up Google OAuth

### A. Create Google OAuth credentials

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select an existing one)
3. Go to **APIs & Services → Credentials**
4. Click **+ Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Name: `ProInvoice`
7. Add **Authorized redirect URIs**:
   ```
   https://bcskjlkaebiplahvfbid.supabase.co/auth/v1/callback
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### B. Add Google OAuth to Supabase

1. In Supabase dashboard → **Authentication → Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Google provider** to ON
4. Paste your **Client ID** and **Client Secret**
5. The **Callback URL** shown (starting with `https://bcskjlkaebiplahvfbid.supabase.co/auth/v1/callback`) is what you added to Google above
6. Click **Save**

### C. Add redirect URL for your domain

1. In Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to: `https://proinvoice.shop`
3. Add to **Redirect URLs**:
   ```
   https://proinvoice.shop/auth/callback
   http://localhost:3000/auth/callback
   ```
4. Click **Save**

---

## Step 4 — Set up Magic Link email

Magic link is enabled by default in Supabase. To customise the email template:

1. Supabase → **Authentication → Email Templates**
2. Edit the **Magic Link** template to match your branding

The sender email defaults to `noreply@mail.supabase.io` until you set up a custom SMTP.
For production: configure a custom SMTP server in **Authentication → SMTP Settings**.

---

## Step 5 — Verify everything works

1. Run `npm run dev`
2. Visit `http://localhost:3000` — landing page loads
3. Visit `http://localhost:3000/login` — sign in with Google or magic link
4. After login → redirect to `/onboarding` → fill in business profile
5. After saving → redirect to `/dashboard`

---

## Environment variables checklist

All variables are already in `.env.local`:

| Variable | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `RESEND_API_KEY` | ✅ Set |
| `NEXT_PUBLIC_APP_URL` | ✅ Set |
| `FROM_EMAIL` | ✅ Set |
| `FROM_NAME` | ✅ Set |

> **Important:** Never commit `.env.local` to GitHub. It's already in `.gitignore`. Add all variables to Vercel environment settings before deploying.
