// ==UserScript==
// @name         Kanade's Soundcloud Discord Rich Presence
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script to connect discord and soundcloud
// @author       Kanade
// @match        https://soundcloud.com/*
// @grant        none
// ==/UserScript==

(function() {
	// Made by Kanade
    console.info("Kanade's Soundcloud Discord Rich Presence loaded!");

    var s_image = "_image";
    var s_title = "_title";
    var s_author = "_author";
    var s_valuenow = 0;
    var s_length = 0;

    var discord_delay = 15500;
    var update_delay = 2900;

    var lastSong = "";
    var lastSongTime = 0;
    var lastSent = 0;
    var requestingPush = false;

    function setup_variables()
    {
        s_image = document.querySelectorAll('[property="og:image"]')[0].content;
        /*
        s_title = document.getElementsByTagName("title")[0].textContent;
        s_title = s_title.slice(1, s_title.Length);
        s_author = "";
        try {
            var wo1 = s_title.split(",");
            s_title = wo1[0].slice( 1 );
            s_author = wo1[1].slice( 1 );
        }
        catch(err) {
            document.getElementById("demo").innerHTML = err.message;
        }

        //s_title = str.split(" ");
        */

        s_author = document.querySelectorAll('[class="playbackSoundBadge__lightLink sc-link-light sc-truncate"]')[0].textContent;
        s_title = document.querySelectorAll('[class="playbackSoundBadge__titleLink sc-truncate"]')[0].getAttribute("title");

        s_valuenow = document.querySelectorAll('[aria-valuenow]')[0].getAttribute("aria-valuenow");
        s_length = document.querySelectorAll('[class="playbackTimeline__duration"]')[0].childNodes[1].textContent;
        try {
            var ex1 = s_length.split(":");
            //console.log("ex1's length: " + ex1.length);
            //console.log("ex1[0]: " + ex1[0]);
            //console.log("ex1[1]: " + ex1[1]);
            //console.log("ex1[2]: " + ex1[2]);
            if (ex1.length == 3)
            {
                //console.log("IF LENGTH == 3");
                s_length = Number(ex1[0] * 3600) + Number(ex1[1] * 60) + Number(ex1[2]);
            }
            else if (ex1.length == 2)
            {
                //console.log("IF LENGTH == 2");
                s_length = Number(ex1[0] * 60) + Number(ex1[1]);
            }
        }
        catch(err) {
            document.getElementById("demo").innerHTML = err.message;
        }
    }

    function reprint()
    {
        console.log("Song's title:" + s_title);
        console.log("Song's author:" + s_author);
        console.log("Song's image:" + s_image);
        console.log("Song's time elapsed:" + s_valuenow);
        //console.info(document.querySelectorAll('[class="playbackTimeline__duration"]')[0].childNodes[1].textContent);
        console.log("Song's length:" + s_length);
    }

    function sendData(song_image, song_title, song_author, song_time, song_length)
    {
        lastSent = Date.now();

        console.log("trying to post new data");

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        urlEncodedDataPairs.push(encodeURIComponent("song_image") + '=' + encodeURIComponent(song_image));
        urlEncodedDataPairs.push(encodeURIComponent("song_title") + '=' + encodeURIComponent(song_title));
        urlEncodedDataPairs.push(encodeURIComponent("song_author") + '=' + encodeURIComponent(song_author));
        urlEncodedDataPairs.push(encodeURIComponent("song_time") + '=' + encodeURIComponent(song_time));
        urlEncodedDataPairs.push(encodeURIComponent("song_length") + '=' + encodeURIComponent(song_length));
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        XHR.addEventListener('error', function(event) {
            console.log('Oopsie whoopsie! We made a fucky wucky!!!');
            console.log(event);
        });

        XHR.open('POST', 'http://127.0.0.1:8081/updateRPC');
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XHR.send(urlEncodedData);
    }

    function send_all()
    {
        setup_variables();
        reprint();
        sendData(s_image, s_title, s_author, s_valuenow, s_length);
    }

    function can_push()
    {
        if ((lastSent + discord_delay) < Date.now())
        {
            return true;
        }
        console.log("We cannot push");
        return false;
    }

    function check_music()
    {
        
        //console.log(document.querySelectorAll('[class="playbackSoundBadge__lightLink sc-link-light sc-truncate"]')[0].textContent);
        //console.log(document.querySelectorAll('[class="playbackSoundBadge__titleLink sc-truncate"]')[0].getAttribute("title"));
        //title
        
        console.log("///NEXT MUSIC CHECK///");
        if (requestingPush == false) {
            lastSong = s_title;
            lastSongTime = s_valuenow;

            setup_variables();
            //reprint();

            var b1 = s_valuenow - lastSong;
            var b2 = (update_delay / 1000);
            if (lastSong != s_title || Math.abs(b1) > (b2 + 1))
            {
                console.log("Requesting a push...");
                requestingPush = true;
                if (can_push())
                {
                    sendData(s_image, s_title, s_author, s_valuenow, s_length);
                    requestingPush = false;
                }
            }
        }
        else
        {
            if (can_push())
            {
                sendData(s_image, s_title, s_author, s_valuenow, s_length);
                requestingPush = false;
            }
        }
    }

    function startup_event()
    {
        console.log("Script will start running now");
        send_all();
        //clearInterval();
        setInterval(check_music, update_delay);
    }
    setTimeout(startup_event, 5000);

})();
