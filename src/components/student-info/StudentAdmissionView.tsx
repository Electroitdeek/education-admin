'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const ENDPOINT = `${API}/student-info/students`;

const COURSES = [
  'Select',
  'B.Sc. Nursing',
  'Post Basic B.Sc. Nursing',
  'GNM Nursing',
  'ANM Nursing',
  'DMLT Paramedical',
  'DRT Radiology Paramedical',
  'DOT Operation Theatre Paramedical',
];

const SEMESTERS = [
  'Select',
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  '1st Year',
  '2nd Year',
  '3rd Year',
];

const BATCHES = [
  'Select',
  'Batch 2025-2029 (B.Sc. Nursing)',
  'Batch 2025-2028 (GNM Nursing)',
  'Batch 2025-2027 (DMLT Paramedical)',
  'Batch 2024-2028 (B.Sc. Nursing)',
  'Batch 2023-2027 (B.Sc. Nursing)',
];

const GENDERS = ['Select', 'Female', 'Male', 'Other'];
const CATEGORIES = ['Select', 'General', 'OBC', 'SC', 'ST', 'EWS'];
const BLOOD_GROUPS = ['Select', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const STATES = ['Select', 'Maharashtra', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Telangana', 'Goa'];
const DISTRICTS: Record<string, string[]> = {
  Maharashtra: ['Select', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Gangapur', 'Jalna', 'Pune', 'Nashik', 'Mumbai', 'Ahmednagar'],
  Karnataka: ['Select', 'Belagavi', 'Bidar', 'Kalaburagi', 'Bengaluru'],
  Select: ['Select'],
};

interface Props {
  onNavigate?: (view: string) => void;
}

export default function StudentAdmissionView({ onNavigate }: Props) {
  // Collapse Section toggles
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(true);
  const [parentDetailsOpen, setParentDetailsOpen] = useState(true);
  const [otherDetailsOpen, setOtherDetailsOpen] = useState(false);
  const [uploadDocsOpen, setUploadDocsOpen] = useState(false);

  // Modals
  const [isSiblingModalOpen, setIsSiblingModalOpen] = useState(false);
  const [isAddReferralModalOpen, setIsAddReferralModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newReferralName, setNewReferralName] = useState('');
  const [siblingSearch, setSiblingSearch] = useState('');

  // 9 Documents state
  const [documentFiles, setDocumentFiles] = useState<{ [key: string]: string }>({
    'Aadhar Card': '',
    '10th Marksheet': '',
    '12th Marksheet': '',
    'Migration Certificate': '',
    'Caste Certificate': '',
    'Domicile Certificate': '',
    'Jan Aadhar Card': '',
    'Photo (Passport Size)': '',
    'Others': '',
  });

  // Lists from API
  const [referrals, setReferrals] = useState<{ _id: string; name: string }[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hidden file input refs for 4 photos
  const studentPhotoRef = useRef<HTMLInputElement>(null);
  const fatherPhotoRef = useRef<HTMLInputElement>(null);
  const motherPhotoRef = useRef<HTMLInputElement>(null);
  const guardianPhotoRef = useRef<HTMLInputElement>(null);

  // Checkbox helpers
  const [guardianIsCurrent, setGuardianIsCurrent] = useState(false);
  const [permIsCurrent, setPermIsCurrent] = useState(false);

  // Main Form Data
  const [formData, setFormData] = useState({
    // Academic & Core Details
    course: 'B.Sc. Nursing',
    semester: 'Semester 1',
    batch: 'Batch 2025-2029 (B.Sc. Nursing)',
    admissionNo: '',
    rollNo: '',
    biometricId: '',
    admissionDate: '17-10-2026',
    dateOfBirth: '2005-08-14',
    studentPhoto: '',

    // Student Personal
    firstName: '',
    lastName: '',
    gender: 'Female',
    category: 'General',
    religion: 'Hindu',
    caste: 'Maratha',
    mobileNumber: '',
    email: '',

    // Marks & Identification
    tenthMarks: '',
    twelfthMarks: '',
    graduationMarks: '',
    bloodGroup: 'B+',
    aadhaarNo: '',

    // Referral & Sibling
    referralBy: '',
    siblingAdmissionNo: '',
    siblingName: '',
    siblingRelation: 'Brother',

    // Father Details
    fatherName: '',
    fatherPhone: '',
    fatherDob: '',
    fatherOccupation: '',
    marriageAnniversaryDate: '',
    fatherPhoto: '',

    // Mother Details
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    motherPhoto: '',

    // Guardian Details
    guardianIs: 'Father', // Father, Mother, Other
    guardianName: '',
    guardianRelation: 'Father',
    guardianEmail: '',
    guardianPhone: '',
    guardianOccupation: '',
    guardianPhoto: '',
    guardianAddress: '',

    // Address Details
    state: 'Maharashtra',
    district: 'Gangapur',
    pinCode: '431109',
    currentAddress: '',
    permanentAddress: '',

    // Hostel Details
    hostelType: 'Select',
    hostelName: 'Select',
    roomType: 'Select',
    room: 'Select',

    // Miscellaneous Details
    bankAccountNo: '',
    bankName: '',
    ifscCode: '',
    height: '',
    weight: '',
    admittedCourse: 'B.Sc. Nursing',
    asOnDate: '17-10-2026',
    rte: 'No', // Yes | No
    previousSchool: '',
    note: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // 1. Fetch next admission number
    fetch(`${API}/student-info/next-admission-no`)
      .then((res) => res.json())
      .then((data) => {
        if (data.nextAdmissionNo) {
          setFormData((prev) => ({ ...prev, admissionNo: data.nextAdmissionNo }));
        }
      })
      .catch(() => {});

    // 2. Fetch referrals
    fetch(`${API}/student-info/referrals`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReferrals(data);
          if (data.length > 0 && !formData.referralBy) {
            setFormData((prev) => ({ ...prev, referralBy: data[0].name }));
          }
        }
      })
      .catch(() => {});

    // 3. Fetch students list for sibling selector
    fetch(`${API}/student-info/students`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStudentsList(data);
      })
      .catch(() => {});
  }, []);

  // Sync guardian selection
  const handleGuardianRadio = (type: 'Father' | 'Mother' | 'Other') => {
    setFormData((prev) => {
      if (type === 'Father') {
        return {
          ...prev,
          guardianIs: 'Father',
          guardianName: prev.fatherName,
          guardianPhone: prev.fatherPhone,
          guardianRelation: 'Father',
          guardianOccupation: prev.fatherOccupation,
          guardianPhoto: prev.fatherPhoto,
        };
      }
      if (type === 'Mother') {
        return {
          ...prev,
          guardianIs: 'Mother',
          guardianName: prev.motherName,
          guardianPhone: prev.motherPhone,
          guardianRelation: 'Mother',
          guardianOccupation: prev.motherOccupation,
          guardianPhoto: prev.motherPhoto,
        };
      }
      return {
        ...prev,
        guardianIs: 'Other',
        guardianName: '',
        guardianPhone: '',
        guardianRelation: '',
        guardianOccupation: '',
      };
    });
  };

  // Sync addresses
  const handleGuardianAddrCheckbox = (checked: boolean) => {
    setGuardianIsCurrent(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        currentAddress: prev.guardianAddress || `${prev.district}, ${prev.state} - ${prev.pinCode}`,
      }));
    }
  };

  const handlePermanentAddrCheckbox = (checked: boolean) => {
    setPermIsCurrent(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.currentAddress,
      }));
    }
  };

  // Photo upload simulator
  const handlePhotoSelect = (field: 'studentPhoto' | 'fatherPhoto' | 'motherPhoto' | 'guardianPhoto', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [field]: url }));
      showToast('success', `${file.name} selected`);
    }
  };

  // Add Referral Partner Modal
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferralName.trim()) return;
    try {
      const res = await fetch(`${API}/student-info/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newReferralName, referralType: 'Doctor', contact: '9800000000' }),
      });
      if (res.ok) {
        const created = await res.json();
        setReferrals((prev) => [...prev, created]);
        setFormData((prev) => ({ ...prev, referralBy: created.name }));
        setNewReferralName('');
        setIsAddReferralModalOpen(false);
        showToast('success', `Referral partner "${created.name}" added`);
      }
    } catch {
      showToast('error', 'Error adding referral');
    }
  };

  // Sibling Selection
  const handlePickSibling = (student: any) => {
    setFormData((prev) => ({
      ...prev,
      siblingAdmissionNo: student.admissionNo,
      siblingName: `${student.firstName} ${student.lastName || ''}`.trim(),
    }));
    setIsSiblingModalOpen(false);
    showToast('success', `Linked Sibling: ${student.firstName} (${student.admissionNo})`);
  };

  // Submit Admission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName) {
      showToast('error', 'Please enter candidate First Name');
      return;
    }
    if (!formData.mobileNumber) {
      showToast('error', 'Please enter Mobile Number');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('success', `Student ${formData.firstName} ${formData.lastName} admitted successfully! Admission No: #${formData.admissionNo}`);
        setTimeout(() => {
          if (onNavigate) onNavigate('student-details');
        }, 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.message || 'Failed to submit admission form');
      }
    } catch {
      showToast('error', 'Network error connecting to API');
    } finally {
      setSaving(false);
    }
  };

  const filteredSiblingCandidates = studentsList.filter(
    (s) =>
      s.admissionNo.toLowerCase().includes(siblingSearch.toLowerCase()) ||
      `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(siblingSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Hidden File Inputs */}
      <input type="file" ref={studentPhotoRef} accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect('studentPhoto', e)} />
      <input type="file" ref={fatherPhotoRef} accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect('fatherPhoto', e)} />
      <input type="file" ref={motherPhotoRef} accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect('motherPhoto', e)} />
      <input type="file" ref={guardianPhotoRef} accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect('guardianPhoto', e)} />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white font-medium text-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner - Exact from Screenshot 1 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h1 className="text-base font-bold text-slate-800">Student Admission Form</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download Form
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Users className="h-3.5 w-3.5" />
            Import Student
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* ========================================================= */}
        {/* SECTION 1: Student Details (Screenshot 1 & Screenshot 2) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            onClick={() => setStudentDetailsOpen(!studentDetailsOpen)}
            className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
          >
            <span className="font-bold text-slate-800 text-sm">Student Details</span>
            {studentDetailsOpen ? (
              <ChevronUp className="h-4 w-4 text-[#80229a]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>

          {studentDetailsOpen && (
            <div className="p-5 space-y-4">
              {/* Row 1: Course, Semester, Batch, Admission No, Student Photo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Course <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Batch <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {BATCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Admission No.<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.admissionNo}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-bold text-slate-700 cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  {/* Row 2: Roll No, Biometric Id, Admission Date, Date of Birth */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Roll No</label>
                    <input
                      type="text"
                      placeholder="Roll No"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Biometric Id</label>
                    <input
                      type="text"
                      placeholder="Biometric Id"
                      value={formData.biometricId}
                      onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Admission Date</label>
                    <input
                      type="text"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  {/* Row 3: First Name, Last Name, Gender, Category */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Religion, Caste, Mobile Number, Email */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Religion</label>
                    <input
                      type="text"
                      placeholder="Religion"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Caste</label>
                    <input
                      type="text"
                      placeholder="Caste"
                      value={formData.caste}
                      onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>

                {/* Right: Student Photo Box - Exact from Screenshot 1 */}
                <div className="lg:col-span-2 flex flex-col items-center">
                  <label className="block text-slate-600 font-semibold mb-1.5 self-start">Student Photo</label>
                  <div
                    onClick={() => studentPhotoRef.current?.click()}
                    className="relative w-36 h-40 border-2 border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center p-3 cursor-pointer group hover:border-[#80229a] transition overflow-hidden"
                  >
                    {formData.studentPhoto ? (
                      <img src={formData.studentPhoto} alt="Student" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-1">
                          <Users className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 leading-tight">
                          NO IMAGE<br />AVAILABLE
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        studentPhotoRef.current?.click();
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#80229a] text-white flex items-center justify-center shadow hover:bg-[#6c1d83] transition"
                      title="Upload Student Photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 5: Marks & ID (Screenshot 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">10th Marks</label>
                  <input
                    type="text"
                    placeholder="Enter 10th Marks"
                    value={formData.tenthMarks}
                    onChange={(e) => setFormData({ ...formData, tenthMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">12th Marks</label>
                  <input
                    type="text"
                    placeholder="Enter 12th Marks"
                    value={formData.twelfthMarks}
                    onChange={(e) => setFormData({ ...formData, twelfthMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Graduation Marks</label>
                  <input
                    type="text"
                    placeholder="Enter Graduation Marks"
                    value={formData.graduationMarks}
                    onChange={(e) => setFormData({ ...formData, graduationMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                  >
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Aadhaar No.</label>
                  <input
                    type="text"
                    placeholder="Aadhaar No."
                    value={formData.aadhaarNo}
                    onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                  />
                </div>
              </div>

              {/* Row 6: Referral By with Add button & + Add Sibling (Screenshot 2) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-slate-600 font-semibold">Referral By</label>
                  <div className="flex items-center">
                    <select
                      value={formData.referralBy}
                      onChange={(e) => setFormData({ ...formData, referralBy: e.target.value })}
                      className="border border-slate-300 rounded-l-lg px-3 py-2 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#80229a] min-w-[220px]"
                    >
                      <option value="">Select -</option>
                      {referrals.map((r) => (
                        <option key={r._id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddReferralModalOpen(true)}
                      className="px-4 py-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded-r-lg font-semibold text-xs transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {formData.siblingAdmissionNo && (
                    <span className="text-xs bg-purple-50 text-[#80229a] border border-purple-200 px-3 py-1.5 rounded-lg font-medium">
                      Sibling: {formData.siblingName} (#{formData.siblingAdmissionNo})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSiblingModalOpen(true)}
                    className="px-4 py-2 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded-lg font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Sibling
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: Parent / Guardian Details (Screenshots 3, 4 & 5)               */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            onClick={() => setParentDetailsOpen(!parentDetailsOpen)}
            className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
          >
            <span className="font-bold text-slate-800 text-sm">Parent / Guardian Details</span>
            {parentDetailsOpen ? (
              <ChevronUp className="h-4 w-4 text-[#80229a]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>

          {parentDetailsOpen && (
            <div className="p-5 space-y-5">
              {/* Father Row (Screenshot 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Father Name</label>
                    <input
                      type="text"
                      placeholder="Father Name"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Father Phone</label>
                    <input
                      type="tel"
                      placeholder="Father Phone"
                      value={formData.fatherPhone}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Father Dob</label>
                    <input
                      type="date"
                      value={formData.fatherDob}
                      onChange={(e) => setFormData({ ...formData, fatherDob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Father Occupation</label>
                    <input
                      type="text"
                      placeholder="Father Occupation"
                      value={formData.fatherOccupation}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Marriage Anniversary Date</label>
                    <input
                      type="date"
                      value={formData.marriageAnniversaryDate}
                      onChange={(e) => setFormData({ ...formData, marriageAnniversaryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>

                {/* Father Photo Box */}
                <div className="lg:col-span-2 flex flex-col items-center">
                  <label className="block text-slate-600 font-semibold mb-1.5 self-start">Father Photo</label>
                  <div
                    onClick={() => fatherPhotoRef.current?.click()}
                    className="relative w-36 h-40 border-2 border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center p-3 cursor-pointer group hover:border-[#80229a] transition overflow-hidden"
                  >
                    {formData.fatherPhoto ? (
                      <img src={formData.fatherPhoto} alt="Father" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-1">
                          <Users className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 leading-tight">
                          NO IMAGE<br />AVAILABLE
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fatherPhotoRef.current?.click();
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#80229a] text-white flex items-center justify-center shadow hover:bg-[#6c1d83] transition"
                      title="Upload Father Photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mother Row (Screenshot 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-3 border-t border-slate-100">
                <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mother Name</label>
                    <input
                      type="text"
                      placeholder="Mother Name"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mother Phone</label>
                    <input
                      type="tel"
                      placeholder="Mother Phone"
                      value={formData.motherPhone}
                      onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mother Occupation</label>
                    <input
                      type="text"
                      placeholder="Mother Occupation"
                      value={formData.motherOccupation}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>

                {/* Mother Photo Box */}
                <div className="lg:col-span-2 flex flex-col items-center">
                  <label className="block text-slate-600 font-semibold mb-1.5 self-start">Mother Photo</label>
                  <div
                    onClick={() => motherPhotoRef.current?.click()}
                    className="relative w-36 h-40 border-2 border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center p-3 cursor-pointer group hover:border-[#80229a] transition overflow-hidden"
                  >
                    {formData.motherPhoto ? (
                      <img src={formData.motherPhoto} alt="Mother" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-1">
                          <Users className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 leading-tight">
                          NO IMAGE<br />AVAILABLE
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        motherPhotoRef.current?.click();
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#80229a] text-white flex items-center justify-center shadow hover:bg-[#6c1d83] transition"
                      title="Upload Mother Photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Guardian Selection & Fields (Screenshot 4) */}
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-6">
                  <span className="font-semibold text-slate-700">
                    If Guardian Is <span className="text-rose-500">*</span>
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="guardianIs"
                      checked={formData.guardianIs === 'Father'}
                      onChange={() => handleGuardianRadio('Father')}
                      className="text-[#80229a] focus:ring-[#80229a]"
                    />
                    Father
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="guardianIs"
                      checked={formData.guardianIs === 'Mother'}
                      onChange={() => handleGuardianRadio('Mother')}
                      className="text-[#80229a] focus:ring-[#80229a]"
                    />
                    Mother
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="guardianIs"
                      checked={formData.guardianIs === 'Other'}
                      onChange={() => handleGuardianRadio('Other')}
                      className="text-[#80229a] focus:ring-[#80229a]"
                    />
                    Other
                  </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Guardian Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Guardian Name"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Guardian Relation</label>
                      <input
                        type="text"
                        placeholder="Guardian Relation"
                        value={formData.guardianRelation}
                        onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Guardian Email</label>
                      <input
                        type="email"
                        placeholder="Guardian Email"
                        value={formData.guardianEmail}
                        onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Guardian Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Guardian Phone"
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1">Guardian Occupation</label>
                      <input
                        type="text"
                        placeholder="Guardian Occupation"
                        value={formData.guardianOccupation}
                        onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-slate-600 font-semibold mb-1">Guardian Address</label>
                      <textarea
                        rows={2}
                        placeholder="Guardian Address"
                        value={formData.guardianAddress}
                        onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                      />
                    </div>
                  </div>

                  {/* Guardian Photo Box */}
                  <div className="lg:col-span-2 flex flex-col items-center">
                    <label className="block text-slate-600 font-semibold mb-1.5 self-start">Guardian Photo</label>
                    <div
                      onClick={() => guardianPhotoRef.current?.click()}
                      className="relative w-36 h-40 border-2 border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center p-3 cursor-pointer group hover:border-[#80229a] transition overflow-hidden"
                    >
                      {formData.guardianPhoto ? (
                        <img src={formData.guardianPhoto} alt="Guardian" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-1">
                            <Users className="w-8 h-8 opacity-40" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 leading-tight">
                            NO IMAGE<br />AVAILABLE
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          guardianPhotoRef.current?.click();
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#80229a] text-white flex items-center justify-center shadow hover:bg-[#6c1d83] transition"
                        title="Upload Guardian Photo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-banner: Student Address Details (Screenshots 4 & 5) */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="bg-slate-100/90 px-4 py-2 rounded-lg font-bold text-slate-700 text-xs tracking-wide">
                  Student Address Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      {(DISTRICTS[formData.state] || DISTRICTS['Select']).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Pin Code</label>
                    <input
                      type="text"
                      placeholder="Pin Code"
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>

                {/* Checkboxes from Screenshot 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={guardianIsCurrent}
                      onChange={(e) => handleGuardianAddrCheckbox(e.target.checked)}
                      className="rounded text-[#80229a] focus:ring-[#80229a]"
                    />
                    If Guardian Address is Current Address
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={permIsCurrent}
                      onChange={(e) => handlePermanentAddrCheckbox(e.target.checked)}
                      className="rounded text-[#80229a] focus:ring-[#80229a]"
                    />
                    If Permanent Address is Current Address
                  </label>
                </div>

                {/* Side-by-side textareas from Screenshot 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Current Address</label>
                    <textarea
                      rows={3}
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                      placeholder="Current Address"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Permanent Address</label>
                    <textarea
                      rows={3}
                      value={formData.permanentAddress}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                      placeholder="Permanent Address"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: Other Details (Hostel Details & Miscellaneous Details in ONE)  */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            onClick={() => setOtherDetailsOpen(!otherDetailsOpen)}
            className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
          >
            <span className="font-bold text-slate-800 text-sm">Other Details</span>
            {otherDetailsOpen ? (
              <ChevronUp className="h-4 w-4 text-[#80229a]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>

          {otherDetailsOpen && (
            <div className="p-5 space-y-6">
              {/* Sub-section 1: Hostel Details */}
              <div className="space-y-4">
                <div className="bg-slate-100/90 px-4 py-2 rounded-lg font-bold text-slate-700 text-xs tracking-wide">
                  Hostel Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Hostel Type</label>
                    <select
                      value={formData.hostelType}
                      onChange={(e) => setFormData({ ...formData, hostelType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      <option value="Select">Select</option>
                      <option value="Girls Hostel">Girls Hostel</option>
                      <option value="Boys Hostel">Boys Hostel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Hostel Name</label>
                    <select
                      value={formData.hostelName}
                      onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      <option value="Select">Select</option>
                      <option value="Gangapur Campus Hostel Block A">Gangapur Campus Hostel Block A</option>
                      <option value="Gangapur Campus Hostel Block B">Gangapur Campus Hostel Block B</option>
                      <option value="Nursing Cadets Residence">Nursing Cadets Residence</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Room Type</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      <option value="Select">Select</option>
                      <option value="Single Occupancy AC">Single Occupancy AC</option>
                      <option value="Double Sharing Non-AC">Double Sharing Non-AC</option>
                      <option value="Triple Sharing Standard">Triple Sharing Standard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Room</label>
                    <select
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    >
                      <option value="Select">Select</option>
                      <option value="Room 101">Room 101</option>
                      <option value="Room 102">Room 102</option>
                      <option value="Room 201">Room 201</option>
                      <option value="Room 202">Room 202</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-section 2: Miscellaneous Details */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="bg-slate-100/90 px-4 py-2 rounded-lg font-bold text-slate-700 text-xs tracking-wide">
                  Miscellaneous Details
                </div>

                {/* Row 1: Bank Account Number, Bank Name, IFSC Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNo}
                      onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Height, Weight, Admitted Course, As on Date, RTE */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Height</label>
                    <input
                      type="text"
                      placeholder="Height (cm)"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Weight</label>
                    <input
                      type="text"
                      placeholder="Weight (kg)"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Admitted Course</label>
                    <input
                      type="text"
                      value={formData.admittedCourse}
                      onChange={(e) => setFormData({ ...formData, admittedCourse: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">As on Date</label>
                    <input
                      type="text"
                      value={formData.asOnDate}
                      onChange={(e) => setFormData({ ...formData, asOnDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">RTE</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="rte"
                          checked={formData.rte === 'Yes'}
                          onChange={() => setFormData({ ...formData, rte: 'Yes' })}
                          className="text-[#80229a] focus:ring-[#80229a]"
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="rte"
                          checked={formData.rte === 'No'}
                          onChange={() => setFormData({ ...formData, rte: 'No' })}
                          className="text-[#80229a] focus:ring-[#80229a]"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 3: Previous School Details, Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Previous School Details</label>
                    <textarea
                      rows={3}
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Note</label>
                    <textarea
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a] bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: Upload Documents (Screenshots 3 & 4)                           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            onClick={() => setUploadDocsOpen(!uploadDocsOpen)}
            className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
          >
            <span className="font-bold text-slate-800 text-sm">Upload Documents</span>
            {uploadDocsOpen ? (
              <ChevronUp className="h-4 w-4 text-[#80229a]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>

          {uploadDocsOpen && (
            <div className="p-5">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4 w-1/3">TITLE</th>
                      <th className="py-2.5 px-4">DOCUMENTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: 1, title: 'Aadhar Card' },
                      { id: 2, title: '10th Marksheet' },
                      { id: 3, title: '12th Marksheet' },
                      { id: 4, title: 'Migration Certificate' },
                      { id: 5, title: 'Caste Certificate' },
                      { id: 6, title: 'Domicile Certificate' },
                      { id: 7, title: 'Jan Aadhar Card' },
                      { id: 8, title: 'Photo (Passport Size)' },
                      { id: 9, title: 'Others' },
                    ].map((doc) => (
                      <tr key={doc.id} className="hover:bg-purple-50/20 transition">
                        <td className="py-3 px-4 font-semibold text-slate-500 text-center">
                          {doc.id}.
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            readOnly
                            value={doc.title}
                            className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                              <span className="px-3.5 py-1.5 bg-[#80229a] hover:bg-[#6c1d83] text-white rounded font-semibold text-xs shadow-xs inline-block transition">
                                Choose File
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setDocumentFiles((prev) => ({
                                      ...prev,
                                      [doc.title]: file.name,
                                    }));
                                    showToast('success', `${file.name} uploaded for ${doc.title}`);
                                  }
                                }}
                              />
                            </label>
                            <span className="text-xs text-slate-500 italic">
                              {documentFiles[doc.title] || 'No file chosen'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button Bar (Screenshots 2 & 4) */}
        {/* Submit Button Bar (Screenshots 2 & 4) */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#80229a] hover:bg-[#6c1d83] disabled:opacity-50 text-white rounded font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* MODAL: Add Referral                                                       */}
      {/* ========================================================================= */}
      {isAddReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#80229a] to-[#a23bbd] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Referral Partner</h3>
              <button onClick={() => setIsAddReferralModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateReferral} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Partner / Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. A. K. Sharma"
                  value={newReferralName}
                  onChange={(e) => setNewReferralName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReferralModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#80229a] text-white rounded-lg font-semibold shadow"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Select Sibling                                                     */}
      {/* ========================================================================= */}
      {isSiblingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#80229a] to-[#a23bbd] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Select Enrolled Sibling</h3>
              <button onClick={() => setIsSiblingModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sibling by admission no or name..."
                  value={siblingSearch}
                  onChange={(e) => setSiblingSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#80229a]"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {filteredSiblingCandidates.length === 0 ? (
                  <p className="p-4 text-center text-slate-400">No matching students found.</p>
                ) : (
                  filteredSiblingCandidates.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => handlePickSibling(s)}
                      className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Adm #{s.admissionNo} • {s.course}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-[#80229a] rounded font-semibold text-[11px]"
                      >
                        Link Sibling
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsSiblingModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Import Student                                                     */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#80229a] to-[#a23bbd] p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Import Student CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>Upload a CSV file containing student records formatted as per the NLET ERP standard schema.</p>
              <input
                type="file"
                accept=".csv"
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#80229a] hover:file:bg-purple-100"
              />
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    showToast('success', 'Student CSV imported successfully');
                  }}
                  className="px-4 py-1.5 bg-[#80229a] text-white rounded-lg font-semibold shadow"
                >
                  Upload & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
