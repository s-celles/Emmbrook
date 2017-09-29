let numeric = require('numeric');
let ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
let ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
let pool = require('ndarray-scratch'); // A simple wrapper for typedarray-pool.
let unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
let cops = require('ndarray-complex'); // Complex arithmetic operations for ndarrays.
let tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.
let linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values
let show = require('ndarray-show')

let thetaI = 0.9868;
let n1 = 1.2;
let n2 = 2.91;
let epsilon1 = Math.pow(n1, 2); // Permittivity
let epsilon2 = Math.pow(n2, 2); // Permittivity
let lambda = 1;
let time = 0;
let zNum = 10;
let xNum = 10;
let omega = 2 * Math.PI;
let zCoord = linspace(ndarray([], [zNum]), -10, 10);
zCoord.dtype = 'float64';
let xCoord = linspace(ndarray([], [xNum]), 0, 10);
xCoord.dtype = 'float64';
let optionIndices = linspace(ndarray([], [3]), 0, 2);
optionIndices.dtype = 'float64';
// Generate a 3D mesh cotaining z, x and i coordinates for each point.
let zMesh, xMesh, iMesh;
// iMesh represents: {0: incident, 1: reflected, 2: transmit}
[zMesh, xMesh, iMesh] = meshgrid(zCoord, xCoord, optionIndices);
let greaterEqualThan0, lessThan0;
[greaterEqualThan0, lessThan0] = updateMask();

opt = 1;
sty = 0;
console.log(show(updateInstantaneousIntensity(1)))


function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}

function flatten(arr) {
    /*
     Here's a short function that uses some of the newer JavaScript array methods to flatten an n-dimensional array.
     https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript/15030117#15030117
     */
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function updateRatioValues(tI) {
    /*
     Accept an incident angle tI,
     return the reflection ratio and transmission ratio.
     */
    let alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
    let beta = n1 / n2 * epsilon2 / epsilon1;
    let t = 2 / (alpha + beta);
    let r = (alpha - beta) / (alpha + beta);
    console.log(alpha, beta)
    return [r, t];
}


function meshgrid(xArray, yArray, zArray) {
    /*
     Here xArray, yArray, zArray should all be 1d arrays.
     */
    let xNum = xArray.size;
    let yNum = yArray.size;
    let zNum = zArray.size;
    let xMesh = reshape(tile(xArray, [yNum, zNum]), [yNum, xNum, zNum]);
    let yMesh = tile(yArray, [1, xNum, zNum]);
    let zMesh = reshape(tile(tile(tile(zArray, [1]), [1, xNum]).transpose(1, 0), [yNum]), [yNum, xNum, zNum]);
    return [xMesh, yMesh, zMesh];
}

function updateKVector() {
    /*
     kVector = k0 * [n1, n1, n2]
     kVector will change if lambda, n1 or n2 change.
     */
    let k0 = 2 * Math.PI / lambda; // Free-space wavenumber
    let kVector = ndarray(new Float64Array(3)); // Wavenumbers for incident, reflected, transmitted waves
    ops.muls(kVector, ndarray(new Float64Array([n1, n1, n2])), k0);
    return kVector;
}

function updateKxAndKz() {
    /*
     Calculate z component for incident, reflected, and transmitted wave's k vector,
     and x component for incident, reflected, and transmitted wave's k vector.
     kZ and kX will change if thetaI, lambda, n1 or n2 change.
     */
    let kVector = updateKVector();
    let thetaT = Math.asin(n1 / n2 * Math.sin(thetaI)); // Transmitted angle from Snell's law
    let kZ = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kz
    let kX = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kx
    ops.mul(kZ, ndarray([Math.cos(thetaI), -Math.cos(thetaI), Math.cos(thetaT)]), kVector); // Element-wise multiply
    ops.mul(kX, ndarray([Math.sin(thetaI), Math.sin(thetaI), Math.sin(thetaT)]), kVector); // Element-wise multiply
    return [kZ, kX];
}

function updateMask() {
    /*
     Masks regions: z<0 for incident and reflected; z>=0 for transmitted.
     Note greaterEqualThan0 and lessThan0 will not change in this simulation.
     */
    // 1 for positive z, 0 otherwise
    let greaterEqualThan0 = pool.malloc(zMesh.shape);
    ops.geqs(greaterEqualThan0, zMesh, 0); // greaterEqualThan0 is a grid filled with 1 or 0.

    // 1 for negative z, 0 otherwise
    let lessThan0 = pool.malloc(zMesh.shape);
    ops.lts(lessThan0, zMesh, 0); // lessThan0 is a a grid filled with 1 or 0.
    return [greaterEqualThan0, lessThan0];
}

function updateGeneralAmplitude() { // correct
    /*
     Consider amplitudes for the three waves together.
     Amplitude A has dimension [xNum, zNum, 3].
     A changes when thetaI, lambda, n1, or n2 change.
     */
    let r, t;
    [r, t] = updateRatioValues(thetaI); // Reflected and transmitted amplitudes
    let A = pool.zeros(iMesh.shape);
    let aux = pool.zeros(iMesh.shape); // Auxiliary grid
    ops.eqs(A, iMesh, 0); // A[i,j,k] = true if iMesh[i,j,k] === 0
    ops.eqs(aux, iMesh, 1); // aux[i,j,k] = true if iMesh[i,j,k] === 1
    ops.addeq(A, ops.mulseq(aux, r)); // A += np.equal(iMesh, 1) * r
    ops.eqs(aux, iMesh, 2); // aux[i,j,k] = true if iMesh[i,j,k] === 2
    ops.addeq(A, ops.mulseq(aux, t)); // A += np.equal(iMesh, 2) * t

    ops.muleq(A.pick(null, null, 0), lessThan0.pick(null, null, 0)); // A[:, :, 0] *= lessThan0[:, :, 0]
    ops.muleq(A.pick(null, null, 1), lessThan0.pick(null, null, 1)); // A[:, :, 1] *= lessThan0[:, :, 1]
    ops.muleq(A.pick(null, null, 2), greaterEqualThan0.pick(null, null, 2)); // A[:, :, 2] *= greaterEqualThan0[:, :, 2]
    return A;
}

function tensorProduct(mesh, vec) {
    let aux = pool.zeros(mesh.shape);
    for (let i = 0; i < vec.shape[0]; i++) {
        // You cannot use ops.mulseq for it will accumulate the sum and cause wrong result.
        ops.muls(aux.pick(null, null, i), mesh.pick(null, null, i), vec.get(i));
    }
    return aux;
}

function updateEachAmplitude() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     Real amplitude reA has dimension [xNum, zNum, 3].
     Imaginary amplitude imA has dimension [xNum, zNum, 3].
     Real phase has dimension [xNum, zNum, 3].
     Imaginary phase imA has dimension [xNum, zNum, 3].
     */
    let reA = updateGeneralAmplitude();
    let imA = pool.zeros(reA.shape);
    let kZ, kX;
    [kZ, kX] = updateKxAndKz();
    let kzz = tensorProduct(zMesh, kZ); // kzz = kz * z
    let kxx = tensorProduct(xMesh, kX); // kxx = kx * x
    let aux = pool.zeros(kxx.shape);
    ops.add(aux, kxx, kzz); // aux = kx * x + kz * z
    ops.subseq(aux, omega * time); // aux -= w * t
    // If we want to use ndarray-complex package, we need to specify real and imaginary parts.
    let rePhase, imPhase; // The real and imaginary parts of phase np.exp(1j * (kx * x + kz * z))
    rePhase = pool.zeros(aux.shape);
    imPhase = pool.zeros(aux.shape);
    cops.exp(rePhase, imPhase, pool.zeros(aux.shape), aux); // rePhase = re( np.exp(1j * (kx * x + kz * z)) ), imPhase = im( np.exp(1j * (kx * x + kz * z))
    let re = pool.zeros(reA.shape);
    let im = pool.zeros(imA.shape);
    cops.mul(re, im, reA, imA, rePhase, imPhase);
    // return [ndarray(new Float64Array(flatten(unpack(re))), reA.shape),
    //     ndarray(new Float64Array(flatten(unpack(im))), imA.shape)];
    return [re, im]
}

