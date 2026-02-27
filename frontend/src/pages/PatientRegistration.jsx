import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';

const COUNTRY_CODES = [
  { code: '+234', label: '+234 (Nigeria)' },
  { code: '+1',   label: '+1 (USA/Canada)' },
  { code: '+44',  label: '+44 (UK)' },
  { code: '+233', label: '+233 (Ghana)' },
  { code: '+254', label: '+254 (Kenya)' },
  { code: '+27',  label: '+27 (South Africa)' },
  { code: '+251', label: '+251 (Ethiopia)' },
  { code: '+255', label: '+255 (Tanzania)' },
  { code: '+256', label: '+256 (Uganda)' },
  { code: '+237', label: '+237 (Cameroon)' },
  { code: '+221', label: '+221 (Senegal)' },
  { code: '+20',  label: '+20 (Egypt)' },
  { code: '+212', label: '+212 (Morocco)' },
  { code: '+91',  label: '+91 (India)' },
  { code: '+86',  label: '+86 (China)' },
  { code: '+81',  label: '+81 (Japan)' },
  { code: '+49',  label: '+49 (Germany)' },
  { code: '+33',  label: '+33 (France)' },
  { code: '+39',  label: '+39 (Italy)' },
  { code: '+34',  label: '+34 (Spain)' },
  { code: '+55',  label: '+55 (Brazil)' },
  { code: '+61',  label: '+61 (Australia)' },
  { code: '+971', label: '+971 (UAE)' },
  { code: '+966', label: '+966 (Saudi Arabia)' },
];

const NOK_RELATIONSHIPS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent',
  'Aunt/Uncle', 'Cousin', 'Friend', 'Guardian', 'Other',
];

const initForm = {
  firstName: '', lastName: '', dob: '', gender: '', phoneCode: '+234', phone: '',
  email: '', address: '', bloodGroup: '',
  nextOfKinName: '', nextOfKinPhoneCode: '+234', nextOfKinPhone: '',
  nextOfKinAddress: '', nextOfKinEmail: '', nextOfKinRelationship: '',
  hypertension: '', diabetes: '', allergies: '', currentMedications: '',
};

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Header title="Patient Registration" />
        <div className="p-8 flex items-center justify-center">
          <div className="card p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Patient has been Registered!</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{form.firstName} {form.lastName}</strong> has been successfully registered in the system.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setSubmitted(false)} className="btn-secondary">Register Another</button>
              <button onClick={() => navigate('/patients')} className="btn-primary">View Patient Registry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ label, name, type = 'text', placeholder, required, children, className = '' }) => (
    <div className={className}>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children || (
        <input type={type} value={form[name]} onChange={e => set(name, e.target.value)}
          className="input-field" placeholder={placeholder} required={required} />
      )}
    </div>
  );

  const Select = ({ label, name, options, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <select value={form[name]} onChange={e => set(name, e.target.value)} className="input-field" required={required}>
        <option value="">Select</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const PhoneField = ({ label, codeName, phoneName, required, className = '' }) => (
    <div className={className}>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="flex">
        <select
          value={form[codeName]}
          onChange={e => set(codeName, e.target.value)}
          className="input-field w-44 rounded-r-none border-r-0 flex-shrink-0"
        >
          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <input
          type="tel"
          value={form[phoneName]}
          onChange={e => set(phoneName, e.target.value)}
          className="input-field rounded-l-none flex-1"
          placeholder="XXXX-XXXX-XXXX"
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header title="Register New Patient" subtitle="Complete all required fields to add a patient to the system" />
      <div className="p-8">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Patient Registry
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="First Name" name="firstName" placeholder="e.g. Chioma" required />
              <Field label="Last Name"  name="lastName"  placeholder="e.g. Eze"    required />
              <Field label="Date of Birth" name="dob" type="date" required />
              <Select label="Gender" name="gender" options={['Male', 'Female', 'Other']} required />
              <PhoneField label="Phone Number" codeName="phoneCode" phoneName="phone" required />
              <Field label="Email Address" name="email" type="email" placeholder="patient@mail.com" />
              <Field label="Home Address" name="address" placeholder="Street, City" className="col-span-2" />
              <Select label="Blood Group" name="bloodGroup" options={['A+','A-','B+','B-','O+','O-','AB+','AB-']} required />
            </div>
          </div>

          {/* Next of Kin */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Next of Kin</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" name="nextOfKinName" placeholder="Full name" required />
              <PhoneField label="Phone Number" codeName="nextOfKinPhoneCode" phoneName="nextOfKinPhone" required />
              <Field label="Address" name="nextOfKinAddress" placeholder="Street, City" />
              <Field label="Email Address" name="nextOfKinEmail" type="email" placeholder="email@mail.com" />
              <div>
                <label className="label">Relationship to Patient</label>
                <select value={form.nextOfKinRelationship} onChange={e => set('nextOfKinRelationship', e.target.value)} className="input-field">
                  <option value="">Select relationship</option>
                  {NOK_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Medical History</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Hypertension" name="hypertension" options={['Yes','No','Unknown']} required />
              <Select label="Diabetes Mellitus" name="diabetes" options={['Yes','No','Unknown']} required />
              <div>
                <label className="label">Allergies</label>
                <textarea value={form.allergies} onChange={e => set('allergies', e.target.value)}
                  className="input-field h-20 resize-none" placeholder="List any known allergies..." />
              </div>
              <div>
                <label className="label">Current Medications</label>
                <textarea value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)}
                  className="input-field h-20 resize-none" placeholder="List current medications..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
            <button type="button" onClick={() => setForm(initForm)} className="btn-secondary">Clear Form</button>
          </div>
        </form>
      </div>
    </div>
  );
}
