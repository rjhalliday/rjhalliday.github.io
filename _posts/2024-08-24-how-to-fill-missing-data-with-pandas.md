---
layout: default
title: "How to fill missing data with Pandas"
date: 2024-08-24 22:49:00 +1000
categories: [pandas]
tags: [pandas, data-science]
---

Let’s dive into a super handy feature in the pandas library called fillna. If you’ve ever worked with data, you’ve probably encountered missing values. Luckily, fillna can be used to address this. Let me walk you through how this method can help you handle missing data with ease.

## What is fillna?

fillna is a method from pandas that lets you fill in missing values in your DataFrame or Series. Imagine you have a table with some gaps where data should be. fillna helps you plug those gaps with something useful. Here’s how you can use it:
1. Filling with a Scalar Value

If you just want to replace all the missing values with a single value (like 0, 'unknown', or whatever suits your needs), you can do it like this:

```python
import pandas as pd

# Create a DataFrame with some missing values
df = pd.DataFrame({
    'A': [1, 2, None, 4],
    'B': [None, 'b', 'c', None]
})
```

### 1. Fill missing values with 0
```python
df_filled = df.fillna(0)
```

Here, every NaN (Not a Number) in df gets replaced with 0. Simple and effective.

### 2. Filling with Different Values for Different Columns

Sometimes, you might want to replace missing values in different columns with different values. You can do this using a dictionary:

```python
# Fill missing values with different values for each column
df_filled = df.fillna({'A': 0, 'B': 'missing'})
```

In this case, missing values in column A become 0, and those in column B are replaced with 'missing'.

### 3. Forward Fill (Propagate Last Valid Observation)

If you’d like to fill missing values by carrying forward the last known value, you can use forward fill:

```python
# Forward fill missing values
df_filled = df.fillna(method='ffill')
```

This method takes the last valid entry and uses it to fill subsequent missing values. It’s great for time series data where previous values are a good estimate.
### 4. Backward Fill (Propagate Next Valid Observation)

Alternatively, you can use backward fill to fill missing values with the next valid entry:

```python
# Backward fill missing values
df_filled = df.fillna(method='bfill')
```

Here, NaN values are filled with the next non-null value in the column. This can be useful in certain contexts where future values are more relevant.
### 5. Limiting the Number of Fill Operations

Want to limit how many missing values you fill? The limit parameter is your friend:

```python
# Forward fill with a limit of 1
df_filled = df.fillna(method='ffill', limit=1)
```

This fills up to one missing value with the last known valid entry.
### 6. Interpolation for Numeric Data

For numerical data, you might prefer interpolation, which estimates missing values based on existing data:

```python
# Interpolate missing values
df_filled = df['A'].interpolate()
```

This method performs linear interpolation by default but can be customized for different types of interpolation.
## Wrapping Up

So there you have it! fillna is an incredibly versatile tool for dealing with missing data. Whether you need to replace NaN values with a constant, carry forward previous values, or interpolate, pandas has got you covered. Give it a try in your next data project and watch your data clean up nicely!

You can find the example repository [here](https://github.com/rjhalliday/github-actions-example).
