---
layout: default
title: "Visualizing Bitcoin Drawdowns Using Yahoo Finance"
date: 2025-05-04 07:00:00 +1000
description: "Graph BTC drawdowns using data from Yahoo Finance"
categories: [technical-analysis, python]
tags: [bitcoin, python, data visualization, finance, crypto, yfinance]
---

# 📉 Visualizing Bitcoin Drawdowns Using Python and yFinance

Bitcoin is famous for its dramatic price swings—soaring to new highs and plunging into deep drawdowns. In this post, we’ll analyze historical Bitcoin (BTC-USD) closing prices and identify **peaks** and **troughs** to measure the percentage decline from each all-time high.

We’ll use Python, `yfinance` to fetch BTC data, `pandas` to process it, and `matplotlib` to visualize the drawdowns.

---

## 🔧 Step-by-Step Breakdown

### 1. **Fetching Historical BTC Data**

We use the `yfinance` library to pull historical daily prices for BTC-USD, starting from January 1, 2010:

```python
df = yf.download("BTC-USD", start="2010-01-01", progress=False)
```

We only keep the "Close" price and drop any rows with missing data:

```python
df = df[["Close"]].copy()
df.dropna(inplace=True)
```

---

### 2. **Tracking Peaks, Troughs, and Drawdowns**

To identify drawdowns, we scan through the time series:

* Track the **all-time high** (peak).
* Record the **lowest point** after that peak (trough).
* Calculate the **percentage drop** from the peak to the trough.

We initialize variables to store these states:

```python
peak_price = 0
peak_date = None
trough_price = None
trough_date = None
in_drawdown = False
drawdowns = []
peak_dates = []
trough_dates = []
```

---

### 3. **Iterating Through the Data**

For each date in the dataset, we:

* Update the **peak** if a new high is found.
* If in a drawdown and the price drops further, update the **trough**.
* When a new peak is detected after a drawdown, log the drawdown data.

The key logic:

```python
for date, row in df.iterrows():
    price = row["Close"]["BTC-USD"]
    ...
```

---

### 4. **Storing Drawdown Details**

When a drawdown ends (a new all-time high is found), we calculate:

```python
drop_pct = (trough_price - peak_price) / peak_price * 100
```

And store all relevant data:

```python
drawdowns.append({
    "Peak Date": peak_date,
    "Peak Price": round(peak_price, 2),
    "Trough Date": trough_date,
    "Trough Price": round(trough_price, 2),
    "% Drop": round(drop_pct, 2)
})
```

---

### 5. **Visualizing Peaks and Troughs**

We use `matplotlib` to plot:

* BTC closing prices.
* Green upward triangles (`^`) for peaks.
* Red downward triangles (`v`) for troughs.

This gives a clear visual cue of where drawdowns occurred in BTC's history.

---

## 6. 📊 Initial Output: Drawdown Table & Chart

* We print a table showing all drawdowns.
* Then display a chart marking peaks and troughs on the BTC price curve.

![BTCUSD drawdowns](/images/2025-05-04-btc_drawdown_calculator_linear.png)
*BTC Price (linear) drawdowns*

```
   Peak Date  Peak Price Trough Date  Trough Price  % Drop
0  2014-09-17      457.33  2015-01-14        178.10  -61.06
1  2015-12-15      465.32  2016-01-15        364.33  -21.70
2  2016-04-26      466.09  2016-05-19        438.71   -5.87
3  2016-05-28      530.04  2016-05-29        526.23   -0.72
4  2016-05-30      533.86  2016-05-31        531.39   -0.46
..        ...         ...         ...           ...     ...
62 2024-11-15    91066.01  2024-11-17      89845.85   -1.34
63 2024-11-22    98997.66  2024-11-26      91985.32   -7.08
64 2024-12-08   101236.02  2024-12-10      96675.43   -4.50
65 2024-12-13   101459.26  2024-12-14     101372.97   -0.09
66 2024-12-17   106140.60  2025-01-09      92484.04  -12.87
```

