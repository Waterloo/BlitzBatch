import { ITransformer, TransformResult, TransformerOptions } from '../types.js';

export abstract class BaseTransformer<Input = any, Output = any> 
  implements ITransformer<Input, Output> {
  
  protected abstract doTransform(
    input: Input, 
    options?: TransformerOptions
  ): Promise<TransformResult<Output>>;

  async transform(input: Input, options?: TransformerOptions): Promise<TransformResult<Output>> {
    if (!this.canHandle(input)) {
      throw new Error('Transformer cannot handle this input type');
    }

    const startTime = Date.now();
    const result = await this.doTransform(input, options);
    
    // Add timing metadata
    result.metadata.processingTime = Date.now() - startTime;
    
    return result;
  }

  abstract canHandle(input: Input): boolean;
}