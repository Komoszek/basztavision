// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var ctx = {};

var click = {};
var clickTimeout = {};
var cameraRecordStack = {};

var config,
  cameraHeight,
  cameraWidth,
  cameraPath,
  numberOfCameras,
  videoRecording,
  videoRecordDuration,
  videoDeleteTime,
  videoPath;

  var ContextMenuContainer = document.getElementById('contextmenuContainer');
  var ContextMenu = document.getElementById('contextmenu');


FocusedCamera = null;

ContextMenuContainer.onclick = e => {
  if(e.target === ContextMenuContainer){
    ContextMenuContainer.classList.add('is-hidden');
    if(!config.cameras)
      config.cameras = {};

    config.cameras[FocusedCamera].brightness = document.getElementById('brightness-slider').value;
    config.cameras[FocusedCamera].contrast = document.getElementById('contrast-slider').value;

    fs.writeFileSync('./config.ini', ini.stringify(config));

  }
}

if(fs.existsSync('./config.ini')){
  var wasAnyUndefined = false;
  config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

  if (!config.hasOwnProperty('cameraOptions')){
    wasAnyUndefined = true;

    cameraHeight = 480;
    cameraWidth = 640;
    cameraPath = '/dev/video0';
    numberOfCameras = 2;

    config.cameraOptions = {};
    config.cameraOptions.cameraHeight = cameraHeight;
    config.cameraOptions.cameraWidth = cameraWidth;
    config.cameraOptions.cameraPath = cameraPath;
    config.cameraOptions.numberOfCameras = numberOfCameras;
  } else {
    if(config.cameraOptions.hasOwnProperty('cameraHeight')){
      cameraHeight = config.cameraOptions.cameraHeight;
    } else {
      wasAnyUndefined = true;

      cameraHeight = 480;
      config.cameraOptions.cameraHeight = cameraHeight;
    }

    if(config.cameraOptions.hasOwnProperty('cameraWidth')){
      cameraWidth = config.cameraOptions.cameraWidth;
    } else {
      wasAnyUndefined = true;

      cameraWidth = 640;
      config.cameraOptions.cameraWidth = cameraWidth;
    }

    if(config.cameraOptions.hasOwnProperty('cameraPath')){
      cameraPath = config.cameraOptions.cameraPath;
    } else {
      wasAnyUndefined = true;

      cameraPath = '/dev/video0';
      config.cameraOptions.cameraPath = cameraPath;
    }

    if(config.cameraOptions.hasOwnProperty('numberOfCameras')){
      if(config.cameraOptions.numberOfCameras < 5 && config.cameraOptions.numberOfCameras > 0){
        numberOfCameras = config.cameraOptions.numberOfCameras;
      } else {
        numberOfCameras = config.cameraOptions.numberOfCameras > 4 ? 4 : 1
        config.cameraOptions.numberOfCameras = numberOfCameras;
        wasAnyUndefined = true;

      }
    } else {
      wasAnyUndefined = true;

      numberOfCameras = 2;
      config.cameraOptions.numberOfCameras = numberOfCameras;
    }
  }

  if (!config.hasOwnProperty('recordingOptions')){
    wasAnyUndefined = true;

    videoRecording = true;
    videoRecordDuration = 1;
    videoDeleteTime = 7;
    videoPath = '~/Nagrania';

    config.recordingOptions = {};
    config.recordingOptions.videoRecording = videoRecording;
    config.recordingOptions.videoRecordDuration = videoRecordDuration;
    config.recordingOptions.videoDeleteTime = videoDeleteTime;
    config.recordingOptions.videoPath = videoPath;
  } else {
    if(config.recordingOptions.hasOwnProperty('videoRecording')){
      videoRecording = config.recordingOptions.videoRecording;
    } else {
      wasAnyUndefined = true;

      videoRecording = false;
      config.recordingOptions.videoRecording = videoRecording;
    }

    if(config.recordingOptions.hasOwnProperty('videoRecordDuration')){
      videoRecordDuration = config.recordingOptions.videoRecordDuration;
    } else {
      wasAnyUndefined = true;

      videoRecordDuration = 1;
      config.recordingOptions.videoRecordDuration = videoRecordDuration;
    }

    if(config.recordingOptions.hasOwnProperty('videoDeleteTime')){
      videoDeleteTime = config.recordingOptions.videoDeleteTime;
    } else {
      wasAnyUndefined = true;

      videoDeleteTime = 7;
      config.recordingOptions.videoDeleteTime = videoDeleteTime;
    }

    if(config.recordingOptions.hasOwnProperty('videoPath')){
      videoPath = config.recordingOptions.videoPath;
    } else {
      wasAnyUndefined = true;

      videoPath = '~/Nagrania';
      config.recordingOptions.videoPath = videoPath;
    }
  }

  if(wasAnyUndefined)
    fs.writeFileSync('./config.ini', ini.stringify(config));

} else {

  cameraHeight = 480;
  cameraWidth = 640;
  cameraPath = '/dev/video0';
  numberOfCameras = 2;
  videoRecording = false;
  videoRecordDuration = 1; // Create 1 minute recording
  videoDeleteTime = 7; // Keep data of last 7 days
  videoPath = '~/Nagrania';

    config = {};
    config.cameraOptions = {};
    config.cameraOptions.cameraHeight = cameraHeight;
    config.cameraOptions.cameraWidth = cameraWidth;
    config.cameraOptions.cameraPath = cameraPath;
    config.cameraOptions.numberOfCameras = numberOfCameras;
    config.cameraOptions.videoRecording = videoRecording;
    config.cameraOptions.videoRecordDuration = videoRecordDuration;
    config.cameraOptions.videoDeleteTime = videoDeleteTime;
    config.cameraOptions.videoPath = videoPath;


    fs.writeFileSync('./config.ini', ini.stringify(config));
}

