'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function round2(n) { return Math.round(n * 100) / 100; }
function monthlyFromPsf(totalPsf, sqft) { return round2((totalPsf * sqft) / 12); }

async function main() {
  console.log('🌱 Seeding Belle Realty — On The Blvd...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'adam@belle-realty.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: 'Adam Abdalla', role: 'ADMIN' },
  });
  console.log(`✅ Admin user: ${admin.email}`);

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

  const unitData = [
    { suite: '105',     gla: 1800,  notes: 'Painted Bayou' },
    { suite: '107',     gla: 1800,  notes: 'Great American Cookie / Hershey Ice Cream' },
    { suite: '109',     gla: 2400,  notes: 'JC Kate' },
    { suite: '111',     gla: 1200,  notes: "Jason's Deli (part)" },
    { suite: '113',     gla: 2400,  notes: "Jason's Deli (part)" },
    { suite: '115-117', gla: 4800,  notes: 'The Clothing Loft' },
    { suite: '117 1/2', gla: 1200,  notes: 'Victoria Nails' },
    { suite: '119',     gla: 1800,  notes: 'Oupac' },
    { suite: '119 1/2', gla: 1400,  notes: 'Cat Clinic of Lafayette' },
    { suite: '121',     gla: 1600,  notes: 'Magnolia Salon' },
    { suite: '123',     gla: 2400,  notes: 'Tenant 123' },
    { suite: '125',     gla: 1800,  notes: 'Tenant 125' },
    { suite: '127',     gla: 2000,  notes: 'Tenant 127' },
    { suite: '129',     gla: 2200,  notes: 'Tenant 129' },
    { suite: '131',     gla: 3200,  notes: 'Vacant — LOI in progress: Furniture Store', isVacant: true },
    { suite: '133',     gla: 2400,  notes: 'Vacant — no prospect', isVacant: true },
    { suite: '135B',    gla: 800,   notes: 'Owner-occupied — Belle Realty management office', isOwnerOccupied: true },
    { suite: '137',     gla: 2800,  notes: 'Tenant 137' },
    { suite: '139',     gla: 2400,  notes: 'Tenant 139' },
    { suite: '143',     gla: 2400,  notes: '1st Franklin Financial' },
  ];

  const units = {};
  for (const u of unitData) {
    const unit = await prisma.unit.upsert({
      where: { propertyId_suiteNumber: { propertyId: property.id, suiteNumber: u.suite } },
      update: {},
      create: {
        propertyId: property.id,
        suiteNumber: u.suite,
        gla: u.gla,
        isVacant: u.isVacant || false,
        isOwnerOccupied: u.isOwnerOccupied || false,
        notes: u.notes,
        hvacFirstCallTenantCap: 1000.00,
        hvacReplacementTenantPct: 0.25,
      },
    });
    units[u.suite] = { id: unit.id, gla: u.gla };
  }
  console.log(`✅ Units: ${Object.keys(units).length} created`);

  const tenantData = [
    { suite: '105',     legal: 'Painted Bayou, LLC',                      trade: 'Painted Bayou',                email: 'info@paintedbayou.com',       phone: '337-555-0105' },
    { suite: '107',     legal: 'Lafayette Cookies and Cream, LLC',         trade: 'Great American Cookie / Hershey Ice Cream', email: 'manager@gac-lafayette.com', phone: '337-555-0107' },
    { suite: '109',     legal: 'JC Kate, LLC',                             trade: 'JC Kate',                      email: 'jckate@example.com',           phone: '337-555-0109' },
    { suite: '111-113', legal: "Jason's Deli of Lafayette, LLC",           trade: "Jason's Deli",                 email: 'portal@jasonsdeli.com',        phone: '337-555-0111' },
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

  const tenants = {};
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
        classification: 'INLINE',
      },
    });
    tenants[t.suite] = tenant.id;
  }
  console.log(`✅ Tenants: ${Object.keys(tenants).length} created`);

  // Active leases
  const leaseData = [
    { suite: '109', status: 'ACTIVE', start: new Date('2025-10-01'), end: new Date('2028-09-30'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 3808.39, renewalNum: 1 },
    { suite: '143', status: 'ACTIVE', start: new Date('2026-02-01'), end: new Date('2029-01-31'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 3187.01, renewalNum: 1 },
    { suite: '107', status: 'ACTIVE', start: new Date('2022-01-01'), end: new Date('2027-12-31'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 2700.00, renewalNum: 0 },
    { suite: '111-113', status: 'ACTIVE', start: new Date('2020-06-01'), end: new Date('2027-05-31'), basePsf: 13.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 5000.00, renewalNum: 0 },
    { suite: '115-117', status: 'ACTIVE', start: new Date('2023-10-01'), end: new Date('2026-09-30'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 7200.00, renewalNum: 0 },
    { suite: '121', status: 'ACTIVE', start: new Date('2024-01-01'), end: new Date('2026-12-31'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 2560.00, renewalNum: 0 },
    { suite: '105', status: 'ACTIVE', start: new Date('2026-04-01'), end: new Date('2029-03-31'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 3231.16, renewalNum: 1 },
    { suite: '117 1/2', status: 'ACTIVE', start: new Date('2026-03-01'), end: new Date('2029-02-28'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 2719.84, renewalNum: 1 },
    { suite: '119', status: 'ACTIVE', start: new Date('2026-03-01'), end: new Date('2029-02-28'), basePsf: 14.00, camPsf: 3.50, taxPsf: 0.75, insPsf: 0.75, secDep: 2890.42, renewalNum: 1 },
    { suite: '119 1/2', status: 'ACTIVE', start: new Date('2026-03-01'), end: new Date('2029-02-28'), basePsf: 14.00, camPsf: 4.45, taxPsf: 0.75, insPsf: 0.75, secDep: 3035.03, renewalNum: 1 },
  ];

  for (const l of leaseData) {
    const tenantKey = l.suite;
    const tenantId = tenants[tenantKey];
    if (!tenantId) { console.log(`⚠️  No tenant for suite ${l.suite}, skipping lease`); continue; }
    const unitKey = l.suite;
    const unit = units[unitKey];
    if (!unit) { console.log(`⚠️  No unit for suite ${l.suite}, skipping lease`); continue; }

    const totalPsf = l.basePsf + l.camPsf + l.taxPsf + l.insPsf;
    const monthlyBase = monthlyFromPsf(l.basePsf, unit.gla);
    const monthlyAdditional = monthlyFromPsf(l.camPsf + l.taxPsf + l.insPsf, unit.gla);
    const monthlyTotal = monthlyFromPsf(totalPsf, unit.gla);
    // Calculate term months
    const start = l.start;
    const end = l.end;
    const statedTermMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    await prisma.lease.create({
      data: {
        propertyId: property.id,
        tenantId,
        unitId: unit.id,
        leaseType: 'NNN',
        status: l.status,
        leaseStart: l.start,
        leaseEnd: l.end,
        basePsf: l.basePsf,
        camPsf: l.camPsf,
        taxPsf: l.taxPsf,
        insPsf: l.insPsf,
        additionalPsf: 0,
        totalPsf,
        monthlyBase,
        monthlyAdditional,
        monthlyTotal,
        statedTermMonths,
        effectiveTermMonths: statedTermMonths,
        securityDepositAmount: l.secDep,
        renewalNumber: l.renewalNum,
      },
    }).catch(e => console.log(`⚠️  Lease for ${l.suite} already exists or error: ${e.message}`));
  }
  console.log(`✅ Leases seeded`);

  console.log('🎉 Seed complete!');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
