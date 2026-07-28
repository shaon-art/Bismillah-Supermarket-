import { uploadToFirebase } from './firebaseStorage';
import { uploadToImgBB } from './imgbb';
import { compressImageToBase64 } from './imageCompressor';

export { compressImageToBase64 };

/**
 * Uploads an image with automatic multi-level fallbacks:
 * 1. Preferred Storage (Firebase Storage or ImgBB)
 * 2. Secondary Storage (ImgBB or Firebase Storage)
 * 3. Client-side compressed Base64 Data URL (100% guaranteed success)
 */
export const uploadImageWithFallback = async (
  file: File,
  storagePath: string,
  preferredStorage: 'FIREBASE' | 'IMGBB' = 'FIREBASE'
): Promise<string> => {
  if (preferredStorage === 'FIREBASE') {
    try {
      return await uploadToFirebase(file, storagePath);
    } catch (firebaseErr) {
      console.warn('Firebase Storage upload notice, attempting ImgBB fallback...', firebaseErr);
      try {
        return await uploadToImgBB(file);
      } catch (imgbbErr) {
        console.warn('ImgBB fallback notice, falling back to local compressed image...', imgbbErr);
      }
    }
  } else {
    try {
      return await uploadToImgBB(file);
    } catch (imgbbErr) {
      console.warn('ImgBB upload notice, attempting Firebase Storage fallback...', imgbbErr);
      try {
        return await uploadToFirebase(file, storagePath);
      } catch (firebaseErr) {
        console.warn('Firebase Storage notice, falling back to local compressed image...', firebaseErr);
      }
    }
  }

  // Guaranteed fallback: local high-quality compressed image
  return await compressImageToBase64(file);
};
