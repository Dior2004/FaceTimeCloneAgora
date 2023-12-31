let createNewFaceTime = document.getElementById("newFaceTime");
let channelCreate = document.getElementById("channelCreate");
let createForm = document.getElementById("create-form");
let joinForm = document.getElementById("join-form");
let hangUp = document.getElementById("hangUp");
let videoDisplay = document.getElementById("videoDisplay");
let createSection = document.querySelector("#createSection");
let joinSection = document.querySelector("#joinSection");
let myVideo = document.getElementById("myVideo");
let peersVideo = document.getElementById("peersVideo");
let myVideoPlayer = document.getElementById("myVideoPlayer");
let muteAudio = document.getElementById("muteAudio");
let muteVideo = document.getElementById("muteVideo");

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  document.getElementById("bgPlay").srcObject = localStream;
};

init();

// smooth animations

joinFaceTime.addEventListener("click", () => {
  document.querySelector(".wrap").style = "opacity: 0; transition: 0.5s";
  setTimeout(() => {
    joinSection.style = "top: 0; transition: 0.5s;";
  }, 100);
  setTimeout(() => {
    channelJoin.focus();
  }, 700);
});

createNewFaceTime.addEventListener("click", () => {
  document.querySelector(".wrap").style = "opacity: 0; transition: 0.7s";
  setTimeout(() => {
    createSection.style = "top: 0; transition: 0.6s;";
  }, 100);
  setTimeout(() => {
    channelCreate.focus();
  }, 700);
});

channelCreate.addEventListener("focus", () => {
  document.querySelector(".wrap").style = "opacity: 0;";
  joinSection.style = "display: none";
  createSection.style = "top: 0;";
});

channelJoin.addEventListener("focus", () => {
  document.querySelector(".wrap").style = "opacity: 0;";
  joinSection.style = "top: 0;";
  createSection.style = "display: none";
});

backCreate.addEventListener("click", () => {
  createSection.style = "top: 100%; transition: 0.5s;";
  joinSection.style = "display: flex";
  setTimeout(() => {
    document.querySelector(".wrap").style = "opacity: 1; transition: 0.5s";
  }, 100);
});

backJoin.addEventListener("click", () => {
  joinSection.style = "top: 100%; transition: 0.5s;";
  createSection.style = "display: flex";
  setTimeout(() => {
    document.querySelector(".wrap").style = "opacity: 1; transition: 0.5s";
  }, 100);
});

// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};

var options = {
  appid: "62c1bcd773ea4592bb4f0f5ff8ad6b2e",
  channel: null,
  uid: null,
  token: null,
};

// the demo can auto join channel with params in url

window.addEventListener("DOMContentLoaded", function () {
  var urlParams = new URL(location.href).searchParams;
  options.appid = urlParams.get("appid");
  options.channel = urlParams.get("channel");
  options.token = urlParams.get("token");
  if (options.channel) {
    document.getElementById("appid").value = options.appid;
    channelCreate.value = options.channel;
    createForm.submit();
    joinForm.submit();
  }
});

// Creating a FaceTime call

createForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  channelCreate.blur();

  const title = window.document.title;
  const roomName = channelCreate.value;
  const url = window.document.location.href;

  if (navigator.share) {
    navigator
      .share({
        title: `${title}`,
        text: `You have been called to Room: ${roomName}`,
        url: `${url}`,
      })
      .then(() => {
        console.log("shared successfully");
      })
      .catch((error) => console.log(error));
  }

  setTimeout(() => {
    videoDisplay.style = "scale: 1; transition: 0.5s;";
    setTimeout(() => {
      videoDisplay.style = "scale: 1; border-radius: 0px; transition: 0.5s;";
    }, 500);
  }, 100);

  document.getElementById("join").disabled = true;
  try {
    options.appid = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
    options.channel = channelCreate.value;
    await join();
  } catch (error) {
    console.log(error);
  }
});

// Answering a FaceTime call

joinForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  channelJoin.blur();

  setTimeout(() => {
    videoDisplay.style = "scale: 1; transition: 0.5s;";
    setTimeout(() => {
      videoDisplay.style = "scale: 1; border-radius: 0px; transition: 0.5s;";
    }, 500);
  }, 100);

  document.getElementById("join").disabled = true;
  try {
    options.appid = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
    options.channel = channelJoin.value;
    await join();
  } catch (error) {
    console.log(error);
  }
});

async function join() {
  // add event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  options.uid = await client.join(
    options.appid,
    options.channel,
    options.token || null
  );

  // Create separate local tracks for audio and video
  localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  myVideoPlayer.srcObject = localStream;

  await client.publish(Object.values(localTracks));
}

hangUp.addEventListener("click", leave);

async function leave() {
  for (var trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
  }

  // remove remote users and player views
  remoteUsers = {};

  // leave the channel
  await client.leave();

  document.getElementById("join").disabled = false;
  console.log("client leaves channel success");

  videoDisplay.style = "scale: 0; border-radius: 20px; transition: 0.3s;";
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === "video") {
    const newPeerVideo = document.createElement("div");
    newPeerVideo.id = `peersVideo-${uid}`;
    newPeerVideo.className = `peersVideo`;
    document.getElementById("video-flex").appendChild(newPeerVideo);
    user.videoTrack.play(`peersVideo-${uid}`);
  }

  let allVideos = document.querySelectorAll(".peersVideo");
  allVideos.forEach((i) => i.classList.remove("chosen"));

  lastChildDetection();

  allVideos.forEach((list) =>
    list.addEventListener("click", () => {
      allVideos.forEach((i) => i.classList.remove("chosen"));
      list.classList.toggle("chosen");
    })
  );

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
}

let allVideos = document.querySelectorAll(".peersVideo");

lastChildDetection();

allVideos.forEach((list) =>
  list.addEventListener("click", () => {
    allVideos.forEach((i) => i.classList.remove("chosen"));
    list.classList.toggle("chosen");
  })
);

function lastChildDetection() {
  let fatherEllement = document.querySelector("#video-flex");

  let lastElementChild = null;
  let currentNode = fatherEllement.lastChild;

  while (currentNode !== null) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      lastElementChild = currentNode;
      break;
    }
    currentNode = currentNode.previousSibling;
  }

  lastElementChild.classList.add("chosen");
}

// Function to handle the mutation
function handleMutation(mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      // Call the lastChildDetection function whenever a new element is added
      lastChildDetection();
    }
  }
}

// The element that needs to be observed for changes
const fatherEllement = document.querySelector("#video-flex");

// Creating a new Mutation Observer
const observer = new MutationObserver(handleMutation);

// Options for the observer (watch for changes in the direct children of the target element)
const observerOptions = {
  childList: true,
  subtree: false,
};

// Sarting to observe the target element
observer.observe(fatherEllement, observerOptions);

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  document.getElementById(`peersVideo-${id}`).remove();
}

// Variables to keep track of mute status
// let isAudioMuted = false;

// muteAudio.addEventListener("click", () => {
//   isAudioMuted = !isAudioMuted;
//   localTracks.audioTrack.setEnabled(!isAudioMuted);
//   muteAudio.innerHTML = isAudioMuted
//     ? `<i class="fa-solid fa-microphone-slash"></i>`
//     : `<i class="fa-solid fa-microphone"></i>`;
// });

let isVideoMuted = false;

muteVideo.addEventListener("click", () => {
  isVideoMuted = !isVideoMuted;
  localTracks.videoTrack.setEnabled(!isVideoMuted);
  muteVideo.innerHTML = isVideoMuted
    ? `<i class="fa-solid fa-video-slash"></i>`
    : `<i class="fa-solid fa-video"></i>`;
});
