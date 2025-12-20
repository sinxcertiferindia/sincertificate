const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");

/**
 * Generate Certificate ID
 * Format: SIN-BATCHNAME-XXXXX
 * Example: SIN-2025-A-FQIUH
 */
const generateCertificateId = (batchName = "GEN") => {
  const prefix = "SIN";

  const cleanBatch = batchName
    ? batchName.replace(/\s+/g, "").toUpperCase()
    : "GEN";

  const uniqueId = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

  return `${prefix}-${cleanBatch}-${uniqueId}`;
};

/**
 * @route   POST /api/certificates
 * @desc    Create single certificate
 */
router.post("/", async (req, res) => {
  try {
    // Debug: Log request body to help diagnose issues
    console.log("POST /certificates - Request body:", JSON.stringify(req.body));
    console.log("POST /certificates - Content-Type:", req.get("Content-Type"));
    
    const {
      recipientName,
      recipientEmail,
      courseName,
      batchName,
      organizationName,
      issueDate,
      expirationDate,
      additionalInfo,
    } = req.body || {};

    // ✅ Required field validation
    if (
      !recipientName ||
      !recipientEmail ||
      !courseName ||
      !organizationName ||
      !issueDate
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: recipientName, recipientEmail, courseName, organizationName, and issueDate are required",
        received: {
          recipientName: !!recipientName,
          recipientEmail: !!recipientEmail,
          courseName: !!courseName,
          organizationName: !!organizationName,
          issueDate: !!issueDate,
        },
        bodyKeys: req.body ? Object.keys(req.body) : "req.body is undefined or null",
      });
    }

    // ✅ Generate certificate ID
    const certificateId = generateCertificateId(batchName);

    const certificate = new Certificate({
      certificateId,
      recipientName,
      recipientEmail,
      courseName,
      batchName: batchName || undefined,
      organizationName,
      issueDate: new Date(issueDate),
      expirationDate: expirationDate
        ? new Date(expirationDate)
        : undefined,
      additionalInfo: additionalInfo || undefined,
      status: "active",
      views: 0,
    });

    const savedCertificate = await certificate.save();

    res.status(201).json({
      message: "Certificate created successfully",
      certificate: savedCertificate,
    });
  } catch (error) {
    console.error("Create certificate error:", error);
    res.status(500).json({
      message: "Server error while creating certificate",
    });
  }
});

/**
 * @route   GET /api/certificates
 * @desc    Get all certificates
 */
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    console.error("Fetch certificates error:", error);
    res.status(500).json({
      message: "Server error while fetching certificates",
    });
  }
});

module.exports = router;
