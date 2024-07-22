const client = require('./connection');
const sensorsList = document.getElementById('sensorsList');

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

  // Publicar dados do sensor
  client.publish(`sensor/${sensorId}`, JSON.stringify(sensor));

  // Publicar mensagem de registro do sensor como mensagem retida
  client.publish('sensor/registration', JSON.stringify(sensor), { retain: true });

  // Adicionar sensor à lista para atualização
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
  const newValue = document.getElementById(`newValue-${sensorId}`).value;
  if (newValue < minLimit || newValue > maxLimit) {
    alert(`Value must be between ${minLimit} and ${maxLimit}`);
    return;
  }

  const sensorDiv = document.getElementById(sensorId);
  const sensorType = sensorDiv.querySelector('div').innerText.split(', Type: ')[1];
  
  const sensorUpdate = {
    id: sensorId,
    type: sensorType,
    currentValue: Number(newValue)
  };

  // Publicar o novo valor do sensor
  client.publish(`sensor/${sensorId}`, JSON.stringify(sensorUpdate));

  // Publicar aviso se o valor for exatamente o limite superior ou inferior
  if (Number(newValue) === minLimit) {
    client.publish(`sensor/${sensorId}/warning`, JSON.stringify({ id: sensorId, type: sensorType, message: `Value reached minimum limit: ${minLimit}` }));
  } else if (Number(newValue) === maxLimit) {
    client.publish(`sensor/${sensorId}/warning`, JSON.stringify({ id: sensorId, type: sensorType, message: `Value reached maximum limit: ${maxLimit}` }));
  }
};
