const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const isDocker = require('is-docker');
const bcrypt = require('bcrypt');

const docker = new Docker(isDocker() ? undefined : {host: '127.0.0.1', port: 2375});
const app = express();

const labs = require('./routes/labs');
const instances = require('./routes/instances');
const login = require('./routes/login');

app.use(bodyParser.json());

const conf = require('./config');

const Lab = require('./models/Lab');
const User = require('./models/User');
mongoose.connect(conf.mongodb_url, {useNewUrlParser: true}).then(() => {
    console.log('MongoDB Connected');

    const listCollections = mongoose.connection.db.listCollections();
    listCollections.toArray().then((collections) => {
        if(collections.length === 0)
        {
            // Initialize DB
            (new Lab({canonical_name: 'sql-lesson', docker_image: 'mysql', title: 'SQL Introduction Lab”', docker_port: '3306/tcp', docker_env: ["MYSQL_ROOT_PASSWORD=" + conf.mysql_root_password]})).save();
            (new Lab({canonical_name: 'redis-lesson', docker_image: 'redis', title: 'Introduction to Redis”', docker_port: '6379/tcp'})).save();
            (new Lab({canonical_name: 'jupyter-lesson', docker_image: 'jupyter/all-spark-notebook', docker_port: '8888/tcp'})).save();
            bcrypt.hash('Nimad123', conf.bcrypt_salt_rounds).then((hash) => (new User({username: 'admin', password: hash})).save());
            console.log('DB Initalized');
        }
    });
}).catch(err => console.error(err));

// Initialize Docker
docker.listContainers({all: true}).then(containers => containers.forEach((containerInfo) => docker.getContainer(containerInfo.Id).remove({force: true})));


app.use('/labs', labs);
app.use('/instances', instances);
app.use('/login', login);


app.listen(conf.port, () => console.log(`Server started on ${conf.port}`));