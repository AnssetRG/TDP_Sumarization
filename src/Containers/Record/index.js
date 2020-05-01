import React, { useState, useEffect, useRef, createRef } from "react";
import "./index.css";

const Home = () => {
  let [mediaRecorder, setMediaRecorder] = useState(null);
  let videoTag = useRef(null);
  var vidSave;
  let video = null;
  let chunks = [];
  let [recording, setRecording] = useState(false);
  const rendering = null;
  let REC_icon = createRef();
  let state = 0;

  const constraintObj = {
    audio: false,
    video: {
      facingMode: "user",
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
    },
  };
  function onChangeRECstate(event) {
    setRecording(!recording);
    console.log(recording);
  }
  async function changeStateREC(state) {
    setRecording(state);
    console.log(rendering);
  }

  function format() {
    return recording ? "REC" : "";
    //<p>{format()}</p>
  }

  function getUserMedia() {
    video = videoTag.current;
    navigator.mediaDevices
      .getUserMedia(constraintObj)
      .then((mediaStreamObject) => {
        if ("srcObject" in video) {
          video.srcObject = mediaStreamObject;
        } else {
          video.src = URL.createObjectURL(mediaStreamObject);
        }

        video.onloadedmetadata = () => {
          video.play();
        };

        mediaRecorder = new MediaRecorder(mediaStreamObject);
        chunks = [];

        mediaRecorder.ondataavailable = (ev) => {
          chunks.push(ev.data);
        };
        mediaRecorder.onstop = (ev) => {
          let blob = new Blob(chunks, { type: "video/mp4" });
          chunks = [];
          let videoUrl = window.URL.createObjectURL(blob);
          //videoSaveTag.current.href = videoUrl;
          vidSave = videoUrl;
        };
      })
      .catch((err) => console.error(err));
  }
  function onClickStart() {
    if (state == 0) {
      mediaRecorder.start();
      state = 1;
    } else {
      alert("Está grabando actualmente.");
    }

    //changeStateREC(true);
  }
  function onClickStop() {
    if (mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      state = 2;
      //changeStateREC(false);
    } else {
      alert('Presionar el boton "Grabar" primero.');
    }
  }
  function onClickDownload() {
    if (state == 0) {
      alert('Presionar el boton "Grabar" primero.');
      return;
    } else if (state == 1) {
      alert('En grabación. Presionar el botón "Grabar" primero');
      return;
    }
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = vidSave;
    var datetime = new Date();
    a.download = "video_" + datetime.toISOString().slice(0, 10) + ".mp4";
    a.click();
    window.URL.revokeObjectURL(vidSave);
  }
  useEffect(() => {
    getUserMedia();
  });
  return (
    <div className="record">
      <span className="record__title">
        Grabación<span> {format()}</span>
      </span>
      <video className="record__video-player" ref={videoTag} autoPlay />
      <div className="record__controls">
        <button onClick={onClickStart}>Grabar</button>
        <button onClick={onClickStop}>Parar</button>
        <button onClick={onClickDownload}>Descargar</button>
      </div>
    </div>
  );
};

export default Home;
