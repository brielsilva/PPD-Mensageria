const client = require('./connection');

const sensorsList = document.getElementById('sensorsList');
const messagesDiv = document.getElementById('messages');

let availableSensors = [];
let subscribedTopics = [];

client.on('connect', () => {
  client.subscribe('sensor/registration', { qos: 1 }, (err) => {
    if (!err) {
      console.log('Subscribed to sensor registration topic');
    }
  });
});

client.on('message', (topic, message) => {
  const topicParts = topic.split('/');
  if (topic === 'sensor/registration') {
    const sensorData = JSON.parse(message.toString());
    if (!availableSensors.includes(sensorData.id)) {
      const sensorContainer = document.createElement('div');
      sensorContainer.classList.add('sensor')
      const sensorType = document.createElement('div');
      const sensorButtons = document.createElement('div');
      sensorType.innerHTML = `
        <span>Sensor ID: ${sensorData.id}, Type: ${sensorData.type}</span>
      `;
      sensorButtons.innerHTML = `
        <button onclick="subscribeToSensor('${sensorData.id}')">Subscribe</button>
        <button class="unsub" onclick="unsubscribeFromSensor('${sensorData.id}')">Unsubscribe</button>
      `
      sensorContainer.appendChild(sensorType)
      sensorContainer.appendChild(sensorButtons)
      sensorsList.appendChild(sensorContainer);
      availableSensors.push(sensorData.id);
    }
  } else if (topicParts[2] === 'warning') {
    const warningData = JSON.parse(message.toString());
    const warningDiv = document.createElement('div');
    warningDiv.style.color = 'red';
    warningDiv.innerText = `WARNING from Sensor ID: ${warningData.id}, Type: ${warningData.type}: ${warningData.message}`;
    messagesDiv.appendChild(warningDiv);
  } else {
    const sensorData = JSON.parse(message.toString());
    const sensorValueSpan = document.getElementById(`value-${sensorData.id}`);
    if (sensorValueSpan) {
      sensorValueSpan.innerText = sensorData.currentValue;
    } else {
      const sensorDiv = document.createElement('div');
      const sensorDetails = document.createElement('div');
      sensorDiv.classList.add('sensor')
      sensorDetails.className = 'sensor-details';
      sensorDetails.innerHTML = `
        <div>Sensor ID: ${sensorData.id}</div>
        <div>Type: ${sensorData.type}</div>
        <div>Current Value: <span id="value-${sensorData.id}">${sensorData.currentValue}</span></div>
      `;
      //sensorDiv.innerText = `Sensor ID: ${sensorData.id}, Type: ${sensorData.type}, Value: ${sensorData.currentValue}`;
      sensorDiv.appendChild(sensorDetails)
      messagesDiv.appendChild(sensorDiv);
    }
  }
});

window.subscribeToSensor = function(sensorId) {
  if (!subscribedTopics.includes(sensorId)) {
    client.subscribe(`sensor/${sensorId}`, { qos: 1 }, (err) => {
      if (!err) {
        console.log(`Subscribed to sensor/${sensorId}`);
        subscribedTopics.push(sensorId);
        // Subscribe to warning topic
        client.subscribe(`sensor/${sensorId}/warning`, { qos: 1 }, (err) => {
          if (!err) {
            console.log(`Subscribed to sensor/${sensorId}/warning`);
          }
        });
      }
    });
  }
};

window.unsubscribeFromSensor = function(sensorId) {
  if (subscribedTopics.includes(sensorId)) {
    client.unsubscribe(`sensor/${sensorId}`, (err) => {
      if (!err) {
        console.log(`Unsubscribed from sensor/${sensorId}`);
        subscribedTopics = subscribedTopics.filter(topic => topic !== sensorId);
        clearMessagesForSensor(sensorId);
      }
    });
    // Unsubscribe from warning topic
    client.unsubscribe(`sensor/${sensorId}/warning`, (err) => {
      if (!err) {
        console.log(`Unsubscribed from sensor/${sensorId}/warning`);
      }
    });
  }
};

function clearMessagesForSensor(sensorId) {
  const children = Array.from(messagesDiv.children);
  children.forEach(child => {
    if (child.innerText.includes(`Sensor ID: ${sensorId}`)) {
      messagesDiv.removeChild(child);
    }
  });
}
