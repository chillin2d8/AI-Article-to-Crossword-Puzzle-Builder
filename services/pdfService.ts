import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoryPage } from '../components/pdf/StoryPage';
import { PuzzlePage } from '../components/pdf/PuzzlePage';
import { GeneratedData, PdfGenerationError, UserTier } from '../types';
import { editForFit } from './geminiService';
import jsPDF from 'jspdf';
import { STATIC_FALLBACK_IMAGE_DATA_URI } from '../config';

const CORS_PROXY = 'https://corsproxy.io/?';

const fetchWithTimeout = (
    resource: RequestInfo | URL,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> => {
    const { timeout = 15000 } = options; // 15-second timeout for fetching images
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const request = fetch(resource, {
        ...options,
        signal: controller.signal
    });

    return new Promise((resolve, reject) => {
        request.then(response => {
            clearTimeout(id);
            resolve(response);
        }).catch(error => {
            clearTimeout(id);
            reject(error);
        });
    });
};

const convertUrlToDataUri = async (url: string): Promise<string> => {
    if (url.startsWith('data:image')) {
        return url;
    }
    const response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch image via proxy: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
};

const getSafeImageUrls = async (
    imageUrlOne: string,
    imageUrlTwo: string,
    updateProgress: (message: string) => void
): Promise<{ safeUrlOne: string, safeUrlTwo: string }> => {
    updateProgress('Processing images...');
    const results = await Promise.allSettled([
        convertUrlToDataUri(imageUrlOne),
        convertUrlToDataUri(imageUrlTwo)
    ]);

    const safeUrlOne = results[0].status === 'fulfilled' ? results[0].value : STATIC_FALLBACK_IMAGE_DATA_URI;
    const safeUrlTwo = results[1].status === 'fulfilled' ? results[1].value : STATIC_FALLBACK_IMAGE_DATA_URI;

    if (results[0].status === 'rejected') {
        console.warn('Failed to process summary image, using fallback.', results[0].reason);
    }
    if (results[1].status === 'rejected') {
        console.warn('Failed to process puzzle image, using fallback.', results[1].reason);
    }
    
    updateProgress('Images processed successfully.');
    return { safeUrlOne, safeUrlTwo };
};


const validateKeywords = (text: string, keywords: string[]): boolean => {
    const lowerCaseText = text.toLowerCase();
    for (const keyword of keywords) {
        if (!lowerCaseText.includes(keyword.toLowerCase())) {
            console.warn(`Validation failed: Keyword "${keyword}" not found in shortened summary.`);
            return false;
        }
    }
    return true;
};

const waitForPaint = (): Promise<void> => {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
};

const waitForImagesInContainer = (container: HTMLElement): Promise<void[]> => {
    const images = Array.from(container.getElementsByTagName('img'));
    if (images.length === 0) {
        return Promise.resolve([]);
    }
    const promises = images.map(img => new Promise<void>((resolve, reject) => {
        if (img.complete) {
            resolve();
        } else {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`An image failed to load for the PDF: ${img.src.substring(0, 100)}`));
        }
    }));
    return Promise.all(promises);
};


const renderComponentToDiv = (
    id: string, 
    component: React.ComponentType<any>, 
    props: any
): { container: HTMLDivElement, unmount: () => void } => {
    let container = document.getElementById(id) as HTMLDivElement;
    if (container) {
        const root = (container as any)._reactRootContainer;
        if (root) {
            root.unmount();
        }
        container.innerHTML = '';
    } else {
        container = document.createElement('div');
        container.id = id;
        Object.assign(container.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0px',
            width: '210mm',
            height: '297mm',
            backgroundColor: 'white',
            padding: '12.7mm',
            boxSizing: 'border-box'
        });
        document.body.appendChild(container);
    }
    
    const root = createRoot(container);
    root.render(React.createElement(component, props));
    
    const unmount = () => {
        root.unmount();
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    };
    
    return { container, unmount };
};


