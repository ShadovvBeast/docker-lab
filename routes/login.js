const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const conf = require('../config');

// @route POST /login
// @desc Login to get a token
router.post('/', (req, res) => User.findOne({username: req.body.username})
                                .then(user => user ? bcrypt.compare(req.body.password || '', user.password).then(success => success ? jwt.sign({username: user.username, password: user.password}, conf.jwt_secret, (err, token) => res.json({token}))
                                                                                                                                    : res.json({message: 'Incorrect password'})) 
                                                   : res.json({message: 'User not found'}))); 
module.exports = router;