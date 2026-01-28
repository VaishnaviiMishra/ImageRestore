/**
 * Service for 3-stage image restoration
 */
const API_BASE = '/api';

// Stage 1: Analyze image
export const analyzeImage = async (
  file: File,
  onProgress: (status: string) => void
): Promise<{ analysis: any; imageId: string }> => {
  onProgress("Analyzing image for defects...");

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    onProgress("Analysis complete!");
    return data;
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    throw new Error(`Failed to analyze image: ${error.message || 'Unknown error'}`);
  }
};

// Stage 2: Restore with selected options
export const restoreImage = async (
  file: File,
  options: {
    defectsToFix: string[];
    enhanceColors: boolean;
    preserveOriginal: boolean;
    analysisData?: any; // Optional analysis data to improve restoration
  },
  onProgress: (status: string) => void
): Promise<{ restoredImage: string; restoredPath: string; originalPath: string }> => {
  onProgress("Performing restoration...");

  const formData = new FormData();
  formData.append('image', file);
  
  // Ensure defectsToFix is always an array
  const defectsArray = Array.isArray(options.defectsToFix) && options.defectsToFix.length > 0 
    ? options.defectsToFix 
    : ['SCRATCHES', 'DUST_SPOTS', 'FADED_COLORS', 'NOISE_GRAIN'];
  
  formData.append('defectsToFix', JSON.stringify(defectsArray));
  formData.append('enhanceColors', options.enhanceColors.toString());
  formData.append('preserveOriginal', options.preserveOriginal.toString());
  
  // Include analysis data if available to help prevent adding elements
  if (options.analysisData) {
    formData.append('analysisData', JSON.stringify(options.analysisData));
  }

  console.log('Sending restoration request with defects:', defectsArray);

  try {
    const response = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Restoration failed: ${response.status}`);
    }

    const data = await response.json();
    onProgress("Restoration complete!");
    return data;
    
  } catch (error: any) {
    console.error('Restoration error:', error);
    throw new Error(`Failed to restore image: ${error.message || 'Unknown error'}`);
  }
};

// Stage 3: Validate restoration
export const validateRestoration = async (
  originalPath: string,
  restoredPath: string,
  analysisData?: any, // Optional analysis data for better validation
  onProgress: (status: string) => void
): Promise<any> => {
  onProgress("Validating restoration accuracy...");

  try {
    const requestBody: any = { originalPath, restoredPath };
    if (analysisData) {
      requestBody.analysisData = analysisData;
    }
    
    const response = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Validation failed: ${response.status}`);
    }

    const data = await response.json();
    onProgress("Validation complete!");
    return data;
    
  } catch (error: any) {
    console.error('Validation error:', error);
    throw new Error(`Failed to validate restoration: ${error.message || 'Unknown error'}`);
  }
};