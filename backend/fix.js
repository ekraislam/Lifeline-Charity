const fs = require('fs');
let c = fs.readFileSync('src/controllers/donation.controller.js', 'utf8').split('\\n');
c[13] = "        const backendUrl = rawBackendUrl.replace(/\\\\/+$/, '');";
fs.writeFileSync('src/controllers/donation.controller.js', c.join('\\n'));