---

## 7. Logarithmic scale

A log scale is especially useful for assets like Bitcoin, which have experienced exponential growth. It makes long-term trends and relative percentage changes more visually interpretable, especially early in the chart when prices were low.

To change the y-axis of your plot to a logarithmic scale, we just need to add this line before plotting the data and before we call plt.show().

```python
plt.yscale('log')
```

![BTCUSD (log) drawdowns](/images/2025-05-04-btc_drawdown_calculator_log.png)
*BTC Price (log) drawdowns*

```
    Peak Date  Peak Price Trough Date  Trough Price  % Drop
0  2014-09-17      457.33  2015-01-14        178.10  -61.06
1  2015-12-15      465.32  2016-01-15        364.33  -21.70
2  2016-04-26      466.09  2016-05-19        438.71   -5.87
3  2016-05-28      530.04  2016-05-29        526.23   -0.72
4  2016-05-30      533.86  2016-05-31        531.39   -0.46
..        ...         ...         ...           ...     ...
62 2024-11-15    91066.01  2024-11-17      89845.85   -1.34
63 2024-11-22    98997.66  2024-11-26      91985.32   -7.08
64 2024-12-08   101236.02  2024-12-10      96675.43   -4.50
65 2024-12-13   101459.26  2024-12-14     101372.97   -0.09
66 2024-12-17   106140.60  2025-01-09      92484.04  -12.87
```

---

## 8. Minimum drawdown threshold

The current approach identifies every new all-time high as a peak and every subsequent low as a trough, even for relatively small corrections. This leads to too many minor drawdowns being flagged, making the results noisy and less insightful.

Let's set a minimum drawdown threshold of 10%

We do this by adding the following if statement

```python
if drop_pct <= -10:  # Only record drops greater than 20%
    drawdowns.append({...})
    peak_dates.append(peak_date)
    trough_dates.append(trough_date)

```

![BTCUSD (log) drawdowns with 10% minimum drawdown threshold](/images/2025-05-04-btc_drawdown_calculator_log_with_10_percent_drawdown_minimum.png)
*BTC Price (log) drawdowns with 10% minimum drawdown threshold*

```
    Peak Date  Peak Price Trough Date  Trough Price  % Drop
0  2014-09-17      457.33  2015-01-14        178.10  -61.06
1  2015-12-15      465.32  2016-01-15        364.33  -21.70
2  2016-06-16      766.31  2016-08-02        547.47  -28.56
3  2017-01-04     1154.73  2017-01-11        777.76  -32.65
4  2017-03-03     1274.99  2017-03-24        937.52  -26.47
5  2017-05-24     2443.64  2017-05-27       2038.87  -16.56
6  2017-06-11     2958.11  2017-07-16       1929.82  -34.76
7  2017-09-01     4892.01  2017-09-14       3154.95  -35.51
8  2017-11-08     7459.69  2017-11-12       5950.07  -20.24
9  2017-12-07    17899.70  2017-12-09      15178.20  -15.20
10 2017-12-16    19497.40  2018-12-15       3236.76  -83.40
11 2021-01-08    40797.61  2021-01-27      30432.55  -25.41
12 2021-02-21    57539.95  2021-02-28      45137.77  -21.55
13 2021-03-13    61243.09  2021-03-25      51704.16  -15.58
14 2021-04-13    63503.46  2021-07-20      29807.35  -53.06
15 2021-10-20    65992.84  2021-10-27      58482.39  -11.38
16 2021-11-08    67566.83  2022-11-21      15787.28  -76.63
17 2024-03-13    73083.50  2024-09-06      53948.75  -26.18
18 2024-12-17   106140.60  2025-01-09      92484.04  -12.87
```

## 9. Weekly data

Given the long-term time horizon of this analysis, let's use weekly data. Unforutnately Yahoo Finance doesn't provide weekly data, so we need to claculate it ourselves by using the following resampling after the yf.download line:

