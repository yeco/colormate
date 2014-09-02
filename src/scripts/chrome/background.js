chrome.app.runtime.onLaunched.addListener(function() {
    // Center window on screen.
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var width = 600;
    var height = 600;

    chrome.app.window.create('index.html', {
        id: "ColorMate",
        outerBounds: {
            width: width,
            height: height,
            minWidth: width,
            maxWidth: width,
            minHeight: height,
            maxHeight: height,
            left: Math.round((screenWidth - width) / 2),
            top: Math.round((screenHeight - height) / 2)
        }
    });
});