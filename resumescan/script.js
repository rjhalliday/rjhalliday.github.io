document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('job-resume-form');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const jobDescriptionText = document.getElementById('job-description-text');
    const resumeText = document.getElementById('resume-text');
    const jobDescriptionFile = document.getElementById('job-description-file');
    const resumeFile = document.getElementById('resume-file');
    const clearJobFileButton = document.getElementById('clear-job-file');
    const clearResumeFileButton = document.getElementById('clear-resume-file');

    // Function to toggle input fields based on file selection
    function toggleInputs() {
        const isJobFileSelected = jobDescriptionFile.files.length > 0;
        const isResumeFileSelected = resumeFile.files.length > 0;

        // Disable or enable text areas based on file selection
        jobDescriptionText.disabled = isJobFileSelected;
        resumeText.disabled = isResumeFileSelected;

        // Clear text areas if a file is selected
        if (isJobFileSelected) jobDescriptionText.value = '';
        if (isResumeFileSelected) resumeText.value = '';
    }

    // Attach change event listeners to file inputs
    jobDescriptionFile.addEventListener('change', toggleInputs);
    resumeFile.addEventListener('change', toggleInputs);

    // Attach event listeners to clear file buttons
    clearJobFileButton.addEventListener('click', () => {
        jobDescriptionFile.value = ''; // Clear the file input
        toggleInputs(); // Re-enable the text area
    });

    clearResumeFileButton.addEventListener('click', () => {
        resumeFile.value = ''; // Clear the file input
        toggleInputs(); // Re-enable the text area
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Show the loading spinner
        loadingDiv.style.display = 'block';
        loadingDiv.innerHTML = '<div class="spinner"></div>';  // Spinner animation
        resultDiv.innerHTML = '';

        // Get the text and file inputs
        const jobDescription = jobDescriptionFile.files.length > 0 ? await extractTextFromPDF(jobDescriptionFile.files[0]) : jobDescriptionText.value;
        const resume = resumeFile.files.length > 0 ? await extractTextFromPDF(resumeFile.files[0]) : resumeText.value;

        try {
            // Send the data to the AWS Lambda function
            const response = await fetch('https://nju22qnpxtmdbowim6nbsocb2e0burhh.lambda-url.us-east-1.on.aws/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_description: jobDescription,
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
            tableHTML += '<table><thead><tr><th>Keyword</th><th>Present</th></tr></thead><tbody>';

            resultData.Keywords.forEach(keyword => {
                tableHTML += `<tr><td>${keyword.Keyword}</td><td>${keyword.Present}</td></tr>`;
            });

            tableHTML += '</tbody></table>';

            // Display the table and summary
            resultDiv.innerHTML = tableHTML + `<h2>Summary:</h2><p>${resultData.Summary}</p>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        } finally {
            // Hide the loading spinner
            loadingDiv.style.display = 'none';
        }
    });

    // Function to read PDF files and extract text
    async function extractTextFromPDF(file) {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        let text = '';
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ');
        }
        return text;
    }
});
