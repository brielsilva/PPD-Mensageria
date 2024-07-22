const mqtt = require('mqtt');

const config = {
    protocol: "mqtt",
    host: "localhost",
    port: "1883",
};

let sensors = []; // List to hold sensors
let subscribedTopics = new Set(); // Set to hold subscribed topics

const clientId = "client" + Math.random().toString(36).substring(7);

const hostUrl = `${config.protocol}://${config.host}:${config.port}`;

const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
};

const client = mqtt.connect(hostUrl, options);

console.log(client)

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (err) => {
  console.error('Connection error: ', err);
  client.end();
});

module.exports = client;
