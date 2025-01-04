const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const moment = require('moment-timezone');

app.use(express.static('public'));

const users = new Map();

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('system-message', {
      text: `${username} a rejoint le chat`,
      timestamp: moment().tz('America/Port-au-Prince').format('HH:mm')
    });
  });

  socket.on('chat-message', (message) => {
    const username = users.get(socket.id);
    io.emit('chat-message', {
      username,
      text: message,
      timestamp: moment().tz('America/Port-au-Prince').format('HH:mm'),
      sender: socket.id
    });
  });

  socket.on('voice-message', (audioBlob) => {
    const username = users.get(socket.id);
    io.emit('voice-message', {
      username,
      audio: audioBlob,
      timestamp: moment().tz('America/Port-au-Prince').format('HH:mm'),
      sender: socket.id
    });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      io.emit('system-message', {
        text: `${username} a quitté le chat`,
        timestamp: moment().tz('America/Port-au-Prince').format('HH:mm')
      });
      users.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});