// ─── CKD Prediction form field definitions (51 features) ──────────────────────
// Grouped into clinical sections for the UI.

export const predictionSections = [
  {
    title: 'Demographics',
    fields: [
      { name: 'Age',                  type: 'number', range: '18–100',  description: 'Patient age in years' },
      { name: 'Gender',               type: 'select', options: ['Male', 'Female'], description: 'Biological sex' },
      { name: 'Ethnicity',            type: 'select', options: ['Caucasian', 'African American', 'Asian', 'Other'], description: 'Ethnic background' },
      { name: 'SocioeconomicStatus',  type: 'select', options: ['Low', 'Middle', 'High'], description: 'Economic status' },
      { name: 'EducationLevel',       type: 'select', options: ['None', 'High School', "Bachelor's", 'Higher'], description: 'Highest education' },
      { name: 'BMI',                  type: 'number', range: '15–50',   description: 'Body Mass Index (kg/m²)' },
    ],
  },
  {
    title: 'Lifestyle',
    fields: [
      { name: 'Smoking',              type: 'select', options: ['Yes', 'No'], description: 'Current smoker' },
      { name: 'AlcoholConsumption',    type: 'number', range: '0–30',   description: 'Units per week' },
      { name: 'PhysicalActivity',      type: 'number', range: '0–10',   description: 'Hours per week' },
      { name: 'DietQuality',          type: 'number', range: '0–10',   description: '0 = Poor, 10 = Excellent' },
      { name: 'SleepQuality',         type: 'number', range: '0–10',   description: '0 = Poor, 10 = Excellent' },
    ],
  },
  {
    title: 'Medical History',
    fields: [
      { name: 'FamilyHistoryKidneyDisease', type: 'select', options: ['Yes', 'No'], description: 'Family CKD history' },
      { name: 'FamilyHistoryHypertension',  type: 'select', options: ['Yes', 'No'], description: 'Family hypertension' },
      { name: 'FamilyHistoryDiabetes',      type: 'select', options: ['Yes', 'No'], description: 'Family diabetes' },
      { name: 'PreviousAcuteKidneyInjury',  type: 'select', options: ['Yes', 'No'], description: 'Prior AKI episode' },
      { name: 'UrinaryTractInfections',     type: 'select', options: ['Yes', 'No'], description: 'History of UTIs' },
    ],
  },
  {
    title: 'Vitals',
    fields: [
      { name: 'SystolicBP',           type: 'number', range: '80–200',  description: 'mmHg' },
      { name: 'DiastolicBP',          type: 'number', range: '50–130',  description: 'mmHg' },
    ],
  },
  {
    title: 'Lab Results',
    fields: [
      { name: 'FastingBloodSugar',     type: 'number', range: '50–300',  description: 'mg/dL' },
      { name: 'HbA1c',                type: 'number', range: '3–15',    description: '%' },
      { name: 'SerumCreatinine',       type: 'number', range: '0.4–15',  description: 'mg/dL' },
      { name: 'BUNLevels',            type: 'number', range: '5–100',   description: 'mg/dL' },
      { name: 'GFR',                  type: 'number', range: '0–120',   description: 'mL/min/1.73m²' },
      { name: 'ProteinInUrine',        type: 'number', range: '0–5',    description: 'mg/dL' },
      { name: 'ACR',                  type: 'number', range: '0–300',   description: 'mg/g (Albumin-Creatinine Ratio)' },
    ],
  },
  {
    title: 'Electrolytes & Blood',
    fields: [
      { name: 'SerumElectrolytesSodium',    type: 'number', range: '130–150', description: 'mEq/L' },
      { name: 'SerumElectrolytesPotassium',  type: 'number', range: '2.5–7',  description: 'mEq/L' },
      { name: 'SerumElectrolytesCalcium',    type: 'number', range: '7–12',   description: 'mg/dL' },
      { name: 'SerumElectrolytesPhosphorus', type: 'number', range: '2–6',    description: 'mg/dL' },
      { name: 'HemoglobinLevels',           type: 'number', range: '5–18',   description: 'g/dL' },
    ],
  },
  {
    title: 'Cholesterol',
    fields: [
      { name: 'CholesterolTotal',          type: 'number', range: '100–400', description: 'mg/dL' },
      { name: 'CholesterolLDL',            type: 'number', range: '40–250',  description: 'mg/dL' },
      { name: 'CholesterolHDL',            type: 'number', range: '20–100',  description: 'mg/dL' },
      { name: 'CholesterolTriglycerides',  type: 'number', range: '50–500',  description: 'mg/dL' },
    ],
  },
  {
    title: 'Medications',
    fields: [
      { name: 'ACEInhibitors',           type: 'select', options: ['Yes', 'No'], description: 'Currently taking' },
      { name: 'Diuretics',              type: 'select', options: ['Yes', 'No'], description: 'Currently taking' },
      { name: 'NSAIDsUse',              type: 'number', range: '0–10',  description: 'Frequency score' },
      { name: 'Statins',                type: 'select', options: ['Yes', 'No'], description: 'Currently taking' },
      { name: 'AntidiabeticMedications', type: 'select', options: ['Yes', 'No'], description: 'Currently taking' },
    ],
  },
  {
    title: 'Symptoms',
    fields: [
      { name: 'Edema',              type: 'select', options: ['Yes', 'No'], description: 'Swelling present' },
      { name: 'FatigueLevels',       type: 'number', range: '0–10', description: '0 = None, 10 = Severe' },
      { name: 'NauseaVomiting',      type: 'number', range: '0–10', description: '0 = None, 10 = Severe' },
      { name: 'MuscleCramps',        type: 'number', range: '0–10', description: '0 = None, 10 = Severe' },
      { name: 'Itching',            type: 'number', range: '0–10', description: '0 = None, 10 = Severe' },
      { name: 'QualityOfLifeScore',  type: 'number', range: '0–100', description: 'Self-reported (0–100)' },
    ],
  },
  {
    title: 'Environmental & Social',
    fields: [
      { name: 'HeavyMetalsExposure',            type: 'select', options: ['Yes', 'No'], description: 'Exposure history' },
      { name: 'OccupationalExposureChemicals',   type: 'select', options: ['Yes', 'No'], description: 'Chemical exposure' },
      { name: 'WaterQuality',                   type: 'select', options: ['Good', 'Poor'], description: 'Drinking water quality' },
      { name: 'MedicalCheckupsFrequency',        type: 'number', range: '0–10', description: 'Times per year' },
      { name: 'MedicationAdherence',             type: 'number', range: '0–10', description: '0 = Never, 10 = Always' },
      { name: 'HealthLiteracy',                  type: 'number', range: '0–10', description: '0 = Low, 10 = High' },
    ],
  },
];

