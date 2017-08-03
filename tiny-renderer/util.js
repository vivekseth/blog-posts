// Globals

var DIM_X = 0;
var DIM_Y = 1;
var DIM_Z = 2;
var DIM_W = 3;

var DIM_R = 0;
var DIM_G = 1;
var DIM_B = 2;
var DIM_A = 3;

var DIM_U = 0;
var DIM_V = 1;
var DIM_W = 2;

// TOOD(vivek): move all drawing primitives out to separate file. 

// Range Util

// TODO(vivek): Create non-linear ranges. 
function createRange(low, high, N) {
    var delta = (high - low);
    var step = delta / N;
    var arr = [];

    for (var i=0; i<(N+1); i++) {
        arr.push(low + step * i);
    }

    return arr;
}

function remap(prevLow, prevHigh, newLow, newHigh) {
    return function(t) {
        var prevDiff = (prevHigh - prevLow);
        var newT = ((t - prevLow) / prevDiff);
        var newDiff = (newHigh - newLow);
        return newLow + newT * newDiff;
    }
}

function oscillation(low, high, period) {
    var diff = high - low;
    return function(t) {
        return diff * (1 - normalizedCos(Math.PI * 2 * t / period)) + low;
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

function normalizedSin(t) {
    return ((Math.sin(t) + 1) * 0.5);
}

function normalizedCos(t) {
    return ((Math.cos(t) + 1) * 0.5);
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
        previousTimestamp = currentTimestamp;


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

    var stepAnimation = function() {
        requestAnimationFrame(animWrapper);
    }

    return {
        'start': startAnimation,
        'stop': stopAnimation,
        'step': stepAnimation,
    }
}

// Renaming constructor to make more sense for a game
var CreateRunLoop = CreateAnimation;
