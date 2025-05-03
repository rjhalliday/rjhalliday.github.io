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

---

## 7. Logarithmic scale

A log scale is especially useful for assets like Bitcoin, which have experienced exponential growth. It makes long-term trends and relative percentage changes more visually interpretable, especially early in the chart when prices were low.

To change the y-axis of your plot to a logarithmic scale, we just need to add this line before plotting the data and before we call plt.show().

```python
plt.yscale('log')
```

![BTCUSD (log) drawdowns](/images/2025-05-04-btc_drawdown_calculator_log.png)
*BTC Price (log) drawdowns*

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

## 9. Weekly data

Given the long-term time horizon of this analysis, let's use weekly data. Unforutnately Yahoo Finance doesn't provide weekly data, so we need to claculate it ourselves by using the following resampling after the yf.download line:

```python
# Convert to weekly data, using the last close of each week
df = df.resample('W').last()
```

![BTCUSD (log) drawdowns with 10% minimum drawdown threshold- weekly resampling](/images/2025-05-04-btc_drawdown_calculator_log_weekly_with_10_percent_drawdown_minimum.png)
*BTC Price (log) drawdowns with 10% minimum drawdown threshold using weekly resampling of yahoo finance data*

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
