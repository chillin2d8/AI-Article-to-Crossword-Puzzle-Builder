// This file is a Web Worker and will be run in a separate thread.
// It cannot access the DOM. It uses ES modules, as specified when it's created.
import jsPDF from 'jspdf';

self.addEventListener('message', (e) => {
    const { pageImages, title } = e.data;

    if (!pageImages || !title || !Array.isArray(pageImages)) {
        self.postMessage({ error: 'Invalid data received by worker.' });
        return;
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;

        pageImages.forEach((imageData, index) => {
            if (index > 0) {
                pdf.addPage();
            }
            pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        });

        const pdfBlob = pdf.output('blob');
        
        // Send the generated Blob back to the main thread.
        self.postMessage({ pdfBlob, title });
    } catch (error) {
        // If an error occurs during PDF generation, send the error message back.
        const errorMessage = error instanceof Error ? error.message : 'An unknown worker error occurred.';
        self.postMessage({ error: errorMessage });
    }
});
