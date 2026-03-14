# 📧 Email Setup Guide — TalentFlow

This guide explains how to configure Gmail SMTP so the **Send Email** feature works from the candidate profile page.

---

## Option 1 — Gmail (Recommended for Development)

### Step 1 — Enable Gmail 2-Factor Authentication
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll to **"How you sign in to Google"**
3. Click **"2-Step Verification"** and follow the steps to turn it ON

### Step 2 — Generate a Gmail App Password
1. After enabling 2FA, go to: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. In the **"Select app"** dropdown, choose **"Mail"**
3. In the **"Select device"** dropdown, choose **"Other"** and type `TalentFlow`
4. Click **"Generate"**
5. Copy the **16-character password** shown (example: `abcd efgh ijkl mnop`)

### Step 3 — Create your `.env` file
In the `server/` folder, create a file called `.env` (copy from `.env.example`):

```env
GMAIL_USER=yourname@gmail.com
GMAIL_PASS=abcdefghijklmnop
SMTP_FROM_NAME=TalentFlow Recruiting
SMTP_FROM_EMAIL=yourname@gmail.com
```

> ⚠️ **Important:** Remove all spaces from the app password. It should be 16 characters with no spaces.

### Step 4 — Restart the server
```bash
cd server
npm run dev
```

You should now see real emails land in the inbox of the recipient address you type in the modal.

---

## Option 2 — Custom SMTP (Production)

If you are using a custom SMTP provider (e.g. SendGrid, Mailgun, Zoho, etc.), set these variables instead:

```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=TalentFlow Recruiting
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

---

## Fallback — Ethereal (Test Mode)

If neither `GMAIL_USER` nor `SMTP_HOST` is set in `.env`, the system **automatically** uses [Ethereal Email](https://ethereal.email/) — a free fake SMTP service for testing. Emails will **not** actually be delivered, but the server logs will print a **Preview URL** you can open in your browser to inspect the full email body.

---

## Security Notes

- **Never commit your `.env` file** to Git. It is already in `.gitignore`.
- Gmail App Passwords are bound to your specific Google account. Revoke them any time from your Google account security settings.
- For production deployments, always use a dedicated transactional email provider (SendGrid, Mailgun, Amazon SES).
