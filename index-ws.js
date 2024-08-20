const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

/* WebSocket */

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({server: server});

wss.broadcast = function broadcast(data) {
  console.log(`Broadcasting: ${data}`);
  wss.clients.forEach(client => {
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  const numOfClients = wss.clients.size;

  console.log(`Clients connected: ${numOfClients}`);

  wss.broadcast(`Current visitors: ${numOfClients}`);

  if (ws.readyState == ws.OPEN) {
    ws.send('Welcome!');
  }

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

  ws.on('error', function error() {
    //
  });
});