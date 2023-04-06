const messageList = document.querySelector("ul");
const nickNameForm = document.querySelector("#nickName");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);
// browser에 서버 연결
socket.addEventListener("open", () => {
  console.log("connect server :)");
});
// browser 통신
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
  console.log("server send this ", message.data);
});
// browser 서버 단절 및 새로고침
socket.addEventListener("close", () => {
  console.log("The server is disconnected or refreshing :(");
});

// //프론트에서 백으로 보냄
// setTimeout(() => {
//   socket.send("hello i'm browser");
// }, 1000);

function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg);
}

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  //   console.log(input.value);
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`;
  messageList.append(li);
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickNameForm.querySelector("input");
  //JSON으로 만들어 보냄
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickNameForm.addEventListener("submit", handleNickSubmit);
