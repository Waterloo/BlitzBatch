export interface TransformResult<T = any> {
    data: T[];
    errors: TransformError[];
    metadata: {
      totalRecords: number;
      successfulRecords: number;
      failedRecords: number;
      skippedRecords: number;
      processingTime?: number;
    };
  }
  
  export interface TransformError {
    row?: number;
    field?: string;
    value?: any;
    message: string;
  }
  
  export interface TransformerOptions {
    batchSize?: number;
    validateSchema?: boolean;
    onProgress?: (progress: number) => void;
  }
  
  export interface ITransformer<Input = any, Output = any> {
    transform(input: Input, options?: TransformerOptions): Promise<TransformResult<Output>>;
    canHandle(input: Input): boolean;
  }
  
  export interface FileTransformerOptions extends TransformerOptions {
    fileType?: string;
    mimeType?: string;
  }