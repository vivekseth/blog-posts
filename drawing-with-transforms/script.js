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

//5,6,7, 9
var SPACE = 10;

ctx.drawPixel = function(pos, color) {
    var x = pos[0];
    var y = pos[1];

    var r = Math.floor(255 * color[0]);
    var g = Math.floor(255 * color[1]);
    var b = Math.floor(255 * color[2]);
    var a = color[3];

    this.fillStyle = "rgba("+r+","+g+","+b+","+(a)+")";
    this.fillRect( x, y, 1, 1 );
}.bind(ctx);

ctx.drawBox = function(pos, color, size) {
    var x = pos[0];
    var y = pos[1];

    var r = Math.floor(255 * color[0]);
    var g = Math.floor(255 * color[1]);
    var b = Math.floor(255 * color[2]);
    var a = color[3];

    this.fillStyle = "rgba("+r+","+g+","+b+","+(a)+")";
    this.fillRect( x - 0.5 * size, y - 0.5 * size, size, size );
}.bind(ctx);


function blobFunc(pixel, pos, r) {
    var x = (pixel[0] - pos[0]) / r;
    var y = (pixel[1] - pos[1]) / r;
    return 1 / ((x * x) + (y * y) + 1);
}

function shadeCanvas(ctx, callback) {
    shadeCanvasRect(ctx, 0, 0, WIDTH, HEIGHT, callback);
}

function shadeCanvasRect(ctx, minX, minY, width, height, callback) {
    var c = 0;
    for (var x=minX; x<(minX + width); x++) {
        for (var y=minY; y<(minY + height); y++) {
            var pixel = [x, y]
            var color = callback(pixel);
            ctx.drawPixel(pixel, color);
            c += 1;

            if ((x - minX) * (y - minY) > (SPACE * SPACE)) {
                throw c + 'ERROR';
            }
        }
    }
}

function shadeCanvasSpaced(ctx, space, callback) {
    for (var x=0; x<WIDTH; x+=space) {
        for (var y=0; y<HEIGHT; y+=space) {
            var pixel = [x + space*0.5, y+ space*0.5]
            var color = callback(pixel, [x, y]);
            ctx.drawBox(pixel, color, space);
        }
    }
}

function CreateBlob(pos, radius) {
    var b = {};
    b.position = pos;
    b.radius = radius;
    b.value = function(pixel) {
        return blobFunc(pixel, this.position, this.radius);
    }.bind(b);
    return b;
}

var PrevMousePosition = {};

var MousePosition = {};
MousePosition.x = 0;
MousePosition.y = 0;

function CreateGrid(W, H) {
    var grid = [];

    for (var w=0; w<W; w++) {
        grid.push([])
        var col = grid[w];
        for (var h=0; h<H; h++) {
            col.push(false);
        }
    }    

    return grid;
}

function edgeCoordinates(grid) {
    var W = grid.length;
    var H = grid[0].length;

    function _safeGet(grid, i, j) {
        if (i < 0 || j < 0 || i >= W || j>=H) {
            var iBounded = Math.max(Math.min(i, W-1), 0);
            var jBounded = Math.max(Math.min(j, H-1), 0);
            return grid[iBounded][jBounded]
        }
        else {
            return grid[i][j]
        }
    }

    function _isEdge(grid, i, j) {
        var start = _safeGet(grid, i, j);

        if (_safeGet(grid, i-1, j) == !start) {
            return true;
        }
        else if (_safeGet(grid, i+1, j) == !start) {
            return true;
        }
        else if (_safeGet(grid, i, j-1) == !start) {
            return true;
        }
        else if (_safeGet(grid, i, j+1) == !start) {
            return true;
        }
        else {
            return false;
        }
    }

    var coords = [];

    for (var w = 0; w < W; w++) {
        for (var h = 0; h < H; h++) {
            if (_isEdge(grid, w, h)) {
                coords.push([w, h]);
            }
        }
    }

    return coords;
}

var blobShader = function(blobs, pixel) {
    var val = 0;
    for (var i=0; i<blobs.length; i++) {
        var b = blobs[i];
        val += b.value(pixel);
    }

    if (val < 0.5) {
        return false;
    }
    else {
        return true;
    }
}

function render(t, d) {
    if (MousePosition.x == PrevMousePosition.x && MousePosition.y == PrevMousePosition.y) {
        return;
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    var blobs = [
        CreateBlob([200, 200], 50),
        CreateBlob([400, 400], 100),
        CreateBlob([MousePosition.x, MousePosition.y], 50)
    ];

    var coarseGrid = CreateGrid(Math.ceil(WIDTH / SPACE), Math.ceil(HEIGHT / SPACE));

    shadeCanvasSpaced(ctx, SPACE, function(pixel, gridCoord) {
        if (blobShader(blobs, pixel)) {
            coarseGrid[gridCoord[0] / SPACE][gridCoord[1] / SPACE] = true;
            return [0, 0, 0, 1];
        }
        else {
            return [1, 1, 1, 1];
        }
    });

    var edgeCoords = edgeCoordinates(coarseGrid);
    var edgeGrid = CreateGrid(Math.ceil(WIDTH / SPACE), Math.ceil(HEIGHT / SPACE));

    for (var i = 0; i < edgeCoords.length; i++) {
        var edge = edgeCoords[i];
    
        shadeCanvasRect(ctx, 
            edge[0] * SPACE, 
            edge[1] * SPACE, 
            SPACE, 
            SPACE, 
            function(pixel){
            if (blobShader(blobs, pixel)) {
                return [0, 0, 0, 1];
            }
            else {
                return [1, 1, 1, 1];
            }
        })

        // var boxCenter = [0, 0];
        // boxCenter[0] = (edge[0] + 0.5) * SPACE;
        // boxCenter[1] = (edge[1] + 0.5) * SPACE;
        // ctx.drawBox(boxCenter, [1, 0, 0, 0.3], SPACE);
    }
        
    ctx.restore();

    PrevMousePosition = MousePosition;
}

var runloop = CreateRunLoop(render);
runloop.start();
// runloop.stop();


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener('mousemove', function(evt) {
    MousePosition = getMousePos(canvas, evt);
}, false);

