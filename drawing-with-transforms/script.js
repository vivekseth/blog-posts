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





function render(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
        // Centering Transform
        var trans = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
        CGTransformApply(ctx, trans);
        ctx.save();
            // Draw stuff

            var projectionFromCamera = _defaultTransformPerspective();
            var cameraFromWorld = _defaultTransformCamera();
            var worldFromModel = Transform3DRotation(math.matrix([0, 1, 0]), 2 * Math.PI * t);
            var projectionFromModel = math.multiply(math.multiply(projectionFromCamera, cameraFromWorld), worldFromModel);

            ctx.lineWidth = 0.001;
            drawParametric3D(ctx, function(t){
                return 1.0 * Math.cos(t);
            }, function(t){
                return 1.0 * Math.sin(t);
            }, function(t){
                return 0;
            }, projectionFromModel, createRange(0, 2 * Math.PI, 10))

            drawCube(ctx, projectionFromModel);

        ctx.restore();
    ctx.restore();
}


var anim = CreateAnimation(function(relativeTimestamp, duration){
    render(0.0001 * relativeTimestamp);
})
anim.start();
// anim.stop();





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

