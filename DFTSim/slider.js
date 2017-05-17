/**
 * Created by Qi on 5/15/17.
 */

var Slider = require("bootstrap-slider");

var slider = new Slider();

// With JQuery
$('#amp').slider({
    formatter: function (value) {
        return 'Current value: ' + value;
    }
});
