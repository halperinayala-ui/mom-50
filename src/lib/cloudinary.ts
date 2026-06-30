export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
  const CLOUD_NAME = 'dry0hxrbc';
  const UPLOAD_PRESET = 'mom50_upload';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  // Determine resource_type based on file type
  // 'auto' works for most cases, but specifying 'video' for videos is safer.
  const isVideo = file.type.startsWith('video/') || file.type.startsWith('audio/');
  const resourceType = isVideo ? 'video' : 'image';

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
    }

    // data.secure_url contains the public https link to the media
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error('אירעה שגיאה בהעלאת הקובץ לשרת המדיה. אנא נסו שוב.');
  }
};

/**
 * Optimizes a Cloudinary URL by injecting automatic quality and format parameters.
 * This can reduce file sizes by 80-90% without noticeable quality loss.
 * If the URL is not from Cloudinary, it is returned as-is.
 */
export const optimizeCloudinaryUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Only optimize if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // If it already has optimization params, don't add them again
  if (url.includes('/upload/q_auto') || url.includes('/upload/f_auto')) {
    return url;
  }

  // Insert q_auto,f_auto after /upload/
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
};
