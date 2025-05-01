import { SchemaTransformer } from '../base/SchemaTransformer.js';
import { SchemaRegistry } from '../schema/SchemaRegistry.js';

export class ContactTransformer extends SchemaTransformer {
  constructor() {
    super(SchemaRegistry.getSchema('contact')!);
  }

  protected applySchemaRules(item: any): any {
    const transformed = { ...item };
    
    // Apply entity-specific transformation rules
    
    // Handle full name if provided
    if (transformed.fullName && !transformed.firstName) {
      const nameParts = transformed.fullName.trim().split(/\s+/);
      transformed.firstName = nameParts[0];
      transformed.lastName = nameParts.slice(1).join(' ') || transformed.firstName;
      delete transformed.fullName;
    }
    
    // Normalize email
    if (transformed.email) {
      transformed.email = transformed.email.toLowerCase().trim();
    }
    
    // Normalize phone number
    if (transformed.phone) {
      transformed.phone = this.normalizePhoneNumber(transformed.phone);
    }
    
    // Parse tags if string
    if (typeof transformed.tags === 'string') {
      transformed.tags = transformed.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    
    // Convert date strings to Date objects
    if (transformed.lastContactedAt && typeof transformed.lastContactedAt === 'string') {
      transformed.lastContactedAt = new Date(transformed.lastContactedAt);
    }
    
    return transformed;
  }
  
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except '+'
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add country code if missing (assuming US)
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    return cleaned;
  }
}

// Register the transformer
import { SchemaTransformerFactory } from '../../SchemaTransformerFactory.js';
SchemaTransformerFactory.registerTransformer('contact', () => new ContactTransformer());