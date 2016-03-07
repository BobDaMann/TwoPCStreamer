

var InputOutputConfiguration = {
    FileNameOnDisk  : "InputOutputConfiguration.json",
    DefaultEncodingControllerName : "EncodingController",
    DefaultNGINXServerInfo : "rtmp://localhost:1935/",
    DefaultSourceInput : "rtmp://localhost:1935/EncodingController/SourceStream",
    EncoderInputOutputConfiguration : {
        ID : 0,
        InputStream : "",
        OutputStream : "",
        EncoderSettings : ""
    },
    GetAllPossibleInputStreams : function (){
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
            this.EncoderInputOutputConfiguration.ID = currentSettings.length;
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
    UpdateInputOutputConfiguration : function (ID, IntputOutConfigItem) {
      
        var currentSettings = this.GetInputOutputConfiguration();
        IntputOutConfigItem.OutputStream = this.BuildOutputStreamRTMPURL(IntputOutConfigItem.EncoderSettings);
        currentSettings[ID] = IntputOutConfigItem;     
        this.WriteToDisk(currentSettings);
    },
    WriteToDisk : function (InputConfigJSON) {
        streamManage.WriteFile(this.FileNameOnDisk, InputConfigJSON, true);
    },
    ParseBody : function (requestBody, _ID) {
        var parsedInputSettings = { ID : null };
        
        if (_ID != null) {
            parsedInputSettings.ID = _ID;
        }
        
        parsedInputSettings.InputStream = requestBody.InputStream;
        parsedInputSettings.OutputStream = requestBody.OutputStream;
        parsedInputSettings.EncoderSettings = requestBody.EncoderSettings;
        
        return parsedInputSettings;
    },
    BuildOutputStreamRTMPURL : function (EncodingSettings){
        return this.DefaultNGINXServerInfo + this.DefaultEncodingControllerName + '/' + EncodingSettings;
    }
}

var StreamRouterHelper =  {    
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
        var blah = InputOutputConfiguration.GetAllPossibleInputStreams();        
        return blah;
    },
    GetAvailableOutputs : function (){
        var blah = thirdPartyController.ThirdPartyHelper.GetThirdParty();
        return blah;
    },
    GetAllAvailable : function (){
        
        this.TemplateObject.ConfiguredInputOutputs = InputOutputConfiguration.GetInputOutputConfiguration();
        this.TemplateObject.AvailableEncoders = this.GetAvaiableEncoders();
        this.TemplateObject.AvaiableInputs = this.GetAvailableInputs();
        this.TemplateObject.AvailableOutputs = this.GetAvailableOutputs().ThirdParty;
        return this.TemplateObject;
    }      

}


var OutputToThirdPartyServices = {



};

exports.GetAvailableInputsOutputsAndEncoders = function (req, res) {

    var avaiableStuff = StreamRouterHelper.GetAllAvailable();    
    res.render('StreamRouteManagement', avaiableStuff);

}

exports.Add = function (req, res){
    InputOutputConfiguration.AddInputOuputConfiguration();
    res.redirect("/streamrouter");
}

exports.Update = function (req, res){
  
    var ID = req.param('ID');
    InputOutputConfiguration.UpdateInputOutputConfiguration(ID, InputOutputConfiguration.ParseBody(req.body, ID));
    res.redirect("/streamrouter");
}

exports.Delete = function (req, res){

    var ID = req.param('ID');
    InputOutputConfiguration.DeleteInputOutputConfiguration(ID);
   

}