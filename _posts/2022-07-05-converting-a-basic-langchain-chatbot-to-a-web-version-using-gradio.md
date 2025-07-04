---
layout: default
title: "Converting a Basic LangChain Chatbot to a Web Version Using Gradio"
date: 2025-07-05
description: "Converting a Basic LangChain Chatbot to a Web Version Using Gradio"
categories: [machine-learning, python, local-llm]
tags: [langchain, ollama, local-llm, python,  llm]
---

# Converting a Basic LangChain Chatbot to a Web Version Using Gradio

In this post, I’ll walk through how to turn a basic LangChain chatbot—powered by a local Ollama model—into a web-accessible chatbot using Gradio. I’ll explain what Gradio is, the options for running the app locally or remotely, and show the necessary code changes to get your chatbot running on the web.

---

## What is Gradio?

Gradio is a Python library designed for creating interactive web interfaces for machine learning models and functions with minimal effort. It allows you to quickly build and deploy UIs like textboxes, chatbots, sliders, and more, without dealing with complex frontend development.

Key points about Gradio:

- **Rapid prototyping:** Build a web UI for your model in just a few lines of code.
- **Local and remote access:** Run locally or generate a temporary public URL.
- **No frontend skills required:** Gradio handles the web frontend automatically.
- **Great for demos:** Share your app instantly with others.

---

## Why Convert Your Chatbot to a Web Version?

The basic LangChain chatbot runs in the console, requiring users to interact via the command line. A web version:

- Makes it easier and more user-friendly for others to interact with your chatbot.
- Allows remote access, enabling users to try the chatbot from any device.
- Provides a structured UI experience, such as chat bubbles, input boxes, and persistent chat history.

---

## Running Gradio Locally vs Remotely

When you launch a Gradio app, you have two main options:

### 1. Local Mode (Default)

```python
demo.launch()
````

* The app runs on your machine at `http://localhost:7860`.
* Only accessible from your local computer.
* Ideal for development and private use.

### 2. Remote Sharing Mode

```python
demo.launch(share=True)
```

* Gradio generates a **temporary public URL**.
* The URL tunnels traffic from the internet to your local machine.
* You can share this URL with others to access your chatbot remotely.
* Great for quick demos and testing with remote users.
* Note: The URL is temporary and only valid while the app is running.

---

## Code Changes: From Console Chatbot to Gradio Web App

Here’s a basic example of how to modify your existing LangChain + Ollama chatbot code to use Gradio for the frontend.

### Original Console Chatbot (simplified)

```python
from langchain_ollama import OllamaLLM
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

llm = OllamaLLM(model="llama3")
memory = ConversationBufferMemory()

chatbot = ConversationChain(llm=llm, memory=memory, verbose=False)

while True:
    user_input = input("You: ")
    if user_input.lower() in {"exit", "quit"}:
        break
    response = chatbot.predict(input=user_input)
    print("Bot:", response)
```

### Updated Gradio Web Chatbot

```python
import gradio as gr
from langchain_ollama import OllamaLLM
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

llm = OllamaLLM(model="llama3")
memory = ConversationBufferMemory()

chatbot = ConversationChain(llm=llm, memory=memory, verbose=False)

def respond(user_input, chat_history):
    response = chatbot.predict(input=user_input)
    chat_history.append((user_input, response))
    return chat_history, chat_history

with gr.Blocks() as demo:
    gr.Markdown("# LangChain Chatbot with Ollama")
    chatbot_ui = gr.Chatbot()
    user_input = gr.Textbox(placeholder="Type your message here...")
    state = gr.State([])

    user_input.submit(respond, inputs=[user_input, state], outputs=[chatbot_ui, state])

if __name__ == "__main__":
    demo.launch(share=False)  # Set share=True for a public URL
```

### Explanation of Changes:

* **Gradio UI Components:** We use `gr.Chatbot()` for displaying the conversation and `gr.Textbox()` for input.
* **State Management:** `gr.State` keeps track of the conversation history to maintain context across user inputs.
* **Callback Function:** The `respond` function handles input, generates the model response, appends the exchange to chat history, and updates the UI.
* **Launching the Interface:** `demo.launch()` starts the web server locally. Passing `share=True` makes it available remotely via a public URL.

---

## Summary

Converting a LangChain chatbot to a web app with Gradio is straightforward and significantly improves accessibility and usability. Gradio’s local mode allows easy testing and development, while its sharing option lets you quickly provide remote access without complicated deployment.

This approach is ideal for rapid prototyping, demos, and small-scale use cases. For production-grade deployment, you might later explore dedicated web frameworks like FastAPI and proper hosting solutions.
