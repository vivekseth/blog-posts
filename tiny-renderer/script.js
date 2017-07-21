var body = document.body;
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
                cube.position([i - 0.5 * L, k - 0.5 * H, j - 0.5 * W])
                arr.push(cube);
            }
        }
    }
    return arr;
})(5, 5, 5);


// Input Vertex: Anything
// Output Vertex: vertex['position'] = 4d position coords
function vertexShader(inputVertices, vindex, uniforms) { // -> Some interpolatable output vertex
    var vertex = inputVertices[vindex];
    var outputVertex = vertex;
    return outputVertex;
}

function fragmentShader(interpolatedVertex, bcScreen, screenLocation, uniforms) { // -> pixel color or null
    return [bcScreen[DIM_U], bcScreen[DIM_V], bcScreen[DIM_W], 1];
}

var pipeline = CreateShaderPipeline(vertexShader, fragmentShader);

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

            pipeline.render(ctx, [
                [-0.5, -0.5, 0],
                [-0.5, 0.5, 0],
                [0.5, 0.5, 0],

                [-0.5, -0.5, 0],
                [0.5, -0.5, 0],
                [0.5, 0.5, 0],
            ], {}, {})

        ctx.restore();
    ctx.restore();
}

var runloop = CreateRunLoop(function(timestamp, duration){
    render(timestamp, duration);
})
runloop.start();






