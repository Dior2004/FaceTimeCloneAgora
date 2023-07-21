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
  }, 250);
});

createNewFaceTime.addEventListener("click", () => {
  document.querySelector(".wrap").style = "opacity: 0; transition: 0.5s";
  setTimeout(() => {
    createSection.style = "top: 0; transition: 0.5s;";
  }, 250);
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
  }, 250);
});

backJoin.addEventListener("click", () => {
  joinSection.style = "top: 100%; transition: 0.5s;";
  createSection.style = "display: flex";
  setTimeout(() => {
    document.querySelector(".wrap").style = "opacity: 1; transition: 0.5s";
  }, 250);
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
  }
});

// Creating a FaceTime call

createForm.addEventListener("submit", async function (e) {
  e.preventDefault();
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
    console.error(error);
  } finally {
    hangUp.disabled = false;
  }
});

// Answering a FaceTime call

joinForm.addEventListener("submit", async function (e) {
  e.preventDefault();

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
    console.error(error);
  } finally {
    hangUp.disabled = false;
  }
});

hangUp.addEventListener("click", function () {
  leave();
});

async function join() {
  // add event listener to play remote tracks when remote user publishes.
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] =
    await Promise.all([
      // join the channel
      client.join(options.appid, options.channel, options.token || null),
      // create local tracks, using microphone and camera
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

  // play local video track
  localTracks.videoTrack.play(myVideo);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("publish success");
}

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

  // document.getElementById("join").disabled = false;
  // hangUp.disabled = true;
  console.log("client leaves channel success");
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
  if (mediaType === "audio") {
    user.audioTrack.play();
  }

  let allVideos = document.querySelectorAll(".peersVideo");
  allVideos.forEach((list) =>
    list.addEventListener("click", () => {
      allVideos.forEach((i) => i.classList.remove("chosen"));
      list.classList.toggle("chosen");
    })
  );
}

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
