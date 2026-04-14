import { PrismaClient, LeaseType, LeaseStatus, TenantClassification, VendorRegistrationStatus, SignageStatus, ComplianceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function monthlyFromPsf(totalPsf: number, sqft: number): number {
  return round2((totalPsf * sqft) / 12);
}

async function main() {
  console.log('🌱 Seeding Belle Realty — On The Blvd...');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'adam@belle-realty.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Adam Abdalla',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Property ────────────────────────────────────────────────────────────────
  const property = await prisma.property.upsert({
    where: { id: 'prop_ontheblvd' },
    update: {},
    create: {
      id: 'prop_ontheblvd',
      name: 'On The Blvd Shopping Center',
      address: 'Arnould Blvd',
      city: 'Lafayette',
      state: 'LA',
      zip: '70506',
      parish: 'Lafayette',
      totalGla: 62810,
      website: 'https://shopontheblvd.com',
      phone: '337-769-1554',
      email: 'adam@belle-realty.com',
      lateFeeFlat: 100.00,
      lateFeeDailyRate: 25.00,
      lateFeeGraceDays: 5,
      holdoverMultiplier: 2.00,
      camAnnualCapPct: 0.05,
      monetaryCureDays: 7,
      nonMonetaryCureDays: 15,
      renewalNoticeDays: 60,
      renewalDefaultBasePsf: 14.00,
      renewalDefaultTotalPsf: 19.00,
      renewalDefaultAdditionalPsf: 5.00,
    },
  });
  console.log(`✅ Property: ${property.name}`);

  // ─── Units ───────────────────────────────────────────────────────────────────
  // Real On The Blvd units from rent roll
  const unitData = [
    { suite: '105',     gla: 1800,  notes: 'Painted Bayou' },
    { suite: '107',     gla: 1800,  notes: 'Great American Cookie / Hershey Ice Cream' },
    { suite: '109',     gla: 2400,  notes: 'JC Kate' },
    { suite: '111',     gla: 1200,  notes: 'Jason\'s Deli (part)' },
    { suite: '113',     gla: 2400,  notes: 'Jason\'s Deli (part)' },
    { suite: '115-117', gla: 4800,  notes: 'The Clothing Loft' },
    { suite: '117 1/2', gla: 1200,  notes: 'Victoria Nails' },
    { suite: '119',     gla: 1800,  notes: 'Oupac' },
    { suite: '119 1/2', gla: 1400,  notes: 'Cat Clinic of Lafayette' },
    { suite: '121',     gla: 1600,  notes: 'Magnolia Salon' },
    { suite: '123',     gla: 2400,  notes: 'Tenant 123' },
    { suite: '125',     gla: 1800,  notes: 'Tenant 125' },
    { suite: '127',     gla: 2000,  notes: 'Tenant 127' },
    { suite: '129',     gla: 2200,  notes: 'Tenant 129' },
    { suite: '131',     gla: 3200,  notes: 'Vacant — LOI in progress: Furniture Store' },
    { suite: '133',     gla: 2400,  notes: 'Vacant — no prospect' },
    { suite: '135B',    gla: 800,   notes: 'Owner-occupied — Belle Realty management office', isOwnerOccupied: true },
    { suite: '137',     gla: 2800,  notes: 'Tenant 137' },
    { suite: '139',     gla: 2400,  notes: 'Tenant 139' },
    { suite: '143',     gla: 2400,  notes: '1st Franklin Financial' },
  ];

  const units: Record<string, { id: string; gla: number }> = {};
  for (const u of unitData) {
    const unit = await prisma.unit.upsert({
      where: { propertyId_suiteNumber: { propertyId: property.id, suiteNumber: u.suite } },
      update: {},
      create: {
        propertyId: property.id,
        suiteNumber: u.suite,
        gla: u.gla,
        isVacant: ['131', '133'].includes(u.suite),
        isOwnerOccupied: u.isOwnerOccupied ?? false,
        notes: u.notes,
        hvacFirstCallTenantCap: 1000.00,
        hvacReplacementTenantPct: 0.25,
      },
    });
    units[u.suite] = { id: unit.id, gla: u.gla };
  }
  console.log(`✅ Units: ${Object.keys(units).length} created`);

  // ─── Tenants ─────────────────────────────────────────────────────────────────
  const tenantData = [
    { suite: '105',     legal: 'Painted Bayou, LLC',                      trade: 'Painted Bayou',                email: 'info@paintedbayou.com',       phone: '337-555-0105' },
    { suite: '107',     legal: 'Lafayette Cookies and Cream, LLC',         trade: 'Great American Cookie / Hershey Ice Cream', email: 'manager@gac-lafayette.com', phone: '337-555-0107' },
    { suite: '109',     legal: 'JC Kate, LLC',                             trade: 'JC Kate',                      email: 'jckate@example.com',           phone: '337-555-0109' },
    { suite: '111-113', legal: 'Jason\'s Deli of Lafayette, LLC',          trade: 'Jason\'s Deli',                email: 'portal@jasonsdeli.com',        phone: '337-555-0111' },
    { suite: '115-117', legal: 'The Clothing Loft, LLC',                   trade: 'The Clothing Loft',            email: 'clothingloft@example.com',     phone: '337-555-0115' },
    { suite: '117 1/2', legal: 'Victoria Nails, LLC',                      trade: 'Victoria Nails',               email: 'victorianails@example.com',    phone: '337-555-0117' },
    { suite: '119',     legal: 'Oupac, LLC',                               trade: 'Oupac',                        email: 'oupac@example.com',            phone: '337-555-0119' },
    { suite: '119 1/2', legal: 'Cat Clinic of Lafayette, LLC',             trade: 'Cat Clinic of Lafayette',      email: 'catclinic@example.com',        phone: '337-555-0120' },
    { suite: '121',     legal: 'Magnolia Salon, LLC',                      trade: 'Magnolia Salon',               email: 'magnolia@example.com',         phone: '337-555-0121' },
    { suite: '123',     legal: 'Tenant 123, LLC',                          trade: 'Tenant 123',                   email: 'tenant123@example.com',        phone: '337-555-0123' },
    { suite: '125',     legal: 'Tenant 125, LLC',                          trade: 'Tenant 125',                   email: 'tenant125@example.com',        phone: '337-555-0125' },
    { suite: '127',     legal: 'Tenant 127, LLC',                          trade: 'Tenant 127',                   email: 'tenant127@example.com',        phone: '337-555-0127' },
    { suite: '129',     legal: 'Tenant 129, LLC',                          trade: 'Tenant 129',                   email: 'tenant129@example.com',        phone: '337-555-0129' },
    { suite: '137',     legal: 'Tenant 137, LLC',                          trade: 'Tenant 137',                   email: 'tenant137@example.com',        phone: '337-555-0137' },
    { suite: '139',     legal: 'Tenant 139, LLC',                          trade: 'Tenant 139',                   email: 'tenant139@example.com',        phone: '337-555-0139' },
    { suite: '143',     legal: '1st Franklin Financial Corporation',        trade: '1st Franklin Financial',       email: '1stfranklin@example.com',      phone: '337-555-0143' },
  ];

  const tenants: Record<string, string> = {};
  for (const t of tenantData) {
    const tenant = await prisma.tenant.upsert({
      where: { id: `tenant_${t.suite.replace(/[^a-z0-9]/gi, '_')}` },
      update: {},
      create: {
        id: `tenant_${t.suite.replace(/[^a-z0-9]/gi, '_')}`,
        propertyId: property.id,
        legalName: t.legal,
        tradeName: t.trade,
        email: t.email,
        phone: t.phone,
        classification: TenantClassification.INLINE,
      },
    });
    tenants[t.suite] = tenant.id;
  }
  console.log(`✅ Tenants: ${Object.keys(tenants).length} created`);

  // ─── Leases ──────────────────────────────────────────────────────────────────
  // Real rates from rent roll — all NNN
  // basePsf, camPsf, taxPsf, insPsf, additionalPsf, totalPsf
  // monthly = round(totalPsf * gla / 12, 2)
  const leaseData = [
    // Expired leases — these are historical records
    {
      suite: '105', status: LeaseStatus.EXPIRED,
      start: new Date('2021-04-01'), end: new Date('2026-03-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3231.16, renewalNum: 0,
    },
    {
      suite: '109', status: LeaseStatus.EXPIRED,
      start: new Date('2022-10-01'), end: new Date('2025-09-30'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3808.39, renewalNum: 0,
    },
    {
      suite: '117 1/2', status: LeaseStatus.EXPIRED,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2719.84, renewalNum: 0,
    },
    {
      suite: '119', status: LeaseStatus.EXPIRED,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2890.42, renewalNum: 0,
    },
    {
      suite: '119 1/2', status: LeaseStatus.EXPIRED,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 4.45, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3035.03, renewalNum: 0,
    },
    {
      suite: '143', status: LeaseStatus.EXPIRED,
      start: new Date('2023-02-01'), end: new Date('2026-01-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3187.01, renewalNum: 0,
    },
    // Active leases — renewals and current
    {
      suite: '109', status: LeaseStatus.ACTIVE,
      start: new Date('2025-10-01'), end: new Date('2028-09-30'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3808.39, renewalNum: 1,
    },
    {
      suite: '143', status: LeaseStatus.ACTIVE,
      start: new Date('2026-02-01'), end: new Date('2029-01-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3187.01, renewalNum: 1,
    },
    {
      suite: '107', status: LeaseStatus.ACTIVE,
      start: new Date('2022-01-01'), end: new Date('2027-12-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2700.00, renewalNum: 0,
    },
    {
      suite: '111-113', status: LeaseStatus.ACTIVE,
      start: new Date('2020-06-01'), end: new Date('2027-05-31'),
      basePsf: 13.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 5000.00, renewalNum: 0,
    },
    {
      suite: '115-117', status: LeaseStatus.ACTIVE,
      start: new Date('2023-10-01'), end: new Date('2026-09-30'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 7200.00, renewalNum: 0,
    },
    {
      suite: '121', status: LeaseStatus.ACTIVE,
      start: new Date('2026-02-01'), end: new Date('2029-01-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2533.33, renewalNum: 0,
    },
    {
      suite: '123', status: LeaseStatus.ACTIVE,
      start: new Date('2022-06-01'), end: new Date('2027-05-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3600.00, renewalNum: 0,
    },
    {
      suite: '125', status: LeaseStatus.ACTIVE,
      start: new Date('2023-01-01'), end: new Date('2027-12-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2700.00, renewalNum: 0,
    },
    {
      suite: '127', status: LeaseStatus.ACTIVE,
      start: new Date('2021-09-01'), end: new Date('2026-08-31'),
      basePsf: 13.50, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3000.00, renewalNum: 0,
    },
    {
      suite: '129', status: LeaseStatus.ACTIVE,
      start: new Date('2022-03-01'), end: new Date('2027-02-28'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3300.00, renewalNum: 0,
    },
    {
      suite: '137', status: LeaseStatus.ACTIVE,
      start: new Date('2023-06-01'), end: new Date('2028-05-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 4200.00, renewalNum: 0,
    },
    {
      suite: '139', status: LeaseStatus.ACTIVE,
      start: new Date('2022-09-01'), end: new Date('2027-08-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3600.00, renewalNum: 0,
    },
    // Holdover leases — still in holdover (no renewal signed)
    {
      suite: '117 1/2', status: LeaseStatus.HOLDOVER,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2719.84, renewalNum: 0, isHoldover: true,
    },
    {
      suite: '119', status: LeaseStatus.HOLDOVER,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 2890.42, renewalNum: 0, isHoldover: true,
    },
    {
      suite: '119 1/2', status: LeaseStatus.HOLDOVER,
      start: new Date('2023-03-01'), end: new Date('2026-02-28'),
      basePsf: 14.00, camPsf: 4.45, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3035.03, renewalNum: 0, isHoldover: true,
    },
    {
      suite: '105', status: LeaseStatus.HOLDOVER,
      start: new Date('2021-04-01'), end: new Date('2026-03-31'),
      basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75,
      secDep: 3231.16, renewalNum: 0, isHoldover: true,
    },
  ];

  let leaseCount = 0;
  for (const l of leaseData) {
    const unitKey = l.suite;
    const unitInfo = units[unitKey];
    if (!unitInfo) { console.warn(`⚠️  No unit found for suite ${l.suite}`); continue; }

    // Determine tenant — use first matching suite key
    const tenantSuiteKey = Object.keys(tenants).find(k => k === l.suite || l.suite.startsWith(k.split('-')[0]));
    if (!tenantSuiteKey) { console.warn(`⚠️  No tenant for suite ${l.suite}`); continue; }
    const tenantId = tenants[tenantSuiteKey];

    const additionalPsf = round2(l.camPsf + l.taxPsf + l.insPsf);
    const totalPsf = round2(l.basePsf + additionalPsf);
    const monthlyBase = monthlyFromPsf(l.basePsf, unitInfo.gla);
    const monthlyAdditional = monthlyFromPsf(additionalPsf, unitInfo.gla);
    const monthlyTotal = monthlyFromPsf(totalPsf, unitInfo.gla);

    const statedMonths = Math.round((l.end.getTime() - l.start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    const leaseId = `lease_${l.suite.replace(/[^a-z0-9]/gi, '_')}_${l.status}_${l.renewalNum}`;

    await prisma.lease.upsert({
      where: { id: leaseId },
      update: {},
      create: {
        id: leaseId,
        propertyId: property.id,
        unitId: unitInfo.id,
        tenantId,
        leaseType: LeaseType.NNN,
        status: l.status,
        renewalNumber: l.renewalNum,
        leaseStart: l.start,
        leaseEnd: l.end,
        constructionMonths: 0,
        abatementMonths: 0,
        statedTermMonths: statedMonths,
        effectiveTermMonths: statedMonths,
        basePsf: l.basePsf,
        camPsf: l.camPsf,
        taxPsf: l.taxPsf,
        insPsf: l.insPsf,
        additionalPsf,
        totalPsf,
        monthlyBase,
        monthlyAdditional,
        monthlyTotal,
        securityDepositAmount: l.secDep,
        securityDepositHeld: l.secDep,
        hasRenewalOption: true,
        renewalOptionTermYears: 3,
        renewalNoticeDueDays: 60,
        holdoverRateMultiplier: 2.00,
        holdoverFlaggedAt: l.isHoldover ? new Date() : null,
        permittedUse: 'Retail',
      },
    });
    leaseCount++;
  }
  console.log(`✅ Leases: ${leaseCount} created`);

  // ─── Parking Agreements ───────────────────────────────────────────────────────
  await prisma.parkingAgreement.upsert({
    where: { id: 'parking_jdbank' },
    update: {},
    create: {
      id: 'parking_jdbank',
      propertyId: property.id,
      partyName: 'JD Bank',
      partyType: 'BANK',
      contactName: 'JD Bank Branch Manager',
      monthlyAmount: 500.00,
      agreementStart: new Date('2020-01-01'),
      isActive: true,
      notes: 'Adjacent property parking sharing agreement',
    },
  });

  await prisma.parkingAgreement.upsert({
    where: { id: 'parking_church' },
    update: {},
    create: {
      id: 'parking_church',
      propertyId: property.id,
      partyName: 'Church Adjacent',
      partyType: 'CHURCH',
      contactName: 'Church Administrator',
      monthlyAmount: 300.00,
      agreementStart: new Date('2018-01-01'),
      isActive: true,
      notes: 'Parking use agreement for overflow Sunday services',
    },
  });
  console.log('✅ Parking agreements: 2 created');

  // ─── Compliance Action Types ──────────────────────────────────────────────────
  const complianceTypes = [
    { id: 'cat_coi', name: 'Certificate of Insurance (COI)', category: 'INSURANCE', isRecurring: true, recurrenceMonths: 12, isRequired: true, isSystem: true },
    { id: 'cat_co', name: 'Certificate of Occupancy (CO)', category: 'PERMIT', isRecurring: false, recurrenceMonths: null, isRequired: true, isSystem: true },
    { id: 'cat_ach', name: 'ACH Authorization Form', category: 'FINANCIAL', isRecurring: false, recurrenceMonths: null, isRequired: true, isSystem: true },
    { id: 'cat_hvac', name: 'HVAC Maintenance Contract', category: 'MAINTENANCE', isRecurring: true, recurrenceMonths: 12, isRequired: true, isSystem: true },
    { id: 'cat_signage', name: 'Exterior Signage Approval', category: 'PERMIT', isRecurring: false, recurrenceMonths: null, isRequired: true, isSystem: true },
    { id: 'cat_occ_lic', name: 'Occupational License', category: 'PERMIT', isRecurring: true, recurrenceMonths: 12, isRequired: true, isSystem: true },
  ];

  for (const ct of complianceTypes) {
    await prisma.complianceActionType.upsert({
      where: { id: ct.id },
      update: {},
      create: ct,
    });
  }
  console.log(`✅ Compliance action types: ${complianceTypes.length} created`);

  // ─── Vendors ─────────────────────────────────────────────────────────────────
  const vendorData = [
    { id: 'v_butcher', company: 'Butcher Air Conditioning', category: 'HVAC', phone: '337-555-1001', isSuggested: true, isPreferred: false },
    { id: 'v_hubbard', company: 'Hubbard Sign Company', category: 'SIGNAGE', phone: '337-555-1002', isSuggested: true, isPreferred: true },
    { id: 'v_plumb1', company: 'Lafayette Plumbing Pro', category: 'PLUMBING', phone: '337-555-1003' },
    { id: 'v_elec1', company: 'Cajun Electric Services', category: 'ELECTRICAL', phone: '337-555-1004' },
    { id: 'v_roof1', company: 'Gulf Coast Roofing', category: 'ROOFING', phone: '337-555-1005' },
    { id: 'v_pest1', company: 'Acadiana Pest Control', category: 'PEST', phone: '337-555-1006' },
    { id: 'v_land1', company: 'Green Thumb Landscaping', category: 'LANDSCAPING', phone: '337-555-1007' },
    { id: 'v_gen1', company: 'Acadiana General Contractors', category: 'GENERAL', phone: '337-555-1008' },
  ];

  for (const v of vendorData) {
    await prisma.vendor.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        companyName: v.company,
        category: v.category,
        phone: v.phone,
        isPreferred: v.isPreferred ?? false,
        isSuggested: v.isSuggested ?? false,
        registrationStatus: VendorRegistrationStatus.APPROVED,
        isActive: true,
      },
    });
  }
  console.log(`✅ Vendors: ${vendorData.length} created`);

  // ─── Tenant Portal User ───────────────────────────────────────────────────────
  const jasonsTenantId = tenants['111-113'];
  if (jasonsTenantId) {
    const portalHash = await bcrypt.hash('TenantTest123!', 12);
    await prisma.tenantUser.upsert({
      where: { email: 'portal@jasonsdeli.com' },
      update: {},
      create: {
        tenantId: jasonsTenantId,
        email: 'portal@jasonsdeli.com',
        passwordHash: portalHash,
        name: "Jason's Deli Portal",
        isActive: true,
        isVerified: true,
      },
    });
    console.log("✅ Tenant portal user: portal@jasonsdeli.com");
  }

  // ─── Sales Tax Config ─────────────────────────────────────────────────────────
  await prisma.salesTaxConfig.upsert({
    where: { id: 'stax_lafayette' },
    update: {},
    create: {
      id: 'stax_lafayette',
      propertyId: property.id,
      jurisdictionCode: '22055',
      stateRate: 0.05,
      localRate: 0.0495,
      effectiveDate: new Date('2025-01-01'),
      notes: 'Lafayette Parish — LA state 5% + local 4.95% as of Jan 1 2025',
    },
  });
  console.log('✅ Sales tax config: Lafayette Parish');

  // ─── Site Plan Shapes ─────────────────────────────────────────────────────────
  // Approximate strip mall layout — single-story linear building
  // SVG viewBox: 0 0 1400 420
  const buildingBg = await prisma.sitePlanShape.upsert({
    where: { id: 'shape_building_bg' },
    update: {},
    create: {
      id: 'shape_building_bg',
      propertyId: property.id,
      label: 'Building',
      shapeType: 'rect',
      svgPoints: '50,80,1350,80,1350,340,50,340',
      isClickable: false,
      fillColor: '#E8E8E8',
      strokeColor: '#CCCCCC',
      order: 0,
    },
  });

  // Unit shapes — proportional to GLA, laid out left to right
  const shapeSuites = [
    { suite: '105', x: 60, y: 90, w: 90, h: 240 },
    { suite: '107', x: 155, y: 90, w: 90, h: 240 },
    { suite: '109', x: 250, y: 90, w: 110, h: 240 },
    { suite: '111-113', x: 365, y: 90, w: 185, h: 240 },
    { suite: '115-117', x: 555, y: 90, w: 200, h: 240 },
    { suite: '117 1/2', x: 760, y: 90, w: 65, h: 240 },
    { suite: '119', x: 830, y: 90, w: 90, h: 240 },
    { suite: '119 1/2', x: 925, y: 90, w: 75, h: 240 },
    { suite: '121', x: 1005, y: 90, w: 80, h: 240 },
    { suite: '123', x: 1090, y: 90, w: 110, h: 240 },
    { suite: '125', x: 1205, y: 90, w: 90, h: 240 },
    { suite: '131', x: 60, y: 90, w: 140, h: 100 },   // second row approximation
    { suite: '133', x: 205, y: 90, w: 110, h: 100 },
    { suite: '135B', x: 320, y: 90, w: 50, h: 100 },
    { suite: '137', x: 375, y: 90, w: 125, h: 100 },
    { suite: '139', x: 505, y: 90, w: 110, h: 100 },
    { suite: '143', x: 620, y: 90, w: 110, h: 100 },
    { suite: '127', x: 735, y: 90, w: 95, h: 100 },
    { suite: '129', x: 835, y: 90, w: 100, h: 100 },
  ];

  for (const s of shapeSuites) {
    const unitInfo = units[s.suite];
    if (!unitInfo) continue;
    await prisma.sitePlanShape.upsert({
      where: { id: `shape_${s.suite.replace(/[^a-z0-9]/gi, '_')}` },
      update: {},
      create: {
        id: `shape_${s.suite.replace(/[^a-z0-9]/gi, '_')}`,
        propertyId: property.id,
        unitId: unitInfo.id,
        label: s.suite,
        shapeType: 'rect',
        svgPoints: `${s.x},${s.y},${s.x + s.w},${s.y},${s.x + s.w},${s.y + s.h},${s.x},${s.y + s.h}`,
        isClickable: true,
        fillColor: '#DBEAFE',
        strokeColor: '#3B82F6',
        textColor: '#1E3A5F',
        order: 1,
      },
    });
  }
  console.log('✅ Site plan shapes seeded');

  // ─── Dashboard Reminders ──────────────────────────────────────────────────────
  // Renewal reminders for leases expiring in 2026
  await prisma.reminder.createMany({
    skipDuplicates: true,
    data: [
      {
        propertyId: property.id,
        title: 'Lease Renewal — The Clothing Loft (115-117)',
        description: 'Lease expires 9/30/2026. Send renewal offer by 7/31/2026 (60-day notice required).',
        dueDate: new Date('2026-07-31'),
      },
      {
        propertyId: property.id,
        title: 'Lease Renewal — Tenant 127',
        description: 'Lease expires 8/31/2026. Send renewal offer by 7/1/2026.',
        dueDate: new Date('2026-07-01'),
      },
    ],
  });
  console.log('✅ Reminders: renewal reminders created');

  // ─── Activity Log ─────────────────────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      propertyId: property.id,
      userId: admin.id,
      userEmail: admin.email,
      action: 'SEED',
      entityType: 'PROPERTY',
      entityId: property.id,
      entityLabel: property.name,
      metadata: { note: 'Initial seed — On The Blvd data loaded' },
    },
  });

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log(`Property: ${property.name}`);
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`Tenant portal: portal@jasonsdeli.com / TenantTest123!`);
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
