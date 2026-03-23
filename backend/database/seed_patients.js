// =============================================================================
// NephroTrack — Patient Seed Script (120 CKD Dataset Patients)
// Reads the Chronic Kidney Disease CSV dataset, selects 120 patients
// deterministically, maps to Nigerian demographics, and seeds the database.
// Run:  node database/seed_patients.js
// =============================================================================

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// =============================================================================
// Deterministic pseudo-random number generator (mulberry32)
// =============================================================================

function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// =============================================================================
// Nigerian name data
// =============================================================================

const MALE_FIRST_NAMES = [
  'Olumide', 'Chukwuemeka', 'Emmanuel', 'Obinna', 'Tunde', 'Adebayo', 'Musa',
  'Ibrahim', 'Yusuf', 'Chidi', 'Kelechi', 'Uche', 'Ifeanyi', 'Adeola', 'Nnamdi',
  'Oladipo', 'Segun', 'Kayode', 'Femi', 'Babatunde', 'Danjuma', 'Aliyu', 'Haruna',
  'Abdullahi', 'Suleiman', 'Olusegun', 'Gbenga', 'Rotimi', 'Adamu', 'Abubakar',
  'Kunle', 'Bolaji', 'Dapo', 'Ayo', 'Emeka', 'Uchenna', 'Ikechukwu', 'Chibueze',
  'Okechukwu', 'Oluwaseun', 'Jide', 'Bode', 'Lanre', 'Damilola', 'Tobi', 'Obi',
  'Efe', 'Osagie', 'Ehis', 'Osaze', 'Etinosa', 'Osahon', 'Aigbe', 'Osamudiamen',
  'Akpan', 'Edet', 'Okon', 'Udo', 'Aniekan', 'Idongesit', 'Uwem', 'Bassey',
  'Idris', 'Nuhu', 'Garba', 'Tanko', 'Bello', 'Lawal', 'Shehu', 'Kabiru',
  'Rasheed', 'Waheed', 'Jamiu', 'Wasiu', 'Rilwan', 'Saheed', 'Taofeek', 'Yinka',
  'Dotun', 'Wale', 'Lekan', 'Niyi', 'Sola', 'Doyin', 'Deji',
];

const FEMALE_FIRST_NAMES = [
  'Fatimah', 'Amina', 'Ngozi', 'Adaeze', 'Funke', 'Aisha', 'Bukola', 'Chidinma',
  'Ifeoma', 'Nneka', 'Folake', 'Yetunde', 'Halima', 'Hauwa', 'Zainab', 'Hafsat',
  'Rukayat', 'Binta', 'Maryam', 'Sadiya', 'Chiamaka', 'Amarachi', 'Chinelo',
  'Obiageli', 'Adamma', 'Nkechi', 'Chinyere', 'Uju', 'Nkiru', 'Ogechi', 'Ijeoma',
  'Oluwabunmi', 'Temitope', 'Omolara', 'Titilayo', 'Abiodun', 'Ronke', 'Jumoke',
  'Sade', 'Modupe', 'Bimpe', 'Toyin', 'Nike', 'Lara', 'Adetola', 'Bosede',
  'Damilola', 'Oluwakemi', 'Opeyemi', 'Omotola', 'Ese', 'Esohe', 'Osayuki',
  'Abieyuwa', 'Osarenoma', 'Ivie', 'Oghosa', 'Isoken', 'Enobong', 'Aniebiet',
  'Idara', 'Mfoniso', 'Iniobong', 'Emem', 'Itoro', 'Arit', 'Nsikak', 'Uduak',
  'Rahmah', 'Lubabah', 'Nafisah', 'Khadijah', 'Bilkisu', 'Asma', 'Ummu', 'Jamila',
  'Rashidat', 'Muinat', 'Kafayat', 'Suliat', 'Kudirat', 'Nimot', 'Mojisola',
  'Abosede', 'Iyabo',
];

