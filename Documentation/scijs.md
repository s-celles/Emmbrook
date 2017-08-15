# scijs

[TOC]

## `ndarray` package

`ndarray` is used to generated an `ndarray` object. That is like:

```javascript
> var mat = ndarray(new Float64Array([1, 0, 0, 1]), [2,2])
undefined
> mat
View2dfloat64 {
  data: Float64Array [ 1, 0, 0, 1 ],
  shape: [ 2, 2 ],
  stride: [ 2, 1 ],
  offset: 0 }
```

Here you create a `View2dfloat64` object. If you want to access its data, use

```javascript
> mat.data
Float64Array [ 1, 0, 0, 1 ]
```

But as you see, you did not get a matrix, you just get a "flattened" array. The other often used attributes are

```javascript
> mat.shape
[ 2, 2 ]
> mat.size
4
> mat.dtype
'float64'
> mat.dimension
2
```

which are self-explained. With an `ndarray`, you cannot get one of its components by `mat[0][1]`, use 

```javascript
> mat.get(0, 1)
```

instead. For setting a component, use

```javascript
> mat.set(0, 1, 3)
```

where `3` is the value you want to set. If you really like to use `[i][j]` for getting components, you should be careful because

```javascript
> mat.data[1][1]
undefined
```

See? Because `mat.data` is 1-dimensional. You should use

```javascript
mat.data[1 * 2 + 1]
```

instead.

