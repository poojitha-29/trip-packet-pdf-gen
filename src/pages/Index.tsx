import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Plane, Hotel, MapPin, Users, Plus, Trash2, Upload, Save, ArrowLeft } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { generatePDF } from '@/utils/pdfGenerator';
import { saveFormToStorage, getFormById, autoSaveDraft, clearDraft } from '@/utils/formStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

interface DayItinerary {
  day: number;
      title: string;
  description: string;
  meals: string[];
  overnight: string;
  image?: string;
}

interface TourData {
  customerName: string;
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
  taxesIncluded: boolean;
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
  visaIncluded: boolean;
  travelInsuranceIncluded: boolean;
}

const Index = () => {
  const { id: formId } = useParams();
  
  const navigate = useNavigate();
const [currentFormId, setCurrentFormId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [tourData, setTourData] = useState<TourData>({
    customerName: '',
    tourName: '',
    startDate: undefined,
    endDate: undefined,
    numTravellers: '',
    costPerPerson: '',
    numPlaces: 1,
    places: [''],
    flightType: 'roundtrip',
    onwardFlight: {
      airline: '',
      baggage: '15kg + 7kg',
      departure: '',
      arrival: '',
      route: '',
      note: 'Flight fares are subject to change until the booking is confirmed. The provided rates are indicative and may vary',
      cost: ''
    },
    returnFlight: {
      airline: '',
      baggage: '15kg + 7kg',
      departure: '',
      arrival: '',
      route: '',
      note: 'Flight fares are subject to change until the booking is confirmed. The provided rates are indicative and may vary',
      cost: ''
    },
    packageType: 'domestic',
    landPackageCost: '',
    landPackageNote: '',
    taxesIncluded: false,
    gstPercent: '5',
    tcsPercent: '5',
    numHotels: 1,
    hotels: [{ name: '', roomType: '' }],
    hotelName: '',
    roomType: '',
    itinerary: [],
    inclusions: ['2 Breakfasts', '2 Lunches', '500ml water bottles daily', 'Airport transfers', 'All sightseeing as per itinerary'],
    exclusions: ['Personal expenses', 'Tips and gratuities', 'Travel insurance', 'Visa fees', 'Meals not mentioned in inclusions'],
    hotelPolicy: ['Check-in: 2:00 PM | Check-out: 12:00 PM', 'Minibar consumption will be charged extra', 'Any damages to hotel property will be charged to guest', 'Valid ID proof required at check-in', 'Room allotment subject to availability'],
    cabPolicy: ['NON-REFUNDABLE TOUR POLICY', 'Kindly follow the timing discipline', 'Extra sightseeing will be charged extra', 'Driver tips not included', 'AC will be switched off during hills/traffic'],
    contactName: 'Mr. Venkata Srikanth Pinnamaraju',
    contactPhone: '8106868686',
    visaIncluded: false,
    travelInsuranceIncluded: false
  });

  const calculateDuration = () => {
    if (tourData.startDate && tourData.endDate) {
      const days = differenceInDays(tourData.endDate, tourData.startDate) + 1;
      const nights = days - 1;
      return `${nights}N/${days}D`;
    }
    return '';
  };

  const updateItinerary = () => {
    if (tourData.startDate && tourData.endDate) {
      const days = differenceInDays(tourData.endDate, tourData.startDate) + 1;
      const newItinerary: DayItinerary[] = [];
      
      for (let i = 1; i <= days; i++) {
        const existingDay = tourData.itinerary.find(day => day.day === i);
        newItinerary.push(existingDay || {
          day: i,
          title: '',
          description: '',
          meals: [],
          overnight: i === days ? 'Departure' : 'Hotel'
        });
      }
      
      setTourData(prev => ({ ...prev, itinerary: newItinerary }));
    }
  };

  const updateItineraryDay = (dayIndex: number, field: keyof DayItinerary, value: string | string[]) => {
    const newItinerary = [...tourData.itinerary];
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: value };
    setTourData(prev => ({ ...prev, itinerary: newItinerary }));
  };


  const addArrayField = (field: 'inclusions' | 'exclusions' | 'hotelPolicy' | 'cabPolicy') => {
    setTourData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'inclusions' | 'exclusions' | 'hotelPolicy' | 'cabPolicy', index: number) => {
    setTourData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: 'inclusions' | 'exclusions' | 'hotelPolicy' | 'cabPolicy', index: number, value: string) => {
    setTourData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const updatePlacesCount = (count: number) => {
    const newCount = Math.max(1, count);
    setTourData(prev => ({
      ...prev,
      numPlaces: newCount,
      places: Array.from({ length: newCount }, (_, i) => prev.places[i] || '')
    }));
  };

  const updatePlace = (index: number, value: string) => {
    setTourData(prev => ({
      ...prev,
      places: prev.places.map((place, i) => i === index ? value : place)
    }));
  };

  const updateHotelsCount = (count: number) => {
    const newCount = Math.max(1, count);
    setTourData(prev => ({
      ...prev,
      numHotels: newCount,
      hotels: Array.from({ length: newCount }, (_, i) => prev.hotels[i] || { name: '', roomType: '' })
    }));
  };

  const updateHotel = (index: number, field: 'name' | 'roomType', value: string) => {
    setTourData(prev => ({
      ...prev,
      hotels: prev.hotels.map((hotel, i) => 
        i === index ? { ...hotel, [field]: value } : hotel
      )
    }));
  };

  const handleImageUpload = (dayIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newItinerary = [...tourData.itinerary];
      newItinerary[dayIndex].image = result;
      setTourData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePDF = async () => {
    try {
      // Auto-save before generating PDF
      if (tourData.tourName) {
        handleSaveForm();
      }
      
      const filename = `${tourData.tourName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}_sangeethaholidays.pdf`;
      await generatePDF(tourData, filename);
      toast({
        title: "PDF Generated Successfully!",
        description: `${filename} has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveForm = () => {
    try {
      if (!tourData.tourName) {
        toast({
          title: "Cannot save form",
          description: "Please enter a tour name before saving.",
          variant: "destructive"
        });
        return;
      }

      const savedId = saveFormToStorage(tourData, currentFormId || undefined);
      setCurrentFormId(savedId);
      setLastSaved(new Date());
      
      toast({
        title: "Form saved successfully!",
        description: "Your tour form has been saved and can be accessed from the dashboard."
      });
    } catch (error) {
      toast({
        title: "Error saving form",
        description: "Could not save the form. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const loadExistingForm = (id: string) => {
    try {
      const existingForm = getFormById(id);
      if (existingForm) {
        const data = existingForm.data;
        // Convert date strings back to Date objects
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        
        setTourData(data);
        setCurrentFormId(id);
        setLastSaved(new Date(existingForm.updatedAt));
        
        toast({
          title: "Form loaded",
          description: `Loaded "${existingForm.tourName}" for editing.`
        });
      }
    } catch (error) {
      toast({
        title: "Error loading form",
        description: "Could not load the selected form.",
        variant: "destructive"
      });
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (tourData.tourName && !isAutoSaving) {
      setIsAutoSaving(true);
      const timeoutId = setTimeout(() => {
        try {
          autoSaveDraft(tourData, currentFormId || undefined);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
        setIsAutoSaving(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [tourData, currentFormId]);

  // Load existing form if editing
useEffect(() => {
  if (formId && formId !== currentFormId) {
    loadExistingForm(formId);
  }
}, [formId, currentFormId]);


  React.useEffect(() => {
    updateItinerary();
  }, [tourData.startDate, tourData.endDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between py-4">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-gray-600">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={handleSaveForm}
              disabled={!tourData.tourName}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            {currentFormId ? 'Edit Tour Form' : 'SHPL Tour PDF Generator'}
          </h1>
          <p className="text-lg text-orange-600 font-medium">Sangeetha Holidays Private Limited</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto mt-4"></div>
        </div>

        {/* Basic Tour Info */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Tour Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={tourData.customerName}
                  onChange={(e) => setTourData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tourName">Tour Name</Label>
                <Input
                  id="tourName"
                  placeholder="e.g., Bangkok 2N/3D"
                  value={tourData.tourName}
                  onChange={(e) => setTourData(prev => ({ ...prev, tourName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !tourData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tourData.startDate ? format(tourData.startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tourData.startDate}
                      onSelect={(date) => setTourData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !tourData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tourData.endDate ? format(tourData.endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tourData.endDate}
                      onSelect={(date) => setTourData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="numTravellers">Number of Travellers</Label>
                <Input
                  id="numTravellers"
                  placeholder="e.g., 97 pax"
                  value={tourData.numTravellers}
                  onChange={(e) => setTourData(prev => ({ ...prev, numTravellers: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tour Duration</Label>
                <div className="mt-1 p-2 bg-blue-50 border rounded-md font-medium text-blue-700">
                  {calculateDuration() || 'Select dates'}
                </div>
              </div>

              <div>
                <Label htmlFor="costPerPerson">Total Per Person Cost (INR)</Label>
                <Input
                  id="costPerPerson"
                  placeholder="e.g., 25000"
                  value={tourData.costPerPerson}
                  onChange={(e) => setTourData(prev => ({ ...prev, costPerPerson: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="numPlaces">Number of Places</Label>
                <Input
                  id="numPlaces"
                  type="number"
                  min="1"
                  placeholder="e.g., 3"
                  value={tourData.numPlaces}
                  onChange={(e) => updatePlacesCount(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Dynamic Place Name Fields */}
            <div className="mt-4">
              <Label className="text-base font-semibold mb-3 block">Place Names</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tourData.places.map((place, index) => (
                  <div key={index}>
                    <Label htmlFor={`place-${index}`}>Place {index + 1}</Label>
                    <Input
                      id={`place-${index}`}
                      placeholder={`Enter place ${index + 1} name`}
                      value={place}
                      onChange={(e) => updatePlace(index, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flight Details */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Flight Type Selector */}
            <div className="mb-6">
              <Label htmlFor="flightType">Flight Type</Label>
              <Select value={tourData.flightType} onValueChange={(value: 'roundtrip' | 'one-way') => setTourData(prev => ({ ...prev, flightType: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roundtrip">Round Trip</SelectItem>
                  <SelectItem value="one-way">One Way</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-3">Onward Flight</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="onwardAirline">Airline</Label>
                  <Input
                    id="onwardAirline"
                    value={tourData.onwardFlight.airline}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      onwardFlight: { ...prev.onwardFlight, airline: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="onwardBaggage">Baggage Info</Label>
                  <Input
                    id="onwardBaggage"
                    value={tourData.onwardFlight.baggage}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      onwardFlight: { ...prev.onwardFlight, baggage: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="onwardRoute">Route</Label>
                  <Input
                    id="onwardRoute"
                    placeholder="e.g., Delhi → Bangkok"
                    value={tourData.onwardFlight.route}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      onwardFlight: { ...prev.onwardFlight, route: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="onwardDeparture">Departure</Label>
                  <Input
                    id="onwardDeparture"
                    placeholder="e.g., 14:30 - 15 Jan"
                    value={tourData.onwardFlight.departure}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      onwardFlight: { ...prev.onwardFlight, departure: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="onwardArrival">Arrival</Label>
                  <Input
                    id="onwardArrival"
                    placeholder="e.g., 21:45 - 15 Jan"
                    value={tourData.onwardFlight.arrival}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      onwardFlight: { ...prev.onwardFlight, arrival: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                {/* Flight Cost - Show only for roundtrip or both for one-way */}
                {tourData.flightType === 'roundtrip' && (
                  <div>
                    <Label htmlFor="onwardCost">Flight Cost (INR)</Label>
                    <Input
                      id="onwardCost"
                      placeholder="e.g., 15000"
                      value={tourData.onwardFlight.cost || ''}
                      onChange={(e) => setTourData(prev => ({
                        ...prev,
                        onwardFlight: { ...prev.onwardFlight, cost: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                )}
                {tourData.flightType === 'one-way' && (
                  <div>
                    <Label htmlFor="onwardCost">Onward Flight Cost (INR)</Label>
                    <Input
                      id="onwardCost"
                      placeholder="e.g., 15000"
                      value={tourData.onwardFlight.cost || ''}
                      onChange={(e) => setTourData(prev => ({
                        ...prev,
                        onwardFlight: { ...prev.onwardFlight, cost: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="onwardNote">Note</Label>
                <Textarea
                  id="onwardNote"
                  placeholder="Additional notes for onward flight..."
                  value={tourData.onwardFlight.note}
                  onChange={(e) => setTourData(prev => ({
                    ...prev,
                    onwardFlight: { ...prev.onwardFlight, note: e.target.value }
                  }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-orange-700 mb-3">Return Flight</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="returnAirline">Airline</Label>
                  <Input
                    id="returnAirline"
                    value={tourData.returnFlight.airline}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      returnFlight: { ...prev.returnFlight, airline: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="returnBaggage">Baggage Info</Label>
                  <Input
                    id="returnBaggage"
                    value={tourData.returnFlight.baggage}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      returnFlight: { ...prev.returnFlight, baggage: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="returnRoute">Route</Label>
                  <Input
                    id="returnRoute"
                    placeholder="e.g., Bangkok → Delhi"
                    value={tourData.returnFlight.route}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      returnFlight: { ...prev.returnFlight, route: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="returnDeparture">Departure</Label>
                  <Input
                    id="returnDeparture"
                    placeholder="e.g., 22:30 - 17 Jan"
                    value={tourData.returnFlight.departure}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      returnFlight: { ...prev.returnFlight, departure: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="returnArrival">Arrival</Label>
                  <Input
                    id="returnArrival"
                    placeholder="e.g., 03:15 - 18 Jan"
                    value={tourData.returnFlight.arrival}
                    onChange={(e) => setTourData(prev => ({
                      ...prev,
                      returnFlight: { ...prev.returnFlight, arrival: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                {/* Return Flight Cost - Show only for one-way */}
                {tourData.flightType === 'one-way' && (
                  <div>
                    <Label htmlFor="returnCost">Return Flight Cost (INR)</Label>
                    <Input
                      id="returnCost"
                      placeholder="e.g., 15000"
                      value={tourData.returnFlight.cost || ''}
                      onChange={(e) => setTourData(prev => ({
                        ...prev,
                        returnFlight: { ...prev.returnFlight, cost: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="returnNote">Note</Label>
                <Textarea
                  id="returnNote"
                  placeholder="Additional notes for return flight..."
                  value={tourData.returnFlight.note}
                  onChange={(e) => setTourData(prev => ({
                    ...prev,
                    returnFlight: { ...prev.returnFlight, note: e.target.value }
                  }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Land Package Info */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Land Package Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Package Type Selector */}
            <div className="mb-6">
              <Label htmlFor="packageType">Package Type</Label>
              <Select value={tourData.packageType} onValueChange={(value: 'domestic' | 'international') => setTourData(prev => ({ ...prev, packageType: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic">Domestic</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Taxes Included Checkbox */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxesIncluded"
                  checked={tourData.taxesIncluded}
                  onCheckedChange={(checked) => setTourData(prev => ({ ...prev, taxesIncluded: !!checked }))}
                />
                <Label htmlFor="taxesIncluded">Taxes Included</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="landPackageCost">Land Package Cost (INR)</Label>
                <Input
                  id="landPackageCost"
                  value={tourData.landPackageCost}
                  onChange={(e) => setTourData(prev => ({ ...prev, landPackageCost: e.target.value }))}
                  className="mt-1"
                />
              </div>
              {/* Show GST only if taxes are not included */}
              {!tourData.taxesIncluded && (
                <div>
                  <Label htmlFor="gstPercent">GST %</Label>
                  <Input
                    id="gstPercent"
                    value={tourData.gstPercent}
                    onChange={(e) => setTourData(prev => ({ ...prev, gstPercent: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
              {/* Show TCS only for international packages and if taxes are not included */}
              {tourData.packageType === 'international' && !tourData.taxesIncluded && (
                <div>
                  <Label htmlFor="tcsPercent">TCS %</Label>
                  <Input
                    id="tcsPercent"
                    value={tourData.tcsPercent}
                    onChange={(e) => setTourData(prev => ({ ...prev, tcsPercent: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="numHotels">Number of Hotels</Label>
              <Input
                id="numHotels"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={tourData.numHotels}
                onChange={(e) => updateHotelsCount(parseInt(e.target.value) || 1)}
                className="mt-1 max-w-xs"
              />
            </div>

            {/* Dynamic Hotel Fields */}
            <div className="mb-4">
              <Label className="text-base font-semibold mb-3 block">Hotel Details</Label>
              <div className="space-y-4">
                {tourData.hotels.map((hotel, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor={`hotel-name-${index}`}>Hotel {index + 1} Name</Label>
                      <Input
                        id={`hotel-name-${index}`}
                        placeholder={`Enter hotel ${index + 1} name`}
                        value={hotel.name}
                        onChange={(e) => updateHotel(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`hotel-room-${index}`}>Room Type</Label>
                      <Input
                        id={`hotel-room-${index}`}
                        placeholder="e.g., Standard, Deluxe, Suite"
                        value={hotel.roomType}
                        onChange={(e) => updateHotel(index, 'roomType', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Higher category on extra cost</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="hotelName">Primary Hotel Name (Legacy)</Label>
                <Input
                  id="hotelName"
                  value={tourData.hotelName}
                  onChange={(e) => setTourData(prev => ({ ...prev, hotelName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="roomType">Primary Room Type (Legacy)</Label>
                <Input
                  id="roomType"
                  placeholder="e.g., Standard, Deluxe, Suite"
                  value={tourData.roomType}
                  onChange={(e) => setTourData(prev => ({ ...prev, roomType: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="landPackageNote">Note</Label>
              <Textarea
                id="landPackageNote"
                placeholder="Additional notes for land package..."
                value={tourData.landPackageNote}
                onChange={(e) => setTourData(prev => ({ ...prev, landPackageNote: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Day-wise Itinerary */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Day-wise Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {tourData.itinerary.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Select tour dates to auto-generate day blocks</p>
            ) : (
              <div className="space-y-6">
                {tourData.itinerary.map((day, dayIndex) => (
                  <div key={day.day} className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
                    <h3 className="text-lg font-semibold text-purple-700 mb-3">Day {day.day}</h3>
                    <div className="space-y-4">
                       {/* Title */}
                      <div>
                        <Label htmlFor={`title-${day.day}`} className="font-medium">Title</Label>
                        <Input
                          id={`title-${day.day}`}
                          placeholder="Enter day's title..."
                          value={day.title || ''}
                          onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      {/* Description */}
                      <div>
                        <Label htmlFor={`description-${day.day}`} className="font-medium">Description</Label>
                        <Textarea
                          id={`description-${day.day}`}
                          placeholder="Enter day's itinerary description..."
                          value={day.description || ''}
                          onChange={(e) => updateItineraryDay(dayIndex, 'description', e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>

                      {/* Meals */}
                      <div>
                        <Label className="font-medium">Meals</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`breakfast-${day.day}`}
                              checked={day.meals?.includes('breakfast') || false}
                              onChange={(e) => {
                                const currentMeals = day.meals || [];
                                if (e.target.checked) {
                                  updateItineraryDay(dayIndex, 'meals', [...currentMeals, 'breakfast']);
                                } else {
                                  updateItineraryDay(dayIndex, 'meals', currentMeals.filter(meal => meal !== 'breakfast'));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`breakfast-${day.day}`} className="text-sm">Breakfast</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`lunch-${day.day}`}
                              checked={day.meals?.includes('lunch') || false}
                              onChange={(e) => {
                                const currentMeals = day.meals || [];
                                if (e.target.checked) {
                                  updateItineraryDay(dayIndex, 'meals', [...currentMeals, 'lunch']);
                                } else {
                                  updateItineraryDay(dayIndex, 'meals', currentMeals.filter(meal => meal !== 'lunch'));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`lunch-${day.day}`} className="text-sm">Lunch</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`dinner-${day.day}`}
                              checked={day.meals?.includes('dinner') || false}
                              onChange={(e) => {
                                const currentMeals = day.meals || [];
                                if (e.target.checked) {
                                  updateItineraryDay(dayIndex, 'meals', [...currentMeals, 'dinner']);
                                } else {
                                  updateItineraryDay(dayIndex, 'meals', currentMeals.filter(meal => meal !== 'dinner'));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`dinner-${day.day}`} className="text-sm">Dinner</Label>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label htmlFor={`image-${day.day}`} className="font-medium">Upload Image</Label>
                        <div className="mt-1">
                          <Input
                            id={`image-${day.day}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(dayIndex, file);
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          {day.image && (
                            <div className="mt-2">
                              <img src={day.image} alt={`Day ${day.day}`} className="w-20 h-20 object-cover rounded border" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Overnight Stay */}
                      <div>
                        <Label htmlFor={`overnight-${day.day}`}>Overnight Stay</Label>
                        <Input
                          id={`overnight-${day.day}`}
                          placeholder="e.g., Hotel, Departure"
                          value={day.overnight}
                          onChange={(e) => updateItineraryDay(dayIndex, 'overnight', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                Inclusions
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('inclusions')}
                  className="text-white border-white hover:bg-white hover:text-green-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Visa Radio Options */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-green-700 mb-3 block">Visa</Label>
                <RadioGroup 
                  value={tourData.visaIncluded ? "yes" : "no"} 
                  onValueChange={(value) => {
                    const included = value === "yes";
                    setTourData(prev => {
                      let updatedInclusions = [...prev.inclusions];
                      let updatedExclusions = [...prev.exclusions];
                      
                      if (included) {
                        // Add to inclusions if not already there
                        if (!updatedInclusions.includes('Visa')) {
                          updatedInclusions.push('Visa');
                        }
                        // Remove from exclusions
                        updatedExclusions = updatedExclusions.filter(item => !item.toLowerCase().includes('visa'));
                      } else {
                        // Add to exclusions if not already there
                        if (!updatedExclusions.some(item => item.toLowerCase().includes('visa'))) {
                          updatedExclusions.push('Visa fees');
                        }
                        // Remove from inclusions
                        updatedInclusions = updatedInclusions.filter(item => item !== 'Visa');
                      }
                      
                      return {
                        ...prev,
                        visaIncluded: included,
                        inclusions: updatedInclusions,
                        exclusions: updatedExclusions
                      };
                    });
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="visa-yes" />
                    <Label htmlFor="visa-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="visa-no" />
                    <Label htmlFor="visa-no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Travel Insurance Radio Options */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-green-700 mb-3 block">Travel Insurance</Label>
                <RadioGroup 
                  value={tourData.travelInsuranceIncluded ? "yes" : "no"} 
                  onValueChange={(value) => {
                    const included = value === "yes";
                    setTourData(prev => {
                      let updatedInclusions = [...prev.inclusions];
                      let updatedExclusions = [...prev.exclusions];
                      
                      if (included) {
                        // Add to inclusions if not already there
                        if (!updatedInclusions.some(item => item.toLowerCase().includes('travel insurance'))) {
                          updatedInclusions.push('Travel Insurance');
                        }
                        // Remove from exclusions
                        updatedExclusions = updatedExclusions.filter(item => !item.toLowerCase().includes('travel insurance'));
                      } else {
                        // Add to exclusions if not already there
                        if (!updatedExclusions.some(item => item.toLowerCase().includes('travel insurance'))) {
                          updatedExclusions.push('Travel insurance');
                        }
                        // Remove from inclusions
                        updatedInclusions = updatedInclusions.filter(item => !item.toLowerCase().includes('travel insurance'));
                      }
                      
                      return {
                        ...prev,
                        travelInsuranceIncluded: included,
                        inclusions: updatedInclusions,
                        exclusions: updatedExclusions
                      };
                    });
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="insurance-yes" />
                    <Label htmlFor="insurance-yes" className="text-sm">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="insurance-no" />
                    <Label htmlFor="insurance-no" className="text-sm">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                {tourData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Add inclusion..."
                      value={inclusion}
                      onChange={(e) => updateArrayField('inclusions', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('inclusions', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                Exclusions
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('exclusions')}
                  className="text-white border-white hover:bg-white hover:text-red-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {tourData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Add exclusion..."
                      value={exclusion}
                      onChange={(e) => updateArrayField('exclusions', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('exclusions', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                Hotel Policy
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('hotelPolicy')}
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {tourData.hotelPolicy.map((policy, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Add hotel policy..."
                      value={policy}
                      onChange={(e) => updateArrayField('hotelPolicy', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('hotelPolicy', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                Cab Policy
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField('cabPolicy')}
                  className="text-white border-white hover:bg-white hover:text-yellow-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {tourData.cabPolicy.map((policy, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Add cab policy..."
                      value={policy}
                      onChange={(e) => updateArrayField('cabPolicy', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayField('cabPolicy', index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Point of Contact Name</Label>
                <Input
                  id="contactName"
                  value={tourData.contactName}
                  onChange={(e) => setTourData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={tourData.contactPhone}
                  onChange={(e) => setTourData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate PDF Button */}
        <div className="flex justify-center py-8">
          <Button
            onClick={handleGeneratePDF}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Download className="mr-2 h-5 w-5" />
            Generate PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;