const socket = io();

const room = document.querySelector("#room form");
const roomInput = room.querySelector("input");
const message = document.getElementById("message");

message.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = message.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

//[2-2] 백엔드로 보내주기 위해 new_message , 값, 방위치, addMessage func를 보냄
function handleMsgSubmit(event) {
  event.preventDefault();
  const input = message.querySelector("input ");
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`YOU : ${input.value}`);
  });
  input.value = "";
}
function showRoom() {
  room.hidden = true;
  message.hidden = false;
  const h3 = message.querySelector("h3");
  h3.innerText = `Room Name is ${roomName}`;
  //[2-1] 메세지 기능
  const form = message.querySelector("form");
  form.addEventListener("submit", handleMsgSubmit);
}
//[1-1] emit으로 백엔드와 연결 하고 인풋의 값과 실행함수를 보내준다
function handleSubmit(event) {
  event.preventDefault();
  socket.emit("room_create", roomInput.value, showRoom);
  roomName = roomInput.value;
  roomInput.value = "";
}
room.addEventListener("submit", handleSubmit);

//[1-5] [1-4]구현 addMessage func 참조
socket.on("welcome", () => {
  addMessage("SOMEONE JOINED");
});
socket.on("bye", () => {
  addMessage("SOMEONE LEFT");
});
//[2-4] 백엔드에서 값을 받아와 화면에 적용
socket.on("new_message", addMessage);
