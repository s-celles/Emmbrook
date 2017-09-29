/**
 * Created by Qi on 5/27/17.
 */

///////////////////////////////////////////////////////////////////////////
///////////////////////////// Main part ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////
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
let numeric = require('numeric');
let ndarray = require('ndarray'); // Modular multidimensional arrays for JavaScript.
let ops = require('ndarray-ops'); // A collection of common mathematical operations for ndarrays. Implemented using cwise.
let pool = require('ndarray-scratch'); // A simple wrapper for typedarray-pool.
let unpack = require('ndarray-unpack'); // Converts an ndarray into an array-of-native-arrays.
let cops = require('ndarray-complex'); // Complex arithmetic operations for ndarrays.
let tile = require('ndarray-tile'); // This module takes an input ndarray and repeats it some number of times in each dimension.
let linspace = require('ndarray-linspace'); // Fill an ndarray with equally spaced values


// Variables
// Interactive variables
let n1Slider = $('#n1')
    .bootstrapSlider({});
let n2Slider = $('#n2')
    .bootstrapSlider({});
let thetaISlider = $('#thetaI')
    .bootstrapSlider({});
let lambdaSlider = $('#lambda')
    .bootstrapSlider({});
let timeSlider = $('#time')
    .bootstrapSlider({});
let n1 = n1Slider.bootstrapSlider('getValue'); // Get first refraction index from slider bar
let n2 = n2Slider.bootstrapSlider('getValue'); // Get second refraction index from slider bar
let thetaI = thetaISlider.bootstrapSlider('getValue'); // Get incident angle from slider bar
let lambda = lambdaSlider.bootstrapSlider('getValue'); // Get incident wave length from slider bar
let time = timeSlider.bootstrapSlider('getValue'); // Get time from slider bar
let plt0 = document.getElementById('plt0');
let plt1 = document.getElementById('plt1');
let opt, sty;
// Start and stop animation
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let reqId; // Cancels an animation frame request previously scheduled through a call to window.requestAnimationFrame().
// Variables for calculation
let epsilon1 = Math.pow(n1, 2); // Permittivity
let epsilon2 = Math.pow(n2, 2); // Permittivity


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
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotHeatmap(opt, sty);
    plotRatios();
    plotRatioLists();
    plotBrewsterAngle();
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
    plotBrewsterAngle();
    updateAnimationInitials();

    $('#n2SliderVal')
        .text(n2);
});

timeSlider.on('change', function () {
    time = timeSlider.bootstrapSlider('getValue');
    plotHeatmap(opt, sty);

    $('#timeSliderVal')
        .text(time);
});

$('#optSelect') // See https://silviomoreto.github.io/bootstrap-select/options/
    .on('changed.bs.select', function () {
        let selectedValue = $(this)
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
                new RangeError('This option is not valid!');
        }
        plotHeatmap(opt, sty);
    });

$('#stySelect') // See https://silviomoreto.github.io/bootstrap-select/options/
    .on('changed.bs.select', function () {
        let selectedValue = $(this)
            .val();
        switch (selectedValue) {
            case 'Instantaneous intensity':
                sty = 0;
                Plotly.relayout('plt0', {
                    title: 'instantaneous light intensity',
                });
                break;
            case 'Time-averaged intensity':
                sty = 1;
                Plotly.relayout('plt0', {
                    title: 'time-averaged light intensity',
                });
                break;
            case 'Field amplitude':
                sty = 2;
                Plotly.relayout('plt0', {
                    title: 'e-field amplitude',
                });
                break;
            default:
                new RangeError('This style is not valid!');
                break;
        }
        plotHeatmap(opt, sty);
    });

