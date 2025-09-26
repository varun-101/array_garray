import { Client, Storage, ID } from "appwrite";

const endpoint = (import.meta as any).env?.VITE_APPWRITE_ENDPOINT;
const projectId = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID;
const bucketId = (import.meta as any).env?.VITE_APPWRITE_BUCKET_ID;

export const appwrite = new Client();
if (endpoint && projectId) {
  appwrite.setEndpoint(endpoint).setProject(projectId);
}

export const storage = new Storage(appwrite);
export const APPWRITE_BUCKET_ID = bucketId as string;
export const uniqueId = () => ID.unique();

export type UploadedFileInfo = {
  fileId: string;
  url: string;
  path: string;
};

function ensureConfigured() {
  if (!endpoint || !projectId) {
    throw new Error("Appwrite endpoint/project not configured. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.");
  }
  if (!APPWRITE_BUCKET_ID) {
    throw new Error("Missing VITE_APPWRITE_BUCKET_ID env var");
  }
}

export type UploadOptions = {
  userId?: string;
  projectSlug?: string;
  kind?: 'image' | 'video' | 'asset';
};

function slugify(input: string) {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function uploadFileToBucket(file: File, options: UploadOptions = {}): Promise<UploadedFileInfo> {
  ensureConfigured();
  const { userId = 'anon', projectSlug = 'general', kind = 'asset' } = options;
  const safeProject = slugify(projectSlug);
  const id = uniqueId();
  const res = await storage.createFile({ bucketId: APPWRITE_BUCKET_ID, fileId: id, file });
  const fileId = (res as any).$id || (res as any).fileId || id;
  const url = storage.getFileView({ bucketId: APPWRITE_BUCKET_ID, fileId }).toString();
  const path = `${slugify(userId)}/${safeProject}/${kind}/${fileId}`;
  return { fileId, url, path };
}


