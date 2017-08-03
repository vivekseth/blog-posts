// Draw 3D

function _projectedPoint(point) {
    var x = point[DIM_X] / point[DIM_W];
    var y = point[DIM_Y] / point[DIM_W];
    var z = point[DIM_Z] / point[DIM_W];
    var w = 1;
    return [x, y, z, w];
}

function drawParametric3D(ctx, fx, fy, fz, transform, tarr) {
    ctx.beginPath();
    for (var i=0; i<tarr.length; i++) {
        var x = fx(tarr[i]);
        var y = fy(tarr[i]);
        var z = fz(tarr[i]);

        var point = [x, y, z, 1];
        var transformedPoint = _mutliplyMatrixVector(transform, point);

        var projPoint = _projectedPoint(transformedPoint);

        var newX = projPoint[0];
        var newY = projPoint[1];

        if (i == 0) {
            ctx.moveTo(newX, newY);
        }
        else {
            ctx.lineTo(newX, newY);
        }
    }
    ctx.stroke();
}

function drawLine3D(ctx, p1, p2, transform) {
    var p1Copy = p1.slice();
    var p2Copy = p2.slice();

    p1Copy.push(1);
    p2Copy.push(1);

    var tp1 = _mutliplyMatrixVector(transform, p1Copy);
    var tp2 = _mutliplyMatrixVector(transform, p2Copy);
    if (tp1[DIM_W] <= 0 || tp2[DIM_W] <= 0) {
        return;
    }

    var projPoint1 = _projectedPoint(tp1);
    var projPoint2 = _projectedPoint(tp2);

    ctx.beginPath();
    ctx.moveTo(projPoint1[0], projPoint1[1]);
    ctx.lineTo(projPoint2[0], projPoint2[1]);
    ctx.stroke(); 
}

function CreateCubeLinePoints() {
    function _createCubeLineFuncs() {
        function _createConstFunc(c) {
            return function(t) {
                return c;
            }
        }

        function _arrayInsert(arr, index, elem) {
            var arrCopy = arr.slice();
            arrCopy.splice(index, 0, elem);
            return arrCopy;
        }

        var constFuncs = [_createConstFunc(1), _createConstFunc(-1)];
        var lineDataArray = crossProductArr([0, 1, 2], crossProductArr(constFuncs, constFuncs));
        return lineDataArray.map(function(lineData) {
            return _arrayInsert(lineData[1], lineData[0], function(t) {return t;});
        });
    }
    
    var lineFuncs = _createCubeLineFuncs();
    return lineFuncs.map(function(farr) {
        function _evaluate(c) {
            return function(f) {
                return f(c);
            }
        }
        return [
            farr.map(_evaluate(-1)),
            farr.map(_evaluate(1))
        ]
    })
}


// 3D Object Nodes

function CreateAbstractNode() {
    var data = {};
    // TODO(vivek): use one matrix to store transform. Its up to clients to tranform object in correct order. 
    data.scaleTransform = Transform3DIdentity();
    data.positionTransform = Transform3DIdentity();
    data.rotationTransform = Transform3DIdentity();
    data.draw = function(ctx, projectionFromModel) {
        
    }.bind(data);

    data.rotate = function(axis, angle) {
        var axisVec = _normalize(axis);
        this.rotationTransform = Transform3DRotation(axisVec, angle);
    }.bind(data);

    data.position = function(coordinates) {
        this.positionTransform = Transform3DTranslation(coordinates);
    }.bind(data);

    data.scale = function(factor) {
        this.scaleTransform = Transform3DScale(factor);
    }.bind(data);

    data.localTransform = function() {
        return _matrixMultiply(this.positionTransform, _matrixMultiply(this.rotationTransform, this.scaleTransform));
    }.bind(data);

    return data;   
}

function CreateCubeNode() {
    var data = CreateAbstractNode();
    data.linePoints = CreateCubeLinePoints();
    data.draw = function(ctx, projectionFromModel) {
        var transform = _matrixMultiply(projectionFromModel, this.localTransform());
        this.linePoints.map(function(points){
            drawLine3D(ctx, points[0], points[1], transform);
        })
    }.bind(data);
    return data;
}

function CreateSphereNode(parallels, meridians) {
    function _drawRing(ctx, radius, ypos, transform) {
        drawParametric3D(ctx, function(t){
            return radius * Math.cos(t);
        }, function(t){
            return ypos;
        }, function(t){
            return radius * Math.sin(t);
        }, transform, createRange(0, 2 * Math.PI, meridians))
    }

    var data = CreateAbstractNode();
    data.draw = function(ctx, projectionFromModel) {
        var transform = _matrixMultiply(projectionFromModel, this.localTransform());
        var rows = createRange(-0.9, 0.9, parallels);
        rows.map(function(r){
            var angle = Math.acos(r);
            var radius = Math.sin(angle);
            _drawRing(ctx, radius, r, transform);
        });
    }.bind(data);

    return data;
}

