const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Diagnosis = require('../models/Diagnosis');

// Disease prediction database
const diseaseDatabase = {
  'Vomiting': [
    { disease: 'Gastroenteritis', confidence: 75, description: 'Inflammation of the stomach and intestines', treatments: ['Bland diet (boiled chicken and rice)', 'Fresh water access', 'Small frequent meals'], precautions: ['Avoid fatty foods', 'Monitor for dehydration', 'Consult vet if persists > 24 hours'] },
    { disease: 'Parvovirus', confidence: 40, description: 'Highly contagious viral illness', treatments: ['Immediate vet care required', 'IV fluids', 'Anti-nausea medication'], precautions: ['Isolate from other dogs', 'Disinfect surroundings', 'Ensure vaccinations are up to date'] }
  ],
  'Diarrhea': [
    { disease: 'Gastroenteritis', confidence: 80, description: 'Digestive tract inflammation', treatments: ['Bland diet', 'Probiotics', 'Hydration'], precautions: ['Check for blood in stool', 'Monitor hydration levels'] },
    { disease: 'Intestinal Parasites', confidence: 55, description: 'Worms or parasitic infection', treatments: ['Deworming medication', 'Vet consultation'], precautions: ['Regular deworming schedule', 'Clean food and water bowls'] }
  ],
  'Lethargy': [
    { disease: 'Anemia', confidence: 60, description: 'Low red blood cell count', treatments: ['Iron supplements', 'Dietary changes', 'Vet treatment'], precautions: ['Regular blood tests', 'Monitor gum color'] },
    { disease: 'Hypothyroidism', confidence: 45, description: 'Underactive thyroid gland', treatments: ['Thyroid hormone medication', 'Regular vet checkups'], precautions: ['Weight monitoring', 'Exercise regulation'] }
  ],
  'Loss of Appetite': [
    { disease: 'Dental Disease', confidence: 65, description: 'Tooth or gum problems causing pain', treatments: ['Dental cleaning', 'Antibiotics if infected', 'Soft food temporarily'], precautions: ['Regular teeth brushing', 'Dental chews'] },
    { disease: 'Kidney Disease', confidence: 50, description: 'Reduced kidney function', treatments: ['Special kidney diet', 'Increased water intake', 'Vet prescribed medications'], precautions: ['Avoid high-protein foods', 'Regular kidney function tests'] }
  ],
  'Excessive Thirst': [
    { disease: 'Diabetes Mellitus', confidence: 70, description: 'Blood sugar regulation disorder', treatments: ['Insulin therapy', 'Diet management', 'Regular glucose monitoring'], precautions: ['Consistent feeding schedule', 'Weight management', 'Regular vet visits'] },
    { disease: 'Kidney Disease', confidence: 65, description: 'Kidneys not filtering properly', treatments: ['Prescription kidney diet', 'Fluid therapy', 'Medications'], precautions: ['Reduce sodium intake', 'Monitor water intake'] }
  ],
  'Coughing': [
    { disease: 'Kennel Cough', confidence: 80, description: 'Highly contagious respiratory infection', treatments: ['Rest', 'Cough suppressants', 'Antibiotics if bacterial'], precautions: ['Isolate from other dogs', 'Avoid cold air', 'Vaccination'] },
    { disease: 'Heart Disease', confidence: 40, description: 'Cardiac issues causing fluid buildup', treatments: ['Heart medications', 'Low sodium diet', 'Exercise restriction'], precautions: ['Regular cardiac checkups', 'Monitor breathing rate'] }
  ],
  'Itching': [
    { disease: 'Allergies', confidence: 75, description: 'Environmental or food allergies', treatments: ['Antihistamines', 'Hypoallergenic diet', 'Medicated shampoo'], precautions: ['Identify allergen triggers', 'Avoid known allergens'] },
    { disease: 'Mange', confidence: 55, description: 'Skin condition caused by mites', treatments: ['Antiparasitic treatment', 'Medicated baths', 'Vet consultation'], precautions: ['Isolate from other pets', 'Clean bedding regularly'] }
  ],
  'Limping': [
    { disease: 'Arthritis', confidence: 70, description: 'Joint inflammation and pain', treatments: ['Anti-inflammatory medication', 'Joint supplements', 'Physical therapy'], precautions: ['Gentle exercise only', 'Orthopedic bedding', 'Maintain healthy weight'] },
    { disease: 'Injury/Fracture', confidence: 65, description: 'Physical injury to limb', treatments: ['Immediate vet evaluation', 'Rest', 'Possible splinting or surgery'], precautions: ['Restrict movement', 'Apply cold pack gently', 'Do not massage injured area'] }
  ],
  'Fever': [
    { disease: 'Infection', confidence: 75, description: 'Bacterial or viral infection', treatments: ['Antibiotics (if bacterial)', 'Cool compresses', 'Hydration'], precautions: ['Monitor temperature', 'Avoid strenuous activity', 'Keep comfortable'] },
    { disease: 'Inflammation', confidence: 50, description: 'Internal inflammatory response', treatments: ['Anti-inflammatory medications', 'Rest', 'Vet consultation'], precautions: ['Do not give human fever reducers', 'Keep pet cool and hydrated'] }
  ],
  'Seizures': [
    { disease: 'Epilepsy', confidence: 70, description: 'Neurological disorder causing recurring seizures', treatments: ['Anti-seizure medications', 'Regular monitoring', 'Emergency vet care'], precautions: ['Keep environment safe during seizure', 'Do not restrain', 'Time the seizure', 'Emergency vet if > 5 minutes'] },
    { disease: 'Brain Tumor', confidence: 30, description: 'Abnormal growth in brain tissue', treatments: ['Surgery', 'Radiation', 'Palliative care'], precautions: ['Regular neurological exams', 'Medication compliance'] }
  ]
};

// Predict diseases based on symptoms
router.post('/predict', auth, async (req, res) => {
  try {
    const { petId, symptoms } = req.body;
    
    const diseaseMap = {};
    const allTreatments = new Set();
    const allPrecautions = new Set();

    symptoms.forEach(symptom => {
      if (diseaseDatabase[symptom]) {
        diseaseDatabase[symptom].forEach(d => {
          if (!diseaseMap[d.disease]) {
            diseaseMap[d.disease] = { ...d, confidence: 0, symptomCount: 0 };
          }
          diseaseMap[d.disease].confidence = Math.min(95, diseaseMap[d.disease].confidence + d.confidence / symptoms.length);
          diseaseMap[d.disease].symptomCount++;
          d.treatments.forEach(t => allTreatments.add(t));
          d.precautions.forEach(p => allPrecautions.add(p));
        });
      }
    });

    const predictedDiseases = Object.values(diseaseMap)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(d => ({ disease: d.disease, confidence: Math.round(d.confidence), description: d.description }));

    const severity = predictedDiseases[0]?.confidence > 70 ? 'Severe' : predictedDiseases[0]?.confidence > 40 ? 'Moderate' : 'Mild';

    const diagnosis = new Diagnosis({
      pet: petId,
      user: req.user.id,
      symptoms,
      predictedDiseases,
      treatments: [...allTreatments].slice(0, 5),
      precautions: [...allPrecautions].slice(0, 5),
      severity
    });
    await diagnosis.save();

    res.json(diagnosis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get diagnosis history for a pet
router.get('/pet/:petId', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ pet: req.params.petId, user: req.user.id }).sort({ date: -1 });
    res.json(diagnoses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all diagnoses for user
router.get('/', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ user: req.user.id }).populate('pet', 'name breed').sort({ date: -1 });
    res.json(diagnoses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
