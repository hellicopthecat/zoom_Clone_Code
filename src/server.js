import express from "express";
import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";

const app = express();
const port = 8000;

const httpServer = http.createServer(app);
// const wss = new WebSocket.Server({server});
const wss = SocketIO(httpServer);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => {
  res.render("home");
});
app.get("/*", (_, res) => {
  res.redirect("/");
});

const handleListen = () =>
  console.log(`✅ Listening on http://localhost:${port} ✅`);
httpServer.listen(port, handleListen);

wss.on("connection", (socket) => {
  // 소켓의 관련된 모든 이벤트를 감시
  socket.onAny((event) => {
    console.log(`socket event : ${event}`);
  });

  // 방만들기 소켓을 프론트와 연동한다. 인자로는 방제목과 실행함수(꼭 아니여도 됨)를 프론트에서 받을 수 있게 한다.[1]
  socket.on("room_create", (roomname, done) => {
    //[1-2] 프론트의 받은 값으로 방에 들어가게 한다.
    //[1-3] 방이 생성되면 각 방마다 ID가 자동생성된다 (console.log(socket.id))
    socket.join(roomname);
    done();
    //[1-4] 방에 들어온 사람들에게 웰컴메세지를 보이기
    socket.to(roomname).emit("welcome");
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye");
    });
  });
  //[2-3] handleMsgSubit에서 받은 4개의 인자를 백엔드에 받아 프론트로 다시 넘겨줄 준비
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg);
    done();
  });
});
