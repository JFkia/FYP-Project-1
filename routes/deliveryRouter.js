// routes/deliveryRouter.js
const express = require('express');
const router = express.Router();
const CardDelivery = require('../models/CardDelivery');

// (Optional) If you have an audit logger, you can integrate it here
// const { addAuditLog } = require('../utils/auditLogger');

/**
 * GET /deliveries
 * Show all deliveries in the table
 */
router.get('/', async (req, res) => {
  try {
    let deliveries = await CardDelivery.find().sort({ updated_at: -1 }).lean();

    // Ensure there's an `id` field for the EJS template (d.id)
    deliveries = deliveries.map(d => ({
      ...d,
      id: d._id.toString()
    }));

    res.render('deliveries', { deliveries });
  } catch (err) {
    console.error('Error fetching deliveries:', err);
    // You can customise this error page / message
    res.status(500).send('Error loading deliveries');
  }
});

/**
 * POST /deliveries
 * Create a new delivery from the form
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
      updated_at: new Date()
    });

    // If you have audit logging:
    // await addAuditLog(req.user, `Created delivery for card ${card_number}`);

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error creating delivery:', err);
    res.status(500).send('Error creating delivery');
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
      updated_at: new Date()
    });

    // If you have audit logging:
    // await addAuditLog(req.user, `Updated delivery ${deliveryId} to ${new_status}`);

    res.redirect('/deliveries');
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).send('Error updating delivery status');
  }
});

module.exports = router;
