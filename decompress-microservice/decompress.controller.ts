import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DecompressService } from './decompress.service';

@Controller()
export class DecompressController {
  constructor(private readonly decompressService: DecompressService) {}

  @MessagePattern('decompress')
  async decompressFile(data: any) {
    try {
      return await this.decompressService.decompressFile(
        data.filePath,
        data.decompressDir,
        data.resourceId,
        data.resourceType || 'UNKNOWN',
        data.minioConfig
      );
    } catch (error) {
      return {
        success: false,
        resourceId: data.resourceId,
        resourceType: data.resourceType || 'UNKNOWN',
        error: error.message,
        message: '文件解压缩失败',
      };
    }
  }
}
