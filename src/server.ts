import express = require('express');
import mongoose = require('mongoose');
import bodyParser = require('body-parser');
import Docker = require('dockerode');
import bcrypt = require('bcrypt');

import Config from './config';
const conf = new Config();
const app = express();
import labs from './routes/labs';
const instances = require('./routes/instances');
import login from './routes/login';

app.use(bodyParser.json());


import {Lab, ILab} from './models/Lab';
import {User, IUser} from './models/User';
mongoose.connect(conf.mongodb_url, {useNewUrlParser: true}).then(() => {
    console.log('MongoDB Connected');
    const listCollections = mongoose.connection.db.listCollections();
    listCollections.toArray().then((collections) => {
        if(collections.length === 0)
        {
            // Initialize DB
            (new Lab({canonical_name: 'sql-lesson', docker_image: 'mysql:latest', title: 'SQL Introduction Lab”', docker_port: '3306/tcp', docker_env: ["MYSQL_ROOT_PASSWORD=" + conf.mysql_root_password]})).save();
            (new Lab({canonical_name: 'redis-lesson', docker_image: 'redis:latest', title: 'Introduction to Redis”', docker_port: '6379/tcp'})).save();
            (new Lab({canonical_name: 'jupyter-lesson', docker_image: 'jupyter/all-spark-notebook:latest', docker_port: '8888/tcp'})).save(); // Initialize a user to be used to get the token
            bcrypt.hash(conf.login_password, conf.bcrypt_salt_rounds).then((hash) => (new User({username: conf.login_user, password: hash})).save());
            console.log('DB Initalized');
        }
    });
}).catch(err => console.error(err));

app.use('/labs', labs);
app.use('/instances', instances);
app.use('/login', login);


app.listen(conf.port, () => console.log(`Server started on ${conf.port}`));