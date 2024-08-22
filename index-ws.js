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

process.on('SIGINT', () => {
  console.log('sigint');
  wss.clients.forEach(client => {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
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

  db.run(
  `INSERT INTO visitors (count, time)
      VALUES(${numOfClients}, datetime('now'))
  `);

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

  ws.on('error', function error() {
    //
  });
});

/* Begin database*/

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log('Shutting down db');
  db.close();
}