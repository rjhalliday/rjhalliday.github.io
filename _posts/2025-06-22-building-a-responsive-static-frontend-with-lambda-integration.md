---
layout: default
title: "Building a Responsive Static Frontend with Lambda Integration"
date: 2025-06-22
description: "How I built a responsive static site that accepts user input via text or files, communicates with a backend Lambda function, and presents the results — all with one HTML file and no frontend framework."
categories: [web-development, frontend, serverless, javascript]
tags: [tailwindcss, lambda, static-site, html, drag-and-drop, pdf-parsing, docx-parsing, responsive-design, javascript-functions, async-processing]
---

# Building a Responsive Static Frontend with Lambda Integration

In this post, I'm going to break down how I built a responsive static site that accepts user input via text or files, communicates with a backend Lambda function, and presents the results — all with one HTML file and no frontend framework.

The post focuses on the **layout**, **JavaScript functions**, and the **UX flow** that make it all tick.

---

## Page Layout and UX

The HTML is structured to provide a clean two-panel layout for desktop users, and a stacked interface for mobile devices. Here's the breakdown:

### Structure

The core content lives inside a centered `main` container:

```html
<main class="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-10">
  <!-- Logo -->
  <!-- Intro text -->
  <!-- Input section -->
  <!-- Loading overlay -->
  <!-- Results -->
</main>
````

### Input Section

Inputs are split into two columns (Resume and Job Description) using a responsive grid:

```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div id="resume-drop">...</div>
  <div id="job-drop">...</div>
</div>
```

* On **desktop**, users see both input panes side by side.
* On **mobile**, Tailwind’s `sm:grid-cols-2` kicks in and stacks them vertically.

Each input panel supports:

* File upload via `<input type="file">`
* Drag-and-drop via `ondragover`, `ondrop`, etc.
* Manual paste via a `textarea`

### 📱 Mobile Optimization

Tailwind's utility classes handle responsiveness:

* `sm:p-6`, `md:w-48`, `w-full`, etc.
* No horizontal scrolling or zoom required
* Buttons and interactive elements have large hit areas

---

## Core JavaScript Functions

Here’s a breakdown of the main client-side logic:

---

### `handleFileSelect(event, target)`

This function runs when the user selects a file through the file browser:

```js
function handleFileSelect(event, target) {
  const file = event.target.files[0];
  if (file) {
    processFile(file, target);
  }
}
```

---

### `handleDrop(event, target)`

Handles drag-and-drop behavior. It also sets the file input manually so it's consistent with selecting through the browser:

```js
function handleDrop(event, target) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    const input = document.getElementById(`${target}-upload`);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    processFile(file, target);
  }
}
```

---

### `processFile(file, target)`

This is the heart of the file parsing logic:

```js
async function processFile(file, target) {
  const textarea = document.getElementById(target);
  const arrayBuffer = await file.arrayBuffer();
  let text = "";

  if (file.name.endsWith('.docx')) {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    text = result.value.replace(/<[^>]+>/g, '');
  } else if (file.name.endsWith('.pdf')) {
    const typedarray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
  }

  textarea.value = text.trim();
  textarea.classList.add('hidden');
  // Show filename, hide other inputs
}
```

### UX Detail:

* This async parsing prevents blocking the UI.
* Once parsed, the `<textarea>` is hidden and replaced by the filename to indicate success.

---

### `submitToLambda()`

Triggered when the "Analyze" button is clicked. Sends data to Lambda via `fetch`:

```js
async function submitToLambda() {
  if (!validateInputs()) return;

  showLoading();

  const resume = document.getElementById("resume").value.trim();
  const job = document.getElementById("job").value.trim();

  try {
    const res = await fetch('https://your-lambda-api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, job_description: job }),
    });

    const data = await res.json();
    renderResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}
```

---

### `showLoading()` & `hideLoading()`

Activates an overlay and animated spinner:

```js
function showLoading() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('loading').classList.add('hidden');
}
```

The overlay:

* Blocks interaction
* Provides user feedback
* Helps with perceived performance

---

### `renderResults(data)`

Updates the DOM with match percentage and keyword info:

```js
function renderResults(data) {
  const matched = data.matched_keywords || [];
  const missing = data.missing_keywords || [];
  const percent = Math.round((matched.length / (matched.length + missing.length)) * 100);

  document.getElementById("match-bar").style.width = `${percent}%`;
  document.getElementById("match-bar").textContent = `${percent}%`;

  document.getElementById("matched-cell").textContent = matched.join(", ") || "None";
  document.getElementById("missing-cell").textContent = missing.join(", ") || "None";

  document.getElementById("input-section").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
}
```

---

### `goBack()`

Takes the user back to the original input view without reloading the page:

```js
function goBack() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("input-section").classList.remove("hidden");
}
```

---

## UX Cleanup & Reset

The `clearOutput()` function ensures all states are reset:

```js
function clearOutput() {
  clearFile('resume');
  clearFile('job');

  document.getElementById("match-bar").style.width = '0%';
  document.getElementById("matched-cell").textContent = '';
  document.getElementById("missing-cell").textContent = '';

  document.getElementById("results").classList.add("hidden");
  document.getElementById("input-section").classList.remove("hidden");
}
```

`clearFile(target)` resets both text and file state for a specific input:

```js
function clearFile(target) {
  document.getElementById(target).value = '';
  document.getElementById(`${target}-upload`).value = '';
  document.getElementById(`${target}-filename`).classList.add('hidden');
  document.getElementById(`${target}-clear`).classList.add('hidden');
  document.getElementById(`${target}-browse-label`).classList.remove('hidden');
  document.getElementById(target).classList.remove('hidden');
}
```

---

## Summary

The result is a frontend that:

* Looks good on desktop and mobile
* Parses Word and PDF files in-browser
* Talks to a Lambda backend
* Provides immediate visual feedback
* Requires zero build or deploy complexity

This approach is ideal for small tools and microapps that don't need a full SPA or backend server.

Next time you’re building a simple workflow tool, consider skipping the framework — and see how far you can get with just HTML, Tailwind, and a few smart JavaScript functions.
