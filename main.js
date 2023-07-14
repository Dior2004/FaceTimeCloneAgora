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

function copyUrlToClipboard() {
  var input = document.createElement("input");

  input.value = window.location.href;

  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

document
  .getElementById("shareLink")
  .addEventListener("click", copyUrlToClipboard);
