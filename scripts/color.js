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
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        var color_name = ntc.name(hex);
        console.log(color_name);
        output(color_name[1]);

        say(color_name[1]);

    });

    video.addEventListener("loadeddata", function() {
        drawVideoInCanvas();
    }, false);

}

function say(str) {
    var shouldTalk = document.getElementById('say');
    if (shouldTalk.checked) {
        var msg = new SpeechSynthesisUtterance(str);
        window.speechSynthesis.speak(msg);
    }
}


window.onload = init;