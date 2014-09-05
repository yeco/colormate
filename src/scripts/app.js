'use strict';

var diff = require('color-diff');
var colors = require('./colors');
var Annyang = require('annyang');

var ann = new Annyang();

var App = function() {
    var canvas, context, img;

    this.video = document.getElementById("video");

    this.videoObj = {
        "video": true
    },
    this.errBack = function(error) {
        console.log("Video capture error: ", error.code);
    };

    this.palette = colors;


    this.voiceCommands = {
        'hello': function() {
            console.log('hola')
        }
    }

}


App.prototype.init = function() {
    this.canvas = document.getElementById('image_canvas');
    this.context = this.canvas.getContext('2d');

    this.ui_canvas = document.getElementById('ui_canvas');
    this.ui_context = this.ui_canvas.getContext('2d');

    this.registerEventListeners();
    this.loadingAnimation();
    this.initCamera();
    ann.init(this.voiceCommands);

    console.log(ann)
    ann.trigger('hello')

}

App.prototype.loadingAnimation = function() {
    var ctx = this.context;
    var canvas = this.canvas;
    var self = this;
    this.loadingInterval = null;

    var loadingImg = new Image();

    loadingImg.onload = function() {
        ctx.drawImage(loadingImg, 0, 0, 128, 128);

        var ang = 0; //angle
        var fps = 1000 / 25;
        var cache = this;
        self.loadingInterval = setInterval(function() {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(Math.PI / 180 * (ang += 5));
            ctx.drawImage(loadingImg, -cache.width / 2, -cache.height / 2, cache.width, cache.height); //draw the image ;)
            ctx.restore();
        }, fps);



    }
    loadingImg.src = '../images/icon-256.png';
}

module.exports = App;
App.prototype.initCamera = function(callback) {

    if (navigator.getUserMedia) { // Standard
        navigator.getUserMedia(this.videoObj, function(stream) {
            video.src = stream;
            video.play();
        }, errBack);
    } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(this.videoObj, function(stream) {
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
        }, this.errBack);
    } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
        navigator.mozGetUserMedia(this.videoObj, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();

        }, errBack);
    }
    this.drawVideoInCanvas();
    this.updateUI();
}


App.prototype.updateUI = function(x, y) {

    var canvas = this.ui_canvas;
    var context = this.ui_context;


    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var canvasX = (canvasWidth / 2);
    var canvasY = (canvasHeight / 2);

    var x = x || canvasX;
    var y = y || canvasY;

    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawHLine(canvas, context, x, y);
    this.drawVLine(canvas, context, x, y);
    this.drawBullseye(canvas, context, x, y);
    this.drawVideoUILines();


}

App.prototype.drawVideoUILines = function() {

    var canvas = this.ui_canvas;
    var context = this.ui_context;

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var outerWidth = canvasWidth - 20;
    var outerHeight = canvasHeight - 20;





    //border line
    context.beginPath();
    context.rect(10, 10, outerWidth, outerHeight);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.stroke();
    context.closePath();

    this.drawBullseye(canvas, context);
}





App.prototype.drawBullseye = function(canvas, context, x, y) {

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;
    var innerWidth = canvasWidth / 6;
    var innerHeight = canvasHeight / 6;
    var innerPosX = x || (canvasWidth / 2);
    var innerPosY = y || (canvasHeight / 2);

    var eyePosX = innerPosX - (innerWidth / 2) + 8
    var eyePosY = innerPosY - (innerHeight / 2) + 8
    var eyeWidth = innerWidth - 16
    var eyeHeight = innerHeight - 16

    // outer circle
    context.beginPath();

    context.arc(innerPosX, innerPosY, innerWidth / 2, 0, 2 * Math.PI, false);

    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.stroke();
    context.closePath();

    // inner circle (red, red wine)

    context.beginPath();
    context.arc(innerPosX, innerPosY, innerWidth / 3, 0, 2 * Math.PI, false);

    context.lineWidth = 12;
    context.strokeStyle = 'rgba(255,255,255,0.2)';
    context.stroke();
    context.closePath();


    context.beginPath();
    context.rect(eyePosX, eyePosY, eyeWidth, eyeHeight);
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.stroke();
    context.closePath();

    this.eye = {
        x: eyePosX,
        y: eyePosY,
        height: eyeWidth,
        width: eyeHeight
    }

}

App.prototype.drawHLine = function(canvas, context, x, y) {

    var canvasWidth = canvas.width;

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(0, y);
    context.lineTo(canvasWidth, y);

    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.stroke();
    context.closePath();

}

