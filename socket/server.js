const { createServer } = require('http');
const io = require('socket.io');

const port = process.env.PORT || 8080;

const socketServer = createServer();
const ioServer = io(socketServer, {
  path: '/socket',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

if (process.env.ORIGINS) {
  const origins = process.env.ORIGINS.split(',');
  ioServer.origins(origins);
}

const room = 'room';
const connections = {};
connections[room] = {};

//  Socket Is Connected
ioServer.on('connection', socket => {
  console.log(`${socket.id} - connected`);

  //  Socket joins room
  socket.join(room, () => {

    console.log(`${socket.id} - joins ${room}`);

    //  Add socket to connections
    connections[room][socket.id] = {};

    //  Emit all peers in room to socket
    socket.emit('room_enter', { room, peers: connections[room] });

    //  Emit to room that a new peer joined
    ioServer.to(room).emit('peer_enter', { room, id: socket.id });

    // send private data
    // socket.on('data', ({ id, data }) => {
    //   console.log(`${socket.id} - sends data to ${id}`);
    //   socket.to(id).emit('data', data);
    // });

    //  TEMP
    socket.on('data', data => {
      console.log({ data })
      socket.broadcast.emit('data', data);
    });

    //  On disconnect
    //  TODO: split this into leave room and disconnect to allow multiple rooms
    socket.on('disconnect', () => {
      console.log(`${socket.id} - disconnected`);
      delete connections[room][socket.id];
      ioServer.to(room).emit('peer_disconnect', { room, id: socket.id });
    });

  });
});

socketServer.listen(port, err => {
  if (err) throw err;
  console.log(`> Socket Server ready on port ${port}`)
});
