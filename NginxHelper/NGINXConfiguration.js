
var NginxConfiguration = {
    "NginxInputConfiguration": { "ApplicationName": "input" },
    "NginxEncodedConfiguration": { "ApplicationName": "encodingcontroller" },
    "NginxControllerConfiguration": { "ApplicationName": "broadcast" },
    "NginxThirdPartyServiceConfiguration": []
}

var NginxPushToThirdPartyConfiguration = {
    "ApplicationName": "broadcast",
    "StreamKey": "inputStreamKeyMeow",
    "AppPath": "app",
    "BaseURI": "rtmp://twitch.tv"
}


var NginxHelper = {
    GetOffKeyword : function () {
        return "off_";
    },
    GetOnKeyword : function () {
        return "on_"
    },
    FakeItForNow : function (faked) {
        this.GenerateNginxConfigCommands(faked);
    },
    GetFFMPEGCommandText : function (inputSource, EncodingSetting, ouputSource) {
        var FFMPEGCommand = {
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
        
        FFMPEGCommand.inputSource = inputSource;
        FFMPEGCommand.bitrate = EncodingSetting.Bitrate;
        FFMPEGCommand.preset = EncodingSetting.Preset;
        FFMPEGCommand.outputRes = EncodingSetting.OutputResolution;
        FFMPEGCommand.framerate = EncodingSetting.Framerate;
        FFMPEGCommand.outputLocation = ouputSource;
        
        return "exec ffmpeg -i " + FFMPEGCommand.inputSource + " -vcodec " + FFMPEGCommand.codec + " -preset " + FFMPEGCommand.preset + " -b:v " + FFMPEGCommand.bitrate + " -maxrate " + FFMPEGCommand.bitrate + " -bufsize " + FFMPEGCommand.bitrate + " -s  " + FFMPEGCommand.outputRes + " -r " + FFMPEGCommand.framerate + " -acodec " + FFMPEGCommand.audioCodec + " -f " + FFMPEGCommand.format + " " + FFMPEGCommand.outputLocation;
    
   
    },
    GenerateNginxConfigCommands : function (InputOuputConfigurations) {
        var ReturnObject = {};
        
        var PushRelayList = [];
        var BroadcastRelayList = [];
        var LiveRelayList = [];
        var FFMPEGCommands = [];
        for (var i = 0; i < InputOuputConfigurations.length; i++) {
            var InputOuput = InputOuputConfigurations[i];
            console.log(InputOuput);
            
            FFMPEGCommands.push(this.GetFFMPEGCommandText(InputOuput.InputStream, InputOuput.EncoderSettings, InputOuput.OutputStream));
            PushRelayList.push(this.GeneratePushRelay(InputOuput.EncoderSettings));
            BroadcastRelayList.push(this.GenerateBroadcastRealy(InputOuput.EncoderSettings));
            console.log("THIRD RIGHT BEFORE LOOP");
            console.log(InputOuput.ThirdPartySettings[0]);
            
            this.GenerateLiveRelay(InputOuput.ThirdPartySettings, InputOuput.EncoderSettings, LiveRelayList);
           
           
        }
        ReturnObject.PushRelayList = PushRelayList;
        ReturnObject.BroadcastRelayList = PushRelayList;
        ReturnObject.LiveRelayList = PushRelayList;
        ReturnObject.FFMPEGCommandsList = FFMPEGCommands;
        
        console.log(ReturnObject);
        
        return ReturnObject;

    },
    GenerateEncodingCommand : function (InputOuputConfiguration) {
        //GetFFMpegCommand
    },
    GeneratePushRelay : function (EncodingSetting) {
        var LocalStreamNameOff = this.GetOffKeyword() + this.GetEncodingShortHand(EncodingSetting);
        var SourceName = this.GetEncodingShortHand(EncodingSetting);
        return this.GenerateRTMPLocalRelay("broadcast", LocalStreamNameOff, SourceName);
    },
    GenerateBroadcastRealy : function (EncodingSetting) {
        var LocalStreamNameOn = this.GetOnKeyword() + this.GetEncodingShortHand(EncodingSetting);
        var GoLiveStreamName = "golive_" + this.GetEncodingShortHand(EncodingSetting);
        var BroadcastRelay = this.GenerateRTMPLocalRelay("broadcast", GoLiveStreamName, LocalStreamNameOn);
        return BroadcastRelay;
    },
    GenerateLiveRelay : function (ThirdPartySettings, EncodingSetting, LiveRelay) {
        
        for (var l = 0; l < ThirdPartySettings.length; l++) {
            var temp = "    push " + ThirdPartySettings[l].RemoteRTMPURL + " live=1 name=" + this.GetEncodingShortHand(EncodingSetting);
            console.log("live relay temp");
            console.log(temp);
            LiveRelay.push(temp);
        }
        return LiveRelay;
    },
    GetEncodingShortHand : function (EncodingSetting) {
        return EncodingSetting.Bitrate + "_" + EncodingSetting.OutputResolution + "_" + EncodingSetting.Framerate;
    },
    GenerateRTMPLocalRelay : function (ApplicationName, StreamName, StreamToForward) {
        return "    push rtmp://localhost:1935/" + ApplicationName + "/" + StreamName + " name=" + StreamToForward + " live=1;";
    }

};


exports.NginxHelper = NginxHelper;