import express from "express";
import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";

const app = express();
const port = 8000;

const httpServer = http.createServer(app);
// const wss = new WebSocket.Server({server});
const wsServer = SocketIO(httpServer);

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
