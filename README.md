Hey Folks,

I am almost done writing a UI to make streaming using two PCs a little easier. I am considering releasing it for others to use.

Would you be interested in something that simplifies the setup process for streaming with two PCs and reduces the complexity of configuring your streaming PC?

Let me know if any of you guys would be interested in using it! (Free obviously)
(Screen shots added: http://imgur.com/a/vw2V7 )


**What are you building?**	
A UI to make managing a 2 PC streaming setup easier. Once the initial setup is performed, you'll never have to manually edit an NGINX configuration file again. It is all performed through a web-based-interface

**Why?**
I like to stream using two PCs but any configuration changes to NGINX are often difficult and a huge pain in the ass. It takes an enormous amount of time to get things dialed in. I want to simply the process of interacting with NGINX and make streaming with two PCs are joy instead of a chore. The long term goal is reduce user frustration and reduce the setup time associated with installing linux + NGINX + ffmpeg.

**Who is this targeted at?**
Slightly technical folks who want to stream using two PCs or are currently using two PCs with the help of NGINX + RTMP module.

**What the hell are you on about?**
http://www.helping-squad.com/two-pc-streaming-or-recording-without-a-capturecard/

**What are the planned features?**

**First Release**
+	Change Bitrate, Output Resolution, Framerate, Quality Preset
+	Preview the Encoded Stream before going Live
+	Stream to multiple services at the same time
+	Encode Multiple streams (EG Twitch would could be encoded @ 3000Kbps and Youtube could be encoded @ 5000Kbps)
+	View NGINX Error Logs
+	View NGINX Stream Information

**Future**
+	Manage Recording Options

**Technical Stuff**
A fork of this project will likely be created. http://datarhei.github.io/restreamer/
The "Restreamer" project uses Docker, NGINX and FFMPEG. Those just happen to be 2 of the things required to stream using two PCs(NGINX and FFMPEG).