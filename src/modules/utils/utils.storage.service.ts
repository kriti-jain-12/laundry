import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UtilsStorageService {
  constructor(private readonly configService: ConfigService) {}

  async save(file: any) {
    try {
      const rootUploadsPath = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(rootUploadsPath)) {
        fs.mkdirSync(rootUploadsPath, { recursive: true });
      }
      const uniqueFilename = uuidv4(); // Generate a UUID as the filename
      const fileExtension = path.extname(file.originalname);
      const filePath = path.join(
        rootUploadsPath,
        `${uniqueFilename}${fileExtension}`,
      );
      fs.writeFileSync(filePath, file.buffer);
      return `${uniqueFilename}${fileExtension}`;
    } catch (error) {
      throw new BadRequestException(
        `Failed to save the file: ${error.message}`,
      );
    }
  }
}
