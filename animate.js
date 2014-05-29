var ar = require("nodecopter"),
    client = ar.createClient();


client.takeoff();
console.log("took off");

client
  .after(5000, function() {
    console.log("animating");
    this.animate('yawShake', 5000);
    this.clockwise(0.5);
  })
  .after(30000, function() {
    console.log("stopping/landing");
    this.stop();
    this.land();
  });
