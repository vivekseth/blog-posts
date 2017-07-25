/// Draw Path

function drawParametric(ctx, fx, fy, tarr) {
    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = fx(tarr[i]), WIDTH;
        var y = fy(tarr[i]), HEIGHT;
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

// Range Util

function createRange(low, high, N) {
    var delta = (high - low);
    var step = delta / N;
    var arr = [];

    for (var i=0; i<(N+1); i++) {
        arr.push(low + step * i);
    }

    return arr;
}

function normalizedSin(t) {
    return ((Math.sin(t) + 1) * 0.5);
}

function normalizedCos(t) {
    return ((Math.cos(t) + 1) * 0.5);
}

function oscillation(low, high, period) {
    var diff = high - low;
    return function(t) {
        return diff * (1 - normalizedCos(Math.PI * 2 * t / period)) + low;
    }
}

function remap(prevLow, prevHigh, newLow, newHigh) {
    return function(t) {
        var prevDiff = (prevHigh - prevLow);
        var newT = ((t - prevLow) / prevDiff);
        var newDiff = (newHigh - newLow);
        return newLow + newT * newDiff;
    }
}

function crossProductArr(A, B) {
    var outputArr = [];
    for (var i=0; i<A.length; i++) {
        for (var j=0; j<B.length; j++) {
            outputArr.push([A[i], B[j]]);
        }
    }
    return outputArr;
}

// TODO(vivek): Create non-linear range's. 

// Transformation Util

// Transform Util

function CGTransformIdentity() {
    return [1, 0, 0, 1, 0, 0];
}

function CGTransformTranslate(tx, ty) {
    return [1, 0, 0, 1, tx, ty];
}

function CGTransformScale(sx, sy) {
    return [sx, 0, 0, sy, 0, 0];
}

function CGTransformRotate(angle) {
    return [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];
}

function CGTransformConcat(t1, t2) {
    var m1 = _matrixFromTransform(t1);
    var m2 = _matrixFromTransform(t2);
    return _transformFromMatrix(_matrixMultiply(m1, m2));
}

function _matrixFromTransform(t) {
    var a = t[0];
    var b = t[1];
    var c = t[2];
    var d = t[3];
    var e = t[4];
    var f = t[5];

    return [
        [a, c, e],
        [b, d, f],
        [0, 0, 1],
    ];
}

function _transformFromMatrix(m) {
    var a = m[0][0];
    var b = m[1][0];
    var c = m[0][1];
    var d = m[1][1];
    var e = m[0][2];
    var f = m[1][2];
    return [a, b, c, d, e, f];
}

// return A * B
function _matrixMultiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

function CGTransformApply(ctx, transform) {
    ctx.transform.apply(ctx, transform);
}

// Animation Util

function CreateAnimation(drawFrame) {
    var animationStart = -1;
    var continueAnimation = false;
    var previousTimestamp = 0;
    var animWrapper = function(currentTimestamp) {
        if (previousTimestamp == 0) {
            previousTimestamp = currentTimestamp;
        }

        if (animationStart == -1) {
            animationStart = currentTimestamp;
        }

        var relativeTimestamp = currentTimestamp - animationStart;
        var duration = currentTimestamp - previousTimestamp;


        drawFrame(relativeTimestamp, duration);

        if (continueAnimation) {
            requestAnimationFrame(animWrapper);
        }
    }

    var startAnimation = function() {
        continueAnimation = true;
        requestAnimationFrame(animWrapper);  
    }

    var stopAnimation = function() {
        continueAnimation = false;
    }

    return {
        'start': startAnimation,
        'stop': stopAnimation,
    }
}

var CreateRunLoop = CreateAnimation;

// Interpolation 

function interpolateValue(A, B) {
    return function(t) {
        return ((1 - t) * A) + (t * B);
    }
}

function interpolateFunc(f, g) {
    return function(t) {
        return function() {
            return interpolateValue(f.apply(null, arguments), g.apply(null, arguments))(t);
        }
    }
}


