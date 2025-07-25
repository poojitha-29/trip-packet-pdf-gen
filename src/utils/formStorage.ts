export interface SavedForm {
  id: string;
  tourName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  numTravellers: string;
  costPerPerson: string;
  packageType: 'domestic' | 'international';
  createdAt: string;
  updatedAt: string;
  data: any; // Complete form data
}

export const generateFormId = (): string => {
  return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const saveFormToStorage = (formData: any, formId?: string): string => {
  try {
    const existingForms = getStoredForms();
    const id = formId || generateFormId();
    const now = new Date().toISOString();
    
    const savedForm: SavedForm = {
      id,
      tourName: formData.tourName || '',
      customerName: formData.customerName || '',
      startDate: formData.startDate ? formData.startDate.toISOString() : '',
      endDate: formData.endDate ? formData.endDate.toISOString() : '',
      numTravellers: formData.numTravellers || '',
      costPerPerson: formData.costPerPerson || '',
      packageType: formData.packageType || 'domestic',
      createdAt: formId ? (existingForms.find(f => f.id === formId)?.createdAt || now) : now,
      updatedAt: now,
      data: formData
    };

    const updatedForms = formId 
      ? existingForms.map(form => form.id === formId ? savedForm : form)
      : [...existingForms, savedForm];

    localStorage.setItem('savedTourForms', JSON.stringify(updatedForms));
    return id;
  } catch (error) {
    console.error('Error saving form:', error);
    throw new Error('Failed to save form');
  }
};

export const getStoredForms = (): SavedForm[] => {
  try {
    const stored = localStorage.getItem('savedTourForms');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading forms:', error);
    return [];
  }
};

export const getFormById = (id: string): SavedForm | null => {
  try {
    const forms = getStoredForms();
    return forms.find(form => form.id === id) || null;
  } catch (error) {
    console.error('Error getting form by ID:', error);
    return null;
  }
};

export const deleteFormFromStorage = (id: string): boolean => {
  try {
    const forms = getStoredForms();
    const updatedForms = forms.filter(form => form.id !== id);
    localStorage.setItem('savedTourForms', JSON.stringify(updatedForms));
    return true;
  } catch (error) {
    console.error('Error deleting form:', error);
    return false;
  }
};

export const autoSaveDraft = (formData: any, draftId?: string): string => {
  try {
    const id = draftId || `draft_${Date.now()}`;
    const drafts = JSON.parse(localStorage.getItem('tourFormDrafts') || '{}');
    
    drafts[id] = {
      data: formData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('tourFormDrafts', JSON.stringify(drafts));
    return id;
  } catch (error) {
    console.error('Error auto-saving draft:', error);
    return draftId || '';
  }
};

export const loadDraft = (draftId: string): any => {
  try {
    const drafts = JSON.parse(localStorage.getItem('tourFormDrafts') || '{}');
    return drafts[draftId]?.data || null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = (draftId: string): void => {
  try {
    const drafts = JSON.parse(localStorage.getItem('tourFormDrafts') || '{}');
    delete drafts[draftId];
    localStorage.setItem('tourFormDrafts', JSON.stringify(drafts));
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};