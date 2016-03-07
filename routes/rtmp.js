
/*
 * GET users listing.
 */

var dns = require('dns');

exports.serverip = function (req, res) {
    var serverIP = null;
    dns.lookup(require('os').hostname(), function (err, add, fam) {
        console.log('addr: ' + add);
        serverIP = add;
        res.send(serverIP);
    });   
};