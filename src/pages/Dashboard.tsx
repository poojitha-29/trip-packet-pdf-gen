import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { getStoredForms, deleteFormFromStorage, SavedForm } from '@/utils/formStorage';


const Dashboard = () => {
  const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredForms, setFilteredForms] = useState<SavedForm[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [savedForms, searchTerm]);

  const loadSavedForms = () => {
    try {
      const forms = getStoredForms();
      setSavedForms(forms);
    } catch (error) {
      console.error('Error loading saved forms:', error);
      toast({
        title: "Error loading forms",
        description: "Could not load saved forms from storage.",
        variant: "destructive"
      });
    }
  };

  const filterForms = () => {
    if (!searchTerm) {
      setFilteredForms(savedForms);
    } else {
      const filtered = savedForms.filter(form => 
        form.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForms(filtered);
    }
  };

  const handleCreateNew = () => {
    navigate('/');
  };

  const handleImportForm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = JSON.parse(text);

        // wrap or accept full SavedForm
        let wrapper: SavedForm;
        if (imported.id && imported.data) {
          wrapper = imported;
        } else {
          // raw TourData → wrap it
          wrapper = {
            id: crypto.randomUUID(),
            tourName: imported.tourName || '',
            customerName: imported.customerName || '',
            startDate: imported.startDate || '',
            endDate: imported.endDate || '',
            numTravellers: imported.numTravellers || '',
            costPerPerson: imported.costPerPerson || '',
            packageType: imported.packageType || 'domestic',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: imported
          };
        }

        // save into LS + state
        const updated = [...savedForms, wrapper];
        localStorage.setItem('savedTourForms', JSON.stringify(updated));
        setSavedForms(updated);

        toast({
          title: "Import successful",
          description: `Imported form: ${wrapper.tourName || 'Untitled Tour'}`,
        });

        // navigate into the edit page for this new form
        navigate(`/form/${wrapper.id}`);

      } catch (err) {
        console.error(err);
        toast({
          title: "Import failed",
          description: "Could not parse or import the file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleEditForm = (formId: string) => {
    navigate(`/form/${formId}`);
  };

  const handleDeleteForm = (formId: string) => {
    try {
      const success = deleteFormFromStorage(formId);
      if (success) {
        setSavedForms(savedForms.filter(form => form.id !== formId));
        toast({
          title: "Form deleted",
          description: "Tour form has been successfully deleted."
        });
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      toast({
        title: "Error deleting form",
        description: "Could not delete the form.",
        variant: "destructive"
      });
    }
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays - 1;
    return `${nights}N/${diffDays}D`;
  };

  const exportForm = (form: SavedForm) => {
    try {
      const dataStr = JSON.stringify(form.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${form.tourName.replace(/\s+/g, '')}_form_backup.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Form exported",
        description: "Form backup has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export the form.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Tour Forms Dashboard</h1>
          <p className="text-lg text-orange-600 font-medium">Manage Your Saved Forms</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-orange-500 mx-auto mt-4"></div>
        </div>

        {/* Controls */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search forms by tour name or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Badge variant="secondary" className="whitespace-nowrap">
                  {filteredForms.length} forms
                </Badge>
              </div>
               <Button 
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
              
              <Button 
                onClick={() => document.getElementById('import-input')?.click()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Import Form
              </Button>

              {/* Hidden input for file upload */}
              <input
                type="file"
                id="import-input"
                accept=".json"
                onChange={handleImportForm}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No forms found' : 'No saved forms yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first tour form to get started'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Form
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="shadow-lg border-0 bg-white/90 backdrop-blur hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-900 line-clamp-2">
                        {form.tourName || 'Untitled Tour'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {form.customerName || 'No customer name'}
                      </p>
                    </div>
                    <Badge 
                      variant={form.packageType === 'international' ? 'default' : 'secondary'}
                      className="ml-2 shrink-0"
                    >
                      {form.packageType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-600">
                        {calculateDuration(form.startDate, form.endDate) || 'No dates'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">
                        {form.numTravellers || 'No pax'}
                      </span>
                    </div>
                  </div>
                  
                  {form.startDate && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Start:</span> {format(new Date(form.startDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                  
                  {form.costPerPerson && (
                    <div className="text-sm">
                      <span className="font-medium text-orange-600">
                        ₹{parseInt(form.costPerPerson).toLocaleString()} per person
                      </span>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Updated: {format(new Date(form.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditForm(form.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportForm(form)}
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteForm(form.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;