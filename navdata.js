var ar = require("nodecopter"),
    client = ar.createClient();


client.on("navdata", console.log);

