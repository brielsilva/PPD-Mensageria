const client = require("./connection")
// Tópico de registro onde todos os sensores se registram
const registrationTopic = 'sensor/registration';

// Função para limpar um tópico específico
function clearTopic(topic) {
  client.publish(topic, '', { retain: true }, (err) => {
    if (err) {
      console.error(`Failed to clear topic ${topic}:`, err);
    } else {
      console.log(`Cleared topic ${topic}`);
    }
  });
}

// Se conectar ao broker
client.on('connect', () => {
  console.log('Connected to broker');

  // Assinar o tópico de registro para obter a lista de sensores
  client.subscribe(registrationTopic, { qos: 1 }, (err) => {
    if (err) {
      console.error('Failed to subscribe to registration topic:', err);
    } else {
      console.log('Subscribed to registration topic');
    }
  });

  // Limpar o tópico de registro (incluindo a mensagem retida)
  clearTopic(registrationTopic);
});

// // Quando receber uma mensagem no tópico de registro
// client.on('message', (topic, message) => {
//   if (topic === registrationTopic) {
//     const sensorData = JSON.parse(message.toString());
//     const sensorTopic = `sensor/${sensorData.id}`;
//     const warningTopic = `sensor/${sensorData.id}/warning`;

//     // Limpar o tópico do sensor e o tópico de avisos
//     clearTopic(sensorTopic);
//     // clearTopic(warningTopic);
//   }
// });

// // Desconectar após limpar todos os tópicos
// client.on('close', () => {
//   console.log('Disconnected from broker');
// });

// Após algum tempo, desconectar do broker
setTimeout(() => {
  client.end();
}, 5000); // Aguarda 5 segundos para garantir que todos os tópicos sejam limpos
