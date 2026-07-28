import { uploadToFirebase } from './firebaseStorage';
import { uploadToImgBB } from './imgbb';

/**
 * Compresses an image file client-side into a lightweight Base64 Data URL.
 * Max dimension: 500px, JPEG quality: 0.8 (~30-50KB).
 */
export const compressImageToBase64 = (file: File, maxWidth = 500, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image with automatic multi-level fallbacks:
 * 1. Preferred Storage (Firebase or ImgBB)
 * 2. Secondary Storage (ImgBB or Firebase)
 * 3. Client-side compressed Base64 Data URL
 */
export const uploadImageWithFallback = async (
  file: File,
  storagePath: string,
  preferredStorage: 'FIREBASE' | 'IMGBB' = 'FIREBASE'
): Promise<string> => {
  // Level 1: Try preferred cloud storage
  if (preferredStorage === 'FIREBASE') {
    try {
      return await uploadToFirebase(file, storagePath);
    } catch (firebaseErr) {
      console.warn('Firebase Storage upload failed, attempting ImgBB fallback...', firebaseErr);
      try {
        return await uploadToImgBB(file);
      } catch (imgbbErr) {
        console.warn('ImgBB fallback failed, falling back to compressed local Base64...', imgbbErr);
      }
    }
  } else {
    try {
      return await uploadToImgBB(file);
    } catch (imgbbErr) {
      console.warn('ImgBB upload failed, attempting Firebase Storage fallback...', imgbbErr);
      try {
        return await uploadToFirebase(file, storagePath);
      } catch (firebaseErr) {
        console.warn('Firebase fallback failed, falling back to compressed local Base64...', firebaseErr);
      }
    }
  }

  // Level 2: Local Canvas Base64 Compression (100% guaranteed to work offline or online)
  try {
    return await compressImageToBase64(file);
  } catch (base64Err) {
    console.error('All image upload methods failed:', base64Err);
    throw new Error('ছবি আপলোড করা সম্ভব হয়নি। দয়া করে ছোট সাইজের অন্য একটি ছবি চেষ্টা করুন।');
  }
};
