import { IncomingForm, File as FormidableFile } from 'formidable';
import { NextApiRequest } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

type FileInfo = {
  originalFilename: string;
  filepath: string;
  mimetype: string;
  size: number;
};

export const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        return !!mimetype?.includes('image/');
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export const saveFile = async (file: FormidableFile): Promise<string> => {
  try {
    // In production, you might want to use cloud storage like S3
    // For development, we'll save to the public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Create uploads directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });
    
    const extension = path.extname(file.originalFilename || '') || '.jpg';
    const filename = `${uuidv4()}${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Move the file to the uploads directory
    await fs.rename(file.filepath, filepath);
    
    // Return the public URL of the uploaded file
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
};
