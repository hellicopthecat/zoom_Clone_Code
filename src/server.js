import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();
const port = 8000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => {
  res.render("home");
});

const handleListen = () =>
  console.log(`✅ Listening on http://localhost:${port} ✅`);

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

server.listen(port, handleListen);
