var HEIGHT = 600;
var WIDTH = 600;

var body = document.body;
// body.style.margin = 0;
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
var CenteringTransform = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
var Camera = CreateCamera();
var ActiveHandlers = {};

var cubes = (function(L, W, H){
    var arr = []
    for (var i=0; i<L; i++) {
        for (var j=0; j<W; j++) {
            for (var k=0; k<H; k++) {
                var cube = CreateCubeNode();
                cube.position([i, k - 0.5 * H, j])
                arr.push(cube);
            }
        }
    }
    return arr;
})(5, 5, 5);


function handleInput(timestamp, duration) {
    for (handler in ActiveHandlers) {
        ActiveHandlers[handler](timestamp, duration);
    }
}

function render(timestamp, duration) {
    var t = 0.0001 * timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

        CGTransformApply(ctx, CenteringTransform);
        ctx.save();
            
            var projectionFromCamera = _defaultTransformPerspective();
            var cameraFromWorld = Camera.matrix();
            var worldFromModel = Transform3DIdentity();
            var projectionFromModel = _matrixMultiply(_matrixMultiply(projectionFromCamera, cameraFromWorld), worldFromModel);

            ctx.lineWidth = .00125;

            for (var i = 0; i < cubes.length; i++) {
                var c = cubes[i];
                c.scale(0.1);
                c.rotate([1, 1, 1], Math.PI * t);
                c.draw(ctx, projectionFromModel);
            }

        ctx.restore();
    ctx.restore();
}

var runloop = CreateRunLoop(function(timestamp, duration){
    handleInput(timestamp, duration);
    render(timestamp, duration);
})
runloop.start();
// anim.stop();

document.addEventListener('keydown', function (event) {
    var f = handlerForKey(event.key);
    if (f) {
        ActiveHandlers[event.key] = f;
    }
}, false);

document.addEventListener('keyup', function (event) {
  if (event.key in ActiveHandlers) {
    delete ActiveHandlers[event.key];
  }
}, false);



// UTIL

function handlerForKey(key) {
    var dict = {
        'ArrowUp' : function (timestamp, duration) {
            var front = Camera.front();
            var pos = Camera.position.slice();
            pos = _add(pos, _multiply(front, duration * 0.01));
            Camera.position = pos;
            Camera.updateFrontWithAngles();
        },
        
        'ArrowDown' : function (timestamp, duration) {
            var front = Camera.front();
            var pos = Camera.position.slice();
            pos = _add(pos, _multiply(front, duration * -0.01));
            Camera.position = pos;
            Camera.updateFrontWithAngles();
        },

        'ArrowLeft' : function (timestamp, duration) {
            var yaw = Camera.yaw;
            Camera.setYaw(yaw -= duration * 0.001)
            Camera.updateFrontWithAngles();
        },

        'ArrowRight' : function (timestamp, duration) {
            var yaw = Camera.yaw;
            Camera.setYaw(yaw += duration * 0.001)
            Camera.updateFrontWithAngles();
        },
    };
    return dict[key];
}
