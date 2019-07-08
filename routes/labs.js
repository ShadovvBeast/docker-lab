const express = require('express');
const router = express.Router();

const Lab = require('../models/Lab');

// @route GET /labs
// @desc Get all labs
// @access Public
router.get('/', (req, res) => {
    Lab.find().then(labs => res.json(labs));
});


module.exports = router;