const express = require('express');
const nodemailer = require('nodemailer');
const Certificate = require('../models/Certificate');

const router = express.Router();

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials are missing. Email sending is disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const mailTransporter = createTransporter();
const getCertificateUrl = (certificateId) => {
  const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  return `${baseUrl}/certificate/${certificateId}`;
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 certificates
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Search certificates by recipient/course/email
// @route   GET /api/certificates/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { name, email, course } = req.query;

    if (!name && !email && !course) {
      return res.status(400).json({ message: 'Provide at least one search field (name, email, or course).' });
    }

    const conditions = [];

    if (name) {
      conditions.push({ recipientName: { $regex: new RegExp(name, 'i') } });
    }
    if (email) {
      conditions.push({ recipientEmail: { $regex: new RegExp(email, 'i') } });
    }
    if (course) {
      conditions.push({ courseName: { $regex: new RegExp(course, 'i') } });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};
    const results = await Certificate.find(query)
      .sort({ issueDate: -1 })
      .limit(25);

    res.json(results);
  } catch (error) {
    console.error('Certificate search failed:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/certificates/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalIssued = await Certificate.countDocuments();
    const verified = await Certificate.countDocuments({ status: 'active' });
    const revoked = await Certificate.countDocuments({ status: 'revoked' });
    const totalViews = await Certificate.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    res.json({
      totalIssued,
      verified,
      revoked,
      views: totalViews[0]?.total || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Create a single certificate
// @route   POST /api/certificates
// @access  Public (for now, will add auth later)
router.post('/', async (req, res) => {
  try {
    const {
      certificateId,
      recipientName,
      recipientEmail,
      courseName,
      batchName,
      organizationName,
      issueDate,
      expirationDate,
      additionalInfo,
      status
    } = req.body;

    console.log('Received certificate data:', req.body);

    // Validate required fields
    if (!recipientName || !recipientEmail || !courseName || !organizationName || !issueDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: recipientName, recipientEmail, courseName, organizationName, and issueDate are required.' 
      });
    }

    // Generate certificateId if not provided
    const finalCertificateId = certificateId || 
      Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);

    const certificate = new Certificate({
      certificateId: finalCertificateId,
      recipientName,
      recipientEmail,
      courseName,
      batchName: batchName || undefined,
      organizationName,
      issueDate: new Date(issueDate),
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      additionalInfo: additionalInfo || undefined,
      status: status || 'active',
      views: 0,
    });

    const createdCertificate = await certificate.save();
    console.log('Certificate created successfully:', createdCertificate.certificateId);
    res.status(201).json(createdCertificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Certificate ID already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @desc    Bulk create certificates
// @route   POST /api/certificates/bulk
// @access  Public (for now, will add auth later)
router.post('/bulk', async (req, res) => {
  try {
    const certificates = req.body;
    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({ message: 'Request body must be an array of certificates.' });
    }

    // Validate and prepare certificates
    const validCertificates = certificates.map((cert, index) => {
      // Validate required fields
      if (!cert.recipientName || !cert.recipientEmail || !cert.courseName || !cert.organizationName || !cert.issueDate) {
        throw new Error(`Row ${index + 1}: Missing required fields (recipientName, recipientEmail, courseName, organizationName, issueDate)`);
      }

      // Generate certificateId if not provided
      const finalCertificateId = cert.certificateId || 
        Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);

      return {
        certificateId: finalCertificateId,
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        courseName: cert.courseName,
        batchName: cert.batchName || undefined,
        organizationName: cert.organizationName,
        issueDate: new Date(cert.issueDate),
        expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : undefined,
        additionalInfo: cert.additionalInfo || undefined,
        status: cert.status || 'active',
        views: 0,
      };
    });

    console.log(`Attempting to insert ${validCertificates.length} certificates`);

    const createdCertificates = await Certificate.insertMany(validCertificates, { 
      ordered: false,
      rawResult: false
    });

    console.log(`Successfully created ${createdCertificates.length} certificates`);
    res.status(201).json(createdCertificates);
  } catch (error) {
    console.error('Bulk upload error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map((err) => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate certificate ID found. Please ensure all certificate IDs are unique.' 
      });
    }

    if (error.message && error.message.includes('Missing required fields')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: error.message || 'Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Send issued certificates via email
// @route   POST /api/certificates/send-emails
// @access  Public (protected via SMTP creds)
router.post('/send-emails', async (req, res) => {
  try {
    if (!mailTransporter) {
      return res.status(500).json({
        message: 'Email service is not configured. Please add SMTP credentials.',
      });
    }

    const { certificateIds } = req.body;
    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return res.status(400).json({ message: 'certificateIds array is required.' });
    }

    const certificates = await Certificate.find({ certificateId: { $in: certificateIds } });
    if (certificates.length === 0) {
      return res.status(404).json({ message: 'No certificates found for the provided IDs.' });
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await Promise.all(
      certificates.map((cert) => {
        const certificateUrl = getCertificateUrl(cert.certificateId);
        return mailTransporter.sendMail({
          from: fromAddress,
          to: cert.recipientEmail,
          subject: `Your Certificate for ${cert.courseName}`,
          html: `
            <p>Hi ${cert.recipientName},</p>
            <p>Congratulations on completing <strong>${cert.courseName}</strong>.</p>
            <p>You can view and download your certificate using the link below:</p>
            <p><a href="${certificateUrl}" target="_blank">${certificateUrl}</a></p>
            <p>Your certificate ID/password: <strong>${cert.certificateId}</strong></p>
            <p>Best regards,<br/>${cert.organizationName || 'Certificate Team'}</p>
          `,
        });
      })
    );

    res.json({
      message: `Emails sent successfully to ${certificates.length} recipient(s).`,
      sent: certificates.length,
    });
  } catch (error) {
    console.error('Certificate email error:', error);
    res.status(500).json({ message: 'Failed to send certificate emails.', error: error.message });
  }
});

// @desc    Verify a certificate and increment views
// @route   GET /api/certificates/:certificateId
// @access  Public
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId });

    if (certificate) {
      // Increment views when certificate is viewed
      certificate.views = (certificate.views || 0) + 1;
      await certificate.save();
      
      res.json(certificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;
