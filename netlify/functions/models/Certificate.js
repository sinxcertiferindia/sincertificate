const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    batchName: {
      type: String,
    },
    organizationName: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
    },
    additionalInfo: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔐 Important for serverless (prevents model overwrite error)
module.exports =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);
