import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@src/plugin/logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LoggerService) private readonly loggerService: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { url, method, body, query, params, user } = request;
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let resultMessage = exception.message;
    let resultCode = 1;
    let resultParams = {};
    try {
      const { code, message, ...oth } = JSON.parse(exception.message);
      resultMessage = message;
      resultCode = code;
      resultParams = oth;
    } catch (e) {}

    const errorResponse = {
      status,
      message: resultMessage,
      code: resultCode,
      params: resultParams,
      path: url,
      method: method,
      timestamp: new Date().toISOString(),
    };

    // 统一响应结构：code, msg, data
    const unifiedResponse = {
      code: status, // 使用HTTP状态码作为统一响应的code
      msg: resultMessage, // 错误信息
      data: errorResponse, // 原始错误响应作为data字段
    };

    // 记录错误日志
    const errorInfo = {
      url,
      method,
      body: JSON.stringify(body),
      query: JSON.stringify(query),
      params: JSON.stringify(params),
      user: user ? { id: user.id, username: user.username } : null,
      error: {
        message: exception.message,
        stack: exception.stack,
        response: errorResponse,
      },
    };

    this.loggerService.error(`API错误: ${JSON.stringify(errorInfo)}`, 'API Error');

    // 设置返回的状态码、请求头、发送统一格式的错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(unifiedResponse);
  }
}
