document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('job-resume-form');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const formContainer = document.getElementById('form-container');
    const resultContainer = document.getElementById('result-container');
    const jobDescriptionText = document.getElementById('job-description-text');
    const resumeText = document.getElementById('resume-text');
    const jobDescriptionFile = document.getElementById('job-description-file');
    const resumeFile = document.getElementById('resume-file');
    const clearJobFileButton = document.getElementById('clear-job-file');
    const clearResumeFileButton = document.getElementById('clear-resume-file');
    const clearResultsButton = document.getElementById('clear-results-button');

    function toggleInputs() {
        const isJobFileSelected = jobDescriptionFile.files.length > 0;
        const isResumeFileSelected = resumeFile.files.length > 0;

        jobDescriptionText.disabled = isJobFileSelected;
        resumeText.disabled = isResumeFileSelected;

        if (isJobFileSelected) jobDescriptionText.value = '';
        if (isResumeFileSelected) resumeText.value = '';
    }

    jobDescriptionFile.addEventListener('change', toggleInputs);
    resumeFile.addEventListener('change', toggleInputs);

    clearJobFileButton.addEventListener('click', () => {
        jobDescriptionFile.value = '';
        toggleInputs();
    });

    clearResumeFileButton.addEventListener('click', () => {
        resumeFile.value = '';
        toggleInputs();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        loadingDiv.style.display = 'block';
        formContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultDiv.innerHTML = '';

        const jobDescription = jobDescriptionFile.files.length > 0 ? await extractTextFromPDF(jobDescriptionFile.files[0]) : jobDescriptionText.value;
        const resume = resumeFile.files.length > 0 ? await extractTextFromPDF(resumeFile.files[0]) : resumeText.value;

        try {
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

            const result = await response.json();
            console.log('Full result:', result);

            let cleanedResultString = result.result
                .replace(/^```json\n/, '')
                .replace(/\n```$/, '')
                .replace(/```/g, '')
                .trim();

            console.log('Cleaned JSON String:', cleanedResultString);

            const resultData = JSON.parse(cleanedResultString);

            let tableHTML = '<h2>Result:</h2>';
            tableHTML += '<table><thead><tr><th>Keyword</th><th>Present</th></tr></thead><tbody>';

            resultData.Keywords.forEach(keyword => {
                tableHTML += `<tr><td>${keyword.Keyword}</td><td>${keyword.Present}</td></tr>`;
            });

            tableHTML += '</tbody></table>';
            resultDiv.innerHTML = tableHTML + `<h2>Summary:</h2><p>${resultData.Summary}</p>`;
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        } finally {
            loadingDiv.style.display = 'none';
        }
    });

    clearResultsButton.addEventListener('click', () => {
        formContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        jobDescriptionText.value = '';
        resumeText.value = '';
        jobDescriptionFile.value = '';
        resumeFile.value = '';
    });

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
