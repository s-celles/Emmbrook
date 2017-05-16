/**
 * Created by Qi on 5/15/17.
 */


// With JQuery
$('#ex1').slider({
    formatter: function (value) {
        return 'Current value: ' + value;
    }
});
