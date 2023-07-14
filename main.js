let shareLink = document.getElementById("shareLink");
let buttonContent = document.getElementById("buttonContent");
let videosSection = document.querySelector(".videos");

buttonContent.innerText = "Create Link";

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
