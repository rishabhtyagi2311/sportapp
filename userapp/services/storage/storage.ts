// @/services/storage/storage.ts
// expo-file-system v19 (SDK 54) moved uploadAsync/FileSystemUploadType into a
// separate `/legacy` subpath — the new default export no longer has them.
import * as FileSystem from 'expo-file-system/legacy';
import apiClient from '@/utils/apiClient';

export const storageApiService = {
  getPresignedUrl: async (fileName: string, fileType: string): Promise<{ uploadUrl: string; publicUrl: string }> => {
    const response = await apiClient.post('/user/storage/presigned-url', { fileName, fileType });
    return response.data.data;
  },

  // Uploads the local file directly via native code (not a JS Blob — React
  // Native's Blob/fetch polyfill silently produces empty/corrupted bodies
  // when piped through axios for binary PUT uploads).
  uploadToS3: async (uploadUrl: string, fileUri: string, fileType: string) => {
    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': fileType },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`S3 upload failed with status ${result.status}`);
    }
    return result;
  },
};
