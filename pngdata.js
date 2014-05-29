var ar = require("ar-drone"),
    client = ar.createClient(),
    fs = require('fs');


var lastPng;
var newPng = false;
var pngStream = client.getPngStream();
pngStream.on('data', function(d){
  console.log('got png');
  lastPng = d;
  newPng = true;
});

var pngInterval = setInterval(function(){
  if(newPng){
    newPng = false;
    fs.writeFile('./pngs/' + new Date().getTime() + '.png', lastPng, function(err){
      if(err){
        console.log("couldn't save png", err);
      }
      else {
        console.log('saved png');
      }
    });
  }
  else{
    console.log('no new png');
  }
}, 150);
client.takeoff();
client
  .after(5000, function() {
    this.stop();
  }).after(10000, function(){
    this.land();
  });
