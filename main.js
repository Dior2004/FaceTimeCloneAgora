let shareLink = document.getElementById("shareLink");
let buttonContent = document.getElementById("buttonContent");
let videosSection = document.querySelector(".videos");
let myVideo = document.getElementById("myVideo");
let peersVideo = document.getElementById("peersVideo");

buttonContent.innerText = "Create Link";

let APP_ID = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
let token = null;
let uid = Math.floor(Math.random() * 10000);

// client object that we login with
let client;
// this is the channel where two users join together
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    { urls: [`stun:stun1.l.google.com19302`, `stun:stun2.l.google.com19302`] },
  ],
};

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  document.getElementById("bgPlay").srcObject = localStream;
  myVideo.srcObject = localStream;

  createOffer();
};

init();

let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();
  peersVideo.srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack();
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log(event.candidate);
    }
  };

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log(offer);
};

// link sharing

function copyUrlToClipboard() {
  var input = document.createElement("input");

  input.value = window.location.href;

  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  buttonContent.innerText = "Created";
  shareLink.style = "background-color: #00f731b3";

  setTimeout(() => {
    videosSection.style = "scale: 1; transition: 0.5s;";
    setTimeout(() => {
      videosSection.style = "scale: 1; border-radius: 0px; transition: 0.5s;";
    }, 400);
  }, 500);
}

shareLink.addEventListener("click", copyUrlToClipboard);
