var ar = require("ar-drone"),
    client = ar.createClient(),
    fs = require('fs'),
    cv = require('opencv'),
    http = require('http');


var GREEN = [0, 255, 0]; //B, G, R
var WHITE = [255, 255, 255]; //B, G, R
var RED   = [0, 0, 255]; //B, G, R
var lastPng, goodPng;
var newPng = false;
var pngStream = client.getPngStream();
pngStream.on('data', function(d){
  lastPng = d;
  newPng = true;
});

var lowThresh = 0;
var highThresh = 70;
var nIters = 5;
var maxArea = 2500;
var within = function(left, right, distance){
  return Math.abs(left - right) <= distance;
};

var yawAzimuth = function(rect, whole) {
  var halfWidth = whole.width()/2;
  var halfHeight = whole.height()/2;

  var offX = rect.x - halfWidth;
  var offY = rect.y - halfHeight;

  return {x: offX, y: offY};
};
var lastGoal = null;

var findSphere = function(err, im) {
  im.convertGrayscale();
  var im_canny = im.copy();
  var big = new cv.Matrix(im.height(), im.width()); 

  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);

  var contours = im_canny.findContours();
  var foundSphere = false;
  for(i = 0; i < contours.size(); i++) {
    var brect = contours.boundingRect(i);
    if(contours.area(i) > maxArea && within(brect.height, brect.width, 10) && contours.cornerCount(i) >= 150 && contours.isConvex(i)){
      foundSphere = true;
      var moments = contours.moments(i);
      var cgx = Math.round(moments.m10/moments.m00);
      var cgy = Math.round(moments.m01/moments.m00);
      big.drawContour(contours, i, GREEN);
      big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
      big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
      goodPng=big.toBuffer();
      lastGoal=yawAzimuth(brect, im);
      break;
    }
    else{
      foundSphere = false;
      lastGoal = null;
    }
  }

  if(foundSphere){
    console.log('foundSphere');
    console.log(lastGoal);
    if(lastGoal){
      if(lastGoal.x < 0){
        console.log('ccw');
        client.counterClockwise(1.0);
      }
      else if(lastGoal.x > 0){
        console.log('cw');
        client.clockwise(1.0);
      }
    }
    else{
      console.log('not moving');
    }
  }

};

var pngInterval = setInterval(function(){
  if(newPng){
    newPng = false;
    cv.readImage(lastPng, findSphere);
  }
}, 500);

client.takeoff();
client
  .after(5000, function() {
    this.up(0.1);
  }).after(3000, function() {
    this.stop();
  }).after(1000, function() {
    console.log('forward...');
    this.front(0.05);
  }).after(30000, function(){
    this.land();
  });

client.on('navdata', function(data){
  if(lastGoal){
    if(lastGoal.x < 0){
      console.log('ccw');
      this.counterClockwise(1.0);
    }
    else if(lastGoal.x > 0){
      console.log('cw');
      this.clockwise(1.0);
    }
  }
});
var server = http.createServer(function(req, res){
  if(goodPng){
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(goodPng);
  }
});

server.listen(9090, function(){
  console.log('serving...');
});
