// routes/deliveryRouter.js
const express = require('express');
const router = express.Router();

const CardDelivery = require('../models/CardDelivery');
const AuditLog = require('../models/AuditLog');

const multer = require('multer');
const xlsx = require('xlsx');

// Multer: temporary upload folder
const upload = multer({ dest: 'uploads/' });

console.log('[deliveryRouter] loaded');

// Inline helper: write an audit log entry
async function addAuditLog(req, {
  action_type,
  entity_type,
  entity_id,
  field = null,
  old_value = null,
  new_value = null,
  source = "Web",
  remarks = "",
}) {
  try {
    const user = req.user || null;

    await AuditLog.create({
      username: user ? user.name : "System",
      user_id: user ? user.id : null,
      action_type,
      entity_type,
      entity_id,
      field,
      old_value: old_value !== undefined && old_value !== null
        ? String(old_value)
        : null,
      new_value: new_value !== undefined && new_value !== null
        ? String(new_value)
        : null,
      source,
      remarks,
    });
  } catch (err) {
    console.error("Error writing audit log:", err);
  }
}

/**
 * GET /deliveries
 * Show all deliveries in the table
 */
router.get('/', async (req, res) => {
  try {
    let deliveries = await CardDelivery.find().sort({ updated_at: -1 }).lean();

    deliveries = deliveries.map(d => ({
      ...d,
      id: d._id.toString(),
    }));

    res.render('deliveries', { deliveries });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    res.status(500).send('Error loading deliveries');
  }
});

/**
 * POST /deliveries
 * (Optional manual create – you can keep or ignore this form)
 */
router.post('/', async (req, res) => {
  try {
    const { card_number, recipient_name, address, courier } = req.body;

    const created = await CardDelivery.create({
      card_number,
      recipient_name,
      address,
      courier,
      status: 'Pending',
      updated_at: new Date(),
    });

    // Audit: track creation
    await addAuditLog(req, {
      action_type: "CREATE_DELIVERY",
      entity_type: "CardDelivery",
      entity_id: created._id.toString(),
      field: null,
      old_value: null,
      new_value: null,
      source: "Deliveries Page",
      remarks: `Created delivery for card ${card_number}`,
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error creating delivery:', err);
    res.status(500).send('Error creating delivery');
  }
});

/**
 * POST /deliveries/import
 * Import deliveries from Excel
 */
router.post('/import', upload.single('excel_file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.redirect('/deliveries');
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log('[Import] Raw rows from Excel:', rows);

    const docs = rows
      .map(row => {
        const rawStatus = row['Status'];

        // Normalise status (Excel has "In Transit", DB uses "Shipped")
        let status = 'Pending';
        if (rawStatus === 'Delivered') status = 'Delivered';
        else if (rawStatus === 'In Transit') status = 'Shipped';
        else if (['Pending', 'Shipped', 'Failed'].includes(rawStatus)) status = rawStatus;

        return {
          card_number: row['Card #'],
          recipient_name: row['Recipient'],
          address: row['Address'],
          courier: row['Courier'] || '-',
          status,
          updated_at: new Date(),   // just use "now"
        };
      })
      .filter(d => d.card_number && d.recipient_name && d.address);

    if (docs.length === 0) {
      console.warn('[Import] No valid rows found in file');
      return res.redirect('/deliveries');
    }

    const result = await CardDelivery.insertMany(docs);
    console.log(`[Import] Successfully inserted ${result.length} deliveries`);

    // Audit: log bulk import
    await addAuditLog(req, {
      action_type: "IMPORT_DELIVERIES",
      entity_type: "CardDelivery",
      entity_id: "BULK",
      field: null,
      old_value: null,
      new_value: null,
      source: "Deliveries Import",
      remarks: `Imported ${result.length} deliveries from Excel`,
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error importing deliveries:', err);
    res.status(500).send('Error importing deliveries');
  }
});

/**
 * POST /deliveries/:id/status
 * Update the status of an existing delivery
 */
router.post('/:id/status', async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { new_status } = req.body;

    // Get the existing delivery to capture old status
    const existing = await CardDelivery.findById(deliveryId).lean();
    const oldStatus = existing ? existing.status : null;

    await CardDelivery.findByIdAndUpdate(deliveryId, {
      status: new_status,
      updated_at: new Date(),
    });

    // Audit: who changed what
    await addAuditLog(req, {
      action_type: "UPDATE_STATUS",
      entity_type: "CardDelivery",
      entity_id: deliveryId,
      field: "status",
      old_value: oldStatus,
      new_value: new_status,
      source: "Deliveries Page",
      remarks: `Status updated by ${req.user?.name || "Unknown"}`,
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).send('Error updating delivery status');
  }
});

module.exports = router;