let isAnimationOff = true; // No animation as default
$('#animate')
    .on('click', function () {
        let $this = $(this);
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
let reflectRatioList, transmitRatioList;
let thetaIList = numeric.linspace(0, Math.PI / 2, 250);


function updatePermittivity() {
    /*
     Update global variables---2 permitivities whenever you change n1 and n2.
     This function is crucial, don't forget!
     */
    epsilon1 = Math.pow(n1, 2);
    epsilon2 = Math.pow(n2, 2);
}

function updateRatioValues(tI) {
    /*
     Accept an incident angle tI,
     return the reflection ratio and transmission ratio.
     */
    updatePermittivity();
    let alpha = Math.sqrt(1 - (n1 / n2 * Math.sin(tI)) ** 2) / Math.cos(tI);
    let beta = n1 / n2 * epsilon2 / epsilon1;
    let t = 2 / (alpha + beta);
    let r = (alpha - beta) / (alpha + beta);
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
    return Math.atan(n1 / n2 * epsilon2 / epsilon1);
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
    /*
     Re-plot Brewster angle.
     */
    plt1.data[3].x = [updateBrewsterAngle()];
    Plotly.redraw(plt1);
}

function createRatioPlot() {
    let layout = {
        title: 'reflection and transmission ratio',
        xaxis: {
            title: 'theta_I',
            titlefont: {
                size: 18,
            },
            tickmode: 'array',
            tickvals: [0, Math.PI / 12, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2],
            ticktext: ['0', 'pi/12', 'pi/6', 'pi/4', 'pi/3', 'pi/2'],
            range: [0, Math.PI / 2],
        },
        yaxis: {
            title: 'Ratio',
            titlefont: {
                size: 18,
            },
        },
    };

    let trace0 = {
        x: thetaIList,
        y: reflectRatioList,
        type: 'scatter',
        mode: 'lines',
        name: 'r',
    };

    let trace1 = {
        x: thetaIList,
        y: transmitRatioList,
        type: 'scatter',
        mode: 'lines',
        name: 't',
    };

    let trace2 = {
        x: [thetaI, thetaI],
        y: updateRatioValues(thetaI),
        type: 'scatter',
        mode: 'markers',
        name: 'ratios',
    };

    let trace3 = {
        x: [updateBrewsterAngle()],
        y: [0],
        type: 'scatter',
        mode: 'markers',
        name: 'Brewster angle'
    };

    let data = [trace0, trace1, trace2, trace3];

    Plotly.newPlot(plt1, data, layout);
}


///////////////////////////////////////////////////////////////////////////
//////////////////// EM oblique incidence on media ////////////////////////
///////////////////////////////////////////////////////////////////////////
let zNum = 10;
let xNum = 10;
let omega = 2 * Math.PI;
let zCoord = linspace(ndarray([], [zNum]), -10, 10);
zCoord.dtype = 'float64'; // Change dtype in order to use meshgrid function.
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

function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
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
    return [re, im]
}

function selectField(option) {
    /*
     option: {0: incident, 1: reflected, 2: transmitted, 3: total},
     */
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
    return unpack(reField);
}

function updateAveragedIntensity(option) {
    /*
     This function calculates time-averaged intensity of Poynting vector, which is
     proportional to the square of the field's magnitude.
     */
    let reField, imField;
    [reField, imField] = selectField(option);
    let intensity = pool.zeros(reField.shape);
    cops.mag(intensity, reField, imField); // intensity = field * conj(field) = reField^2 + imField^2,
    // Note that cops.mag function calculates complex magnitude (squared length).
    return unpack(intensity);
}

function updateFieldAmplitude(option) {
    /*
     This function calculates instantaneous field incident/reflected/transmitted amplitude,
     depending on the option argument.
     */
    let reField, imField;
    [reField, imField] = selectField(option);
    let amplitude = pool.zeros(reField.shape);
    // amplitude = sqrt(field * conj(field)) = sqrt(reField^2 + imField^2),
    // Note that cops.abs function calculates complex length.
    cops.abs(amplitude, reField, imField);
    return unpack(amplitude);
}


// Plot
function chooseIntensity(option, style) {
    /*
     option: {0: incident, 1: reflected, 2: transmitted, 3: total},
     style: {0: instantaneous intensity, 1: time-averaged intensity, 2: field amplitude}.
     */
    switch (style) {
        case 0:
            return updateInstantaneousIntensity(option);
            break;
        case 1:
            return updateAveragedIntensity(option);
            break;
        case 2:
            return updateFieldAmplitude(option);
            break;
        default:
            throw new Error('You have inputted a wrong style!');
    }
}

function plotHeatmap(option, style) {
    plt0.data[0].z = chooseIntensity(option, style);

    Plotly.redraw(plt0);
}

function createHeatmap(option, style) {
    let trace0 = {
        x: unpack(zCoord),
        y: unpack(xCoord),
        z: chooseIntensity(option, style),
        type: 'heatmap',
    };

    let trace1 = {
        x: [0, 0],
        y: [0, 10],
        mode: 'lines',
        line: {
            color: '#ff0000',
        },
    };

    let texts = {
        x: [-6, 6],
        y: [5, 5],
        text: ['Material 1', 'Material 2'],
        mode: 'text',
        textfont: {
            color: '#ffffff',
        },
    };

    let data = [trace0, trace1, texts];

    let layout = {
        title: 'instantaneous light intensity',
        yaxis: {
            title: 'x',
            titlefont: {
                size: 18,
            },
            autorange: "reversed", // This is very important because Plotly draws from the bottom left corner!
        },
        xaxis: {
            title: 'z',
            titlefont: {
                size: 18,
            },
        },
        showlegend: false,
    };

    Plotly.newPlot('plt0', data, layout);
}


///////////////////////////////////////////////////////////////////////////
/////////////////////////////// Animation /////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Define a new global namespace ANIMATE for variables which have the
// same name as those in the plotting subroutines.
let ANIMATE = {};
let dt = Math.E;
ANIMATE.aux = pool.zeros(xMesh.shape); // This shape does not change, so initialize at first.


function updateAnimationInitials() {
    /*
     This subroutine defines some initial values for the animation,
     so it can follow the user's controlling of slider bars or dropdown
     menus. This function is fired when those controllers are cliked/dragged.
     */
    [ANIMATE.kZ, ANIMATE.kX] = updateKxAndKz();
    // Here kxx and kzz are not used by other subroutines, so they are defined locally.
    let kzz = tensorProduct(zMesh, ANIMATE.kZ); // kzz = kz * z
    let kxx = tensorProduct(xMesh, ANIMATE.kX); // kxx = kx * x
    ops.add(ANIMATE.aux, kxx, kzz); // aux = kx * x + kz * z
}

function updateFrame() {
    /*
     Generate individual wave amplitudes for incident, reflected, and transmitted.
     Real amplitude reA has dimension [xNum, zNum, 3].
     Imaginary amplitude imA has dimension [xNum, zNum, 3].
     */
    ANIMATE.reA = updateGeneralAmplitude();
    ANIMATE.imA = pool.zeros(ANIMATE.reA.shape);
    ops.subseq(ANIMATE.aux, omega * dt); // aux -= omega * dt
    // If we want to use ndarray-complex package, we need to specify real and imaginary parts.
    let rePhase = pool.zeros(ANIMATE.aux.shape);
    let imPhase = pool.zeros(ANIMATE.aux.shape);
    ops.cos(rePhase, ANIMATE.aux); // re( np.exp(1j * (kx * x + kz * z)) - 1j * omega * dt )
    ops.sin(imPhase, ANIMATE.aux); // im( np.exp(1j * (kx * x + kz * z)) - 1j * omega * dt )
    cops.muleq(ANIMATE.reA, ANIMATE.imA, rePhase, imPhase);
    switch (opt) {
        case 3: {
            ANIMATE.reField = pool.zeros(ANIMATE.reA.shape.slice(0, -1));
            ANIMATE.imField = pool.zeros(ANIMATE.imA.shape.slice(0, -1));
            for (let i = 0; i < 3; i++) {
                cops.addeq(ANIMATE.reField, ANIMATE.imField, ANIMATE.reA.pick(null, null, i), ANIMATE.imA.pick(null, null, i));
            }
        }
            break; // Don't forget to break!
        case 0: // Fallthrough, incident field
        case 1: // Fallthrough, reflected field
        case 2: // Transmitted field
            [ANIMATE.reField, ANIMATE.imField] = [ANIMATE.reA.pick(null, null, opt), ANIMATE.imA.pick(null, null, opt)];
            break; // Don't forget to break!
    }
    switch (sty) {
        case 0:
            cops.muleq(ANIMATE.reField, ANIMATE.imField, ANIMATE.reField, ANIMATE.imField);
            break; // Don't forget to break!
        case 1:
            cops.mag(ANIMATE.reField, ANIMATE.reField, ANIMATE.imField);
            break;
        case 2:
            cops.abs(ANIMATE.reField, ANIMATE.reField, ANIMATE.imField);
            break;
    }
}

function animatePlot0() {
    updateFrame();

    Plotly.animate('plt0', {
        data: [{
            z: unpack(ANIMATE.reField), // Always remember to unpack ndarray!
            type: 'heatmap',
        }],
    }, {
        transition: {
            duration: 0,
        },
        frame: {
            duration: 0,
            redraw: true, // You have to set this to true.
        },
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
$('#timeSliderVal')
    .text(time);
// Left panel
opt = 3;
sty = 0;
createHeatmap(opt, sty);
// Right panel
[reflectRatioList, transmitRatioList] = updateRatioLists();
createRatioPlot();
