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

// Variables
const epsilon0 = 8.85e-12;
const mu0 = 4 * Math.PI * 1e-7;
let refractiveIndices;
let lambda0 = 400;
// Interactive variables
let nLSlider = $('#nL').bootstrapSlider({});
let n1Slider = $('#n1').bootstrapSlider({});
let n2Slider = $('#n2').bootstrapSlider({});
let n3Slider = $('#n3').bootstrapSlider({});
let nRSlider = $('#nR').bootstrapSlider({});
let lengthSlider = $('#length').bootstrapSlider({});
let nL = nLSlider.bootstrapSlider('getValue');
let n1 = n1Slider.bootstrapSlider('getValue');
let n2 = n2Slider.bootstrapSlider('getValue');
let n3 = n3Slider.bootstrapSlider('getValue');
let nR = nRSlider.bootstrapSlider('getValue');
let length = lengthSlider.bootstrapSlider('getValue');
let plt = document.getElementById('plt');


// Basic interfaces
/**
 *
 * @param n {number} n is one refractive index, is a real
 * @returns {number} p
 */
function calculateP(n) {
    return n;
}

/**
 *
 * @param lambda0 {number} wavelength in vacuum.
 * @param n {number} refractive index.
 * @returns {number} wave number k in medium with refractive index n.
 */
function calculateWaveNumber(lambda0, n) {
    let lambda = lambda0 / n;
    return 2 * Math.PI / lambda;
}

/**
 * Update global variables---refractive indices and p's for 5 media (left and rightmost plus 3 intermediate media).
 */
function updateRefractiveIndices() {
    refractiveIndices = [nL, n1, n2, n3, nR];
}

/**
 * Generate transfer matrix for given parameters.
 * @param z {number} the horizontal coordinate of the axis.
 * @param n {number} refractive index.
 * @returns {object} A mathjs matrix object that represents the transfer matrix.
 */
