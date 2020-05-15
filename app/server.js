const { createServer } = require('http');
const { parse } = require('url');
const io = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = dev ? 3000 : 80;
const socketPort = 8080;
const app = next({ dev });
const handle = app.getRequestHandler();

const log = msg => {
  if (dev) {
    console.log(msg);
  }
};

app.prepare().then(() => {
  
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, err => {
    if (err) throw err;
    log(`> Ready on http://localhost:${port}`)
  });

  const socketServer = createServer();
  const ioServer = io(socketServer, {
    path: '/socket',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

  const room = 'room';
  const connections = {};
  connections[room] = {};

  //  Socket Is Connected
  ioServer.on('connection', socket => {
    log(`${socket.id} - connected`);

    //  Socket joins room
    socket.join(room, () => {

      log(`${socket.id} - joins ${room}`);
      
      //  Add socket to connections
      connections[room][socket.id] = {};

      //  Emit all peers in room to socket
      socket.emit('room_enter', { room, peers: connections[room] });
      
      //  Emit to room that a new peer joined
      ioServer.to(room).emit('peer_enter', { room, id: socket.id }); 

      // send private data
      // socket.on('data', ({ id, data }) => {
      //   log(`${socket.id} - sends data to ${id}`);
      //   socket.to(id).emit('data', data);
      // });

      //  TEMP
      socket.on('data', data => {
        log({data})
        socket.broadcast.emit('data', data);
      });

      //  On disconnect
      //  TODO: split this into leave room and disconnect to allow multiple rooms
      socket.on('disconnect', () => {
        log(`${socket.id} - disconnected`);
        delete connections[room][socket.id];
        ioServer.to(room).emit('peer_disconnect', { room, id: socket.id });
      });

    });
  });

  socketServer.listen(socketPort, err => {
    if (err) throw err;
    log(`> Socket Server ready on http://localhost:${socketPort}`)
  });

})