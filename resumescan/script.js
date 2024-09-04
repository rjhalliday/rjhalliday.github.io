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

            // Log the result to inspect its structure
            console.log('Full result:', result);

            // Clean and parse the result field
            let cleanedResultString = result.result;
            
            // Remove Markdown code block indicators and extra whitespace
            cleanedResultString = cleanedResultString
                .replace(/^```json\n/, '')  // Remove opening ```json\n
                .replace(/\n```$/, '')      // Remove closing \n```
                .replace(/```/g, '')        // remove globally all ```
                .trim();                    // Trim any extra whitespace

            // Log cleaned JSON string
            console.log('Cleaned JSON String:', cleanedResultString);

            // Parse the cleaned JSON string
            const resultData = JSON.parse(cleanedResultString);

            // Generate HTML table for Keywords and Present
            let tableHTML = '<h2>Result:</h2>';
            tableHTML += '<table border="1"><thead><tr><th>Keyword</th><th>Present</th></tr></thead><tbody>';

            resultData.Keywords.forEach(keyword => {
                tableHTML += `<tr><td>${keyword.Keyword}</td><td>${keyword.Present}</td></tr>`;
            });

            tableHTML += '</tbody></table>';

            // Display the table and summary
            resultDiv.innerHTML = tableHTML + `<h2>Summary:</h2><p>${resultData.Summary}</p>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });
});
