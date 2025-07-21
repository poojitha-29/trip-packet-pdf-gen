
import jsPDF from 'jspdf';

interface DayItinerary {
  day: number;
  morning: string[];
  afternoon: string[];
  meals: string[];
  overnight: string;
  image?: string;
}

interface TourData {
  tourName: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  numTravellers: string;
  costPerPerson: string;
  flightType: 'roundtrip' | 'one-way';
  onwardFlight: {
    airline: string;
    baggage: string;
    departure: string;
    arrival: string;
    route: string;
    note: string;
    cost?: string;
  };
  returnFlight: {
    airline: string;
    baggage: string;
    departure: string;
    arrival: string;
    route: string;
    note: string;
    cost?: string;
  };
  packageType: 'domestic' | 'international';
  landPackageCost: string;
  landPackageNote: string;
  gstPercent: string;
  tcsPercent: string;
  hotelName: string;
  roomType: string;
  itinerary: DayItinerary[];
  inclusions: string[];
  exclusions: string[];
  hotelPolicy: string[];
  cabPolicy: string[];
  contactName: string;
  contactPhone: string;
}

export const generatePDF = async (tourData: TourData, filename: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  
  // Define consistent colors for better UI
  const colors = {
    primary: [41, 128, 185], // Professional blue
    header: [52, 152, 219], // Light blue for all headers
    text: [44, 62, 80], // Dark gray for better readability
    lightGray: [236, 240, 241],
    accent: [241, 196, 15] // Gold accent
  };

  // Helper function to safely get text or return default
  const safeText = (text: string | undefined | null, defaultText: string = '') => {
    if (!text || typeof text !== 'string') return defaultText;
    return text.trim() || defaultText;
  };

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin - 15) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Enhanced section header with consistent styling
  const addSectionHeader = (title: string) => {
    checkPageBreak(18);
    
    yPosition += 8;
    
    // Modern section header with gradient-like effect
    pdf.setFillColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
    
    // Add subtle shadow effect
    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.roundedRect(margin + 1, yPosition + 1, contentWidth, 12, 2, 2, 'F');
    pdf.setFillColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
    
    // Section header text with better positioning
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 8);
    
    yPosition += 20;
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  };

  // Enhanced key-value pair with better alignment
  const addKeyValue = (key: string, value: string, bold: boolean = false, indent: number = 0) => {
    const cleanValue = safeText(value, 'Not specified');
    if (cleanValue === 'Not specified' && !bold) return;
    
    checkPageBreak(10);
    
    const leftMargin = margin + 5 + indent;
    
    // Key styling
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(`${key}:`, leftMargin, yPosition);
    
    // Value styling with proper alignment
    const keyWidth = pdf.getTextWidth(`${key}: `) + 5;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(bold ? 11 : 10);
    
    if (bold) {
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    }
    
    // Better text wrapping
    const maxWidth = contentWidth - keyWidth - 15 - indent;
    const lines = pdf.splitTextToSize(cleanValue, maxWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        checkPageBreak(6);
        yPosition += 6;
      }
      const xPos = i === 0 ? leftMargin + keyWidth : leftMargin + 15;
      pdf.text(lines[i], xPos, yPosition);
    }
    
    yPosition += 8;
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  };

  // Enhanced bullet points with better formatting
  const addBulletPointsFromArray = (items: string[], fontSize: number = 10, indent: number = 0) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    const leftMargin = margin + 8 + indent;
    
    items.forEach((item) => {
      if (!item || !item.trim()) return;
      
      checkPageBreak(8);
      
      // Enhanced bullet point
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.circle(leftMargin, yPosition - 1, 1, 'F');
      
      // Better text positioning and wrapping
      const maxWidth = contentWidth - 25 - indent;
      const lines = pdf.splitTextToSize(item.trim(), maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          checkPageBreak(5);
          yPosition += 5;
        }
        const xPos = leftMargin + 8;
        pdf.text(lines[i], xPos, yPosition);
      }
      
      yPosition += 7;
    });
  };

  // Load and add logo image
  const loadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  // Enhanced Professional Header
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  try {
    // Load and add company logo with better positioning
    const logoDataUrl = await loadImage('/lovable-uploads/884876cc-acf9-45cb-ad4a-c64cc58f497c.png');
    
    // Cleaner circular background for logo
    pdf.setFillColor(255, 255, 255);
    pdf.circle(margin + 12, 20, 10, 'F');
    
    // Better logo positioning
    pdf.addImage(logoDataUrl, 'PNG', margin + 2, 10, 20, 20);
  } catch (error) {
    // Enhanced fallback
    pdf.setFillColor(255, 255, 255);
    pdf.circle(margin + 12, 20, 10, 'F');
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SHPL', margin + 7, 22);
  }
  
  // Enhanced company information
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SANGEETHA HOLIDAYS PRIVATE LIMITED', margin + 30, 16);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Professional Travel Services | Customized Tour Packages', margin + 30, 26);
  
  yPosition = 50;

  // Enhanced Tour Title Section
  pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
  
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const tourTitle = safeText(tourData.tourName, 'Tour Package Details');
  pdf.text(tourTitle, pageWidth / 2, yPosition + 12, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  pdf.text('Complete Travel Itinerary & Package Details', pageWidth / 2, yPosition + 22, { align: 'center' });
  
  yPosition += 38;

  // Trip Overview Section with enhanced styling
  addSectionHeader('TRIP OVERVIEW');
  
  if (tourData.startDate && tourData.endDate) {
    const startDateStr = tourData.startDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const endDateStr = tourData.endDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    addKeyValue('Travel Dates', `${startDateStr} to ${endDateStr}`, true);
  }

  const numTravellers = safeText(tourData.numTravellers);
  if (numTravellers) {
    addKeyValue('Number of Travelers', `${numTravellers} pax`);
  }

  const costPerPerson = safeText(tourData.costPerPerson);
  if (costPerPerson) {
    addKeyValue('Cost per Person', `Rs. ${costPerPerson}`, true);
  }

  // Enhanced Flight Details Section
  const onwardAirline = safeText(tourData.onwardFlight.airline);
  const returnAirline = safeText(tourData.returnFlight.airline);
  
  if (onwardAirline || returnAirline) {
    addSectionHeader('FLIGHT DETAILS');

    if (onwardAirline) {
      // Enhanced subsection header
      pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      pdf.rect(margin + 3, yPosition, contentWidth - 6, 8, 'F');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('OUTBOUND FLIGHT', margin + 8, yPosition + 5.5);
      yPosition += 15;
      
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      addKeyValue('Airline', onwardAirline, false, 5);
      addKeyValue('Route', safeText(tourData.onwardFlight.route), false, 5);
      addKeyValue('Departure', safeText(tourData.onwardFlight.departure), false, 5);
      addKeyValue('Arrival', safeText(tourData.onwardFlight.arrival), false, 5);
      addKeyValue('Baggage', safeText(tourData.onwardFlight.baggage), false, 5);
      
      // Show cost for roundtrip or onward cost for one-way
      if (tourData.flightType === 'roundtrip' && tourData.onwardFlight.cost) {
        addKeyValue('Flight Cost', `Rs. ${tourData.onwardFlight.cost}`, true, 5);
      } else if (tourData.flightType === 'one-way' && tourData.onwardFlight.cost) {
        addKeyValue('Onward Cost', `Rs. ${tourData.onwardFlight.cost}`, true, 5);
      }
      
      const onwardNote = safeText(tourData.onwardFlight.note);
      if (onwardNote) {
        addKeyValue('Note', onwardNote, false, 5);
      }
      yPosition += 5;
    }

    if (returnAirline) {
      // Enhanced subsection header
      pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      pdf.rect(margin + 3, yPosition, contentWidth - 6, 8, 'F');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('RETURN FLIGHT', margin + 8, yPosition + 5.5);
      yPosition += 15;
      
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      addKeyValue('Airline', returnAirline, false, 5);
      addKeyValue('Route', safeText(tourData.returnFlight.route), false, 5);
      addKeyValue('Departure', safeText(tourData.returnFlight.departure), false, 5);
      addKeyValue('Arrival', safeText(tourData.returnFlight.arrival), false, 5);
      addKeyValue('Baggage', safeText(tourData.returnFlight.baggage), false, 5);
      
      // Show return cost only for one-way flights
      if (tourData.flightType === 'one-way' && tourData.returnFlight.cost) {
        addKeyValue('Return Cost', `Rs. ${tourData.returnFlight.cost}`, true, 5);
      }
      
      const returnNote = safeText(tourData.returnFlight.note);
      if (returnNote) {
        addKeyValue('Note', returnNote, false, 5);
      }
    }
  }

  // Enhanced Land Package Section
  const landPackageCost = safeText(tourData.landPackageCost);
  const landPackageNote = safeText(tourData.landPackageNote);
  
  if (landPackageCost || landPackageNote) {
    addSectionHeader('LAND PACKAGE DETAILS');
    
    addKeyValue('Package Type', tourData.packageType.charAt(0).toUpperCase() + tourData.packageType.slice(1), true);
    
    if (landPackageCost) {
      addKeyValue('Land Package Cost', `Rs. ${landPackageCost}`, true);
    }
    
    addKeyValue('GST', `${tourData.gstPercent}%`);
    
    // Show TCS only for international packages
    if (tourData.packageType === 'international') {
      addKeyValue('TCS', `${tourData.tcsPercent}%`);
    }
    
    if (landPackageNote) {
      addKeyValue('Note', landPackageNote);
    }
  }

  // Enhanced Accommodation Section
  const hotelName = safeText(tourData.hotelName);
  if (hotelName) {
    addSectionHeader('ACCOMMODATION');
    addKeyValue('Hotel', hotelName, true);
    addKeyValue('Room Type', safeText(tourData.roomType, 'Standard'));
  }

  // Enhanced Day-wise Itinerary
  if (tourData.itinerary && tourData.itinerary.length > 0) {
    addSectionHeader('DETAILED ITINERARY');

    tourData.itinerary.forEach((day) => {
      checkPageBreak(30);
      
      // Enhanced day header
      pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.roundedRect(margin + 2, yPosition, contentWidth - 4, 10, 2, 2, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`DAY ${day.day}`, margin + 8, yPosition + 6.5);
      
      let dayStartY = yPosition + 18;
      yPosition = dayStartY;
      
      // Check if there's an image for this day
      let imageWidth = 0;
      let imageHeight = 0;
      const hasImage = day.image;
      
      if (hasImage) {
        // Reserve space for image on the right side
        imageWidth = 50;
        imageHeight = 35;
        
        try {
          // Position image on the right side, starting under the day header
          const imageX = pageWidth - margin - imageWidth - 5;
          const imageY = dayStartY;
          pdf.addImage(day.image, 'JPEG', imageX, imageY, imageWidth, imageHeight);
          
          // Add image label
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          pdf.text('Day Image', imageX, imageY + imageHeight + 8);
        } catch (error) {
          console.warn('Could not add image for day', day.day, error);
        }
      }
      
      // Adjust content width to accommodate image
      const textContentWidth = hasImage ? contentWidth - imageWidth - 15 : contentWidth;
      const originalContentWidth = contentWidth;
      
      // Temporarily adjust content width for text
      const adjustedMargin = margin;
      
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

      // Enhanced activity sections with adjusted width
      if (day.morning && day.morning.some(item => item.trim())) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text('Morning:', adjustedMargin + 8, yPosition);
        yPosition += 8;
        
        const morningActivities = day.morning.filter(item => item.trim());
        if (morningActivities.length > 0) {
          // Adjust bullet points to use limited width
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          
          const leftMargin = adjustedMargin + 8 + 5;
          
          morningActivities.forEach((item) => {
            if (!item || !item.trim()) return;
            
            checkPageBreak(8);
            
            // Enhanced bullet point
            pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.circle(leftMargin, yPosition - 1, 1, 'F');
            
            // Better text positioning and wrapping with adjusted width
            const maxWidth = textContentWidth - 25;
            const lines = pdf.splitTextToSize(item.trim(), maxWidth);
            
            for (let i = 0; i < lines.length; i++) {
              if (i > 0) {
                checkPageBreak(5);
                yPosition += 5;
              }
              const xPos = leftMargin + 8;
              pdf.text(lines[i], xPos, yPosition);
            }
            
            yPosition += 7;
          });
        }
        yPosition += 3;
      }

      if (day.afternoon && day.afternoon.some(item => item.trim())) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text('Afternoon/Evening:', adjustedMargin + 8, yPosition);
        yPosition += 8;
        
        const afternoonActivities = day.afternoon.filter(item => item.trim());
        if (afternoonActivities.length > 0) {
          // Adjust bullet points to use limited width
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          
          const leftMargin = adjustedMargin + 8 + 5;
          
          afternoonActivities.forEach((item) => {
            if (!item || !item.trim()) return;
            
            checkPageBreak(8);
            
            // Enhanced bullet point
            pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.circle(leftMargin, yPosition - 1, 1, 'F');
            
            // Better text positioning and wrapping with adjusted width
            const maxWidth = textContentWidth - 25;
            const lines = pdf.splitTextToSize(item.trim(), maxWidth);
            
            for (let i = 0; i < lines.length; i++) {
              if (i > 0) {
                checkPageBreak(5);
                yPosition += 5;
              }
              const xPos = leftMargin + 8;
              pdf.text(lines[i], xPos, yPosition);
            }
            
            yPosition += 7;
          });
        }
        yPosition += 3;
      }

      if (day.meals && day.meals.some(item => item.trim())) {
        const mealItems = day.meals.filter(item => item.trim());
        if (mealItems.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          pdf.text('Meals:', adjustedMargin + 8, yPosition);
          yPosition += 8;
          
          // Adjust bullet points to use limited width
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          
          const leftMargin = adjustedMargin + 8 + 5;
          
          mealItems.forEach((item) => {
            if (!item || !item.trim()) return;
            
            checkPageBreak(8);
            
            // Enhanced bullet point
            pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.circle(leftMargin, yPosition - 1, 1, 'F');
            
            // Better text positioning and wrapping with adjusted width
            const maxWidth = textContentWidth - 25;
            const lines = pdf.splitTextToSize(item.trim(), maxWidth);
            
            for (let i = 0; i < lines.length; i++) {
              if (i > 0) {
                checkPageBreak(5);
                yPosition += 5;
              }
              const xPos = leftMargin + 8;
              pdf.text(lines[i], xPos, yPosition);
            }
            
            yPosition += 7;
          });
          yPosition += 3;
        }
      }

      const overnight = safeText(day.overnight);
      if (overnight) {
        checkPageBreak(10);
        
        const leftMargin = adjustedMargin + 5;
        
        // Key styling
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.text('Stay:', leftMargin, yPosition);
        
        // Value styling with proper alignment and adjusted width
        const keyWidth = pdf.getTextWidth('Stay: ') + 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Better text wrapping with adjusted width
        const maxWidth = textContentWidth - keyWidth - 15;
        const lines = pdf.splitTextToSize(overnight, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) {
            checkPageBreak(6);
            yPosition += 6;
          }
          const xPos = i === 0 ? leftMargin + keyWidth : leftMargin + 15;
          pdf.text(lines[i], xPos, yPosition);
        }
        
        yPosition += 8;
      }

      // Ensure we move past the image if it extends beyond the text
      if (hasImage) {
        const imageEndY = dayStartY + imageHeight + 15;
        if (yPosition < imageEndY) {
          yPosition = imageEndY;
        }
      }

      yPosition += 8;
    });
  }

  // Enhanced Package Inclusions
  if (tourData.inclusions && tourData.inclusions.length > 0) {
    const validInclusions = tourData.inclusions.filter(item => item.trim());
    if (validInclusions.length > 0) {
      addSectionHeader('PACKAGE INCLUSIONS');
      addBulletPointsFromArray(validInclusions, 10);
      yPosition += 6;
    }
  }

  // Enhanced Package Exclusions
  if (tourData.exclusions && tourData.exclusions.length > 0) {
    const validExclusions = tourData.exclusions.filter(item => item.trim());
    if (validExclusions.length > 0) {
      addSectionHeader('PACKAGE EXCLUSIONS');
      addBulletPointsFromArray(validExclusions, 10);
      yPosition += 6;
    }
  }

  // Enhanced Terms & Conditions
  const hasHotelPolicy = tourData.hotelPolicy && tourData.hotelPolicy.some(item => item.trim());
  const hasCabPolicy = tourData.cabPolicy && tourData.cabPolicy.some(item => item.trim());
  
  if (hasHotelPolicy || hasCabPolicy) {
    addSectionHeader('TERMS & CONDITIONS');
    
    if (hasHotelPolicy) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('Hotel Policy:', margin + 8, yPosition);
      yPosition += 10;
      
      const validHotelPolicies = tourData.hotelPolicy.filter(item => item.trim());
      if (validHotelPolicies.length > 0) {
        addBulletPointsFromArray(validHotelPolicies, 9, 5);
      }
      yPosition += 6;
    }

    if (hasCabPolicy) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('Transport Policy:', margin + 8, yPosition);
      yPosition += 10;
      
      const validCabPolicies = tourData.cabPolicy.filter(item => item.trim());
      if (validCabPolicies.length > 0) {
        addBulletPointsFromArray(validCabPolicies, 9, 5);
      }
      yPosition += 6;
    }
  }

  // Enhanced Contact Information
  const contactName = safeText(tourData.contactName);
  const contactPhone = safeText(tourData.contactPhone);
  
  if (contactName || contactPhone) {
    addSectionHeader('CONTACT INFORMATION');
    
    if (contactName) {
      addKeyValue('Contact Person', contactName, true);
    }
    
    if (contactPhone) {
      addKeyValue('Phone', contactPhone, true);
    }
    
    addKeyValue('Email', 'venkatasrikanth@sangeethaholidays.com', true);
    addKeyValue('Website', 'www.sangeethaholidays.com', true);
  }

  // Enhanced Professional Footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Enhanced footer with gradient effect
    pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Footer separator line
    pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Enhanced footer content
    pdf.setFontSize(9);
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFont('helvetica', 'bold');
    
    pdf.text('SANGEETHA HOLIDAYS PRIVATE LIMITED', margin, pageHeight - 10);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  pdf.save(filename);
};
