function FFMPEGOptions(Bitrate, OutputRes, Preset, Framerate) {
    this.Birate = Bitrate;
    this.OutputResolution = OutputRes;
    this.Preset = Preset;
    this.Framerate = Framerate;
}


function ThirdPartyConfigurationOptions() {
    this.StreamKey;
    this.RemoteRTMPURL;
}

function NGNIXConfiguration() {
    this.ListOfThirdPartyConfigurations;
    this.FFMPEGOptions;
}

/*
public class ThirdPartyConfiguration
{
public string StreamKey { get; set; }
public string RemoteRTMPURL { get; set; }
}
public class NGNIXConfiguration
{
public List < ThirdPartyConfiguration > ThirdPartyConfigurations { get; set; }
public FFMPEGOptions FFMpegOptions { get; set; }
}
public class FFMPEGOptions
{
public string Birate { get; set; }
public string OutputResolution { get; set; }
public string Preset { get; set; }
public int Framerate { get; set; }
}*/