delete config;

let worker = grabber.run(parseInt(numberOfCameras),cameraPath,
  (err, result) => {
  if(dest){
    rgbData = new Uint8Array(result.data);

      var s = 0, d = 0;
      while (d < n) {

          dest.data[d++] = rgbData[s++];
          dest.data[d++] = rgbData[s++];
          dest.data[d++] = rgbData[s++];
          d++;    // skip the alpha byte
      }
      ctx[result.id].putImageData(dest, 0, 0);

  }

});

var updateImgFilter = (id, brightness, contrast) => {
  document.getElementById(id).style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

var resetValues = () => {
  document.getElementById('brightness-slider').value = 100;
  document.getElementById('contrast-slider').value = 100;

  updateImgFilter(FocusedCamera, 100, 100);
}

var updateSlider = () => {
  console.log('aa');
  var brightness = document.getElementById('brightness-slider').value;
  var contrast = document.getElementById('contrast-slider').value;

  updateImgFilter(FocusedCamera, brightness, contrast);
}

var cameraView = document.createElement('div');
cameraView.className = 'cameraContainer';
var cameraCanvas = document.createElement('canvas');
cameraCanvas.className = 'cameraFeed';
cameraCanvas.height = 480;
cameraCanvas.width = 640;

var def_ctx = cameraCanvas.getContext("2d");
def_ctx.fillStyle = '#000000'; // implicit alpha of 1
def_ctx.fillRect(0, 0, def_ctx.canvas.width, def_ctx.canvas.height);

var dest = def_ctx.getImageData(0, 0, def_ctx.canvas.width, def_ctx.canvas.height);

var n = 4 * def_ctx.canvas.width * def_ctx.canvas.height;

var mainCameraContainer = document.getElementById('mainCameraContainer');

cameraView.appendChild(cameraCanvas);

for(let i = 0;i<numberOfCameras;i++){
  cameraView.id = 'camera'+ i + 'Container';
  cameraView.childNodes[0].id = 'camera' + i;
  document.getElementById('mainCameraContainer').appendChild(cameraView.cloneNode(true));
  if(numberOfCameras != 1)
    document.getElementById('camera'+i+'Container').addEventListener('dblclick', function(){this.classList.toggle('fullscreen')});

  c = document.getElementById(`camera${i}`);
  ctx[i] = c.getContext("2d");

  c.ondragstart = function() { return false; };

  c.addEventListener('contextmenu', e => {
    console.log(e);
    FocusedCamera = `camera${i}`;
    if(config.cameras && config.cameras[FocusedCamera]){
      document.getElementById('brightness-slider').value = config.cameras[FocusedCamera].brightness || 100;
      document.getElementById('contrast-slider').value = config.cameras[FocusedCamera].contrast || 100;
    }

    document.getElementById('contextmenuSpan').innerHTML = `Kamera ${i}`;
    ContextMenuContainer.classList.remove('is-hidden');
    document.getElementById('contextmenu').style.top = `${e.y}px`;
    document.getElementById('contextmenu').style.left = `${e.x}px`;
  })

  if(videoRecording){
    cameraRecordStack['camera' + i] = {};
    cameraRecordStack['camera' + i].frames = [];
    cameraRecordStack['camera' + i].filename = '';
    cameraRecordStack['camera' + i].start = 0
    cameraRecordStack['camera' + i].end = 0
  }

  if(config.cameras)
    for(id in config.cameras)
      if(document.getElementById(id))
        updateImgFilter(id,config.cameras[id].brightness,config.cameras[id].contrast);
}


CameraLayoutChange();

const CameraLayoutChange = () => {
  var cameras = document.getElementsByClassName('cameraContainer');

  if(numberOfCameras == 1){
    cameras[0].className = 'cameraContainer fullscreen';
  } else {

    var verticalClassName = 'ver';
    var horizontalClassName = 'hor';
    if(numberOfCameras != 2){
      verticalClassName += '-' + numberOfCameras;

      horizontalClassName += '-grid';
    }

  //Poziomo
  var CalculatedHeightHor = window.innerWidth*cameraHeight/(2*cameraWidth); // Wysokość dla ograniczenia na szerokość
  var CalculatedWidthHor = numberOfCameras == 2 ? cameraWidth/cameraHeight*window.innerHeight : (cameraWidth*2*window.innerHeight/cameraHeight); // szerokość dla ograniczenia na wysokość

  //Pionowo
  var CalculatedHeightVer = window.innerWidth/cameraWidth*cameraHeight; //wysokość dla ograniczenia na szerokość
  var CalculatedWidthVer =  cameraWidth*window.innerHeight/(cameraHeight*numberOfCameras); //szerokość dla ograniczenia na wysokość

  var test1 = CalculatedHeightHor > window.innerHeight ? CalculatedWidthHor*cameraHeight/cameraWidth : CalculatedHeightHor;
  var test2 = CalculatedHeightVer > window.innerHeight/numberOfCameras ? CalculatedWidthVer*cameraHeight/cameraWidth : CalculatedHeightVer;

    if(test1 < test2){
      for(var i=0;i<cameras.length;i++)
        cameras[i].setAttribute('data-mode', verticalClassName);
    } else {
        for(var i=0;i<cameras.length;i++)
          cameras[i].setAttribute('data-mode', horizontalClassName);
    }
  }
}

window.addEventListener('resize', CameraLayoutChange);

function videoRecordLoop(){
  // WIP

  console.log(cameraRecordStack);
  for(var i=0;i<numberOfCameras;i++){
    for(var j=0;j<cameraRecordStack['camera' + i].frames.length;j++){
      if(cameraRecordStack['camera' + i].frames.length - j > 1){
        if(cameraRecordStack['camera' + i].filename !== ''){

          cameraRecordStack['camera' + i].end = parseInt(cameraRecordStack['camera' + i].frames[j+1]);
          //DODAJ KLATKĘ do TXT, CZAS Z KLATKI J+1-tej

          if(cameraRecordStack['camera' + i].end - cameraRecordStack['camera' + i].start > videoRecordDuration * 60000){
            cameraRecordStack['camera' + i].frames.splice(0, j+1);
            // UŻYJ FFMPEG
            //usuń folder o nazwie filename
            cameraRecordStack['camera' + i].filename = '';

          }
        } else {
          cameraRecordStack['camera' + i].start = parseInt(cameraRecordStack['camera' + i].frames[j]);
          cameraRecordStack['camera' + i].end = parseInt(cameraRecordStack['camera' + i].frames[j+1]);
          cameraRecordStack['camera' + i].filename = (cameraRecordStack['camera' + i].frames[j]).toString();

          //nowy folder o nazwie filename
        }
      } else {
        cameraRecordStack['camera' + i].frames.splice(0, j);
      }
    }

  }
  setTimeout(videoRecordLoop,5);
}
