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

function _method(obj, func) {
    return func.bind(obj);
}

function CreateCamera() {
    var data = {};
    data.position = [0, 0, -5];
    data.target = [0, 0, 0];
    data.up = [0, 1, 0];
    data.pitch = 0;
    data.yaw = Math.PI / 2.0;

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

    // Util

    // TODO(vivek): make this less janky. I want to be able to turn!
    data.move = function(dimension, amount) {
        this.position[dimension] += amount;
        this.target[dimension] += amount;

        console.log(this.position, this.target);
    }.bind(data);

    return data;
}

var Camera = CreateCamera();

var cubes = (function(n){
    var arr = []
    for (var i=0; i<n; i++) {
        arr.push(CreateCubeNode());
    }
    return arr;
})(100);

var centeringTransform = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
function render(timestamp, duration) {
    var t = 0.0001 * timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
        // Centering Transform
        CGTransformApply(ctx, centeringTransform);
        ctx.save();
            // Draw stuff
            var projectionFromCamera = _defaultTransformPerspective();
            var cameraFromWorld = Camera.matrix();
            var worldFromModel = Transform3DIdentity(); // Transform3DRotation([0, 1, 0], Math.PI * t);
            var projectionFromModel = _matrixMultiply(_matrixMultiply(projectionFromCamera, cameraFromWorld), worldFromModel);

            ctx.lineWidth = 0.00025;

            var size = 1.0;
            
            for (var i = 0; i < cubes.length; i++) {
                var c = cubes[i];
                c.scale(size - i * 0.02);
                c.draw(ctx, projectionFromModel);
            }

        ctx.restore();
    ctx.restore();
}

function handleInput(timestamp, duration) {
    for (handler in ActiveHandlers) {
        ActiveHandlers[handler](timestamp, duration);
    }
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

