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
var spatialX = 20;  // Spatial dimension
var spatialZ = 20;  // Spatial dimension
var nx = 200;  // Grid size
var nz = 200;  // Grid size
var gridLengthX = spatialX / nx;
var gridLengthZ = spatialZ / nz;

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
    if (lwv === 0 || luv === 0) {  // Remember to include both
        return luv
    }

    var cosTheta = ((u.x - v.x) * (w.x - v.x) + (u.z - v.z) * (w.z - v.z)) / (lwv * luv);  // Cosine of angle between 2 segments
    var sinTheta = Math.sqrt(1 - sqr(cosTheta));  // Sine of angle between 2 segments
    return luv * sinTheta
}

function generate2DGrid(grid_x, grid_z) {
    var grid = [];

    for (var i = 0; i < grid_x; i++) {
        grid[i] = [];
        for (var j = 0; j < grid_z; j++) {
            grid[i][j] = {
                x: i * gridLengthX,  // Normalize grid coordinate
                z: j * gridLengthZ,  // Normalize grid coordinate
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
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[0].length; j++) {
            var u = grid[i][j];
            var d = generateDecayFactor(u, v, w);
            u.eFieldIntens = 1 * d;  // The intensity on line segment vw is 1
        }
    }
    return grid
}

function geteFieldIntens(grid) {
    var intens = [];
    for (var i = 0; i < grid.length; i++) {
        intens[i] = [];
        for (var j = 0; j < grid[0].length; j++) {
            intens[i][j] = grid[i][j].eFieldIntens
        }
    }
    return intens
}

// Plot
function createPlot() {
    var x = numeric.linspace(0, spatialX, nx);
    var y = numeric.linspace(0, spatialZ, nz);
    var z = geteFieldIntens(grid2D);

    var heatmap = {
        x: x,
        y: y,
        z: z,
        type: 'heatmap',
        colorscale: 'Viridis'
    };

    var data = [heatmap];

    // var layout = {
    //     title: 'efield',
    //     margin: {
    //         t: 0
    //     }
    // };

    Plotly.newPlot('plt', data)//, layout)
}

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
var grid2D = generate2DGrid(nx / 2, nz / 2);
assignDecayFactor(grid2D, grid2D[grid2D.length - 1][grid2D[0].length - 1], grid2D[0][0]);
createPlot();