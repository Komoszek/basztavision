import React, {useEffect, useState, useRef} from 'react';
import { Link } from "react-router-dom";
import logo from './logo.svg';
import './App.scss';

const Store = window.require("electron-store");

const fs = window.require('fs');
const electron = window.require('electron');

const app = electron.app || electron.remote.app;

const isDev = window.require('electron-is-dev');

const grabber = window.require(`${app.getAppPath()}${isDev ? '' : '/../..'}/modules/grabber`);
const spawn = window.require('child_process').spawn;

const store = new Store();

const Minute = 60000;

var ffmpegInstance = {};

const newffmpeg = (id, path, width, height) => {
  if (!fs.existsSync(path))
    fs.mkdirSync(path, { recursive: true });

  ffmpegInstance[id] = spawn('ffmpeg',['-y', '-f', 'image2pipe','-use_wallclock_as_timestamps','1','-s', `${width}x${height}`, '-i', '-','-vsync', '0', '-vcodec', 'libx264','-crf', store.get('recording.crf'), `${path}/${Date.now()}.mkv`]);
  setTimeout(() => {
    var temp = ffmpegInstance[id];
    delete ffmpegInstance[id];
    temp.stdin.end();
  },parseInt(store.get('recording.chunkLength'))*Minute);
}

const writeFrame = async (id, blob) => {
  try {
    ffmpegInstance[id].stdin.write(Buffer.from(await blob.arrayBuffer()));
  } catch (e) {
    console.log(e);
  }
}
const getffmpeginstance = id => ffmpegInstance.hasOwnProperty(id);

var ctx = {};

function VideoGrabber() {
  let worker = grabber.run(store.get('video.numberOfUnits'), store.get('video.path'),
    (err, result) => {
      if(ctx.hasOwnProperty(result.id)){
        ctx[result.id].putImageData(new ImageData(new Uint8ClampedArray(result.data), result.width, result.height), 0, 0);

        if(store.get('recording.enable')){
          if(!getffmpeginstance(`camera${result.id}`))
            newffmpeg(`camera${result.id}`, `${store.get('recording.path')}/camera${result.id}`, result.width, result.height);

          document.getElementById(`camera${result.id}`).toBlob(blob => writeFrame(`camera${result.id}`, blob),'image/jpeg', store.get('recording.quality'));
        }
      }
  });

  return(<></>);
}

const updateImgFilter = (id, brightness, contrast) => {
  if(document.getElementById(id))
    document.getElementById(id).style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

function ContextMenu(props) {
  const contextMenuRef = useRef(null);
  const cameraName = `camera${props.contextMenuId}`;
  const [brightness, setBrightness] = useState(store.get(`unit.${cameraName}.brightness`, 100));
  const [contrast, setContrast] = useState(store.get(`unit.${cameraName}.contrast`, 100));

  const contextMenuClick = e => {
    if(e.target === contextMenuRef.current){
      props.setContextMenuId(null);

      store.set(`unit.${cameraName}`,{brightness: brightness,
                                         contrast: contrast});
    }
  }

  useEffect(() => {
    updateImgFilter(cameraName, brightness, contrast);
  },[brightness, contrast]);

  useEffect(() => {
    if(props.contextMenuId !== null){
      setBrightness(store.get(`unit.${cameraName}.brightness`, 100));
      setContrast(store.get(`unit.${cameraName}.contrast`, 100));
    }
  },[props.contextMenuId]);

  return(
    <div ref={contextMenuRef} onClick={contextMenuClick} id="contextmenuContainer" className={props.contextMenuId !== null ? '' : "is-hidden"}>
      <div id="contextmenu" className="box">
        <p id="contextmenuSpan">{`Kamera ${props.contextMenuId}`}</p>
        <p>Jasność</p>
        <input id="brightness-slider" className="slider is-fullwidth" step="1" min="0" max="300" type="range" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))}/>
        <p>Kontrast</p>
        <input id="contrast-slider" className="slider is-fullwidth" step="1" min="0" max="300" type="range" value={contrast}  onChange={e => setContrast(parseInt(e.target.value))}/>
        <br/>
        <button onClick={() => {setBrightness(100);setContrast(100)}}>Zresetuj wartości</button>
      </div>
    </div>
  );
}

function CameraCanvas(props) {
  const canvasEl = useRef(null);

  useEffect(() => {
    if(canvasEl){
      ctx[props.id] = canvasEl.current.getContext("2d");
      updateImgFilter(`camera${props.id}`,store.get(`unit.camera${props.id}.brightness`, 100),store.get(`unit.camera${props.id}.contrast`, 100));
    }
  },[canvasEl])

  const OpenContextMenu = e => {
    props.setContextMenuId(props.id);

    document.getElementById('contextmenu').style.top = `${e.clientY}px`;
    document.getElementById('contextmenu').style.left = `${e.clientX}px`;
  }

  return (
          <div id={`camera${props.id}Container`} className={`cameraContainer ${props.fullscreen ? 'fullscreen' : ''}`}>
            <canvas onContextMenu={OpenContextMenu} onDoubleClick={() => props.setFullscreen(props.fullscreen ? null : props.id)} onDragStart={() => false} id={`camera${props.id}`} ref={canvasEl} className="cameraFeed" height={props.height} width={props.width} />
          </div>
        );
}

function App() {
  const width = store.get('video.width');
  const height = store.get('video.height');
  const [units, setUnits] = useState(new Array(store.get('video.numberOfUnits')).fill(0));
  const [fullscreenUnit, setFullscreenUnit] = useState(null);

  const [contextMenuId, setContextMenuId] = useState(null);

  return (
    <>
      <VideoGrabber />
      <div id="mainCameraContainer" units={units.length}>
        {units ? units.map((e, i) => <React.Fragment key={`camera${i}`}><CameraCanvas fullscreen={fullscreenUnit === i} setFullscreen={setFullscreenUnit} id={i} width={width} height={height} setContextMenuId={setContextMenuId}/>
          {i%2 ? <div className="break"></div> : <></>}
        </React.Fragment>) : <></>}
      </div>
      <ContextMenu contextMenuId={contextMenuId} setContextMenuId={setContextMenuId}/>
    </>
  );
}

export default App;
