
### README

# Simulador de Ambiente IoT

Este projeto é uma aplicação Electron para simular um ambiente IoT com sensores e clientes usando MQTT com Mosquitto para comunicação. Siga os passos abaixo para rodar o projeto.

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js e npm instalados

## Passos para rodar o projeto

1. Clone o repositório e navegue até a pasta do projeto.

```bash
git clone <URL-do-repositório>
cd <nome-da-pasta-do-projeto>
```

2. Rode o comando `docker compose up` dentro da pasta `mqtt` para iniciar o broker MQTT (Mosquitto).

```bash
cd mqtt
docker compose up
```

> Este passo é necessário para iniciar o broker MQTT, que será responsável por gerenciar as mensagens entre os sensores e os clientes.

3. Retorne à pasta principal do projeto e rode o comando `npm run clean` para limpar qualquer tópico que possa ter ficado de execuções passadas.

```bash
cd ..
npm run clean
```

4. Abra dois terminais separados e rode o comando `npm run start` em cada um deles.

```bash
npm run start
```

> Isso abrirá duas janelas da aplicação Electron. Em uma delas, selecione a opção **Sensor** e na outra, selecione **Clients**.

## Funcionamento

- **Sensor**: Esta tela simula um dispositivo sensor que envia dados para o broker MQTT.
- **Clients**: Esta tela simula um cliente que recebe os dados enviados pelo sensor através do broker MQTT.

Certifique-se de seguir os passos na ordem indicada para garantir que o ambiente esteja corretamente configurado.

## Problemas e Soluções

- Caso encontre problemas com o Docker, verifique se o serviço está corretamente instalado e rodando.
- Certifique-se de que as portas necessárias não estão em uso por outros serviços.

Se encontrar algum problema ou tiver dúvidas, sinta-se à vontade para abrir uma issue no repositório.