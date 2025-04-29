---
layout: default
title: "Building a Crypto RSI Signal Visualizer with Python and Binance API"
date: 2025-04-29 22:41:00 +1000
description: "Pull Bitcoin price data from Binance, process it, and visualize the last 30 days of price action with a candlestick chart"
categories: [technical-analysis, python]
tags: [bitcoin, python, data visualization, finance, crypto]
---

Sure! Here's a Markdown-formatted blog post that explains the Python script in clear, structured sections, followed by the complete source code.

---

# 📊 Building a Crypto RSI Signal Visualizer with Python and Binance API

In this tutorial, we’ll walk through a Python script that fetches historical candlestick data for Bitcoin (BTC/USDT) from the Binance API, calculates the **Relative Strength Index (RSI)**, and visualizes buy/sell signals using **mplfinance**. This is a great starting point for anyone looking to develop crypto trading indicators or learn financial data visualization in Python.

---

## 🔧 Prerequisites

Before diving in, make sure you have the following installed:

- Python 3.7+
- `binance`, `pandas`, `mplfinance`, `matplotlib`, `pandas-ta`, `python-dotenv`

You can install them via pip:

```bash
pip install python-binance pandas mplfinance matplotlib pandas-ta python-dotenv
```

Also, create a `.env` file containing your Binance testnet API credentials:

```
binance-testnet-api-key=YOUR_API_KEY
binance-testnet-secret-key=YOUR_SECRET_KEY
```

---

## 📥 1. Importing Libraries and Loading API Keys

The script begins by importing the necessary libraries and loading the Binance API keys from a `.env` file using `python-dotenv`.

```python
from binance.client import Client
import pandas as pd
import datetime
import os
from dotenv import load_dotenv
import mplfinance as mpf
import matplotlib
import pandas_ta as ta
import numpy as np

matplotlib.use('TkAgg')  # Ensure GUI-based plotting
```

We then initialize the Binance client using testnet API keys.

---

## 🕰️ 2. Fetching Historical BTC/USDT Data

We define the symbol (`BTCUSDT`) and fetch 1000 days of 1-day interval candlestick data using Binance’s `get_historical_klines()` function.

```python
symbol = 'BTCUSDT'
interval = Client.KLINE_INTERVAL_1DAY
start_time = datetime.datetime.now() - datetime.timedelta(days=1000)
end_time = datetime.datetime.now()
```

The raw data is structured into a DataFrame, and all time and price values are appropriately converted.

---

## 📈 3. Calculating RSI and Generating Signals

We use `pandas-ta` to calculate the 14-day RSI and define buy/sell conditions based on RSI thresholds:

- **Buy Signal**: RSI crosses below 30 (oversold)
- **Sell Signal**: RSI crosses above 70 (overbought)

```python
df['RSI'] = ta.rsi(df['Close'], length=14)
df['RSI_Buy_Signal'] = (df['RSI'] < 30) & (df['RSI'].shift(1) >= 30)
df['RSI_Sell_Signal'] = (df['RSI'] > 70) & (df['RSI'].shift(1) <= 70)
```

---

## 📊 4. Visualizing with mplfinance

The script uses `mplfinance` to generate candlestick charts with RSI as a subplot. Buy and sell signals are overlaid as scatter plots using colored markers:

- Green **up arrows** for buy
- Red **down arrows** for sell

```python
add_plots = [mpf.make_addplot(df['RSI'], panel=1, color='purple', ylabel='RSI')]
```

---

![RSI Visualizer](/images/2025-04-26-building-a-crypto-rsi-signal-visualizer-with-python-and-binance-api.png)

*Figure 1: Bitcoin RSI chart showing buy and sell signals.*


## ✅ Final Result

The final chart includes:

- Candlesticks of BTC/USDT
- Volume bars
- RSI line plot
- Buy/Sell signal markers

This visualization gives traders a clearer picture of price movement alongside RSI momentum and helps identify potential entry and exit points.

---

## 💻 Full Source Code

```python
# Import necessary libraries
from binance.client import Client
import pandas as pd
import datetime
import os
from dotenv import load_dotenv
import mplfinance as mpf
import matplotlib
import pandas_ta as ta
import numpy as np

# Set matplotlib backend to 'TkAgg' for GUI-based plotting (helps on some systems)
matplotlib.use('TkAgg')

# Load environment variables from .env file (for API credentials)
load_dotenv()
api_key = os.getenv("binance-testnet-api-key")
api_secret = os.getenv("binance-testnet-secret-key")

# Initialize Binance client using your testnet API keys
client = Client(api_key, api_secret)

# Define the trading pair and time interval (1-day candlesticks)
symbol = 'BTCUSDT'
interval = Client.KLINE_INTERVAL_1DAY

# Extend data range: from 1000 days ago to now
end_time = datetime.datetime.now()
start_time = end_time - datetime.timedelta(days=1000)

# Fetch historical candlestick (kline) data from Binance
klines = client.get_historical_klines(
    symbol=symbol,
    interval=interval,
    start_str=start_time.strftime("%Y-%m-%d %H:%M:%S"),
    end_str=end_time.strftime("%Y-%m-%d %H:%M:%S")
)

# Define the column names expected from Binance's kline response
columns = ['Open Time', 'Open', 'High', 'Low', 'Close', 'Volume',
           'Close Time', 'Quote Asset Volume', 'Number of Trades',
           'Taker Buy Base Asset Volume', 'Taker Buy Quote Asset Volume', 'Ignore']

# Create a DataFrame from the raw data
df = pd.DataFrame(klines, columns=columns)

# Convert the 'Open Time' column from milliseconds to datetime
df['Open Time'] = pd.to_datetime(df['Open Time'], unit='ms')

# Convert price and volume columns from strings to floats
numeric_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
df[numeric_cols] = df[numeric_cols].astype(float)

# Set 'Open Time' as the DataFrame index for mplfinance compatibility
df.set_index('Open Time', inplace=True)

# Calculate RSI using pandas-ta
df['RSI'] = ta.rsi(df['Close'], length=14)

# Generate RSI-based trading signals
df['RSI_Buy_Signal'] = (df['RSI'] < 30) & (df['RSI'].shift(1) >= 30)
df['RSI_Sell_Signal'] = (df['RSI'] > 70) & (df['RSI'].shift(1) <= 70)

# Prepare plots list starting with RSI subplot
add_plots = [mpf.make_addplot(df['RSI'], panel=1, color='purple', ylabel='RSI')]

# Add buy signal markers only if any exist
if df['RSI_Buy_Signal'].any():
    buy_signals = mpf.make_addplot(
        df['Close'].where(df['RSI_Buy_Signal']),
        type='scatter', markersize=100, marker='^', color='green'
    )
    add_plots.append(buy_signals)

# Add sell signal markers only if any exist
if df['RSI_Sell_Signal'].any():
    sell_signals = mpf.make_addplot(
        df['Close'].where(df['RSI_Sell_Signal']),
        type='scatter', markersize=100, marker='v', color='red'
    )
    add_plots.append(sell_signals)

# Create RSI subplot
rsi_plot = mpf.make_addplot(df['RSI'], panel=1, color='purple', ylabel='RSI')

# Plot everything together
mpf.plot(df, type='candle', style='yahoo', volume=True,
         addplot=[rsi_plot, buy_signals, sell_signals],
         title=f'{symbol} - Last 100 Days with RSI Signals',
         panel_ratios=(2, 1))
```

