import { compressImageToBase64 } from './imageCompressor';

export const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = (import.meta.env as any)?.VITE_IMGBB_API_KEY;
  
  if (!apiKey) {
    console.warn('ImgBB API Key is missing. Converting image locally via canvas...');
    return compressImageToBase64(file);
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.warn(`ImgBB upload endpoint returned status ${response.status}. Using local image encoding.`);
      return compressImageToBase64(file);
    }

    const data = await response.json();
    if (data && data.data && data.data.url) {
      return data.data.url;
    }
    return compressImageToBase64(file);
  } catch (error) {
    console.warn('ImgBB upload encounter network issue, falling back to local image encoding:', error);
    return compressImageToBase64(file);
  }
};
