


var ActiveStreamsHelper = {
    
    NginxXMLEndpoint : "http://localhost:1935/stats.xml",
    GetActiveStreams : function (res) { 
        this.GetXML(res)
    },
    ParseXMLString : function (XML, responseBackToClient) {
        var parseString = require('xml2js').parseString;
        parseString(XML, function (err, result) {
            responseBackToClient.send(result);        
        });
    },
    GetXML : function (responseBackToClient) {
        http.get(this.NginxXMLEndpoint, function (res) {
            // save the data
            var xml = '';
            res.on('data', function (chunk) {
                xml += chunk;
            });
            
            res.on('end', function () {
                this.ParseXMLString(xml, responseBackToClient);
            });
        });
    }
};



exports.GetActiveStreams = function (req, res) {
    ActiveStreamsHelper.GetActiveStreams(res);
};

exports.GetFakeActiveStreams = function (req, res) {
    var fakeStreams = {
        blah : [
            { Name : "Source" , RTMPURL : "localhost:1935/blah" }, 
            { Name : "Encode 1" , RTMPURL : "localhost:1935/blah1" },
            { Name : "Encode 2" , RTMPURL : "localhost:1935/blah2" },
        ]
    }
};