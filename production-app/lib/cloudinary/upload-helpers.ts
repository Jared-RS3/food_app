/**
 * Cloudinary Upload Helpers
 * Functions for uploading and optimizing images
 */

import { captureException } from '@/lib/sentry/config';
import cloudinary from './client';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image from base64 or file buffer
 * Auto-optimizes and generates responsive URLs
 */
export async function uploadImage(
  file: string | Buffer,
  options: {
    folder?: string;
    transformation?: any;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder || 'restaurants',
      resource_type: options.resourceType || 'auto',
      transformation: options.transformation || [
        { quality: 'auto:best' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    captureException(error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload restaurant image with optimizations
 */
export async function uploadRestaurantImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, {
    folder: 'restaurants',
    transformation: [
      { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
}

/**
 * Upload menu item image with optimizations
 */
export async function uploadMenuItemImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, {
    folder: 'menu-items',
    transformation: [
      { width: 600, height: 600, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
}

/**
 * Upload user avatar with optimizations
 */
export async function uploadUserAvatar(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, {
    folder: 'avatars',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
      { radius: 'max' }, // Make it circular
    ],
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    captureException(error);
    return false;
  }
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        gravity: 'auto',
      },
      { quality: options.quality || 'auto:good' },
      { fetch_format: options.format || 'auto' },
    ],
    secure: true,
  });
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveUrls(publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
} {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedUrl(publicId, { width: 400, height: 300 }),
    medium: getOptimizedUrl(publicId, { width: 800, height: 600 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 900 }),
  };
}
