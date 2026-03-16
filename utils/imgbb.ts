
export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = (import.meta.env as any).VITE_IMGBB_API_KEY;
  if (!apiKey) {
    console.warn('ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your environment variables.');
    // Fallback or throw error
    throw new Error('ImgBB API Key is missing');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};
