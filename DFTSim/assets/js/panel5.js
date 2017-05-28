/**
 * Created by Qi on 5/28/17.
 */

// Variables
var nCont = 1000;
var xHi = 10;
var xCont = new Array(nCont);  // Continuous value
var yCont = new Array(nCont);  // Continuous value
var yApprox = new Array(nCont);
var fmin = 1.0 / xHi;

var sampleSlider = $('#mySamples').bootstrapSlider();
var phaseSlider = $('#myPhase').bootstrapSlider();
var nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Number of samples
var phase = phaseSlider.bootstrapSlider('getValue');

var xv = new Array(nSample);
var yv = new Array(nSample);

for (var i = 0; i < nCont; i++) {
    /* xCont will not change in this simulation.
     */
    xCont[i] = i / nCont * xHi - 0.5 * xHi
}

// Interfaces
function xvUpdate() {
    /* xv will not change unless the number of samples changes.
     */
    xv = new Array(nSample);  // Sample x coordinates
    for (var i = 0; i < nSample; i++) {   // Samples range
        xv[i] = (i / nSample - 0.5) * xHi
    }
}

function yvUpdate() {
    /* yv will changes as the number of samples and phase change.
     */
    yv = new Array(nSample);
    for (var i = 0; i < nSample; i++) {  // Sample y coordinates
        if (xv[i] > phase) {
            yv[i] = 0.5
        } else {
            yv[i] = -0.5
        }
    }
}

function yCountUpdate() {
    /* yCount will changes as the number of phase changes.
     */
    for (var i = 0; i < nCont; i++) {
        if (xCont[i] > phase) {
            yCont[i] = 0.5
        } else {
            yCont[i] = -0.5
        }
    }
}

function updateY() {
    yvUpdate();
    yCountUpdate();
    // yApproxUpdate()
}

// function yApproxUpdate() {
//     for (var i = 0; i < nCont; i++) {
//         yApprox[i] = b1 * Math.sin(0.62832 * (xCont[i] - phase)) + b3 * Math.sin(3. * 0.62832 * (xCont[i] - phase)) +
//             b5 * Math.sin(5. * 0.62832 * (xCont[i] - phase)) + b7 * Math.sin(7. * 0.62832 * (xCont[i] - phase))
//     }
// }

// UI interaction
sampleSlider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + Math.pow(2, value);  // For displaying value
    }
});

phaseSlider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

sampleSlider.on('slideStop', function () {
    nSample = Math.pow(2, sampleSlider.bootstrapSlider('getValue'));  // Change "global" value
    xvUpdate();
    updateY()
});

phaseSlider.on('slideStop', function () {
    phase = phaseSlider.bootstrapSlider('getValue');  // Change "global" value
    updateY()
});
