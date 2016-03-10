
/**
 * Module dependencies.
 */


//TODO : Preview Page, replace youtube link with Clapper link using the NGINX endpoints
//TODO : Preview Page , repalce Drop down box with real stream links
//TODO : Preview Page, Make "On" and "off" link work
//TODO : Figure out how to intergrate changes into docker
//TODO : On FFMPEG Post, update NGINX Configuration
//TODO : On FFMPEG Post, restart NGINX to use the new configuration
//TODO : On Start, ensure that hte correct FFMPEG file is being read for configuration
//TODO : Update to read/display StreamStats.xml provided via NGINX
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var serverip = require('./routes/rtmp');

var http = require('http');
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var configInfo = require("./NginxHelper/config.json");


encoderSettingsController = require('./routes/EncoderSetting');
thirdPartyController = require('./routes/3rdPartySettings');
streamManage = require('./NginxHelper/streamManage');

//var dumb = require("./NginxHelper/FFMPEGOptionsToCommand");


var streamRouterController = require('./routes/StreamRouterController');
var nginxController = require('./NginxHelper/NGINXConfiguration');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/serverip', serverip.serverip);
app.get('/encoderSettings/Test', encoderSettingsController.TestWrite)

app.use(express.bodyParser());

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

app.get('/inputConfigHTML', function (request, resposne) {
    resposne.sendfile('views/InputConfiguration.html');
});



app.get('/encoderSettings', encoderSettingsController.GetEncoderSettings);

app.get('/encoderSettings/Add', encoderSettingsController.Add);
app.post('/encoderSettings/edit', encoderSettingsController.Edit);
app.get('/encoderSettings/Delete', encoderSettingsController.Delete);

app.get('/thirdpartysettings', thirdPartyController.GetThirdPartySettings);

app.get('/thirdpartysettings/Add', thirdPartyController.Add);
app.post('/thirdpartysettings/Edit', thirdPartyController.Edit);
app.get('/thirdpartysettings/Delete', thirdPartyController.Delete);

app.get('/player', function (req, res) {
    res.render('player');
});

app.get('/streamrouter', streamRouterController.GetAvailableInputsOutputsAndEncoders);

app.get('/streamrouter/Add', streamRouterController.Add);
app.post('/streamrouter/Update', streamRouterController.Update);
app.post('/streamrouter/UpdateThird', streamRouterController.UpdateThird);

app.get('/streamrouter/Delete', streamRouterController.Delete);


app.post('/streamManage', streamManage.setStreamStatus);
app.get('/streamManage', streamManage.streamManage);

app.get('/FFMPEGOptions', function (request, response) {
    response.json(JSON.parse(streamManage.ReadFile(configInfo.FFMPEGOptionsFileName)));
});

app.post('/FFMPEGOptions', function (request, response) {
    console.log("Body Below");
    console.log(request.body);
    var newFFMPEGOptions = {
        Bitrate : request.body.Bitrate,
        OutputResolution : request.body.OutputResolution,
        Preset : request.body.Preset,
        Framerate : request.body.Framerate,
        Streamkey : request.body.Streamkey,
        RTMP : request.body.RTMP
    };
    streamManage.WriteFile(configInfo.FFMPEGOptionsFileName, newFFMPEGOptions, true);
    console.log(newFFMPEGOptions);
    //quotes.push(newQuote);
    response.json(newFFMPEGOptions);
});


app.post('/ThirdPartyConfigurations', function (request, response) {
    
    console.log(request.body);
    
    var newThirdPartyConfiguration = {
        StreamKey : request.body.StreamKey,
        RemoteRTMPURL : request.body.RemoteRTMPURL
    }
    fileHelper.WriteFile("ThirdPartyConfigurations.json", newThirdPartyConfiguration);
    response.json(newThirdPartyConfiguration);
   
});


app.post('/ThirdPartyConfigurations', function (request, response) {
    
    console.log(request.body);
    
    var newThirdPartyConfiguration = {
        StreamKey : request.body.StreamKey,
        RemoteRTMPURL : request.body.RemoteRTMPURL
    }
    fileHelper.WriteFile("ThirdPartyConfigurations.json", newThirdPartyConfiguration);
    response.json(newThirdPartyConfiguration);
   
});


nginxController.NginxHelper.FakeItForNow(streamRouterController.InputOutputConfigurationHelper.GetInputOutputConfiguration());



/*

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

fileHelper.WriteFile("NGINX.conf",n.GetNginxFullConfig(), false);



************* Generates the Following NGINX Config File
************* LINK THAT LETS YOU SWITCH YOUR STREAM BROADCAST ON/OFF ALLOWING FOR LOCAL PREVIEW
*************** newname MUST equal   this.onName and name MUST equal  this.offName  
    <a href="http://192.168.1.124/control/redirect/publisher?app=broadcastcontroller&newname=on&name=off">Stream On</a>

"application obsinput {
 live on;
exec ffmpeg -i rtmp://localhost:1935/obsinput/sourcestream -vcodec libx264 -preset medium -b:v 3000k -maxrate 3000k -bufsize 3000k -s  1280x720 -r 40 -acodec copy -f flv rtmp://localhost:1935/encoded/localpreview
}
application encoded {
    live on;
    exec ffmpeg -i rtmp://localhost:1935/obsinput/sourcestream 
   flv rtmp://localhost:1935/encoded/localpreview
    push  rtmp://localhost:1935/broadcastcontroller/off live=1;
    push  rtmp://localhost:1935/broadcastcontroller/off_LocalStreamName name=LocalStreamName live=1;
    push  rtmp://localhost:1935/broadcastcontroller/off_LocalStreamName name=LocalStreamName2 live=1;
 
    
}
application broadcastcontroller {
    live on;
    push rtmp://localhost:1935/broadcast/golive_LocalStreamName1 name=on_LocalStreamName1 live=1;
    push rtmp://localhost:1935/broadcast/golive_LocalStreamName2 name=on_LocalStreamName2 live=1;
}
application broadcast {
 live on;
    push rtmp://ServiceURL1 live=1 name=golive_LocalStreamName1;
    push rtmp://ServiceURL2 live=1 name=golive_LocalStreamName2;
    push rtmp://ServiceURL3 live=1 name=golive_LocalStreamName2;
    
}"



*/