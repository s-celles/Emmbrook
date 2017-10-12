/**
 * Originally written by Makani Cartwright.
 * Created by Qi on 6/16/17.
 */

'use strict';
// Check if your browser supports ES6 feature
let supportsES6 = function () { // Test if ES6 is ~fully supported
    try {
        new Function('(a = 0) => a');
        return true;
    } catch (err) {
        return false;
    }
}();

if (supportsES6) {
} else {
    alert('Your browser is too old! Please use a modern browser!');
}


// Variables
let n = 32;
let rv = [];
let v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let m = 8.;
let phs = 0;
let pot = 0;
//Plot 1 vars
let xv3 = [];
let v3 = [];
let vk = [];
let vr = [];
//Plot 2 vars
let vim = [];
let vabs = [];
let kv = [];
//Plot 3 vars
let kN = [];
let q = [];
let q0 = [];
let q1 = [];
let q2 = [];
let q3 = [];
let q4 = [];

/**
 * Creates LHS matrix from Fourier components of periodic potential V.
 * @param k {number} index, -nk/2<=k<nk/2, where \alpha_k = k \pi * /(nk*a) is the wavenumber of the eclectronic state.
 * @param nk {number} total number of wavenumber points sampled in First Brillouin zone.
 * @param m {number} m/2+1 is the total number of bands to solve for at each k point.
 * @param va potential discrete Fourier components arranged: (-N_max/2,...-2,-1,+1,+2,...N_max/2).
 * @returns {Array}
 */
function createA(k, nk, m, va) {
    k = typeof k !== 'undefined' ? k : 0;
    nk = typeof nk !== 'undefined' ? nk : 8;
    m = typeof m !== 'undefined' ? m : 8;
    let va = typeof va !== 'undefined' ? va : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1
    ];
    rv = [];
    let Da = 2. * Math.PI / nk;
    // Smallest wavenumber
    let mv = va.length;
    //number of total Fourier components of potential (highest: m - 1/2)

    //To create M bands in the output
    let t = nj.arange(-2 * nk, 2 * nk + 4 * nk / (m / 2), 4 * nk / (m / 2));
    t = nj.add(t, k - nk / 2);
    t = nj.multiply(t, t).tolist();
    let id = nj.identity(t.length).tolist();
    rv = nj.multiply(t, math.square(Da));
    rv = nj.concatenate(rv, rv, rv, rv, rv);
    rv = nj.reshape(rv, [5, 5]);
    rv = nj.multiply(rv, id).tolist();

    a = nj.arange(0, 10, 1);

    for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < rv[i].length; j++) {
            if (mv / 2 + j - i - 1 < mv / 2 + m / 2 - i) {
                rv[i][j] = va[mv / 2 + j - i - 1][0];
            } else {
                rv[i][j] = 0;
            }
        }
    }

    for (let i = 1; i < t.length; i++) {
        for (let j = 0; j < i; j++) {
            rv[i][j] = va[mv / 2 - i + j][0];
        }
    }
    return rv;
}

/**
 * 
 * @param vb
 * @param ni
 * @returns {[null,null]}
 */
function bands(vb, ni) {
    vb = typeof vb !== 'undefined' ? vb : [1, 1, 0, 1, 1, 0, 1, 1];
    ni = typeof ni !== 'undefined' ? ni : 128;

    let kr = nj.arange(0., parseFloat(ni + 1), 1.).tolist();
    let qt = 0;
    q = [];
    let knorm = [];

    for (s = 0; s <= ni; s++) {
        a = createA(s, ni, 8, vb);
        eig = numeric.eig(a).lambda.x;
        eig = eig.sort(function(a, b) {
            return a - b
        });
        q.push(eig);
        qt = 1.;
    }
    for (s = 0; s <= ni; s++) {
        knorm.push(2. * (kr[s] - ni / 2) / ni);
    }
    return [knorm, q];
}