function generateTransferMatrix(z, n) {
    let p = calculateP(n);
    let waveNumber = calculateWaveNumber(lambda0, n);
    let c = math.cos(waveNumber * z);
    let s = math.sin(waveNumber * z);
    return math.matrix(
        [[math.complex({re: c, im: 0}), math.complex({re: 0, im: s / p})],
            [math.complex({re: 0, im: s * p}), math.complex({re: c, im: 0})]]
    );
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
 * after you provide a transfer matrix and pMedia of left-hand-side material and pMedia of right-hand-side material.
 * math.js utilizes Complex.js and manual can be found here: https://github.com/infusion/Complex.js.
 * @param transferMat {object} transfer matrix given by previous steps.
 * @param nLeft {number} pMedia of left (incident) side material
 * @param nRight {number} pMedia of right (transmitted) side material
 * @returns {[number,number]} [R, T] = [r * conjugate(r), t * conjugate(t)]
 */
function generateRT(transferMat, nLeft, nRight) {
    let pLeft = calculateP(nLeft);
    let pRight = calculateP(nRight);
    let pl = math.complex({re: pLeft, im: 0});
    let pr = math.complex({re: pRight, im: 0});
    let m11 = math.subset(transferMat, math.index(0, 0));
    let m12 = math.subset(transferMat, math.index(0, 1));
    let m21 = math.subset(transferMat, math.index(1, 0));
    let m22 = math.subset(transferMat, math.index(1, 1));
    console.log(transferMat)
    let r, t;
    if (m11.equals(m22)) { // m11 should be equal to m22 according to mathematics.
        let denominator = m11 // m11 * (pr + pl) - m12 * pr * pl - m21
            .mul(pr.add(pl))
            .sub(m12
                .mul(pr)
                .mul(pl))
            .sub(m21);
        console.log(denominator)
        r = m11 // (m11 * (pl - pr) - m12 * pr * pl + m21) / (m11 * (pr + pl) - m12 * pr * pl - m21)
            .mul(pl.sub(pr))
            .sub(m12
                .mul(pr)
                .mul(pl))
            .add(m21)
            .div(denominator);
        t = math.complex(2) // 2 * pl / (m11 * (pl + pr) - m12 * pr * pl - m21)
            .mul(pl)
            .div(denominator);
    } else {
        throw new Error('m11 != m22! Check your transfer matrix!');
    }
    // console.log(math.abs(t) ** 2 * nLeft / nRight)
    return [math.abs(r) ** 2, math.abs(t) ** 2 * nLeft / nRight];
}

/**
 * Generate R and T, as mentioned in generateRT's document, for a medium given its length d.
 * @param d {number} the length of the medium, here we assume all 3 intermediate media have same length.
 * @returns {[number,number]} [R ,T] = [r * conjugate(r), t * conjugate(t)]
 */
function generateRTArray(d) {
    let RArray = [1];
    let TArray = [1];
    let transferMatArray = [];
    for (let i = 1; i < refractiveIndices.length - 1; i++) { // Neglect the head and tail of pMedia array.
        transferMatArray.push(generateTransferMatrix(d, refractiveIndices[i]));
        let [R, T] = generateRT(transferMatArray[transferMatArray.length - 1], refractiveIndices[i - 1], refractiveIndices[i + 1]);
        RArray.push(R);
        TArray.push(T);
    }
    return [RArray, TArray];
}

/**
 * Calculate intensity at each interface.
 * @returns {[null,null]}
 */
function updateIntensity() {
    let [RArray, TArray] = generateRTArray(length);
    let transmitIntensityArray = [];
    let reflectIntensityArray = [];
    TArray.reduce((product, value) => transmitIntensityArray.push(product * value), 1);
    RArray.reduce((product, value, index) => reflectIntensityArray.push(product * value * transmitIntensityArray[index]), 1);
    return [transmitIntensityArray, reflectIntensityArray];
}


// Plotting
function updateHorizontalAxis(hArray) {
    return hArray.map((i) => length * i)
}

function plot() {
    // let [RArray, TArray] = gdata(n1, length);
    let [t, r] = updateIntensity();

    plt.data[0].x = updateHorizontalAxis([0, 1, 2, 3]);
    plt.data[0].z = [t];
    // plt.data[1].x = updateHorizontalAxis([0, 1, 2, 3]);
    // plt.data[1].y = r;
    // plt.data[2].x = updateHorizontalAxis([1, 1]);
    // plt.data[3].x = updateHorizontalAxis([2, 2]);
    // plt.data[4].x = updateHorizontalAxis([3, 3]);
    Plotly.redraw(plt);
}

function createHeatmap() {
    let [t, r] = updateIntensity();

    let trace0 = {
        z: [t],
        type: 'heatmap',
        colorscale: 'Portland',
        reversescale: true,
    };

    let data = [trace0];

    let layout = {
        title: 'R and T',
        xaxis: {
            title: 'z (nm)',
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

    Plotly.newPlot('plt', data, layout);
}


// Interactive interfaces
// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt);
};

nLSlider.on('change', function () {
    nL = nLSlider.bootstrapSlider('getValue');
    updateRefractiveIndices();
    plot();

    $('#nLSliderVal')
        .text(nL);
});

nRSlider.on('change', function () {
    nR = nRSlider.bootstrapSlider('getValue');
    updateRefractiveIndices();
    plot();

    $('#nRSliderVal')
        .text(nR);
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    updateRefractiveIndices();
    plot();

    $('#n1SliderVal')
        .text(n1);
});

n2Slider.on('change', function () {
    n2 = n2Slider.bootstrapSlider('getValue');
    updateRefractiveIndices();
    plot();

    $('#n2SliderVal')
        .text(n2);
});

n3Slider.on('change', function () {
    n3 = n3Slider.bootstrapSlider('getValue');
    updateRefractiveIndices();
    plot();

    $('#n3SliderVal')
        .text(n3);
});

lengthSlider.on('change', function () {
    length = lengthSlider.bootstrapSlider('getValue');
    plot();

    $('#lengthSliderVal')
        .text(length);
});

// Initialize
updateRefractiveIndices();
createHeatmap();
$('#nLSliderVal')
    .text(nL);
$('#nRSliderVal')
    .text(nR);
$('#n1SliderVal')
    .text(n1);
$('#lengthSliderVal')
    .text(length);
$('#n2SliderVal')
    .text(n2);
$('#n3SliderVal')
    .text(n3);