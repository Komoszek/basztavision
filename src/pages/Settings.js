import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import Logo from "../logo.svg";
import "./Settings.scss";

const Store = window.require("electron-store");

const electron = window.require("electron");

const store = new Store();

const app = electron.app || electron.remote.app;
const remote = electron.remote;

function TextField({fieldLabel, ...rest}){
  return(<div className="field">
        <label className="label">{fieldLabel}</label>
      <div className="control">
        <input className="input" {...rest}/>
      </div>
  </div>)
}

function ToggleSwitch({fieldLabel, id, ...rest}){
  return(<div className="field">
        <input id={id} type="checkbox" name={id} className="switch is-rtl" {...rest}/>
        <label htmlFor={id}>{fieldLabel}</label>
  </div>)
}

function Settings(){
  const [height, setHeight] = useState(store.get('video.height'));
  const [width, setWidth] = useState(store.get('video.width'));
  const [videoPath, setVideoPath] = useState(store.get('video.path'));
  const [numberOfUnits, setNumberOfUnits] = useState(store.get('video.numberOfUnits'));

  const [recordingEnable, setRecordingEnable] = useState(store.get('recording.enable'));
  const [recordingPath, setRecordingPath] = useState(store.get('recording.path'));
  const [recordingQuality, setRecordingQuality] = useState(store.get('recording.quality'));
  const [recordingCrf, setRecordingCrf] = useState(store.get('recording.crf'));
  const [recordingChunkLength, setRecordingChunkLength] = useState(store.get('recording.chunkLength'));
  const [recordingKeepTime, setRecordingKeepTime] = useState(store.get('recording.keepTime'));

  const submitSettings = () => {
    store.set('video.height', height);
    store.set('video.width', width);
    store.set('video.path', videoPath);
    store.set('video.numberOfUnits', numberOfUnits);

    store.set('recording.enable', recordingEnable);
    store.set('recording.path', recordingPath);
    store.set('recording.quality', recordingQuality);
    store.set('recording.crf', recordingCrf);
    store.set('recording.chunkLength', recordingChunkLength);
    store.set('recording.keepTime', recordingKeepTime);

    app.relaunch()
    app.exit();
  }

  const resetSettings = () => {
    store.clear();

    app.relaunch();
    app.exit();
  }

  const closeWindow = () => remote.getCurrentWindow().close();
    return (
      <div className="settingsContainer">
      <TextField fieldLabel="Wysokość" type="number" min="1" value={height} onChange={e => setHeight(parseInt(e.target.value))} required/>
      <TextField fieldLabel="Szerokość" type="number" min="1" value={width} onChange={e => setWidth(parseInt(e.target.value))}/>
      <TextField fieldLabel="Ścieżka do kamer" type="text" value={videoPath} onChange={e => setVideoPath(e.target.value)}/>
      <TextField fieldLabel="Liczba Kamer" type="number" min="1" value={numberOfUnits} onChange={e => setNumberOfUnits(parseInt(e.target.value))}/>
      <br/>
      <ToggleSwitch id="recordingSwitch" fieldLabel="Nagrywanie kamer" checked={recordingEnable} onChange={e => {setRecordingEnable(e.target.checked)}}/>
      {recordingEnable ? <>
        <TextField fieldLabel="Ścieżka do nagrań" type="text" value={recordingPath} onChange={e => setRecordingPath(e.target.value)}/>
        <TextField fieldLabel="Jakość klatek" type="number" min="0" step="0.1" max="1" value={recordingQuality} onChange={e => setRecordingQuality(parseFloat(e.target.value))}/>
        <TextField fieldLabel="CRF" type="number" value={recordingCrf} min="0" max="51" onChange={e => setRecordingCrf(parseInt(e.target.value))}/>
        <TextField fieldLabel="Długość pojedynczego nagrania (minuty)" type="number" value={recordingChunkLength} min="0" onChange={e => setRecordingChunkLength(parseInt(e.target.value))}/>
        <TextField fieldLabel="Czas przetrzymywania nagrania (godziny)" type="number" value={recordingKeepTime} min="0" onChange={e => setRecordingKeepTime(parseInt(e.target.value))}/>
        </> :<></>}
      <div className="field is-grouped">
        <div className="control">
          <button className="button is-link" onClick={submitSettings}>Zapisz</button>
        </div>
        <div className="control">
          <button className="button is-link is-light" onClick={closeWindow} >Anuluj</button>
        </div>
        </div>
          <div className="control">
            <button className="button is-danger" onClick={resetSettings} >Zresetuj ustawienia</button>
          </div>
      </div>
    )
}

export default Settings
