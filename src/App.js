import React, {useEffect, useState, useRef, useContext} from 'react';
import { Link } from "react-router-dom";
import logo from './logo.svg';
import './App.scss';
import ContextMenuContext from './ContextMenu-context';

var ctx = {};

function VideoGrabber() {

  useEffect(() => {
    let worker = window.electron.grabber.run(window.store.get('video.numberOfUnits'), window.store.get('video.path'),
      (err, result, data) => {
        if(ctx.hasOwnProperty(result.id)){
          ctx[result.id].putImageData(new ImageData(result.data, result.width, result.height), 0, 0);

          if(window.store.get('recording.enable')){
            if(!window.electron.isffmpegInstanceRunning(`camera${result.id}`))
              window.electron.newffmpeg(`camera${result.id}`, `${window.store.get('recording.path')}/camera${result.id}`, result.width, result.height);

            ctx[result.id].canvas.toBlob(blob => window.electron.writeFrame(`camera${result.id}`, blob.arrayBuffer()),'image/jpeg', window.store.get('recording.quality'));
          }
        }
    });
  },[]);

  return(<></>);
}

function ContextMenu(props) {
  const contextMenuRef = useRef(null);
  const contextmenu = useContext(ContextMenuContext);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const contextMenuClick = e => {
    if(e.target === contextMenuRef.current){
      props.setContextMenuId(null);

      window.store.set(`unit.camera${props.contextMenuId}`,
        {brightness: brightness, contrast: contrast});
    }
  }

  useEffect(() => {
    if(props.contextMenuId !== null){
      contextmenu.setUnits(old => {
        old[props.contextMenuId] = {brightness:brightness, contrast:contrast};
        return [...old];
      });
    }
  },[brightness, contrast]);

  useEffect(() => {
    if(props.contextMenuId !== null){
      setBrightness(contextmenu.units[props.contextMenuId].brightness);
      setContrast(contextmenu.units[props.contextMenuId].contrast);
    }

  },[props.contextMenuId]);

  return(
    <div ref={contextMenuRef} onClick={contextMenuClick} id="contextmenuContainer" className={props.contextMenuId !== null ? '' : "is-hidden"}>
      <div id="contextmenu" style={{top: contextmenu.top, left: contextmenu.left}} className="box">
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
  const contextmenu = useContext(ContextMenuContext);

  useEffect(() => {
      ctx[props.id] = canvasEl.current.getContext('2d');
      return(() => {
        delete ctx[props.id];
      })
  },[])

  useEffect(() => {
    if(canvasEl)
      canvasEl.current.style.filter = `brightness(${props.brightness}%) contrast(${props.contrast}%)`;
  },[props.brightness,props.contrast])

  const OpenContextMenu = e => {
    props.setContextMenuId(props.id);

    contextmenu.setTop(e.clientY);
    contextmenu.setLeft(e.clientX);
  }

  return (
          <div id={`camera${props.id}Container`} className={`cameraContainer ${props.fullscreen ? 'fullscreen' : ''}`}>
            <canvas onContextMenu={OpenContextMenu} onDoubleClick={() => props.setFullscreen(props.fullscreen ? null : props.id)}
            onDragStart={() => 0} id={`camera${props.id}`} ref={canvasEl} className="cameraFeed" height={props.height} width={props.width} />
          </div>
        );
}

function App() {
  const width = window.store.get('video.width');
  const height = window.store.get('video.height');

  const [units, setUnits] = useState(new Array(window.store.get('video.numberOfUnits')).fill(0)
  .map((e,i)=>(
      {brightness:window.store.get(`unit.camera${i}.brightness`, 100),
      contrast:window.store.get(`unit.camera${i}.contrast`, 100)
    })));

  const [fullscreenUnit, setFullscreenUnit] = useState(null);

  const [contextMenuId, setContextMenuId] = useState(null);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const value = {top, left, setTop, setLeft, units, setUnits};

  return (
    <ContextMenuContext.Provider value={value}>
      <VideoGrabber />
      <div id="mainCameraContainer" units={units.length}>
        {units ? units.map((e, i) => <React.Fragment key={`camera${i}`}><CameraCanvas fullscreen={fullscreenUnit === i} setFullscreen={setFullscreenUnit} id={i} brightness={e.brightness} contrast={e.contrast} width={width} height={height} setContextMenuId={setContextMenuId}/>
          {i%2 ? <div className="break"></div> : <></>}
        </React.Fragment>) : <></>}
      </div>
      <ContextMenu contextMenuId={contextMenuId} setContextMenuId={setContextMenuId}/>
    </ContextMenuContext.Provider>
  );
}

export default App;
