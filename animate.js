var ar = require("nodecopter"),
    client = ar.createClient();


client.takeoff();
console.log("took off");
client.animate('flipBehind', 5000);
console.log("animated");
client.after(3000, function() {
    this.stop();
    this.land();
  });
