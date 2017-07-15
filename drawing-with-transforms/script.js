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

var ActiveHandlers = {};

function _defaultTransformCamera() {
    var position = [0, 0, 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    return Transform3DCamera(position, target, up);
}

function CreateCamera() {
    var data = {};
    data.position = [0, 0, 5];
    data.target = [0, 0, 0];
    data.up = [0, 1, 0];
    data.matrix = function() {
        return Transform3DCamera(this.position, this.target, this.up);
    }.bind(data);

    data.getPosition = function() {
        return this.position;
    }.bind(data);

    data.setPosition = function(pos) {
        this.position = pos;
    }.bind(data);

    data.getTarget = function() {
        return this.target;
    }.bind(data);

    data.setTarget = function(target) {
        this.target = target;
    }.bind(data);

    data.getUp = function() {
        return this.up;
    }.bind(data);

     data.setUp = function(up) {
        this.up = up;
    }.bind(data);

    return data;
}

var Camera = CreateCamera();


// var cube = CreateCubeNode()
// var cube2 = CreateCubeNode();
// var cube3 = CreateCubeNode();
// var cube4 = CreateCubeNode();

var cubes = (function(n){
    var arr = []
    for (var i=0; i<n; i++) {
        arr.push(CreateCubeNode());
    }
    return arr;
})(200);

var centeringTransform = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
function render(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
        // Centering Transform
        CGTransformApply(ctx, centeringTransform);
        ctx.save();
            // Draw stuff
            var projectionFromCamera = _defaultTransformPerspective();
            var cameraFromWorld = Camera.matrix();
            var worldFromModel = Transform3DRotation([0, 1, 0], Math.PI * t);
            var projectionFromModel = _matrixMultiply(_matrixMultiply(projectionFromCamera, cameraFromWorld), worldFromModel);

            ctx.lineWidth = 0.0001;

            var size = 1.0;
            
            for (var i = 0; i < cubes.length; i++) {
                var c = cubes[i];
                c.scale(size - i * 0.01);
                c.draw(ctx, projectionFromModel);
            }

        ctx.restore();
    ctx.restore();
}


var anim = CreateAnimation(function(relativeTimestamp, duration){
    // Handle user input
    for (handler in ActiveHandlers) {
        ActiveHandlers[handler](relativeTimestamp, duration);
    }

    // Draw
    render(0.0001 * relativeTimestamp);
})
anim.start();
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

function handlerForKey(key) {
    var dict = {
        'ArrowUp' : function (timestamp, duration) {
            var pos = Camera.getPosition();
            pos[2] += (duration * -0.01);
            Camera.setPosition(pos);

            var target = Camera.getTarget();
            target[2] += (duration * -0.01);
            Camera.setTarget(target);
        },
        
        'ArrowDown' : function (timestamp, duration) {
            var pos = Camera.getPosition();
            pos[2] += duration * 0.01;
            Camera.setPosition(pos);

            var target = Camera.getTarget();
            target[2] += (duration * 0.01);
            Camera.setTarget(target);
        },

        'ArrowLeft' : function (timestamp, duration) {
            var pos = Camera.getPosition();
            pos[0] += (duration * -0.01);
            Camera.setPosition(pos);

            var target = Camera.getTarget();
            target[0] += (duration * -0.01);
            Camera.setTarget(target);
        },

        'ArrowRight' : function (timestamp, duration) {
            var pos = Camera.getPosition();
            pos[0] += (duration * 0.01);
            Camera.setPosition(pos);

            var target = Camera.getTarget();
            target[0] += (duration * 0.01);
            Camera.setTarget(target);
        },
    };
    return dict[key];
}



var CurrentInputID = -1;
function createSlider(options, handler, labelString) {
    var input = document.createElement('input');
    for (prop in options) {
        input[prop] = options[prop];
    }
    input.type = 'range';


    CurrentInputID += 1;
    input.name = 'input_' + CurrentInputID;
    var label = document.createElement('label');
    label.for = input.name;
    label.textContent = labelString;

    var value = document.createElement('span');
    value.id = 'value_' + input.name;
    value.textContent = options.value;

    input.addEventListener('input', function(event) {
        value.textContent = event.target.valueAsNumber;
        handler(event.target.valueAsNumber);
    }, false);

    var span = document.createElement('span');
    span.appendChild(label);
    span.appendChild(input);
    span.appendChild(value);
    span.style.display = 'block'

    return span;
}

