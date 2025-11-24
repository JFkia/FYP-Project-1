// routes/contactRouter.js (or inside your existing router)
const router = require('express').Router();

router.get('/contact', (req, res) => {
  res.render('contact', { errors: [], formData: {} });
});

router.post('/contact', async (req, res) => {
  const { name, email, company, topic, message } = req.body;
  const errors = [];
  const formData = { name, email, company, topic, message };

  if (!name || !email || !message) {
    errors.push('Name, email and message are required.');
  }

  if (errors.length > 0) {
    return res.render('contact', { errors, formData });
  }

  // TODO: send email / save to DB / notify Slack etc.

  res.render('contact', {
    errors: [],
    formData: {},
    success: true
  });
});

module.exports = router;
