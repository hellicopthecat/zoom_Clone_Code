const socket = io();

const room = document.getElementById("room");
const roomForm = room.querySelector("form");
const chat = document.getElementById("chat");
const msgSendForm = document.getElementById("msgSend");
const roomList = document.getElementById("roomList");

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

function showRoom() {
  room.hidden = true;
  chat.hidden = false;
  const h4 = msgSendForm.querySelector("h4");
  h4.innerText = `Welcome to ${roomName}`;
  msgSendForm.addEventListener("submit", handleMsgSubmit);
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const nickInput = roomForm.querySelector("#nick");
  const roomInput = roomForm.querySelector("#room");
  socket.emit("createRoom", roomInput.value, showRoom);
  socket.emit("nickname", nickInput.value);
  roomName = roomInput.value;
}

roomForm.addEventListener("submit", handleRoomSubmit);

socket.on("Welcome", (user, newCount) => {
  const h4 = msgSendForm.querySelector("h4");
  h4.innerText = `Welcome to ${roomName} (${newCount})`;
  addMsg(`${user} JOIN This Room`);
});
socket.on("bye", (left, newCount) => {
  const h4 = msgSendForm.querySelector("h4");
  h4.innerText = `Welcome to ${roomName} (${newCount})`;
  addMsg(`${left} Left This Room`);
});
socket.on("new_msg", (msg) => {
  addMsg(msg);
});
socket.on("room_change", (rooms) => {
  const ul = roomList.querySelector("ul");
  ul.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    ul.appendChild(li);
  });
});
