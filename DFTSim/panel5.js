/**
 * Created by Qi on 5/15/17.
 */

var mySamples = new Slider('#mySamples');
mySamples.on('slideStop', function (value) {
    document.getElementById('slider').innerHTML = value;
});