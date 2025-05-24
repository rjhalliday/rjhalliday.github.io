---
layout: default
title: "Build a Resume vs Job Description Keyword Analyzer API with FastAPI and spaCy"
date: 2025-05-2 22:09:00 +1000
description: "Build a Resume vs Job Description Keyword Analyzer API with FastAPI and spaCy"
categories: [fastapi, python]
tags: [python, data visualization]
---

# 🔍 Build a Resume vs Job Description Keyword Analyzer API with FastAPI and spaCy

Getting past automated resume screening systems is tough. These systems, called **ATS (Applicant Tracking Systems)**, scan your resume for keywords from the job description and filter out candidates who don’t match well enough. If you want to help job seekers understand how well their resumes match a job, a simple keyword comparison backend can be a great start — without the cost of expensive Large Language Model (LLM) API calls for every request.

This post walks through creating a **FastAPI** backend that extracts keywords from a resume and a job description using **spaCy** (a powerful NLP library), compares them, and returns matching and missing keywords. You’ll learn how to:

- Create a Python environment with `venv`
- Write the FastAPI app using spaCy for keyword extraction
- Test the API using `curl` with text files as input

---

## Why Use spaCy Instead of NLTK?

Both **spaCy** and **NLTK** are popular Python NLP libraries, but for this project spaCy is a better fit:

- **Speed & Efficiency**: spaCy is written in Cython, making it much faster for real-world applications.
- **Modern NLP Pipeline**: spaCy provides pretrained models for tokenization, lemmatization, part-of-speech tagging, and named entity recognition out of the box.
- **Cleaner API**: spaCy’s object-oriented design makes it easy to access linguistic features.
- **Good Integration with LLM workflows**: spaCy can easily prepare and clean text for downstream LLM or embedding-based models.

NLTK is more suited for educational or research purposes but requires more manual setup and is slower, which could slow down your API under load.

---

## Step 1: Set Up Your Python Environment with `venv`

Start by creating a clean isolated Python environment to keep dependencies organized and avoid conflicts.

```bash
# Create a virtual environment folder named 'venv'
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1
````

Once activated, install the needed libraries:

```bash
pip install fastapi uvicorn spacy python-multipart

# Download the English language model for spaCy
python -m spacy download en_core_web_sm
```

---

## Step 2: Write the FastAPI Backend Using spaCy

Create a file `main.py` and paste the following code:

```python
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import spacy
from typing import List

# Initialize FastAPI app
app = FastAPI()

# Enable CORS so your frontend can talk to this API from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the spaCy English model once at startup for efficiency
nlp = spacy.load("en_core_web_sm")

def extract_keywords(text: str) -> List[str]:
    """
    Extracts keywords from text using spaCy by:
    - Tokenizing the input text into words and punctuation
    - Removing common stopwords like "and", "the", "is"
    - Removing punctuation and non-alphabetic characters
    - Keeping only nouns and proper nouns (to capture tools, titles, skills)
    - Lemmatizing the words to their base forms (e.g. "developing" → "develop")
    - Lowercasing for consistent comparison
    - Removing short words (<=3 characters)
    - Returning a list of unique keywords
    """
    doc = nlp(text)  # Process the text using spaCy’s pipeline

    keywords = [
        token.lemma_.lower()           # Convert to base form and lowercase
        for token in doc
        if token.is_alpha              # Keep only alphabetic words
        and not token.is_stop          # Remove common non-informative words
        and len(token.text) > 3        # Remove short filler words
        and token.pos_ in {"NOUN", "PROPN"}  # Focus on content-rich words
    ]
    return list(set(keywords))  # Remove duplicates by converting to set and back to list

@app.post("/analyze/")
async def analyze_cv(
    # Receive resume and job description as form data fields (strings)
    resume: str = Form(...),
    job_description: str = Form(...)
):
    # Extract keywords from both inputs
    resume_keywords = extract_keywords(resume)
    job_keywords = extract_keywords(job_description)

    # Find keywords in the job description that appear in the resume
    matching = [kw for kw in job_keywords if kw in resume_keywords]

    # Find keywords in the job description missing from the resume
    missing = [kw for kw in job_keywords if kw not in resume_keywords]

    # Return JSON with matching and missing keywords
    return {
        "matching_keywords": matching,
        "missing_keywords": missing
    }