function selectField(option) {
    let reA, imA;
    [reA, imA] = updateEachAmplitude();
    switch (option) {
        case 3: {
            let reField, imField;
            reField = pool.zeros(reA.shape.slice(0, -1));
            imField = pool.zeros(imA.shape.slice(0, -1));
            for (let i = 0; i < 3; i++) {
                cops.addeq(reField, imField, reA.pick(null, null, i), imA.pick(null, null, i));
            }
            return [reField, imField];
        }
        case 0: // Fallthrough, incident field
        case 1: // Fallthrough, reflected field
        case 2: // Transmitted field
            return [reA.pick(null, null, option), imA.pick(null, null, option)];
        default:
            throw new Error('You have inputted a wrong option!');
    }
}

function updateInstantaneousIntensity(option) {
    /*
     This function calculates instantaneous intensity, which is related to Poynting vector.
     */
    let reField, imField;
    [reField, imField] = selectField(option);
    cops.muleq(reField, imField, reField, imField); // reField = np.real(reField * reField)
    return reField;
}

function updateAveragedIntensity(option) {
    /*
     This function calculates time-averaged intensity of Poynting vector, which is
     proportional to the square of the field's magnitude.
     */
    let reField, imField;
    [reField, imField] = selectField(option);
    cops.mag(reField, reField, imField); // reField = np.real(reField * np.conj(reField))
    return reField;
}


// Plot
function chooseIntensity(option, style) {
    /*
     option: {0: incident, 1: reflected intensity, 2: transmitted intensity, 3: total intensity},
     style: {0: instantaneous intensity, 1: time-averaged intensity, 2: field amplitude}.
     */
    switch (style) {
        case 0:
            return unpack(updateInstantaneousIntensity(option));
            break;
        case 1:
            return unpack(updateAveragedIntensity(option));
            break;
        case 2:
            return unpack(selectField(option)[0]);
            break;
        default:
            throw new Error('You have inputted a wrong style!');
    }
}

