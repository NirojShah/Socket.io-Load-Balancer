const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const { default: mongoose } = require("mongoose");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

dotenv.config({ path: ".env" });
const mongodbPath = process.env.MONGO_ATLAS;
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: "*" }, // Temporary wildcard for testing
  path: "/socket.io/",
});

mongoose
  .connect(mongodbPath)
  .then(() => console.log("DATABASE CONNECTED SUCCESSFULLY"))
  .catch((err) => console.error("ERROR WHILE CONNECTING TO DATABASE", err));

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Connected to Redis for Socket.io Pub/Sub");
  })
  .catch((err) => {
    console.error("Redis Connection Error:", err);
    process.exit(1);
  });

io.on("connection", (socket) => {
  console.log(`New socket connected on port ${port}: ${socket.id}`);

  socket.on("joined chat", (room) => {
    console.log(`Socket ${socket.id} joined room ${room} on port ${port}`);
    socket.join(room);
    // io.in(room).allSockets().then((sockets) => {
    //   console.log(`Sockets in room ${room} on port ${port}:`, sockets);
    // });
  });

  socket.on("send_message", (data) => {
    console.log(`Socket ${socket.id} sending message to room ${data.id} on port ${port}`);
    socket.to(data.id).emit("recieved_message", { msg: data.msg, userId: data.userId });
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected from port ${port}`);
  });
});

server.listen(port, (err) => {
  if (err) {
    console.error("Something went wrong:", err);
  } else {
    console.log(`SERVER STARTED AT ${port}....`);
  }
});