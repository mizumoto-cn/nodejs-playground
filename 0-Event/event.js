var events = require('events');

var eventEmitter = new events.EventEmitter();

// connectionHandler
var connectionHandler = function connected() {
    console.log('connection successful.');

    // fire the data_received event
    eventEmitter.emit('data_received');
}

// bind the connection event with the handler
eventEmitter.on('connection', connectionHandler);

// bind the data_received event with the anonymous function
eventEmitter.on('data_received', function() {
    console.log('data received successfully.');
});

// fire the connection event
eventEmitter.emit('connection');

console.log('Program Ended.');