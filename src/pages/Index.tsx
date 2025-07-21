import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Plane, Hotel, MapPin, Users, Plus, Trash2, Upload } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from "@/hooks/use-toast";

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

const Index = () => {
  const [tourData, setTourData] = useState<TourData>({
    tourName: '',
    startDate: undefined,
    endDate: undefined,
    numTravellers: '',
    costPerPerson: '',
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
    gstPercent: '5',
    tcsPercent: '5',
    hotelName: '',
    roomType: '',
    itinerary: [],
    inclusions: ['2 Breakfasts', '2 Lunches', '500ml water bottles daily', 'Airport transfers', 'All sightseeing as per itinerary'],
    exclusions: ['Personal expenses', 'Tips and gratuities', 'Travel insurance', 'Visa fees', 'Meals not mentioned in inclusions'],
    hotelPolicy: ['Check-in: 2:00 PM | Check-out: 12:00 PM', 'Minibar consumption will be charged extra', 'Any damages to hotel property will be charged to guest', 'Valid ID proof required at check-in', 'Room allotment subject to availability'],
    cabPolicy: ['NON-REFUNDABLE TOUR POLICY', 'Kindly follow the timing discipline', 'Extra sightseeing will be charged extra', 'Driver tips not included', 'AC will be switched off during hills/traffic'],
    contactName: 'Mr. Venkata Srikanth Pinnamaraju',
    contactPhone: '8106868686'
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
          morning: [''],
          afternoon: [''],
          meals: [''],
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

  const addItineraryField = (dayIndex: number, field: 'morning' | 'afternoon' | 'meals') => {
    const newItinerary = [...tourData.itinerary];
    newItinerary[dayIndex][field].push('');
    setTourData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const removeItineraryField = (dayIndex: number, field: 'morning' | 'afternoon' | 'meals', fieldIndex: number) => {
    const newItinerary = [...tourData.itinerary];
    newItinerary[dayIndex][field].splice(fieldIndex, 1);
    setTourData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const updateItineraryFieldValue = (dayIndex: number, field: 'morning' | 'afternoon' | 'meals', fieldIndex: number, value: string) => {
    const newItinerary = [...tourData.itinerary];
    newItinerary[dayIndex][field][fieldIndex] = value;
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

  React.useEffect(() => {
    updateItinerary();
  }, [tourData.startDate, tourData.endDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">SHPL Tour PDF Generator</h1>
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
              <div>
                <Label htmlFor="gstPercent">GST %</Label>
                <Input
                  id="gstPercent"
                  value={tourData.gstPercent}
                  onChange={(e) => setTourData(prev => ({ ...prev, gstPercent: e.target.value }))}
                  className="mt-1"
                />
              </div>
              {/* Show TCS only for international packages */}
              {tourData.packageType === 'international' && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="hotelName">Hotel Name</Label>
                <Input
                  id="hotelName"
                  value={tourData.hotelName}
                  onChange={(e) => setTourData(prev => ({ ...prev, hotelName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Input
                  id="roomType"
                  placeholder="e.g., Standard, Deluxe, Suite"
                  value={tourData.roomType}
                  onChange={(e) => setTourData(prev => ({ ...prev, roomType: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Higher category on extra cost</p>
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
                      {/* Morning Activities */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Morning Activities</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItineraryField(dayIndex, 'morning')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {day.morning.map((activity, activityIndex) => (
                            <div key={activityIndex} className="flex gap-2">
                              <Input
                                placeholder="Add morning activity..."
                                value={activity}
                                onChange={(e) => updateItineraryFieldValue(dayIndex, 'morning', activityIndex, e.target.value)}
                                className="flex-1"
                              />
                              {day.morning.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItineraryField(dayIndex, 'morning', activityIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Afternoon Activities */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Afternoon/Evening Activities</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItineraryField(dayIndex, 'afternoon')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {day.afternoon.map((activity, activityIndex) => (
                            <div key={activityIndex} className="flex gap-2">
                              <Input
                                placeholder="Add afternoon/evening activity..."
                                value={activity}
                                onChange={(e) => updateItineraryFieldValue(dayIndex, 'afternoon', activityIndex, e.target.value)}
                                className="flex-1"
                              />
                              {day.afternoon.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItineraryField(dayIndex, 'afternoon', activityIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meals */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Meals</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addItineraryField(dayIndex, 'meals')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {day.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="flex gap-2">
                              <Input
                                placeholder="Add meal..."
                                value={meal}
                                onChange={(e) => updateItineraryFieldValue(dayIndex, 'meals', mealIndex, e.target.value)}
                                className="flex-1"
                              />
                              {day.meals.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItineraryField(dayIndex, 'meals', mealIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
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
