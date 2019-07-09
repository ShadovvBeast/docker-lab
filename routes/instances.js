const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const jwt = require('jsonwebtoken');
const conf = require('../config');
const docker = new Docker( conf.docker_host ? {host: conf.docker_host, port: conf.docker_port || 2375} : undefined);

// Initialize Docker
// Remove all containers
docker.listContainers({all: true}).then(containers => containers.forEach((containerInfo) => docker.getContainer(containerInfo.Id).remove({force: true})));
const Lab = require('../models/Lab');

let imageList = [];
docker.listImages().then((images) => imageList = Array.from(new Set(images.map(image => image.RepoTags[0]))));
// Verify the JWT token
const verifyToken = (req, res, next) => req.headers['token'] ? jwt.verify(req.headers['token'], conf.jwt_secret, (err, authData) => err ? res.sendStatus(403) : next()) : res.sendStatus(403) 

// @route GET /instances
// @desc Get all lab instances (running docker containers)
// @access Private
router.get('/', verifyToken, (req, res) => {
    docker.listContainers().then(containers => res.json(containers)).catch(err => console.error(err));
});

let port = conf.docker_base_port;


// Start an instance
const startInstance = (lab, PortBindings, res) => {
    docker.createContainer({'Image': lab.docker_image, Cmd: [], 'HostConfig': { PortBindings }, 'Env': lab.docker_env || [] }, (err, container) => {
        if (container) {
            container.start().then((container) => {
                res.json({ instanceId: container.id, Url: container.modem.host + ':' + port });
                port++;
            });
        }
        else
            res.json({ message: "Instance could not be created" });
    });
}


// @route POST /instances/start
// @desc Start an instance (create a docker container)
// @access Private
router.post('/start', verifyToken, (req, res) => {
    Lab.findOne({canonical_name: req.body.lab_name}).then((lab) => {
        if (lab)
        {
            let PortBindings = {};
            PortBindings[lab.docker_port] = [{ HostPort: port.toString() }];
            if (imageList.indexOf(lab.docker_image) !== -1) // If the image exists, simply create the instance
                startInstance(lab, PortBindings, res);
            else // Otherwise, pull the image and create the instance when the image is ready
                docker.createImage({fromImage: lab.docker_image}, (err, stream) => {
                    docker.modem.followProgress(stream, (err, resp) => {
                        startInstance(lab, PortBindings, res);
                    })
                    
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