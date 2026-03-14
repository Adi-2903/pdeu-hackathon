const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

// ── HELPER: Generate offer letter HTML ──
async function getOfferLetterHtml(candidateId, db, query = {}) {
  const c = db.data.candidates.find(x => x.id === candidateId);
  if (!c) throw new Error('Candidate not found');

  const company = db.data.company_profile || {};
  const role = query.role || c.current_role || 'Software Engineer';
  const salary = query.salary || '80,000';
  const startDate = query.start_date || new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const hrName = company.hr_name || 'HR Department';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Offer Letter - ${c.full_name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans', 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; line-height: 1.7; }
  .page { max-width: 720px; margin: 0 auto; padding: 48px 56px; }

  /* Letterhead */
  .letterhead { border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
  .lh-left h1 { font-size: 22px; font-weight: 700; color: #000; letter-spacing: 1px; }
  .lh-left .tagline { font-size: 11px; color: #666; margin-top: 2px; font-style: italic; }
  .lh-right { text-align: right; font-size: 11px; color: #444; line-height: 1.6; }

  /* Body */
  .date { font-size: 13px; color: #333; margin-bottom: 24px; }
  .recipient { font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px; }
  .recipient-detail { font-size: 12px; color: #555; margin-bottom: 20px; }
  .subject { font-size: 14px; font-weight: 700; color: #000; margin-bottom: 20px; text-decoration: underline; }
  .salutation { font-size: 13px; margin-bottom: 16px; }
  .body-para { font-size: 13px; color: #222; margin-bottom: 14px; text-align: justify; }
  .highlight { font-weight: 700; color: #000; }
  .terms-list { padding-left: 24px; margin: 12px 0 16px; }
  .terms-list li { font-size: 12.5px; color: #222; margin-bottom: 6px; }
  .terms-list li strong { font-weight: 700; }
  .closing { margin-top: 28px; font-size: 13px; }
  .signature { margin-top: 36px; }
  .sig-name { font-size: 14px; font-weight: 700; color: #000; }
  .sig-title { font-size: 12px; color: #555; }
  .sig-company { font-size: 12px; color: #555; }

  /* Footer */
  .footer { margin-top: 48px; border-top: 1px solid #ddd; padding-top: 12px; text-align: center; font-size: 10px; color: #999; }

  @media print { .page { padding: 24px 32px; } }
</style>
</head>
<body>
<div class="page">

  <!-- LETTERHEAD -->
  <div class="letterhead">
    <div class="lh-left">
      <h1>${company.name || 'Company Name'}</h1>
      ${company.tagline ? `<div class="tagline">${company.tagline}</div>` : ''}
    </div>
    <div class="lh-right">
      ${company.address ? company.address + '<br>' : ''}
      ${company.city ? company.city + (company.state ? ', ' + company.state : '') + '<br>' : ''}
      ${company.phone ? 'Tel: ' + company.phone + '<br>' : ''}
      ${company.email ? company.email + '<br>' : ''}
      ${company.website ? company.website : ''}
    </div>
  </div>

  <!-- DATE -->
  <div class="date">${today}</div>

  <!-- RECIPIENT -->
  <div class="recipient">${c.full_name}</div>
  <div class="recipient-detail">
    ${c.email ? c.email + '<br>' : ''}
    ${c.phone ? c.phone + '<br>' : ''}
    ${c.location || ''}
  </div>

  <!-- SUBJECT -->
  <div class="subject">Subject: Offer of Employment -- ${role}</div>

  <!-- BODY -->
  <div class="salutation">Dear ${c.full_name.split(' ')[0]},</div>

  <p class="body-para">
    We are pleased to extend this formal offer of employment to you for the position of 
    <span class="highlight">${role}</span> at <span class="highlight">${company.name || 'our organization'}</span>. 
    After careful evaluation of your qualifications, experience, and the insights gained during our interview process, 
    we are confident that you will be a valuable addition to our team.
  </p>

  <p class="body-para">The terms of your employment are as follows:</p>

  <ul class="terms-list">
    <li><strong>Position:</strong> ${role}</li>
    <li><strong>Department:</strong> Engineering</li>
    <li><strong>Start Date:</strong> ${startDate}</li>
    <li><strong>Compensation:</strong> $${salary} per annum</li>
    <li><strong>Employment Type:</strong> Full-Time</li>
    <li><strong>Reporting To:</strong> ${hrName}</li>
    <li><strong>Location:</strong> ${company.city || 'Office'}, ${company.state || ''}</li>
  </ul>

  <p class="body-para">
    In addition to your base compensation, you will be eligible for our standard benefits package 
    which includes health insurance, paid time off, professional development allowance, 
    and performance-based bonuses. Full details of the benefits program will be provided 
    during your onboarding.
  </p>

  <p class="body-para">
    This offer is contingent upon the successful completion of background verification 
    and any other pre-employment requirements as per company policy. Please confirm your 
    acceptance of this offer by signing and returning this letter by 
    <span class="highlight">${new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>.
  </p>

  <p class="body-para">
    We are excited about the prospect of you joining ${company.name || 'our team'} and look forward 
    to the contributions you will make. Should you have any questions regarding this offer, 
    please do not hesitate to contact us.
  </p>

  <!-- CLOSING -->
  <div class="closing">Warm regards,</div>
  <div class="signature">
    <div class="sig-name">${hrName}</div>
    <div class="sig-title">Human Resources</div>
    <div class="sig-company">${company.name || 'Company'}</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    This is a confidential document intended solely for the named recipient. 
    ${company.name || 'Company'} | ${company.address || ''} ${company.city || ''} ${company.state || ''} | ${company.phone || ''}
  </div>

</div>
</body>
</html>`;
}

// ── GET company profile ──
router.get('/profile', (req, res) => {
  try {
    const db = getDb();
    const profile = db.data.company_profile || {};
    res.json({ status: 'success', data: profile });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ── PUT update company profile ──
router.put('/profile', (req, res) => {
  try {
    const db = getDb();
    db.data.company_profile = { ...(db.data.company_profile || {}), ...req.body, updated_at: new Date().toISOString() };
    db.save();
    res.json({ status: 'success', data: db.data.company_profile });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ── GET offer letter HTML ──
router.get('/offer-letter/:candidateId', async (req, res) => {
  try {
    const db = getDb();
    const html = await getOfferLetterHtml(req.params.candidateId, db, req.query);
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ── GET email compose data ──
router.get('/email-compose/:candidateId', (req, res) => {
  try {
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === req.params.candidateId);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    const company = db.data.company_profile || {};
    const type = req.query.type || 'outreach';

    let subject, body;
    if (type === 'offer') {
      subject = `Offer of Employment - ${c.current_role || 'Position'} at ${company.name || 'Our Company'}`;
      body = `Dear ${c.full_name.split(' ')[0]},\n\nWe are pleased to inform you that after careful consideration, we would like to extend an offer of employment for the position of ${c.current_role || 'Software Engineer'} at ${company.name || 'our organization'}.\n\nPlease find the attached offer letter with the complete terms of employment. We kindly request that you review the details and confirm your acceptance at your earliest convenience.\n\nBest regards,\n${company.hr_name || 'HR Team'}\n${company.name || 'Company'}`;
    } else if (type === 'rejection') {
      subject = `Update on Your Application - ${company.name || 'Company'}`;
      body = `Dear ${c.full_name.split(' ')[0]},\n\nThank you for your interest in the role at ${company.name || 'our organization'}.\n\nAfter careful consideration, we have decided to move forward with another candidate whose qualifications more closely align with our current needs.\n\nWishing you the best in your career.\n\nBest regards,\n${company.hr_name || 'HR Team'}\n${company.name || 'Company'}`;
    } else {
      subject = `Exciting Opportunity at ${company.name || 'Our Company'}`;
      body = `Hi ${c.full_name.split(' ')[0]},\n\nI came across your profile and was impressed by your experience. We have an exciting opportunity at ${company.name || 'our company'} that I believe aligns well with your background.\n\nLooking forward to hearing from you.\n\nBest regards,\n${company.hr_name || 'HR Team'}\n${company.name || 'Company'}`;
    }

    res.json({
      status: 'success',
      data: {
        to: c.email,
        subject,
        body,
        offer_letter_url: `/api/v1/company/offer-letter/${c.id}`
      }
    });
  } catch (err) { res.status(500).json({ error: { message: err.message } }); }
});

// ── POST generate PDF for direct download ──
router.post('/generate-offer-pdf', async (req, res) => {
  try {
    const { candidateId, role, salary, start_date } = req.body;
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === candidateId);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    console.log('Generating PDF for direct download...');
    const html = await getOfferLetterHtml(candidateId, db, { role, salary, start_date });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Offer_Letter_${c.full_name.replace(/\\s+/g, '_')}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF Gen Error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── POST send email with PDF attachment ──
router.post('/send-email', async (req, res) => {
  try {
    const { candidateId, to, subject, body, includeAttachment, role, salary, start_date } = req.body;
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === candidateId);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    const attachments = [];

    if (includeAttachment) {
      console.log('Generating PDF for attachment...');
      const html = await getOfferLetterHtml(candidateId, db, { role, salary, start_date });

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      attachments.push({
        filename: `Offer_Letter_${c.full_name.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer
      });
    }

    // SMTP Config
    let transporter;
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
      });
    } else if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const info = await transporter.sendMail({
      from: `"${db.data.company_profile.name || 'HireX'}" <${process.env.GMAIL_USER || 'hr@hirex.ai'}>`,
      to: to || c.email,
      subject: subject,
      text: body,
      attachments: attachments
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Email sent:', info.messageId);
    if (previewUrl) console.log('Preview URL:', previewUrl);

    // Track activity in DB
    if (!db.data.offer_letters) db.data.offer_letters = [];
    if (includeAttachment) {
      db.data.offer_letters.push({
        id: uuidv4(),
        candidate_id: candidateId,
        candidate_name: c.full_name,
        role: role || c.current_role,
        salary: salary || '80,000',
        status: 'sent',
        created_at: new Date().toISOString(),
        preview_url: previewUrl
      });
      db.save();
    }

    res.json({ status: 'success', messageId: info.messageId, previewUrl });
  } catch (err) {
    console.error('Send Email Error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
