var ar = require('ar-drone');
var client = ar.createClient();

require('ar-drone-png-stream')(client, { port: 8000 });
