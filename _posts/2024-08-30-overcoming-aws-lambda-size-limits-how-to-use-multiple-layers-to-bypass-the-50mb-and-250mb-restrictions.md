---
layout: default
title: "Overcoming AWS Lambda Size Limits: How to Use Multiple Layers to Bypass the 50MB and 250MB Restrictions"
date: 2024-08-30 14:15:00 +1000
categories: [aws]
tags: [aws, python]
---

## Overcoming AWS Lambda Size Limits: How to Use Multiple Layers to Bypass the 50MB and 250MB Restrictions

In my [previous post](/github/aws/2024/08/28/choosing-the-right-approach-for-aws-lambda-deployment-packages-layers-or-containers.html), I discussed briefly the options for managing depenencies. In this blog post, we’ll explore how to create and managing Lambda Layers. We will walk through the process of packaging Python libraries into separate layers, uploading them to AWS Lambda, and then using these layers in your Lambda functions. By the end of this guide, you’ll be equipped with the knowledge to efficiently manage large dependencies, ensuring a more modular and maintainable serverless architecture.

Note that the overall limit of the layers for a lambda function is still 250MB, so this means the use of multiple layers cannot be used to overcome the 50MB ZIP (250MB uncompressed) lambda size limit.

Let's dive into the step-by-step process of creating and uploading Lambda Layers for Python libraries, using both the AWS Management Console and the AWS CLI.

Below is a comprehensive guide to creating AWS Lambda layers for `langchain_google_genai` and `langchain_community`, including instructions for both the AWS Management Console and AWS CLI. Combined, these two libraries exceed 250MB, but individually, both are small enough to keep within the lambda size limits.

### Step 1: Install and Package the First Library (`langchain_google_genai`)

1. **Create and Activate the Virtual Environment:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install the Library:**

   ```bash
   pip install langchain_google_genai
   ```

3. **Package the Library into a Zip File:**

   - **Create the Correct Directory Structure:**

     ```bash
     mkdir -p lambda_layer/python/lib/python3.10/site-packages
     cp -r .venv/lib/python3.10/site-packages/* lambda_layer/python/lib/python3.10/site-packages/
     ```

     Replace `python3.10` with your Python version (e.g., `python3.8`).

   - **Create the Zip File:**

     ```bash
     cd lambda_layer
     zip -r ../langchain_google_genai_layer.zip .
     ```

4. **Deactivate and Delete the Virtual Environment and temporary lambda_layer director:**

   ```bash
   cd ..
   deactivate
   rm -rf .venv
   rm -rf lambda_layer
   ```

### Step 2: Upload the First Layer to AWS Lambda

#### Using the AWS Management Console

1. **Log in to the AWS Management Console.**
2. **Navigate to the Lambda service.**
3. **In the left sidebar, click on “Layers” under the “Additional Resources” section.**
4. **Click “Create layer”.**
5. **Provide a name (e.g., `langchain_google_genai_layer`).**
6. **Upload the zip file (`langchain_google_genai_layer.zip`).**
7. **Select the compatible runtimes (e.g., Python 3.8, Python 3.9).**
8. **Click “Create” to finish creating the layer.**

#### Using the AWS CLI

1. **Upload the Layer:**

   ```bash
   aws lambda publish-layer-version \
     --layer-name langchain_google_genai_layer \
     --zip-file fileb://langchain_google_genai_layer.zip \
     --compatible-runtimes python3.10
   ```

   Adjust the python version to match your needs.

### Step 3: Install and Package the Second Library (`langchain_community`)

1. **Recreate and Activate a New Virtual Environment:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install the Second Library:**

   ```bash
   pip install langchain_community
   ```

3. **Package the Library into a Zip File:**

   - **Create the Correct Directory Structure:**

     ```bash
     mkdir -p lambda_layer/python/lib/python3.10/site-packages
     cp -r .venv/lib/python3.10/site-packages/* lambda_layer/python/lib/python3.10/site-packages/
     ```

   - **Create the Zip File:**

     ```bash
     cd lambda_layer
     zip -r ../langchain_community_layer.zip .
     ```

