import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const port = 8000;

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => {
  res.render("home");
});
app.get("/*", (_, res) => {
  res.redirect("/");
});

//fake data base
const sockets = [];

wss.on("connection", (socket) => {
  // 서버에 연결하면 그 connection을 socktes의 array에 담음
  sockets.push(socket);
  //백엔드에서 프론트로 메세지를 보냄
  console.log("connect browser📍");
  socket.on("close", () => {
    console.log("disconnected by browser🚨");
  });
  //프론트에서 받음
  socket.on("message", (message) => {
    //각 브라우저를 eachSocket으로 표시하고 메세지를 보냄
    sockets.forEach((eachSocket) => eachSocket.send(message.toString()));
    console.log(message);
  });
});

const handleListen = () =>
  console.log(`✅ Listening on http://localhost:${port} ✅`);
server.listen(port, handleListen);
