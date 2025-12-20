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

/**
 * @route   GET /api/certificates/search
 * @desc    Search certificates by name, email, or course
 */
router.get("/search", async (req, res) => {
  try {
    const { name, email, course } = req.query;

    if (!name && !email && !course) {
      return res.status(400).json({
        message: "At least one search parameter (name, email, or course) is required",
      });
    }

    const query = {};
    if (name) {
      query.recipientName = { $regex: name, $options: "i" };
    }
    if (email) {
      query.recipientEmail = { $regex: email, $options: "i" };
    }
    if (course) {
      query.courseName = { $regex: course, $options: "i" };
    }

    const certificates = await Certificate.find(query).sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error("Search certificates error:", error);
    res.status(500).json({
      message: "Server error while searching certificates",
    });
  }
});

/**
 * @route   GET /api/certificates/:id
 * @desc    Get single certificate by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findOne({ certificateId: id });

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    // Increment views count
    certificate.views = (certificate.views || 0) + 1;
    await certificate.save();

    res.json(certificate);
  } catch (error) {
    console.error("Fetch certificate error:", error);
    res.status(500).json({
      message: "Server error while fetching certificate",
    });
  }
});

/**
 * @route   POST /api/certificates/bulk
 * @desc    Create multiple certificates
 */
router.post("/bulk", async (req, res) => {
  try {
    const certificates = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        message: "Invalid request. Expected an array of certificates.",
      });
    }

    const savedCertificates = [];
    const errors = [];

    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      try {
        // Validate required fields
        if (
          !cert.recipientName ||
          !cert.recipientEmail ||
          !cert.courseName ||
          !cert.organizationName ||
          !cert.issueDate
        ) {
          errors.push({
            index: i,
            message: `Row ${i + 1}: Missing required fields`,
          });
          continue;
        }

        // Generate certificate ID
        const certificateId = generateCertificateId(cert.batchName);

        // Check if certificate ID already exists
        const existing = await Certificate.findOne({ certificateId });
        if (existing) {
          errors.push({
            index: i,
            message: `Row ${i + 1}: Certificate ID ${certificateId} already exists`,
          });
          continue;
        }

        const certificate = new Certificate({
          certificateId,
          recipientName: cert.recipientName,
          recipientEmail: cert.recipientEmail,
          courseName: cert.courseName,
          batchName: cert.batchName || undefined,
          organizationName: cert.organizationName,
          issueDate: new Date(cert.issueDate),
          expirationDate: cert.expirationDate
            ? new Date(cert.expirationDate)
            : undefined,
          additionalInfo: cert.additionalInfo || undefined,
          status: cert.status || "active",
          views: 0,
        });

        const savedCertificate = await certificate.save();
        savedCertificates.push(savedCertificate);
      } catch (error) {
        errors.push({
          index: i,
          message: `Row ${i + 1}: ${error.message}`,
        });
      }
    }

    if (savedCertificates.length === 0) {
      return res.status(400).json({
        message: "No certificates were created",
        errors: errors,
      });
    }

    res.status(201).json({
      message: `Successfully created ${savedCertificates.length} certificate(s)`,
      created: savedCertificates.length,
      total: certificates.length,
      certificates: savedCertificates,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk create certificates error:", error);
    res.status(500).json({
      message: "Server error while creating certificates",
    });
  }
});

module.exports = router;
