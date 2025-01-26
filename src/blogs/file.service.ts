import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FileService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    bucketName: string,
  ): Promise<string> {
    const fileContent = file.buffer;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: `image/${fileExtension}`,
    };

    try {
      const { Location } = await this.s3.upload(params).promise();
      return Location;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new InternalServerErrorException('Error uploading image to S3');
    }
  }

  async deleteFileByLocation(fileLocation: string): Promise<void> {
    try {
      const url = new URL(fileLocation);
      const bucketName = url.host.split('.')[0];
      const fileKey = decodeURIComponent(url.pathname.substring(1));

      const params = {
        Bucket: bucketName,
        Key: fileKey,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new InternalServerErrorException('Error deleting file from S3');
    }
  }
}
