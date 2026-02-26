import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';

const initForm = {
  firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '',
  address: '', bloodGroup: '', nextOfKinName: '', nextOfKinPhone: '',
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Registered!</h3>
            <p className="text-slate-500 text-sm mb-6">
              <strong>{form.firstName} {form.lastName}</strong> has been successfully registered in the system.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setSubmitted(false)} className="btn-secondary">Register Another</button>
              <button onClick={() => navigate('/patients')} className="btn-primary">View Patient List</button>
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

  return (
    <div className="min-h-screen">
      <Header title="Register New Patient" subtitle="Complete all required fields to add a patient to the system" />
      <div className="p-8">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Patient List
        </button>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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
              <Field label="Phone Number" name="phone" placeholder="080-XXXX-XXXX" required />
              <Field label="Email Address" name="email" type="email" placeholder="patient@mail.com" />
              <Field label="Home Address" name="address" placeholder="Street, City" className="col-span-2" />
              <Select label="Blood Group" name="bloodGroup" options={['A+','A-','B+','B-','O+','O-','AB+','AB-']} required />
            </div>
          </div>

          {/* Next of Kin */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Next of Kin</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" name="nextOfKinName" placeholder="Full name" />
              <Field label="Phone" name="nextOfKinPhone" placeholder="080-XXXX-XXXX" />
            </div>
          </div>

          {/* Medical History */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Medical History</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Hypertension" name="hypertension" options={['Yes','No','Unknown']} />
              <Select label="Diabetes Mellitus" name="diabetes" options={['Yes','No','Unknown']} />
              <div>
                <label className="label">Known Allergies</label>
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
