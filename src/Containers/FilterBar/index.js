import "./index.css";
import filterIcon from "../../images/filter.svg";
import rolling from "../../images/rolling.svg";
// import rolling from './img/rolling.svg'

import React, { Component } from "react";
import { connect } from "react-redux";
import actions from "../../redux/actions";

import resultSuccessAudio from "./audio/resultado-encontrado.mp3";
import errorAudio from "./audio/error.mp3";
import waitPleaseAudio from "./audio/espere-porfavor.mp3";

class FilterBar extends Component {
  constructor() {
    super();
    this.state = {
      listening: false,
      recorder: null,
      audio_context: null,
    };
  }

  async init() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      let audio_context = new AudioContext();

      this.setState({ audio_context });
    } catch (err) {
      console.error(err.name, err.message, err);
      alert("No hay soporte de audio web en este navegador!!");
    }
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("ESTADO audio-context", this.state.audio_context.state);
    let input = this.state.audio_context.createMediaStreamSource(stream);
    let recorder = new window.Recorder(input);
    this.setState({ recorder });
  }

  componentDidUpdate = async () => {
    if (this.state.audio_context.state === "suspended") {
      await this.state.audio_context.resume();
    }
  };

  componentDidMount = async () => {
    await this.init();
  };

  toggleListen = () => {
    this.setState(
      {
        listening: !this.state.listening,
      },
      this.handleListen
    );
  };

  handleListen = async () => {
    let waitPlease = document.getElementById("waitPlease");
    if (this.state.audio_context.state === "suspended") {
      await this.state.audio_context.resume();
      console.log("Ahora esta", this.state.audio_context.state);
      // this.setState({ audio_context })
    }
    let { recorder } = this.state;
    if (this.state.listening) {
      recorder.record();
    } else {
      waitPlease.play();
      console.log("Al else");
      recorder.stop();
      this.createDownloadLink();
      recorder.clear();
    }
  };

  createDownloadLink = async () => {
    let waitPlease = document.getElementById("waitPlease");
    let sucessAud = document.getElementById("resultSuccess");
    let errorAud = document.getElementById("errorFail");

    this.props.setLoadingFilterTextVideoAction(true);
    let { recorder } = this.state;
    await recorder.exportWAV(async (blob) => {
      console.log("blob", blob);
      let result = new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      try {
        let audio = await result;
        console.log(audio);
        let b64 = audio.split(",")[1];
        let body = { data: b64 };
        let response = await fetch(
          "https://rest-speech-to-text.herokuapp.com/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        let data = await response.json();
        console.log(audio);
        console.log(data.result);
        this.props.setFilterTextVideoAction(data.result);
        this.props.setLoadingFilterTextVideoAction(false);
        waitPlease.pause();
        if (data.result === "") {
          errorAud.play();
        } else {
          sucessAud.play();
        }
        this.props.execFunc();
      } catch (error) {
        waitPlease.pause();
        errorAud.play();
        console.log(error);
      }
    });
  };

  onChangeHandler = (event) => {
    event.preventDefault();
    this.props.setFilterTextVideoAction(event.target.value);
  };

  render() {
    let { listening } = this.state;
    let searchBoxBtnListening = listening
      ? "search-box__btn-listening"
      : "search-box__btn";
    return (
      <div className="search-box">
        {/*<button className={searchBoxBtnListening} onClick={this.toggleListen}>
                    { !this.props.filterBar.loading ? <img src={filterIcon} height="50%" width="50%" alt="microphone-img"/> :
                    <img src={rolling} height="50%" width="50%" alt="microphone-img"/>}
                </button>
                <input className="search-box__txt" type="text" placeholder="Filtrar por segundos" value={this.props.filterBar.filterTextVideo} onChange={this.onChangeHandler}/>
                <audio id="waitPlease" style={{ diaplay: 'none'}} src={waitPleaseAudio}></audio>
                <audio id="resultSuccess" style={{ diaplay: 'none'}} src={resultSuccessAudio}></audio>
        <audio id="errorFail" style={{ diaplay: 'none'}} src={errorAudio}></audio>*/}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    filterBar: state.filterBar,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setFilterTextVideoAction(filterText) {
      dispatch(actions.setFilterTextVideoAction(filterText));
    },
    setLoadingFilterTextVideoAction(payload) {
      dispatch(actions.setLoadingFilterTextVideoAction(payload));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar);
