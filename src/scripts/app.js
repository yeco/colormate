'use strict';
global = (typeof global != 'object') ? global: window;

var diff = require('color-diff');
var colors = require('./colors');
var gui = global.window.nwDispatcher.requireNwGui();
var win = gui.Window.get();


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
}


App.prototype.init = function() {
    this.canvas = document.getElementById('image_canvas');
    this.context = this.canvas.getContext('2d');
    this.registerEventListeners();
    this.initCamera();

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

}

App.prototype.drawVideoInCanvas = function() {
    var self = this;
    setInterval(function() {
        self.context.drawImage(video, 0, 0, 640, 480);
    }, 100)
}
App.prototype.hideLoader = function () {
    var loading = document.querySelector('.loading');
    loading.style.display= "none";
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
    var colorStr = "<span style='color: " + h + "'>" + o.name +"</span>";
    out.innerHTML = "It's " + colorStr + "!";
}

App.prototype.rounded = function(num) {
    return Math.round(num);
}


App.prototype.registerEventListeners = function(argument) {
    var self = this;
    this.canvas.addEventListener('click', function(e) {
        var position = self.findPos(this);
        var x = e.pageX - position.x;
        var y = e.pageY - position.y;
            var context = this.getContext('2d');

        self.extractColor(context,x, y);

    });

    this.video.addEventListener("loadeddata", function() {
        self.drawVideoInCanvas();
        self.hideLoader();
    }, false);


    var btn_close = document.querySelector('.btn-close');
    btn_close.addEventListener('click',  function () {
        win.close()
    });
    var btn_minimize = document.querySelector('.btn-minimize');
    btn_minimize.addEventListener('click',  function () {
        win.minimize()
    })

    var btn_dev = document.querySelector('.btn-dev');
    btn_dev.addEventListener('click',  function () {
        win.showDevTools()
    })


}

App.prototype.extractColor = function(context, x, y) {
    var self = this;

    var colors = self.getColors(context, x, y, 10, 10);
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