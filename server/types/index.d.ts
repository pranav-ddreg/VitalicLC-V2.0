// Global type declarations for server

declare module 'express-formidable' {
  function formidableMiddleware(options?: any): any;
  export = formidableMiddleware;
}

declare module 'json2csv' {
  interface CsvParserOptions {
    fields?: string[];
    header?: boolean;
  }

  class CsvParser {
    constructor(options?: CsvParserOptions);
    parse(data: any[]): string;
  }

  export { CsvParser };
}

declare module 'node-cron' {
  interface ScheduledTask {
    start(): void;
    stop(): void;
    destroy(): void;
  }

  export function schedule(cronExpression: string, func: () => void): ScheduledTask;
}
