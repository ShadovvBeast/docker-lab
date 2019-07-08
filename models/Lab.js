const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
    canonical_name: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    docker_image: {
        type: String,
        required: true
    },
    docker_port: {
        type: String,
        required: true
    },
    docker_env: {
        type: Array,
        of: String
    }
});

module.exports = Lab = mongoose.model('lab', LabSchema);