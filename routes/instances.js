const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const jwt = require('jsonwebtoken');
const conf = require('../config');
const docker = new Docker({host: conf.docker_host, port: 2375});

// Initialize Docker
// Remove all containers
docker.listContainers({all: true}).then(containers => containers.forEach((containerInfo) => docker.getContainer(containerInfo.Id).remove({force: true})));
// Pull images
let pullImage = imagename => docker.pull(imagename, (error, stream) => error ? console.error(error) : console.log(`Successfully pulled ${imagename}`));
pullImage('mysql');
pullImage('redis');
pullImage('jupyter/all-spark-notebook');
const Lab = require('../models/Lab');

// Verify the JWT token
const verifyToken = (req, res, next) => req.headers['token'] ? jwt.verify(req.headers['token'], conf.jwt_secret, (err, authData) => err ? res.sendStatus(403) : next()) : res.sendStatus(403) 

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
router.post('/stop', verifyToken, (req, res) => docker.getContainer(req.body.instanceId).remove({force: true}).then(() => res.json('Instance removed')));

module.exports = router;