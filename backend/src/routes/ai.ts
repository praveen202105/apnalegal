import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const legalKnowledge: { keywords: string[]; response: string }[] = [
  {
    keywords: ['rent', 'tenant', 'landlord', 'lease', 'rental agreement', 'rent agreement'],
    response: `Under the **Indian Contract Act 1872** and state Rent Control Acts, a valid rent agreement should include:

• Names, addresses, and ID details of landlord and tenant
• Complete property description with address
• Monthly rent amount and due date
• Security deposit terms (typically 2–3 months rent)
• Tenure period — **11 months is standard** to avoid mandatory registration under the Registration Act 1908
• Maintenance responsibilities and utility payments
• Termination notice period (usually 1–2 months)
• Permitted use of premises

**Registration:** Agreements exceeding 12 months must be registered. Stamp duty applies as per your state's schedule (e.g., Maharashtra: 0.25% of total rent).

**Tip:** Even for 11-month agreements, notarized copies add enforceability. Use our Document Generator to create a legally compliant rent agreement.`,
  },
  {
    keywords: ['consumer', 'product defect', 'refund', 'defective', 'consumer protection', 'warranty'],
    response: `Under the **Consumer Protection Act 2019**, you are protected against defective goods, deficient services, and unfair trade practices.

**Where to file your complaint:**
• **District Consumer Commission:** Claims up to ₹50 lakhs
• **State Consumer Commission:** ₹50 lakhs to ₹2 crores
• **National Consumer Commission:** Above ₹2 crores

**Documents needed:**
• Purchase receipt / invoice
• Warranty card or service agreement
• Prior complaint correspondence with the company
• Photos/videos of the defect
• Medical bills (if personal injury caused)

**Time limit:** File within **2 years** from the date of cause of action.

**Relief available:** Replacement, refund, compensation for injury, and punitive damages for unfair practices.

You can also file online at **https://edaakhil.nic.in** (National Consumer Helpline).`,
  },
  {
    keywords: ['fir', 'police', 'report crime', 'complaint police', 'first information'],
    response: `An **FIR (First Information Report)** is registered under **Section 154 CrPC**.

**Step-by-step process:**
1. Visit the police station in whose **jurisdiction** the offence occurred
2. Narrate the incident clearly or submit a written complaint
3. Police **must register** the FIR for **cognizable offences** (robbery, assault, murder, rape, cheating above ₹500, etc.)
4. You are entitled to a **free copy of the FIR** immediately
5. If police refuse, approach the **Superintendent of Police** or file a complaint before a **Judicial Magistrate** under Section 156(3) CrPC

**For non-cognizable offences** (minor assault, defamation, etc.): Police records an NC and a Magistrate's permission is needed for investigation.

**e-FIR:** Many states allow e-FIR at their police portals for certain offences (theft of vehicle, cybercrime, etc.).

**Cybercrime:** Report at **cybercrime.gov.in** or call **1930**.`,
  },
  {
    keywords: ['property', 'land', 'plot', 'encroachment', 'title', 'ownership', 'sale deed'],
    response: `Property disputes in India are governed by the **Transfer of Property Act 1882**, **Registration Act 1908**, and state-specific revenue laws.

**Common types of property disputes:**
• Title/ownership disputes
• Partition suits among co-owners or heirs
• Encroachment by neighbour
• Builder-buyer disputes
• Tenant refusing to vacate

**Key documents to secure:**
• Original sale deed / conveyance deed
• Property tax receipts (last 3 years)
• Mutation / khata certificate
• Encumbrance certificate (last 30 years)
• Approved building plan (for constructed property)

**Legal remedies:**
• Civil suit for declaration of title in District Court
• Injunction to stop encroachment
• Specific performance suit under **Specific Relief Act 1963**
• Revenue court for agricultural land

**Note:** RERA (Real Estate Regulation Act 2016) protects homebuyers for under-construction projects — file complaints at your state's RERA portal.`,
  },
  {
    keywords: ['affidavit', 'notary', 'sworn statement', 'declaration', 'deponent'],
    response: `An **affidavit** is a sworn written statement made before a Notary Public or Oath Commissioner.

**Common uses:**
• Name change, date of birth correction
• Address or income proof
• Lost document declaration (passport, marksheet, driving licence)
• Marital status, bachelor certificate
• Property possession declaration

**How to create one:**
1. Draft the affidavit in first person on **stamp paper** (value varies by state: ₹10 to ₹500)
2. Sign it before a **Notary Public** (available at district courts and notary offices)
3. Notary attests with registration seal and signature

**Important:** False statements in an affidavit attract criminal liability under **Sections 191–193 IPC (perjury)**, punishable with up to 7 years imprisonment.

Use our Document Generator to create a correctly formatted affidavit instantly.`,
  },
  {
    keywords: ['divorce', 'marriage', 'matrimonial', 'alimony', 'maintenance', 'separation', 'mutual consent'],
    response: `Divorce in India is governed by **personal laws** based on religion:
• **Hindus/Sikhs/Jains/Buddhists:** Hindu Marriage Act 1955
• **Muslims:** Muslim Personal Law (Dissolution of Muslim Marriages Act 1939)
• **Christians:** Indian Divorce Act 1869
• **Parsis:** Parsi Marriage and Divorce Act 1936
• **Civil / inter-faith:** Special Marriage Act 1954

**Grounds for divorce** (Hindu Marriage Act): Adultery, cruelty, desertion (2+ years), conversion, mental disorder, communicable venereal disease, renunciation.

**Mutual Consent Divorce (Section 13-B):**
• Both parties agree → file jointly in Family Court
• 6-month cooling-off period (can be waived)
• Fastest route: resolved in 6–18 months

**Contested divorce:** 3–7 years in court.

**Maintenance/Alimony:** Under Section 125 CrPC, a spouse unable to maintain themselves can claim monthly maintenance. Courts consider income, assets, and lifestyle.

Book a Family Law consultation in our marketplace for case-specific advice.`,
  },
  {
    keywords: ['bail', 'arrest', 'custody', 'detained', 'anticipatory bail', 'remand'],
    response: `Bail in India is governed by **CrPC Sections 436–450**.

**Types of bail:**
• **Regular Bail (S.437/439):** Applied after arrest, in Magistrate/Sessions Court
• **Anticipatory Bail (S.438):** Applied before arrest, in Sessions Court or High Court
• **Interim Bail:** Temporary relief pending final hearing

**Bailable offences (S.436):** Bail is a **right** — police must grant it on furnishing surety.

**Non-bailable offences (S.437):** Court's discretion based on:
— Gravity of offence and punishment
— Criminal antecedents
— Risk of flight or tampering with evidence
— Danger to community

**Documents typically required:**
• FIR copy and arrest memo
• Surety's ID and address proof
• Property documents for surety (if property bail)

**Tip:** Apply for anticipatory bail as soon as you anticipate arrest — timing is critical. Contact a criminal lawyer immediately.

**Legal aid:** Call **15100** (NALSA) for free legal representation.`,
  },
  {
    keywords: ['legal notice', 'notice', 'demand notice', 'send notice', 'cheque bounce', 'recovery'],
    response: `A **Legal Notice** is a formal communication sent before initiating legal proceedings. It gives the other party a chance to resolve the dispute before going to court.

**When to send a legal notice:**
• Cheque bounce (mandatory under **Section 138 NI Act** — within 30 days of dishonour)
• Money recovery or loan default
• Property disputes
• Employment disputes (wrongful termination, unpaid dues)
• Consumer complaints (before filing in Consumer Forum)
• Defamation

**Contents of a legal notice:**
• Sender's name, address, contact details
• Recipient's name and address
• Detailed facts of the dispute
• Legal basis for the claim
• Specific demand (payment amount, action required)
• Deadline to respond (typically 15–30 days)

**How to send:** Via registered post / courier with acknowledgement receipt. Keep the delivery proof.

**After the notice:** If the recipient doesn't respond within the deadline, you can file a lawsuit.

Use our Document Generator to create a legally sound legal notice.`,
  },
  {
    keywords: ['cheque', 'bounce', 'dishonour', 'section 138', 'ni act', 'negotiable'],
    response: `**Cheque bounce** is covered under **Section 138 of the Negotiable Instruments Act 1881**, a criminal offence.

**Process after cheque dishonour:**
1. Get the **dishonour memo** from your bank (keep the original cheque)
2. Send a **legal notice** within **30 days** of receiving the memo
3. Give the drawer **15 days** to make the payment
4. If they don't pay, file a **criminal complaint** in the Magistrate Court within **30 days** after the 15-day period ends

**Punishment:** Imprisonment up to 2 years OR fine up to double the cheque amount, or both.

**Civil remedy:** You can simultaneously file a civil suit for recovery of the cheque amount.

**Time is critical** — missing the 30-day notice period or the subsequent 30-day filing window makes the case inadmissible.`,
  },
];