const LAST_NAMES = [
  'Adeyinka', 'Balogun', 'Okonkwo', 'Yusuf', 'Eze', 'Okeke', 'Nwachukwu', 'Garba',
  'Obi', 'Mohammed', 'Adeniyi', 'Ogunleye', 'Bakare', 'Oboh', 'Ofili', 'Kalu',
  'Anyanwu', 'Emeka', 'Madu', 'Nwosu', 'Okafor', 'Onyeka', 'Dike', 'Nwafor',
  'Onuoha', 'Egbuna', 'Achebe', 'Akpabio', 'Effiong', 'Ekpo', 'Udo', 'Udoh',
  'Bassey', 'Inyang', 'Essien', 'Afolabi', 'Oladele', 'Oyelaran', 'Lawal', 'Saliu',
  'Abubakar', 'Aliyu', 'Sani', 'Musa', 'Bello', 'Danladi', 'Abdulkadir', 'Gwadabe',
  'Adeyemo', 'Ogundipe', 'Akinola', 'Akinyemi', 'Olawale', 'Fadipe', 'Oyedele',
  'Adekunle', 'Olayiwola', 'Olatunde', 'Ogunyemi', 'Babajide', 'Adeoye', 'Fajuyi',
  'Adesanya', 'Kolawole', 'Makinde', 'Adegoke', 'Olaniyan', 'Agbaje', 'Fashola',
  'Owolabi', 'Ajao', 'Adediran', 'Ajibade', 'Olajide', 'Oyedepo', 'Omotoso',
  'Ajayi', 'Alabi', 'Olatunji', 'Adebiyi', 'Ibekwe', 'Nzeribe', 'Chukwuma',
  'Okoli', 'Ogbonna', 'Okereke', 'Agu', 'Nwankwo', 'Usman', 'Dikko',
];

const ADDRESSES = [
  '14 Adeniyi Jones Ave, Ikeja, Lagos',
  '45 Sultan Road, Kaduna',
  '8 New Market Road, Onitsha, Anambra',
  '31 Kano Road, Damaturu, Yobe',
  '3 Hospital Road, Enugu',
  '19 Trans-Ekulu Layout, Enugu',
  '5 Kofar Wambai, Kano',
  '22 Zik Avenue, Awka, Anambra',
  '10 Marina Street, Lagos Island, Lagos',
  '7 Sapele Road, Benin City, Edo',
  '15 Aba Road, Port Harcourt, Rivers',
  '42 Airport Road, Abuja',
  '6 Ahmadu Bello Way, Kaduna',
  '33 Nnamdi Azikiwe Street, Idumota, Lagos',
  '18 Yakubu Gowon Way, Jos, Plateau',
  '9 IBB Boulevard, Maitama, Abuja',
  '27 Old Aba Road, Rumuomasi, Port Harcourt',
  '11 Bompai Road, Kano',
  '4 Government House Road, Calabar, Cross River',
  '16 Owerri Road, Umuahia, Abia',
  '23 Akin Adesola Street, Victoria Island, Lagos',
  '38 Awolowo Road, Ikoyi, Lagos',
  '50 Ring Road, Ibadan, Oyo',
  '12 Murtala Mohammed Way, Kano',
  '7 Tafawa Balewa Road, Bauchi',
  '21 Wetheral Road, Owerri, Imo',
  '34 New Haven, Enugu',
  '2 Secretariat Road, Abeokuta, Ogun',
  '8 Okpara Avenue, Enugu',
  '29 Bank Road, Ilorin, Kwara',
  '17 Ogbunabali Road, Port Harcourt, Rivers',
  '44 Asaba-Benin Expressway, Asaba, Delta',
  '5 Jimeta Road, Yola, Adamawa',
  '13 Lamido Crescent, Sokoto',
  '36 Obafemi Awolowo Way, Oke-Ilewo, Abeokuta',
  '20 Zoo Road, Kano',
  '1 State House Road, Minna, Niger',
  '25 Ndidem Usang Iso Road, Calabar',
  '40 Gombe Road, Bauchi',
  '8 Liberty Stadium Road, Ibadan, Oyo',
];

