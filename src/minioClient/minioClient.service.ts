import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  constructor(
    private readonly minioService: MinioService,
    private readonly configService: ConfigService
  ) {}

  private readonly baseBucket = this.configService.get('MINIO_CONFIG.MINIO_BUCKET');

  get client() {
    return this.minioService.client;
  }

  async upload(
    file: Express.Multer.File,
    baseBucket: string = this.baseBucket,
    customFileName?: string
  ) {
    // 确保存储桶存在
    await this.checkBucketExist(baseBucket);

    const fileName = customFileName || this.createFileName(file);

    return await this.putObject(baseBucket, fileName, file);
  }

  async listAllFilesByBucket() {
    const tmpByBucket = await this.client.listObjectsV2(this.baseBucket, '', true);
    return this.readData(tmpByBucket);
  }

  async deleteFile(objetName: string, baseBucket: string = this.baseBucket) {
    const tmp: any = await this.listAllFilesByBucket();
    const names = tmp?.map((i: any) => i.name);
    if (!names.includes(objetName)) {
      throw new HttpException('删除失败，文件不存在', HttpStatus.SERVICE_UNAVAILABLE);
    }
    try {
      this.client.removeObject(baseBucket, objetName);
    } catch (err) {
      throw new HttpException('删除失败，请重试', HttpStatus.BAD_REQUEST);
    }
  }

  async download(fileName: string) {
    return await this.client.getObject(this.baseBucket, fileName);
  }

  private createFileName(file: Express.Multer.File) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const temp_fileName = file.originalname;
    const hashedFileName = crypto.createHash('md5').update(temp_fileName).digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length
    );
    return hashedFileName + ext;
  }

  private async putObject(baseBucket: string, fileName: string, file: any, errorPrefix?: string) {
    // 检查file是否有buffer属性，如果有则使用buffer，否则直接使用file
    const fileContent = file.buffer || file;
    return new Promise<any>((resolve, reject) => {
      this.client.putObject(baseBucket, fileName, fileContent, (err: any) => {
        if (err) {
          console.error(`${errorPrefix} MinIO putObject error:`, err);
          reject(new HttpException(`Error upload file: ${err.message}`, HttpStatus.BAD_REQUEST));
        } else {
          resolve('上传成功');
        }
      });
    });
  }

  private async checkBucketExist(baseBucket: string = this.baseBucket) {
    try {
      const bucketExists = await new Promise<boolean>((resolve) => {
        this.client.bucketExists(baseBucket, (err, exists) => {
          if (err) {
            console.error('Error checking bucket existence:', err);
            resolve(false);
          } else {
            resolve(exists);
          }
        });
      });
      if (!bucketExists) {
        await new Promise<void>((resolve, reject) => {
          this.client.makeBucket(baseBucket, '', (err) => {
            if (err) {
              console.error('Error creating bucket:', err);
              reject(
                new HttpException(`Error creating bucket: ${err}`, HttpStatus.INTERNAL_SERVER_ERROR)
              );
            } else {
              console.log(`Bucket '${baseBucket}' created successfully`);
              resolve();
            }
          });
        });
      }
    } catch (err) {
      throw new HttpException('Bucket不存在', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  readData = async (stream: any) =>
    new Promise((resolve, reject) => {
      const a: any = [];
      stream
        .on('data', function (row: any) {
          a.push(row);
        })
        .on('end', function () {
          resolve(a);
        })
        .on('error', function (error: any) {
          reject(error);
        });
    });
}
