import { supabase } from './supabase';

const BUCKET_NAME = 'gallery-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates image element from file
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Gets cropped image from canvas
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CroppedArea
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size to cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

/**
 * Validates image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Palaikomi tik JPG, PNG, GIF ir WebP formatai' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Failas per didelis. Maksimalus dydis: 10MB' };
  }

  return { valid: true };
}

/**
 * Generates unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `gallery_${timestamp}_${random}.jpg`;
}

/**
 * Uploads cropped image to Supabase storage
 */
export async function uploadImageToStorage(
  blob: Blob,
  filename: string
): Promise<{ url: string; path: string }> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Nepavyko įkelti nuotraukos: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path
  };
}

/**
 * Saves image metadata to database using admin RPC
 */
export async function saveImageToDatabase(
  imageUrl: string,
  altText: string,
  fileSize: number
): Promise<void> {
  const token = localStorage.getItem('admin_session_token');
  if (!token) {
    throw new Error('Sesija negaliojanti');
  }

  const { data, error } = await supabase.rpc('admin_add_gallery_image', {
    p_token: token,
    p_image_url: imageUrl,
    p_alt_text: altText || 'Gallery image',
    p_sort_order: 0
  });

  if (error || !data?.success) {
    throw new Error(data?.error || `Nepavyko išsaugoti į duomenų bazę: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Complete upload process
 */
export async function processAndUploadImage(
  file: File,
  croppedAreaPixels: CroppedArea,
  altText: string
): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create object URL for cropping
  const imageSrc = URL.createObjectURL(file);

  try {
    // Get cropped image blob
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Upload to storage
    const { url } = await uploadImageToStorage(croppedBlob, filename);

    // Save to database
    await saveImageToDatabase(url, altText, croppedBlob.size);

    return url;
  } finally {
    // Cleanup object URL
    URL.revokeObjectURL(imageSrc);
  }
}
