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
let myDataChannel;

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
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[1];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
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

async function handleWelcomeSubmit(e) {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await callShow();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("join_cam", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    console.log(event.data);
  });
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});
socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) => {
      console.log(event.data);
    });
  });
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});
socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});
//RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          //개인 고유의 stun 서버가 필요하다
          //아래는 테스트용으로만 사용
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}
function handleAddStream(data) {
  const peersStream = document.getElementById("peerStream");
  peersStream.srcObject = data.stream;
}

//webRTC를 쓰면 안좋은 곳
//peer가 많은 곳 많아지면 느려지기 시작함.
//sfu 서버를 사용함 - 다른사람에게 저사양 화면을 제공
//data channel - 이미지 파일 텍스트을 주고 받을 수 있다.
