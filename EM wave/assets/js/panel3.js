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
var ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
var ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
var pool = require('ndarray-scratch'); // A simple wrapper for typedarray-pool.
var unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
var cops = require('ndarray-complex'); // Complex arithmetic operations for ndarrays.
var tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.


// Variables
// Interactive variables
var n1Slider = $('#n1')
    .bootstrapSlider({});
var n2Slider = $('#n2')
    .bootstrapSlider({});
var thetaISlider = $('#thetaI')
    .bootstrapSlider({});
var lambdaSlider = $('#lambda')
    .bootstrapSlider({});
var n1 = n1Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue'); // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue'); // Get incident angle from slider bar
var lambda = lambdaSlider.bootstrapSlider('getValue'); // Get incident wave length from slider bar
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
var opt, sty;
// Start and stop animation
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var reqId; // Cancels an animation frame request previously scheduled through a call to window.requestAnimationFrame().
// Variables for calculation
var epsilon1 = Math.pow(n1, 2); // Permittivity
var epsilon2 = Math.pow(n2, 2); // Permittivity


// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    plotHeatmap(opt, sty);
    plotRatios();
    updateAnimationInitials();

    $('#thetaISliderVal')
        .text(thetaI);
});

lambdaSlider.on('change', function () {
    lambda = lambdaSlider.bootstrapSlider('getValue');
    plotHeatmap(opt, sty);
    updateAnimationInitials();

    $('#lambdaSliderVal')
        .text(lambda);
})

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotHeatmap(opt, sty);
    plotRatios();
    plotRatioLists();
    updateAnimationInitials();

    $('#n1SliderVal')
        .text(n1);
});

n2Slider.on('change', function () {
    n2 = n2Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotHeatmap(opt, sty);
    plotRatios();
    plotRatioLists();
    updateAnimationInitials();

    $('#n2SliderVal')
        .text(n2);
});

$('#optSelect') // See https://silviomoreto.github.io/bootstrap-select/options/
    .on('changed.bs.select', function () {
        var selectedValue = $(this)
            .val();
        switch (selectedValue) {
            case 'Incident':
                opt = 0;
                break;
            case 'Reflected':
                opt = 1;
                break;
            case 'Transmitted':
                opt = 2;
                break;
            case 'Total':
                opt = 3;
                break;
            default:
                new RangeError('This option is not valid!')
        }
        ;
        plotHeatmap(opt, sty);
    });

$('#stySelect') // See https://silviomoreto.github.io/bootstrap-select/options/
    .on('changed.bs.select', function () {
        var selectedValue = $(this)
            .val();
        switch (selectedValue) {
            case 'Instantaneous intensity':
                sty = 0;
                break;
            case 'Time averaged intensity':
                sty = 1;
                break;
            default:
                new RangeError('This style is not valid!')
        }
        ;
        plotHeatmap(opt, sty);
    });

var isAnimationOff = true; // No animation as default
$('#animate')
    .on('click', function () {
        var $this = $(this);
        if (isAnimationOff) { // If no animation, a click starts one.
            isAnimationOff = false;
            $this.text('Off');
            updateAnimationInitials();
            reqId = requestAnimationFrame(animatePlot0); // Start animation
        } else { // If is already in animation, a click stops it.
            isAnimationOff = true;
            $this.text('On');
            cancelAnimationFrame(reqId); // Stop animation
        }
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

    var data = [trace0, trace1, trace2];

    Plotly.newPlot(plt1, data, layout);
}


///////////////////////////////////////////////////////////////////////////
//////////////////// EM oblique incidence on media ////////////////////////
///////////////////////////////////////////////////////////////////////////
var zNum = 250;
var xNum = 250;
var zCoord = ndarray(new Float64Array(numeric.linspace(-10, 10, zNum + 1)));
var xCoord = ndarray(new Float64Array(numeric.linspace(0, 10, xNum + 1)));
var optionIndices = ndarray(new Float64Array(numeric.linspace(0, 2, 3)));
// Generate a 3D mesh cotaining z, x and i coordinates for each point.
var zMesh = reshape(tile(zCoord, [xNum + 1, 3]), [xNum + 1, zNum + 1, 3]); // shape -> [xNum + 1, zNum + 1, 3]
var xMesh = tile(xCoord, [1, zNum + 1, 3]); // shape -> [xNum + 1, zNum + 1, 3]
var iMesh = reshape(tile(tile(tile(optionIndices, [1]), [1, zNum + 1])
    .transpose(1, 0), [xNum + 1]), [xNum + 1, zNum + 1, 3]); // shape -> [xNum + 1, zNum + 1, 3]

function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}

