declare module '@prisma/client' {
  export class PrismaClient {
    constructor(...args: any[]);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(event: string, callback: (...args: any[]) => unknown): void;
    [key: string]: any;
  }
}
