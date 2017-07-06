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


// function drawParametric(ctx, fx, fy, tarr) {
//     for (var i=0; i<(tarr.length - 1); i++) {
//         var x1 = fx(tarr[i]);
//         var y1 = fy(tarr[i]);
//         var x2 = fx(tarr[i + 1]);
//         var y2 = fy(tarr[i + 1]);
//         drawLine(ctx, x1, y1, x2, y2);
//     }
// }


// Code Sample
// drawParametric(ctx, function(t) {
//     return t
// }, function(t) {
//     return t
// }, [200, 400]);


// drawParametric(ctx, function(t) {
//     return 600 - t
// }, function(t) {
//     return t
// }, [200, 400]


function range(low, high, N) {
    var delta = (high - low);
    var step = delta / N;
    var arr = [];

    for (var i=0; i<(N+1); i++) {
        arr.push(low + step * i);
    }

    return arr;
}


// Code sample
// drawParametric(ctx, function(t) {
//     return 100 * Math.cos(t)
// }, function(t) {
//     return 100 * Math.sin(t)
// }, range(0, 2 * Math.PI, 100));


// Code sample
// drawParametric(ctx, function(t) {
//     return 100 * Math.cos(t) + 300
// }, function(t) {
//     return 100 * Math.sin(t) + 300
// }, range(0, 2 * Math.PI, 100));


// New drawParametric
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


// Code Sample
// drawParametric(ctx, function(t) {
//     return 0.1 * Math.cos(t)
// }, function(t) {
//     return 0.1 * Math.sin(t)
// }, range(0, 2 * Math.PI, 100));


function drawPolar(ctx, fth, tr, tarr) {
    var fx = function(t) {
        return tr(t) * Math.cos(fth(t));
    }

    var fy = function(t) {
        return tr(t) * Math.sin(fth(t));
    }

    drawParametric(ctx, fx, fy, tarr);
}


// Code Sample 
// drawPolar(ctx, function(t) {
//     return t
// }, function(t) {
//     return 0.1
// }, range(0, 2 * Math.PI, 100))


// Code Sample
// ctx.lineWidth=0.2;
// drawPolar(ctx, function(t){
//     return t
// }, function(t){
//     return 0.4 * Math.sin(t/1.2)
// }, range(0, 38, 800));


// Code Sample
// ctx.lineWidth=0.2;
// drawPolar(ctx, function(t){
//     return t
// }, function(t){
//     return 0.4 * Math.sin(t/1.2)
// }, range(0, 500, 800));


// Code Sample
// ctx.lineWidth=0.2;
// drawPolar(ctx, function(t){
//     return t
// }, function(t){
//     return 0.005 * t
// }, range(0, 100, 800));


// Code Sample
// ctx.lineWidth=0.2;
// drawPolar(ctx, function(t){
//     return t
// }, function(t){
//     return 0.005 * t
// }, range(0, 100, 80));


// Code Sample
ctx.lineWidth=10;
drawPolar(ctx, function(t){
    return t
}, function(t){
    return 0.1 * Math.sin(t / 0.5) * Math.sin(t / 0.2) + t * 0.018
}, range(-200, 200, 8000));

