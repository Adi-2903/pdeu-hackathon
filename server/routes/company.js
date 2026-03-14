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
  const salary = query.salary || '120,000';
  const startDate = query.start_date || query.startDate || new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const hrName = company.hr_name || 'Sarah Mitchell';
  const companyName = company.name || 'HireX';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Offer Letter - ${c.full_name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; color: #1a1c21; background: #fff; line-height: 1.6; }
  .page { max-width: 800px; margin: 0 auto; padding: 60px 70px; position: relative; overflow: hidden; background: #fff; min-height: 1100px; }
  
  /* Watermark */
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: 900; color: rgba(0,0,0,0.02); pointer-events: none; z-index: 0; white-space: nowrap; }

  /* Decorative elements */
  .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #FF6B00 0%, #FF9E58 100%); }
  .corner-accent { position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: linear-gradient(135deg, transparent 50%, #FF6B00 50%); opacity: 0.05; }

  /* Letterhead */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; border-bottom: 1px solid #f0f0f5; padding-bottom: 30px; }
  .logo-area { display: flex; align-items: center; gap: 12px; }
  .brand-logo { width: 40px; height: 40px; background: #FF6B00; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; }
  .brand-name { font-size: 24px; font-weight: 800; color: #1a1c21; letter-spacing: -0.5px; }
  .brand-name span { color: #FF6B00; }
  
  .company-info { text-align: right; font-size: 11px; color: #64748b; font-weight: 500; }
  .company-info strong { color: #1a1c21; font-size: 12px; display: block; margin-bottom: 4px; }

  /* Content */
  .date-row { margin-bottom: 40px; color: #64748b; font-weight: 600; font-size: 13px; }
  
  .recipient-block { margin-bottom: 40px; }
  .recipient-name { font-size: 18px; font-weight: 700; color: #1a1c21; margin-bottom: 4px; }
  .recipient-meta { color: #64748b; font-size: 13px; }

  .subject-line { background: #f8fafc; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #FF6B00; margin-bottom: 35px; }
  .subject-line h2 { font-size: 14px; font-weight: 800; color: #1a1c21; text-transform: uppercase; letter-spacing: 0.5px; }

  .body-text { font-size: 14px; color: #334155; margin-bottom: 25px; text-align: justify; }
  .body-text strong { color: #1a1c21; }

  .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 30px 0; }
  .term-item { display: flex; flex-direction: column; gap: 4px; }
  .term-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .term-value { font-size: 14px; font-weight: 600; color: #1a1c21; }

  .signature-area { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
  .sig-block { width: 220px; }
  .sig-line { height: 1px; background: #e2e8f0; margin-bottom: 15px; }
  .sig-name { font-size: 15px; font-weight: 700; color: #1a1c21; }
  .sig-title { font-size: 12px; color: #64748b; }

  .digital-stamp { padding: 10px; border: 2px dashed #e2e8f0; border-radius: 12px; text-align: center; color: #cbd5e1; font-size: 10px; font-weight: 600; text-transform: uppercase; }

  .footer { margin-top: 80px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
<div class="page">
  <div class="top-bar"></div>
  <div class="corner-accent"></div>
  <div class="watermark">CONFIDENTIAL</div>

  <div class="header" style="position: relative; z-index: 1;">
    <div class="logo-area">
      <div class="brand-logo">H</div>
      <div class="brand-name">${company.name || 'Hire<span>X</span>'}</div>
    </div>
    <div class="company-info">
      <strong>OFFICIAL COMMUNICATION</strong>
      ${company.address || 'Global Headquarters'} <br>
      ${company.city || 'Tech City'}, ${company.state || 'Cloud'} <br>
      ${company.email || 'hr@hirex.ai'} | ${company.website || 'www.hirex.ai'}
    </div>
  </div>

  <div class="date-row">Date: ${today}</div>

  <div class="recipient-block">
    <div class="recipient-name">${c.full_name}</div>
    <div class="recipient-meta">${c.email}</div>
    <div class="recipient-meta">${c.location || 'Remote Candidate'}</div>
  </div>

  <div class="subject-line">
    <h2>Subject: Employment Offer - ${role}</h2>
  </div>

  <p class="body-text">
    Dear <strong>${c.full_name.split(' ')[0]}</strong>,
  </p>

  <p class="body-text">
    We are thrilled to formally extend this offer of employment for the position of <strong>${role}</strong> at <strong>${company.name || 'HireX'}</strong>. 
    Our team was deeply impressed by your background and the unique perspective you bring. We believe your expertise will be instrumental in our next phase of growth.
  </p>

  <div class="terms-grid">
    <div class="term-item">
      <div class="term-label">Position Title</div>
      <div class="term-value">${role}</div>
    </div>
    <div class="term-item">
      <div class="term-label">Annual Base Compensation</div>
      <div class="term-value">$${salary} USD</div>
    </div>
    <div class="term-item">
      <div class="term-label">Official Start Date</div>
      <div class="term-value">${startDate}</div>
    </div>
    <div class="term-item">
      <div class="term-label">Reporting To</div>
      <div class="term-value">${hrName}</div>
    </div>
  </div>

  <p class="body-text">
    This offer includes our comprehensive benefits package, including equity options, healthcare coverage, and our flexible "Work from Anywhere" policy. A detailed induction roadmap will be shared upon your acceptance.
  </p>

  <p class="body-text">
    Please indicate your acceptance of this offer by signing below and returning it by <strong>${new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
  </p>

  <div class="signature-area">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${hrName}</div>
      <div class="sig-title">Head of Talent Acquisition</div>
      <div class="sig-title">${company.name || 'HireX'}</div>
    </div>
    
    <div class="sig-block">
      <div class="digital-stamp">Digital Authentication Verified</div>
    </div>
  </div>

  <div class="footer">
    HireX Technology Solutions © 2026. This document is encrypted and legally binding. 
    Any unauthorized reproduction is strictly prohibited.
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
      subject = `[Confidential] Offer of Employment - ${c.current_role || 'Position'} | ${company.name || 'HireX'}`;
      body = `Dear ${c.full_name.split(' ')[0]},\n\nWe are delighted to extend an offer of employment for the position of ${c.current_role || 'Software Engineer'} at ${company.name || 'HireX'}.\n\nAttached to this email, you will find your formal offer letter which details the compensation, benefits, and start date. We have also initiated your pre-onboarding workflow in our internal talent portal.\n\nTo accept this offer, please review the attached document and reply to this email or sign the digital copy by the date specified in the letter.\n\nWe look forward to welcoming you to the team!\n\nBest regards,\n${company.hr_name || 'Talent Team'}\n${company.name || 'HireX'}`;
    } else if (type === 'interview') {
      subject = `Interview Invitation: ${c.current_role || 'Position'} Role at ${company.name || 'HireX'}`;
      body = `Hi ${c.full_name.split(' ')[0]},\n\nI hope you're having a great week! Our team has finished reviewing your profile, and we'd love to invite you for an interview to discuss the ${c.current_role || 'Position'} role further.\n\nYou'll be meeting with our leadership team for a 45-minute technical and cultural session. Please let me know your availability for early next week, or feel free to suggest some slots that work for you.\n\nLooking forward to speaking with you soon!\n\nBest,\n${company.hr_name || 'Talent Team'}\n${company.name || 'HireX'}`;
    } else if (type === 'rejection') {
      subject = `Update regarding your application with ${company.name || 'HireX'}`;
      body = `Dear ${c.full_name.split(' ')[0]},\n\nThank you for sharing your experience with us and for the time you've invested in our application process.\n\nAfter a thorough review, we've decided to move forward with other candidates at this time. This was a difficult decision given your strong background, particularly in ${(c.skills || []).slice(0, 2).join(', ')}.\n\nWe'll keep your profile in our passive pool for future opportunities that may be a closer match. Wishing you the best of luck in your current search!\n\nBest regards,\n${company.hr_name || 'Talent Team'}\n${company.name || 'HireX'}`;
    } else {
      subject = `Connection: ${c.current_role || 'Specialist'} Opportunity at ${company.name || 'HireX'}`;
      body = `Hi ${c.full_name.split(' ')[0]},\n\nI'm reaching out from the Talent team at ${company.name || 'HireX'}. I came across your profile and was particularly impressed by your experience at ${c.current_company || 'your current company'}.\n\nWe are currently scaling our ${c.current_role || 'Engineering'} team and I'd love to chat briefly about how your skills could impact our growth. Are you open to a casual 10-minute intro call this week?\n\nLooking forward to hearing from you.\n\nBest,\n${company.hr_name || 'Talent Team'}\n${company.name || 'HireX'}`;
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
    const { candidateId, role, salary, start_date, startDate } = req.body;
    const db = getDb();
    const c = db.data.candidates.find(x => x.id === candidateId);
    if (!c) return res.status(404).json({ error: { message: 'Candidate not found' } });

    console.log('Generating PDF for direct download...');
    const html = await getOfferLetterHtml(candidateId, db, { role, salary, start_date: start_date || startDate });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    
    // Set a viewport for consistent rendering
    await page.setViewport({ width: 800, height: 1100 });
    
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    // Ensure styles and fonts are settled
    await new Promise(r => setTimeout(r, 1000));
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    
    await browser.close();

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Offer_Letter_${(c.full_name || 'Candidate').replace(/\s+/g, '_')}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    res.end(pdfBuffer, 'binary');
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
