const express = require("express");
const app = express();

const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const server = http.createServer(app);
const io = socketio(server);

const users = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register-user", (username) => {
    users[socket.id] = username;
    io.emit("update-user-count", Object.keys(users).length);
  });

  socket.on("send-location", (data) => {
    const username = users[socket.id] || "Anonymous";
    io.emit("recieve-location", {
      id: socket.id,
      username,
      ...data,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    delete users[socket.id];
    io.emit("user-disconnected", socket.id);
    io.emit("update-user-count", Object.keys(users).length);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

// server.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
