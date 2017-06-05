/**
 * Created by Qi on 5/27/17.
 */

var eFieldIncident = 1;
var eFieldReflect;
var eFieldTransmit;
var epsilon1 = 1;  // Permittivity
var epsilon2 = 2;  // Permittivity

var n1Slider = $('#n1').bootstrapSlider();
var n2Slider = $('#n2').bootstrapSlider();
var n1 = n1Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar
var n2 = n2Slider.bootstrapSlider('getValue');  // Get refraction index from slider bar

var thetaISlider = $('#thetaI').bootstrapSlider();
var thetaI = thetaISlider.bootstrapSlider('getValue');
// var thetaR = jQuery.extend({}, thetaIncident);  // Shallow copy thetaIncident into {}
var thetaT = Math.asin(Math.sin(thetaI) * n1 / n2);

var alpha = Math.sqrt(1 - Math.pow(n1 / n2, 2) * Math.pow(Math.sin(thetaI), 2)) / Math.cos(thetaI);
var beta = n1 / n2 * epsilon2 / epsilon1;
var t = 2 / (alpha + beta);  // Transmission amplitude
var r = (alpha - beta) / (alpha + beta);  // Reflection amplitude
eFieldReflect = r * eFieldIncident;
eFieldTransmit = t * eFieldIncident;



// UI interaction
thetaISlider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

n1Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});

n2Slider.bootstrapSlider({
    formatter: function (value) {
        return 'Current value: ' + value;  // For displaying value
    }
});
