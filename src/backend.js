import http from "http";
import expess from "express";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";

const app = expess();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", expess.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log("Server is Listening http://localhost:3000");
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
  mode: "development",
});

function publicRooms() {
  const {
    sockets: {
      adapter: {sids, rooms},
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", (socket) => {
  socket["nickname"] = "ANONYMOUS";
  // chat
  socket.on("createRoom", (roomname, enterRoom) => {
    socket.join(roomname);
    enterRoom();
    socket.to(roomname).emit("Welcome", socket.nickname, countRoom(roomname));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_msg", (msg, room, done) => {
    socket.to(room).emit("new_msg", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nick) => (socket["nickname"] = nick));
  //webRTC
  socket.on("join_room", (roomname, show) => {
    socket.join(roomname);
    show();
    socket.to(roomname).emit("join_cam");
  });
  socket.on("offer", (offer, roomname) => {
    socket.to(roomname).emit("offer", offer);
  });
});

httpServer.listen(3000, handleListen);
