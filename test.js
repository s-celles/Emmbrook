var numeric = require('numeric');
var ndarray = require('ndarray');
// var meshgrid = require("ndarray-meshgrid");
var ops = require("ndarray-ops");
var pool = require("ndarray-scratch");
var unpack = require("ndarray-unpack");
var cops = require("ndarray-complex"); // Complex arithmetic operations for ndarrays.
var show = require("ndarray-show");
var tile = require('ndarray-tile');
var concr = require('ndarray-concat-rows');


thetaI = 0.5;
n1 = 1;
n2 = 2;
var epsilon1 = Math.pow(n1, 2); // Permittivity
var epsilon2 = Math.pow(n2, 2); // Permittivity
var zNum = 10;
var xNum = 5;
zStep = 0.08; xStep =0.08;
var zCoord = ndarray(new Float64Array(numeric.linspace(-10, 10, zNum + 1)));
var xCoord = ndarray(new Float64Array(numeric.linspace(0, 10, xNum + 1)));
var optionIndices = ndarray(new Float64Array(numeric.linspace(0, 2, 3)));
var lambda = 1;
// Something similar to np.meshgrid, but less straightforward to see, thus
// you should check the documentation detaily on
// http://scijs.net/packages/#scijs/ndarray.
// We fix mesh in this simulation.
// var mesh = meshgrid([-10, 10, zStep], [0, 10, xStep], [0, 2, 1]);
// var zMesh = mesh.pick(null, 0); // Pick the first column of mesh
// var xMesh = mesh.pick(null, 1); // Pick the second column of mesh
// var iMesh = mesh.pick(null, 2); // Pick the third column of mesh
// console.log(zMesh)
// zMesh = ndarray(zMesh, [3, xNum + 1, zNum + 1]) //.transpose(); // Reshape zMesh to (zNum + 1, xNum + 1, 3)
// xMesh = ndarray(xMesh, [xNum + 1, zNum + 1, 3]) // Reshape xMesh to (xNum + 1, xNum + 1, 3)
// iMesh = ndarray(iMesh, [3, xNum + 1, zNum + 1]) // Reshape iMesh to (zNum + 1, xNum + 1, 3)
// function meshgrid(ndarr1, ndarr2, ndarr3) {
//     return tile(ndarr1, [1].concat(ndarr2.shape).concat(ndarr3.shape));
// }
var zMesh = tile(zCoord, [6, 3])
zMesh = ndarray(zMesh.data, [6, 11, 3]);
console.log(unpack(zMesh))
// var zMesh = meshgrid(zCoord, xCoord, optionIndices);

// console.log((zMesh));

// function updateRatioValues(tI) {
//     /*
//      Accept an incident angle tI, return the reflection ratio and transmission ratio.
//      */
//     var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
//     var beta = n1 / n2 * epsilon2 / epsilon1;
//     var t = 2 / (alpha + beta);
//     var r = (alpha - beta) / (alpha + beta);
//     return [r, t];
// }

// function updateKVector() { //correct
//     /*
//      kVector = k0 * [n1, n1, n2]
//      kVector will change if n1 or n2 change.
//      */
//     var k0 = 2 * Math.PI / lambda; // Free-space wavenumber
//     var kVector = ndarray(new Float64Array(3)); // Wavenumbers for incident, reflected, transmitted waves
//     ops.muls(kVector, ndarray(new Float64Array([n1, n1, n2])), k0);
//     return kVector;
// }

// function updateKxAndKz() { //correct
//     /*
//      Calculate z component for incident, reflected, and transmitted wave's k vector,
//      and x component for incident, reflected, and transmitted wave's k vector.
//      kZ and kX will change if thetaI, n1 or n2 change.
//      */
//     var kVector = updateKVector();
//     var thetaT = Math.asin(n1 / n2 * Math.sin(thetaI)); // Transmitted angle from Snell's law
//     var kZ = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kz
//     var kX = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kx
//     ops.mul(kZ, ndarray([Math.cos(thetaI), -Math.cos(thetaI), Math.cos(thetaT)]), kVector); // Element-wise multiply
//     ops.mul(kX, ndarray([Math.sin(thetaI), Math.sin(thetaI), Math.sin(thetaT)]), kVector); // Element-wise multiply
//     return [kZ, kX];
// }

// function updateMask() {
//     /*
//      Masks regions: z<0 for I, R; z>=0 for T
//      greaterEqualThan0 and lessThan0 will not change in this simulation.
//      */
//     // 1 for positive z, 0 otherwise
//     var greaterEqualThan0 = pool.malloc(iMesh.shape);
//     ops.geqs(greaterEqualThan0, zMesh, 0); // greaterEqualThan0 is a 1/0 grid.

