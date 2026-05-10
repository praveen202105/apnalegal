import { z } from 'zod';

export const DOCTYPE_LABELS: Record<string, string> = {
  'rent-agreement': 'Rent Agreement',
  'affidavit': 'Affidavit',
  'legal-notice': 'Legal Notice',
  'consumer-complaint': 'Consumer Complaint',
  'fir-help': 'FIR Help',
  'dispute': 'Dispute',
  'will': 'Will',
  'custom': 'Custom Document',
};

export const DOCUMENT_SCHEMAS: Record<string, z.ZodTypeAny> = {
  'rent-agreement': z.object({
    landlordName: z.string().min(2, 'Landlord name is required'),
    tenantName: z.string().min(2, 'Tenant name is required'),
    propertyAddress: z.string().min(5, 'Property address is required'),
    monthlyRent: z.string().regex(/^\d+$/, 'Monthly rent must be a number'),
    securityDeposit: z.string().regex(/^\d+$/, 'Security deposit must be a number'),
    tenurePeriod: z.string().regex(/^\d+$/, 'Tenure period must be a number'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
  }).catchall(z.string().optional()),
};

export function labelFor(type: string): string {
  return DOCTYPE_LABELS[type] || type;
}
