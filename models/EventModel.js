const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventName: String,
    eventDescription: String,
    clubName: String,
    scheduleDate: Date
});

const Event = new mongoose.model('Event', EventSchema);

module.exports = Event;
