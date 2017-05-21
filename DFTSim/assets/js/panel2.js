/**
 * Created by Qi on 5/20/17.
 */

function freqUpdate(q) {
    document.querySelector('#freqBox').value = q;
    myFunction();
}
function ampUpdate(q) {
    document.querySelector('#ampBox').value = q;
    myFunction();
}
function phaseUpdate(q) {
    document.querySelector('#phsBox').value = q;
    myFunction();
}

var nMax = 200
var nSamp = nMax
var xHi = 10.
var xv = new Array(nMax)
var yv = new Array(nMax)
var xpts = new Array(nSamp)
var ypts = new Array(nSamp)


fval = document.getElementById("myFreq").value;

for (var i = 0; i < nMax; i++) {
    xv[i] = i / nMax * xHi;
    yv[i] = Math.sin(2. * 3.14159 * fval * xv[i])
}

ampRand = Math.random()
phsRand = Math.random()
freqRand = Math.random()

for (var i = 0; i < nSamp; i++) {
    xpts[i] = i / nSamp * xHi;
    ypts[i] = ampRand * Math.sin(phsRand + freqRand * 2. * 3.1415 * xpts[i])
}

function myFunction() {
    var freq = document.getElementById("myFreq").value;
    var phs = document.getElementById("myPhase").value;
    var amp = document.getElementById("myAmp").value;

    for (var i = 0; i < nMax; i++) {
        yv[i] = amp * Math.sin(1.0 * phs + 2. * 3.14159 * freq * xv[i])
    }

    TESTER.data[0].y = yv
    Plotly.redraw(TESTER)
}

var layout1 = {
    margin: {t: 0},
    yaxis: {title: 'Height Y (m)', titlefont: {size: 36}},
    xaxis: {title: 'Time t (s)', titlefont: {size: 36}}
};

var data0 = [
    {x: xv, y: yv, type: 'scatter', mode: 'lines', name: 'fit'},
    {x: xpts, y: ypts, type: 'scatter', mode: 'markers', name: 'data'}
];

TESTER = document.getElementById('tester');
Plotly.newPlot(TESTER, data0, layout1);