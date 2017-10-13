/**
 Created by Qi on 10/12/17.
 */

/* jshint -W097 */
'use strict';
// Check if your browser supports ES6 feature
var supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function('(a = 0) => a');
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {
} else {
    alert('Your browser is too old! Please use a modern browser!');
}

// Import libraries


// Variables
const epsilon0 = 8.85e-12;
const mu0 = 4 * Math.PI * 1e-7;
let refractiveIndecies = [1, 1, 1, 1];
let p = refractiveIndecies.map(function (n) { // n is one refractive index
    return Math.sqrt(epsilon0 / mu0) * n;
});
let waveNumber = 1; // k
let pLeft = 1;
let pRigth = 1;
let dArray = math.range(0, 1000, 1);


// Basic interfaces
/**
 * Generate transfer matrix for given parameters.
 * @param d {number} the length of the film.
 * @param p {number} equals to sqrt(epsilon / mu).
 * @returns {object} A mathjs matrix object that represents the transfer matrix.
 */
function generateTransferMatrix(d, p) {
    let c = math.cos(waveNumber * d);
    let s = math.sin(waveNumber * d);
    return math.matrix([[c, math.complex({re: 0, im: p * s})], [math.complex({re: 0, im: s / p}), c]]);
}

/**
 * Generate a matrix that can preserve the accumulated multiplied transfer matrices.
 * @param matArray {object} an array of transfer matrices, with the first one to be the rightmost (nearest
 * to the incident side material) transfer matrix; the last one to be the leftmost (nearest to transmitted
 * side material) transfer matrix.
 * @returns {object} M = M_{N} M_{N-1} ... M_{1}
 */
function multiplyTransferMatrices(matArray) {
    let m = math.eye(2); // Create a 2-dimensional identity matrix with size 2x2.
    for (let i = 0; i < matArray.length; i++) {
        m = math.multiply(matArray[i], m);
    }
    return m;
}

/**
 * This function gives the transmit intensity ratio T^2 and reflective intensity ratio T^2
 * after you provide a transfer matrix and p of left-hand-side material and p of right-hand-side material.
 * math.js utilizes Complex.js and manual can be found here: https://github.com/infusion/Complex.js.
 * @param transferMat {object} transfer matrix given by previous steps.
 * @param pL {number} p of left (incident) side material
 * @param pR {number} p of right (transmitted) side material
 * @returns {[number,number]} [R, T] = [r * conjugate(r), t * conjugate(t)]
 */
function generateRT(transferMat, pL, pR) {
    let pl = math.complex({re: pL, im: 0});
    let pr = math.complex({re: pR, im: 0});
    let m11 = math.subset(transferMat, math.index(0, 0));
    let m12 = math.subset(transferMat, math.index(0, 1));
    let m21 = math.subset(transferMat, math.index(1, 0));
    let m22 = math.subset(transferMat, math.index(1, 1));
    let r, t;
    if (m11.equals(m22)) { // m11 should be equal to m22 according to mathematics.
        let denominator = m11 // m11 * (pr + pl) - m12 * pr * pl - m21
            .mul(pr.add(pl))
            .sub(m12.mul(pr)
                .mul(pl))
            .sub(m21);
        r = m11 // (m11 * (pl - pr) - m12 * pr * pl + m21) / (m11 * (pr + pl) - m12 * pr * pl - m21)
            .mul(pl.sub(pr))
            .sub(m12.mul(pr)
                .mul(pl))
            .add(m21)
            .div(denominator);
        t = math.complex(2) // 2 * pl / (m11 * (pl + pr) - m12 * pr * pl - m21)
            .mul(pl)
            .div(denominator);
    } else {
        throw new Error('m11 /= m22! Check your transfer matrix!');
    }
    return [math.abs(r) ** 2, math.abs(t) ** 2];
}

/**
 * Generate R and T, as mentioned in `generateRT`'s document, for a medium given its length d.
 * @param d {number} the length of the medium
 * @returns {[number,number]} [R ,T] = [r * conjugate(r), t * conjugate(t)]
 */
function generateRTArray(d) {
    let transferMatArray = [];
    p.forEach(function (item) {
        transferMatArray.push(generateTransferMatrix(d, item));
    });
    let m = multiplyTransferMatrices(transferMatArray);
    return generateRT(m, pLeft, pRigth);
}

/**
 * Generate each
 * @param dArray
 * @returns {[null,null]}
 */
function generateData(dArray) {
    let RArray = [];
    let TArray = [];
    dArray.forEach(function (item) {
        let [R, T] = generateRTArray(item);
        RArray.push(R);
        TArray.push(T);
    });
    return [RArray, TArray];
}

// Plotting
function createPlot() {
    let [RArray, TArray] = generateData(dArray);

    let trace0 = {
        x: dArray._data,
        y: RArray._data,
        mode: 'lines',
        name: 'R',
    };

    let trace1 = {
        x: dArray._data,
        y: TArray._data,
        mode: 'lines',
        name: 'T',
    };

    let data = [trace0, trace1];

    let layout = {
        title: 'R and T',
        xaxis: {
            title: 'x (nm)',
            titlefont: {
                size: 18,
            },
        },
        yaxis: {
            title: 'intensity',
            titlefont: {
                size: 18,
            },
        },
    };

    Plotly.newPlot('plt0', data, layout);
}


// Interactive interfaces
// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


// Initialize
createPlot();