const express = require('express');
const router = express.Router();

import {Lab, ILab} from '../models/Lab';

// @route GET /labs
// @desc Get all labs
// @access Public
router.get('/', (req, res) => {
    Lab.find().then(labs => res.json(labs));
});

export default router;