//     // 1 for negative z, 0 otherwise
//     var lessThan0 = pool.malloc(iMesh.shape);
//     ops.lts(lessThan0, zMesh, 0); // lessThan0 is a 1/0 grid.
//     return [greaterEqualThan0, lessThan0];
// }

// function updateGeneralAmplitude() {
//     /* 
//      Consider amplitudes for the three waves together.
//      Amplitude A has dimension (zNum + 1, xNum + 1, 3).
//      A changes when thetaI, n1, or n2 change.
//      */
//     var r, t;
//     [r, t] = updateRatioValues(thetaI); // Reflected and transmitted amplitudes
//     var A = pool.zeros(iMesh.shape);
//     var aux = pool.zeros(iMesh.shape); // Auxiliary grid
//     ops.eqs(A, iMesh, 0); // aux[i,j,k] = 1 if iMesh[i,j,k] === 0
//     ops.eqs(aux, iMesh, 1); // aux[i,j,k] = true if iMesh[i,j,k] === 1
//     ops.addeq(A, ops.mulseq(aux, r)); // A += np.equal(iMesh, 1) * r
//     ops.eqs(aux, iMesh, 2); // aux[i,j,k] = true if iMesh[i,j,k] === 2
//     ops.addeq(A, ops.mulseq(aux, t)); // A += np.equal(iMesh, 2) * t

//     var greaterEqualThan0, lessThan0;
//     [greaterEqualThan0, lessThan0] = updateMask();
//     ops.muleq(A.pick(null, null, 0), lessThan0.pick(null, null, 0)); // A[:, :, 0] *= lessThan0[:, :, 0]
//     ops.muleq(A.pick(null, null, 1), lessThan0.pick(null, null, 1)); // A[:, :, 1] *= lessThan0[:, :, 1]
//     ops.muleq(A.pick(null, null, 2), greaterEqualThan0.pick(null, null, 2)); // A[:, :, 2] *= greaterEqualThan0[:, :, 2]
//     return A;
// }

// updateGeneralAmplitude();

// function tensorProduct(mesh, vec) {
//     for (var i = 0; i < vec.shape[0]; i++) {
//         ops.mulseq(mesh.pick(null, null, i), vec.get(i));
//     }
//     return mesh;
// }

// function updateEachAmplitude() {
//     /*
//      Generate individual wave amplitudes for incident, reflected, and transmitted.
//      Real amplitude reA has dimension (zNum + 1, xNum + 1, 3).
//      Imaginary amplitude imA has dimension (zNum + 1, xNum + 1, 3).
//      */
//     var time = 0;
//     var reA = updateGeneralAmplitude();
//     var imA = pool.malloc(reA.shape);
//     var kZ, kX;
//     [kZ, kX] = updateKxAndKz();
//     var kzz = tensorProduct(zMesh, kZ); // kzz = kz * z
//     var kxx = tensorProduct(xMesh, kX); // kxx = kx * x
//     ops.addeq(kxx, kzz); // kxx = kx * x + kz * z
//     // If we want to use ndarray-complex, we need to separate real and imaginary parts.
//     var rePhase = ops.coseq(kxx); // re( np.exp(1j * (kx * x + kz * z)) )
//     var imPhase = ops.sineq(kxx); // im( np.exp(1j * (kx * x + kz * z)) )
//     cops.muleq(reA, imA, rePhase, imPhase);
//     return [reA, imA];
// }

// function selectField(option) {
//     var reA, imA;
//     [reA, imA] = updateEachAmplitude();
//     switch (option) {
//         case 0:
//             return [reA.pick(null, null, 0), imA.pick(null, null, 0)];
//         case 1:
//             return [reA.pick(null, null, 1), imA.pick(null, null, 1)];
//         case 2:
//             return [reA.pick(null, null, 2), imA.pick(null, null, 2)];
//     }
// }

// function updateInstantaneousIntensity(option) {
//     var fieldRe, fieldIm;
//     [fieldRe, fieldIm] = selectField(option);
//     // Re((a + i b)*(a + i b)) = a^2 - b^2
//     ops.powseq(fieldRe, 2); // a^2
//     ops.powseq(fieldIm, 2); // b^2
//     ops.subeq(fieldRe, fieldIm); // a^2 - b^2
//     return fieldRe;
// }

// function updateAveragedIntensity(option) {
//     var fieldRe, fieldIm;
//     [fieldRe, fieldIm] = selectField(option);
//     // Re((a + i b)*(a - i b)) = a^2 + b^2
//     ops.powseq(fieldRe, 2); // a^2
//     ops.powseq(fieldIm, 2); // b^2
//     ops.addeq(fieldRe, fieldIm); // a^2 - b^2
//     return fieldRe;
// }