```python
# Convert to weekly data, using the last close of each week
df = df.resample('W').last()
```

![BTCUSD (log) drawdowns with 10% minimum drawdown threshold- weekly resampling](/images/2025-05-04-btc_drawdown_calculator_log_weekly_with_10_percent_drawdown_minimum.png)
*BTC Price (log) drawdowns with 10% minimum drawdown threshold using weekly resampling of yahoo finance data*

```
    Peak Date  Peak Price Trough Date  Trough Price  % Drop
0  2014-09-21      398.82  2015-01-18        210.34  -47.26
1  2016-01-10      447.99  2016-01-31        368.77  -17.68
2  2016-06-19      763.78  2016-08-14        570.47  -25.31
3  2017-01-01      998.33  2017-01-15        821.80  -17.68
4  2017-03-05     1267.12  2017-03-26        966.72  -23.71
5  2017-06-11     2958.11  2017-07-16       1929.82  -34.76
6  2017-09-03     4582.96  2017-09-17       3582.88  -21.82
7  2017-11-05     7407.41  2017-11-12       5950.07  -19.67
8  2017-12-17    19140.80  2018-12-16       3252.84  -83.01
9  2021-01-10    38356.44  2021-01-24      32289.38  -15.82
10 2021-02-21    57539.95  2021-02-28      45137.77  -21.55
11 2021-04-11    60204.96  2021-07-18      31796.81  -47.19
12 2021-11-14    65466.84  2022-11-20      16291.83  -75.11
13 2024-03-31    71333.65  2024-09-08      54841.57  -23.12
```

---

## 🧠 Takeaways

* This script is a great way to understand **Bitcoin's volatility** over time.
* The approach can be extended to other assets or to compare drawdowns across assets.
* You gain insight not just into price levels, but **how painful** downturns can be.

---

## 🧾 Full Code

```python
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

# Download BTC-USD data from Yahoo Finance
df = yf.download("BTC-USD", start="2010-01-01", progress=False)

# Convert to weekly data, using the last close of each week
df = df.resample('W').last()

df = df[["Close"]].copy()
df.dropna(inplace=True)

# Initialize tracking variables
peak_price = 0
peak_date = None
trough_price = None
trough_date = None
in_drawdown = False
drawdowns = []
peak_dates = []
trough_dates = []

# Loop through price data
for date, row in df.iterrows():
    price = row["Close"]["BTC-USD"]

    if price > peak_price:
        # If in drawdown, record it before resetting
        if in_drawdown and trough_price is not None:
            drop_pct = (trough_price - peak_price) / peak_price * 100
            if drop_pct <= -10:  # Only record drops of 10% or more
                drawdowns.append({
                    "Peak Date": peak_date,
                    "Peak Price": round(peak_price, 2),
                    "Trough Date": trough_date,
                    "Trough Price": round(trough_price, 2),
                    "% Drop": round(drop_pct, 2)
                })
                # Save for plotting
                peak_dates.append(peak_date)
                trough_dates.append(trough_date)

        # Update to new all-time high
        peak_price = price
        peak_date = date
        trough_price = None
        trough_date = None
        in_drawdown = True
    else:
        # If price falls below previous low, update trough
        if not in_drawdown:
            continue
        if trough_price is None or price < trough_price:
            trough_price = price
            trough_date = date

# Create DataFrame from results
drawdown_df = pd.DataFrame(drawdowns)
print(drawdown_df)

# --- Plotting ---
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Close'], label='BTC-USD Close', color='blue')

# Add peaks and troughs
plt.scatter(peak_dates, df.loc[peak_dates, 'Close'], color='green', label='Peaks', marker='^', s=100)
plt.scatter(trough_dates, df.loc[trough_dates, 'Close'], color='red', label='Troughs', marker='v', s=100)

# Set y-axis to logarithmic scale
plt.yscale('log')

plt.title('BTC-USD Closing Prices with Peaks and Troughs, weekly, 10% drawdown minimum')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
```

---
