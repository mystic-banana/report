/**
 * PDF Utilities for Report Generation
 * Specialized version for HTMLReportViewer component
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PDFOptions {
  pageSize?: 'a4' | 'letter' | 'legal'; 
  orientation?: 'portrait' | 'landscape';
  margin?: number[];
  pageFooter?: boolean;
  enableLinks?: boolean;
  watermark?: string | boolean;
  scale?: number;
  quality?: number; // Added quality parameter for image compression
}

/**
 * Captures an HTML element and generates a downloadable PDF
 */
/**
 * Debug version: logs detailed information about the PDF generation process
 */
export async function captureElementToPDF(
  element: HTMLElement,
  filename: string,
  options: PDFOptions = {}
): Promise<void> {
  if (!element) {
    throw new Error('Element is required for PDF generation');
  }
  
  console.log("Starting PDF generation with html2canvas and jsPDF");
  
  // Default options
  const opts = {
    pageSize: options.pageSize || 'a4',
    orientation: options.orientation || 'portrait',
    margin: options.margin || [10, 10, 10, 10],
    pageFooter: options.pageFooter !== undefined ? options.pageFooter : false,
    enableLinks: options.enableLinks !== undefined ? options.enableLinks : false,
    watermark: options.watermark,
    scale: options.scale || 2
  };
  
  // Get margin values
  const [marginTop, marginRight, marginBottom, marginLeft] = opts.margin;
  
  try {
    // Set up page dimensions based on page size
    let pageWidth: number, pageHeight: number;
    
    if (opts.pageSize === 'letter') {
      pageWidth = 215.9;
      pageHeight = 279.4;
    } else if (opts.pageSize === 'legal') {
      pageWidth = 215.9;
      pageHeight = 355.6;
    } else {
      // Default to A4
      pageWidth = 210;
      pageHeight = 297;
    }
    
    // Swap dimensions for landscape orientation
    if (opts.orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
    
      // Check if element has actual content and dimensions
    if (!element.offsetWidth || !element.offsetHeight) {
      console.error('Element has zero dimensions', {
        width: element.offsetWidth,
        height: element.offsetHeight,
        element
      });
      throw new Error('Element has zero dimensions. Cannot generate PDF from an empty or hidden element.');
    }
    
    console.log('Element dimensions:', {
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      childElementCount: element.childElementCount
    });
    
    // Increase timeout to ensure images are loaded
    console.log('Starting html2canvas capture...');
    
    // Create canvas from HTML with enhanced options
    const canvas = await html2canvas(element, {
      scale: opts.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (clonedDoc) => {
        console.log('Document cloned for PDF generation');
        // Allow more time for images to load in the clone
        const images = clonedDoc.getElementsByTagName('img');
        console.log(`Found ${images.length} images in report`);
        
        // Force all images to complete loading
        Array.from(images).forEach(img => {
          if (!img.complete) {
            console.log('Image not loaded yet:', img.src);
            img.style.visibility = 'hidden'; // Hide non-loaded images
          } else if (img.naturalHeight === 0) {
            console.log('Image loaded but has zero height:', img.src);
            img.style.visibility = 'hidden';
          }
        });
        
        return new Promise(resolve => {
          // Wait a moment to ensure processing happens
          setTimeout(resolve, 500);
        });
      }
    });
    
    // Check if canvas was created successfully
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas generation failed or has zero dimensions', {
        canvas,
        width: canvas?.width || 0,
        height: canvas?.height || 0
      });
      throw new Error('Failed to capture content. The report may have invalid content.');
    }
    
    console.log('Canvas created successfully:', {
      width: canvas.width,
      height: canvas.height
    });
    
    // Calculate dimensions to maintain aspect ratio
    const imgWidth = pageWidth - (marginLeft + marginRight);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Initialize PDF
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.pageSize
    });
    
    // Get image data from canvas with error handling
    let imgData;
    try {
      console.log('Converting canvas to image data...');
      imgData = canvas.toDataURL('image/jpeg', 1.0);
      console.log('Image data generated successfully');
      
      // Quick validation of image data
      if (!imgData || imgData === 'data:,') {
        throw new Error('Generated empty image data');
      }
    } catch (canvasError) {
      console.error('Failed to get image data from canvas:', canvasError);
      throw new Error('Failed to process report content for PDF. Try again with a simpler report.');
    }
    
    // Calculate how many pages we need
    const pagesNeeded = Math.ceil(imgHeight / (pageHeight - (marginTop + marginBottom)));
    console.log(`Content requires ${pagesNeeded} pages`);
    
    // Add content to first page
    pdf.addImage(
      imgData,
      'JPEG',
      marginLeft,
      marginTop,
      imgWidth,
      imgHeight
    );
    
    // Add watermark if specified
    if (opts.watermark) {
      const watermarkText = typeof opts.watermark === 'string' 
        ? opts.watermark 
        : 'Generated by Mystic Banana';
        
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(14);
      pdf.text(
        watermarkText,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center', angle: 45 }
      );
    }
    
    // Add page numbers if requested
    if (opts.pageFooter) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Page 1 of ${pagesNeeded}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }
    
    // Add additional pages if content doesn't fit on one page
    let position = 0;
    for (let i = 1; i < pagesNeeded; i++) {
      position = -(pageHeight * i);
      
      pdf.addPage();
      pdf.addImage(
        imgData,
        'JPEG',
        marginLeft,
        position + marginTop,
        imgWidth,
        imgHeight
      );
      
      // Add watermark to each page if specified
      if (opts.watermark) {
        const watermarkText = typeof opts.watermark === 'string' 
          ? opts.watermark 
          : 'Generated by Mystic Banana';
          
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(14);
        pdf.text(
          watermarkText,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center', angle: 45 }
        );
      }
      
      // Add page number to each page if requested
      if (opts.pageFooter) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${i + 1} of ${pagesNeeded}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    }
    
    // Ensure filename has .pdf extension
    const filenameWithExt = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Save PDF and trigger download
    console.log(`PDF generation complete, saving as ${filenameWithExt}`);
    pdf.save(filenameWithExt);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PDF generation stack:', new Error().stack);
    
    // Log browser information for debugging
    console.error('Browser information:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      memory: (navigator as any).deviceMemory,
      screenSize: `${window.screen.width}x${window.screen.height}`
    });
    
    throw new Error(`PDF generation failed: ${errorMessage}`);
  }
}
