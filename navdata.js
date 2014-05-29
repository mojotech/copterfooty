var ar = require("nodecopter"),
    client = ar.createClient();


client.on("navdata", console.log);

client.takeoff();
client
  .after(5000, function() {
    this.clockwise(0.5);
  })
  .after(3000, function() {
    this.stop();
    this.land();
  });
