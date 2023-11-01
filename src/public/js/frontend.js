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

//webRTC
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camSelect = document.getElementById("cameras");
let myStream;
let muted = false;
let camOff = false;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCam = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCam.label === camera.label) {
        option.selected = true;
      }
      camSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}
async function getMedia(deviceID) {
  const basicMode = {
    audio: true,
    video: {facingMode: "user"},
  };
  const changeMode = {
    audio: true,
    video: {
      deviceId: deviceID,
    },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      !deviceID ? basicMode : changeMode
    );
    if (!deviceID) {
      await getCameras();
    }

    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

function handleMuteBtn(e) {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "UNMUTE";
    muted = true;
  } else {
    muteBtn.innerText = "MUTE";
    muted = false;
  }
}

function handleCameraBtn(e) {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!camOff) {
    cameraBtn.innerText = "CAM ON";
    camOff = true;
  } else {
    cameraBtn.innerText = "CAM OFF";
    camOff = false;
  }
}

async function handleCamChange() {
  await getMedia(cameras.value);
}
muteBtn.addEventListener("click", handleMuteBtn);
cameraBtn.addEventListener("click", handleCameraBtn);
cameras.addEventListener("input", handleCamChange);

// cam chat
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const call = document.getElementById("call");
call.hidden = true;

async function callShow() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(e) {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, callShow);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("join_cam", async () => {
  const offer = await myPeerConnection.createOffer();
  console.log("offer is here");
  socket.on("offer", offer, roomName);
});
socket.on("offer", (offer) => {
  console.log(offer);
});
//RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}
