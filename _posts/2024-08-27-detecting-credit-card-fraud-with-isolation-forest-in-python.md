---
layout: default
title: "Detecting Credit Card Fraud with Isolation Forest in Python"
date: 2024-08-27 13:00:00 +1000
categories: [machine-learning]
tags: [machine-learning, isolation-forest, anomaly-detection, python]
---


## Detecting Credit Card Fraud with Isolation Forest in Python

As a data enthusiast and machine learning practitioner, I often find myself tackling real-world problems like fraud detection. Recently, I decided to dive into anomaly detection using Python, focusing specifically on credit card transactions. In this blog post, I'll walk you through how I used the Isolation Forest algorithm to spot fraudulent transactions in a mock dataset. I'll break down the code into parts and explain the reasoning behind each step.

### Generating Mock Credit Card Transaction Data

To simulate a real-world scenario, I started by generating synthetic credit card transaction data. This dataset includes both normal transactions and fraudulent ones, which allows us to test our anomaly detection algorithm.

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt
import seaborn as sns

# Step 1: Generate Mock Credit Card Transaction Data
np.random.seed(42)  # For reproducibility

# Generate normal transactions
num_normal = 1000
amounts_normal = np.random.normal(loc=50, scale=20, size=num_normal)  # Normal transactions around $50, standard deviation 20
timestamps_normal = pd.date_range(start='2024-01-01', periods=num_normal, freq='D')

# Generate fraudulent transactions
num_anomalies = 50
amounts_anomalies = np.random.normal(loc=200, scale=50, size=num_anomalies)  # Fraudulent transactions around $200
timestamps_anomalies = pd.date_range(start='2026-09-15', periods=num_anomalies, freq='D')

# print a table of normal amounts and timestamps
print("Normal Amounts:")
print(pd.DataFrame({'amount': amounts_normal, 'timestamp': timestamps_normal}))

# print a table of anomalous amounts and timestamps
print("Anomalous Amounts:")
print(pd.DataFrame({'amount': amounts_anomalies, 'timestamp': timestamps_anomalies}))

# Combine normal and anomalous data
amounts = np.concatenate([amounts_normal, amounts_anomalies])
timestamps = np.concatenate([timestamps_normal, timestamps_anomalies])

# Create DataFrame
df = pd.DataFrame({
    'timestamp': timestamps,
    'amount': amounts
})

# Display the first few rows of the DataFrame
print("Original Data:")
print(df.head())
```

I used the `numpy` library to generate normal transactions around $50 and fraudulent ones around $200. Timestamps were created to simulate a sequence of transactions over time. Combining these datasets into a single DataFrame provided a realistic simulation for testing.

### Training the Isolation Forest Model

With the data ready, the next step was to train the Isolation Forest model. This algorithm is designed to detect anomalies by isolating observations. Here’s how I set it up:

```python
# Step 2: Initialize and Fit the Isolation Forest Model
# Create Isolation Forest model
model = IsolationForest(contamination=0.05, random_state=42)  # 5% contamination

# Fit the model
df['amount'] = df['amount'].values.reshape(-1, 1)  # Reshape for a single feature
model.fit(df[['amount']])
```

I configured the `IsolationForest` model with a contamination parameter of 5%, meaning the model expects about 5% of the data to be anomalies. The `random_state` parameter ensures that the results are reproducible. I reshaped the data to fit the model’s requirements, then trained it on the transaction amounts.

### Predicting and Labeling Anomalies

After training the model, it was time to use it to predict anomalies. Here’s how I processed the results:

```python
# Step 3: Predict Anomalies
# Predict anomalies
df['anomaly'] = model.predict(df[['amount']])

# Convert prediction to readable labels
df['anomaly'] = df['anomaly'].map({1: 'normal', -1: 'anomaly'})

# Display the DataFrame with anomalies
print("\nData with Anomaly Detection Results:")
print(df.head())
```

The model’s predictions were converted from numerical labels to human-readable ones: 'normal' for typical transactions and 'anomaly' for potential fraud. This conversion helps in easily identifying and understanding the results.

### Visualizing the Results

To get a clear picture of the anomalies, I visualized the data. Plotting helps in quickly spotting the fraudulent transactions. Here’s the visualization code:

```python
# Step 4: Visualization
# Plotting the results
plt.figure(figsize=(12, 6))

