


var NginxPushToThirdPartyConfiguration = {
    "ApplicationName": "broadcast",
    "StreamKey": "inputStreamKeyMeow",
    "AppPath": "app",
    "BaseURI": "rtmp://twitch.tv"
}

var broadcastOnOffNames = function (onName, offName, broadcastLiveName) {
    this.onName = onName;
    this.offName = offName;
    this.broadcastLiveName = broadcastLiveName;
    this.GetOnName = function () {
        return this.onName;
    }
    this.GetOffName = function () {
        return this.offName
    }
    this.GetBroadcastLiveName = function () {
        return this.broadcastLiveName;
    }
}

function ReturnNginxApplicationSection(NginxConfiguration) {
    //console.log(NginxConfiguration);
    var result = "application " + NginxConfiguration.ApplicationName + " {\n\tlive on;\n";    
    for (var c = 0; c < NginxConfiguration.commands.length; c++) {
        result += NginxConfiguration.commands[c] +"\n";
    }
    result += "}";
    return result;
            

}


var NginxConfiguration = function (ConfigJson) {
    //console.log(ConfigJson);
    var base = {
        "NginxEncodedConfiguration": { "ApplicationName": "encodingcontroller" , "commands" : [] },
        "NginxController": { "ApplicationName": "broadcastcontroller", "commands" : [] },
        "NginxBroadcast": { "ApplicationName": "broadcast" , "commands" : [] }
    };
    base["NginxEncodedConfiguration"].commands = ConfigJson.NginxEncoderCommandList;
    base["NginxController"].commands = ConfigJson.NginxBroadcastControllerCommandList;
    base["NginxBroadcast"].commands = ConfigJson.NginxBroadcastCommandList;
      
    return base;

}



var nginxConfigurationHelper = function (NginxConfigJson) {
    
    //Set the names to push/pull broacast, switching a stream from "local" to "broadcast"
    //http://nginx-rtmp.blogspot.com/2014/01/redirecting-streams-in-version-111.html
    var broadcastObject = new broadcastOnOffNames("on", "off", "golive");
    this.onName = broadcastObject.GetOnName();
    this.offName = broadcastObject.GetOffName();
    this.broadcastLiveName = broadcastObject.GetBroadcastLiveName();
    
    this.nginxConfig = NginxConfigJson;  
    
    
    this.GetNginxEncodedConfiguration = function () {       
        return ReturnNginxApplicationSection(this.nginxConfig.NginxEncodedConfiguration)
    }
    this.GetNNginxControllerConfiguration = function () {     
        return ReturnNginxApplicationSection(this.nginxConfig.NginxController);
    }
    this.GetNginxBroadcastConfiguration = function () {     
        return ReturnNginxApplicationSection(this.nginxConfig.NginxBroadcast);
    }   
    
    this.GetNginxFullConfig = function () {
        return this.GetNginxEncodedConfiguration() + "\n" + this.GetNNginxControllerConfiguration() + "\n" + this.GetNginxBroadcastConfiguration() + "\n";
    }
    return this;
}



var NginxHelper = {
    GetOffKeyword : function () {
        return "off_";
    },
    GetOnKeyword : function () {
        return "on_"
    },
    FakeItForNow : function (faked) {
       
      
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
        
        return "\texec ffmpeg -i " + FFMPEGCommand.inputSource + " -vcodec " + FFMPEGCommand.codec + " -preset " + FFMPEGCommand.preset + " -b:v " + FFMPEGCommand.bitrate + " -maxrate " + FFMPEGCommand.bitrate + " -bufsize " + FFMPEGCommand.bitrate + " -s  " + FFMPEGCommand.outputRes + " -r " + FFMPEGCommand.framerate + " -acodec " + FFMPEGCommand.audioCodec + " -f " + FFMPEGCommand.format + " " + FFMPEGCommand.outputLocation;
    
   
    },
    GenerateNginxConfigCommands : function (InputOuputConfigurations) {
        var rObj = {
            NginxEncoderCommandList : [],
            NginxBroadcastControllerCommandList : [],
            NginxBroadcastCommandList  : []
        };

        for (var i = 0; i < InputOuputConfigurations.length; i++) {
            var InputOuput = InputOuputConfigurations[i];
            //console.log(InputOuput);
            
            rObj.NginxEncoderCommandList.push(this.GetFFMPEGCommandText(InputOuput.InputStream, InputOuput.EncoderSettings, InputOuput.OutputStream));
            rObj.NginxBroadcastControllerCommandList.push(this.GeneratePushRelay(InputOuput.EncoderSettings));
            rObj.NginxBroadcastControllerCommandList.push(this.GenerateBroadcastRealy(InputOuput.EncoderSettings));          
            
            rObj.NginxBroadcastCommandList = this.GenerateLiveRelay(InputOuput.ThirdPartySettings, InputOuput.EncoderSettings, rObj.NginxBroadcastCommandList);
           
           
        }
      
       
        
        return rObj;

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
            var temp = "\tpush " + ThirdPartySettings[l].RemoteRTMPURL + " live=1 name=golive_" + this.GetEncodingShortHand(EncodingSetting) + ";";
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
    },


};

exports.ShowConfig = function (req, res) {
    var that = NginxHelper
    var blah = nginxConfigurationHelper(NginxConfiguration(that.GenerateNginxConfigCommands(streamRouterController.InputOutputConfigurationHelper.GetInputOutputConfiguration()))).GetNginxFullConfig();
    streamManage.WriteFile("NginxConfig.txt", blah, false);
    res.send(blah);
};
exports.NginxHelper = NginxHelper;

/*
 * var nginxEncodedConfigurationHelper = function (applicationName, broadcastOffName) {
    this.broadcastOffName = broadcastOffName;
    this.GetControllerText = function () {
        return "push  rtmp://localhost:1935/broadcastcontroller/" + this.broadcastOffName + " live=1;"
    }
}
var nginxBroadcastControllerHelper = function (applicationName, nginxThirdPartyApplicationName, broadcastOnName, broadcastLiveName) {
    this.bodyText = "push rtmp://localhost:1935/" + nginxThirdPartyApplicationName + "/" + broadcastLiveName + " name=" + broadcastOnName + " live=1;"
    this.GetControllerText = function () {
        return this.bodyText;
    }
}
var nginxBroadcastToThirdPartyHelper = function (applicationName, broadcastLiveName, thirdPartyURL, appURL, streamKey) {
    
    // This isn't very clear but this is what the twitch configuration looks like
    // Real URL == rtmp://live-cdg.twitch.tv/app/streamKey
    // Nginx Version Of that
    // rtmp://live-dfw.twitch.tv app=app playPath=streamKey live=1 name=go; 
    this.bodyText = "push rtmp://" + thirdPartyURL + " app=" + appURL + " playPath=" + streamKey + " live=1 name=" + broadcastLiveName + ";";
    this.GetControllerText = function () {
        return this.bodyText;
    }
}
 * */