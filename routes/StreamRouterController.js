
var StreamRouterHelper = {
    TemplateObject : {
        AvailableEncoders : {},
        AvaiableInputs : {},
        AvailableOutputs : {},
        ConfiguredInputOutputs : []
    },
    
    GetAvaiableEncoders : function () {
        var blah = encoderSettingsController.EncoderSettingsHelper.GetEncoderSettings();
        return blah.encoderSettings;
    },
    GetAvailableInputs : function () {
        var blah = InputOutputConfigurationHelper.GetAllPossibleInputStreams();
        return blah;
    },
    GetAvailableOutputs : function () {
        var blah = thirdPartyController.ThirdPartyHelper.GetThirdParty();
        return blah;
    },
    GetAllAvailable : function () {
        
        this.TemplateObject.ConfiguredInputOutputs = InputOutputConfigurationHelper.GetInputOutputConfiguration();
        this.TemplateObject.AvailableEncoders = this.GetAvaiableEncoders();
        this.TemplateObject.AvaiableInputs = this.GetAvailableInputs();
        this.TemplateObject.AvailableOutputs = this.GetAvailableOutputs().ThirdParty;
        return this.TemplateObject;
    }

}
var InputOutputConfigurationHelper = {
    FileNameOnDisk  : "InputOutputConfiguration.json",
    DefaultEncodingControllerName : "EncodingController",
    DefaultNGINXServerInfo : "rtmp://localhost:1935/",
    DefaultSourceInput : "rtmp://localhost:1935/EncodingController/SourceStream",
    EncoderInputOutputConfiguration : {
        ID : 0,
        InputStream : "",
        OutputStream : "",
        EncoderSettings : {},
        ThirdPartySettings : []
    },
    GetAllPossibleInputStreams : function () {
        var currentSettings = this.GetInputOutputConfiguration();
        var AllInputStreamSources = [];
        AllInputStreamSources.push(this.DefaultSourceInput);
        currentSettings.forEach(function (element, index) {
            AllInputStreamSources.push(element.OutputStream);
        });
        
        return AllInputStreamSources;
    },      
    AddInputOuputConfiguration : function () {
        var currentSettings = this.GetInputOutputConfiguration();
        var currentlength = currentSettings.length;
        if (currentlength == null) {
            currentlength = 0;
        }
        this.EncoderInputOutputConfiguration.ID = currentlength + 1;
        currentSettings.push(this.EncoderInputOutputConfiguration);
        this.WriteToDisk(currentSettings);
        return currentSettings;

    },
    GetInputOutputConfiguration : function () {
        var currentSettings;
        try {
            currentSettings = JSON.parse(streamManage.ReadFile(this.FileNameOnDisk));
        }
        catch (e) {
            currentSettings = [];
            this.EncoderInputOutputConfiguration.ID = 0;
            this.EncoderInputOutputConfiguration.InputStream = this.DefaultSourceInput;
            currentSettings.push(this.EncoderInputOutputConfiguration);
            this.WriteToDisk(currentSettings);
            
        }
        
        return currentSettings;
    },
    DeleteInputOutputConfiguration : function (ID) {
        //TODO : Don't allow deletion of ID = 0
        var currentSettings = this.GetInputOutputConfiguration();
        currentSettings.splice(ID, 1);
        this.WriteToDisk(currentSettings);
    },
    UpdateInputOutputConfiguration : function (parsedInputSettings) {
        var EncoderSettingsIDs = parsedInputSettings.EncoderSettings;
        var InputStreams = parsedInputSettings.InputStreams;
        var currentSettings = this.GetInputOutputConfiguration();
        
        for (var e = 0; e < EncoderSettingsIDs.length; e++) {
            if (currentSettings[e] == null) {
                var temp = {};
                currentSettings.push(temp);
            }
            
            var ID = EncoderSettingsIDs[e];
            
            var singleEncoderSetting = encoderSettingsController.EncoderSettingsHelper.GetEncoderSettingsByID(ID);
            
            currentSettings[e].ID = e
            currentSettings[e].InputStream = InputStreams[e];
            currentSettings[e].OutputStream = this.BuildOutputStreamRTMPURL(singleEncoderSetting);
            currentSettings[e].EncoderSettings = singleEncoderSetting;
           
        }
        
        
        this.WriteToDisk(currentSettings);
    },
    UpdateInputOuputConfigurationThirdParty : function (ThirdPartySettings) {
        var currentSettings = this.GetInputOutputConfiguration();
        var tempThirdParty = [];
        console.log(ThirdPartySettings);
        for (var c = 0; c < currentSettings.length; c++) {
            currentSettings[c].ThirdPartySettings = [];
            for (var t = 0; t < ThirdPartySettings.length; t++) {
                if (currentSettings[c].OutputStream == ThirdPartySettings[t].OutputStream) {
                    
                    tempThirdParty = thirdPartyController.ThirdPartyHelper.GetThirdPartyObjectByName(ThirdPartySettings[t].ServiceName);
                    
                    currentSettings[c].ThirdPartySettings.push(tempThirdParty);
                }
            }
        }
        
        this.WriteToDisk(currentSettings);
    },
    WriteToDisk : function (InputConfigJSON) {
        streamManage.WriteFile(this.FileNameOnDisk, InputConfigJSON, true);
    },
    ParseBodyThird : function (requestBody) {
        
        var keys = Object.keys(requestBody);
        var ThirdPartyTemp = [];
        
        for (var key in requestBody) {
            if (typeof (requestBody[key]) != "object") {
                var serviceRegex = /(^[A-Za-z0-9]*)(?:_)(.*$)/g
                var matches = serviceRegex.exec(key);
                
                var OutputStream = matches[2];
                var ServiceName = matches[1];
                ThirdPartyTemp.push({ ServiceName : ServiceName , OutputStream : OutputStream });
             
                
            }
          
            
        }
        
        return ThirdPartyTemp;
    },
    ParseBody : function (requestBody) {
        var parsedInputSettings = {};
        parsedInputSettings.InputStreams = requestBody.InputStream;
        parsedInputSettings.EncoderSettings = requestBody.EncoderSettings;
        
        return parsedInputSettings;
    },
    
    BuildOutputStreamRTMPURL : function (EncodingSettings) {
        var outputString = EncodingSettings.Bitrate + "_" + EncodingSettings.OutputResolution + "_" + EncodingSettings.Framerate;
        return this.DefaultNGINXServerInfo + this.DefaultEncodingControllerName + '/' + outputString;
    }
}




var OutputToThirdPartyServices = {



};

exports.GetAvailableInputsOutputsAndEncoders = function (req, res) {
    
    var avaiableStuff = StreamRouterHelper.GetAllAvailable();
    res.render('StreamRouteManagement', avaiableStuff);

}

exports.Add = function (req, res) {
    InputOutputConfiguration.AddInputOuputConfiguration();
    res.redirect("/streamrouter");
}

exports.Update = function (req, res) {
    
    InputOutputConfiguration.UpdateInputOutputConfiguration(InputOutputConfiguration.ParseBody(req.body));
    res.redirect("/streamrouter");
}

exports.UpdateThird = function (req, res) {
    InputOutputConfiguration.UpdateInputOuputConfigurationThirdParty(InputOutputConfiguration.ParseBodyThird(req.body));
    res.redirect("/streamrouter");
}

exports.Delete = function (req, res) {
    
    var ID = req.param('ID');
    InputOutputConfiguration.DeleteInputOutputConfiguration(ID);
   

}

exports.InputOutputConfigurationHelper = InputOutputConfigurationHelper;