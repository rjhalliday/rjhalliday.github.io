---
layout: default
title: "How to Implement Blue-Green Deployment on AWS Lambda with GitHub Actions"
date: 2024-08-26 13:00:00 +1000
categories: [github, aws]
tags: [aws, github, python]
---

# Streamline Your AWS Lambda Deployments: A Guide to Blue-Green Deployment with GitHub Workflows**

Deploying updates to AWS Lambda can be a challenging task, especially when aiming to minimize downtime and avoid potential disruptions. That's where Blue-Green Deployment comes in. In this post, I'll walk you through how I set up Blue-Green Deployment for my AWS Lambda function using GitHub Workflows.

## What is Blue-Green Deployment?

Blue-Green Deployment is a technique that helps reduce downtime and risk by using two identical production environments. The Blue environment is live and serving traffic, while the other, Green, is used for testing. When it’s time to deploy a new version, it’s pushed to the Green environment. After testing, traffic is switched to Green. If anything goes wrong, switching back to Blue is straightforward.

## My Lambda Function

For this setup, I’m using a simple AWS Lambda function defined in `hello_world.py`:

### 1. Create a Lambda Function

1. **Sign in to AWS Management Console:**
   Go to [AWS Management Console](https://aws.amazon.com/console/) and log in.

2. **Navigate to AWS Lambda:**
   In the AWS Management Console, search for and select "Lambda" from the services list.

3. **Create a Function:**
   - Click the “Create function” button.
   - Choose “Author from scratch.”
   - Enter a name for your function, such as `HelloWorldFunction`.
   - Select “Python 3.x” as the runtime (replace `x` with the latest version).
   - For the execution role, choose “Create a new role with basic Lambda permissions” (or select an existing role if you prefer).
   - Click “Create function.”

4. **Write the Code:**
   - In the function code editor, replace the default code with the following Python code:

```python
import json

def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': json.dumps('Success')
    }
```

5. **Save the Function:**
   - Click the “Deploy” button to save your changes.

### 2. Publish a Version

1. **Publish a Version:**
   - After deploying your function, go to the “Versions” tab.
   - Click on “Publish new version.”
   - Enter a version description if desired (e.g., `Initial version`).
   - Click “Publish.”

2. **Note the Version Number:**
   - Once published, a new version number will be displayed. Make a note of it, as you'll need it for the aliases.

### 3. Create Aliases

1. **Create the Blue Alias:**
   - Go to the “Aliases” tab in your Lambda function.
   - Click on “Create alias.”
   - Enter `blue` as the alias name.
   - Choose the version number you noted earlier.
   - Click “Create.”

2. **Create the Green Alias:**
   - Again, go to the “Aliases” tab.
   - Click on “Create alias.”
   - Enter `green` as the alias name.
   - For now, you can choose the same version as the `Blue` alias or a different version if you prefer.
   - Click “Create.”
  
3. **Create the Last Known Good Alias:**
 - Again, go to the “Aliases” tab.
 - Click on “Create alias.”
 - Enter `last-known-good` as the alias name.
 - For now, you can choose the same version as the `Blue` alias or a different version if you prefer.
 - Click “Create.”

### 4. Manage Aliases to Point to Different Versions

1. **Update Blue Alias to Point to a Different Version:**
   - If you want `blue` to point to a different version, go back to the “Aliases” tab.
   - Click on the `blue` alias.
   - Click “Edit.”
   - Select a different version from the dropdown list.
   - Click “Save.”

2. **Update Green Alias to Point to a Different Version:**
   - Similarly, click on the `green` alias.
   - Click “Edit.”
   - Choose a different version if needed.
   - Click “Save.”
  
3. **Update Last Known Good Alias to Point to a Different Version:**
   - Similarly, click on the `last-known-good` alias.
   - Click “Edit.”
   - Choose a different version if needed.
   - Click “Save.”

### Summary

- **Lambda Function Code:** Simple Python function returning "Hello world!" with status 200.
- **Version Management:** Publish versions of the function for immutability and tracking.
- **Aliases:** Use aliases like `Blue` and `Green` to manage different environments or stages, pointing them to specific function versions.

With these steps, you can create, version, and manage AWS Lambda functions effectively, enabling you to test and deploy different versions with ease.

## GitHub Workflows

To implement Blue-Green Deployment, I’ve set up three GitHub Workflows: `build_and_test.yml`, `deploy.yml`, and `promote_green_to_blue.yml`.
* build_and_test.yml handles building and testing
* deploy.yml deploys the new code to the Green environment after build_and_test successfully finishes. This works by pointing the Green alias in AWS to the version of the AWS file 
* promot_green_to_blue.yml is run manually to promote Green to Blue, which just repoints Blue to the same version of the lambda function that is 
Here’s a breakdown of how each file works:

### 1. `build_and_test.yml`

This workflow automates the building and testing of my Lambda function code. It ensures that every push to the repository or pull request is checked for issues.

```yaml
name: Build and Test

on:
  push:
    branches:
      - '*'  # Trigger on any branch push
  pull_request:
    branches:
      - '*'  # Trigger on any pull request

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'  # Specify the Python version

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # Optional linting step (commented out)
      # - name: Run linting
      #   run: |
      #     flake8 .  # Run linting for code quality checks

      - name: Run tests
        run: |
          python -m unittest discover -s tests
```

**How it works:**
- **Checkout code**: Fetches the latest code from the repository.
- **Set up Python**: Configures the Python environment.
- **Install dependencies**: Installs required packages listed in `requirements.txt`.
- **Run tests**: Executes unit tests to ensure the code works as expected.

### 2. `deploy.yml`

This workflow handles the deployment of the Lambda function to AWS. It’s triggered automatically once the `Build and Test` workflow completes successfully.

```yaml
name: Deploy to AWS Lambda

on:
  workflow_run:
    workflows: ["Build and Test"]
    types:
      - completed

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up AWS CLI
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Zip function code
        run: |
          zip -r hello-world.zip *.py

      - name: Deploy Lambda function
        run: |
          aws lambda update-function-code --function-name hello-world --zip-file fileb://hello-world.zip

     - name: Publish new Lambda version
        id: publish-new-version
        run: |
          # sleep to allow previous aws function update to complete
          sleep 1
          while true; do
            STATUS=$(aws lambda get-function --function-name hello-world --query 'Configuration.LastModified' --output text)
            if [[ "$STATUS" != "" ]]; then
              echo "Update complete. Last modified: $STATUS"
              break
            else
              echo "Waiting for update to complete..."
              sleep 2
            fi
          done

          NEWLY_DEPLOYED_VERSION=$(aws lambda publish-version --function-name hello-world | jq -r '.Version')
          printf 'NEWLY_DEPLOYED_VERSION:%s\n' "$NEWLY_DEPLOYED_VERSION"
          echo "NEWLY_DEPLOYED_VERSION=$NEWLY_DEPLOYED_VERSION" >> $GITHUB_OUTPUT

      - name: Update Green alias to NEWLY_DEPLOYED_VERSION
        id: set-green-version
        run: |
          NEW_GREEN_VERSION=${{ steps.publish-new-version.outputs.NEWLY_DEPLOYED_VERSION }}
          printf 'Repointing Green to:%s\n' "$NEW_GREEN_VERSION"
          aws lambda update-alias --function-name hello-world --name green --function-version $NEW_GREEN_VERSION

      - name: Delete function zip file
        run: |
          rm hello-world.zip
```

**How it works:**
- **Checkout code**: Fetches the latest code from the repository.
- **Set up AWS CLI**: Configures AWS CLI with credentials from GitHub Secrets.
- **Zip function code**: Packages the Lambda function code into a ZIP file.
- **Deploy Lambda function**: Updates the Lambda function code with the new ZIP file.
- **Publish new Lambda version**: Creates a new version of the Lambda function and stores the version number.
- **Update Green alias**: Points the Green alias to the newly deployed version.
- **Delete function zip file**: Cleans up the ZIP file used for deployment.

### 3. `promote_green_to_blue.yml`

This workflow manually promotes the Green environment to Blue, making the new version live. It’s triggered manually through the GitHub Actions interface.

```yaml
name: Promote Green to Blue

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up AWS CLI
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

     - name: Get Green alias version as GREEN_VERSION
        id: get-green-version
        run: |
          # Retrieve the current version of the Lambda function that the blue alias points to
          GREEN_VERSION=$(aws lambda get-alias --function-name hello-world --name green | jq -r '.FunctionVersion')
          echo "GREEN_VERSION=$GREEN_VERSION" >> $GITHUB_OUTPUT

      - name: Update last-known-good to current BLUE_VERSION
        id: set-last-known-good
        run: |
          # Retrieve the current version of the Lambda function that the blue alias points to
          BLUE_VERSION=$(aws lambda get-alias --function-name hello-world --name blue | jq -r '.FunctionVersion')
          aws lambda update-alias --function-name hello-world --name last-known-good --function-version $BLUE_VERSION

      - name: Update Blue alias to previous GREEN_VERSION
        id: set-green-version
        run: |
          # Switch traffic from blue to green by updating the blue alias to the previous version
          aws lambda update-alias --function-name hello-world --name blue --function-version ${{ steps.get-green-version.outputs.GREEN_VERSION }}
          
```

You can manually trigger this via the GitHub web interface under actions:
![Manually trigger actions](/images/github-manually-trigger-actions.png)

### 4. `rollback_blue.yml`

This workflow manually rolls back Blue to the Last Known Good version of Blue, which was set in romote_green_to_blue.yml prior to pointoint Blue to the Green version.

```python
name: Rollback Blue to Last Known Good

# We repoint Blue to point to the current Green version manually
on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up AWS CLI
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Set Blue to Last Known Good
        id: set-blue-to-last-known-good
        run: |
          # Retrieve the version that the last-known-good points to
          LAST_KNOWN_GOOD=$(aws lambda get-alias --function-name hello-world --name last-known-good | jq -r '.FunctionVersion')

          # Point blue to the same version as last-known-good
          aws lambda update-alias --function-name hello-world --name blue --function-version $LAST_KNOWN_GOOD
          
```

**How it works:**
- **Checkout code**: Fetches the latest code from the repository.
- **Set up AWS CLI**: Configures AWS CLI with credentials from GitHub Secrets.
- **Get Green alias version**: Retrieves the version number currently assigned to the Green alias.
- **Update last-known-good**: Points last known good to the current Blue version, so we can rollback later if necessarry.
- **Update Blue alias**: Points the Blue alias to the Green version, making it live.

## Testing the Lambda Function

For testing, I use `test_resume_scan.py` to ensure my Lambda function behaves as expected:

```python
import unittest
from unittest.mock import Mock
from resume_scan import lambda_handler

class TestLambdaHandler(unittest.TestCase):
    def setUp(self):
        self.mock_context = Mock()  # Mock context object if needed

    def test_lambda_handler(self):
        event = {'key': 'value'}
        expected_result = {'statusCode': 200, 'body': 'Hello from resume-scan v8'}
        self.assertEqual(lambda_handler(event, self.mock_context), expected_result)

if __name__ == '__main__':
    unittest.main()
```

**How it works:**
- **setUp**: Prepares the environment for testing by creating a mock context.
- **test_lambda_handler**: Runs several tests to verify the behavior of the Lambda function under different scenarios.

## Conclusion

By setting up Blue-Green Deployment with these GitHub Workflows, I’ve streamlined the deployment process for my AWS Lambda functions, ensuring safer and more efficient updates. This approach minimizes downtime and reduces the risk of disruptions. If you have any questions or need further customization, feel free to reach out. Happy deploying!

---

I hope this guide helps you understand how to implement Blue-Green Deployment with GitHub Workflows for AWS Lambda. If you need more details or have specific requirements, just let me know!
