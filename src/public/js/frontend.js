const msgList = document.querySelector("ul");
const nickForm = document.querySelector("#nickName");
const msgForm = document.querySelector("#msgSend");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("this is front and connected");
});

socket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.innerText = `${msg.data}`;
  msgList.appendChild(li);
});

socket.addEventListener("close", () => {
  console.log("back is disconneted");
});

function makeMsg(type, value) {
  const msg = {type, value};
  return JSON.stringify(msg);
}

function handleSubmit(e) {
  e.preventDefault();
  const input = msgForm.querySelector("input");
  socket.send(makeMsg("msg", input.value));
  input.value = "";
}

function handleNickSub(e) {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMsg("nick", input.value));
  input.value = "";
}

msgForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSub);
