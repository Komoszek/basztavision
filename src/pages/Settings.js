import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import Logo from "../logo.svg";
import "./Settings.scss";

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
  const [height, setHeight] = useState(window.store.get('video.height'));
  const [width, setWidth] = useState(window.store.get('video.width'));
  const [videoPath, setVideoPath] = useState(window.store.get('video.path'));
  const [numberOfUnits, setNumberOfUnits] = useState(window.store.get('video.numberOfUnits'));

  const [recordingEnable, setRecordingEnable] = useState(window.store.get('recording.enable'));
  const [recordingPath, setRecordingPath] = useState(window.store.get('recording.path'));
  const [recordingQuality, setRecordingQuality] = useState(window.store.get('recording.quality'));
  const [recordingCrf, setRecordingCrf] = useState(window.store.get('recording.crf'));
  const [recordingChunkLength, setRecordingChunkLength] = useState(window.store.get('recording.chunkLength'));
  const [recordingKeepTime, setRecordingKeepTime] = useState(window.store.get('recording.keepTime'));

  const submitSettings = () => {
    window.store.set('video.height', height);
    window.store.set('video.width', width);
    window.store.set('video.path', videoPath);
    window.store.set('video.numberOfUnits', numberOfUnits);

    window.store.set('recording.enable', recordingEnable);
    window.store.set('recording.path', recordingPath);
    window.store.set('recording.quality', recordingQuality);
    window.store.set('recording.crf', recordingCrf);
    window.store.set('recording.chunkLength', recordingChunkLength);
    window.store.set('recording.keepTime', recordingKeepTime);


    window.electron.relaunchApp();
  }

  const resetSettings = () => {
    window.store.clear();

    window.electron.relaunchApp();
  }

  const closeWindow = () => window.close();

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
