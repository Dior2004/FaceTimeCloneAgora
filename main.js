let localStream;
let remoteStream;

let getLocalStream = async () => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Standard API
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    } else if (navigator.mozGetUserMedia) {
      // Firefox-specific API
      localStream = await new Promise((resolve, reject) => {
        navigator.mozGetUserMedia(
          {
            video: true,
            audio: false,
          },
          resolve,
          reject
        );
      });
    } else if (navigator.webkitGetUserMedia) {
      // WebKit (Safari) specific API
      localStream = await new Promise((resolve, reject) => {
        navigator.webkitGetUserMedia(
          {
            video: true,
            audio: false,
          },
          resolve,
          reject
        );
      });
    }

    document.getElementById("bgPlay").srcObject = localStream;
  } catch (error) {
    console.log("Error accessing camera:", error);
  }
};

getLocalStream();
