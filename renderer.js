// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var fs = require('fs');


  var base64 = require('file-base64');

var height = 480;
var width = 640;
var clickCamera0 = 0;
var clickCamera1 = 0;
var clickCamera0Timeout;
var clickCamera1Timeout;

var click = {'camera0':0,'camera1':0};
var clickTimeout = {'camera0':'','camera1':''};

var cameras = document.getElementsByClassName('cameraContainer');

if(window.innerHeight*width > window.innerWidth*height*2){
  for(var i=0;i<cameras.length;i++)
    cameras[i].setAttribute('data-mode','ver');
} else {
    for(var i=0;i<cameras.length;i++)
      cameras[i].setAttribute('data-mode','hor');
}

var child_process = require('child_process')

start();
function start(){

  var child = child_process.spawn('./grab');

  // use event hooks to provide a callback to execute when data are available:
  child.stdout.on('data', function(feed) {
      feed = feed.toString().split(',')
      feed[1] = parseInt(feed[1]);

      fs.stat('/dev/shm/less/'+feed[0]+'/'+feed[1]+'.jpeg', function(err, stat) {
        if(err == null) {

            base64.encode('/dev/shm/less/'+feed[0]+'/'+feed[1]+'.jpeg', function(err, base64String) {
              document.getElementById(feed[0]).src = 'data:image/jpeg;base64, ' + base64String;

  });


        } else if(err.code == 'ENOENT') {
         console.log('pszypau');
        } else {
            console.log('Some other error: ', err.code);

        }
    });

  });

  child.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        delete(child);
        setTimeout(start, 100);
    });


}




window.addEventListener('resize', function(event){

  var cameras = document.getElementsByClassName('cameraContainer');

  if(window.innerHeight*width > window.innerWidth*height*2){
    for(var i=0;i<cameras.length;i++)
      cameras[i].setAttribute('data-mode','ver');
  } else {
      for(var i=0;i<cameras.length;i++)
        cameras[i].setAttribute('data-mode','hor');
  }
//17/24 - stosunek szerokości do wysokości dla pionowości
// 8/3 - stosunek szerokości do wysokości dla poziomości
});

var fullscreenClick = function (){

  console.log(this.className);
  if(click[this.id] == 1){
    var fullscreening = false;
    clearTimeout(clickTimeout[click[this.id]]);
    click[this.id] = 0;
    var fullscreened = document.getElementsByClassName('fullscreen');
    if(this.className != 'cameraContainer fullscreen'){
      console.log('chuj');
      fullscreening = true;


    }
    console.log(fullscreened.length);
    for(var i=0;i<fullscreened.length;i++){
      fullscreened[i].className = 'cameraContainer';
    }
    if(fullscreening)
      this.className = 'cameraContainer fullscreen';


  } else {
    click[this.id] = 1;
    clickTimeout[click[this.id]] = setTimeout(function(id){
      click[id] = 0;
      console.log('dupa');
    },500,this.id);
  }
}

document.getElementById('camera0Container').addEventListener('click', fullscreenClick);
document.getElementById('camera1Container').addEventListener('click', fullscreenClick);
