const client = require('./connection');
const sensorsList = document.getElementById('sensorsList');

client.on('connect', () => {
  client.subscribe('sensor/registration', { qos: 1 }, (err) => {
    if (!err) {
      console.log('Subscribed to sensor registration topic');
      client.publish('sensor/registration/request', 'Requesting existing sensors');
    }
  });
});

client.on('message', (topic, message) => {
  const topicParts = topic.split('/');
  if (topic === 'sensor/registration') {
    const sensorData = JSON.parse(message.toString());
    addSensorToList(sensorData);
  }
});

document.getElementById('sensorForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const type = document.getElementById('type').value;
  const currentValue = document.getElementById('currentValue').value;
  const minLimit = document.getElementById('minLimit').value;
  const maxLimit = document.getElementById('maxLimit').value;

  const sensorId = `${type}-${Date.now()}`;
  const sensor = {
    id: sensorId,
    type,
    currentValue: Number(currentValue),
    minLimit: Number(minLimit),
    maxLimit: Number(maxLimit)
  };

  client.publish(`sensor/${sensorId}`, JSON.stringify(sensor));
  client.publish('sensor/registration', JSON.stringify(sensor), { retain: true });

  addSensorToList(sensor);
});

function addSensorToList(sensor) {
  const sensorDiv = document.createElement('div');
  sensorDiv.id = sensor.id;
  sensorDiv.innerHTML = `
    <div>Sensor ID: ${sensor.id}, Type: ${sensor.type}</div>
    <label for="newValue-${sensor.id}">New Value:</label>
    <input type="number" id="newValue-${sensor.id}">
    <button onclick="updateSensorValue('${sensor.id}', ${sensor.minLimit}, ${sensor.maxLimit})">Update</button>
  `;
  sensorsList.appendChild(sensorDiv);
}

window.updateSensorValue = function(sensorId, minLimit, maxLimit) {
  const inputElement = document.getElementById(`newValue-${sensorId}`);
  const newValue = inputElement.value;
  if (newValue < minLimit || newValue > maxLimit) {
    alert(`Value must be between ${minLimit} and ${maxLimit}`);
  } else {
    const sensorDiv = document.getElementById(sensorId);
    const sensorType = sensorDiv.querySelector('div').innerText.split(', Type: ')[1];
    
    const sensorUpdate = {
      id: sensorId,
      type: sensorType,
      currentValue: Number(newValue)
    };

    client.publish(`sensor/${sensorId}`, JSON.stringify(sensorUpdate));

    if (Number(newValue) === minLimit) {
      client.publish(`sensor/${sensorId}/warning`, JSON.stringify({ id: sensorId, type: sensorType, message: `Value reached minimum limit: ${minLimit}`, currentValue: Number(newValue) }));
    } else if (Number(newValue) === maxLimit) {
      client.publish(`sensor/${sensorId}/warning`, JSON.stringify({ id: sensorId, type: sensorType, message: `Value reached maximum limit: ${maxLimit}`, currentValue: Number(newValue) }));
    }
  }
};

client.publish('sensor/registration/request', JSON.stringify({ action: 'fetch' }));
