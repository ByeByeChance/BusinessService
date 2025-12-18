import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as tar from 'tar';
import * as zlib from 'zlib';
import * as Minio from 'minio';
import { exec } from 'child_process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DecompressService {
  // 解压缩并发限制
  private readonly CONCURRENT_LIMIT: number;

  constructor(private readonly configService: ConfigService) {
    // 从配置中获取并发限制，默认5个并发
    this.CONCURRENT_LIMIT = this.configService.get<number>('DECOMPRESS.CONCURRENT_LIMIT', 5);
  }

  async decompressFile(
    filePath: string,
    decompressDir: string,
    resourceId: string,
    resourceType: string,
    minioConfig?: any
  ) {
    console.log('=== 开始解压缩服务 ===');
    console.log('输入参数:');
    console.log('filePath:', filePath);
    console.log('decompressDir:', decompressDir);
    console.log('resourceId:', resourceId);
    console.log('resourceType:', resourceType);
    console.log('minioConfig:', minioConfig);

    // 确保解压缩目录存在
    try {
      if (!fs.existsSync(decompressDir)) {
        console.log('创建解压缩目录:', decompressDir);
        fs.mkdirSync(decompressDir, { recursive: true });
      }
      console.log('解压缩目录存在:', decompressDir);
    } catch (error) {
      console.error('创建解压缩目录失败:', error);
      throw new Error(`创建解压缩目录失败: ${error.message}`);
    }

    // 验证输入参数
    try {
      if (!fs.existsSync(filePath)) {
        console.error('源文件不存在:', filePath);
        throw new Error(`源文件不存在: ${filePath}`);
      }
      console.log('源文件存在:', filePath);
      // 检查文件权限
      const stats = fs.statSync(filePath);
      console.log('源文件信息:', stats);
    } catch (error) {
      console.error('验证源文件失败:', error);
      throw new Error(`验证源文件失败: ${error.message}`);
    }

    // 根据文件扩展名选择解压缩方法
    const ext = path.extname(filePath).toLowerCase();
    console.log('文件扩展名:', ext);
    let decompressResult;

    try {
      switch (ext) {
        case '.zip':
          decompressResult = await this.decompressZip(filePath, decompressDir);
          break;
        case '.tar':
          decompressResult = await this.decompressTar(filePath, decompressDir);
          break;
        case '.gz':
          if (filePath.endsWith('.tar.gz') || filePath.endsWith('.tgz')) {
            decompressResult = await this.decompressTarGz(filePath, decompressDir);
          } else {
            decompressResult = await this.decompressGz(filePath, decompressDir);
          }
          break;
        case '.rar':
          decompressResult = await this.decompressRar(filePath, decompressDir);
          break;
        default:
          throw new Error(`不支持的压缩文件格式: ${ext}`);
      }

      // 记录解压缩结果
      const result = {
        success: true,
        resourceId,
        resourceType,
        decompressPath: decompressDir,
        decompressedFiles: decompressResult?.files || [],
        fileCount: decompressResult?.files?.length || 0,
        message: '文件解压缩成功',
      };

      // 如果提供了MinIO配置，则将解压缩后的文件上传到MinIO
      if (minioConfig) {
        try {
          const uploadedFiles = await this.uploadToMinio(
            decompressResult?.files || [],
            decompressDir,
            resourceId,
            resourceType,
            minioConfig
          );

          return {
            ...result,
            uploadedToMinio: true,
            uploadedFiles,
          };
        } catch (uploadError) {
          console.error('MinIO上传失败:', uploadError);
          // 上传失败不影响解压缩结果
          return result;
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // 解压缩ZIP文件
  private async decompressZip(filePath: string, decompressDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const zip = new AdmZip(filePath);
        zip.extractAllTo(decompressDir, true);

        // 获取解压缩的文件列表，只包含文件，不包含目录
        const files = this.getFilesInDir(decompressDir);

        resolve({ files });
      } catch (error) {
        reject(error);
      }
    });
  }

  // 解压缩TAR文件
  private async decompressTar(filePath: string, decompressDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(tar.extract({ cwd: decompressDir }))
        .on('error', reject)
        .on('finish', () => {
          // 获取解压缩的文件列表
          const files = this.getFilesInDir(decompressDir);
          resolve({ files });
        });
    });
  }

  // 解压缩TAR.GZ文件
  private async decompressTarGz(filePath: string, decompressDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .pipe(tar.extract({ cwd: decompressDir }))
        .on('error', reject)
        .on('finish', () => {
          // 获取解压缩的文件列表
          const files = this.getFilesInDir(decompressDir);
          resolve({ files });
        });
    });
  }

  // 解压缩GZ文件
  private async decompressGz(filePath: string, decompressDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const outputFilePath = path.join(decompressDir, path.basename(filePath, '.gz'));

      fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(outputFilePath))
        .on('error', reject)
        .on('finish', () => {
          resolve({ files: [path.basename(outputFilePath)] });
        });
    });
  }

  // 解压缩RAR文件（需要安装unrar工具）
  private async decompressRar(filePath: string, decompressDir: string): Promise<any> {
    // 注意：解压缩RAR文件需要系统安装unrar工具
    return new Promise((resolve, reject) => {
      const command = `unrar x "${filePath}" "${decompressDir}/"`;

      exec(command, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(new Error(`RAR解压缩失败: ${stderr}`));
          return;
        }

        // 获取解压缩的文件列表
        const files = this.getFilesInDir(decompressDir);
        resolve({ files });
      });
    });
  }

  // 获取目录中的所有文件
  private getFilesInDir(dir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);

      for (const entry of entries) {
        const entryPath = path.join(currentDir, entry);
        const stats = fs.statSync(entryPath);

        if (stats.isFile()) {
          files.push(path.relative(dir, entryPath));
        } else if (stats.isDirectory()) {
          walk(entryPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  // 将解压缩后的文件上传到MinIO
  private async uploadToMinio(
    files: string[],
    decompressDir: string,
    resourceId: string,
    resourceType: string,
    minioConfig: any
  ): Promise<string[]> {
    try {
      // 解析MinIO配置
      const endpoint = minioConfig.endpoint?.split('//')[1] || minioConfig.endpoint;
      const useSSL = minioConfig.endpoint?.startsWith('https') || false;

      // 创建MinIO客户端
      const minioClient = new Minio.Client({
        endPoint: endpoint || 'localhost',
        port: minioConfig.port || 9000,
        useSSL,
        accessKey: minioConfig.accessKey || 'minioadmin',
        secretKey: minioConfig.secretKey || 'minioadmin',
      });

      const uploadedFiles: string[] = [];
      const bucketName = minioConfig.bucket || 'resource';
      const storagePaths = minioConfig.storagePaths || {};

      // 确保bucket存在
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
      }

      // 遍历所有解压缩后的文件
      for (const relativePath of files) {
        const fullPath = path.join(decompressDir, relativePath);
        let storagePath = '';

        // 对于样本组类型，使用配置的样本组路径和resourceId作为唯一标识
        if (resourceType === 'sample_group') {
          const basePath = storagePaths.SAMPLE_GROUP || 'sampleGroup';
          // 确保路径格式正确，不包含多余的斜杠
          storagePath = `${basePath.replace(/\/$/, '')}/${resourceId}/`;
        } else {
          // 其他类型根据文件内容确定存储路径
          storagePath = this.getStoragePathForFile(fullPath, storagePaths);
        }

        // 构造MinIO中的对象名称
        const objectName = `${storagePath}${relativePath}`;

        // 上传文件到MinIO
        await minioClient.fPutObject(
          bucketName,
          objectName,
          fullPath,
          {}
          // 可以添加一些元数据，如Content-Type
        );

        uploadedFiles.push(objectName);
        console.log(`文件上传成功: ${objectName}`);
      }

      return uploadedFiles;
    } catch (error) {
      console.error('上传到MinIO失败:', error);
      throw error;
    }
  }

  // 根据文件内容确定存储路径
  private getStoragePathForFile(filePath: string, storagePaths: any): string {
    try {
      // 获取文件扩展名
      const ext = path.extname(filePath).toLowerCase();

      // 根据文件类型确定存储路径
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext)) {
        return storagePaths.PICTURE || 'picture/';
      } else if (['.py', '.java', '.cpp', '.c', '.h', '.js', '.ts'].includes(ext)) {
        return storagePaths.ALGORITHM || 'algorithm/';
      } else if (['.pth', '.h5', '.pt', '.model', '.pb', '.onnx'].includes(ext)) {
        return storagePaths.MODEL || 'model/';
      } else if (['.tar', '.tar.gz', '.tgz', '.zip', '.gz'].includes(ext)) {
        // 算法镜像文件使用image路径
        return storagePaths.IMAGE || 'image/';
      } else if (['.csv', '.json', '.xml', '.txt'].includes(ext)) {
        // 简单检查文件内容是否为样本数据
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          if (
            fileContent.includes('label') ||
            fileContent.includes('feature') ||
            fileContent.includes('sample')
          ) {
            return storagePaths.SAMPLE_GROUP || 'sample_group/';
          }
        } catch (readError) {
          // 忽略读取错误
        }
      }

      // 默认路径
      return storagePaths.OTHER || 'other/';
    } catch (error) {
      console.error('确定文件存储路径失败:', error);
      return 'other/';
    }
  }
}
