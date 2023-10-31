import http from "http";
import expess from "express";
import socketIo from "socket.io";

const app = expess();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", expess.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log("Server is Listening http://localhost:4300");
const server = http.createServer(app);
const wsServer = socketIo(server);

wsServer.on("connection", (socket) => {
  socket["nickname"] = "ANONYMOUS";
  socket.on("createRoom", (roomname, enterRoom) => {
    socket.join(roomname);
    enterRoom();
    socket.to(roomname).emit("Welcome", socket.nickname);
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("new_msg", (msg, room, done) => {
    socket.to(room).emit("new_msg", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nick) => (socket["nickname"] = nick));
});

server.listen(4300, handleListen);

// app.listen(4300, handleListen);