// ------------

function CreateShaderPipeline(vertexShader, fragmentShader) {
    
    // face: array of 3 output vertices
    function _vertexInterpolate(face, bcScreen) { // Interpolated vertex
        function _propInterp(A, B, C, bcScreen) {
            if (A.constructor == Array) {
                // vector interpolation
                return _add(_add(_multiply(A, bcScreen[DIM_U]), _multiply(B, bcScreen[DIM_V])), _multiply(C, bcScreen[DIM_W]));
            }
            else {
                // float interpolation
                return bcScreen[DIM_U] * A + bcScreen[DIM_V] * B + bcScreen[DIM_W] * C;
            }
        }

        var out = {};
        for (var prop in face[0]) {
            out[prop] = _propInterp(face[0][prop], face[1][prop], face[2][prop], bcScreen)
        }

        return out;
    }

    function _rangeForDimension(points, dim) {
        var min = null;
        var max = null;
        for (var i=0; i<points.length; i++) {
            if (min == null || points[i][dim] < min) {
                min = points[i][dim];
            }
            
            if (max == null || points[i][dim] > min) {
                max = points[i][dim];
            }
        }
        return [min, max];
    }

    function _boundingBox(face) {
        var xRange = _rangeForDimension(face, DIM_X);
        var yRange = _rangeForDimension(face, DIM_Y);
        return [xRange, yRange];
    }

    function _barycentric(points, P) {
        var v0 = _subtract(points[1], points[0]); 
        var v1 = _subtract(points[2], points[0]); 
        var v2 = _subtract(P, points[0]); 
        var d00 = _dotProduct(v0, v0);
        var d01 = _dotProduct(v0, v1);
        var d11 = _dotProduct(v1, v1);
        var d20 = _dotProduct(v2, v0);
        var d21 = _dotProduct(v2, v1);
        var denom = d00 * d11 - d01 * d01;
        v = (d11 * d20 - d01 * d21) / denom;
        w = (d00 * d21 - d01 * d20) / denom;
        u = 1.0 - v - w;
        return [u, v, w];
    }

    // face: array of 3 output vertices
    function _iterateFragmentsForFace(vertFace, projFace_2, callback) {
        // TODO(vivek): clip bounding box to screen. 
        var bbox = _boundingBox(projFace_2);

        for (var x=bbox[DIM_X][0]; x<=bbox[DIM_X][1]; x+=(2/WIDTH)) {
            for (var y=bbox[DIM_Y][0]; y<=bbox[DIM_Y][1]; y+=(2/HEIGHT)) {
                var bcScreen = _barycentric(projFace_2, [x, y]);
                
                var bcClip = [0, 0, 0];
                bcClip[DIM_U] = bcScreen[DIM_U] / vertFace[0][DIM_W];
                bcClip[DIM_V] = bcScreen[DIM_V] / vertFace[1][DIM_W];
                bcClip[DIM_W] = bcScreen[DIM_W] / vertFace[2][DIM_W];

                var bcClipNormalized = _divide(bcClip, bcClip[DIM_U] + bcClip[DIM_V] + bcClip[DIM_W]);

                if (bcScreen[DIM_X]>=0 && bcScreen[DIM_Y]>=0 && bcScreen[DIM_Y]>=0) {
                    var vertInterp = _vertexInterpolate(vertFace, bcScreen);
                    callback(vertFace, bcClipNormalized, vertInterp, [x,y]);
                }
            }
        }
    }

    function _vec2(vec) {
        return [vec[DIM_X], vec[DIM_Y]];
    }

    // mesh: array of faces
    // face: array of 3 vertices
    function render(ctx, mesh, vertexUniforms, fragmentUniforms) {
        for (var i=0; i<mesh.length / 3; i++) {
            var va = vertexShader(mesh, 3 * i + 0, vertexUniforms);
            var vb = vertexShader(mesh, 3 * i + 1, vertexUniforms);
            var vc = vertexShader(mesh, 3 * i + 2, vertexUniforms);

            vertFace = [va, vb, vc];
            var projFace = vertFace.map(_projectedPoint);
            var projFace_2 = projFace.map(_vec2);

            _iterateFragmentsForFace(vertFace, projFace_2, function(face, bcClipNormalized, interpolatedVertex, screenLocation) {
                var color = fragmentShader(interpolatedVertex, bcClipNormalized, screenLocation, fragmentUniforms);
                if (color) {
                    drawPixel(ctx, screenLocation, color);
                }
            });
        }
    }

    return {
        'render' : render
    }
}

// Camera

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

