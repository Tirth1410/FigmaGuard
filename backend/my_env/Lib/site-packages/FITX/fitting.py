import numpy as np

def get_envelope(x, y, window_size=256):
    '''Return rolling maximum of signal y along time x.'''
    xm = np.zeros(len(x) // window_size)
    ym = np.zeros(len(x) // window_size)
    for i in range(0, len(x) - window_size, window_size):
        xm[i // window_size] = i + np.argmax(y[i:i+window_size])
        ym[i // window_size] = np.max(y[i:i+window_size])
    return xm, ym

def fit_risetime(signal, smoothing_window_size=50, min_level=8e-5,
                 until=None, start_from_0=False, min_points=3,
                 min_n_risetimes=1.5, matplotlib_axis=None):
    '''Fit the exponential rise time of a positive signal.'''
    if start_from_0:
        start = 0
    else:
        try:
            start = np.where(signal > min_level)[0][0]
        except:
            return np.nan
    to_be_fit = signal[start:until]
    t, x = get_envelope(np.arange(len(to_be_fit)), to_be_fit,
                        window_size=smoothing_window_size)
    ddt = np.gradient(x, t)
    dddt = np.gradient(ddt, t)

    until = len(x)
    exponent = 0
    while exponent < min_n_risetimes / t[until-1]:
    # extend fitting region until covers at least min_n_risetimes rise times
        if start_from_0:
            fit_start = 0
        else:
            try:
                fit_start = np.where(
                    (ddt[:-2] > 0) & (ddt[1:-1] > 0) & (ddt[2:] > 0))[0][0]
            except IndexError:
                return np.nan
        try:
            until = np.where(
                (ddt[:-2] < 0) & (ddt[1:-1] < 0) & (ddt[2:] < 0) &
                (np.arange(len(ddt)-2) > fit_start + min_points)
            )[0][0]
            until_from_curvature = np.where(
                (dddt[:-2] < 0)& (dddt[1:-1] < 0) & (dddt[2:] < 0) &
                (np.arange(len(dddt)-2) > fit_start + min_points)
            )[0][0]
            until = min(until, until_from_curvature)
        except IndexError:
            until = len(x)

        if until == len(t):
            until -= 1

        exponent, amplitude = np.polyfit(t[fit_start:until],
                                         np.log(x[fit_start:until]), 1)

        # cannot extend anymore if all region is covered already:
        if until >= len(x) - 1:
            break
        else:
            min_points += 1

    if matplotlib_axis:
        matplotlib_axis.plot(signal[:int(t[until] + start)])
        tplot = np.linspace(t[fit_start], t[until], 100)
        matplotlib_axis.plot(start + tplot,
                             np.exp(amplitude + exponent * tplot),
                             color='darkorange', ls='--')
        matplotlib_axis.axvline(start + t[fit_start], 0, 1, color='red')
        matplotlib_axis.axvline(start + t[until], 0, 1, color='red')
        matplotlib_axis.set_title(1 / exponent)

    return 1 / exponent
