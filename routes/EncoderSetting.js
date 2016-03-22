
//{ encoderSettings : [{ ID: 1, Bitrate: '3000k' , Framerate : '60' , OutputResolution : '1280x720', Preset : 'slower' }] }
var streamManage = require('../NginxHelper/streamManage');
var EncoderSettingsHelper = {
    FileNameOnDisk : "EncodingSetting.json",
    DefaultEncoderSettings : { ID: 1, Bitrate: '3000k' , Framerate : '30' , OutputResolution : '1280x720', Preset : 'slower' },
    AddEncoderSetting : function () {
        var currentSettings = this.GetEncoderSettings();
        this.DefaultEncoderSettings.ID = currentSettings.length + 1;
        currentSettings.encoderSettings.push(this.DefaultEncoderSettings);
        this.WriteToDisk(currentSettings);
        return currentSettings;
    },
    GetEncoderSettingsByID : function (ID) {
        var settings = this.GetEncoderSettings().encoderSettings;
        var encoderSettingToReturn = {};
        for (var s = 0; s < settings.length; s++) {
            if (settings[s].ID == ID) {
                encoderSettingToReturn = settings[s];
                return encoderSettingToReturn;
            }
            console.log("s " + s);
        }
     
    },
    GetEncoderSettings : function () {
        var currentSettings;
        try {
            currentSettings = JSON.parse(streamManage.ReadFile(this.FileNameOnDisk));
        }
        catch (e) {
            currentSettings = {};
            currentSettings.encoderSettings = [];
        }
        
        if (currentSettings.encoderSettings.length == 0) {
            currentSettings.encoderSettings = [];
            currentSettings.encoderSettings.push(this.DefaultEncoderSettings);
          
        }
        
        //console.log(this.currentSettings);
        return currentSettings;
    },
    DeleteEncoderSettings: function (id) {
        var currentSettings = this.GetEncoderSettings();
        currentSettings.encoderSettings.splice(id, 1);
        this.WriteToDisk(currentSettings);
    },
    UpdateEncoderSettings : function (id, encoderSettingObject) {
        var currentSettings = this.GetEncoderSettings();
        currentSettings.encoderSettings[id] = encoderSettingObject;
        this.WriteToDisk(currentSettings);
     
    },
    WriteToDisk : function (EncoderSettings) {
        console.log("Write To Disk : Encoder Settings ");
        console.log(EncoderSettings);
        streamManage.WriteFile(this.FileNameOnDisk, EncoderSettings, true);
    },
    ParseBody : function (requestBody, _ID) {
        
        var parsedEncoderSettings = { ID : null };
        
        if (_ID != null) {
            parsedEncoderSettings.ID = _ID;
        }
        
        parsedEncoderSettings.Bitrate = requestBody.Bitrate;
        parsedEncoderSettings.Framerate = requestBody.Framerate;
        parsedEncoderSettings.OutputResolution = requestBody.OutputResolution;
        parsedEncoderSettings.Preset = requestBody.Preset;
        
        return parsedEncoderSettings;
    }
};

exports.EncoderSettingsHelper = EncoderSettingsHelper;
exports.GetEncoderSettings = function (req, res) {
    
    var currentSettings = EncoderSettingsHelper.GetEncoderSettings();
    
    res.render('encodersettings', currentSettings);
};

exports.Add = function (req, res) {
    EncoderSettingsHelper.AddEncoderSetting();
    res.redirect('/encoderSettings');
    
};

exports.Edit = function (req, res) {
    var ID = req.param('ID');
    EncoderSettingsHelper.UpdateEncoderSettings(ID, EncoderSettingsHelper.ParseBody(req.body, ID));
    res.redirect('/encoderSettings');
   // res.render('encodersettings', { title: 'Express' });
};

exports.Delete = function (req, res) {
    var ID = req.param('ID');
    EncoderSettingsHelper.DeleteEncoderSettings(ID);
    res.redirect('/encoderSettings');
};

exports.TestWrite = function (req, res) {
    res.render('encodersettings', { title: 'Express' });
}


