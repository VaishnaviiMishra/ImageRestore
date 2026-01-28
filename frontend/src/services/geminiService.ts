/**
 * Service to handle image restoration via backend API
 */
export const restoreImage = async (
  file: File,
  onProgress: (status: string) => void
): Promise<string> => {
  onProgress("Sending to server...");

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/restore', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.restoredImage) {
      throw new Error('No restored image received from server');
    }
    
    return data.restoredImage;
    
  } catch (error: any) {
    console.error('Restoration error:', error);
    throw new Error(`Failed to restore image: ${error.message || 'Unknown error'}`);
  }
};