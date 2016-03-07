var streamManage = require('./NginxHelper/streamManage');
var FFMPEGCommand =  {
"inputSource": "rtmp://localhost:1935/obsinput/sourcestream",
"codec": "libx264",
"preset": "medium",
"bitrate": "3000k",
"outputRes": "1280x720",
"framerate": "40",
"audioCodec": "copy",
"format": "flv",
"outputLocation": "rtmp://localhost:1935/encoded/localpreview"
}


exports.GetFFMPEGCommandFromOptions = function () {
    var blah = streamManage.ReadFile("C:\\nodeTest\\FFMPEGOptions.json");
    console.log(blah);   
}

exports.GetFFMPEGCommandText = function (inputSource, bitrate, preset, outputResolution, framerate) {
    FFMPEGCommand.inputSource = inputSource;
    FFMPEGCommand.bitrate = bitrate;
    FFMPEGCommand.preset = preset;
    FFMPEGCommand.outputRes = outputResolution;
    FFMPEGCommand.framerate = framerate;
    return FFMPEGCommand;
};