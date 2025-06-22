---
layout: default
title: "FastAPI Introduction"
date: 2025-05-24 22:00:00 +1000
description: "FastAPI Introduction"
categories: [fastapi, python]
tags: [python, data visualization]
---

# FastAPI Tutorial: Build a Complete CRUD API with Detailed Explanations

This tutorial will walk through creating a **CRUD API using FastAPI**, a powerful Python web framework that's easy to use and incredibly fast.

You'll learn:

* What CRUD is and how it's tied to HTTP methods
* How to set up and run a FastAPI project
* How to define routes for each operation
* What each part of the code is doing (with comments!)
* How to test it with `curl`

---

## 🧠 What is CRUD?

**CRUD** is an acronym for:

| CRUD Operation | Description          | HTTP Method   | FastAPI Route                  |
| -------------- | -------------------- | ------------- | ------------------------------ |
| **Create**     | Add new data         | `POST`        | `@app.post()`                  |
| **Read**       | Retrieve data        | `GET`         | `@app.get()`                   |
| **Update**     | Modify existing data | `PUT`/`PATCH` | `@app.put()` or `@app.patch()` |
| **Delete**     | Remove data          | `DELETE`      | `@app.delete()`                |

Each HTTP method maps to a kind of action you want to perform on a resource, and FastAPI makes it super easy to wire them up.

---

## Project Setup

Set up your environment:

```bash
mkdir fastapi_project
cd fastapi_project
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn
```

Create a file called `main.py`:

---

## Full FastAPI CRUD App (with Explanatory Comments)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Create a FastAPI app instance
app = FastAPI()

# In-memory "database" - this list holds our to-do items temporarily
todos = []

# Define a Pydantic model for validation and structure of to-do items
class Todo(BaseModel):
    id: int  # Unique identifier
    title: str  # Short title
    description: Optional[str] = None  # Optional longer description
    completed: bool = False  # Task completion status

# ---------------- CREATE ----------------
@app.post("/todos/", response_model=Todo)
def create_todo(todo: Todo):
    """
    Create a new to-do item.
    - Expects a JSON body matching the Todo model.
    - Appends the new item to the in-memory list.
    """
    todos.append(todo)
    return todo

# ---------------- READ ALL ----------------
@app.get("/todos/", response_model=List[Todo])
def get_todos():
    """
    Get a list of all to-do items.
    - Returns the entire todos list.
    """
    return todos

# ---------------- READ ONE ----------------
@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    """
    Get a single to-do item by ID.
    - Searches the list for a matching ID.
    - If found, returns it.
    - If not, raises a 404 error.
    """
    for todo in todos:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="To-do not found")

# ---------------- UPDATE ----------------
@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, updated_todo: Todo):
    """
    Replace a to-do item with new data.
    - Matches the ID in the path.
    - Replaces the existing item with the new one.
    - If not found, raises 404.
    """
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos[index] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="To-do not found")

# ---------------- DELETE ----------------
@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    """
    Delete a to-do item by ID.
    - Finds and removes the item.
    - Returns confirmation.
    - If not found, raises 404.
    """
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(index)
            return {"detail": "To-do deleted"}
    raise HTTPException(status_code=404, detail="To-do not found")
```

---

## Running Your App

Start the development server:

```bash
uvicorn main:app --reload
```

You can now test your API at:

* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* ReDoc UI: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📬 Testing Each CRUD Operation

### 🔨 Create (`POST`)

```bash
curl -X POST http://127.0.0.1:8000/todos/ \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Learn FastAPI", "completed": false}'
```

Creates a new task.

**Expected Response**:

```json
{
  "id": 1,
  "title": "Learn FastAPI",
  "description": null,
  "completed": false
}
```

---

### 👓 Read All (`GET`)

```bash
curl http://127.0.0.1:8000/todos/
```

Lists all current tasks.

**Expected Response**:

```json
[
  {
    "id": 1,
    "title": "Learn FastAPI",
    "description": null,
    "completed": false
  }
]
```

---

### 🔍 Read One (`GET` by ID)

```bash
curl http://127.0.0.1:8000/todos/1
```

Fetches one task by ID.

**Expected Response**:

```json
{
  "id": 1,
  "title": "Learn FastAPI",
  "description": null,
  "completed": false
}
```

---

### Update (`PUT`)

```bash
curl -X PUT http://127.0.0.1:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Master FastAPI", "description": "Complete docs", "completed": true}'
```

Replaces the task with new data.

**Expected Response**:

```json
{
  "id": 1,
  "title": "Master FastAPI",
  "description": "Complete docs",
  "completed": true
}
```

---

###  Delete (`DELETE`)

```bash
curl -X DELETE http://127.0.0.1:8000/todos/1
```

Removes the task.

**Expected Response**:

```json
{
  "detail": "To-do deleted"
}
```

---

## What Happens Behind the Scenes?

Each route uses a Python function:

* FastAPI matches the HTTP method and path.
* It reads the JSON body or query/path parameters.
* It validates data using the `Todo` model.
* It returns a JSON response (automatically!).

---

## Summary

FastAPI handles **CRUD operations** with clarity and speed. Here's how the pieces fit together:

| CRUD   | HTTP Method | FastAPI Decorator | Example Path          |
| ------ | ----------- | ----------------- | --------------------- |
| Create | `POST`      | `@app.post()`     | `/todos/`             |
| Read   | `GET`       | `@app.get()`      | `/todos/`, `/todos/1` |
| Update | `PUT`       | `@app.put()`      | `/todos/1`            |
| Delete | `DELETE`    | `@app.delete()`   | `/todos/1`            |

Next steps? Try integrating a real database like **SQLite** using **SQLModel** or **SQLAlchemy**.