App.prototype.drawVLine = function(canvas, context, x, y) {

    var canvasHeight = canvas.height;

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(x, 0);
    context.lineTo(x, canvasHeight);

    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.stroke();
    context.closePath();
}
App.prototype.drawVideoInCanvas = function() {
    var self = this;
    var ctx = this.context;
    var canvas = this.canvas;
    clearInterval(self.loadingInterval);

    setInterval(function() {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, 640, 480);
    }, 100)
}
App.prototype.hideLoader = function() {
    var loading = document.querySelector('.loading');
    loading.style.display = "none";
}

App.prototype.findPos = function(obj) {
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

App.prototype.output = function(o) {
    var out = document.querySelector('.video_label p');
    var h = this.rgbToHex(o.R, o.G, o.B);
    var colorStr = "<span style='color: " + h + "'>" + o.name + "</span>";
    out.innerHTML = "It's " + colorStr + "!";
}

App.prototype.rounded = function(num) {
    return Math.round(num);
}


App.prototype.registerEventListeners = function(argument) {
    var self = this;
    this.canvas.addEventListener('click', function(e) {
        var context = this.getContext('2d');
        self.extractColor(context);

    });

    this.canvas.addEventListener('mousemove', function(evt) {
        var canvas = evt.target;
        var rect = canvas.getBoundingClientRect();

        var x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        var y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

        self.updateUI(x, y);
    })

    this.video.addEventListener("loadeddata", function() {
        self.drawVideoInCanvas();
        self.hideLoader();
    }, false);

}

App.prototype.extractColor = function(context, x, y) {
    var self = this;
    var eye = this.eye;
    var colors = self.getColors(context, eye.x, eye.y, eye.width, eye.height);
    var averageColor = {};
    var colorval = 0;
    for (var hex in colors) {
        if (colors[hex].index > colorval) {
            colorval = colors[hex].index;
            averageColor = colors[hex].rgb;
        }
    }

    var palette = self.palette;

    var rgb = self.saturate(averageColor, 1.5);
    var closest = diff.closest(rgb, palette); // {R: 255, G: 0, B: 0 }, red

    self.output(closest);
    self.say(closest.name);
}

App.prototype.setBGColor = function(color) {
    var body = document.getElementsByTagName('body');
    body = body[0];
    var rgbStr = [color.R, color.G, color.B].join(",");
    body.style.backgroundColor = "rgb(" + rgbStr + ")";

}
// returns a map counting the frequency of each color
// in the image on the canvas
App.prototype.getColors = function(c, x, y, width, height) {
    var col, colors = {};
    var pixels, r, g, b, a;
    var r = g = b,
        a = 0,
        x = x || 0,
        y = y || 0,
        w = width || c.width,
        h = height || c.height,
        pixels = c.getImageData(x, y, w, h);
    for (var i = 0, data = pixels.data; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3]; // alpha
        // skip pixels >50% transparent
        if (a < (255 / 2))
            continue;
        col = this.rgbToHex(r, g, b);

        if (!colors[col]) {

            colors[col] = {
                index: 0
            };

        }


        colors[col].index++;
        colors[col].rgb = {
            R: r,
            G: g,
            B: b
        };
    }
    return colors;
}

App.prototype.rgbToHex = function(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

App.prototype.say = function(str) {
    var shouldTalk = document.getElementById('say');
    if (shouldTalk.checked) {
        var msg = new SpeechSynthesisUtterance(str);
        window.speechSynthesis.speak(msg);
    }
}

App.prototype.RGBtoHSV = function(color) {
    var r, g, b, h, s, v, max, min, delta;
    r = color[0];
    g = color[1];
    b = color[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);


    v = max;
    delta = max - min;
    if (max != 0)
        s = delta / max; // s
    else {
        // r = g = b = 0        // s = 0, v is undefined
        s = 0;
        h = -1;
        return [h, s, undefined];
    }
    if (r === max)
        h = (g - b) / delta; // between yellow & magenta
    else if (g === max)
        h = 2 + (b - r) / delta; // between cyan & yellow
    else
        h = 4 + (r - g) / delta; // between magenta & cyan
    h *= 60; // degrees
    if (h < 0)
        h += 360;
    if (isNaN(h))
        h = 0;
    return [h, s, v];
}

App.prototype.saturate = function(rgbObj, amount) {
    var rgb = [rgbObj.R, rgbObj.G, rgbObj.B];
    var hsv = this.RGBtoHSV(rgb);
    hsv[1] *= amount || 0;
    var rgb = this.HSVtoRGB(hsv);

    return {
        R: rgb[0],
        G: rgb[1],
        B: rgb[2]
    };
}

App.prototype.HSVtoRGB = function(color) {
    var i;
    var h, s, v, r, g, b, f, p, q, t;
    h = color[0];
    s = color[1];
    v = color[2];
    if (s === 0) {
        // achromatic (grey)
        r = g = b = v;
        return [r, g, b];
    }
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default: // case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return [r, g, b];
};