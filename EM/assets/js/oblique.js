/**
 * Created by Qi on 5/27/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
/* jshint -W097 */
'use strict';
// Import libraries
var numeric = require('numeric');
var ndarray = require('ndarray');
var ops = require('ndarray-ops');
var pool = require('ndarray-scratch');
var unpack = require('ndarray-unpack');
var cops = require('ndarray-complex'); // Complex arithmetic operations for ndarrays.
var show = require('ndarray-show');
var tile = require('ndarray-tile');


// Variables
var n1Slider = $('#n1')
    .bootstrapSlider();
var n2Slider = $('#n2')
    .bootstrapSlider();
var thetaISlider = $('#thetaI')
    .bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue'); // Get incident angle from slider bar
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
var option = 0;
var style = 0;
// Variables for calculation
var epsilon1 = Math.pow(n1, 2); // Permittivity
var epsilon2 = Math.pow(n2, 2); // Permittivity


// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    plotRatios();
    plotHeatmap(option, style);

    $('#thetaISliderVal')
        .text(thetaI);
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    // plotBrewsterAngle();
    plotRatios();
    plotRatioLists();
    plotHeatmap(option, style);

    $('#n1SliderVal')
        .text(n1);
});

n2Slider.on('change', function () {
    n2 = n2Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    // plotBrewsterAngle();
    plotRatios();
    plotRatioLists();
    plotHeatmap(option, style);

    $('#n2SliderVal')
        .text(n2);
});

// $('inci')
//     .click(function () {
//         option = 0;
//     });

// $('refl')
//     .click(function () {
//         option = 1;
//     });

// $('trans')
//     .click(function () {
//         option = 2;
//     });

// $('inst')
//     .click(function () {
//         console.log(option);
//         style = 0;
//         plotHeatmap(option, style);
//     });

// $('tav')
//     .click(function () {
//         console.log(option);
//         style = 1;
//         plotHeatmap(option, style);
//     });

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};


///////////////////////////////////////////////////////////////////////////
////////////////// Reflection and transmission ratios /////////////////////
///////////////////////////////////////////////////////////////////////////
var reflectRatioList, transmitRatioList;
var thetaIList = numeric.linspace(0, Math.PI / 2, 250);


function updateRatioValues(tI) {
    /*
     Accept an incident angle tI, return the reflection ratio and transmission ratio.
     */
    var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
    var beta = n1 / n2 * epsilon2 / epsilon1;
    var t = 2 / (alpha + beta);
    var r = (alpha - beta) / (alpha + beta);
    return [r, t];
}

function updateRatioLists() {
    /*
     Return: An array of [[r0, r1, ...], [t0, t1, ...]].
     */
    return numeric.transpose(thetaIList.map(updateRatioValues));
}

function updateBrewsterAngle() {
    /*
     Brewster angle changes when n1, n2 changes.
     */
    epsilon1 = Math.pow(n1, 2);
    epsilon2 = Math.pow(n2, 2);
    return (n1 / n2 * epsilon2 / epsilon1);
}


// Plot
function plotRatios() {
    /*
     Make 2 "ratios" points move as their real values.
     */
    plt1.data[2].x = [thetaI, thetaI];
    plt1.data[2].y = updateRatioValues(thetaI);
    Plotly.redraw(plt1);
}

function plotRatioLists() {
    /*
     Re-plot 2 curves.
     */
    plt1.data[0].y = reflectRatioList;
    plt1.data[1].y = transmitRatioList;

    Plotly.redraw(plt1);
}

function plotBrewsterAngle() {
    plt1.data[3].x = [updateBrewsterAngle()];
    Plotly.redraw(plt1);
}

function createRatioPlot() {
    var layout = {
        title: 'reflection and transmission ratio',
        xaxis: {
            title: 'theta_I',
            titlefont: {
                size: 18
            },
            tickmode: 'array',
            tickvals: [0, Math.PI / 12, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2],
            ticktext: ['0', 'pi/12', 'pi/6', 'pi/4', 'pi/3', 'pi/2'],
            range: [0, Math.PI / 2]
        },
        yaxis: {
            title: 'Ratio',
            titlefont: {
                size: 18
            }
        }
    };

    var trace0 = {
        x: thetaIList,
        y: reflectRatioList,
        type: 'scatter',
        mode: 'lines',
        name: 'r'
    };

    var trace1 = {
        x: thetaIList,
        y: transmitRatioList,
        type: 'scatter',
        mode: 'lines',
        name: 't'
    };

    var trace2 = {
        x: [thetaI, thetaI],
        y: updateRatioValues(thetaI),
        type: 'scatter',
        mode: 'markers',
        name: 'ratios'
    };

    var trace3 = {
        x: [1],
        y: [0],
        type: 'scatter',
        mode: 'markers',
        name: 'Brewster angle'
    };

    var data = [trace0, trace1, trace2];

    Plotly.newPlot(plt1, data, layout);
}


