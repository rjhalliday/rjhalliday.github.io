---
layout: default
title: "Building My Own Resume Scanner: A Personal Journey from Frugality to Functionality"
date: 2024-09-04 22:00:00 +1000
categories: [projects]
tags: [aws, python, docker, langchain, llm]
---

## Building My Own Resume Scanner: A Personal Journey from Frugality to Functionality

Hey everyone,

I’m thrilled to share a project that’s been a game-changer for me—building my own resume scanner. This project was born out of a simple need: to optimise my CV to stand out in the competitive job market and pass through Applicant Tracking Systems (ATS). After evaluating commercial solutions like Jobscan.co, which charges $50 per month, I decided to take matters into my own hands. Here’s how I built a resume scanner using AWS Lambda, Python, and some cutting-edge tech, and why this journey was so worthwhile.

### Why Build My Own Scanner?

If you’re not familiar, Applicant Tracking Systems (ATS) are used by employers to screen job applications. These systems scan resumes for specific keywords and phrases that match the job description. If your resume doesn’t include the right terms, it might never reach human eyes, no matter how qualified you are. I wanted a way to make sure my resume was optimised for these systems without shelling out $50 a month for a commercial tool. 

### The Tech Stack

Here’s a look at the technologies I used to build my resume scanner:

1. **AWS Lambda**: For serverless computing that allows me to run code in response to events, without managing servers.
2. **Python**: The language used to script the Lambda function.
3. **LangChain and Google Gemini**: These are the tools for natural language processing (NLP) that handle the text extraction and comparison.
4. **Docker**: To manage the size limitations of Lambda layers, I built a custom Docker image.
5. **JavaScript, HTML, and CSS**: For crafting the frontend interface.

### Overcoming Size Limits with Docker

One of the main hurdles I faced was AWS Lambda’s 250MB deployment package limit. LangChain and Google Gemini libraries are essential for NLP but are quite large. To overcome this, I opted for Docker. Here’s how it worked:

1. **Creating the Docker Image**: I designed a Dockerfile that included all the necessary libraries and set up the environment for running the Lambda function. This Docker image was then uploaded to AWS Elastic Container Registry (ECR).

2. **Configuring Lambda**: I configured my Lambda function to use the Docker image from ECR. This setup allowed me to bypass the usual Lambda deployment package constraints and manage everything in a more flexible way.

### The Two-Stage Processing

The resume scanner operates in a two-stage process:

1. **Keyword Extraction**: First, I use LangChain and Google Gemini to pull out keywords from the job description. This step involves parsing the job description to identify critical terms and phrases that are important for the role.

2. **Keyword Matching**: Next, I use the LLM to check if these keywords appear in the resume text. The model provides a simple yes/no answer for each keyword, helping me understand how well my resume aligns with the job description.

This approach ensures that the keyword extraction is accurate and that the keyword matching process is efficient.

### Designing the Frontend

For the frontend, I used JavaScript, HTML, and CSS to build a clean and user-friendly interface. Users can upload their resume and job description or paste them directly into the text areas. The frontend sends these inputs to the backend Lambda function, retrieves the results, and displays them in an easy-to-read format.

### Challenges and Insights

- **Managing Large Libraries**: The biggest challenge was dealing with the size of the libraries needed for NLP. Docker was crucial in solving this issue, though it did add complexity to the deployment process.

- **Accurate Keyword Extraction**: Fine-tuning the prompts used with the LLM for accurate keyword extraction was a balancing act between precision and performance.

- **User-Friendly Design**: Ensuring the frontend was both functional and visually appealing was key to making the tool accessible and easy to use.

### Conclusion

Building this resume scanner was a rewarding experience that combined cloud computing, natural language processing, and frontend development. It allowed me to optimise my CV to get past ATS and avoid recurring subscription costs. If you’re looking to improve your resume’s chances in the job market, or if you’re simply interested in the tech behind such tools, I hope this post provides some valuable insights.

Feel free to reach out if you have questions or want to discuss similar projects. I’d love to hear from you!

You can find the final solution [here](/resumescan/index.html)

Give it a try and tell me what you think.