function generateLegalResponse(query: string): string {
  const q = query.toLowerCase();

  for (const item of legalKnowledge) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.response;
    }
  }

  return `Thank you for your question about **"${query}"**.

Under Indian law, this area may involve multiple statutes depending on the specific circumstances. Here is some general guidance:

**Identify the applicable law:**
• Civil disputes → Code of Civil Procedure (CPC) 1908
• Criminal matters → CrPC 1973 and IPC 1860
• Consumer issues → Consumer Protection Act 2019
• Property → Transfer of Property Act 1882
• Employment → Industrial Disputes Act 1947

**Time limits matter:** Limitation periods under the **Limitation Act 1963** range from 1 to 30 years. Acting promptly protects your legal rights.

**Gather documentation:** Collect all contracts, receipts, correspondence, and evidence before taking legal action.

**Free Legal Aid:** If you cannot afford a lawyer, the **National Legal Services Authority (NALSA)** provides free assistance. Call **15100** (toll-free) or visit nalsa.gov.in.

For precise advice tailored to your situation, I recommend **booking a consultation** with one of our verified lawyers — they can review your documents and provide step-by-step guidance.`;
}

// POST /ai/query
router.post('/query', async (req: AuthRequest, res: Response) => {
  const schema = z.object({ query: z.string().min(1).max(2000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Query is required' });
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  const response = generateLegalResponse(parsed.data.query);
  res.json({ response });
});

export default router;
