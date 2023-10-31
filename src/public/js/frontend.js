const socket = io();

const room = document.getElementById("room");
const roomForm = room.querySelector("form");
const chat = document.getElementById("chat");
const msgSendForm = document.getElementById("msgSend");
const nickForm = document.getElementById("nickName");

chat.hidden = true;
let roomName;

function addMsg(msg) {
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMsgSubmit(e) {
  e.preventDefault();
  const input = msgSendForm.querySelector("input");
  const value = input.value;
  socket.emit("new_msg", input.value, roomName, () => {
    addMsg(`You: ${value}`);
  });
  input.value = "";
}
function handleNickSubmit(e) {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.emit("nickname", input.value);
}

function showRoom() {
  room.hidden = true;
  chat.hidden = false;
  const h4 = msgSendForm.querySelector("h4");
  h4.innerText = `Welcome to ${roomName}`;
  msgSendForm.addEventListener("submit", handleMsgSubmit);
  nickForm.addEventListener("submit", handleNickSubmit);
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const input = roomForm.querySelector("input");
  socket.emit("createRoom", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}
roomForm.addEventListener("submit", handleRoomSubmit);

socket.on("Welcome", (user) => {
  addMsg(`${user} JOIN This Room`);
});
socket.on("bye", (left) => {
  addMsg(`${left} Left This Room`);
});
socket.on("new_msg", (msg) => {
  addMsg(msg);
});
