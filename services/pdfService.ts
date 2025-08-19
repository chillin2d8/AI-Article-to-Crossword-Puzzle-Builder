import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoryPage } from '../components/pdf/StoryPage';
import { PuzzlePage } from '../components/pdf/PuzzlePage';
import type { GeneratedData } from '../types';

const renderComponentToDiv = (
    id: string, 
    component: React.ComponentType<any>, 
    props: any
): Promise<HTMLDivElement> => {
    return new Promise((resolve) => {
        let container = document.getElementById(id) as HTMLDivElement;
        if (!container) {
            container = document.createElement('div');
            container.id = id;
            Object.assign(container.style, {
                position: 'absolute',
                left: '-9999px',
                top: '0px',
                width: '210mm',
                height: '297mm',
                backgroundColor: 'white',
                padding: '12.7mm'
            });
            document.body.appendChild(container);
        }
        
        const root = createRoot(container);
        // Use a short timeout to ensure the component and its assets (like images) have a moment to render
        root.render(React.createElement(component, props));
        setTimeout(() => resolve(container), 500);
    });
};

const cleanupDiv = (id: string) => {
    const container = document.getElementById(id);
    if (container) {
        // Proper cleanup for React 18
        // No direct unmount, just remove the container
        document.body.removeChild(container);
    }
}

export const generatePdf = async (data: GeneratedData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    try {
        // Page 1: Story
        const storyContainer = await renderComponentToDiv('pdf-story-container', StoryPage, { data });
        const storyCanvas = await html2canvas(storyContainer, { scale: 2 });
        const storyImgData = storyCanvas.toDataURL('image/png');
        pdf.addImage(storyImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        cleanupDiv('pdf-story-container');

        // Page 2: Puzzle
        pdf.addPage();
        const puzzleContainer = await renderComponentToDiv('pdf-puzzle-container', PuzzlePage, { data, showSolutions: false });
        const puzzleCanvas = await html2canvas(puzzleContainer, { scale: 2 });
        const puzzleImgData = puzzleCanvas.toDataURL('image/png');
        pdf.addImage(puzzleImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        cleanupDiv('pdf-puzzle-container');
        
        // Page 3: Solution
        pdf.addPage();
        const solutionContainer = await renderComponentToDiv('pdf-solution-container', PuzzlePage, { data, showSolutions: true });
        const solutionCanvas = await html2canvas(solutionContainer, { scale: 2 });
        const solutionImgData = solutionCanvas.toDataURL('image/png');
        pdf.addImage(solutionImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        cleanupDiv('pdf-solution-container');

        pdf.save(`${data.title.replace(/\s+/g, '-')}-activity.pdf`);

    } catch(err) {
        console.error("Error in PDF generation process:", err);
        // Cleanup in case of error
        cleanupDiv('pdf-story-container');
        cleanupDiv('pdf-puzzle-container');
        cleanupDiv('pdf-solution-container');
        throw err; // re-throw to be caught by the caller
    }
};