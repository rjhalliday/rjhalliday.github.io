---
layout: default
title: "A simple example of github actions, in action"
date: 2024-08-24 00:00:00 +1000
categories: [cicd]
tags: [github, python, cicd]
---

Setting up GitHub Actions for a Python project involves creating a workflow file in your repository that defines the CI/CD pipeline. For a simple Python project that runs unit tests, you'll need to create a workflow file that specifies the steps to set up Python, install dependencies, and run tests.

Here's a step-by-step guide to setting up GitHub Actions for a Python project:

### 1. Create a Python Project

Let's create a simple Python project with a function and a unit test.

**Directory Structure:**
```
my_python_project/
│
├── .github/
│   └── workflows/
│       └── python-app.yml
│
├── my_module/
│   └── my_script.py
│
├── tests/
│   └── test_my_script.py
│
├── requirements.txt
└── README.md
```

### 2. Write the Python Code

Create a Python script with a function that processes input and produces output.

**`my_module/my_script.py`:**
```python
def add_numbers(a, b):
    """Function to add two numbers."""
    return a + b
```

### 3. Write the Unit Test

Create a unit test to ensure that the function produces the expected output.

**`tests/test_my_script.py`:**
```python
import unittest
from my_module.my_script import add_numbers

class TestAddNumbers(unittest.TestCase):
    def test_add_numbers(self):
        self.assertEqual(add_numbers(2, 3), 5)
        self.assertEqual(add_numbers(-1, 1), 0)
        self.assertEqual(add_numbers(-5, -5), -10)

if __name__ == '__main__':
    unittest.main()
```

### 4. Create `requirements.txt`

List the dependencies needed for the project.

**`requirements.txt`:**
```
# Add any dependencies here, e.g.:
# requests==2.25.1
```

### 5. Setup GitHub Actions

Create a GitHub Actions workflow file to automate testing.

**`.github/workflows/python-app.yml`:**
```yaml
name: Python application

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.8'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Run tests
      run: |
        python -m unittest discover -s tests
```

### Explanation

1. **name: Python application**: This is the name of your workflow.

2. **on: [push]**: This specifies that the workflow will run on every push to the repository.

3. **jobs**: Defines a set of steps to be executed as part of this workflow.

4. **runs-on: ubuntu-latest**: This specifies the operating system on which the workflow will run.

5. **steps**: Each step runs a specific command or action.
   - **Checkout code**: Checks out your repository code so that it can be used by subsequent steps.
   - **Set up Python**: Installs the specified Python version.
   - **Install dependencies**: Installs Python dependencies listed in `requirements.txt`.
   - **Run tests**: Discovers and runs unit tests using Python’s built-in `unittest` framework.

### 6. Commit and Push

Commit the changes and push them to your GitHub repository:
```bash
git add .
git commit -m "Add GitHub Actions workflow for Python tests"
git push
```

Once pushed, GitHub Actions will automatically run the workflow defined in `python-app.yml` and execute the unit tests. You can check the results of the workflow on the "Actions" tab in your GitHub repository.

You can check the result in Github actions:
![Successful test case](images/github-actions-simple-example-test-case-success.png)

Let's modify the test case so it fails:
```python
import unittest
from my_module.my_script import add_numbers

class TestAddNumbers(unittest.TestCase):
    def test_add_numbers(self):
        self.assertEqual(add_numbers(2, 3), 5)
        self.assertEqual(add_numbers(-1, 1), 0)
        self.assertEqual(add_numbers(-5, -5), -10)
        self.assertEqual(add_numbers(1, 1), 3) # deliberatly wrong result

if __name__ == '__main__':
    unittest.main()
```

In github actions you can see that this failed:
![Failed test case](images/github-actions-simple-example-test-case-failure.png)
