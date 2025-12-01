exports.getAuditLogs = async (req, res) => {
  const fakeLogs = [
    {
      timestamp: new Date(),
      username: "system",
      action_type: "CREATE",
      entity_type: "DELIVERY",
      entity_id: 1,
      source: "WEB",
      old_value: null,
      new_value: '{"status":"Pending"}',
      remarks: "Sample log"
    }
  ];

  res.render("auditLog", { logs: fakeLogs });
};