///////////////////////////////////////////////////////////////////////////
//////////////////// EM oblique incidence on media ////////////////////////
///////////////////////////////////////////////////////////////////////////
var zNum = 100;
var xNum = 50;
var zCoord = ndarray(new Float64Array(numeric.linspace(-10, 10, zNum + 1)));
var xCoord = ndarray(new Float64Array(numeric.linspace(0, 10, xNum + 1)));
var optionIndices = ndarray(new Float64Array(numeric.linspace(0, 2, 3)));
var lambda = 1;
// Generate a 3D mesh cotaining z, x and i coordinates for each point.
var zMesh = reshape(tile(zCoord, [xNum + 1, 3]), [xNum + 1, zNum + 1, 3]);
var xMesh = tile(xCoord, [1, zNum + 1, 3]);
var iMesh = reshape(tile(tile(tile(optionIndices, [1]), [1, zNum + 1]).transpose(1, 0), [xNum + 1]), [xNum + 1, zNum + 1, 3]);

function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}

function updateKVector() {
    /*
     kVector = k0 * [n1, n1, n2]
     kVector will change if n1 or n2 change.
     */
    var k0 = 2 * Math.PI / lambda; // Free-space wavenumber
    var kVector = ndarray(new Float64Array(3)); // Wavenumbers for incident, reflected, transmitted waves
    ops.muls(kVector, ndarray(new Float64Array([n1, n1, n2])), k0);
    return kVector;
}

function updateKxAndKz() {
    /*
     Calculate z component for incident, reflected, and transmitted wave's k vector,
     and x component for incident, reflected, and transmitted wave's k vector.
     kZ and kX will change if thetaI, n1 or n2 change.
     */
    var kVector = updateKVector();
    var thetaT = Math.asin(n1 / n2 * Math.sin(thetaI)); // Transmitted angle from Snell's law
    var kZ = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kz
    var kX = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kx
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
    var greaterEqualThan0 = pool.malloc(iMesh.shape);
    ops.geqs(greaterEqualThan0, zMesh, 0); // greaterEqualThan0 is a 1/0 grid.

    // 1 for negative z, 0 otherwise
    var lessThan0 = pool.malloc(iMesh.shape);
    ops.lts(lessThan0, zMesh, 0); // lessThan0 is a 1/0 grid.
    return [greaterEqualThan0, lessThan0];
}

function updateGeneralAmplitude() {
    /* 
     Consider amplitudes for the three waves together.
     Amplitude A has dimension (zNum + 1, xNum + 1, 3).
     A changes when thetaI, n1, or n2 change.
     */
    var r, t;
    [r, t] = updateRatioValues(thetaI); // Reflected and transmitted amplitudes
    var A = pool.zeros(iMesh.shape);
    var aux = pool.zeros(iMesh.shape); // Auxiliary grid
    ops.eqs(A, iMesh, 0); // aux[i,j,k] = 1 if iMesh[i,j,k] === 0
    ops.eqs(aux, iMesh, 1); // aux[i,j,k] = true if iMesh[i,j,k] === 1
    ops.addeq(A, ops.mulseq(aux, r)); // A += np.equal(iMesh, 1) * r
    ops.eqs(aux, iMesh, 2); // aux[i,j,k] = true if iMesh[i,j,k] === 2
    ops.addeq(A, ops.mulseq(aux, t)); // A += np.equal(iMesh, 2) * t

    var greaterEqualThan0, lessThan0;
    [greaterEqualThan0, lessThan0] = updateMask();
    ops.muleq(A.pick(null, null, 0), lessThan0.pick(null, null, 0)); // A[:, :, 0] *= lessThan0[:, :, 0]
    ops.muleq(A.pick(null, null, 1), lessThan0.pick(null, null, 1)); // A[:, :, 1] *= lessThan0[:, :, 1]
    ops.muleq(A.pick(null, null, 2), greaterEqualThan0.pick(null, null, 2)); // A[:, :, 2] *= greaterEqualThan0[:, :, 2]
    return A;
}

