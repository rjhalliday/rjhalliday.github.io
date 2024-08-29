document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('job-resume-form');
    const resultDiv = document.getElementById('result');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get the values from the form
        const jobDescription = document.getElementById('job-description').value;
        const resume = document.getElementById('resume').value;

        try {
            // Send the data to the AWS Lambda function
            const response = await fetch('https://your-api-gateway-endpoint.amazonaws.com/dev/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jobDescription,
                    resume
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            // Get the result from the response
            const result = await response.json();

            // Display the result
            resultDiv.innerHTML = `<h2>Result:</h2><pre>${JSON.stringify(result, null, 2)}</pre>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });
});
