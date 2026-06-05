import { createRoot } from 'react-dom/client';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { PdfTemplate } from './PdfTemplate';
import React from 'react';

export const exportToPDF = async (
  transactions: any[],
  categories: any[],
  language: 'bn' | 'en',
  currency: string,
  startDate?: string,
  endDate?: string,
  typeFilter?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 1. Create a hidden container for rendering the PDF template
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    // Essential for correct html2canvas rendering
    container.style.width = '794px'; 
    document.body.appendChild(container);

    const root = createRoot(container);

    const onReady = async () => {
      try {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pages = container.querySelectorAll('.pdf-page');

        if (pages.length === 0) {
          throw new Error('No pages generated');
        }

        for (let i = 0; i < pages.length; i++) {
          if (i > 0) {
            doc.addPage();
          }
          const pageEl = pages[i] as HTMLElement;
          // Capture the page as a JPEG data URL
          const imgData = await toJpeg(pageEl, { 
            quality: 1.0, 
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          // Standard A4 dimensions in points
          doc.addImage(imgData, 'JPEG', 0, 0, 595.28, 841.89);
        }

        // Trigger download
        const timestamp = new Date().getTime();
        doc.save(`financial_report_\${timestamp}.pdf`);
        
        // Cleanup
        root.unmount();
        document.body.removeChild(container);
        resolve();
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    };

    // Render the React component into the hidden container
    root.render(
      React.createElement(PdfTemplate, {
        transactions,
        categories,
        language,
        currency,
        startDate,
        endDate,
        typeFilter,
        onReady
      })
    );
  });
};

