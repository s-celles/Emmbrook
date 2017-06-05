/**
 * Created by Qi on 5/27/17.
 */

// Variables
var eFieldIncident = 1;
var eFieldReflect;
var eFieldTransmit;
var epsilon1 = 1;  // Permittivity
var epsilon2 = 2;  // Permittivity

var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var thetaISlider = $('#thetaI').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var thetaI = thetaISlider.bootstrapSlider('getValue');

// var thetaR = jQuery.extend({}, thetaIncident);  // Shallow copy thetaIncident into {}
var thetaT = Math.asin(Math.sin(thetaI) * n1 / n2);

var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(thetaI), 2)) / Math.cos(thetaI);
var beta = n1 / n2 * epsilon2 / epsilon1;
var t = 2 / (alpha + beta);  // Transmission amplitude
var r = (alpha - beta) / (alpha + beta);  // Reflection amplitude
eFieldReflect = r * eFieldIncident;
eFieldTransmit = t * eFieldIncident;

// Interactive interfaces
thetaISlider.on('slideStop', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');

    $('thetaISliderVal').text(thetaI)
});

n1Slider.on('slideStop', function () {
    n1 = n1Slider.bootstrapSlider('getValue');

    $('n1SliderVal').text(n1)
});

n2Slider.on('slideStop', function () {
    n2 = n1Slider.bootstrapSlider('getValue');

    $('n2SliderVal').text(n2)
});