# Plot normal transactions
normal_data = df[df['anomaly'] == 'normal']
sns.scatterplot(x='timestamp', y='amount', data=normal_data, label='Normal', color='blue')

# Plot anomalies
anomalies = df[df['anomaly'] == 'anomaly']
sns.scatterplot(x='timestamp', y='amount', data=anomalies, label='Anomaly', color='red')

plt.title('Credit Card Transaction Anomaly Detection with Isolation Forest')
plt.xlabel('Timestamp')
plt.ylabel('Transaction Amount')
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()

# Show plot
plt.show()
```

Using `seaborn` and `matplotlib`, I created a scatter plot where normal transactions are shown in blue and anomalies in red. This visual representation makes it easy to see where the model has detected unusual behavior.

## Complete Code

Here’s the full code for generating mock credit card transaction data, training the Isolation Forest model, predicting anomalies, and visualizing the results:

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt
import seaborn as sns

# Step 1: Generate Mock Credit Card Transaction Data
np.random.seed(42)  # For reproducibility

# Generate normal transactions
num_normal = 1000
amounts_normal = np.random.normal(loc=50, scale=20, size=num_normal)  # Normal transactions around $50
timestamps_normal = pd.date_range(start='2024-01-01', periods=num_normal, freq='T')

# Generate fraudulent transactions
num_anomalies = 50
amounts_anomalies = np.random.normal(loc=200, scale=50, size=num_anomalies)  # Fraudulent transactions around $200
timestamps_anomalies = pd.date_range(start='2024-01-01 17:00', periods=num_anomalies, freq='5T')

# Combine normal and anomalous data
amounts = np.concatenate([amounts_normal, amounts_anomalies])
timestamps = np.concatenate([timestamps_normal, timestamps_anomalies])

# Create DataFrame
df = pd.DataFrame({
    'timestamp': timestamps,
    'amount': amounts
})

# Display the first few rows of the DataFrame
print("Original Data:")
print(df.head())

# Step 2: Initialize and Fit the Isolation Forest Model
# Create Isolation Forest model
model = IsolationForest(contamination=0.05, random_state=42)  # 5% contamination

# Fit the model
df['amount'] = df['amount'].values.reshape(-1, 1)  # Reshape for a single feature
model.fit(df[['amount']])

# Step 3: Predict Anomalies
# Predict anomalies
df['anomaly'] = model.predict(df[['amount']])

# Convert prediction to readable labels
df['anomaly'] = df['anomaly'].map({1: 'normal', -1: 'anomaly'})

# Display the DataFrame with anomalies
print("\nData with Anomaly Detection Results:")
print(df.head())

# Step 4: Visualization
# Plotting the results
plt.figure(figsize=(12, 6))

# Plot normal transactions
normal_data = df[df['anomaly'] == 'normal']
sns.scatterplot(x='timestamp', y='amount', data=normal_data, label='Normal', color='blue')

# Plot anomalies
anomalies = df[df['anomaly'] == 'anomaly']
sns.scatterplot(x='timestamp', y='amount', data=anomalies, label='Anomaly', color='red')

plt.title('Credit Card Transaction Anomaly Detection with Isolation Forest')
plt.xlabel('Timestamp')
plt.ylabel('Transaction Amount')
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()

# Show plot
plt.show()
```

![Output plot](/images/isolationforest_log_anomaly_detection-output-graph.png)

I hope this breakdown and code example help you understand how to use Isolation Forest for anomaly detection in credit card transactions. Whether you're dealing with real-world data or working on a similar problem, this approach can be a powerful tool in your data science toolkit.

You can find sample code on my github repository [here](https://github.com/rjhalliday/python-anomaly-detection/blob/be048ecb977a2fc9d2fe3b7684e2a7f41fc4c5b4/isolationforest_log_anomaly_detection.ipynb)
