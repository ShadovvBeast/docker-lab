const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const bcrypt = require('bcrypt');

const conf = require('./config');
const app = express();

const labs = require('./routes/labs');
const instances = require('./routes/instances');
const login = require('./routes/login');

app.use(bodyParser.json());


const Lab = require('./models/Lab');
const User = require('./models/User');
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