const isDocker = require('is-docker');

module.exports = {
    port: 3000,
    mongodb_url: isDocker() ? 'mongodb://mongo:27017/dockerlab' : 'mongodb://localhost:27017/dockerlab',
    bcrypt_salt_rounds: 10,
    docker_base_port: 12000, // This will be the base port to be used by the docker containers
    mysql_root_password: '1s2e3c4r5e6t',
    jwt_secret: 'TJ9rz4i39aS4AqNJWOIsqeo75Hw5mOvA',
}

