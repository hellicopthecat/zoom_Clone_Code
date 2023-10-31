import http from "http";
import expess from "express";
import io from "socket.io";

const app = expess();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", expess.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log("Server is Listening http://localhost:4300");
const server = http.createServer(app);

/* const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "ANON";
  console.log("open backend");
  socket.send(`${socket.nickname} is join`);
  socket.on("message", (msg) => {
    const {type, value} = JSON.parse(msg);

    switch (type) {
      case "msg":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${value}`)
        );
      case "nick":
        socket["nickname"] = value;
    }
  });
  socket.on("close", () => {
    console.log("front is disconneted");
  });
}); */
server.listen(4300, handleListen);

// app.listen(4300, handleListen);
