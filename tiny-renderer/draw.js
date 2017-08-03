/// Draw Path

function drawParametric(ctx, fx, fy, tarr) {
    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = fx(tarr[i]);
        var y = fy(tarr[i]);
        if (i == 0) {
            ctx.moveTo(x, y);
        }
        else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}
function drawPolar(ctx, fth, tr, tarr) {
    var fx = function(t) {
        return tr(t) * Math.cos(fth(t));
    }

    var fy = function(t) {
        return tr(t) * Math.sin(fth(t));
    }

    drawParametric(ctx, fx, fy, tarr);
}

/// Draw Segments

function drawLineSegment(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();   
}
function drawParametricSegments(ctx, fx, fy, tarr) {
    for (var i=0; i<(tarr.length - 1); i++) {
        var x1 = fx(tarr[i]);
        var y1 = fy(tarr[i]);
        var x2 = fx(tarr[i + 1]);
        var y2 = fy(tarr[i + 1]);
        drawLineSegment(ctx, x1, y1, x2, y2);
    }
}
function drawPolarSegments(ctx, fth, tr, tarr) {
    var fx = function(t) {
        return tr(t) * Math.cos(fth(t));
    }

    var fy = function(t) {
        return tr(t) * Math.sin(fth(t));
    }

    drawParametricSegments(ctx, fx, fy, tarr);
}

/// Draw Dots

function drawDot(ctx, x, y, radius) {


    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
}

function drawParametricDots(ctx, fx, fy, fradius, tarr) {
    for (var i=0; i<(tarr.length - 1); i++) {
        var radius = fradius(tarr[i]);
        var x = fx(tarr[i]);
        var y = fy(tarr[i]);
        drawDot(ctx, x, y, radius);
    }
}

function drawPolarDots(ctx, fth, tr, fradius, tarr) {
    var fx = function(t) {
        return tr(t) * Math.cos(fth(t));
    }

    var fy = function(t) {
        return tr(t) * Math.sin(fth(t));
    }

    drawParametricDots(ctx, fx, fy, fradius, tarr);
}

// Draw Misc 

function drawCircle(ctx, R, x, y) {
    drawParametric(ctx, function(t){
        return R * Math.cos(t) + x;
    }, function(t) {
        return R * Math.sin(t) + y;
    }, createRange(0, 2 * Math.PI, 100))
}

function drawX(ctx, size, x, y) {
    var halfSize = size / 2.0;

    drawParametric(ctx, function(t){
        return t + x
    }, function(t) {
        return t + y;
    }, createRange(-halfSize, halfSize, 2));


    drawParametric(ctx, function(t){
        return t + x
    }, function(t) {
        return -t + y;
    }, createRange(-halfSize, halfSize, 2));
}

function drawMarker(ctx, size, x, y) {
    drawCircle(ctx, size, x, y);
    drawX(ctx, 0.5 * size * Math.sqrt(2), x, y);
}

function drawField(ctx, fx, fy, fsize, tRange, uRange) {
    tuRange = crossProductArr(tRange, uRange);

    for (var i=0; i<tuRange.length; i++) {
        var t = tuRange[i][0];
        var u = tuRange[i][1];
        var x = fx(t, u);
        var y = fy(t, u);
        var size = fsize(t, u);
        drawDot(ctx, x, y, size);
    }

    for (var i=0; i<(tRange.length - 1); i++) {
        for (var j=0; j<(uRange.length - 1); j++) {
            var t = tRange[i];
            var u = uRange[j];
            var x = fx(t, u);
            var y = fy(t, u);
            var tNext = tRange[i + 1];
            var uNext = uRange[j + 1];
            
            var xRight = fx(tNext, u);
            var yRight = fy(tNext, u);

            var xBottom = fx(t, uNext);
            var yBottom = fy(t, uNext);

            drawLineSegment(ctx, x, y, xRight, yRight);
            drawLineSegment(ctx, x, y, xBottom, yBottom);
        }
    }    
}

function _color(color) {
    return 'rgba(' + Math.floor(color[DIM_R] * 255) + ',' + Math.floor(color[DIM_G] * 255) + ',' + Math.floor(color[DIM_B] * 255) + ',' + color[DIM_A] + ')';   
}

function drawPixel(ctx, pos, color) {
    ctx.fillStyle = _color(color);
    ctx.fillRect(pos[DIM_X], pos[DIM_Y], 2/WIDTH, 2/HEIGHT);
}


function CreateBuffer() {
    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = offscreenCanvas.getContext('2d');

    var pixelImageData = ctx.createImageData(1,1); // only do this once per page
    var data = pixelImageData.data;

    var invCenteringTransform = CGTransformConcat(CGTransformTranslate(-0.5, -0.5), CGTransformScale(1/WIDTH, 1/HEIGHT));

    
    function setPixel(pos, color) {
        ctx.fillStyle = _color(color);
        ctx.fillRect(pos[DIM_X], pos[DIM_Y], 2/WIDTH, 2/HEIGHT);
    }

    function setPixel2(pos, color) {
        data[DIM_R] = color[DIM_R] * 255;
        data[DIM_G] = color[DIM_G] * 255;
        data[DIM_B] = color[DIM_B] * 255;
        data[DIM_A] = color[DIM_A];
        var canvasPos = _mutliplyMatrixVector(_matrixFromTransform(invCenteringTransform), [pos[DIM_X], pos[DIM_Y], 1]);
        ctx.putImageData(pixelImageData, canvasPos[DIM_X], canvasPos[DIM_Y]);
    }

    return {
        'setPixel' : setPixel,
        'setPixel2' : setPixel2,
        'getPixel' : null,
    };
}

