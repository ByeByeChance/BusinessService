import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { LoggerService } from '@src/plugin/logger/logger.service';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    /**当前请求方式 */
    const method = request.method;
    /**当前请求路径 */
    const url = request.url;
    /**当前请求参数 */
    const body = request.body;
    /**当前params参数 */
    const params = request.params;
    /**当前query参数 */
    const query = request.query;
    /**当前用户信息 */
    const user = request.user;
    /**当前执行的类名 */
    const className = context.getClass().name;
    /**当前执行的方法名 */
    const handlerName = context.getHandler().name;

    // 构建操作对象信息
    const objectInfo = {
      url,
      method,
      body,
      params,
      query,
      className,
      handlerName,
    };

    return next.handle().pipe(
      map((data) => {
        // 接口成功执行时记录日志
        this.logger.logApiOperation(
          `${handlerName}`,
          user,
          objectInfo,
          true,
          `接口调用成功`,
          className
        );
        return data;
      }),
      catchError((error) => {
        // 接口执行异常时记录日志
        this.logger.logApiOperation(
          `${handlerName}`,
          user,
          objectInfo,
          false,
          `接口调用失败: ${error.message}`,
          className
        );
        return throwError(error);
      })
    );
  }
}
