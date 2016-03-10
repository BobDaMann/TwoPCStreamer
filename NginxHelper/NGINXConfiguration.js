
 var NginxConfiguration = {
        "NginxInputConfiguration": { "ApplicationName": "input" },
        "NginxEncodedConfiguration": { "ApplicationName": "encoding" },
        "NginxControllerConfiguration": { "ApplicationName": "broadcast" },
        "NginxThirdPartyServiceConfiguration": [ ]
  }

  var  NginxPushToThirdPartyConfiguration ={
        "ApplicationName": "broadcast",
        "StreamKey": "inputStreamKeyMeow",
        "AppPath": "app",
        "BaseURI": "rtmp://twitch.tv"
  }
    
var NginxConfigurationGenerator = {
    GetFFMPEGCommands : function () {
        var SourceInputAndOutput = InputOutputConfig.GetInputOutputConfiguration();
    }

};

function ReturnNginxApplicationTemplate(applicationName, body) {
    return "application " + applicationName + " {\n live on;\n" + body + "\n}"
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
var nginxInputConfigurationHelper = function (applicationName, ffmpegConfig) {
    this.ffmpegConfig = ffmpegConfig;
    this.GetControllerText = function () {
        var f = this.ffmpegConfig;
        return "exec ffmpeg -i " + f.inputSource + " -vcodec " + f.codec + " -preset " + f.preset + " -b:v " + f.bitrate + " -maxrate " + f.bitrate + " -bufsize " + f.bitrate + " -s  " + f.outputRes + " -r " + f.framerate + " -acodec " + f.audioCodec + " -f " + f.format + " " + f.outputLocation;
    };
}


var nginxEncodedConfigurationHelper = function (applicationName, broadcastOffName) {
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

var nginxConfigurationHelper = function (NginxConfigJson) {
    
    //Set the names to push/pull broacast, switching a stream from "local" to "broadcast"
    //http://nginx-rtmp.blogspot.com/2014/01/redirecting-streams-in-version-111.html
    var broadcastObject = new broadcastOnOffNames("on", "off", "golive");
    this.onName = broadcastObject.GetOnName();
    this.offName = broadcastObject.GetOffName();
    this.broadcastLiveName = broadcastObject.GetBroadcastLiveName();
    
    this.nginxConfig = NginxConfigJson.NginxConfiguration;
    this.ffmpegConfig = NginxConfigJson.ffmpegCommand;
    
    
    
    this.GetNginxInputApplicationConfig = function () {
        var inputNginxHelper = new nginxInputConfigurationHelper(this.nginxConfig.NginxInputConfiguration.ApplicationName, this.ffmpegConfig);
        return ReturnNginxApplicationTemplate(this.nginxConfig.NginxInputConfiguration.ApplicationName, inputNginxHelper.GetControllerText())
    }
    this.GetNginxEncodedApplicationConfig = function () {
        var encodedNginxHelper = new nginxEncodedConfigurationHelper(this.nginxConfig.NginxEncodedConfiguration.ApplicationName, this.offName);
        return ReturnNginxApplicationTemplate(this.nginxConfig.NginxEncodedConfiguration.ApplicationName, encodedNginxHelper.GetControllerText());
    }
    this.GetNginxControllerConfiguration = function () {
        var controlerNginxHelper = new nginxBroadcastControllerHelper(this.nginxConfig.NginxControllerConfiguration.ApplicationName, this.nginxConfig.NginxPushToThirdPartyConfiguration.ApplicationName, this.onName, this.broadcastLiveName);
        return ReturnNginxApplicationTemplate(this.nginxConfig.NginxControllerConfiguration.ApplicationName, controlerNginxHelper.GetControllerText());
    }
    
    this.GetPushToThirdPartyConfiguration = function () {
        var thirdPartyConfig = this.nginxConfig.NginxPushToThirdPartyConfiguration;
        console.log(thirdPartyConfig);
        var thirdPartyHelper = new nginxBroadcastToThirdPartyHelper(thirdPartyConfig.ApplicationName, this.broadcastLiveName, thirdPartyConfig.BaseURI, thirdPartyConfig.AppPath, thirdPartyConfig.StreamKey);
        
        return ReturnNginxApplicationTemplate(thirdPartyConfig.ApplicationName, thirdPartyHelper.GetControllerText());
    }
    
    this.GetNginxFullConfig = function () {
        return this.GetNginxInputApplicationConfig() + "\n" + this.GetNginxEncodedApplicationConfig() + "\n" + this.GetNginxControllerConfiguration() + "\n" + this.GetPushToThirdPartyConfiguration();
    }
}


var n = new nginxConfigurationHelper(testing);

fileHelper.WriteFile("NGINX.conf", n.GetNginxFullConfig(), false);