```

---

## What Is spaCy Actually Doing?

spaCy runs a full **natural language processing pipeline** on your input text. Here's a breakdown of what happens:

1. **Tokenization**
   spaCy splits your text into individual "tokens" (words, punctuation, numbers).

2. **Part-of-Speech Tagging**
   Each token is assigned a part of speech (noun, verb, adjective, etc). We filter for **nouns** and **proper nouns**, because these are more likely to be job-relevant (e.g., technologies, job titles, tools).

3. **Lemmatization**
   Words are reduced to their base form. For example:

   * “running”, “ran” → “run”
   * “systems”, “system” → “system”
     This avoids false mismatches due to different word forms.

4. **Stop Word Removal**
   Common English words (like "the", "is", "and") that don’t add value are removed.

5. **Filtering and Deduplication**
   We ignore very short tokens (like “of”, “a”, “by”) and remove duplicates so we return a concise set of keywords.

---

## Step 3: Run Your API Server

Run the server locally with:

```bash
uvicorn main:app --reload
```

* The `--reload` flag auto-restarts the server when you save code changes.
* Your API will be available at: `http://127.0.0.1:8000/analyze/`
* Open `http://127.0.0.1:8000/docs` in your browser to see interactive API docs generated automatically.

---

## Step 4: Test the API Using `curl` and Text Files

Create two simple text files containing sample resume and job description text:

```bash
echo "Experienced backend developer skilled in Python, REST APIs, SQL, and microservices. Worked with AWS and containerization." > resume.txt

echo "Looking for a FastAPI backend engineer with experience in Python, AWS, microservices, and scalable architecture." > job.txt
```

### ✅ Send the text file contents as plain text (not files)

Use shell command substitution to read file contents into the `curl` command:

```bash
# Read file contents into shell variables
RESUME_TEXT=$(<resume.txt)
JOB_TEXT=$(<job.txt)

# Send POST request with the file contents as form data
curl -X POST http://127.0.0.1:8000/analyze/ \
  -F "resume=$RESUME_TEXT" \
  -F "job_description=$JOB_TEXT"
```

This ensures the content is passed as regular form fields (not file uploads), which FastAPI expects with `Form(...)`.

---

### Sample JSON Output

```json
{
  "matching_keywords": [
    "microservice",
    "python",
    "aws"
  ],
  "missing_keywords": [
    "fastapi",
    "engineer",
    "architecture"
  ]
}
```

This output shows which skills or concepts from the job ad are already in the resume — and which are missing.

---

## What Are ATS (Applicant Tracking Systems)?

**Applicant Tracking Systems (ATS)** are software used by companies to filter job applications before a human ever looks at them. An ATS scans your resume to look for **relevant keywords** from the job description.

If your resume doesn’t include enough of the right terms — like “AWS”, “SQL”, or “leadership” — it may be filtered out even if you're well qualified.

This API helps job applicants tailor their resumes to include the right keywords so they stand a better chance of passing these filters.

---

## Limitations & Next Steps

While spaCy keyword extraction is fast and cheap, it has some limitations:

* ❌ **No fuzzy or partial matches**: "PostgreSQL" won’t match "SQL".
* ❌ **No understanding of synonyms**: "project manager" won’t match "team leader".
* ❌ **Ignores context**: If a skill is mentioned in a negative way ("no experience in Kubernetes"), it’s still extracted.

### ✅ Future Improvements

* Create a **web frontend** where users can paste in their resume and a job ad.
* Add **fuzzy matching** using libraries like `fuzzywuzzy` or `difflib`.
* Use **semantic similarity** via **embeddings** (e.g., with `sentence-transformers`).
* Eventually **integrate an LLM** (like GPT or Claude) to provide personalized feedback on tone, completeness, and skill gaps.

---

## Conclusion

This simple FastAPI + spaCy app is a great starting point to help job seekers pass ATS keyword filters by identifying missing skills in their resumes. You now have a working backend that can:

* Accept resume and job description text
* Extract keywords using NLP
* Show matching and missing terms
* Run cheaply and efficiently with no API costs

Next, we’ll build a clean and simple web frontend to make this accessible to real users, and look at enhancing the analysis using LLMs for better matching.

Stay tuned — and happy job hunting! 🧠💼
