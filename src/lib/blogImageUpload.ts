import { supabase } from './supabase';
import { createImage, getCroppedImg, validateImageFile, type CroppedArea } from './imageUpload';

const BUCKET_NAME = 'blog-content-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadedBlogImage {
  url: string;
  altText: string;
  markdown: string;
  timestamp: number;
}

export function generateBlogImageFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `blog_content_${timestamp}_${random}.jpg`;
}

export async function uploadBlogImageToStorage(
  blob: Blob,
  filename: string
): Promise<string> {
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

  return urlData.publicUrl;
}

export async function processAndUploadBlogImage(
  file: File,
  croppedAreaPixels: CroppedArea,
  altText: string
): Promise<UploadedBlogImage> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const imageSrc = URL.createObjectURL(file);

  try {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const filename = generateBlogImageFilename(file.name);
    const url = await uploadBlogImageToStorage(croppedBlob, filename);

    const markdown = `![${altText || 'Blog image'}](${url})`;

    return {
      url,
      altText: altText || 'Blog image',
      markdown,
      timestamp: Date.now()
    };
  } finally {
    URL.revokeObjectURL(imageSrc);
  }
}

export async function deleteBlogImageFromStorage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      console.error('Error deleting image:', error);
      throw new Error('Nepavyko ištrinti nuotraukos');
    }
  } catch (error) {
    console.error('Error parsing image URL:', error);
    throw new Error('Netinkamas nuotraukos URL');
  }
}