function tensorProduct(mesh, vec) {
    for (var i = 0; i < vec.shape[0]; i++) {
        ops.mulseq(mesh.pick(null, null, i), vec.get(i));
    }
    return mesh;
}

function updateEachAmplitude() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     Real amplitude reA has dimension (zNum + 1, xNum + 1, 3).
     Imaginary amplitude imA has dimension (zNum + 1, xNum + 1, 3).
     */
    var time = 0;
    var reA = updateGeneralAmplitude();
    var imA = pool.zeros(reA.shape);
    var kZ, kX;
    [kZ, kX] = updateKxAndKz();
    var kzz = tensorProduct(zMesh, kZ); // kzz = kz * z
    var kxx = tensorProduct(xMesh, kX); // kxx = kx * x
    var aux = pool.zeros(kxx.shape);
    ops.add(aux, kxx, kzz); // aux = kx * x + kz * z
    // If we want to use ndarray-complex package, we need to specify real and imaginary parts.
    var rePhase, imPhase;
    rePhase = pool.zeros(aux.shape);
    imPhase = pool.zeros(aux.shape);
    ops.cos(rePhase, aux); // re( np.exp(1j * (kx * x + kz * z)) )
    ops.sin(imPhase, aux); // im( np.exp(1j * (kx * x + kz * z)) )
    cops.muleq(reA, imA, rePhase, imPhase);
    return [reA, imA];
}

function selectField(option) {
    var reA, imA;
    [reA, imA] = updateEachAmplitude();
    switch (option) {
        case 0:
            return [reA.pick(null, null, 0), imA.pick(null, null, 0)];
        case 1:
            return [reA.pick(null, null, 1), imA.pick(null, null, 1)];
        case 2:
            return [reA.pick(null, null, 2), imA.pick(null, null, 2)];
    }
}

function updateInstantaneousIntensity(option) {
    var fieldRe, fieldIm;
    [fieldRe, fieldIm] = selectField(option);
    // Re((a + i b)*(a + i b)) = a^2 - b^2
    ops.powseq(fieldRe, 2); // a^2
    ops.powseq(fieldIm, 2); // b^2
    ops.subeq(fieldRe, fieldIm); // a^2 - b^2
    return fieldRe;
}

function updateAveragedIntensity(option) {
    var fieldRe, fieldIm;
    [fieldRe, fieldIm] = selectField(option);
    // Re((a + i b)*(a - i b)) = a^2 + b^2
    ops.powseq(fieldRe, 2); // a^2
    ops.powseq(fieldIm, 2); // b^2
    ops.addeq(fieldRe, fieldIm); // a^2 - b^2
    return fieldRe;
}

// Plot
function plotHeatmap(option, style) {
    switch (style) {
        case 1:
            plt0.data[0].z = unpack(updateAveragedIntensity(option));
            break;
        case 0:
            plt0.data[0].z = unpack(updateInstantaneousIntensity(option));
    };

    Plotly.redraw(plt0);
}

function createHeatmap(option, style) {
    var intens;
    switch (style) {
        case 1:
            intens = unpack(updateAveragedIntensity(option));
            break;
        case 0:
            intens = unpack(updateInstantaneousIntensity(option));
    };

    var trace = {
        // x: zCoord,
        // y: xCoord,
        z: intens,
        type: 'heatmap'
    };

    var texts = {
        x: [-8, 8],
        y: [5, 5],
        text: ['medium 1', 'medium 2'],
        mode: 'text',
        textfont: {
            color: '#ffffff'
        }
    };

    var data = [trace];

    var layout = {
        title: 'E filed intensity',
        yaxis: {
            title: 'x'
        },
        xaxis: {
            title: 'z'
        }
    };

    Plotly.newPlot('plt0', data, layout);
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////// Initialize //////////////////////////////////
///////////////////////////////////////////////////////////////////////////
$('#thetaISliderVal')
    .text(thetaI);
$('#n1SliderVal')
    .text(n1);
$('#n2SliderVal')
    .text(n2);
// Left panel
createHeatmap(0, 0);
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();