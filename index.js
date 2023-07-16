// create Agora client
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var remoteUsers = {};
// Agora client options
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
    document.getElementById("channel").value = options.channel;
    document.getElementById("join-form").submit();
  }
});

document
  .getElementById("join-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("join").disabled = true;
    try {
      options.appid = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
      options.channel = document.getElementById("channel").value;
      await join();
    } catch (error) {
      console.error(error);
    } finally {
      document.getElementById("leave").disabled = false;
    }
  });

document.getElementById("leave").addEventListener("click", function () {
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
  localTracks.videoTrack.play("local-player");

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