const BLOOD_GROUPS = ['O+', 'O+', 'O+', 'O+', 'A+', 'A+', 'A+', 'B+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const NOK_RELATIONSHIPS = ['Wife', 'Husband', 'Son', 'Daughter', 'Brother', 'Sister', 'Mother', 'Father', 'Uncle', 'Aunt'];

const ALLERGIES_LIST = [
  'Penicillin', 'Sulfonamides', 'Ibuprofen', 'Aspirin', 'Codeine',
  'Amoxicillin', 'Cephalosporins', 'Tetracycline', 'Erythromycin',
  'Latex', 'Dust', 'Peanuts', null, null, null, null, null, null,
];

const VISIT_TYPES = ['Routine', 'Follow-up', 'Consultation', 'Emergency'];

const NOTES_HIGH = [
  'Worsening fatigue, reduced urine output. BP elevated. Nephrology referral arranged.',
  'GFR critically low. Dialysis preparation discussed with patient and family.',
  'Severe anaemia noted. Renal replacement therapy discussion initiated.',
  'Heavy proteinuria. Urgent nephrology referral. Dietary protein restriction advised.',
  'Oedema worsening, haemoglobin low. Fistula assessment for haemodialysis considered.',
  'Progressive CKD with declining renal function. Specialist follow-up in 2 weeks.',
  'Significant electrolyte imbalance. Medication regimen adjusted. Close monitoring advised.',
  'Advanced kidney disease. Patient counselled on treatment options including transplant.',
];

const NOTES_MEDIUM = [
  'Mildly elevated creatinine. Lifestyle modification advised. Follow-up in 3 months.',
  'Borderline GFR with mild proteinuria. Dietary counselling and repeat labs in 6 weeks.',
  'Early CKD changes detected. BP borderline. Started on low-dose ACE inhibitor.',
  'Moderate renal impairment. Medication review completed. Recheck in 8 weeks.',
  'Proteinuria noted. Patient advised on fluid intake and salt restriction.',
  'Stable moderate CKD. Continue current treatment. Annual screening recommended.',
];

const NOTES_LOW = [
  'Routine check-up. All parameters within normal limits. No concerns.',
  'Annual screening. Normal kidney function. No intervention needed.',
  'Healthy renal function. Counselled on maintaining healthy lifestyle.',
  'Normal results. Continue routine monitoring. Next visit in 12 months.',
  'General wellness visit. No abnormalities detected. Patient in good health.',
  'Preventive screening. All labs normal. Encouraged continued physical activity.',
];


// =============================================================================
// CSV Parser (manual, no external dependencies)
// =============================================================================

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n').filter(line => line.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j].trim();
    }
    rows.push(row);
  }
  return rows;
}


// =============================================================================
// Select 120 patients: ~30 with Diagnosis=0, ~90 with Diagnosis=1
// =============================================================================

function selectPatients(allRows) {
  const diag0 = allRows.filter(r => parseInt(r.Diagnosis) === 0);
  const diag1 = allRows.filter(r => parseInt(r.Diagnosis) === 1);

  // Pick 30 from Diagnosis=0 (every ~4th row from 135 total)
  const step0 = Math.floor(diag0.length / 30);
  const selected0 = [];
  for (let i = 0; i < diag0.length && selected0.length < 30; i += step0) {
    selected0.push(diag0[i]);
  }

  // Pick 90 from Diagnosis=1 (every ~17th row from 1524 total)
  const step1 = Math.floor(diag1.length / 90);
  const selected1 = [];
  for (let i = 0; i < diag1.length && selected1.length < 90; i += step1) {
    selected1.push(diag1[i]);
  }

  const combined = [...selected0, ...selected1];
  return shuffle(combined);
}


// =============================================================================
// Map CSV row to patient data
// =============================================================================

function determineRisk(row) {
  const diagnosis = parseInt(row.Diagnosis);
  const gfr = parseFloat(row.GFR);

  if (diagnosis === 0) {
    return { ckd_risk: 'low', ckd_stage: 'No CKD / Stage 1' };
  }

  if (gfr >= 60) {
    return { ckd_risk: 'medium', ckd_stage: 'Stage 2 / Stage 3a' };
  }

  return { ckd_risk: 'high', ckd_stage: 'Stage 3b / Stage 4+' };
}

function generateDOB(age) {
  const baseYear = 2026 - age;
  const dayOffset = randInt(1, 28);
  const month = randInt(1, 12);
  const m = String(month).padStart(2, '0');
  const d = String(dayOffset).padStart(2, '0');
  return `${baseYear}-${m}-${d}`;
}

