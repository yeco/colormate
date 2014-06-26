var canvas, context, img;

video = document.getElementById("video"),
videoObj = {
    "video": true
},
errBack = function(error) {
    console.log("Video capture error: ", error.code);
};

function init() {
    canvas = document.getElementById('image_canvas');
    context = canvas.getContext('2d');
    registerEventListeners();
    initCamera();
}

function initCamera(callback) {

    if (navigator.getUserMedia) { // Standard
        navigator.getUserMedia(videoObj, function(stream) {
            video.src = stream;
            video.play();
        }, errBack);
    } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, function(stream) {
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
        }, errBack);
    } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
        navigator.mozGetUserMedia(videoObj, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();

        }, errBack);
    }
    drawVideoInCanvas();

}

function drawVideoInCanvas() {
    setInterval(function() {
        context.drawImage(video, 0, 0, 640, 480);

    }, 100)
}


function getColorNameFromRGB(r, g, b) {
    colorval = (r >> 5) * 100 + (g >> 5) * 10 + (b >> 5);
    console.log("colorval", colorval)
    switch (colorval) {
        case 400:
            return "maroon";
        case 700:
            return "red";
        case 750:
            return "orange";
        case 770:
            return "yellow";
        case 440:
            return "olive";
        case 404:
            return "purple";
        case 707:
            return "fuchsia";
        case 777:
            return "white";
        case 070:
            return "lime";
        case 040:
            return "green";
        case 004:
            return "navy";
        case 007:
            return "blue";
        case 077:
            return "aqua";
        case 044:
            return "teal";
        case 000:
            return "black";
        case 666:
            return "silver";
        case 444:
            return "gray";
    }
}

function findPos(obj) {
    var current_left = 0,
        current_top = 0;
    if (obj.offsetParent) {
        do {
            current_left += obj.offsetLeft;
            current_top += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return {
            x: current_left,
            y: current_top
        };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function output(str) {
    var out = document.getElementById('output');
    out.value = str;
}

function registerEventListeners(argument) {

    canvas.addEventListener('click', function(e) {
        var position = findPos(this);
        var x = e.pageX - position.x;
        var y = e.pageY - position.y;
        var coordinate = "x=" + x + ", y=" + y;
        var canvas = this.getContext('2d');


        var p = canvas.getImageData(x, y, 1, 1).data;

        colors = getColors(canvas, 100, 100);
        var outputstr = "";
        var averageColor = "";
        var colorval = 0;
        for (var hex in colors) {
            if (colors[hex] > colorval) {
                colorval = colors[hex];
                averageColor = pad(hex);
            }
        }

        console.log(averageColor);

        console.log(p)
        // var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        // var color_name = ntc.name(averageColor);

        // console.log(color_name);
        // output(color_name[3]);

        // say(color_name[3]);

        var color_name = getColorNameFromRGB(p[0], p[1], p[2])
        console.log("RGB Name", color_name);
        output(color_name);

        say(color_name);

    });

    video.addEventListener("loadeddata", function() {
        drawVideoInCanvas();
    }, false);

}

// nicely formats hex values
function pad(hex) {
    return ("000000" + hex).slice(-6);
}

// returns a map counting the frequency of each color
// in the image on the canvas
function getColors(c, width, height) {
    var col, colors = {};
    var pixels, r, g, b, a;
    var r = g = b,
        a = 0,
        w = width || c.width;
    h = height || c.height;
    pixels = c.getImageData(0, 0, w, h);
    for (var i = 0, data = pixels.data; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3]; // alpha
        // skip pixels >50% transparent
        if (a < (255 / 2))
            continue;
        col = rgbToHex(r, g, b);
        if (!colors[col])
            colors[col] = 0;
        colors[col]++;
    }
    return colors;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function say(str) {
    var shouldTalk = document.getElementById('say');
    if (shouldTalk.checked) {
        var msg = new SpeechSynthesisUtterance(str);
        window.speechSynthesis.speak(msg);
    }
}


window.onload = init;