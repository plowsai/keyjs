const mongoose = require('mongoose');

const monitoringSchema = new mongoose.Schema({
    token: String,
    timestamp: Date
});

const Monitoring = mongoose.model('Monitoring', monitoringSchema);