function generatePhone() {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = pick(prefixes);
  let num = prefix;
  for (let i = 0; i < 8; i++) num += randInt(0, 9);
  return num;
}

function generateEmail(firstName, lastName) {
  // Some patients have no email
  if (rand() < 0.3) return null;
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = pick(domains);
  const fn = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const ln = lastName.toLowerCase().replace(/[^a-z]/g, '');
  const formats = [
    `${fn}.${ln}@${domain}`,
    `${fn}${ln}@${domain}`,
    `${fn}_${ln}${randInt(1, 99)}@${domain}`,
  ];
  return pick(formats);
}

function generateBloodGroup() {
  return pick(BLOOD_GROUPS);
}

function generateMedications(row) {
  const meds = [];
  if (parseInt(row.ACEInhibitors) === 1)  meds.push(pick(['Lisinopril 5mg', 'Enalapril 10mg', 'Ramipril 5mg', 'Losartan 50mg']));
  if (parseInt(row.Diuretics) === 1)      meds.push(pick(['Furosemide 40mg', 'Hydrochlorothiazide 25mg', 'Spironolactone 25mg']));
  if (parseInt(row.Statins) === 1)        meds.push(pick(['Atorvastatin 20mg', 'Rosuvastatin 10mg', 'Simvastatin 20mg']));
  if (parseInt(row.AntidiabeticMedications) === 1) meds.push(pick(['Metformin 500mg', 'Glimepiride 2mg', 'Insulin (Mixtard 30)']));
  if (meds.length === 0) return null;
  return meds.join(', ');
}

function generateHypertension(row) {
  const sysBP = parseFloat(row.SystolicBP);
  if (sysBP > 140 || parseInt(row.FamilyHistoryHypertension) === 1) return 'Yes';
  return 'No';
}

function generateDiabetes(row) {
  const hba1c = parseFloat(row.HbA1c);
  if (parseInt(row.AntidiabeticMedications) === 1 || hba1c > 6.5) return 'Yes';
  return 'No';
}

function generateVisitDate() {
  // Between 2025-10-01 and 2026-03-15
  const start = new Date('2025-10-01').getTime();
  const end = new Date('2026-03-15').getTime();
  const d = new Date(start + rand() * (end - start));
  return d.toISOString().slice(0, 10);
}

function generateHeight(gender) {
  // gender 0=Male, 1=Female
  if (gender === 0) return randInt(165, 188);
  return randInt(152, 172);
}

function generateWeightFromBMI(bmi, heightCm) {
  const heightM = heightCm / 100;
  return Math.round(bmi * heightM * heightM * 10) / 10;
}

function generateAlbumin(diagnosis, gfr) {
  if (diagnosis === 0) {
    return (3.8 + rand() * 1.2).toFixed(2); // 3.8 - 5.0
  }
  if (gfr >= 60) {
    return (3.2 + rand() * 1.0).toFixed(2); // 3.2 - 4.2
  }
  return (2.5 + rand() * 1.2).toFixed(2); // 2.5 - 3.7
}


// =============================================================================
// Unique name generation
// =============================================================================

function generateUniqueNames(patients) {
  const usedNames = new Set();
  const maleNames = shuffle([...MALE_FIRST_NAMES]);
  const femaleNames = shuffle([...FEMALE_FIRST_NAMES]);
  const lastNames = shuffle([...LAST_NAMES]);

  let maleIdx = 0;
  let femaleIdx = 0;
  let lastIdx = 0;

  const results = [];

  for (const row of patients) {
    const gender = parseInt(row.Gender);
    let firstName, lastName, fullName;
    let attempts = 0;

    do {
      if (gender === 0) {
        firstName = maleNames[maleIdx % maleNames.length];
        maleIdx++;
      } else {
        firstName = femaleNames[femaleIdx % femaleNames.length];
        femaleIdx++;
      }
      lastName = lastNames[lastIdx % lastNames.length];
      lastIdx++;
      fullName = `${firstName} ${lastName}`;
      attempts++;
      if (attempts > 300) {
        // Extremely unlikely fallback — append a number
        lastName = lastName + randInt(2, 9);
        fullName = `${firstName} ${lastName}`;
      }
    } while (usedNames.has(fullName));

    usedNames.add(fullName);
    results.push({ firstName, lastName, gender });
  }

  return results;
}


