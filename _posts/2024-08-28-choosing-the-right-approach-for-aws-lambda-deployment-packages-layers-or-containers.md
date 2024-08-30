---
layout: default
title: "Choosing the Right Approach for AWS Lambda: Deployment Packages, Layers, or Containers?"
date: 2024-08-28 15:00:00 +1000
categories: [github, aws]
tags: [aws, github, python]
---

## Choosing the Right Approach for AWS Lambda: Deployment Packages, Layers, or Containers?
![Layers of Rocks](/images/stacked-rocks.jpg)
When working with AWS Lambda, managing your code and dependencies can be approached in a few different ways. Whether you're dealing with a simple function or a more complex setup, it's important to know your options. Let’s dive into the three main methods for handling dependencies in Lambda functions: Deployment Packages, Lambda Layers, and Container Images. I’ll also look at some practical examples to make things clearer.

### Limits

Before I begin, keep in mind:

WS Lambda functions, there are specific limits related to the size of the deployment package, which includes ZIP files used for Lambda functions. As of the latest guidelines:
Lambda Deployment Package Size Limits

* Deployment Package Size (Compressed): The size of the deployment package (ZIP file) when uploaded directly (i.e., the compressed file) is limited to 50 MB.

* Deployment Package Size (Uncompressed): The size of the deployment package after being uncompressed (unzipped) is limited to 250 MB.

### Python virtual environment

Before I get started, I'm going to assume you're using a Python virtual enviornment (venv). In Python, venv is a module used to create isolated environments for projects. The purpose of venv is to manage dependencies and avoid conflicts between different projects. Here are some key benefits and purposes of using venv:

* Isolation: It creates a separate environment for your project, which includes its own Python interpreter and libraries. This prevents conflicts between dependencies of different projects, as each environment has its own set of packages.
* Dependency Management: You can install and manage dependencies specific to your project without affecting the global Python environment or other projects. This ensures that different projects can use different versions of the same library without interference.
* Reproducibility: By using venv, you can ensure that the project runs in the same environment every time, making it easier to reproduce the development setup on different machines or share it with others. You can use a requirements.txt file to list the dependencies and their versions.
* Cleaner Environment: It helps keep your global Python environment clean and free from unnecessary packages, as you only install what you need for each specific project within its virtual environment.

So first, setup a virtual environment as follows:

```python
# Create a virtual environment (you can name it as you like)
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate  # On Windows, use `mylayer-env\Scripts\activate`
```

### Deployment Packages

**What Are They?**
Deployment Packages are the traditional way to bundle your Lambda function code and its dependencies into a single ZIP file. You create this package on your local machine, and then upload it to AWS Lambda.

**Best For:**
- **Simple Functions:** If your Lambda function is small and has a few dependencies, Deployment Packages are quick and easy.
- **Single Project:** Ideal when you don’t need to share libraries across multiple functions.

**How to Create One:**

1. **Install Dependencies:**
   ```bash
   pip install <package-name>
   ```

2. **Package the Dependencies:**
   ```bash
   cd <project directory>
   cd .venv/lib/python3.x/site-packages
   # create a the deployment package in the previous directory, that is the project directory.
   zip -r ${OLDPWD}/function.zip . 
   ```

3. **Add Your Lambda Function Code:**
   ```bash
   cd $OLDPWD
   zip -u function.zip lambda_function.py
   ```

5. **Deploy the Package to Lambda:**
   ```bash
   aws lambda update-function-code --function-name <your-function-name> --zip-file fileb://function.zip
   ```

Deployment Packages are practical choice for smaller, simpler projects. They’re easy to use and perfect for straightforward deployments.

### Lambda Layers

**What Are They?**
Lambda Layers let you manage shared dependencies and code separately from your main Lambda function. This means you can reuse code and libraries across multiple functions without including them in every deployment package.

**Best For:**
- **Shared Libraries:** Great for managing common libraries across different functions.
- **Complex Environments:** Helps keep your function code separate from dependencies, making updates and maintenance easier.

**How to Create a Layer:**

1. **Create a Layer Directory Structure:**
   ```bash
   mkdir -p python
   cd python
   ```

2. **Install Dependencies into the Layer Directory:**
   ```bash
   pip install <package-name> -t .
   ```

3. **Package the Layer:**
   ```bash
   cd ..
   zip -r9 layer.zip python
   ```

4. **Upload the Layer to Lambda:**
   ```bash
   aws lambda publish-layer-version --layer-name <your-layer-name> --zip-file fileb://layer.zip
   ```

5. **Add the Layer to Your Lambda Function:**
   ```bash
   aws lambda update-function-configuration --function-name <your-function-name> --layers <layer-arn>
   ```

Lambda Layers are increasingly popular for managing dependencies efficiently in complex environments. They’re especially useful for functions that share common libraries or need modular code management. The problem is that compressed and uncompressed filesize limit are 50MB and 250MB respectively; this is fine for smaller projects, and it is possible to have multiple layers, however I have found this to be very restrictive when working with GenAI (LLM's).

### Container Images

**What Are They?**
Container Images allow you to package your Lambda function along with its dependencies into a Docker container. This method provides maximum flexibility and control over the runtime environment.

**Best For:**
- **Complex Applications:** Ideal for functions that require specific software or have complex dependency needs.
- **Custom Runtimes:** Perfect if you need a custom runtime or special configurations.

**How to Use Container Images:**

1. **Create a Dockerfile:**
   ```Dockerfile
   FROM public.ecr.aws/lambda/python:3.8

   # Install any dependencies
   RUN pip install <package-name>

   # Copy your Lambda function code
   COPY lambda_function.py ${LAMBDA_TASK_ROOT}

   # Command to run your function
   CMD ["lambda_function.lambda_handler"]
   ```

2. **Build and Push the Docker Image:**
   ```bash
   docker build -t my-lambda-image .
   ```

   Push the Docker image to Amazon ECR or another container registry.

3. **Deploy the Lambda Function Using the Container Image:**
   ```bash
   aws lambda create-function --function-name <your-function-name> --package-type Image --code ImageUri=<your-image-uri>
   ```

**Industry Trend:**
Container Images are gaining traction, particularly for complex applications and teams already familiar with Docker. They offer more control and consistency, making them a good choice for intricate setups.

### Comparison Table

To help you choose the best method, here’s a quick comparison:

| **Method**            | **Best For**                                                 | **Industry Trend**                                               |
|-----------------------|---------------------------------------------------------------|-------------------------------------------------------------------|
| **Deployment Packages**| - Simple functions with few dependencies                     | - Still common for smaller projects and straightforward tasks     |
|                       | - Single project needs                                       |                                                                   |
| **Lambda Layers**     | - Shared libraries and code across multiple functions        | - Gaining traction in complex environments with shared dependencies|
|                       | - Separating code from dependencies                          |                                                                   |
| **Container Images**  | - Complex functions with custom requirements or extensive dependencies | - Increasingly popular for complex applications and microservices  |
|                       | - Custom runtimes and configurations                         | - Ideal for teams familiar with Docker                           |

### Wrapping Up

Choosing the right method depends on your Lambda function’s complexity and dependency management needs. Deployment Packages are great for simple setups, Lambda Layers help manage shared code, and Container Images offer flexibility for more complex scenarios. Understanding these options will help you tailor your approach and streamline your AWS Lambda projects.

My preference is Lambda Layers, as it strikes the right balance for me in terms of complexity, but increasingly I've had to turn to docker images.