function updateKVector() {
    /*
     kVector = k0 * [n1, n1, n2]
     kVector will change if lambda, n1 or n2 change.
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
     kZ and kX will change if thetaI, lambda, n1 or n2 change.
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

function updateGeneralAmplitude() { // correct
    /* 
     Consider amplitudes for the three waves together.
     Amplitude A has dimension [xNum + 1, zNum + 1, 3].
     A changes when thetaI, lambda, n1, or n2 change.
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
    var aux = pool.zeros(mesh.shape);
    for (var i = 0; i < vec.shape[0]; i++) {
        // You cannot use ops.mulseq for it will accumulate the sum and cause wrong result.
        ops.muls(aux.pick(null, null, i), mesh.pick(null, null, i), vec.get(i));
    }
    return aux;
}

function updateEachAmplitude() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     Real amplitude reA has dimension [xNum + 1, zNum + 1, 3].
     Imaginary amplitude imA has dimension [xNum + 1, zNum + 1, 3].
     */
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
        case 3: {
            var reField, imField;
            reField = pool.zeros(reA.shape.slice(0, -1));
            imField = pool.zeros(imA.shape.slice(0, -1));
            for (var i = 0; i < 3; i++) {
                cops.addeq(reField, imField, reA.pick(null, null, i), imA.pick(null, null, i));
            }
            return [reField, imField];
        }
        case 0: // Fallthrough, incident field
        case 1: // Fallthrough, reflected field
        case 2: // Transmitted field
            return [reA.pick(null, null, option), imA.pick(null, null, option)];
        default:
            alert("You have inputted a wrong option!");
    }
}

function updateInstantaneousIntensity(option) {
    var reField, imField;
    [reField, imField] = selectField(option);
    // re( (a + i b)*(a + i b) ) = a^2 - b^2
    ops.powseq(reField, 2); // a^2
    ops.powseq(imField, 2); // b^2
    ops.subeq(reField, imField); // a^2 - b^2
    return reField;
}

function updateAveragedIntensity(option) {
    var reField, imField;
    [reField, imField] = selectField(option);
    // re( (a + i b)*(a - i b) ) = a^2 + b^2
    ops.powseq(reField, 2); // a^2
    ops.powseq(imField, 2); // b^2
    ops.addeq(reField, imField); // a^2 - b^2
    return reField;
}

// Plot
function chooseIntensity(option, style) {
    /*
     option: {0: incident, 1: reflected intensity, 2: transmitted intensity, 3: total intensity},
     style: {0: instantaneous intensity, 1: time-averaged intensity}.
     */
    switch (style) {
        case 0:
            return unpack(updateInstantaneousIntensity(option));
            break;
        case 1:
            return unpack(updateAveragedIntensity(option));
            break;
        default:
            alert("You have inputted a wrong style!");
    }
    ;
}

function plotHeatmap(option, style) {
    plt0.data[0].z = chooseIntensity(option, style);

    Plotly.redraw(plt0);
}

function createHeatmap(option, style) {
    var trace0 = {
        x: unpack(zCoord),
        y: unpack(xCoord),
        z: chooseIntensity(option, style),
        type: 'heatmap'
    };

    var trace1 = {
        x: [0, 0],
        y: [0, 10],
        mode: 'lines',
        line: {
            color: '#ff0000'
        }
    }

    var texts = {
        x: [-6, 6],
        y: [5, 5],
        text: ['medium 1', 'medium 2'],
        mode: 'text',
        textfont: {
            color: '#ffffff'
        }
    };

    var data = [trace0, trace1, texts];

    var layout = {
        title: 'E filed intensity',
        yaxis: {
            title: 'x'
        },
        xaxis: {
            title: 'z'
        },
        showlegend: false
    };

    Plotly.newPlot('plt0', data, layout);
}


