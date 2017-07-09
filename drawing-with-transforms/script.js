var HEIGHT = 600;
var WIDTH = 600;

var body = document.body;
body.style.margin = 0;
body.style.backgroundColor = '#eee';

var canvas = document.getElementById('canvas')
canvas.style.position = 'absolute'
canvas.style.top = '50%';
canvas.style.left = '50%';
canvas.style.marginTop = (-1 * HEIGHT / 2.0) + 'px'
canvas.style.marginLeft = (-1 * WIDTH / 2.0) + 'px'
canvas.style.height = HEIGHT;
canvas.height = HEIGHT;
canvas.style.width = WIDTH;
canvas.width = WIDTH;
canvas.style.backgroundColor = '#000';

var ctx = canvas.getContext("2d");

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



// Util

function range(low, high, N) {
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

// Draw Primitives 

function drawCircle(ctx, R, x, y) {
    drawParametric(ctx, function(t){
        return R * Math.cos(t) + x;
    }, function(t) {
        return R * Math.sin(t) + y;
    }, range(0, 2 * Math.PI, 100))
}

function drawX(ctx, size, x, y) {
    var halfSize = size / 2.0;

    drawParametric(ctx, function(t){
        return t + x
    }, function(t) {
        return t + y;
    }, range(-halfSize, halfSize, 2));


    drawParametric(ctx, function(t){
        return t + x
    }, function(t) {
        return -t + y;
    }, range(-halfSize, halfSize, 2));
}

function drawMarker(ctx, size, x, y) {
    drawCircle(ctx, size, x, y);
    drawX(ctx, 0.5 * size * Math.sqrt(2), x, y);
}

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

function applyTransform(ctx, transform) {
    ctx.transform.apply(ctx, transform);
}

// Animation

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

function crossProductArr(A, B) {
    var outputArr = [];
    for (var i=0; i<A.length; i++) {
        for (var j=0; j<B.length; j++) {
            outputArr.push([A[i], B[j]]);
        }
    }
    return outputArr;
}

function drawField(ctx, fx, fy, fsize, tRange, uRange) {
    tuRange = crossProductArr(tRange, uRange);

    console.log(tuRange);

    for (var i=0; i<tuRange.length; i++) {
        var t = tuRange[i][0];
        var u = tuRange[i][1];
        var x = fx(t, u);
        var y = fy(t, u);
        var size = fsize(t, u);
        drawDot(ctx, x, y, size);
    }
}

function funcInterpolate2(f, g) {
    return function(t) {
        return function(u, v) {
            return ((1 - t) * f(u, v)) + (t * g(u, v))
        }
    }
}


var fromAngle = 0;
var toAngle = 0.3333 * Math.PI;

var fx = funcInterpolate2(function (u, v) {
    return Math.cos(fromAngle) * u - Math.sin(fromAngle) * v;
}, function(u, v) {
    return Math.cos(toAngle) * u - Math.sin(toAngle) * v;
})

var fy = funcInterpolate2(function (u, v) {
    return Math.sin(fromAngle) * u + Math.cos(fromAngle) * v;
}, function(u, v) {
    return Math.sin(toAngle) * u + Math.cos(toAngle) * v;
})

function render(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    var trans = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
    applyTransform(ctx, trans);
    ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        drawField(ctx, fx(t), fy(t), function(t, u) {
            return 0.01;
        }, range(-2, 2, 50), range(-2, 2, 50))
    ctx.restore();
    ctx.restore();
}

render(0)

function sliderChange(t) {
    render(t);
}




// // Create a capturer that exports PNG images in a TAR file
// // var capturer = new CCapture( { format: 'png' } );
// // capturer.start();

// // console.log('hello world');

// var anim = CreateAnimation(function(curr, duration) {
//     var N = 30;
//     var animLow = N - 2;
//     var animHigh = N + 2;
//     var ROWS = 10;

//     console.log('anim');

//     var osc = oscillation(animLow, animHigh, 10000)
    
//     // DEBUG
//     // var scaleMap = remap(animLow, animHigh, -0.4, 0.4);
//     // osc = function(t) {
//     //     return 60;
//     // }

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Apply centering transform
//     ctx.save();
//         var trans = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
//         applyTransform(ctx, trans);

//         // Apply rotation
//         // ctx.save();
//         //     var trans = CGTransformRotate(0.001 * curr);
//         //     applyTransform(ctx, trans);


//             for (var i =-ROWS; i<=ROWS; i++) {
//                 ctx.save();
//                     ctx.fillStyle = 'rgba(255,255,255,0.2)';
//                     drawParametricDots(ctx, function(t){
//                         return t;
//                     }, function(t){
//                         return 0.2 * Math.cos((2 * Math.PI * t * N) + (curr * 0.003) + 0.15 * i)
//                     }, function(t){
//                         return (0.5 * 0.5 - (t * t)) * 0.1; 
//                     }, range(-0.5, 0.5, osc(curr)))
//                 ctx.restore();
//             }

//         // ctx.restore();

//         // DEBUG
//         // ctx.save();
//         //     var markerX = scaleMap(osc(curr))
//         //     var markerY = -0.4;
//         //     ctx.lineWidth=0.003;
//         //     ctx.strokeStyle = 'rgba(255,0,0,1.0)';
//         //     drawMarker(ctx, 0.02, markerX, markerY);
//         // ctx.restore();

//     ctx.restore();

//     // ctx.font = "14px Avenir";
//     // ctx.fillStyle = 'rgba(255,0,0,1.0)';
//     // ctx.fillText("" + Math.floor(100 * osc(curr)) / 100, 0 + 15, 10 + 15);

//     // capturer.capture(canvas);
// });
// anim.start();

// // setTimeout(function(){
// //     console.log('END')
// //     capturer.stop();
// //     capturer.save();
// //     anim.stop();
// // }, 1000);
