document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('job-resume-form');
    const resultDiv = document.getElementById('result');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get the values from the form
        const job_description = document.getElementById('job-description').value;
        const resume = document.getElementById('resume').value;

        try {
            // Send the data to the AWS Lambda function
            const response = await fetch('https://nju22qnpxtmdbowim6nbsocb2e0burhh.lambda-url.us-east-1.on.aws/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_description: job_description,
                    resume: resume
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            // Get the result from the response
            const result = await response.json();

            // Extract and display the result and summary
            const resultText = result.result; // the result string
            const summaryMatch = resultText.match(/"Summary":\s*"([^"]*)"/);
            const summary = summaryMatch ? summaryMatch[1] : 'No summary found';

            // Display the summary
            resultDiv.innerHTML = `
                <h2>Result:</h2>
                <pre>${resultText}</pre>
                <h2>Summary:</h2>
                <p>${summary}</p>
            `;

            // Display the result
            //resultDiv.innerHTML = `<h2>Result:</h2><pre>${JSON.stringify(result, null, 2)}</pre>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });
});
