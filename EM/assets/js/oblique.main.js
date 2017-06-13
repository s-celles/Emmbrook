/**
 * Created by Qi on 5/27/17.
 */

// Variables
var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue');  // Get incident angle from slider bar
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');
// Variables for calculation
var epsilon1 = Math.pow(n1, 2);  // Permittivity
var epsilon2 = Math.pow(n2, 2);  // Permittivity
var reflectRatioList, transmitRatioList;  // Used in oblique.rt.js
var thetaT;  // Transmission angle
var alpha, beta, t, r;

// Main interfaces
function updateRatioValues(tI) {
    /*
     Accept an incident angle tI, return the reflection ratio and transmission ratio.
     */
    alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(tI), 2)) / Math.cos(tI);
    beta = n1 / n2 * epsilon2 / epsilon1;
    t = 2 / (alpha + beta);
    r = (alpha - beta) / (alpha + beta);
    return [r, t]
}

// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    thetaT = Math.asin(n1 / n2 * Math.sin(thetaI));
    plotRatios();
    plotHeatmap();

    $('#thetaISliderVal').text(thetaI)
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotRatios();
    plotRatioLists();
    plotHeatmap();

    $('#n1SliderVal').text(n1)
});

n2Slider.on('change', function () {
    n2 = n1Slider.bootstrapSlider('getValue');
    [reflectRatioList, transmitRatioList] = updateRatioLists();
    plotRatios();
    plotRatioLists();
    plotHeatmap();

    $('#n2SliderVal').text(n2)
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

// Initialize
$('#thetaISliderVal').text(thetaI);
$('#n1SliderVal').text(n1);
$('#n2SliderVal').text(n2);
