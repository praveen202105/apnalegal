import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepButton,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { createDocument, generateDocument } from '../../lib/api';

function formatDocumentType(type: string | undefined): string {
  if (!type) return 'Legal Document';
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'];
const DOC_TYPES = ['Aadhaar', 'PAN', 'Driving License'];
const STAMP_DUTY_OPTIONS: Record<string, string[]> = {
  'Maharashtra': ['300', '500', '1000'],
  'Karnataka': ['250', '500', '900'],
  'Delhi': ['200', '400', '800'],
  'Tamil Nadu': ['250', '500', '1000'],
  'West Bengal': ['200', '450', '900'],
  'Kerala': ['250', '550', '950'],
  'Uttar Pradesh': ['200', '450', '900'],
  'Default': ['200', '500', '1000'],
};

type FormData = Record<string, string>;

interface DocConfig {
  steps: string[];
  defaultFormData: FormData;
  autofillData: FormData;
  requiredFields?: Record<number, string[]>;
  renderStep: (
    step: number,
    formData: FormData,
    onChange: (field: string, value: string) => void,
    extra?: { cityOptions?: string[] }
  ) => React.ReactNode;
  summary: (formData: FormData) => string;
}

function rentAgreementConfig(): DocConfig {
  return {
    steps: ['Parties Details', 'Property & Rent Info', 'Terms & Witnesses'],
    defaultFormData: {
      landlordName: '',
      landlordAddress: '',
      landlordDocType: '',
      landlordDocNumber: '',
      tenantName: '',
      tenantAddress: '',
      tenantDocType: '',
      tenantDocNumber: '',
      tenantOccupation: '',
      propertyAddress: '',
      propertyType: '',
      propertyArea: '',
      furnished: '',
      monthlyRent: '',
      securityDeposit: '',
      maintenanceCharges: '',
      utilitiesIncluded: '',
      pincode: '',
      city: '',
      state: '',
      tenurePeriod: '',
      startDate: '',
      lockInPeriod: '',
      noticePeriod: '',
      lateFee: '',
      petsAllowed: '',
      sublettingAllowed: '',
      stampDutyOption: '',
      stampDutyAmount: '',
      witness1Name: '',
      witness1Address: '',
      witness2Name: '',
      witness2Address: '',
      place: '',
      agreementDate: ''
    },
    autofillData: {
      landlordName: 'Rajesh Kumar',
      landlordAddress: '123, MG Road, Apartment 4B, Mumbai',
      landlordDocType: 'PAN',
      landlordDocNumber: 'ABCDE1234F',
      tenantName: 'Amit Sharma',
      tenantAddress: '456, Linking Road, Bandra, Mumbai',
      tenantDocType: 'Aadhaar',
      tenantDocNumber: '987654321098',
      tenantOccupation: 'Software Engineer',
      propertyAddress: '123, MG Road, Apartment 4B',
      propertyType: 'Residential',
      propertyArea: '1200',
      furnished: 'Semi-furnished',
      monthlyRent: '25000',
      securityDeposit: '50000',
      maintenanceCharges: '2000',
      utilitiesIncluded: 'Electricity, Water',
      pincode: '400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      tenurePeriod: '11',
      startDate: '2026-06-01',
      lockInPeriod: '12',
      noticePeriod: '1',
      lateFee: '500',
      petsAllowed: 'No',
      sublettingAllowed: 'No',
      stampDutyOption: '500',
      stampDutyAmount: '500',
      witness1Name: 'Suresh Patel',
      witness1Address: '789, Park Street, Mumbai',
      witness2Name: 'Priya Mehta',
      witness2Address: '101, Hill Road, Mumbai',
      place: 'Mumbai',
      agreementDate: '2026-05-10'
    },
    requiredFields: {
      0: ['landlordName', 'landlordAddress', 'landlordDocType', 'landlordDocNumber', 'tenantName', 'tenantAddress', 'tenantDocType', 'tenantDocNumber', 'tenantOccupation', 'propertyAddress'],
      1: ['propertyType', 'propertyArea', 'furnished', 'monthlyRent', 'securityDeposit', 'city', 'state', 'pincode'],
      2: ['tenurePeriod', 'startDate', 'lockInPeriod', 'noticePeriod', 'lateFee', 'petsAllowed', 'sublettingAllowed', 'stampDutyAmount', 'witness1Name', 'witness1Address', 'witness2Name', 'witness2Address', 'place', 'agreementDate'],
    },
    renderStep: (step, formData, onChange, extra) => {
      const cityOptions: string[] = extra?.cityOptions ?? [];
      if (step === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Landlord Details</Typography>
          <TextField label="Landlord Name" value={formData.landlordName} onChange={(e) => onChange('landlordName', e.target.value)} fullWidth />
          <TextField label="Landlord Address" value={formData.landlordAddress} onChange={(e) => onChange('landlordAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Document Type" value={formData.landlordDocType} onChange={(e) => onChange('landlordDocType', e.target.value)} select fullWidth>
            {DOC_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField label="Document Number" value={formData.landlordDocNumber} onChange={(e) => onChange('landlordDocNumber', e.target.value)} fullWidth />

          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Tenant Details</Typography>
          <TextField label="Tenant Name" value={formData.tenantName} onChange={(e) => onChange('tenantName', e.target.value)} fullWidth />
          <TextField label="Tenant Address" value={formData.tenantAddress} onChange={(e) => onChange('tenantAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Document Type" value={formData.tenantDocType} onChange={(e) => onChange('tenantDocType', e.target.value)} select fullWidth>
            {DOC_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField label="Document Number" value={formData.tenantDocNumber} onChange={(e) => onChange('tenantDocNumber', e.target.value)} fullWidth />
          <TextField label="Tenant Occupation" value={formData.tenantOccupation} onChange={(e) => onChange('tenantOccupation', e.target.value)} fullWidth />

          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Property Details</Typography>
          <TextField label="Property Address" value={formData.propertyAddress} onChange={(e) => onChange('propertyAddress', e.target.value)} multiline rows={3} fullWidth />
        </Box>
      );
      if (step === 1) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Property Type" value={formData.propertyType} onChange={(e) => onChange('propertyType', e.target.value)} select fullWidth>
            {['Residential', 'Commercial', 'Industrial'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Property Area (sq ft)" value={formData.propertyArea} onChange={(e) => onChange('propertyArea', e.target.value)} type="number" fullWidth />
          <TextField label="Furnished Status" value={formData.furnished} onChange={(e) => onChange('furnished', e.target.value)} select fullWidth>
            {['Furnished', 'Semi-furnished', 'Unfurnished'].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField label="Monthly Rent (₹)" value={formData.monthlyRent} onChange={(e) => onChange('monthlyRent', e.target.value)} type="number" fullWidth />
          <TextField label="Security Deposit (₹)" value={formData.securityDeposit} onChange={(e) => onChange('securityDeposit', e.target.value)} type="number" fullWidth />
          <TextField label="Maintenance Charges (₹)" value={formData.maintenanceCharges} onChange={(e) => onChange('maintenanceCharges', e.target.value)} type="number" fullWidth />
          <TextField label="Utilities Included" value={formData.utilitiesIncluded} onChange={(e) => onChange('utilitiesIncluded', e.target.value)} fullWidth placeholder="e.g. Electricity, Water, Gas" />
          <TextField label="PIN Code" value={formData.pincode} onChange={(e) => onChange('pincode', e.target.value)} type="number" fullWidth />
          {cityOptions.length > 0 ? (
            <TextField label="City" value={formData.city} onChange={(e) => onChange('city', e.target.value)} select fullWidth>
              {cityOptions.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}
            </TextField>
          ) : (
            <TextField label="City" value={formData.city} onChange={(e) => onChange('city', e.target.value)} fullWidth />
          )}
          <TextField label="State" value={formData.state} onChange={(e) => onChange('state', e.target.value)} select fullWidth>
            {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Tenure Period (Months)" value={formData.tenurePeriod} onChange={(e) => onChange('tenurePeriod', e.target.value)} type="number" fullWidth />
          <TextField label="Start Date" value={formData.startDate} onChange={(e) => onChange('startDate', e.target.value)} type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Lock-in Period (Months)" value={formData.lockInPeriod} onChange={(e) => onChange('lockInPeriod', e.target.value)} type="number" fullWidth />
          <TextField label="Notice Period (Months)" value={formData.noticePeriod} onChange={(e) => onChange('noticePeriod', e.target.value)} type="number" fullWidth />
          <TextField label="Late Fee (₹ per day)" value={formData.lateFee} onChange={(e) => onChange('lateFee', e.target.value)} type="number" fullWidth />
          <TextField label="Pets Allowed" value={formData.petsAllowed} onChange={(e) => onChange('petsAllowed', e.target.value)} select fullWidth>
            {['Yes', 'No'].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField label="Subletting Allowed" value={formData.sublettingAllowed} onChange={(e) => onChange('sublettingAllowed', e.target.value)} select fullWidth>
            {['Yes', 'No'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Stamp Duty Suggestion" value={formData.stampDutyOption} onChange={(e) => onChange('stampDutyOption', e.target.value)} select fullWidth>
            {(STAMP_DUTY_OPTIONS[formData.state] || STAMP_DUTY_OPTIONS.Default).map((option) => <MenuItem key={option} value={option}>{`₹${option}`}</MenuItem>)}
          </TextField>
          <TextField label="Stamp Duty Amount (₹)" value={formData.stampDutyAmount} onChange={(e) => onChange('stampDutyAmount', e.target.value)} type="number" fullWidth />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Choose a stamp duty amount based on state guidelines. If your state is not listed, adjust manually.
          </Typography>
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>Witnesses</Typography>
          <TextField label="Witness 1 Name" value={formData.witness1Name} onChange={(e) => onChange('witness1Name', e.target.value)} fullWidth />
          <TextField label="Witness 1 Address" value={formData.witness1Address} onChange={(e) => onChange('witness1Address', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Witness 2 Name" value={formData.witness2Name} onChange={(e) => onChange('witness2Name', e.target.value)} fullWidth />
          <TextField label="Witness 2 Address" value={formData.witness2Address} onChange={(e) => onChange('witness2Address', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Place" value={formData.place} onChange={(e) => onChange('place', e.target.value)} fullWidth />
          <TextField label="Agreement Date" value={formData.agreementDate} onChange={(e) => onChange('agreementDate', e.target.value)} type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText', borderRadius: 2, mt: 2 }}>
            <Typography variant="body2">
              <strong>Summary:</strong> Rental agreement between {formData.landlordName || '[Landlord]'} and {formData.tenantName || '[Tenant]'} for {formData.propertyType || '[Type]'} property at {formData.propertyAddress || '[Address]'}, ₹{formData.monthlyRent || '0'}/month for {formData.tenurePeriod || '0'} months starting {formData.startDate || '[Date]'}. Stamp duty: ₹{formData.stampDutyAmount || '0'}.
            </Typography>
          </Paper>
        </Box>
      );
    },
    summary: (f) => `Rental agreement between ${f.landlordName || '[Landlord]'} and ${f.tenantName || '[Tenant]'} for ${f.propertyType || '[Type]'} property (${f.propertyArea || '0'} sq ft, ${f.furnished || '[Furnished]'}) at ${f.propertyAddress || '[Address]'}. Rent: ₹${f.monthlyRent || '0'}/month, Deposit: ₹${f.securityDeposit || '0'}, Tenure: ${f.tenurePeriod || '0'} months from ${f.startDate || '[Date]'}.`,
  };
}

function affidavitConfig(): DocConfig {
  return {
    steps: ['Personal Details', 'Statement Content', 'Review & Confirm'],
    defaultFormData: { deponentName: '', fatherName: '', age: '', occupation: '', address: '', purpose: '', statement: '', city: '', state: '' },
    autofillData: { deponentName: 'Suresh Patel', fatherName: 'Ramesh Patel', age: '35', occupation: 'Software Engineer', address: '45, Nehru Nagar, Flat 2C, Bangalore', purpose: 'Name Change', statement: 'I, Suresh Patel, do hereby solemnly affirm and declare that I am also known as Suresh Kumar Patel and that both names refer to the same person, namely myself.', city: 'Bangalore', state: 'Karnataka' },
    requiredFields: {
      0: ['deponentName', 'fatherName', 'age', 'address'],
      1: ['purpose', 'statement', 'city', 'state'],
    },
    renderStep: (step, formData, onChange, extra) => {
      if (step === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Deponent's Full Name" value={formData.deponentName} onChange={(e) => onChange('deponentName', e.target.value)} fullWidth />
          <TextField label="Father's / Husband's Name" value={formData.fatherName} onChange={(e) => onChange('fatherName', e.target.value)} fullWidth />
          <TextField label="Age (years)" value={formData.age} onChange={(e) => onChange('age', e.target.value)} type="number" fullWidth />
          <TextField label="Occupation" value={formData.occupation} onChange={(e) => onChange('occupation', e.target.value)} fullWidth />
          <TextField label="Residential Address" value={formData.address} onChange={(e) => onChange('address', e.target.value)} multiline rows={2} fullWidth />
        </Box>
      );
      if (step === 1) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Purpose / Subject of Affidavit" value={formData.purpose} onChange={(e) => onChange('purpose', e.target.value)} fullWidth placeholder="e.g. Name Change, Lost Document, Income Declaration" />
          <TextField label="Statement / Declaration" value={formData.statement} onChange={(e) => onChange('statement', e.target.value)} multiline rows={6} fullWidth placeholder="Write the complete declaration in first person..." />
          <TextField label="City" value={formData.city} onChange={(e) => onChange('city', e.target.value)} fullWidth />
          <TextField label="State" value={formData.state} onChange={(e) => onChange('state', e.target.value)} select fullWidth>
            {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Affidavit Summary</Typography>
            <Typography variant="body2">Deponent: <strong>{formData.deponentName || '[Name]'}</strong>, Age {formData.age || '?'}, S/o or D/o {formData.fatherName || '[Father]'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>Purpose: {formData.purpose || '[Not specified]'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>Place: {formData.city || '?'}, {formData.state || '?'}</Typography>
          </Paper>
          <Alert severity="info" icon={false}>
            This affidavit must be signed before a <strong>Notary Public</strong>. A stamp paper of appropriate value (as per your state) is required.
          </Alert>
        </Box>
      );
    },
    summary: (f) => `Affidavit by ${f.deponentName || '[Deponent]'} (Age ${f.age || '?'}) regarding: ${f.purpose || '[Purpose]'}.`,
  };
}

function legalNoticeConfig(): DocConfig {
  return {
    steps: ['Sender Details', 'Recipient Details', 'Notice Content'],
    defaultFormData: { senderName: '', senderAddress: '', senderPhone: '', senderEmail: '', recipientName: '', recipientAddress: '', subject: '', description: '', demandAmount: '', deadline: '' },
    autofillData: { senderName: 'Priya Mehta', senderAddress: '78, Link Road, Bandra West, Mumbai 400050', senderPhone: '9876543210', senderEmail: 'priya.mehta@email.com', recipientName: 'XYZ Builders Pvt. Ltd.', recipientAddress: '101, Commercial Tower, Andheri East, Mumbai 400069', subject: 'Non-refund of booking amount', description: 'You have failed to refund the booking amount of ₹2,00,000 paid on 15-Jan-2026 for apartment unit #302, despite repeated requests and cancellation due to project delay exceeding 24 months.', demandAmount: '200000', deadline: '15' },
    requiredFields: {
      0: ['senderName', 'senderAddress', 'senderPhone', 'senderEmail'],
      1: ['recipientName', 'recipientAddress'],
      2: ['subject', 'description', 'demandAmount', 'deadline'],
    },
    renderStep: (step, formData, onChange, extra) => {
      if (step === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Your Full Name" value={formData.senderName} onChange={(e) => onChange('senderName', e.target.value)} fullWidth />
          <TextField label="Your Address" value={formData.senderAddress} onChange={(e) => onChange('senderAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Phone Number" value={formData.senderPhone} onChange={(e) => onChange('senderPhone', e.target.value)} fullWidth />
          <TextField label="Email Address" value={formData.senderEmail} onChange={(e) => onChange('senderEmail', e.target.value)} type="email" fullWidth />
        </Box>
      );
      if (step === 1) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Recipient's Name / Company" value={formData.recipientName} onChange={(e) => onChange('recipientName', e.target.value)} fullWidth />
          <TextField label="Recipient's Address" value={formData.recipientAddress} onChange={(e) => onChange('recipientAddress', e.target.value)} multiline rows={3} fullWidth />
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Subject of Notice" value={formData.subject} onChange={(e) => onChange('subject', e.target.value)} fullWidth placeholder="e.g. Recovery of dues, Cheque bounce, Property encroachment" />
          <TextField label="Facts & Description" value={formData.description} onChange={(e) => onChange('description', e.target.value)} multiline rows={5} fullWidth placeholder="Describe the dispute, dates, amounts, and what you demand..." />
          <TextField label="Demand Amount (₹)" value={formData.demandAmount} onChange={(e) => onChange('demandAmount', e.target.value)} type="number" fullWidth />
          <TextField label="Response Deadline (Days)" value={formData.deadline} onChange={(e) => onChange('deadline', e.target.value)} type="number" fullWidth placeholder="e.g. 15" />
        </Box>
      );
    },
    summary: (f) => `Legal notice from ${f.senderName || '[Sender]'} to ${f.recipientName || '[Recipient]'} regarding: ${f.subject || '[Subject]'}. Demand: ₹${f.demandAmount || '0'} within ${f.deadline || '15'} days.`,
  };
}

function consumerComplaintConfig(): DocConfig {
  return {
    steps: ['Your Details', 'Opposite Party', 'Complaint Details'],
    defaultFormData: { complainantName: '', complainantAddress: '', phone: '', email: '', companyName: '', companyAddress: '', productService: '', purchaseDate: '', amount: '', defectDescription: '', reliefSought: '' },
    autofillData: { complainantName: 'Anil Verma', complainantAddress: '22, Gandhi Nagar, Jaipur 302015', phone: '9988776655', email: 'anil.verma@email.com', companyName: 'QuickMart Online Pvt. Ltd.', companyAddress: 'Tower B, Cyber City, Gurugram 122002', productService: 'Refrigerator (Model XYZ-500)', purchaseDate: '2026-01-10', amount: '45000', defectDescription: 'The refrigerator stopped cooling within 2 months of purchase. The company denies warranty repair, claiming misuse, which is incorrect.', reliefSought: 'Replacement with new unit or full refund of ₹45,000 plus compensation for food spoilage loss of ₹5,000.' },
    requiredFields: {
      0: ['complainantName', 'complainantAddress', 'phone', 'email'],
      1: ['companyName', 'companyAddress', 'productService'],
      2: ['purchaseDate', 'amount', 'defectDescription', 'reliefSought'],
    },
    renderStep: (step, formData, onChange, extra) => {
      if (step === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Your Full Name" value={formData.complainantName} onChange={(e) => onChange('complainantName', e.target.value)} fullWidth />
          <TextField label="Your Address" value={formData.complainantAddress} onChange={(e) => onChange('complainantAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Phone Number" value={formData.phone} onChange={(e) => onChange('phone', e.target.value)} fullWidth />
          <TextField label="Email Address" value={formData.email} onChange={(e) => onChange('email', e.target.value)} type="email" fullWidth />
        </Box>
      );
      if (step === 1) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Company / Seller Name" value={formData.companyName} onChange={(e) => onChange('companyName', e.target.value)} fullWidth />
          <TextField label="Company Address" value={formData.companyAddress} onChange={(e) => onChange('companyAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Product / Service Description" value={formData.productService} onChange={(e) => onChange('productService', e.target.value)} fullWidth placeholder="e.g. Samsung Galaxy S24 Ultra, Plumber service, Insurance policy" />
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Purchase Date" value={formData.purchaseDate} onChange={(e) => onChange('purchaseDate', e.target.value)} type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Amount Paid (₹)" value={formData.amount} onChange={(e) => onChange('amount', e.target.value)} type="number" fullWidth />
          <TextField label="Defect / Problem Description" value={formData.defectDescription} onChange={(e) => onChange('defectDescription', e.target.value)} multiline rows={4} fullWidth placeholder="Describe the defect or deficiency in service in detail..." />
          <TextField label="Relief Sought" value={formData.reliefSought} onChange={(e) => onChange('reliefSought', e.target.value)} multiline rows={2} fullWidth placeholder="e.g. Refund, replacement, compensation..." />
        </Box>
      );
    },
    summary: (f) => `Consumer complaint by ${f.complainantName || '[Complainant]'} against ${f.companyName || '[Company]'} for ${f.productService || '[Product/Service]'} worth ₹${f.amount || '0'}.`,
  };
}

function firHelpConfig(): DocConfig {
  return {
    steps: ['Incident Details', 'Your Information', 'Description & Evidence'],
    defaultFormData: { incidentType: '', incidentDate: '', incidentTime: '', incidentPlace: '', victimName: '', victimAddress: '', phone: '', accusedName: '', accusedAddress: '', description: '', witnesses: '', evidence: '' },
    autofillData: { incidentType: 'Theft', incidentDate: '2026-05-01', incidentTime: '22:30', incidentPlace: 'Sector 18 Market, Noida, UP', victimName: 'Deepak Sharma', victimAddress: '55, Sector 21, Noida 201301', phone: '9812345678', accusedName: 'Unknown (2 persons on motorcycle)', accusedAddress: 'Unknown', description: 'On the night of 1st May 2026 at approximately 10:30 PM, two unknown persons on a motorcycle snatched my mobile phone (iPhone 15, IMEI: 123456789) and bag containing cash ₹8,000 near Sector 18 market. They fled toward the expressway.', witnesses: 'Shop owner Mr. Ramesh (contact: 9876543210) was present nearby.', evidence: 'CCTV footage from nearby shops, bank ATM camera, mobile IMEI number: 123456789' },
    requiredFields: {
      0: ['incidentType', 'incidentDate', 'incidentPlace'],
      1: ['victimName', 'victimAddress', 'phone'],
      2: ['description'],
    },
    renderStep: (step, formData, onChange, extra) => {
      if (step === 0) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Type of Incident" value={formData.incidentType} onChange={(e) => onChange('incidentType', e.target.value)} select fullWidth>
            {['Theft / Robbery', 'Physical Assault', 'Fraud / Cheating', 'Cybercrime', 'Kidnapping', 'Domestic Violence', 'Property Damage', 'Sexual Harassment', 'Other'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Date of Incident" value={formData.incidentDate} onChange={(e) => onChange('incidentDate', e.target.value)} type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Time of Incident" value={formData.incidentTime} onChange={(e) => onChange('incidentTime', e.target.value)} type="time" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Place of Incident" value={formData.incidentPlace} onChange={(e) => onChange('incidentPlace', e.target.value)} multiline rows={2} fullWidth placeholder="Complete address where incident occurred" />
        </Box>
      );
      if (step === 1) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Victim's Full Name" value={formData.victimName} onChange={(e) => onChange('victimName', e.target.value)} fullWidth />
          <TextField label="Victim's Address" value={formData.victimAddress} onChange={(e) => onChange('victimAddress', e.target.value)} multiline rows={2} fullWidth />
          <TextField label="Phone Number" value={formData.phone} onChange={(e) => onChange('phone', e.target.value)} fullWidth />
          <TextField label="Name of Accused (if known)" value={formData.accusedName} onChange={(e) => onChange('accusedName', e.target.value)} fullWidth placeholder="Write 'Unknown' if not known" />
          <TextField label="Address of Accused (if known)" value={formData.accusedAddress} onChange={(e) => onChange('accusedAddress', e.target.value)} fullWidth placeholder="Write 'Unknown' if not known" />
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Detailed Description of Incident" value={formData.description} onChange={(e) => onChange('description', e.target.value)} multiline rows={5} fullWidth placeholder="Describe everything that happened in chronological order..." />
          <TextField label="Witnesses (if any)" value={formData.witnesses} onChange={(e) => onChange('witnesses', e.target.value)} multiline rows={2} fullWidth placeholder="Names and contact details of witnesses" />
          <TextField label="Available Evidence" value={formData.evidence} onChange={(e) => onChange('evidence', e.target.value)} multiline rows={2} fullWidth placeholder="CCTV footage, screenshots, photos, documents, IMEIs..." />
          <Alert severity="info" icon={false}>
            Take this document to your nearest police station. Police must register an FIR for cognizable offences. If they refuse, you can approach the SP or Judicial Magistrate.
          </Alert>
        </Box>
      );
    },
    summary: (f) => `FIR complaint by ${f.victimName || '[Victim]'} regarding ${f.incidentType || '[Incident type]'} on ${f.incidentDate || '[Date]'} at ${f.incidentPlace || '[Place]'}.`,
  };
}

function getDocConfig(type: string | undefined): DocConfig {
  switch (type) {
    case 'affidavit': return affidavitConfig();
    case 'legal-notice': return legalNoticeConfig();
    case 'consumer-complaint': return consumerComplaintConfig();
    case 'fir-help': return firHelpConfig();
    default: return rentAgreementConfig();
  }
}

export default function LegalWorkflow() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const config = getDocConfig(type);
  const documentTitle = formatDocumentType(type);

  const [formData, setFormData] = useState<FormData>(config.defaultFormData);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  useEffect(() => {
    const pin = (formData.pincode ?? '').trim();
    if (!pin) {
      setPincodeMessage('');
      setCityOptions([]);
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setPincodeMessage('PIN code must be exactly 6 digits');
      setCityOptions([]);
      return;
    }

    let isActive = true;
    setPincodeMessage('Looking up city/state from PIN code...');
    setCityOptions([]);

    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isActive) return;
        const result = data?.[0];
        if (result?.Status !== 'Success' || !result?.PostOffice?.length) {
          setPincodeMessage('PIN lookup did not return matching city/state. Enter manually if needed.');
          setCityOptions([]);
          return;
        }
        const office = result.PostOffice[0] as any;
        const cities: string[] = Array.from(new Set(result.PostOffice
          .map((po: any) => (po.District || po.Name) as string)
          .filter((value: string | undefined): value is string => Boolean(value))));
        setFormData((prev) => ({
          ...prev,
          city: cities.length === 1 ? cities[0] : prev.city,
          state: (office.State as string) || prev.state,
        }));
        setCityOptions(cities);
        setPincodeMessage(`Matched PIN to ${office.District || office.Name}, ${office.State}`);
      })
      .catch(() => {
        if (!isActive) return;
        setPincodeMessage('Unable to fetch city/state from PIN code at this time.');
        setCityOptions([]);
      });

    return () => {
      isActive = false;
    };
  }, [formData.pincode]);

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSaveDraft = async () => {
    try {
      await createDocument(type || 'unknown', formData);
      setSnackbar({ open: true, message: 'Draft saved successfully' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save draft' });
    }
  };

  const handleGenerate = async () => {
    setShowConfirmDialog(false);
    setGenerating(true);
    setError('');
    try {
      const doc = await createDocument(type || 'unknown', formData);
      const result = await generateDocument(doc._id);
      navigate(`/document/${result.document._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    setGenerating(true);
    setError('');
    try {
      const doc = await createDocument(type || 'unknown', formData);
      navigate(`/document/${doc._id}`);
    } catch {
      setError('Failed to create preview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIAutofill = () => {
    setFormData(config.autofillData);
    setSnackbar({ open: true, message: 'AI autofill applied — review and edit as needed' });
  };

  const validateStep = (): string | null => {
    const required = config.requiredFields?.[activeStep] ?? [];
    for (const field of required) {
      const val = (formData[field] ?? '').trim();
      if (!val) {
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        return `"${label}" is required`;
      }
      if (['phone', 'senderPhone'].includes(field) && !/^\d{10}$/.test(val)) {
        return 'Phone number must be exactly 10 digits';
      }
      if (['email', 'senderEmail'].includes(field) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return 'Please enter a valid email address';
      }
      if (['landlordDocNumber', 'tenantDocNumber'].includes(field)) {
        const docTypeKey = field.replace('DocNumber', 'DocType');
        const docType = formData[docTypeKey] || '';
        if (docType === 'Aadhaar' && !/^\d{12}$/.test(val)) {
          return 'Aadhaar number must be exactly 12 digits';
        }
        if (docType === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
          return 'PAN must be in format ABCDE1234F';
        }
        if (docType === 'Driving License' && val.length < 6) {
          return 'Driving License number must be at least 6 characters';
        }
      }
      if (field === 'pincode' && !/^\d{6}$/.test(val)) {
        return 'PIN code must be exactly 6 digits';
      }
      if (['monthlyRent', 'securityDeposit', 'tenurePeriod', 'amount', 'demandAmount', 'deadline', 'propertyArea', 'maintenanceCharges', 'lockInPeriod', 'noticePeriod', 'lateFee', 'stampDutyAmount'].includes(field) && (isNaN(Number(val)) || Number(val) <= 0)) {
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        return `"${label}" must be a positive number`;
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setSnackbar({ open: true, message: err }); return; }
    if (activeStep === config.steps.length - 1) {
      setShowConfirmDialog(true);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 3 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{documentTitle}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Step {activeStep + 1} of {config.steps.length}</Typography>
          </Box>
          <IconButton color="primary" onClick={handleSaveDraft}>
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {config.steps.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={() => index < activeStep && setActiveStep(index)} sx={{ cursor: index < activeStep ? 'pointer' : 'default' }}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAIAutofill}
          fullWidth
          sx={{ mb: 3, borderStyle: 'dashed', borderWidth: 2, py: 1.5 }}
        >
          AI Smart Autofill
        </Button>

        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {config.renderStep(activeStep, formData, handleInputChange, { cityOptions })}
        </Paper>
        {type === 'rent-agreement' && activeStep === 1 && pincodeMessage && (
          <Alert severity="info" sx={{ mb: 3 }}>{pincodeMessage}</Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: activeStep === config.steps.length - 1 ? 'column' : 'row' }}>
          <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0} fullWidth sx={{ py: 1.5 }}>Back</Button>
          <Button variant="contained" onClick={handleNext} fullWidth sx={{ py: 1.5 }} disabled={generating}>
            {activeStep === config.steps.length - 1 ? 'Generate Document' : 'Next'}
          </Button>
        </Box>
        {activeStep === config.steps.length - 1 && (
          <Button variant="outlined" onClick={handlePreview} fullWidth sx={{ mt: 2, py: 1.5 }} disabled={generating}>
            Preview Document
          </Button>
        )}
      </Box>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Generate {documentTitle}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {config.summary(formData)}
            <br /><br />
            You can download or edit it after generation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Review Again</Button>
          <Button onClick={handleGenerate} variant="contained" disabled={generating}>
            {generating ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
