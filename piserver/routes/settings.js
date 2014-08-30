var express = require('express');
var router = express.Router();

/* GET settings page. */
router.get('/settings', function(req, res) {
  res.render('settings', { title: 'Express' });
});

module.exports = router;