// Flat list of all features (for validation)
export const predictionFeatures = predictionSections.flatMap(s => s.fields);

// Human-readable labels for camelCase feature names
export const featureLabels = {
  Age: 'Age', Gender: 'Gender', Ethnicity: 'Ethnicity',
  SocioeconomicStatus: 'Socioeconomic Status', EducationLevel: 'Education Level', BMI: 'BMI',
  Smoking: 'Smoking', AlcoholConsumption: 'Alcohol Consumption',
  PhysicalActivity: 'Physical Activity', DietQuality: 'Diet Quality', SleepQuality: 'Sleep Quality',
  FamilyHistoryKidneyDisease: 'Family History (Kidney)', FamilyHistoryHypertension: 'Family History (Hypertension)',
  FamilyHistoryDiabetes: 'Family History (Diabetes)',
  PreviousAcuteKidneyInjury: 'Previous AKI', UrinaryTractInfections: 'UTIs',
  SystolicBP: 'Systolic BP', DiastolicBP: 'Diastolic BP',
  FastingBloodSugar: 'Fasting Blood Sugar', HbA1c: 'HbA1c',
  SerumCreatinine: 'Serum Creatinine', BUNLevels: 'BUN Levels',
  GFR: 'GFR', ProteinInUrine: 'Protein in Urine', ACR: 'ACR',
  SerumElectrolytesSodium: 'Sodium', SerumElectrolytesPotassium: 'Potassium',
  SerumElectrolytesCalcium: 'Calcium', SerumElectrolytesPhosphorus: 'Phosphorus',
  HemoglobinLevels: 'Hemoglobin',
  CholesterolTotal: 'Total Cholesterol', CholesterolLDL: 'LDL Cholesterol',
  CholesterolHDL: 'HDL Cholesterol', CholesterolTriglycerides: 'Triglycerides',
  ACEInhibitors: 'ACE Inhibitors', Diuretics: 'Diuretics',
  NSAIDsUse: 'NSAIDs Use', Statins: 'Statins', AntidiabeticMedications: 'Antidiabetic Meds',
  Edema: 'Edema', FatigueLevels: 'Fatigue Levels', NauseaVomiting: 'Nausea / Vomiting',
  MuscleCramps: 'Muscle Cramps', Itching: 'Itching', QualityOfLifeScore: 'Quality of Life',
  HeavyMetalsExposure: 'Heavy Metals Exposure', OccupationalExposureChemicals: 'Occupational Chemical Exposure',
  WaterQuality: 'Water Quality', MedicalCheckupsFrequency: 'Medical Checkups',
  MedicationAdherence: 'Medication Adherence', HealthLiteracy: 'Health Literacy',
};
