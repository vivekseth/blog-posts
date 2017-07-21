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

function CreateCamera() {
    var data = {};
    data.position = [0, 0, -5];
    data.target = [0, 0, 0];
    data.up = [0, 1, 0];
    data.pitch = 0;
    data.yaw = Math.PI / 2.0;

    function _method(obj, func) {
        return func.bind(obj);
    }

    data.matrix = function() {
        return Transform3DCamera(this.position, this.target, this.up);
    }.bind(data);

    data.front = _method(data, function() {
        return _normalize(_subtract(this.target, this.position));
    });

    data.setFront = _method(data, function(front) {
        this.target = _add(this.position, _normalize(front));
    });

    data.setYaw = _method(data, function(yaw){
        this.yaw = yaw;
        this.updateFrontWithAngles();
    })

    data.setPitch = _method(data, function(pitch){
        this.pitch = pitch;
        this.updateFrontWithAngles();
    })

    data.updateFrontWithAngles = _method(data, function(){
        var front = [];
        front[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        front[1] = Math.sin(this.pitch)
        front[2] = Math.sin(this.yaw) * Math.cos(this.pitch);
        this.setFront(front);
    })

    return data;
}

