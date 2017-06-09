/**
 * Created by Qi on 5/27/17.
 */

// Variables
var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue');
var plt0 = document.getElementById('plt0');
var plt1 = document.getElementById('plt1');

var epsilon1 = Math.pow(n1, 2);  // Permittivity
var epsilon2 = Math.pow(n2, 2);  // Permittivity
var reflectRatio, transmitRatio;

// Interactive interfaces
thetaISlider.on('change', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');
    plotRatios();

    $('thetaISliderVal').text(thetaI)
});

n1Slider.on('change', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    plotRatios();

    $('n1SliderVal').text(n1)
});

n2Slider.on('change', function () {
    n2 = n1Slider.bootstrapSlider('getValue');
    plotRatios();

    $('n2SliderVal').text(n2)
});

// Adjust Plotly's plotRatios size responsively according to window motion
window.onresize = function () {
    Plotly.Plots.resize(plt0);
    Plotly.Plots.resize(plt1);
};

// Initialize
$('thetaISliderVal').text(thetaI);
$('n1SliderVal').text(n1);
$('n2SliderVal').text(n2);