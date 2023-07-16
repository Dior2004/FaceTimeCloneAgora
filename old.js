let shareLink = document.getElementById("shareLink");
let buttonContent = document.getElementById("buttonContent");
let videosSection = document.querySelector(".videos");
let myVideo = document.getElementById("myVideo");
let peersVideo = document.getElementById("peersVideo");

buttonContent.innerText = "Create Link";

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  document.getElementById("bgPlay").srcObject = localStream;
};

init();

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

// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};
// Agora client options
var options = {
  appid: null,
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
  if (options.appid && options.channel) {
    document.getElementById("channel").value = options.channel;
    document.getElementById("join-form").submit();
  }
});

shareLink.addEventListener("click", async function () {
  try {
    options.appid = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
    options.token = null;
    options.channel = "main";
    await join();
  } catch (error) {
    console.log(error);
  } finally {
    document.getElementById("leave").disabled = false;
  }
});

document.getElementById("leave").addEventListener("click", function (e) {
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
  localTracks.videoTrack.play("myVideo");
  document.getElementById(
    "local-player-name"
  ).textContent = `localVideo(${options.uid})`;

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
  document.getElementById("remote-playerlist").innerHTML = "";

  // leave the channel
  await client.leave();

  document.getElementById("local-player-name").textContent = "";
  document.getElementById("join").disabled = false;
  document.getElementById("leave").disabled = true;
  console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.subscribe(user, mediaType);
  console.log("subscribe success");
  if (mediaType === "video") {
    const playerWrapper = document.createElement("div");
    playerWrapper.id = `player-wrapper-${uid}`;
    playerWrapper.innerHTML = `
      <p class="player-name">remoteUser(${uid})</p>
      <div id="player-${uid}" class="player"></div>
    `;
    document.getElementById("remote-playerlist").appendChild(playerWrapper);
    user.videoTrack.play(`player-${uid}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  remoteUsers[id] = user;
  subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
  const id = user.uid;
  delete remoteUsers[id];
  document.getElementById(`player-wrapper-${id}`).remove();
}
