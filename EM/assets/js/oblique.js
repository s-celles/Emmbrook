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
var meshgrid = require('ndarray-meshgrid');
var ops = require("ndarray-ops");
var pool = require("ndarray-scratch");
var nj = require("numjs");
var unpack = require("ndarray-unpack");
var cops = require("ndarray-complex"); // Complex arithmetic operations for ndarrays.
var product = require('tensor-product');


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
// Variables for calculation
var epsilon1 = Math.pow(n1, 2); // Permittivity
var epsilon2 = Math.pow(n2, 2); // Permittivity


// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    plotRatios();
    updateSlopes();
    plotHeatmap();

    $('#thetaISliderVal')
        .text(thetaI);
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    // plotBrewsterAngle();
    plotRatios();
    plotRatioLists();
    updateSlopes();
    plotHeatmap();

    $('#n1SliderVal')
        .text(n1);
});

n2Slider.on('change', function () {
    n2 = n2Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    // plotBrewsterAngle();
    plotRatios();
    plotRatioLists();
    updateSlopes();
    plotHeatmap();

    $('#n2SliderVal')
        .text(n2);
});


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


// Main interfaces
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
var zNum = 250;
var xNum = 125;
var zCoord = numeric.linspace(-10, 10, zNum);
var xCoord = numeric.linspace(0, 10, xNum);
var zStep = (zCoord[zCoord.length - 1] - zCoord[0]) / zNum;
var xStep = (xCoord[xCoord.length - 1] - xCoord[0]) / xNum;
var optionIndices = numeric.linspace(0, 2, 3);
var lambda = 1;
// Something similar to np.meshgrid, but less straightforward to see, thus
// you should check the documentation detaily on
// http://scijs.net/packages/#scijs/ndarray.
var mesh = meshgrid([-10, 10, zStep], [0, 10, xStep], [0, 2, 1]);
var zMesh = mesh.pick(null, 0); // Pick the first column of mesh
var xMesh = mesh.pick(null, 1); // Pick the second column of mesh
var iMesh = mesh.pick(null, 2); // Pick the third column of mesh
zMesh = ndarray(zMesh, [zNum + 1, xNum + 1, 3]); // Reshape zMesh to (zNum + 1, xNum + 1, 3)
xMesh = ndarray(xMesh, [zNum + 1, xNum + 1, 3]); // Reshape xMesh to (xNum + 1, xNum + 1, 3)
iMesh = ndarray(iMesh, [zNum + 1, xNum + 1, 3]); // Reshape iMesh to (zNum + 1, xNum + 1, 3)


function generateKVector(params) {
    /*
     kVector = k0 * [n1, n1, n2]
     */
    var k0 = 2 * Math.PI / lambda; // Free-space wavenumber
    var kVector = ndarray(new Float64Array(3)); // Wavenumbers for incident, reflected, transmitted waves
    ops.muls(kVector, ndarray(new Float64Array([n1, n1, n2])), k0);
    return kVector;
}

function generateKxAndKz() {
    /*
     Calculate z component for incident, reflected, and transmitted wave's k vector,
     and x component for incident, reflected, and transmitted wave's k vector.
     */
    var kVector = generateKVector();
    var thetaT = Math.asin(n1 / n2 * Math.sin(thetaI)); // Transmitted angle from Snell's law
    var kZ = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kz
    var kX = ndarray(new Float64Array(3)); // Incident, reflected, transmit wave's kx
    ops.mul(kZ, ndarray([Math.cos(thetaI), -Math.cos(thetaI), Math.cos(thetaT)]), kVector); // Element-wise multiply
    ops.mul(kX, ndarray([Math.sin(thetaI), Math.sin(thetaI), Math.sin(thetaT)]), kVector); // Element-wise multiply
    return [kZ, kX];
}

function generateMask() {
    /*
     Masks regions: z<0 for I, R; z>0 for T
     */
    // 1 for positive z, 0 otherwise
    var greaterEqualThan0 = pool.malloc(iMesh.shape);
    ops.geqs(greaterEqualThan0, zMesh, 0); // greaterEqualThan0 is a true/false grid.
    ops.mulseq(greaterEqualThan0, 1); // You need to numerify it.

    // 1 for negative z, 0 otherwise
    var lessThan0 = pool.malloc(iMesh.shape);
    ops.lts(lessThan0, zMesh, 0); // lessThan0 is a true/false grid.
    ops.mulseq(lessThan0, 1); // You need to numerify it.

    return [greaterEqualThan0, lessThan0];
}

function generateGeneralAmplitude() {
    /* 
     Consider amplitudes for the three waves together.
     */
    var r, t;
    [r, t] = updateRatioValues(thetaI); // Reflected and transmitted amplitudes
    var A = pool.malloc(iMesh.shape);
    var aux = pool.malloc(iMesh.shape); // Auxiliary grid
    ops.eqs(aux, iMesh, 0); // aux[i,j,k] = true if iMesh[i,j,k] === 0
    ops.addeq(A, ops.mulseq(aux, 1)); // A += np.equal(iMesh, 0) * 1
    ops.eqs(aux, iMesh, 1); // aux[i,j,k] = true if iMesh[i,j,k] === 1
    ops.addeq(A, ops.mulseq(aux, r)); // A += np.equal(iMesh, 1) * r
    ops.eqs(aux, iMesh, 2); // aux[i,j,k] = true if iMesh[i,j,k] === 2
    ops.addeq(A, ops.mulseq(aux, t)); // A += np.equal(iMesh, 2) * t

    var greaterEqualThan0, lessThan0;
    [greaterEqualThan0, lessThan0] = generateMask();
    ops.muleq(A.pick(null, null, 0), lessThan0.pick(null, null, 0)); // A[:, :, 0] *= lessThan0[:, :, 0]
    ops.muleq(A.pick(null, null, 1), lessThan0.pick(null, null, 1)); // A[:, :, 1] *= lessThan0[:, :, 1]
    ops.muleq(A.pick(null, null, 2), greaterEqualThan0.pick(null, null, 2)); // A[:, :, 0] *= greaterEqualThan0[:, :, 0]
    return A;
}

function multiplication(a, b) {
    return a * b
}

function tensorContraction(mesh, vec) {
    /*
     This defines a tensor contraction.
     */
    return product.bind(multiplication, mesh.shape, vec.shape);
}

function generateEachAmplitude() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     */
    var time = 0;
    var kZ, kX;
    [kZ, kX] = generateKxAndKz();
    console.log(zMesh.shape, kZ.shape)
    var A = generateGeneralAmplitude();
    var kzz = tensorContraction(zMesh, kZ);
    console.log(kzz)
}

generateEachAmplitude();





// // Plot
// function plotHeatmap() {
//     plt0.data[0].z = updateAmplitudes();

//     Plotly.redraw(plt0);
// }

// function createHeatmap() {
//     var trace = {
//         x: xCoord,
//         y: zUpperCoord.concat(zLowerCoord),
//         z: updateAmplitudes(),
//         type: 'heatmap',
//         zmin: 0,
//         zmax: 2
//     };

//     var texts = {
//         x: [-8, -8],
//         y: [5, -5],
//         text: ['medium 1', 'medium 2'],
//         mode: 'text',
//         textfont: {
//             color: '#ffffff'
//         }
//     };

//     var data = [trace, texts];

//     var layout = {
//         title: 'E filed amplitude',
//         yaxis: {
//             title: 'z'
//         },
//         xaxis: {
//             title: 'x'
//         }
//     };

//     Plotly.newPlot('plt0', data, layout);
// }



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
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();
