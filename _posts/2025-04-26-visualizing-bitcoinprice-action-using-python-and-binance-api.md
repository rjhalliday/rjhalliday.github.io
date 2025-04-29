# 📈 Visualizing Bitcoin Price Action Using Python and Binance API

In this post, we'll learn how to pull **Bitcoin price data** from Binance, process it, and visualize the **last 30 days** of price action with a **candlestick chart**. This approach is useful for **technical analysis** or simply to understand market behavior over a set period.

We'll be using:
- 🐍 **Python**
- 📦 **Binance API**
- 📊 **mplfinance** (for plotting candlestick charts)
- 🔐 **dotenv** for securely storing API credentials

---

## 🔧 What We’ll Build

We’ll create a Python script that does the following:
1. **Connect to Binance API**
2. **Fetch historical price data** (candlesticks) for Bitcoin (BTC/USDT) over the last 30 days
3. **Process the data** into a usable format
4. **Plot the candlestick chart** with volume data using `mplfinance`

By the end of this guide, you’ll have a functional script that can display real-time price action for Bitcoin.

---

## 🚀 Getting Started

Before we start coding, make sure you have:
- A **Binance API key** (generated from [Binance Testnet](https://testnet.binance.vision/)).
- The following Python libraries installed:
  ```bash
  pip install python-dotenv pandas mplfinance python-binance
  ```

---

## 📜 Step-by-Step Breakdown

Let’s go through the code in chunks to understand each part:

### 1. **Import Libraries**

First, we import the necessary libraries to interact with the Binance API, manipulate data, and create the chart:

```python
from binance.client import Client
import pandas as pd
import datetime
import os
from dotenv import load_dotenv
import mplfinance as mpf
import matplotlib

# Set matplotlib backend to 'TkAgg' for GUI-based plotting
matplotlib.use('TkAgg')  # Or 'Qt5Agg' depending on your system
```

- **`binance.client`**: Allows us to interact with the Binance API.
- **`pandas`**: Helps manipulate and structure the price data into a DataFrame.
- **`datetime`**: Used to define time intervals.
- **`dotenv`**: Loads API keys from a `.env` file to keep credentials secure.
- **`mplfinance`**: Handles the chart plotting.
- **`matplotlib`**: We use this to configure how the plot will be displayed.

---

### 2. **Load API Credentials**

Next, we load our **Binance API keys** securely from a `.env` file:

```python
load_dotenv()
api_key = os.getenv("binance-testnet-api-key")
api_secret = os.getenv("binance-testnet-secret-key")

# Initialize the Binance client
client = Client(api_key, api_secret)
```

- **`load_dotenv()`** reads the `.env` file and loads the API keys into the environment variables.
- **`api_key`** and **`api_secret`** are used to authenticate with the Binance API.

---

### 3. **Set Parameters: Symbol and Interval**

We specify the trading pair (`BTCUSDT`), and the interval for our candlesticks (1 day):

```python
symbol = 'BTCUSDT'  # Define the trading pair (Bitcoin to USDT)
interval = Client.KLINE_INTERVAL_1DAY  # Interval of 1 day for each candlestick
```

- **`symbol`**: This is the pair we are interested in. For this example, we are pulling data for **Bitcoin (BTC)** against **Tether (USDT)**.
- **`interval`**: This defines how often data is collected. We’re using **1-day** intervals (`KLINE_INTERVAL_1DAY`).

---

### 4. **Define Time Range**

Now we define the time range for which we want to pull data — in this case, the **last 30 days**:

```python
end_time = datetime.datetime.now()  # Current date and time
start_time = end_time - datetime.timedelta(days=30)  # 30 days ago
```

- **`end_time`**: The current date and time.
- **`start_time`**: 30 days ago from the current time.

---

### 5. **Fetch Historical Data from Binance**

We now use the Binance API to fetch **historical candlestick data**:

```python
klines = client.get_historical_klines(
    symbol=symbol,
    interval=interval,
    start_str=start_time.strftime("%Y-%m-%d %H:%M:%S"),
    end_str=end_time.strftime("%Y-%m-%d %H:%M:%S")
)
```

- **`get_historical_klines()`** fetches the candlestick data for a specific trading pair over a given time range.
- The data returned by Binance is in the form of a list of lists, with each inner list representing a single candlestick.

---

### 6. **Process Data into a DataFrame**

Next, we organize the raw data into a **pandas DataFrame**:

```python
columns = ['Open Time', 'Open', 'High', 'Low', 'Close', 'Volume', 
           'Close Time', 'Quote Asset Volume', 'Number of Trades', 
           'Taker Buy Base Asset Volume', 'Taker Buy Quote Asset Volume', 'Ignore']

df = pd.DataFrame(klines, columns=columns)
```

We assign column names that match Binance’s response structure, which includes:
- `Open Time`: The time the candlestick opened
- `Open`, `High`, `Low`, `Close`: The price data for the candlestick
- `Volume`: The trading volume

---

### 7. **Data Cleaning**

We need to convert some columns to the appropriate data types (e.g., float for price and volume):

```python
df['Open Time'] = pd.to_datetime(df['Open Time'], unit='ms')  # Convert timestamps to datetime
numeric_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
df[numeric_cols] = df[numeric_cols].astype(float)  # Convert price and volume columns to float
df.set_index('Open Time', inplace=True)  # Set 'Open Time' as the DataFrame index
```

- **`pd.to_datetime()`**: Converts the `Open Time` column from milliseconds to a proper datetime object.
- **`astype(float)`**: Ensures that the price and volume columns are numerical for plotting.
- **`set_index()`**: Sets the `Open Time` as the index for easy access during plotting.

---

### 8. **Plot the Data**

Finally, we plot the data using **mplfinance** to visualize the candlestick chart with volume:

```python
ohlc = df[numeric_cols]  # Slice the necessary columns for plotting

# Plot the candlestick chart with volume
mpf.plot(ohlc, type='candle', style='yahoo', volume=True, title=f'{symbol} - Last 30 Days')
```

- **`ohlc`**: Contains the relevant columns (`Open`, `High`, `Low`, `Close`, `Volume`) that we need for plotting.
- **`mpf.plot()`**: This function generates the candlestick chart with the specified style and adds a volume subplot.

---

## 🧠 Bonus Tip: Save the Chart to a File

If you're working in an environment where GUI-based plotting is not available (e.g., servers), you can save the plot as an image:

```python
mpf.plot(ohlc, type='candle', style='yahoo', volume=True,
         title=f'{symbol} - Last 30 Days',
         savefig='btc_chart.png')
```

This will save the plot as `btc_chart.png` in the current working directory.

---

## 💬 Wrap-Up

With just a few lines of Python, you can fetch real crypto market data and visualize it in a meaningful way. You could extend this script to:
- Track multiple trading pairs
- Automate chart generation
- Perform technical analysis

Have any questions or ideas to improve this? [Open an issue](https://github.com/your-github-username/your-repo-name/issues) or send a pull request!

---

## 📜 Full Code

Here is the complete code for your reference:

```python
# Import necessary libraries
from binance.client import Client
import pandas as pd
import datetime
import os
from dotenv import load_dotenv
import mplfinance as mpf
import matplotlib

# Set matplotlib backend to 'TkAgg' for GUI-based plotting (helps on some systems)
matplotlib.use('TkAgg')  # You could also try 'Qt5Agg' if this doesn't work

# Load environment variables from .env file (for API credentials)
load_dotenv()
api_key = os.getenv("binance-testnet-api-key")
api_secret = os.getenv("binance-testnet-secret-key")

# Initialize Binance client using your testnet API keys
client = Client(api_key, api_secret)

# Define the trading pair and time interval (1-day candlesticks)
symbol = 'BTCUSDT'
interval = Client.KLINE_INTERVAL_1DAY

# Define the time range: from 30 days ago to now
end_time = datetime.datetime.now()
start_time = end_time - datetime.timedelta(days=30)

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

# Extract only the OHLC and Volume columns needed for the candlestick chart
ohlc = df[numeric_cols]

# Plot the candlestick chart with volume using the 'yahoo' style
mpf.plot(ohlc, type='candle', style='yahoo', volume=True, title=f'{symbol} - Last 30 Days')
