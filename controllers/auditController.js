// controllers/auditController.js
const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .lean();

    res.render("auditLog", { logs });
  } catch (err) {
    console.error("Error loading audit logs:", err);
    res.status(500).send("Error loading audit logs");
  }
};
