import { Department, Patient, VulnerabilityFlags } from '@/types/queue';

export interface MedicalHistory {
  patientId: string;
  patientName: string;
  age: number;
  lastVisit: string | null;
  visitCount: number;
  allergies: string[];
  chronicConditions: string[];
  previousDiagnoses: string[];
  previousMedications: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Simulated historical diagnoses by department
const DEPARTMENT_DIAGNOSES: Record<Department, string[]> = {
  general_medicine: [
    'Viral Fever', 'Upper Respiratory Tract Infection', 'Gastroenteritis',
    'Hypertension', 'Type 2 Diabetes', 'Seasonal Allergies',
    'Migraine', 'Acid Reflux', 'Common Cold'
  ],
  pediatrics: [
    'Viral Fever', 'Tonsillitis', 'Bronchiolitis',
    'Gastroenteritis', 'Ear Infection', 'Chickenpox',
    'Hand-Foot-Mouth Disease', 'Asthma', 'Common Cold'
  ],
  orthopedics: [
    'Knee Osteoarthritis', 'Lower Back Pain', 'Shoulder Impingement',
    'Ankle Sprain', 'Tennis Elbow', 'Carpal Tunnel Syndrome',
    'Hip Arthritis', 'Muscle Strain', 'Joint Pain'
  ],
  gynecology: [
    'Menstrual Irregularities', 'PCOS', 'UTI',
    'Pregnancy Check-up', 'Fibroid Monitoring', 'Endometriosis',
    'Ovarian Cyst', 'Hormonal Imbalance', 'Routine Check-up'
  ],
};

// Common medications by department
const DEPARTMENT_MEDICATIONS: Record<Department, string[]> = {
  general_medicine: [
    'Paracetamol 500mg', 'Azithromycin 500mg', 'Amlodipine 5mg',
    'Metformin 500mg', 'Omeprazole 20mg', 'Cetirizine 10mg'
  ],
  pediatrics: [
    'Paracetamol Syrup', 'Amoxicillin Suspension', 'Salbutamol Inhaler',
    'ORS Sachets', 'Zinc Supplement', 'Multivitamin Drops'
  ],
  orthopedics: [
    'Aceclofenac 100mg', 'Paracetamol 650mg', 'Calcium Supplement',
    'Vitamin D3', 'Diclofenac Gel', 'Muscle Relaxant'
  ],
  gynecology: [
    'Iron Supplement', 'Folic Acid', 'Mefenamic Acid',
    'Oral Contraceptive', 'Calcium + Vitamin D', 'Multivitamin'
  ],
};

// Common allergies in Indian context
const COMMON_ALLERGIES = [
  'None known',
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'Dust mites',
  'Pollen',
];

// Chronic conditions based on age and vulnerabilities
const CHRONIC_CONDITIONS = [
  'None',
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'Thyroid Disorder',
  'COPD',
  'Arthritis',
];

/**
 * Generate simulated medical history for a patient
 * Based on age, department, and vulnerabilities
 */
export function generateMedicalHistory(patient: Patient): MedicalHistory {
  const { age, department, vulnerabilities, name, id } = patient;
  
  // Use patient ID as seed for consistent randomization
  const seed = hashCode(id);
  
  // Generate visit count based on age and chronic conditions
  const visitCount = getVisitCount(age, vulnerabilities, seed);
  
  // Determine if patient has a last visit
  const hasLastVisit = visitCount > 0;
  const lastVisit = hasLastVisit ? getLastVisitDate(seed) : null;
  
  // Generate allergies (10% chance of allergy, 90% none)
  const allergies = getAllergies(seed);
  
  // Generate chronic conditions based on age and vulnerabilities
  const chronicConditions = getChronicConditions(age, vulnerabilities, seed);
  
  // Generate previous diagnoses from department history
  const previousDiagnoses = getPreviousDiagnoses(department, visitCount, seed);
  
  // Generate previous medications
  const previousMedications = getPreviousMedications(department, visitCount, seed);
  
  // Calculate risk level
  const riskLevel = calculateRiskLevel(age, vulnerabilities, chronicConditions);
  
  return {
    patientId: id,
    patientName: name,
    age,
    lastVisit,
    visitCount,
    allergies,
    chronicConditions,
    previousDiagnoses,
    previousMedications,
    riskLevel,
  };
}

// Helper functions

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number = 0): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