const renderComponentToCanvas = async (
    id: string,
    component: React.ComponentType<any>,
    props: any
): Promise<HTMLCanvasElement> => {
    let unmount: (() => void) | null = null;
    try {
        const { container, unmount: unmountFn } = renderComponentToDiv(id, component, props);
        unmount = unmountFn;
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        await waitForImagesInContainer(container);

        await waitForPaint();
        
        const canvas = await html2canvas(container, { scale: 2 });
        return canvas;
    } finally {
        if (unmount) {
            unmount();
        }
    }
};

const assemblePdfOnMainThread = (pageImages: string[], title: string): Blob => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;

    pageImages.forEach((imageData, index) => {
        if (index > 0) {
            pdf.addPage();
        }
        pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });

    return pdf.output('blob');
};

const downloadPdfBlob = (pdfBlob: Blob, title: string) => {
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${title.replace(/\s+/g, '-')}-activity.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(pdfUrl);
};

export const generatePdf = async (data: GeneratedData, tier: UserTier, setLoadingMessage: (message: string) => void): Promise<void> => {
    try {
        setLoadingMessage('Preparing PDF pages...');

        const { safeUrlOne, safeUrlTwo } = await getSafeImageUrls(
            data.imageUrlOne,
            data.imageUrlTwo,
            setLoadingMessage
        );
        
        const safeData = { 
            ...data,
            imageUrlOne: safeUrlOne,
            imageUrlTwo: safeUrlTwo,
        };
        
        const localPageImages: string[] = [];
        const title = data.title;
        
        setLoadingMessage('Generating story page (1/3)...');
        let storyData = { ...safeData };
        
        const { container: checkContainer, unmount: unmountCheck } = renderComponentToDiv('pdf-story-container-check', StoryPage, { data: storyData, tier: tier });
        await new Promise(resolve => setTimeout(resolve, 100));
        const needsShortening = checkContainer.scrollHeight > checkContainer.clientHeight;
        unmountCheck();

        if (needsShortening) {
            setLoadingMessage("Summary is long, asking AI editor to shorten it...");
            const keywordsToPreserve = storyData.gridData.placedWords.map(word => word.word);
            const shorterSummary = await editForFit(storyData.summary, keywordsToPreserve, storyData.gradeLevel);

            if (validateKeywords(shorterSummary, keywordsToPreserve)) {
                storyData.summary = shorterSummary;
            } else {
                console.warn("AI Typesetter failed to preserve all keywords. Using original summary to maintain data integrity.");
                setLoadingMessage("Warning: AI editor failed. Using original summary.");
                await new Promise(res => setTimeout(res, 2000));
            }
        }
        
        const storyCanvas = await renderComponentToCanvas('pdf-story-container', StoryPage, { data: storyData, tier: tier });
        localPageImages.push(storyCanvas.toDataURL('image/png'));

        if (data.gridData.placedWords.length > 0) {
            setLoadingMessage('Generating puzzle page (2/3)...');
            const puzzleCanvas = await renderComponentToCanvas('pdf-puzzle-container', PuzzlePage, { data: safeData, showSolutions: false, tier: tier });
            localPageImages.push(puzzleCanvas.toDataURL('image/png'));
        
            setLoadingMessage('Generating solution page (3/3)...');
            const solutionCanvas = await renderComponentToCanvas('pdf-solution-container', PuzzlePage, { data: safeData, showSolutions: true, tier: tier });
            localPageImages.push(solutionCanvas.toDataURL('image/png'));
        }
        
        setLoadingMessage('Assembling PDF... (UI may freeze)');
        const pdfBlob = assemblePdfOnMainThread(localPageImages, title);
        downloadPdfBlob(pdfBlob, title);

    } catch(err) {
        console.error("Error during PDF generation:", err);
        throw new PdfGenerationError("Sorry, there was a problem creating the PDF. Please try again.", { cause: err as Error });
    }
};