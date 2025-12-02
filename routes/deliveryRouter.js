// routes/deliveryRouter.js
const express = require('express');
const router = express.Router();
const CardDelivery = require('../models/CardDelivery');

const multer = require('multer');
const xlsx = require('xlsx');

// Multer: store uploaded files in /uploads temporarily
const upload = multer({ dest: 'uploads/' });

// Just to confirm router is loaded
console.log('[deliveryRouter] loaded');

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
 * (Optional) manual add – still works if you ever bring back the form
 * POST /deliveries
 */
router.post('/', async (req, res) => {
  try {
    const { card_number, recipient_name, address, courier } = req.body;

    await CardDelivery.create({
      card_number,
      recipient_name,
      address,
      courier,
      status: 'Pending',
      updated_at: new Date(),
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error creating delivery:', err);
    res.status(500).send('Error creating delivery');
  }
});

/**
 * ✅ POST /deliveries/import
 * Import deliveries from uploaded Excel (.xlsx / .xls / .csv)
 */
router.post('/import', upload.single('excel_file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.redirect('/deliveries');
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log('[Import] Raw rows from Excel:', rows);

    // 🔁 Map your sample columns → DB fields
    const docs = rows
      .map(row => {
        const rawStatus = row['Status'];

        // Normalise status (Excel has "In Transit", DB uses "Shipped")
        let status = 'Pending';
        if (rawStatus === 'Delivered') status = 'Delivered';
        else if (rawStatus === 'In Transit') status = 'Shipped';
        else if (['Pending', 'Shipped', 'Failed'].includes(rawStatus)) status = rawStatus;

        return {
          card_number: row['Card #'],          // from Excel
          recipient_name: row['Recipient'],    // from Excel
          address: row['Address'],
          courier: row['Courier'] || '-',
          status,
          updated_at: new Date(),
        };
      })
      .filter(d => d.card_number && d.recipient_name && d.address);

    if (docs.length === 0) {
      console.warn('[Import] No valid rows found in file');
      return res.redirect('/deliveries');
    }

    await CardDelivery.insertMany(docs);

    console.log(`[Import] Successfully inserted ${docs.length} deliveries`);
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

    await CardDelivery.findByIdAndUpdate(deliveryId, {
      status: new_status,
      updated_at: new Date(),
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).send('Error updating delivery status');
  }
});

module.exports = router;