Some other methods are [here](http://scijs.net/packages/#scijs/ndarray). Among them, `pick` is especiallly useful. Like this

```javascript
ops.muleq(A.pick(null, null, 0), lessThan0.pick(null, null, 0)); // A[:, :, 0] *= lessThan0[:, :, 0]
```

where `A` is some $m \times  n \times 3$ array.

`ndarray` does not provide an reshaping function, I implemented one, use with care!

```javascript
function reshape(oldNdarr, newShape) {
    /*
     Here oldNdarray is a ndarray, newShape is an array spcifying the newer one's shape.
     */
    return ndarray(oldNdarr.data, newShape);
}
```

## `cwise` package

This library can be used to generate cache efficient map/reduce operations for [ndarrays](http://github.com/mikolalysenko/ndarray). It is really fast. But I usually use another package `ndarray-ops` implemented by `cwise`.

## `ndarray-ops` package

A collection of common mathematical operations for `ndarray`s. When you are using it, it is quite unstraightforward sometimes. Like you don't have assignment directly. You should first create an object accepting the result.

```javascript
var a = ndarray(new Float32Array(128*128));
var b = ndarray(new Float32Array(128*128));
var c = ndarray(new Float32Array(128*128));
ops.random(b);
ops.assigns(c, 1.0);
//Add b and c, store result in a: 
ops.add(a, b, c);
```

See? You don't have something like `a = ops.add(b, c)`, always create an auxiliary `ndarray` if you want to keep the result. You may also use `ops.addeq(b, c)`, which means `b += c`, but be careful when you are using this. It could cause problem because it accumulates the summation! An example:

```javascript
function tensorProduct(mesh, vec) {
    var aux = pool.zeros(mesh.shape);
    for (var i = 0; i < vec.shape[0]; i++) {
        // You cannot use ops.mulseq for it will accumulate the sum and cause wrong result.
        ops.muls(aux.pick(null, null, i), mesh.pick(null, null, i), vec.get(i));
    }
    return aux;
}
```

## `ndarray-complex` package

A bad choice if you want to use complex numbers. You have to create arrays that accept the returned result. Like this:

```javascript
var a_r = zeros([10, 10])
  , a_i = zeros([10, 10])
  , b_r = zeros([10, 10])
  , b_i = zeros([10, 10])
  , c_r = zeros([10, 10])
  , c_i = zeros([10, 10])
 
//  ... do stuff ... 
 
//Multiply a and b, storing result in c: 
cops.mul(c_r, c_i, a_r, a_i, b_r, b_i);
```

See? `c_r` and `c_i` is want you want and you have to explicitly decalre them.

## `ndarray-linspace` package

This is a cumbersome package.

```javascript
> a = linspace(ndarray([], [5]), 2, 3);
View1darray {
  data: [ 2, 2.25, 2.5, 2.75, 3 ],
  shape: [ 5 ],
  stride: [ 1 ],
  offset: 0 }
```

well, you will get an `View1darray` object, whose `dtype` is `'array'`, but if you want to tile it, you cannot do it directly:

```javascript
> tile(a, [1, 2])
TypeError: Cannot set property '0' of null
    at Object.zeros (/Users/qz/Documents/Code/Emmbrook/node_modules/ndarray-scratch/scratch.js:54:12)
    at ndarrayTile (/Users/qz/Documents/Code/Emmbrook/node_modules/ndarray-tile/index.js:49:19)
    at repl:1:1
    at ContextifyScript.Script.runInThisContext (vm.js:44:33)
    at REPLServer.defaultEval (repl.js:239:29)
    at bound (domain.js:301:14)
    at REPLServer.runBound [as eval] (domain.js:314:12)
    at REPLServer.onLine (repl.js:440:10)
    at emitOne (events.js:120:20)
    at REPLServer.emit (events.js:210:7)
```

You have $2$ ways to solve it:

1. As we said, change the default `dtype` attribute to `'float64'` for example.

   ```javascript
   > a.dtype
   'array'
   > a.dtype = 'float64'
   'float64'
   > tile(a, [1, 3])
   View2dfloat64 {
     data: Float64Array [ 2, 2, 2, 2.25, 2.25, 2.25, 2.5, 2.5, 2.5, 2.75, 2.75, 2.75, 3, 3, 3 ],
     shape: [ 5, 3 ],
     stride: [ 3, 1 ],
     offset: 0 }
   ```

   Now it works.

2. I implemented a function that can solve this problem:

   ```javascript
   function myLinspace(shape, start, end, options) {
       /*
        If we use ndarray-linspace package,
        it returns a ndarray with dtype='array',
        but this dtype cannot be used by ndarray-tile package, it needs 'float'.
        So we need to transform dtype manually.
        */
       let tmp = linspace(ndarray([], shape), start, end, options);
       return reshape(ndarray(new Float64Array(tmp.data)), shape);
   }
   ```

   You could just do it by

   ```javascript
   > myLinspace([2,2], 0, 2);
   View2dfloat64 {
     data: Float64Array [ 0, 0, 2, 2 ],
     shape: [ 2, 2 ],
     stride: [ 2, 1 ],
     offset: 0 }
   ```

## `ndarray-show` package

This package is mainly for debugging. It is very handful.

```javascript
> var m = ndarray([ 1, 4, 2.34e-9, 5.55e55, 3, -990.52 ], [ 3, 2, 1 ]);
> console.log(show(m));
   1.000
   4.000

 2.00e-9
 5.55e+5

   3.000
-990.520
```

## `meshgrid` function

`npm` does have an [`ndarray-meshgrid`](https://www.npmjs.com/package/ndarray-meshgrid) package, but now it is deprecated. So I do not recommend you to use it. I have implemented one `meshgrid` function, hope it will be useful:

```javascript
function meshgrid(xArray, yArray, zArray) {
    /*
     Here xArray, yArray, zArray should all be 1d arrays.
     Then it returns 3 fortran-style 3D arrays, that is,
     they are all column-major order:
     http://www.wikiwand.com/en/Row-_and_column-major_order.
     */
    let xNum = xArray.size;
    let yNum = yArray.size;
    let zNum = zArray.size;
    let xMesh = reshape(tile(xArray, [zNum, yNum]), [zNum, xNum, yNum]);
    let yMesh = reshape(tile(tile(yArray, [1, xNum]).transpose(1, 0), [zNum]), [zNum, xNum, yNum]);
    let zMesh = tile(zArray, [1, xNum, yNum]);
    return [xMesh, yMesh, zMesh];
}
```

## Other references

1. [scijs/ndarray for MATLAB users](https://github.com/scijs/scijs-ndarray-for-matlab-users)