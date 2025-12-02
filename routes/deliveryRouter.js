// routes/deliveryRouter.js
const express = require('express');
const router = express.Router();
const CardDelivery = require('../models/CardDelivery');

const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

// ------------------------
// GET /deliveries
// ------------------------
router.get('/', async (req, res) => {
  try {
    let deliveries = await CardDelivery.find().sort({ updated_at: -1 }).lean();

    deliveries = deliveries.map(d => ({
      ...d,
      id: d._id.toString()
    }));

    res.render('deliveries', { deliveries });
  } catch (err) {
    console.error('Error loading deliveries:', err);
    res.status(500).send('Error loading deliveries');
  }
});

// ------------------------
// POST /deliveries (manual add)
// ------------------------
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

// ------------------------
// POST /deliveries/import
// ------------------------
router.post('/import', upload.single('excel_file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const docs = rows
      .map(row => ({
        card_number: row['Card Number'],
        recipient_name: row['Recipient Name'],
        address: row['Address'],
        courier: row['Courier'] || '-',
        status: row['Status'] || 'Pending',
        updated_at: new Date(),
      }))
      .filter(d => d.card_number && d.recipient_name && d.address);

    if (docs.length === 0) {
      console.warn("No valid rows found.");
      return res.redirect('/deliveries');
    }

    await CardDelivery.insertMany(docs);

    console.log(`Imported ${docs.length} deliveries`);
    res.redirect('/deliveries');

  } catch (err) {
    console.error('Error importing deliveries:', err);
    res.status(500).send('Error importing deliveries');
  }
});

// ------------------------
// POST /deliveries/:id/status
// ------------------------
router.post('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_status } = req.body;

    await CardDelivery.findByIdAndUpdate(id, {
      status: new_status,
      updated_at: new Date(),
    });

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).send('Error updating status');
  }
});

module.exports = router;
