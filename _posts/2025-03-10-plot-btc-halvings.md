---
title: "Visualizing Bitcoin Halvings with a Logarithmic Price Chart"
description: "A Python script to plot historical Bitcoin prices with halving events on a logarithmic scale."
date: 2025-03-10
categories: [ai, data-science]
tags: [Bitcoin, Python, Data Visualization, Finance]
---

## Visualizing Bitcoin Halvings with a Logarithmic Price Chart

Bitcoin's price history is deeply influenced by its **halving events**, which reduce the mining reward by 50% approximately every four years. These halvings often precede major price movements, making them an essential factor for traders and analysts. 

In this post, we will use Python to fetch historical Bitcoin price data and plot it on a **logarithmic scale**, highlighting each halving event.

### Why Use a Logarithmic Scale?

Bitcoin has experienced massive exponential growth since its inception. A linear price chart can obscure early trends, making it harder to analyze past price movements effectively. By using a logarithmic scale, we can better visualize percentage-based changes over time.

## Python Code to Plot BTC Price with Halvings

Below is a Python script that:
- Fetches Bitcoin historical prices from Yahoo Finance (`yfinance` library).
- Plots the closing prices with a **logarithmic y-axis**.
- Marks Bitcoin halvings with vertical dashed lines.

### 1. Import Required Libraries
```python
import yfinance as yf
import matplotlib.pyplot as plt
import datetime
```
We use `yfinance` to fetch Bitcoin's historical data, `matplotlib.pyplot` for plotting, and `datetime` to define halving event dates.

### 2. Fetch Bitcoin Historical Data
```python
# Fetch Bitcoin historical data
btc = yf.Ticker("BTC-USD")
hist = btc.history(period="max")
```
This code retrieves Bitcoin price data from Yahoo Finance, covering its entire price history.

### 3. Define Bitcoin Halving Dates
```python
# Define Bitcoin halving dates
halving_dates = [
    datetime.datetime(2012, 11, 28),
    datetime.datetime(2016, 7, 9),
    datetime.datetime(2020, 5, 11),
    datetime.datetime(2024, 4, 19) 
]
```
Bitcoin halvings occur roughly every four years. We list past and estimated future halving dates.

### 4. Plot Bitcoin Price History
```python
# Plot BTC price history
plt.figure(figsize=(12, 6))
plt.plot(hist.index, hist["Close"], label="BTC Price", color="blue")
```
This section initializes the plot and plots Bitcoin's historical closing prices in blue.

### 5. Mark Halving Events on the Chart
```python
# Mark halvings with vertical lines
for date in halving_dates:
    plt.axvline(date, color="red", linestyle="--", alpha=0.7, label="Halving" if date == halving_dates[0] else "")
```
Here, we iterate through each halving date and draw a vertical dashed red line at that point on the chart.

### 6. Apply Logarithmic Scale to Y-Axis
```python
# Set logarithmic scale for y-axis
plt.yscale("log")
```
A logarithmic y-axis provides a clearer view of Bitcoin’s percentage growth over time.

### 7. Add Labels, Title, and Grid
```python
# Labels and title
plt.title("Bitcoin Historical Prices with Halvings (Log Scale)")
plt.xlabel("Year")
plt.ylabel("Price (USD, Log Scale)")
plt.legend()
plt.grid(True, which="both", linestyle="--", linewidth=0.5)
```
This section adds a title, labels, a legend, and a grid for better readability.

### 8. Display the Plot
```python
# Show plot
plt.show()
```
Finally, we display the plot.

![BTCUSD price with halvings](/images/btc_price_with_halvings.png)
*BTC Price (logaritmic) with halvings*

## Dependencies
To run this script, install the required libraries:
```bash
pip install yfinance matplotlib
```

## Interpretation of the Chart

- **Blue Line**: Represents Bitcoin's closing price over time.
- **Red Dashed Lines**: Indicate halving events, where mining rewards were reduced by 50%.
- **Logarithmic Scale**: Provides better insight into percentage-based growth rather than absolute price changes.

### Conclusion
Bitcoin halvings have historically been followed by significant price increases. By using this script, you can visualize these events and their impact on BTC's price history. The logarithmic scale helps illustrate growth patterns more effectively, making it a valuable tool for crypto analysts.

Happy coding! 🚀
