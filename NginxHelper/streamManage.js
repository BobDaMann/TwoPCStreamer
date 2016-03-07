var fileHelper = {};
var fs = require('fs');
var os = require("os");

var configInfo = require(".//config.json");

configInfo.rootDirectory = os.homedir();


console.log(configInfo.rootDirectory);

exports.WriteFile = function (fileNameToWrite, fileContents, isJSON) {
    var stringifiedContents = fileContents;
    if (isJSON === true) {
        stringifiedContents = JSON.stringify(fileContents);
    }
    
    fs.writeFile(configInfo.rootDirectory + "//" + fileNameToWrite, stringifiedContents , function (err) {
        if (err) {
            return console.log(err);
        }

    });
};


exports.ReadFile = function (fileNameToRead){
    var fileContents = fs.readFileSync(
        configInfo.rootDirectory + "\\" + fileNameToRead, "utf8");

    return fileContents;
}

exports.streamManage = function (request, res) {
    fs.readFile(configInfo.rootDirectory  + 'isStreamLive.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
               
        res.send(data);
    });

};
exports.setStreamStatus = function (request, res) {
    console.log(request.body);
    var streamOptions = {
        isStreamLive : request.body.isStreamLive
       
    };
    fileHelper.WriteFile("isStreamLive.json", streamOptions, true);
    res.send(streamOptions);
};

exports.is