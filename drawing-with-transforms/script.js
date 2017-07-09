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
canvas.style.backgroundColor = '#000';

var ctx = canvas.getContext("2d");

var fromAngle = 0;
var toAngle = 0.3333 * Math.PI;

var fx = interpolateFunc(function (u, v) {
    return u
}, function(u, v) {
    return u + 0.1 * Math.sin(v * 2 * 2 * Math.PI);
})

var fy = interpolateFunc(function (u, v) {
    return v;
}, function(u, v) {
    return v;
})

var _t = 0;
var _xStep = 10;
var _yStep = 10;

var _range = 1;

function render(t, xStep, yStep, range) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
        var trans = CGTransformConcat(CGTransformScale(WIDTH, HEIGHT), CGTransformTranslate(0.5, 0.5));
        CGTransformApply(ctx, trans);
        ctx.save();
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth=0.003;
            drawField(ctx, fx(t), fy(t), function(t, u) {
                return 0.005;
            }, createRange(-0.5 * range, 0.5 * range, xStep * range), createRange(-0.5 * range, 0.5 * range, yStep * range))
        ctx.restore();
    ctx.restore();
}

function globalRender() {
    render(_t, _xStep, _yStep, _range);
}
globalRender();

// var anim = CreateAnimation(function(curr, duration) {
//     var osc = oscillation(-0.1, 0.1, 5000);
//     render(osc(curr));
// });
// anim.start();

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

document.body.appendChild(createSlider({
    'min': 0, 
    'max': 1, 
    'step': 0.0001, 
    'value': 0
}, function(t) {
    _t = t;
    globalRender();
}, 't: '));

document.body.appendChild(createSlider({
    'min': 5, 
    'max': 15, 
    'step': 1, 
    'value': 10
}, function(xStep) {
    _xStep = xStep;
    globalRender();
}, 'xStep: '));

document.body.appendChild(createSlider({
    'min': 5, 
    'max': 15, 
    'step': 1, 
    'value': 10
}, function(yStep) {
    _yStep = yStep;
    globalRender();
}, 'yStep: '));

document.body.appendChild(createSlider({
    'min': 0.2, 
    'max': 6, 
    'step': 0.01, 
    'value': 1
}, function(range) {
    _range = range;
    globalRender();
}, 'range: '));
