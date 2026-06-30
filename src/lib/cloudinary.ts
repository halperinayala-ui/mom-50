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
