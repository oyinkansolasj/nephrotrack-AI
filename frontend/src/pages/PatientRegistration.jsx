import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

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
  const navigate  = useNavigate();
  const { getToken } = useAuth();
  const [form, setForm]       = useState(initForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to register patient.');
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Header title="Patient Registration" />
        <div className="p-4 sm:p-8 flex items-center justify-center">
          <div className="card p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Patient has been Registered!</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{form.firstName} {form.lastName}</strong> has been successfully registered in the system.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setForm(initForm); setSubmitted(false); }} className="btn-secondary">Register Another</button>
              <button onClick={() => navigate('/patients')} className="btn-primary">View Patient Registry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Register New Patient" subtitle="Complete all required fields to add a patient to the system" />
      <div className="p-4 sm:p-8">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Patient Registry
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">First Name<span className="text-red-500 ml-0.5">*</span></label>
                <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" placeholder="e.g. Chioma" required />
              </div>
              <div>
                <label className="label">Last Name<span className="text-red-500 ml-0.5">*</span></label>
                <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" placeholder="e.g. Eze" required />
              </div>
              <div>
                <label className="label">Date of Birth<span className="text-red-500 ml-0.5">*</span></label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">Gender<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field" required>
                  <option value="">Select</option>
                  {['Male', 'Female', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Phone Number<span className="text-red-500 ml-0.5">*</span></label>
                <div className="flex">
                  <select value={form.phoneCode} onChange={e => set('phoneCode', e.target.value)} className="input-field w-44 rounded-r-none border-r-0 flex-shrink-0">
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field rounded-l-none flex-1" placeholder="XXXX-XXXX-XXXX" required />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" placeholder="patient@mail.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Home Address</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className="input-field" placeholder="Street, City" />
              </div>
              <div>
                <label className="label">Blood Group<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className="input-field" required>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Next of Kin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name<span className="text-red-500 ml-0.5">*</span></label>
                <input type="text" value={form.nextOfKinName} onChange={e => set('nextOfKinName', e.target.value)} className="input-field" placeholder="Full name" required />
              </div>
              <div>
                <label className="label">Phone Number<span className="text-red-500 ml-0.5">*</span></label>
                <div className="flex">
                  <select value={form.nextOfKinPhoneCode} onChange={e => set('nextOfKinPhoneCode', e.target.value)} className="input-field w-44 rounded-r-none border-r-0 flex-shrink-0">
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input type="tel" value={form.nextOfKinPhone} onChange={e => set('nextOfKinPhone', e.target.value)} className="input-field rounded-l-none flex-1" placeholder="XXXX-XXXX-XXXX" required />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input type="text" value={form.nextOfKinAddress} onChange={e => set('nextOfKinAddress', e.target.value)} className="input-field" placeholder="Street, City" />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={form.nextOfKinEmail} onChange={e => set('nextOfKinEmail', e.target.value)} className="input-field" placeholder="email@mail.com" />
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Hypertension<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.hypertension} onChange={e => set('hypertension', e.target.value)} className="input-field" required>
                  <option value="">Select</option>
                  {['Yes','No','Unknown'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Diabetes Mellitus<span className="text-red-500 ml-0.5">*</span></label>
                <select value={form.diabetes} onChange={e => set('diabetes', e.target.value)} className="input-field" required>
                  <option value="">Select</option>
                  {['Yes','No','Unknown'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

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
