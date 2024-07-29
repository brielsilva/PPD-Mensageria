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
      sensorContainer.classList.add('sensor');
      const sensorType = document.createElement('div');
      const sensorButtons = document.createElement('div');
      sensorType.innerHTML = `
        <span>Sensor ID: ${sensorData.id}, Type: ${sensorData.type}</span>
      `;
      sensorButtons.innerHTML = `
        <button onclick="subscribeToSensor('${sensorData.id}')">Subscribe</button>
        <button class="unsub" onclick="unsubscribeFromSensor('${sensorData.id}')">Unsubscribe</button>
      `;
      sensorContainer.appendChild(sensorType);
      sensorContainer.appendChild(sensorButtons);
      sensorsList.appendChild(sensorContainer);
      availableSensors.push(sensorData.id);
    }
  } else if (topicParts[2] === 'warning') {
    console.log("WARNING")
    const sensorData = JSON.parse(message.toString());
    const sensorValueSpan = document.getElementById(`value-${sensorData.id}`);
    const containerSensor = sensorValueSpan ? sensorValueSpan.parentElement : null;
    if (sensorValueSpan) {
      console.log("SENSORVALUESPAN")
      sensorValueSpan.innerText = `${sensorData.currentValue}`;
      if (containerSensor) {
        const warningDiv = containerSensor.parentElement.querySelector('.warning-message');
        console.log(warningDiv)
        if (!warningDiv) {
          const warnDiv = document.createElement('div');
          warnDiv.classList.add("warning-message")
          warnDiv.style.color = "red"
          warnDiv.innerText = `WARNING:${sensorData.message}`;
          containerSensor.parentElement.appendChild(warnDiv)
        }
      }
    } else {
      console.log("ELSE SENSORVALUESPAN")
      const sensorDiv = document.createElement('div');
      const sensorDetails = document.createElement('div');
      sensorDiv.classList.add('sensor');
      sensorDetails.className = 'sensor-details';
      sensorDetails.innerHTML = `
        <div>Sensor ID: ${sensorData.id}</div>
        <div>Type: ${sensorData.type}</div>
        <div>Current Value: <span id="value-${sensorData.id}">${sensorData.currentValue}</span></div>
        <div class="warning-message" style="color: red;">WARNING:${sensorData.message}</div>
      `;
      sensorDiv.appendChild(sensorDetails);
      messagesDiv.appendChild(sensorDiv);
    }
  } else {
    const sensorData = JSON.parse(message.toString());
    const sensorValueSpan = document.getElementById(`value-${sensorData.id}`);
    if (sensorValueSpan) {
      sensorValueSpan.innerText = sensorData.currentValue;
      const containerSensor = sensorValueSpan.parentElement;
      if (containerSensor) {
        const warningDiv = containerSensor.parentElement.querySelector('.warning-message');
        if (warningDiv) {
          containerSensor.parentElement.removeChild(warningDiv);
        }
      }
    } else {
      const sensorDiv = document.createElement('div');
      const sensorDetails = document.createElement('div');
      sensorDiv.classList.add('sensor');
      sensorDetails.className = 'sensor-details';
      sensorDetails.innerHTML = `
        <div>Sensor ID: ${sensorData.id}</div>
        <div>Type: ${sensorData.type}</div>
        <div>Current Value: <span id="value-${sensorData.id}">${sensorData.currentValue}</span></div>
      `;
      sensorDiv.appendChild(sensorDetails);
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
