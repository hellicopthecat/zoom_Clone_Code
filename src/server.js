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

function handleConnect(socket) {
  console.log(socket);
}

wss.on("connection", handleConnect);

const handleListen = () =>
  console.log(`✅ Listening on http://localhost:${port} ✅`);
server.listen(port, handleListen);
