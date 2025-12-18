export type ObjectType = Record<string, any>;

// 扩展Express的Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}
