const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const jwt = require('jsonwebtoken');
const isDocker = require('is-docker');
//const docker = new Docker({host: '127.0.0.1', port: 2375});
const conf = require('../config');
const Lab = require('../models/Lab');
const verifyToken = (req, res, next) => req.headers['token'] ? jwt.verify(req.headers['token'], conf.jwt_secret, (err, authData) => err ? res.sendStatus(403) : next()) : res.sendStatus(403) // Verify the JWT token
// @route GET /instances
// @desc Get all lab instances (running docker containers)
router.get('/', verifyToken, (req, res) => {
    docker.listContainers().then(containers => res.json(containers)).catch(err => console.error(err));
});

let port = conf.docker_base_port;
// @route POST /instances/start
// @desc Start an instance (create a docker container)
router.post('/start', verifyToken, (req, res) => {
    Lab.findOne({canonical_name: req.body.lab_name}).then((lab) => {
        if (lab)
        {
            let PortBindings = {};
            PortBindings[lab.docker_port] = [{ HostPort: port.toString() }];
            docker.createContainer({'Image': lab.docker_image, 'HostConfig': {PortBindings}, 'Env': lab.docker_env || []},  (err, container) => {
                if (container)
                {
                    
                    container.start().then((container) => {
                        res.json({instanceId: container.id, Url: container.modem.host + ':' + port})
                        port++;
                    });
                }
                else
                    res.json({message: "Instance could not be created"});
            });
        }
        else 
            res.json({message: "Lab not found"});

    });
});

// @route POST /instances/stop
// @desc Stop an instance (removes the docker container)
router.post('/stop', verifyToken, (req, res) => docker.getContainer(req.body.instanceId).remove({force: true}));

module.exports = router;