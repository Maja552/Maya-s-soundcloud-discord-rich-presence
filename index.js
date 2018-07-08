// Made by Kanade

var isready = false;

var logger = require('morgan');
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(logger('dev'));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.get('/', function (req, res) {
   res.send("Kanade's Soundcloud Discord Rich Presence loaded!");
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Listening at http://%s:%s", host, port)
})

const DiscordRPC = require("discord-rpc");
const ClientId = '465467823519432706';
DiscordRPC.register(ClientId);
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
rpc.on('ready', () => {
  console.log("ready");
  rpc.setActivity({
    details: "Searching...",
    state: '',
    largeImageKey: 'sc_logo_1',
    largeImageText: 'No music playing',
    // smallImageKey: 'test',
    // smallImageText: 'test',
    instance: false,
    startTimestamp: Date.now(),
    endTimestamp: Date.now() + 100,
  });
  isready = true;
});

rpc.login(ClientId).catch(console.error);

/*
1. song_image
2. song_title
3. song_author
4. song_time
5. song_length
*/

var counter = 0;

var lastSongName;

app.post('/updateRPC', function(req, res) {

    counter++;
    console.log(counter);

    var song_image = req.body.song_image;
    var song_title = req.body.song_title;
    var song_author = req.body.song_author;
    var song_time = req.body.song_time;
    var song_length = req.body.song_length;

    console.log("_");
    console.log("song_image: " + song_image);
    console.log("song_title: " + song_title);
    console.log("song_author: " + song_author);
    console.log("song_time: " + song_time);
    console.log("song_length: " + song_length);

    //if (lastSongName != song_title)
    //{
        lastSongName = song_title;
        var song_started = (Date.now() / 1000) - Number(song_time);
        if (isready == true) {
            rpc.setActivity({
                details: song_title,
                //state: "Time elapsed: " + song_time,
                state: "by " + song_author,
                largeImageKey: 'sc_logo_2',
                largeImageText: '"' + song_title + '" by ' + song_author,
                // smallImageKey: 'test',
                // smallImageText: 'test',
                startTimestamp: song_started,
                endTimestamp: song_started + Number(song_length),
                instance: false,
            });
        }
    //}
});
