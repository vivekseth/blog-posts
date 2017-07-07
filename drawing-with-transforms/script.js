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

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();   
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

// New drawParametric
function drawParametric(ctx, fx, fy, tarr) {
    function center(coordinate, dimensionLength) {
        return (coordinate + 0.5) * dimensionLength;
    }

    var first = true;

    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = center(fx(tarr[i]), WIDTH);
        var y = center(fy(tarr[i]), HEIGHT);

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

function drawPolar(ctx, fth, tr, tarr) {
    var fx = function(t) {
        return tr(t) * Math.cos(fth(t));
    }

    var fy = function(t) {
        return tr(t) * Math.sin(fth(t));
    }

    drawParametric(ctx, fx, fy, tarr);
}

function CreateAnimation(anim) {
    var shouldContinueAnimation = false;
    var previousTimestamp = 0;
    function animationWrapper(currentTimestamp) {
        if (previousTimestamp == 0) {
            previousTimestamp = currentTimestamp;
        }

        var duration = currentTimestamp - previousTimestamp;

        anim(currentTimestamp, duration);

        if (shouldContinueAnimation){
            requestAnimationFrame(animationWrapper);
        }
    }

    function stopAnimation() {
        shouldContinueAnimation = false;
    }

    function startAnimation() {
        shouldContinueAnimation = true;
        requestAnimationFrame(animationWrapper);
    }

    return {
        'start' : startAnimation,
        'stop' : stopAnimation,
    };
}

var a = CreateAnimation(function(timestamp){
    var x = (10 * (0.5 * (Math.cos(0.0005 * timestamp) + 1.0)) + 150);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Code Sample
    ctx.lineWidth=0.3; // (Math.cos(0.01 * timestamp) * 0.3) + 0.4;
    drawPolar(ctx, function(t){
        return t
    }, function(t){
        return (0.5) * Math.sin(t / 0.7);
    }, range(0, 200, x));
});
a.start();

setTimeout(function(){
    a.stop();
}, 3000);




