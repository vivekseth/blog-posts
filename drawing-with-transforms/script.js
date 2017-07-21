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

function drawParametric3D(ctx, fx, fy, fz, transform, tarr) {
    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = fx(tarr[i]);
        var y = fy(tarr[i]);
        var z = fz(tarr[i]);

        var point = math.matrix([x, y, z, 1]);
        var tPoint = math.multiply(transform, point);

        var px = tPoint.get([0]) / tPoint.get([3]);
        var py = tPoint.get([1]) / tPoint.get([3]);

        if (i == 0) {
            ctx.moveTo(px, py);
        }
        else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function _matrix3x3ToTransform2D(mat) {
    var a = mat.get([0, 0]);
    var b = mat.get([1, 0]);
    var c = mat.get([0, 1]);
    var d = mat.get([1, 1]);
    var e = mat.get([0, 2]);
    var f = mat.get([1, 2]);
    return [a, b, c, d, e, f];
}

function _transform2DToMatrix3x3(transform) {
    var mat = math.eye(3);

    mat.set([0, 0], transform[0]);
    mat.set([1, 0], transform[1]);
    mat.set([0, 1], transform[2]);
    mat.set([1, 1], transform[3]);
    mat.set([0, 2], transform[4]);
    mat.set([1, 2], transform[5]);

    return mat;
}

function Transform2DTranslate(x, y) {
    var mat = math.eye(3);

    mat.set([0, 2], x);
    mat.set([1, 2], y);

    return mat;
}

function Transform2DScale(sx, sy) {
    var mat = math.eye(3);

    mat.set([0, 0], sx);
    mat.set([1, 1], sy);

    return mat;
}

function Transform2DRotate(angle) {
    var mat = math.eye(3);

    mat.set([0, 0], Math.cos(angle));
    mat.set([1, 0], Math.sin(angle));
    mat.set([0, 1], -Math.sin(angle));
    mat.set([1, 1], Math.cos(angle));

    return mat;
}


function Transform3DTranslate(vec) {
    var mat = math.eye(4);

    mat.set([0, 3], vec.get([0]));
    mat.set([1, 3], vec.get([1]));
    mat.set([2, 3], vec.get([2]));

    return mat;
}


// aspect = drawableSize.width / drawableSize.height;
// const float fov = (2 * M_PI) / 5;
// const float near = 1;
// const float far = 100;
function Transform3DPerspective(fovy, aspect, zNear, zFar) {
    var mat = math.matrix(math.zeros([4, 4]));

    var a = fovy / aspect;
    var b = fovy;
    var c = (zFar + zNear) / (zNear - zFar);
    var d = (2 * zFar * zNear) / (zNear - zFar);
    var e = -1;

    mat.set([0, 0], a);
    mat.set([1, 1], b);
    mat.set([2, 2], c);
    mat.set([2, 3], d);
    mat.set([3, 2], e);

    return mat;
}

function _defaultTransformPerspective() {
    var fov = Math.PI * 2 / 5.0;
    var aspect = canvas.width / canvas.height;
    var near = 1;
    var far = 100;
    return Transform3DPerspective(fov, aspect, near, far);
}


function Transform3DCamera(position, target, up) {
    function _normalize(vec) {
        return math.divide(vec, math.norm(vec));
    }

    var normCameraDirection = _normalize(math.subtract(position, target));
    var normCameraRight =  _normalize(math.cross(up, normCameraDirection));
    var normCameraUp = math.cross(normCameraDirection, normCameraRight);

    // TODO(vivek): might need to transpose this!
    var data = [
        [normCameraRight.get([0]), normCameraUp.get([0]), normCameraDirection.get([0]), 0],
        [normCameraRight.get([1]), normCameraUp.get([1]), normCameraDirection.get([1]), 0],
        [normCameraRight.get([2]), normCameraUp.get([2]), normCameraDirection.get([2]), 0],
        [                       0,                     0,                            0, 1]
    ];
    var cameraLocalCoordinateSpaceMatrix = math.matrix(data);
    var cameraTranslationMatrix = Transform3DTranslate(math.multiply(-1.0, position));
    return math.multiply(cameraLocalCoordinateSpaceMatrix, cameraTranslationMatrix);
}

function _defaultCameraMatrix() {
    var position = math.matrix([0.5, 0, -5]);
    var target = math.matrix([0, 0, 0]);
    var up = math.matrix([0, 1, 0]);
    return Transform3DCamera(position, target, up);
}

var viewFromWorld = _defaultCameraMatrix();
var projectionFromView = _defaultTransformPerspective();
var projectionFromWorld = math.multiply(projectionFromView, viewFromWorld);




ctx.applyTransform = function(mat) {
    var trans = _matrix3x3ToTransform2D(mat);
    this.transform.apply(this, trans);
    return this;
}.bind(ctx);

ctx.applyTransform(Transform2DScale(WIDTH, HEIGHT));
ctx.applyTransform(Transform2DTranslate(0.5, 0.5));

// ctx.lineWidth = (1 / WIDTH) * 0.5;
// drawParametric3D(ctx, function(t){
//     return 1 * Math.cos(t);
// }, function(t){
//     return 1 * Math.sin(t);
// }, function(t){
//     return 0;
// }, math.multiply(projectionFromView, viewFromWorld), range(0, 2*Math.PI, 100))


function drawCircle3D(radius, projectionFromWorld, worldFromModel) {
    ctx.lineWidth = (1 / WIDTH) * 0.5;
    drawParametric3D(ctx, function(t){
        return radius * Math.cos(t);
    }, function(t){
        return radius * Math.sin(t);
    }, function(t){
        return 0;
    }, math.multiply(projectionFromWorld, worldFromModel), range(0, 2*Math.PI, 100))
}

// drawCircle3D(1, projectionFromWorld, Transform3DTranslate(math.matrix([0, 0, 0])));
// drawCircle3D(1, projectionFromWorld, Transform3DTranslate(math.matrix([0, 0, 1])));
// drawCircle3D(1, projectionFromWorld, Transform3DTranslate(math.matrix([0, 0, 2])));
// drawCircle3D(1, projectionFromWorld, Transform3DTranslate(math.matrix([0, 0, 3])));


for (var i=0; i<10; i++) {
    drawCircle3D(1, projectionFromWorld, Transform3DTranslate(math.matrix([0, 0, i])));    
}



// var addMethod = function(obj, method, func) {
//     obj[method] = func.bind(obj);
// }

// addMethod(ctx, 'applyTransform', function(mat){
//     var trans = _matrix3x3ToTransform2D(mat);
//     this.transform.apply(this, trans);
//     return this;
// })

// var applyTransform = function(mat) {
//     var trans = _matrix3x3ToTransform2D(mat);
//     this.transform.apply(this, trans);
//     return this;
// }.bind(ctx);




// function CreateAnimation(anim) {
//     var shouldContinueAnimation = false;
//     var previousTimestamp = 0;
//     function animationWrapper(currentTimestamp) {
//         if (previousTimestamp == 0) {
//             previousTimestamp = currentTimestamp;
//         }

//         var duration = currentTimestamp - previousTimestamp;

//         anim(currentTimestamp, duration);

//         if (shouldContinueAnimation){
//             requestAnimationFrame(animationWrapper);
//         }
//     }

//     function stopAnimation() {
//         shouldContinueAnimation = false;
//     }

//     function startAnimation() {
//         shouldContinueAnimation = true;
//         requestAnimationFrame(animationWrapper);
//     }

//     return {
//         'start' : startAnimation,
//         'stop' : stopAnimation,
//     };
// }

// var a = CreateAnimation(function(timestamp){
//     var x = (10 * (0.5 * (Math.cos(0.0005 * timestamp) + 1.0)) + 150);

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Code Sample
//     ctx.lineWidth=0.3; // (Math.cos(0.01 * timestamp) * 0.3) + 0.4;
//     drawPolar(ctx, function(t){
//         return t
//     }, function(t){
//         return (0.5) * Math.sin(t / 0.7);
//     }, range(0, 200, x));
// });
// a.start();

// setTimeout(function(){
//     a.stop();
// }, 3000);




