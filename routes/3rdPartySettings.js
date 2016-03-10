
/* 
 *    "ApplicationName": "broadcast",
            "StreamKey": "inputStreamKeyMeow",
            "AppPath": "app",
            "BaseURI": "rtmp://twitch.tv"
 * */
var streamManage = require('../NginxHelper/streamManage');

var ThirdPartyHelper = {
    FileNameOnDisk : "ThirdParty.json",
    DefaultThirdParty : { ID : "", Name: "ServiceName" , RemoteRTMPURL : "rtmp://twitch.tv/app/streamKey" },
    AddThirdParty : function () {
        var currentSettings = this.GetThirdParty();
        this.DefaultThirdParty.ID = currentSettings.length + 1;
        currentSettings.ThirdParty.push(this.DefaultThirdParty);
        this.WriteToDisk(currentSettings);
        return currentSettings;
    },
    GetThirdPartyObjectByName : function (Name) {
        
        var ThirdParties = this.GetThirdParty().ThirdParty;
        var temp = {};
        for (var t = 0; t < ThirdParties.length; t++) {
            console.log(ThirdParties);
            if (Name == ThirdParties[t].Name) {
                temp = ThirdParties[t];
                
            }
        }
        
        return temp;
    },
    GetThirdParty : function () {
        var currentSettings;
        
        try {
            
            currentSettings = JSON.parse(streamManage.ReadFile(this.FileNameOnDisk));
           
        }
        catch (e) {
            currentSettings = {};
            currentSettings.ThirdParty = [];
            currentSettings.ThirdParty.push(this.DefaultThirdParty);
            this.WriteToDisk(currentSettings);
        }
        
        return currentSettings;
    },
    DeleteThirdParty : function (ID) {
        var currentSettings = this.GetThirdParty();
        currentSettings.ThirdParty.splice(id, 1);
        this.WriteToDisk(currentSettings);
    },
    UpdateThirdParty : function (ID, ThirdParty) {
        var currentSettings = this.GetThirdParty();
        currentSettings.ThirdParty[ID] = ThirdParty;
        this.WriteToDisk(currentSettings);
    },
    WriteToDisk : function (ThirdPartyConfig) {
        streamManage.WriteFile(this.FileNameOnDisk, ThirdPartyConfig, true);
    },
    ParseBody : function (requestBody, _ID) {
        
        var parsedThird = { ID : null };
        if (_ID != null) {
            parsedThird.ID = _ID;
        }
        
        parsedThird.RemoteRTMPURL = requestBody.RemoteRTMPURL;
        parsedThird.Name = requestBody.Name;
        
        return parsedThird;

    }
};

exports.ThirdPartyHelper = ThirdPartyHelper;

exports.GetThirdPartySettings = function (req, res) {
    
    var currentSettings = ThirdPartyHelper.GetThirdParty();
    res.render('thirdpartysettings', currentSettings);

};

exports.Add = function (req, res) {
    
    ThirdPartyHelper.AddThirdParty();
    res.redirect('/thirdpartysettings');
    
};

exports.Edit = function (req, res) {
    
    var ID = req.param('ID');
    ThirdPartyHelper.UpdateThirdParty(ID, ThirdPartyHelper.ParseBody(req.body, ID));
    res.redirect('/thirdpartysettings');

};

exports.Delete = function (req, res) {
    
    var ID = req.param('ID');
    ThirdPartyHelper.DeleteThirdParty(ID);
    res.redirect('/thirdpartysettings');

};
