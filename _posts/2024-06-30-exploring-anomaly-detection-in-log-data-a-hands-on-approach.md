---
layout: default
title: "Exploring Anomaly Detection in Log Data: A Hands-On Approach"
date: 2024-06-30 12:00:00 +1000
categories: [machine-learning]
tags: [machine-learning, isolation-forest, anomaly-detection, python]
---

## Exploring Anomaly Detection in Log Data: A Hands-On Approach

This is a follow-up post on anomaly detection using isolation forest in log data. I’ll walk you through a practical example of using Python to detect anomalies in log data, leveraging some powerful libraries and techniques. So, let’s get started.

### Setting the Stage

Before diving into the code, let’s set up the environment. I’m using a mix of libraries including `numpy`, `pandas`, `matplotlib`, and `seaborn` for data manipulation and visualization, along with `scikit-learn` for machine learning. Here’s a quick overview of what I’m doing:

1. **Generating Baseline Data**: This data will represent the “normal” behavior.
2. **Preprocessing Data**: I’ll set up preprocessing steps to prepare the data for anomaly detection.
3. **Detecting Anomalies**: I’ll use an Isolation Forest model to identify anomalies.
4. **Evaluating and Visualizing Results**: I’ll check how well the model performed and visualize the results.

### 1. Generating Baseline Data

First, I generate some baseline data that mimics normal log entries. This includes timestamps, log levels, senders, recipients, and mail servers. Here’s a breakdown:

- **Timestamps**: Created hourly over a period.
- **Log Levels**: Predominantly 'INFO', with a few 'WARN' and 'ERROR' levels.
- **Senders, Recipients, and Mail Servers**: Randomly assigned from predefined lists.

Here’s the code that generates this data:

```python
num_baseline_records = 200
timestamps_baseline = pd.date_range(start='2024-01-01', periods=num_baseline_records, freq='H')

log_levels_baseline = ['INFO'] * 160 + ['WARN'] * 30 + ['ERROR'] * 10
senders = [f'user{i}@example.com' for i in range(1, 21)]
recipients = [f'user{i}@example.com' for i in range(21, 41)]
mail_servers = [f'mailserver{i}.com' for i in range(1, 11)]

senders_repeated_baseline = np.random.choice(senders, size=num_baseline_records)
recipients_repeated_baseline = np.random.choice(recipients, size=num_baseline_records)
mail_servers_repeated_baseline = np.random.choice(mail_servers, size=num_baseline_records)

baseline_df = pd.DataFrame({
    'Timestamp': timestamps_baseline,
    'LogLevel': log_levels_baseline,
    'Sender': senders_repeated_baseline,
    'Recipient': recipients_repeated_baseline,
    'MailServer': mail_servers_repeated_baseline
})
```

### 2. Preprocessing Data

To prepare the data for anomaly detection, I use `ColumnTransformer` and `OneHotEncoder` to handle categorical variables. This step converts categorical features into numerical format so that the model can process them.

```python
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse=False), ['LogLevel', 'Sender', 'Recipient', 'MailServer'])
    ]
)
```

I then set up a `Pipeline` that includes this preprocessing step followed by an Isolation Forest model. The Isolation Forest is great for identifying anomalies in high-dimensional data.

```python
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('iso_forest', IsolationForest(contamination=0.2, random_state=42))
])
```

### 3. Detecting Anomalies

Next, I fit the pipeline on the baseline data and generate some test data. This test data includes both normal and anomalous entries. I’ve made sure to introduce anomalies in the test data by modifying some log levels and randomly changing senders, recipients, and mail servers.

```python
num_test_records = 250
test_timestamps = pd.date_range(start='2024-01-01', periods=num_test_records, freq='H')

test_log_levels = ['INFO'] * 200 + ['ERROR'] * 50
test_senders_repeated = np.random.choice(test_senders, size=num_test_records)
test_recipients_repeated = np.random.choice(test_recipients, size=num_test_records)
test_mail_servers_repeated = np.random.choice(test_mail_servers, size=num_test_records)

anomaly_indices = np.random.choice(num_test_records, size=50, replace=False)
for idx in anomaly_indices:
    test_log_levels[idx] = 'ERROR'
test_senders_repeated[anomaly_indices] = np.random.choice(senders, size=50)
test_recipients_repeated[anomaly_indices] = np.random.choice(recipients, size=50)
test_mail_servers_repeated[anomaly_indices] = np.random.choice(mail_servers, size=50)

test_df = pd.DataFrame({
    'Timestamp': test_timestamps,
    'LogLevel': test_log_levels,
    'Sender': test_senders_repeated,
    'Recipient': test_recipients_repeated,
    'MailServer': test_mail_servers_repeated
})
```

