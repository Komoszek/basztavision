import React, {useState, useEffect, useReducer} from "react";
import { Link } from "react-router-dom";
import Logo from "../logo.svg";
import "./Recordings.scss";

const singleToDoubleDigit = n => n < 10 ? `0${n}` : n;

const nameToDate = timestamp => {
  var date = new Date(parseInt(timestamp));

  return `${singleToDoubleDigit(date.getHours())}:${singleToDoubleDigit(date.getMinutes())}:${singleToDoubleDigit(date.getSeconds())} ${singleToDoubleDigit(date.getDate())}.${singleToDoubleDigit(date.getMonth()+1)}.${date.getFullYear()}`;
}

function VideoListElement(props){
  return(<li><a className={props.isActive ? 'is-active' : ''} onClick={props.setActive}>{nameToDate(props.name.split(',')[0])}</a></li>);
}

function Recordings(){
  const [recordingPath, setRecordingPath] = useState(window.store.get('recording.path'));

  const [units, setUnits] = useState(window.electron.getUnits(recordingPath));

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [videos, setVideos] = useState(null);

  const [videoTime, setVideoTime] = useState(null);
  const [activeVideo, setActiveVideoData] = useState({name:null});

  const updateActiveVideo = name => setActiveVideoData({name:name,
                       start: name ? parseInt(name.split(',')[0]) : null
                     });

  //change to useReducer

    useEffect(() => {
      if(selectedUnit) {
        setVideos(window.electron.getVideos(`${recordingPath}/${selectedUnit}`));
        var watcher = window.electron.startWatcher(
          `${recordingPath}/${selectedUnit}`,
          {ignored: /^\./,ignoreInitial:true, persistent: true, cwd: `${recordingPath}/${selectedUnit}`},
          path => {
            setVideos(old => [...old, path]);
          },
          path => {
            setVideos(old => old.filter(e => e !== path));
          }
        );

      } else {
        updateActiveVideo(null);
        setVideos(null);
      }
      return(() => {
        console.log(watcher);
        if(watcher)
          window.electron.closeWatcher(watcher);
      })

    },[selectedUnit]);

    useEffect(() => {
      if(videos && videos.indexOf(activeVideo.name) === -1)
        updateActiveVideo(null);
    },[videos, activeVideo.name]);

    return (
      <div className="mainContainer">
        <div className="columns is-marginless">
            <div className="column is-narrow videoChooser">
            <div className="field">
              <div className="control">
                <div className="select is-link">
                  <select onChange={e => setSelectedUnit(e.target.value)}>
                    <option value="">Wybierz kamerę</option>
                    {units ? <>{units.map(e => <option key={e}>{e}</option>)}</> : <></>}
                  </select>
                </div>
              </div>
            </div>
              <aside className="menu">
              <p className="menu-label">
                Nagrania
              </p>
              <ul className="menu-list">
              {videos ? <>{videos.map(e => <VideoListElement key={e} isActive={e === activeVideo.name} setActive={() => updateActiveVideo(e)} name={e}/>)}</> : <></>}
              </ul>
              </aside>
            </div>
            <div className="column">
              {activeVideo.name ? <><video src={`file://${recordingPath}/${selectedUnit}/${activeVideo.name}`} onTimeUpdate={e => setVideoTime(parseInt(e.target.currentTime*1000))}
                controls autoPlay/><h2 className="title is-2">{nameToDate(activeVideo.start+videoTime)}</h2>
                <a className="button is-link" href={`file://${recordingPath}/${selectedUnit}/${activeVideo.name}`}>Zapisz nagranie</a></> : <></>}
            </div>
      </div>
      </div>
    );
}

export default Recordings
