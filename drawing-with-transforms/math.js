// Transformation Util 2D

function CGTransformIdentity() {
    return [1, 0, 0, 1, 0, 0];
}

function CGTransformTranslate(tx, ty) {
    return [1, 0, 0, 1, tx, ty];
}

function CGTransformScale(sx, sy) {
    return [sx, 0, 0, sy, 0, 0];
}

function CGTransformRotate(angle) {
    return [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0];
}

function CGTransformConcat(t1, t2) {
    var m1 = _matrixFromTransform(t1);
    var m2 = _matrixFromTransform(t2);
    return _transformFromMatrix(_matrixMultiply(m1, m2));
}

function _matrixFromTransform(t) {
    var a = t[0];
    var b = t[1];
    var c = t[2];
    var d = t[3];
    var e = t[4];
    var f = t[5];

    return [
        [a, c, e],
        [b, d, f],
        [0, 0, 1],
    ];
}

function _transformFromMatrix(m) {
    var a = m[0][0];
    var b = m[1][0];
    var c = m[0][1];
    var d = m[1][1];
    var e = m[0][2];
    var f = m[1][2];
    return [a, b, c, d, e, f];
}

// return A * B
function _matrixMultiply(a, b) {
    var aNumRows = a.length, aNumCols = a[0].length;
    var bNumRows = b.length, bNumCols = b[0].length;
    // initialize array of rows
    var m = new Array(aNumRows);
    for (var r = 0; r < aNumRows; ++r) {
        // initialize the current row
        m[r] = new Array(bNumCols);
        for (var c = 0; c < bNumCols; ++c) {
            // initialize the current cell
            m[r][c] = 0;
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}

function CGTransformApply(ctx, transform) {
    ctx.transform.apply(ctx, transform);
}

function _normalize(vec) {
    // function _norm(vec) {
    //     var value = 0;
    //     for (var i=0; i<vec.length; i++) {
    //         value += vec[i] * vec[i];
    //     }
    //     return Math.sqrt(value);
    // }

    return math.divide(vec, math.norm(vec));
}

var _TRANSFORM_3D_IDENTITY = math.eye(4);
function Transform3DIdentity() {
    return _TRANSFORM_3D_IDENTITY;
}

function Transform3DTranslation(vec) {
    var tx = vec.get([0]);
    var ty = vec.get([1]);
    var tz = vec.get([2]);

    var X = [1, 0, 0, tx];
    var Y = [0, 1, 0, ty];
    var Z = [0, 0, 1, tz];
    var W = [0, 0, 0, 1];

    // TODO(vivek): should this be transposed??
    return math.matrix([X, Y, Z, W]);
}

function Transform3DPerspective(aspect, fovy, near, far) {
    var yScale = 1 / Math.tan(fovy * 0.5);
    var xScale = yScale / aspect;
    var zRange = far - near;
    var wzScale = -2 * far * near / zRange;
    var P = [xScale, 0, 0, 0];
    var Q = [0, yScale, 0, 0];
    var R = [0, 0, zRange, wzScale];
    var S = [0, 0, -1, 0];
    return math.matrix([P, Q, R, S]);
}

function _defaultTransformPerspective() {
    var aspect = canvas.width / canvas.height;
    var fovy = (2 * Math.PI) / 5.0;
    var near = 1;
    var far = 100;
    return Transform3DPerspective(aspect, fovy, near, far);
}

function Transform3DCamera(position, target, up) {
    var normCameraDirection = _normalize(math.subtract(position, target));
    var normCameraRight = _normalize(math.cross(up, normCameraDirection));
    var normCameraUp = math.cross(normCameraDirection, normCameraRight);
    var cameraLocalCoordinateSpaceMatrix = math.matrix([
        [normCameraRight.get([0]), normCameraUp.get([0]), normCameraDirection.get([0]), 0],
        [normCameraRight.get([1]), normCameraUp.get([1]), normCameraDirection.get([1]), 0],
        [normCameraRight.get([2]), normCameraUp.get([2]), normCameraDirection.get([2]), 0],
        [                       0,                     0,                            0, 1]
    ]);
    //return cameraLocalCoordinateSpaceMatrix;

    var cameraTranslationMatrix = Transform3DTranslation(math.multiply(-1, position));
    return math.multiply(math.transpose(cameraLocalCoordinateSpaceMatrix), cameraTranslationMatrix);
}

function _defaultTransformCamera() {
    var position = math.matrix([0, 0, 5]);
    var target = math.matrix([0, 0, 0]);
    var up = math.matrix([0, 1, 0]);
    return Transform3DCamera(position, target, up);
}

function Transform3DRotation(axisVec, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    
    var axis = {};
    axis.x = axisVec.get([0]);
    axis.y = axisVec.get([1]);
    axis.z = axisVec.get([2]);


    var X = [
        axis.x * axis.x + (1 - axis.x * axis.x) * c,
        axis.x * axis.y * (1 - c) - axis.z * s,
        axis.x * axis.z * (1 - c) + axis.y * s,
        0.0
    ]

    var Y = [
        axis.x * axis.y * (1 - c) + axis.z * s,
        axis.y * axis.y + (1 - axis.y * axis.y) * c,
        axis.y * axis.z * (1 - c) - axis.x * s,
        0.0
    ]

    var Z = [
        axis.x * axis.z * (1 - c) - axis.y * s,
        axis.y * axis.z * (1 - c) + axis.x * s,
        axis.z * axis.z + (1 - axis.z * axis.z) * c,
        0.0
    ]

    var W = [0, 0, 0, 1];

    return math.transpose(math.matrix([X, Y, Z, W]));
}