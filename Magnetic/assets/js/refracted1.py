import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import scipy.integrate as integrate


def current_loop():
    ext = 3
    npts = 50
    number = 1

    def field(X, Y, Z, h):
        def integrand(th, X, Y, Z, i, h):
            """[summary]

            A loop with R = 1, have magnetic field at X, Y, Z,
            dl = R d\theta = d\theta.
            """
            rv = np.array([(Z - h) * np.cos(th), (Z - h) * np.sin(th),
                           1 - X * np.cos(th) - Y * np.sin(th)]) *\
                ((X - np.cos(th))**2 +
                    (Y - np.sin(th))**2 + (Z - h)**2)**(-1.5)
            return rv[i]
        return np.array([integrate.quad(
            integrand, 0, 2 * np.pi,
            args=(X, Y, Z, i, h))[0] for i in range(3)])
    xx = np.linspace(-ext, ext, npts)
    zz = np.linspace(-ext, ext, npts)
    X, Z = np.meshgrid(xx, zz)
    bz = np.zeros((npts, npts))
    bx = np.zeros((npts, npts))
    for h in np.linspace(0, 0, num=number):
        print(h)
        bz += np.array([field(x, 0, z, h)[2]
                        for x, z in
                        zip(np.ravel(X), np.ravel(Z))]).reshape((npts, npts))
        bx += np.array([field(x, 0, z, h)[0]
                        for x, z in
                        zip(np.ravel(X), np.ravel(Z))]).reshape((npts, npts))

    b0 = field(0, 0, 0, 0)[2]
    bnorm = np.sqrt(bx**2 + bz**2) / b0
    U = np.log10(bnorm)

    """
    fig=plt.figure()
    ax0=fig.add_subplot(111)
    ax0.ticklabel_format(style='sci', scilimits=(-2,2))
    qq=ax0.imshow(np.real(U),cmap='cubehelix',extent=(-2,2.,-1.,1.))
    """
    plt.figure()
    plt.imshow(np.real(U), cmap='cubehelix', extent=(-ext, ext, -ext, ext))
    cb = plt.colorbar(ticks=[-2, -1, 0, 1])
    cb.set_label("$\log_{10}{|B|/B_{0}}$", size=22)
    pd.DataFrame(bx).to_json('bx_' + str(number) + 'loop.json', orient='split')
    pd.DataFrame(bz).to_json('bz_' + str(number) + 'loop.json', orient='split')
    pd.DataFrame(U).to_json('U_' + str(number) + 'loop.json', orient='split')

    plt.clim([-2, 1])
    plt.xlabel(r"$x/R$", size=28)
    plt.ylabel(r"$z/R$", size=28)
    plt.streamplot(xx, zz, bx, bz, color='b', arrowsize=2)
    # CS = plt.contour(X, Z, U,cmap=plt.cm.autumn)
    # plt.clabel(CS, inline=1, fontsize=10)
    # plt.streamplot(xx,zz,bx,bz,arrowsize=2.)

    # plt.plot(zz,bz,'*-')
    # plt.streamplot(X,Z,bx,bz,color=U,cmap=plt.cm.autumn)
    # plt.show()
    plt.savefig(str(number) + '.pdf')


current_loop()