function getVisitCount(age: number, vulnerabilities: VulnerabilityFlags, seed: number): number {
  let baseCount = 0;
  
  // Age-based visits
  if (age > 60) baseCount = 3;
  else if (age > 40) baseCount = 2;
  else if (age > 18) baseCount = 1;
  else baseCount = 2; // Children visit more often
  
  // Add visits for vulnerabilities
  if (vulnerabilities.chronicCondition) baseCount += 2;
  if (vulnerabilities.elderly) baseCount += 1;
  if (vulnerabilities.pregnant) baseCount += 3;
  
  // Add some randomness
  const variance = Math.floor(seededRandom(seed, 1) * 3);
  return Math.max(0, baseCount + variance - 1);
}

function getLastVisitDate(seed: number): string {
  const daysAgo = Math.floor(seededRandom(seed, 2) * 90) + 7; // 7-97 days ago
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getAllergies(seed: number): string[] {
  const random = seededRandom(seed, 3);
  
  if (random < 0.9) {
    return ['None known'];
  }
  
  // 10% have allergies
  const allergyIndex = Math.floor(seededRandom(seed, 4) * (COMMON_ALLERGIES.length - 1)) + 1;
  return [COMMON_ALLERGIES[allergyIndex]];
}

function getChronicConditions(
  age: number, 
  vulnerabilities: VulnerabilityFlags, 
  seed: number
): string[] {
  const conditions: string[] = [];
  
  // Chronic condition flag
  if (vulnerabilities.chronicCondition) {
    const index = Math.floor(seededRandom(seed, 5) * (CHRONIC_CONDITIONS.length - 1)) + 1;
    conditions.push(CHRONIC_CONDITIONS[index]);
  }
  
  // Age-based conditions (>40 has higher chance)
  if (age > 60 && seededRandom(seed, 6) > 0.5) {
    const index = Math.floor(seededRandom(seed, 7) * 2) + 1; // Hypertension or Diabetes
    conditions.push(CHRONIC_CONDITIONS[index]);
  }
  
  return conditions.length > 0 ? conditions : ['None'];
}

function getPreviousDiagnoses(
  department: Department, 
  visitCount: number, 
  seed: number
): string[] {
  if (visitCount === 0) return [];
  
  const diagnoses: string[] = [];
  const availableDiagnoses = DEPARTMENT_DIAGNOSES[department];
  const count = Math.min(visitCount, 3); // Show max 3 previous diagnoses
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(seededRandom(seed, 10 + i) * availableDiagnoses.length);
    diagnoses.push(availableDiagnoses[index]);
  }
  
  return diagnoses;
}

function getPreviousMedications(
  department: Department, 
  visitCount: number, 
  seed: number
): string[] {
  if (visitCount === 0) return [];
  
  const medications: string[] = [];
  const availableMeds = DEPARTMENT_MEDICATIONS[department];
  const count = Math.min(visitCount, 3); // Show max 3 previous medications
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(seededRandom(seed, 20 + i) * availableMeds.length);
    medications.push(availableMeds[index]);
  }
  
  return medications;
}

function calculateRiskLevel(
  age: number,
  vulnerabilities: VulnerabilityFlags,
  chronicConditions: string[]
): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // Age-based risk
  if (age > 65) riskScore += 2;
  else if (age > 40) riskScore += 1;
  
  // Vulnerability-based risk
  if (vulnerabilities.elderly) riskScore += 1;
  if (vulnerabilities.pregnant) riskScore += 1;
  if (vulnerabilities.disabled) riskScore += 1;
  if (vulnerabilities.chronicCondition) riskScore += 2;
  
  // Chronic condition risk
  if (chronicConditions.length > 1 || 
      (chronicConditions.length === 1 && chronicConditions[0] !== 'None')) {
    riskScore += 1;
  }
  
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}