///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Animation /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define a new global namespace ANIMATE for those variables which have 
// same name as the plotting subroutines.
var ANIMATE = {};
var dt = 0.05;
var omega = Math.PI * 2;
ANIMATE.aux = pool.zeros(xMesh.shape); // This shape does not change, so initialize at first.


function updateAnimationInitials() {
    /*
     This subroutine defines some initial values for the animation,
     so it can follow the user's controlling of slider bars or dropdown
     menus.
     */
    [ANIMATE.kZ, ANIMATE.kX] = updateKxAndKz();
    // Here kxx and kzz are not used by other subroutines, so they are defined locally.
    var kzz = tensorProduct(zMesh, ANIMATE.kZ); // kzz = kz * z
    var kxx = tensorProduct(xMesh, ANIMATE.kX); // kxx = kx * x
    ops.add(ANIMATE.aux, kxx, kzz); // aux = kx * x + kz * z
}

function updateFrame() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     Real amplitude reA has dimension [xNum + 1, zNum + 1, 3].
     Imaginary amplitude imA has dimension [xNum + 1, zNum + 1, 3].
     */
    ANIMATE.reA = updateGeneralAmplitude();
    ANIMATE.imA = pool.zeros(ANIMATE.reA.shape);
    ops.subseq(ANIMATE.aux, omega * dt); // aux -= omega * dt
    // If we want to use ndarray-complex package, we need to specify real and imaginary parts.
    var rePhase = pool.zeros(ANIMATE.aux.shape);
    var imPhase = pool.zeros(ANIMATE.aux.shape);
    ops.cos(rePhase, ANIMATE.aux); // re( np.exp(1j * (kx * x + kz * z)) - 1j * omega * (time + dt) )
    ops.sin(imPhase, ANIMATE.aux); // im( np.exp(1j * (kx * x + kz * z)) - 1j * omega * (time + dt) )
    cops.muleq(ANIMATE.reA, ANIMATE.imA, rePhase, imPhase);
    switch (opt) {
        case 3: {
            ANIMATE.reField = pool.zeros(ANIMATE.reA.shape.slice(0, -1));
            ANIMATE.imField = pool.zeros(ANIMATE.imA.shape.slice(0, -1));
            for (var i = 0; i < 3; i++) {
                cops.addeq(ANIMATE.reField, ANIMATE.imField, ANIMATE.reA.pick(null, null, i), ANIMATE.imA.pick(null, null, i));
            }
        }
        case 0: // Fallthrough, incident field
        case 1: // Fallthrough, reflected field
        case 2: // Transmitted field
            [ANIMATE.reField, ANIMATE.imField] = [ANIMATE.reA.pick(null, null, opt), ANIMATE.imA.pick(null, null, opt)];
    }
    switch (sty) {
        case 0:
            ops.powseq(ANIMATE.reField, 2); // a^2
            ops.powseq(ANIMATE.imField, 2); // b^2
            ops.subeq(ANIMATE.reField, ANIMATE.imField); // a^2 - b^2
        case 1:
            ops.powseq(ANIMATE.reField, 2); // a^2
            ops.powseq(ANIMATE.imField, 2); // b^2
            ops.addeq(ANIMATE.reField, ANIMATE.imField); // a^2 - b^2
    }
    ;
}

function animatePlot0() {
    updateFrame();

    Plotly.animate('plt0', {
        data: [{
            z: unpack(ANIMATE.reField), // Always remember to unpack ndarray!
            type: 'heatmap'
        }]
    }, {
        transition: {
            duration: 0
        },
        frame: {
            duration: 0,
            redraw: true // You have to set this to true.
        }
    });

    reqId = requestAnimationFrame(animatePlot0); // Return the request id, that uniquely identifies the entry in the callback list.
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////// Initialize //////////////////////////////////
///////////////////////////////////////////////////////////////////////////
$('#thetaISliderVal')
    .text(thetaI);
$('#lambdaSliderVal')
    .text(lambda);
$('#n1SliderVal')
    .text(n1);
$('#n2SliderVal')
    .text(n2);
// Left panel
opt = 3;
sty = 0;
createHeatmap(opt, sty);
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();
// Animation
updateAnimationInitials();
