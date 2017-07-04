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
canvas.style.backgroundColor = '#fff';

var ctx = canvas.getContext("2d");

function drawParametric(ctx, fx, fy, tarr) {
    var first = true;
    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = (fx(tarr[i]) + 0.5) * WIDTH;
        var y = (fy(tarr[i]) + 0.5) * HEIGHT;
        if (first) {
            ctx.moveTo(x, y);
            first = false;
        }
        else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();   
}

function drawParametric2(ctx, fx, fy, tarr) {
    for (var i=0; i<(tarr.length - 1); i++) {
        var x1 = fx(tarr[i]);
        var y1 = fy(tarr[i]);
        var x2 = fx(tarr[i + 1]);
        var y2 = fy(tarr[i + 1]);
        drawLine(ctx, x1, y1, x2, y2);
    }
}

function drawPolar(ctx, ftheta, fradius, tarr) {
    var fx = function(t) {
        return fradius(t) * Math.cos(ftheta(t));
    }

    var fy = function(t) {
        return fradius(t) * Math.sin(ftheta(t));
    }

    drawParametric(ctx, fx, fy, tarr);
}



function constantFunc(x) {
    return function(t) {
        return x;
    }
}

function identity() {
    return function(t) {
        return t;
    }
}

function range(low, high, N) {
    var delta = (high - low);
    var step = delta / N;
    var arr = [];

    for (var i=0; i<(N+1); i++) {
        arr.push(low + step * i);
    }

    return arr;
}

function translate(f, x) {
    return function(t) {
        return f(t) + x;
    }
}

function divide(f1, f2) {
    return function(t) {
        return f1(t) / f2(t);
    }
}



function drawCircle(ctx, R, xoff, yoff, zoff, t) {
    var xt = function(t){
        return R * Math.cos(t) + xoff;
    };

    var yt = function(t){
        return yoff;
    };

    var zt = function(t) {
        return R * Math.sin(t) + zoff;   
    }

    drawParametric(ctx, divide(xt, zt), divide(yt, zt), t);
}

function drawCircle2(ctx, R, yoff, zoff, t) {
    var xt = function(t){
        return R * Math.cos(t);
    };

    var yt = function(t){
        return R * Math.sin(t) + yoff;   
    };

    var zt = function(t) {
        return zoff;
    }

    drawParametric(ctx, divide(xt, zt), divide(yt, zt), t);
}


function drawCircle3(ctx, R, xoff, zoff, t) {
    var xt = function(t){
        return xoff;
    };

    var yt = function(t){
        return R * Math.cos(t);
    };

    var zt = function(t) {
        return R * Math.sin(t) + zoff;
    }

    drawParametric(ctx, divide(xt, zt), divide(yt, zt), t);
}

// I think this graph looks nice when drawn with thin lines. 
// ctx.lineWidth=0.2;
// drawPolar(ctx, function(t){
//     return t
// }, function(t){
//     return 0.1 * Math.sin(t / 0.5) * Math.sin(t / 0.2) + t * 0.018
// }, range(-200, 200, 5000));

// drawParametric2(ctx, function(t){return t}, function(t){return t}, [200, 400]);
// drawParametric2(ctx, function(t){return 600 - t}, function(t){return t}, [200, 400])

// drawParametric2(ctx, function(t){return 100 * Math.cos(t) + 300}, function(t){return 100 * Math.sin(t) + 300}, range(0, 2 * Math.PI, 100));

// ctx.lineWidth=0.6;
// drawPolar(ctx, function(t){return t}, function(t){return 0.1}, range(0, 2 * Math.PI, 100))

// drawParametric(ctx, function(t){return t}, function(t){return -5 * Math.pow(t, 2)}, range(-10, 10, 10000))

// function drawParametric(ctx, fx, fy, tarr) {
//     var first = true;
//     ctx.beginPath();
//     for (var i=0; i<tarr.length; i++) {
//         var x = (fx(tarr[i]) + 0.5) * WIDTH;
//         var y = (fy(tarr[i]) + 0.5) * HEIGHT;
//         if (first) {
//             ctx.moveTo(x, y);
//             first = false;
//         }
//         else {
//             ctx.lineTo(x, y);
//         }
//     }
//     ctx.stroke();
// }

function drawParametric(ctx, fx, fy, tarr) {
        function center(coordinate, dimensionLength) {
            return (coordinate + 0.5) * dimensionLength;
        }

        for (var i=0; i<(tarr.length - 1); i++) {
            var x1 = center(fx(tarr[i]), WIDTH);
            var y1 = center(fy(tarr[i]), HEIGHT);
            var x2 = center(fx(tarr[i + 1]), WIDTH);
            var y2 = center(fy(tarr[i + 1]), HEIGHT);
            drawLine(ctx, x1, y1, x2, y2);
        }
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

ctx.lineWidth=0.2;
    drawPolar(ctx, function(t){
        return t
    }, function(t){
        return 0.1 * Math.sin(t / 0.5) * Math.sin(t / 0.2) + t * 0.018
    }, range(-200, 200, 8000));




