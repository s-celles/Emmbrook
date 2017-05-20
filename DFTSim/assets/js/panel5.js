/**
 * Created by Qi on 5/19/17.
 */

var mySamples = new Slider('#mySamples');
mySamples.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});

var myPhase = new Slider('#myPhase');
myPhase.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});

var B1 = new Slider('#B1');
B1.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});

var B3 = new Slider('#B3');
B3.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});

var B5 = new Slider('#B5');
B5.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});

var B7 = new Slider('#B7');
B7.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});