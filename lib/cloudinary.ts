const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export type CloudinaryUpload = { secure_url: string; resource_type: 'image' | 'video' };

export async function uploadToCloudinary(file: File): Promise<CloudinaryUpload> {
  if (!CLOUD_NAME || !PRESET) throw new Error('Cloudinary env vars missing');
  const isVideo = file.type.startsWith('video/');
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? 'video' : 'image'}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);

  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary upload failed: ${txt}`);
  }
  const data = await res.json();
  return { secure_url: data.secure_url, resource_type: data.resource_type };
}
