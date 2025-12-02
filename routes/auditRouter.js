const express = require("express");
const router = express.Router();

const { getAuditLogs } = require("../controllers/auditController");

// System Activity Log page
router.get("/auditLog", getAuditLogs);

// Default route → redirect to audit log
router.get("/", (req, res) => res.redirect("/auditLog"));

module.exports = router;
