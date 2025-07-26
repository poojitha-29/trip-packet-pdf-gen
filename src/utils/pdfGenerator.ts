import jsPDF from 'jspdf';

interface DayItinerary {
  day: number;
  title: string;
  description: string;
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
  numPlaces: number;
  places: string[];
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
  numHotels: number;
  hotels: { name: string; roomType: string }[];
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

  const colors = {
    primary: [41, 128, 185], // Professional blue
    header: [52, 152, 219], // Light blue for all headers
    text: [44, 62, 80], // Dark gray for better readability
    lightGray: [236, 240, 241],
    accent: [241, 196, 15] // Gold accent
  };

  // Helper to safely get string or default
  const safeText = (text: string | undefined | null, defaultText: string = '') => {
    if (!text || typeof text !== 'string') return defaultText;
    return text.trim() || defaultText;
  };

  // Check and add new page if requiredHeight exceeds space
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin - 15) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Section header styling
  const addSectionHeader = (title: string) => {
    checkPageBreak(18);

    yPosition += 8;

    pdf.setFillColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');

    pdf.setFillColor(0, 0, 0, 0.1);
    pdf.roundedRect(margin + 1, yPosition + 1, contentWidth, 12, 2, 2, 'F');
    pdf.setFillColor(colors.header[0], colors.header[1], colors.header[2]);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, yPosition + 8);

    yPosition += 20;
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  };

  // Key-Value pair display
  const addKeyValue = (key: string, value: string, bold: boolean = false, indent: number = 0) => {
    const cleanValue = safeText(value, 'Not specified');
    if (cleanValue === 'Not specified' && !bold) return;

    checkPageBreak(10);

    const leftMargin = margin + 5 + indent;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(`${key}:`, leftMargin, yPosition);

    const keyWidth = pdf.getTextWidth(`${key}: `) + 5;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(bold ? 11 : 10);

    if (bold) {
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    }

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

  // Bullet points list display
  const addBulletPointsFromArray = (items: string[], fontSize: number = 10, indent: number = 0) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    const leftMargin = margin + 8 + indent;

    items.forEach((item) => {
      if (!item || !item.trim()) return;

      checkPageBreak(8);

      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.circle(leftMargin, yPosition - 1, 1, 'F');

      const maxWidth = contentWidth - 25 - indent;
      const lines = pdf.splitTextToSize(item.trim(), maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          checkPageBreak(5);
          yPosition += 5;
        }
        pdf.text(lines[i], leftMargin + 8, yPosition);
      }

      yPosition += 7;
    });
  };

  // Load logo img helper
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

  // Draw professional header
  pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  try {
    const logo = await loadImage(`${import.meta.env.BASE_URL}logo.png`);
    pdf.addImage(logo, 'PNG', margin + 2, 10, 20, 20);
  } catch {
    pdf.setFillColor(255, 255, 255);
    pdf.circle(margin + 12, 20, 10, 'F');
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SHPL', margin + 7, 22);
  }

  // Company info
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SANGEETHA HOLIDAYS PRIVATE LIMITED', margin + 30, 16);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Professional Travel Services | Customized Tour Packages', margin + 30, 26);

  yPosition = 50;

  // Tour Title Section
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

  // Trip Overview
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
  if (numTravellers) addKeyValue('Number of Travelers', `${numTravellers} pax`);

  const costPerPerson = safeText(tourData.costPerPerson);
  if (costPerPerson) addKeyValue('Cost per Person', `Rs. ${costPerPerson}`, true);

  if (tourData.places && tourData.places.length > 0) {
    const validPlaces = tourData.places.filter((p) => p.trim());
    if (validPlaces.length > 0) addKeyValue('Places to Visit', validPlaces.join(', '));
  }

  // Flight Details
  const onwardAirline = safeText(tourData.onwardFlight.airline);
  const returnAirline = safeText(tourData.returnFlight.airline);

  if (onwardAirline || returnAirline) {
    addSectionHeader('FLIGHT DETAILS');

    if (onwardAirline) {
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

      if (tourData.flightType === 'roundtrip' && tourData.onwardFlight.cost) {
        addKeyValue('Flight Cost', `Rs. ${tourData.onwardFlight.cost}`, true, 5);
      } else if (tourData.flightType === 'one-way' && tourData.onwardFlight.cost) {
        addKeyValue('Onward Cost', `Rs. ${tourData.onwardFlight.cost}`, true, 5);
      }

      const onwardNote = safeText(tourData.onwardFlight.note);
      if (onwardNote) addKeyValue('Note', onwardNote, false, 5);
      yPosition += 5;
    }

    if (returnAirline) {
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

      if (tourData.flightType === 'one-way' && tourData.returnFlight.cost) {
        addKeyValue('Return Cost', `Rs. ${tourData.returnFlight.cost}`, true, 5);
      }

      const returnNote = safeText(tourData.returnFlight.note);
      if (returnNote) addKeyValue('Note', returnNote, false, 5);
    }
  }

  // Land Package Section
  const landPackageCost = safeText(tourData.landPackageCost);
  const landPackageNote = safeText(tourData.landPackageNote);

  if (landPackageCost || landPackageNote) {
    addSectionHeader('LAND PACKAGE DETAILS');
    addKeyValue('Package Type', tourData.packageType.charAt(0).toUpperCase() + tourData.packageType.slice(1), true);
    if (landPackageCost) addKeyValue('Land Package Cost', `Rs. ${landPackageCost}`, true);
    addKeyValue('GST', `${tourData.gstPercent}%`);
    if (tourData.packageType === 'international') {
      addKeyValue('TCS', `${tourData.tcsPercent}%`);
    }
    if (landPackageNote) addKeyValue('Note', landPackageNote);
  }

  // Accommodation Section
  const hotelName = safeText(tourData.hotelName);
  const hasHotels = tourData.hotels && tourData.hotels.length > 0 && tourData.hotels.some(h => h.name.trim());

  if (hotelName || hasHotels) {
    addSectionHeader('ACCOMMODATION');

    if (hasHotels) {
      tourData.hotels.forEach((hotel, idx) => {
        if (hotel.name.trim()) {
          addKeyValue(`Hotel ${idx + 1}`, hotel.name, true);
          if (hotel.roomType.trim()) addKeyValue('Room Type', hotel.roomType);
          if (idx < tourData.hotels.length - 1) yPosition += 3;
        }
      });
    } else {
      addKeyValue('Hotel', hotelName, true);
      addKeyValue('Room Type', safeText(tourData.roomType, 'Standard'));
    }
  }

  // ===========================
  // DETAILED ITINERARY - SMART PAGE BREAKS
  // ===========================

  if (tourData.itinerary && tourData.itinerary.length > 0) {
    addSectionHeader('DETAILED ITINERARY');

    tourData.itinerary.forEach((day) => {
      // Calculate approx required height for header + title to decide if page break needed
      const dayHeaderHeight = 18; // approx for DAY X header + padding
      const hasTitle = !!day.title && day.title.trim().length > 0;
      const titleLines = hasTitle ? pdf.splitTextToSize(day.title.trim(), contentWidth - 10) : [];
      const titleHeight = titleLines.length * 6 + (hasTitle ? 4 : 0); // lines * lineHeight + margin

      // Minimum content height estimate (header + title + some space)
      const estimatedHeight = dayHeaderHeight + titleHeight + 10;

      checkPageBreak(estimatedHeight);

      // DAY HEADER
      pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.roundedRect(margin + 2, yPosition, contentWidth - 4, 10, 2, 2, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`DAY ${day.day}`, margin + 8, yPosition + 6.5);

      yPosition += 15;

      // DAY TITLE
      if (hasTitle) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);

        for (const line of titleLines) {
          pdf.text(line, margin + 8, yPosition);
          yPosition += 6;
        }
        yPosition += 4;
      }

      // IMAGE if exists
      let imageWidth = 0, imageHeight = 0;
      if (day.image) {
        imageWidth = 50;
        imageHeight = 35;
        try {
          const imageX = pageWidth - margin - imageWidth - 5;
          const imageY = yPosition;
          pdf.addImage(day.image, 'JPEG', imageX, imageY, imageWidth, imageHeight);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          pdf.text('Day Image', imageX, imageY + imageHeight + 8);
        } catch {
          // ignore loading errors
        }
      }

      const textContentWidth = imageWidth ? contentWidth - imageWidth - 15 : contentWidth;

      // DESCRIPTION
      if (day.description && day.description.trim().length > 0) {
        const descriptionLines = pdf.splitTextToSize(day.description.trim(), textContentWidth - 15);
        const descHeight = descriptionLines.length * 5 + 8 + 3; // text lines + title label + spacing
        checkPageBreak(descHeight);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text('Description:', margin + 8, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        descriptionLines.forEach(line => {
          pdf.text(line, margin + 8, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }

      // MEALS
      if (day.meals && day.meals.length > 0) {
        const mealsText = day.meals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
        const mealsLines = pdf.splitTextToSize(mealsText, textContentWidth - 15);
        const mealsHeight = mealsLines.length * 5 + 8 + 3;
        checkPageBreak(mealsHeight);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text('Meals:', margin + 8, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        mealsLines.forEach(line => {
          pdf.text(line, margin + 8, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }

      // OVERNIGHT/STAY
      const overnight = safeText(day.overnight);
      if (overnight) {
        const posLeft = margin + 5;
        const overnightLines = pdf.splitTextToSize(overnight, textContentWidth - pdf.getTextWidth('Stay: ') - 15);
        const overnightHeight = overnightLines.length * 5 + 8;
        checkPageBreak(overnightHeight);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.text('Stay:', posLeft, yPosition);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        overnightLines.forEach((line, idx) => {
          const xPos = idx === 0 ? posLeft + pdf.getTextWidth('Stay: ') + 5 : posLeft + 15;
          pdf.text(line, xPos, yPosition);
          if (idx > 0) yPosition += 5;
        });
        yPosition += 8;
      }

      // Ensure yPosition not overlapping image height vertically
      if (imageHeight > 0) {
        const imageBottom = yPosition + imageHeight + 10;
        if (yPosition < imageBottom) yPosition = imageBottom;
      }

      yPosition += 5; // spacing before next day or section
    });
  }

  // Package Inclusions
  if (tourData.inclusions && tourData.inclusions.length > 0) {
    const validInclusions = tourData.inclusions.filter(i => i.trim());
    if (validInclusions.length > 0) {
      addSectionHeader('PACKAGE INCLUSIONS');
      addBulletPointsFromArray(validInclusions, 10);
      yPosition += 6;
    }
  }

  // Package Exclusions
  if (tourData.exclusions && tourData.exclusions.length > 0) {
    const validExclusions = tourData.exclusions.filter(i => i.trim());
    if (validExclusions.length > 0) {
      addSectionHeader('PACKAGE EXCLUSIONS');
      addBulletPointsFromArray(validExclusions, 10);
      yPosition += 6;
    }
  }

  // Terms & Conditions
  const hasHotelPolicy = tourData.hotelPolicy && tourData.hotelPolicy.some(i => i.trim());
  const hasCabPolicy = tourData.cabPolicy && tourData.cabPolicy.some(i => i.trim());

  if (hasHotelPolicy || hasCabPolicy) {
    addSectionHeader('TERMS & CONDITIONS');

    if (hasHotelPolicy) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('Hotel Policy:', margin + 8, yPosition);
      yPosition += 10;

      const validHotelPolicies = tourData.hotelPolicy.filter(i => i.trim());
      if (validHotelPolicies.length > 0) addBulletPointsFromArray(validHotelPolicies, 9, 5);
      yPosition += 6;
    }

    if (hasCabPolicy) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text('Transport Policy:', margin + 8, yPosition);
      yPosition += 10;

      const validCabPolicies = tourData.cabPolicy.filter(i => i.trim());
      if (validCabPolicies.length > 0) addBulletPointsFromArray(validCabPolicies, 9, 5);
      yPosition += 6;
    }
  }

  // Contact Information
  const contactName = safeText(tourData.contactName);
  const contactPhone = safeText(tourData.contactPhone);

  if (contactName || contactPhone) {
    addSectionHeader('CONTACT INFORMATION');
    if (contactName) addKeyValue('Contact Person', contactName, true);
    if (contactPhone) addKeyValue('Phone', contactPhone, true);
    addKeyValue('Email', 'venkatasrikanth@sangeethaholidays.com', true);
    addKeyValue('Website', 'www.sangeethaholidays.com', true);
  }

  // Disclaimer
  checkPageBreak(25);
  yPosition += 10;

  pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, 20, 2, 2, 'F');

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  pdf.text('IMPORTANT DISCLAIMER', margin + 5, yPosition + 8);

  yPosition += 15;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

  const disclaimerText = 'Note: In case of unforeseen circumstances such as natural disasters, political unrest, holidays, or unexpected events, Terrorist attacks etc . The Amount paid will not be refundable .';
  const disclaimerLines = pdf.splitTextToSize(disclaimerText, contentWidth - 10);

  for (const line of disclaimerLines) {
    checkPageBreak(5);
    pdf.text(line, margin + 5, yPosition);
    yPosition += 5;
  }

  // Professional footer on all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    pdf.setFontSize(9);
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFont('helvetica', 'bold');

    pdf.text('SANGEETHA HOLIDAYS PRIVATE LIMITED', margin, pageHeight - 10);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save PDF
  pdf.save(filename);
};