4. **Deactivate and Delete the Virtual Environment and temporary lambda_layer director:**

   ```bash
   cd..
   deactivate
   rm -rf .venv
   rm -rf lambda_layer
   ```

### Step 4: Upload the Second Layer to AWS Lambda

#### Using the AWS Management Console

1. **Log in to the AWS Management Console.**
2. **Navigate to the Lambda service.**
3. **In the left sidebar, click on “Layers” under the “Additional Resources” section.**
4. **Click “Create layer”.**
5. **Provide a name (e.g., `langchain_community_layer`).**
6. **Upload the zip file (`langchain_community_layer.zip`).**
7. **Select the compatible runtimes (e.g., Python 3.8, Python 3.9).**
8. **Click “Create” to finish creating the layer.**

#### Using the AWS CLI

1. **Upload the Layer:**

   ```bash
   aws lambda publish-layer-version \
     --layer-name langchain_community_layer \
     --zip-file fileb://langchain_community_layer.zip \
     --compatible-runtimes python3.10
   ```

   Adjust the python version to match your needs.

You can use the same steps above to create multiple lambd layers of your choosing. In my case, I use three layers, one each for  `langchain_google_genai` and `langchain_community`, plus another layer for other (smaller) libraries.

## Configuring your lambda functoin use the uploaded layers

Once you've created and uploaded your Lambda layers, you need to configure your Lambda function to use these layers. Here's how you can do this using both the AWS Management Console and the AWS CLI:

### Configuring Your Lambda Function to Use Layers

#### Using the AWS Management Console

1. **Log in to the AWS Management Console.**

2. **Navigate to the Lambda Service:**

   - In the AWS Management Console, go to the **Lambda** service.

3. **Select Your Lambda Function:**

   - Click on the name of the Lambda function that you want to configure.

4. **Configure Function Layers:**

   - In the function’s configuration page, scroll down to the **Layers** section.
   - Click on the **Add a layer** button.

5. **Add the Layers:**

   - **Choose from Layer Version ARN**:
     - Select **Provide a layer version ARN** if you have the ARN (Amazon Resource Name) of the layer.
     - Enter the ARN for the layer, which you can find on the Layers page or in the AWS CLI output from the layer creation.
   - **Choose from AWS Layers**:
     - Select **Custom layers** to see your uploaded layers.
     - Choose the layer you want to add from the list and specify the version.
   - Click **Add** to attach the layer to your function.

6. **Repeat for Additional Layers:**

   - Repeat the above steps to add more layers, such as the second library layer you’ve uploaded.

7. **Save Changes:**

   - After adding the necessary layers, make sure to save your changes by clicking **Deploy** or **Save** on the function’s configuration page.

#### Using the AWS CLI

1. **Get the Layer ARNs:**

   - If you haven’t already, list your layers to get their ARNs:

     ```bash
     aws lambda list-layers
     ```

   - You can also get the version ARNs for a specific layer:

     ```bash
     aws lambda list-layer-versions --layer-name <layer-name>
     ```

2. **Update Your Lambda Function Configuration:**

   - Use the `update-function-configuration` command to add layers to your Lambda function. Replace `<function-name>` with your Lambda function's name, and `<layer-arn-1>` and `<layer-arn-2>` with the ARNs of the layers:

     ```bash
     aws lambda update-function-configuration \
       --function-name <function-name> \
       --layers <layer-arn-1> <layer-arn-2>
     ```

### Verifying Layer Usage

1. **Test Your Function:**

   - After updating the function configuration, test your Lambda function to ensure that the layers are correctly included and the code executes as expected.

2. **Check Logs:**

   - Use AWS CloudWatch Logs to check for any errors or logs that indicate whether the layers are being used properly. 

By following these steps, you will have successfully configured your Lambda function to use multiple layers. Remember, this isn't a workaround for the 250MB size limit, so if your lambda function requires a lot of dependencies, you will need to use docer images instead.
