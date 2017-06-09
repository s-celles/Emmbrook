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
var plt = document.getElementById('plt');

var epsilon1 = Math.pow(n1, 2);  // Permittivity
var epsilon2 = Math.pow(n2, 2);  // Permittivity
var nx = 200;  // Grid size
var nz = 200;  // Grid size

// Basic interfaces
function sqr(x) {
    return Math.pow(x, 2)
}

function dist2(v, w) {
    /*
     Calculate 2D distance between 2 points v and w.
     */
    return Math.sqrt(sqr(v.x - w.x) + sqr(v.z - w.z))
}

function dist2PointToSegment(u, v, w) {
    /*
     Calculate 2D distance between a point u and a line segment vw.
     */
    var lwv = dist2(w, v);
    var luv = dist2(u, v);
    if (lwv === 0) {
        return luv
    }

    var cosTheta = ((u.x - v.x) * (w.x - v.x) + (u.z - v.z) * (w.z - v.z)) / (lwv * luv);  // Cosine of angle between 2 segments
    var sinTheta = Math.sqrt(1 - sqr(cosTheta));  // Sine of angle between 2 segments
    return luv * sinTheta
}

function generate2DGrid(nx, nz) {
    var grid = [];

    for (var i = 0; i < nx; i++) {
        grid[i] = [];
        for (var j = 0; j < nz; j++) {
            grid[i][j] = {
                x: i / nx,  // Normalize grid coordinate
                z: j / nz,  // Normalize grid coordinate
                eFieldIntens: 0
            };
        }
    }
    return grid
}

function generateDecayFactor(u, v, w) {
    /*
     The electric field intensity I decays as exp(-r^2), where r is the radial distance of point u from line vw.
     */
    var r = dist2PointToSegment(u, v, w);
    return Math.exp(-sqr(r));
}

function assignDecayFactor(grid, v, w) {
    /*
     Assign each grid point an electric field intensity, according to its distance from line vw.
     */
    for (var i = 0; i < nx; i++) {
        for (var j = 0; j < nz; j++) {
            var u = grid[i][j];
            var d = generateDecayFactor(u, v, w);
            u.eFieldIntens = 1 * d;  // The intensity on line segment vw is 1
        }
    }
    return grid
}

var grid2D = generate2DGrid(nx, nz);
console.log(assignDecayFactor(grid2D, grid2D[0][0], grid2D[100][100]));

// Interactive interfaces
thetaISlider.on('slideStop', function () {
    thetaI = thetaISlider.bootstrapSlider('getValue');

    $('thetaISliderVal').text(thetaI)
});

n1Slider.on('slideStop', function () {
    n1 = n1Slider.bootstrapSlider('getValue');
    updateHeatmapValues();
    plot();

    $('n1SliderVal').text(n1)
});

n2Slider.on('slideStop', function () {
    n2 = n1Slider.bootstrapSlider('getValue');
    updateHeatmapValues();
    plot();

    $('n2SliderVal').text(n2)
});

// Initialize
