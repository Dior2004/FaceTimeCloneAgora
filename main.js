let localStream;
let remoteStream;

let getLocalStream = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  document.getElementById("bgPlay").srcObject = localStream;
};

getLocalStream();
