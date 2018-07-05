// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


var ffmpeg = require('fluent-ffmpeg');
var rimraf = require('rimraf');
var fs = require('fs');

var CameraFramerate = 10;
var CameraTime = 2;
var CameraSize = '640x480';
  var cameraDirectory = ['camera0','camera1'];
  var cameraIndex = 0;

  var date1 = new Date();

  var rimrafed = {'camera0' : false, 'camera1' : false};
  var frameCounter0 = 1;
  var frameCounter1 = 1;

  var base64 = require('file-base64');
  var cameraborder= {};




  updateCamera = function(id, n, limit){
    if(n > limit || rimrafed[id] === true)
      return;
      //console.log(rimrafed);
    fs.stat('/dev/shm/less/'+id+'/feed_'+n+'.bmp', function(err, stat) {
      if(err == null) {
          //console.log('File exists');
          /*if(document.getElementById(id).src !== '/dev/shm/less/'+id+'/feed_'+n+'.bmp'){
            document.getElementById(id).src = '/dev/shm/less/'+id+'/feed_'+n+'.bmp';
            console.log('/dev/shm/less/'+id+'/feed_'+n+'.bmp');
          }*/
console.log('/dev/shm/less/'+id+'/feed_'+n+'.bmp');
          base64.encode('/dev/shm/less/'+id+'/feed_'+n+'.bmp', function(err, base64String) {
            document.getElementById(id).src = 'data:image/png;base64, ' + base64String;

            document.getElementById(id).setAttribute('data-active','true');
            clearTimeout(cameraborder[id]);
            cameraborder[id]= setTimeout(function(){document.getElementById(id).setAttribute('data-active','false')},150,id)

});


          setTimeout(function(){updateCamera(id,n+1,limit)},1000/CameraFramerate);
      } else if(err.code == 'ENOENT') {
    //    console.log('/dev/shm/less/'+id+'/feed_'+n+'.bmp');
        setTimeout(function(){updateCamera(id,n,limit)},1000/CameraFramerate/2);
      } else {
          //console.log('Some other error: ', err.code);
          setTimeout(function(){updateCamera(id,n,limit)},1000/CameraFramerate/2);

      }
  });

  }


var switchCamera1 =  ffmpeg('/dev/video0')    // Set input format (depends on OS, will not work if this isn't correct!)
    .inputFormat('v4l2')
    // Set output format
    .inputOption('-channel 0')
    // Set size
    .fps(CameraFramerate)
    .size(CameraSize)
    .takeFrames(CameraFramerate*CameraTime)
    .output('/dev/shm/less/camera0/feed_%0d.bmp').on('start', function(commandLine) {
      rimrafed['camera1'] = true;

      rimraf('/dev/shm/less/camera1/*', function () { //console.log('done');
    });
  //  console.log('Spawned Ffmpeg with command: ' + commandLine);
  }).on('end', function() {
    rimrafed['camera1'] = false;

frameCounter1 = 1

  setTimeout(function(){
    updateCamera('camera1', frameCounter1, CameraFramerate*CameraTime);

  cameraIndex = 1;
    switchCamera2.run();
  },150);

}).on('error',function(err, stdout, stderr){
  console.log(err);
  setTimeout(function(){switchCamera1.run()},200);
});

  var switchCamera2 =  ffmpeg('/dev/video0')    // Set input format (depends on OS, will not work if this isn't correct!)
      .inputFormat('v4l2')
      // Set output format
      .inputOption('-channel 0')
      // Set size
      .fps(CameraFramerate)
      .size(CameraSize)
      .takeFrames(CameraFramerate*CameraTime)
      .output('/dev/shm/less/camera1/feed_%0d.bmp').on('start', function(commandLine) {
        rimrafed['camera0'] = true;

        rimraf('/dev/shm/less/camera0/*', function () {
        //  console.log('done');

  });
  //    console.log('Spawned Ffmpeg with command: ' + commandLine);
    }).on('end', function() {

      rimrafed['camera0'] = false;
      frameCounter0 = 1;

setTimeout(function(){
  updateCamera('camera0', frameCounter0, CameraFramerate*CameraTime);

  cameraIndex = 0;
  switchCamera1.run();
},150);

    }).on('error',function(err, stdout, stderr){
      console.log(err);
      setTimeout(function(){switchCamera2.run()},200);
    });

updateCamera('camera0', frameCounter0, CameraFramerate*CameraTime);
switchCamera1.run();


/*
stream.on('data', function(data) {
  document.getElementById('camera1').src = 'data:image/png;base64, '+ stream.getContents().toString('base64');

});
*/