// =============================================================================
// Main seed function
// =============================================================================

async function seedPatients() {
  const csvPath = path.resolve('/Users/Oyinkan/Documents/FINAL YEAR /datasets/Chronic_Kidney_Dsease_data.csv');

  console.log('Reading CSV dataset...');
  const allRows = parseCSV(csvPath);
  console.log(`  Total rows in CSV: ${allRows.length}`);

  const diag0Count = allRows.filter(r => parseInt(r.Diagnosis) === 0).length;
  const diag1Count = allRows.filter(r => parseInt(r.Diagnosis) === 1).length;
  console.log(`  Diagnosis=0: ${diag0Count}  |  Diagnosis=1: ${diag1Count}\n`);

  // Select and shuffle 120 patients
  const selected = selectPatients(allRows);
  console.log(`  Selected ${selected.length} patients (shuffled).\n`);

  // Generate unique names
  const names = generateUniqueNames(selected);

  const client = await pool.connect();

  try {
    // Look up staff users
    const { rows: users } = await client.query(
      `SELECT id, name, role FROM users WHERE role IN ('clinician', 'records_officer') LIMIT 2`
    );
    const clinician      = users.find(u => u.role === 'clinician')       || users[0];
    const recordsOfficer = users.find(u => u.role === 'records_officer') || users[0];

    if (clinician)      console.log(`  Clinician:        ${clinician.name}`);
    if (recordsOfficer) console.log(`  Records Officer:  ${recordsOfficer.name}`);
    console.log();

    // Clear existing patient data (cascade handles visits, lab_results, predictions)
    await client.query('DELETE FROM predictions');
    await client.query('DELETE FROM lab_results');
    await client.query('DELETE FROM invoices');
    await client.query('DELETE FROM visits');
    await client.query('DELETE FROM patients');
    await client.query('ALTER SEQUENCE patient_id_seq RESTART WITH 1');
    console.log('  Cleared existing patient data.\n');

    let countHigh = 0, countMedium = 0, countLow = 0;

    for (let i = 0; i < selected.length; i++) {
      const row = selected[i];
      const { firstName, lastName, gender: genderCode } = names[i];
      const { ckd_risk, ckd_stage } = determineRisk(row);

      const genderStr = genderCode === 0 ? 'Male' : 'Female';
      const age = parseInt(row.Age);
      const dob = generateDOB(age);
      const phone = generatePhone();
      const email = generateEmail(firstName, lastName);
      const address = pick(ADDRESSES);
      const bloodGroup = generateBloodGroup();

      // Next of kin
      const nokRelationship = pick(NOK_RELATIONSHIPS);
      const nokFirstName = genderCode === 0 ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES);
      const nokLastName = lastName;
      const nokName = `${nokFirstName} ${nokLastName}`;
      const nokPhone = generatePhone();
      const nokAddress = rand() < 0.6 ? address : pick(ADDRESSES);

      // Medical fields
      const hypertension = generateHypertension(row);
      const diabetes = generateDiabetes(row);
      const allergies = pick(ALLERGIES_LIST);
      const currentMedications = generateMedications(row);

      // Numeric values from CSV
      const bmi = parseFloat(row.BMI);
      const smoking = parseInt(row.Smoking);
      const alcoholConsumption = parseFloat(row.AlcoholConsumption);
      const physicalActivity = parseFloat(row.PhysicalActivity);
      const dietQuality = parseFloat(row.DietQuality);
      const sleepQuality = parseFloat(row.SleepQuality);
      const familyHistoryKidney = parseInt(row.FamilyHistoryKidneyDisease);
      const familyHistoryHypertension = parseInt(row.FamilyHistoryHypertension);
      const familyHistoryDiabetes = parseInt(row.FamilyHistoryDiabetes);
      const previousAKI = parseInt(row.PreviousAcuteKidneyInjury);
      const uti = parseInt(row.UrinaryTractInfections);
      const ethnicity = parseInt(row.Ethnicity);
      const socioeconomicStatus = parseInt(row.SocioeconomicStatus);
      const educationLevel = parseInt(row.EducationLevel);
      const aceInhibitors = parseInt(row.ACEInhibitors);
      const diuretics = parseInt(row.Diuretics);
      const nsaidsUse = parseFloat(row.NSAIDsUse);
      const statins = parseInt(row.Statins);
      const antidiabeticMeds = parseInt(row.AntidiabeticMedications);
      const edema = parseInt(row.Edema);
      const fatigueLevels = parseFloat(row.FatigueLevels);
      const nauseaVomiting = parseFloat(row.NauseaVomiting);
      const muscleCramps = parseFloat(row.MuscleCramps);
      const itching = parseFloat(row.Itching);
      const qualityOfLifeScore = parseFloat(row.QualityOfLifeScore);
      const heavyMetalsExposure = parseInt(row.HeavyMetalsExposure);
      const occupationalExposure = parseInt(row.OccupationalExposureChemicals);
      const waterQuality = parseInt(row.WaterQuality);
      const medicalCheckups = parseFloat(row.MedicalCheckupsFrequency);
      const medicationAdherence = parseFloat(row.MedicationAdherence);
      const healthLiteracy = parseFloat(row.HealthLiteracy);

      // Visit data
      const visitDate = generateVisitDate();
      const visitType = pick(VISIT_TYPES);
      const bpSystolic = Math.round(parseFloat(row.SystolicBP));
      const bpDiastolic = Math.round(parseFloat(row.DiastolicBP));
      const pulse = randInt(60, 100);
      const temperature = (36.0 + rand() * 1.5).toFixed(1);
      const heightCm = generateHeight(genderCode);
      const weightKg = generateWeightFromBMI(bmi, heightCm);

      let notes;
      if (ckd_risk === 'high')       notes = pick(NOTES_HIGH);
      else if (ckd_risk === 'medium') notes = pick(NOTES_MEDIUM);
      else                            notes = pick(NOTES_LOW);

      // Lab data
      const diagnosis = parseInt(row.Diagnosis);
      const gfr = parseFloat(row.GFR);
      const creatinine = parseFloat(row.SerumCreatinine);
      const bun = parseFloat(row.BUNLevels);
      const glucose = parseFloat(row.FastingBloodSugar);
      const potassium = parseFloat(row.SerumElectrolytesPotassium);
      const hemoglobin = parseFloat(row.HemoglobinLevels);
      const hba1c = parseFloat(row.HbA1c);
      const proteinInUrine = parseFloat(row.ProteinInUrine);
      const acr = parseFloat(row.ACR);
      const sodium = parseFloat(row.SerumElectrolytesSodium);
      const calcium = parseFloat(row.SerumElectrolytesCalcium);
      const phosphorus = parseFloat(row.SerumElectrolytesPhosphorus);
      const cholesterolTotal = parseFloat(row.CholesterolTotal);
      const cholesterolLDL = parseFloat(row.CholesterolLDL);
      const cholesterolHDL = parseFloat(row.CholesterolHDL);
      const cholesterolTriglycerides = parseFloat(row.CholesterolTriglycerides);
      const albumin = generateAlbumin(diagnosis, gfr);

      // -----------------------------------------------------------------------
      // Transaction: INSERT patient -> visit -> lab_results
      // -----------------------------------------------------------------------

      await client.query('BEGIN');

      // 1. Insert patient
      const { rows: patRows } = await client.query(
        `INSERT INTO patients (
           first_name, last_name, dob, gender,
           phone_code, phone, email, address, blood_group,
           nok_name, nok_phone_code, nok_phone, nok_relationship, nok_address,
           ethnicity, socioeconomic_status, education_level,
           bmi, smoking, alcohol_consumption, physical_activity, diet_quality, sleep_quality,
           hypertension, diabetes,
           family_history_kidney_disease, family_history_hypertension, family_history_diabetes,
           previous_acute_kidney_injury, urinary_tract_infections,
           allergies, current_medications,
           ace_inhibitors, diuretics, nsaids_use, statins, antidiabetic_medications,
           edema, fatigue_levels, nausea_vomiting, muscle_cramps, itching, quality_of_life_score,
           heavy_metals_exposure, occupational_exposure_chemicals, water_quality,
           medical_checkups_frequency, medication_adherence, health_literacy,
           ckd_stage, ckd_risk, created_by
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,
           $10,$11,$12,$13,$14,
           $15,$16,$17,
           $18,$19,$20,$21,$22,$23,
           $24,$25,
           $26,$27,$28,$29,$30,
           $31,$32,
           $33,$34,$35,$36,$37,
           $38,$39,$40,$41,$42,$43,
           $44,$45,$46,
           $47,$48,$49,
           $50,$51,$52
         ) RETURNING id`,
        [
          firstName, lastName, dob, genderStr,
          '+234', phone, email, address, bloodGroup,
          nokName, '+234', nokPhone, nokRelationship, nokAddress,
          ethnicity, socioeconomicStatus, educationLevel,
          bmi.toFixed(2), smoking, alcoholConsumption.toFixed(2),
          physicalActivity.toFixed(2), dietQuality.toFixed(2), sleepQuality.toFixed(2),
          hypertension, diabetes,
          familyHistoryKidney, familyHistoryHypertension, familyHistoryDiabetes,
          previousAKI, uti,
          allergies, currentMedications,
          aceInhibitors, diuretics, nsaidsUse.toFixed(2), statins, antidiabeticMeds,
          edema, fatigueLevels.toFixed(2), nauseaVomiting.toFixed(2),
          muscleCramps.toFixed(2), itching.toFixed(2), qualityOfLifeScore.toFixed(2),
          heavyMetalsExposure, occupationalExposure, waterQuality,
          medicalCheckups.toFixed(2), medicationAdherence.toFixed(2), healthLiteracy.toFixed(2),
          ckd_stage, ckd_risk, recordsOfficer?.id || null,
        ]
      );
      const patientId = patRows[0].id;

      // 2. Insert visit
      const { rows: visitRows } = await client.query(
        `INSERT INTO visits (
           patient_id, clinician_id, visit_date, visit_type,
           bp_systolic, bp_diastolic, pulse, temperature, weight, height, notes
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          patientId, clinician?.id || null,
          visitDate, visitType,
          bpSystolic, bpDiastolic, pulse,
          temperature, weightKg, heightCm, notes,
        ]
      );
      const visitId = visitRows[0].id;

      // 3. Insert lab results
      await client.query(
        `INSERT INTO lab_results (
           visit_id, patient_id,
           creatinine, bun, glucose, potassium, hemoglobin, albumin, hba1c, gfr,
           protein_in_urine, acr, sodium, calcium, phosphorus,
           cholesterol_total, cholesterol_ldl, cholesterol_hdl, cholesterol_triglycerides
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          visitId, patientId,
          creatinine.toFixed(2), bun.toFixed(2), glucose.toFixed(2),
          potassium.toFixed(2), hemoglobin.toFixed(1), albumin, hba1c.toFixed(2), gfr.toFixed(2),
          proteinInUrine.toFixed(2), acr.toFixed(2), sodium.toFixed(2),
          calcium.toFixed(2), phosphorus.toFixed(2),
          cholesterolTotal.toFixed(2), cholesterolLDL.toFixed(2),
          cholesterolHDL.toFixed(2), cholesterolTriglycerides.toFixed(2),
        ]
      );

      await client.query('COMMIT');

      // Track counts
      if (ckd_risk === 'high')        countHigh++;
      else if (ckd_risk === 'medium') countMedium++;
      else                            countLow++;

      const icon = ckd_risk === 'high' ? 'HIGH  ' : ckd_risk === 'medium' ? 'MED   ' : 'LOW   ';
      console.log(
        `  [${icon}]  ${patientId}  ${(firstName + ' ' + lastName).padEnd(28)}  ` +
        `Creat: ${creatinine.toFixed(1).padStart(5)}  ` +
        `Hb: ${hemoglobin.toFixed(1).padStart(5)}  ` +
        `GFR: ${gfr.toFixed(0).padStart(4)}`
      );
    }

    console.log(`\n  ${selected.length} patients seeded successfully.`);
    console.log(`  ${countHigh} High risk  |  ${countMedium} Medium risk  |  ${countLow} Low risk\n`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPatients();