I then use the trained pipeline to predict anomalies in the test data:

```python
test_features = test_df[['LogLevel', 'Sender', 'Recipient', 'MailServer']]
test_df['Anomaly'] = pipeline.predict(test_features)
test_df['Anomaly'] = test_df['Anomaly'].map({1: 'Normal', -1: 'Anomaly'})
```

### 4. Evaluating and Visualizing Results

I achieved a success rate of **65.17%** in detecting anomalies in the log data. While this result shows that the model is fairly effective, there’s room for improvement to enhance accuracy further. Here’s a breakdown of what this percentage means and how I might improve the anomaly detection system:

**Understanding the Success Rate**

A 65.17% success rate means that the model correctly identified about two-thirds of the actual anomalies in the data. This is a solid start, but several factors could impact this result:

1. **Data Quality and Quantity**: The baseline and test datasets used were relatively small and simplified. In real-world scenarios, log data can be much more complex and voluminous, which may influence model performance.

2. **Anomaly Distribution**: The test data included a mix of normal and anomalous log entries. The distribution of anomalies versus normal entries in the training set can significantly affect the model's ability to generalize and detect anomalies accurately.

3. **Feature Engineering**: The features used (log level, sender, recipient, and mail server) are fairly straightforward. There may be other features or interactions between features that could provide additional insight and improve anomaly detection.

**Strategies for Improvement**

1. **Expand the Dataset**: Increasing the size and diversity of both the baseline and test datasets can help the model learn more nuanced patterns. More data can also help in better representing rare anomalies and improving the model’s generalization.

2. **Feature Engineering**: Experiment with additional features or feature combinations that might capture more subtle patterns in the data. For instance, incorporating time-based features or aggregating data at different levels (e.g., per day or week) might reveal new insights.

3. **Model Tuning**: The Isolation Forest model's parameters, such as `contamination` (which sets the expected proportion of anomalies), can be fine-tuned based on the specific characteristics of the dataset. Additionally, experimenting with other anomaly detection algorithms, such as One-Class SVM or Autoencoders, could provide better results.

4. **Hybrid Approaches**: Combining anomaly detection with other techniques, like rule-based systems or supervised learning (if labeled data is available), might enhance detection accuracy. Hybrid approaches can leverage the strengths of different methods to improve overall performance.

5. **Cross-Validation**: Implementing cross-validation techniques to assess the model’s performance on different subsets of data can help ensure that the model’s success rate is robust and not just a result of overfitting to the training data.

6. **Continuous Monitoring and Updates**: Anomaly detection models benefit from being continuously updated as new data becomes available. Regularly retraining the model with the latest data helps it adapt to evolving patterns and anomalies.

**Visualizing the Results**

![Results plot](/images/2024-08-31-exploring-anomaly-detection-in-log-data-a-hands-on-approach-plot.png)

To assess how well the model performed, I calculated the success rate of anomaly detection by comparing predicted anomalies to actual anomalies. I also visualized the results using a heatmap, which helps in understanding the distribution of detected anomalies across different senders, recipients, and mail servers:

```python
anomaly_counts = test_df[test_df['Anomaly'] == 'Anomaly'].groupby(['Sender', 'Recipient', 'MailServer']).size().reset_index(name='Count')
if len(anomaly_counts) > 0:
    pivot_table = anomaly_counts.pivot_table(
        index=['Sender', 'Recipient'],
        columns='MailServer',
        values='Count',
        fill_value=0
    )

    plt.figure(figsize=(14, 10))
    sns.heatmap(pivot_table, annot=True, fmt='f', cmap='Reds', linewidths=0.5, linecolor='black')
    plt.title('Heatmap of Anomalies by Sender, Recipient, and Mail Server')
    plt.xlabel('Mail Server')
    plt.ylabel('Sender and Recipient')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
else:
    print("No anomalies detected.")
```

### Conclusion

In summary, I’ve successfully implemented an anomaly detection system that achieved a 65.17% success rate. While this is a promising start, there are several areas for improvement. By expanding the dataset, refining feature engineering, tuning the model, exploring hybrid approaches, and implementing continuous updates, I can further enhance the accuracy and reliability of the anomaly detection efforts. Feel free to experiment with these suggestions and share your experiences. 

You can find the code [here](https://github.com/rjhalliday/python-anomaly-detection/blob/d7dfbb470d925206ebfa2cb9e6143e2cda7e4523/isolationforest_anomaly_detection_with_synthetic_email_log_data.ipynb)
