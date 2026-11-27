'use client';

import React, { useState, useEffect } from 'react';
import AdmissionEnquiryView from '@/components/front-office/AdmissionEnquiryView';
import VisitorsView from '@/components/front-office/VisitorsView';
import PostalDispatchView from '@/components/front-office/PostalDispatchView';
import PostalReceiveView from '@/components/front-office/PostalReceiveView';
import ComplainView from '@/components/front-office/ComplainView';
import SetupFrontOfficeView from '@/components/front-office/SetupFrontOfficeView';
import GatePassView from '@/components/front-office/GatePassView';
import FormView from '@/components/front-office/FormView';
import CollectFeeView from '@/components/fees-collection/CollectFeeView';
import PaymentReceiptView from '@/components/fees-collection/PaymentReceiptView';
import DemandNoticeView from '@/components/fees-collection/DemandNoticeView';
import FeesOpeningBalanceView from '@/components/fees-collection/FeesOpeningBalanceView';
import FeeDiscountView from '@/components/fees-collection/FeeDiscountView';
import FeeMasterView from '@/components/fees-collection/FeeMasterView';
import FeeGroupView from '@/components/fees-collection/FeeGroupView';
import FeesTypesView from '@/components/fees-collection/FeesTypesView';
import FeeFollowUpView from '@/components/fees-collection/FeeFollowUpView';
import ChequesView from '@/components/fees-collection/ChequesView';
import AdvancePaymentView from '@/components/fees-collection/AdvancePaymentView';
import OnlineAdmissionFeeView from '@/components/fees-collection/OnlineAdmissionFeeView';
import FeesReportsView from '@/components/fees-collection/FeesReportsView';
import AddIncomeView from '@/components/income/AddIncomeView';
import SearchIncomeView from '@/components/income/SearchIncomeView';
import IncomeHeadView from '@/components/income/IncomeHeadView';
import AddExpenseView from '@/components/expense/AddExpenseView';
import SearchExpenseView from '@/components/expense/SearchExpenseView';
import ExpenseHeadView from '@/components/expense/ExpenseHeadView';
import StudentDetailsView from '@/components/student-info/StudentDetailsView';
import StudentAdmissionView from '@/components/student-info/StudentAdmissionView';
import StudentCategoriesView from '@/components/student-info/StudentCategoriesView';
import StudentHouseView from '@/components/student-info/StudentHouseView';
import DisabledStudentsView from '@/components/student-info/DisabledStudentsView';
import OnlineAdmissionView from '@/components/student-info/OnlineAdmissionView';
import BatchView from '@/components/student-info/BatchView';
import StudentReferralView from '@/components/student-info/StudentReferralView';
import LinkSiblingsView from '@/components/student-info/LinkSiblingsView';
import StudentUpdateView from '@/components/student-info/StudentUpdateView';
import ImportExportStudentView from '@/components/student-info/ImportExportStudentView';
import StudentReportsView from '@/components/student-info/StudentReportsView';
import InactiveStudentsView from '@/components/student-info/InactiveStudentsView';
import StudentAttendanceView from '@/components/attendance/StudentAttendanceView';
import AttendanceReportView from '@/components/attendance/AttendanceReportView';
import ApproveLeaveView from '@/components/attendance/ApproveLeaveView';
import ClassTimetableView from '@/components/academics/ClassTimetableView';
import TeacherTimetableView from '@/components/academics/TeacherTimetableView';
import DailyTimetableView from '@/components/academics/DailyTimetableView';
import CoCurricularSubjectView from '@/components/academics/CoCurricularSubjectView';
import AssignClassTeacherView from '@/components/academics/AssignClassTeacherView';
import SubjectGroupView from '@/components/academics/SubjectGroupView';
import SubjectsView from '@/components/academics/SubjectsView';
import CourseView from '@/components/academics/CourseView';
import SemesterView from '@/components/academics/SemesterView';
import AdmissionConfigView from '@/components/academics/AdmissionConfigView';
import StudentSubjectsView from '@/components/academics/StudentSubjectsView';
import PromoteStudentsView from '@/components/academics/PromoteStudentsView';
import ExamGroupView from '@/components/examinations/ExamGroupView';
import TermListView from '@/components/examinations/TermListView';
import ExamListView from '@/components/examinations/ExamListView';
import ExamScheduleView from '@/components/examinations/ExamScheduleView';
import MarksRegisterView from '@/components/examinations/MarksRegisterView';
import MarksGradeView from '@/components/examinations/MarksGradeView';
import AdmitCardView from '@/components/examinations/AdmitCardView';
import CoCurricularGradeView from '@/components/examinations/CoCurricularGradeView';
import TeacherCommentView from '@/components/examinations/TeacherCommentView';
import DivisionView from '@/components/examinations/DivisionView';
import ExamAttendanceView from '@/components/examinations/ExamAttendanceView';
import ReportCardView from '@/components/examinations/ReportCardView';
import ExaminationReportsView from '@/components/examinations/ExaminationReportsView';
import OnlineExamListView from '@/components/online-exam/OnlineExamListView';
import QuestionBankView from '@/components/online-exam/QuestionBankView';
import OnlineExamResultView from '@/components/online-exam/OnlineExamResultView';
import { BATCH1_VIEW_IDS, Batch1ViewRenderer } from '@/components/batch1/Batch1Views';
import { BATCH2_VIEW_IDS, Batch2ViewRenderer } from '@/components/batch2/Batch2Views';
import { BATCH3_VIEW_IDS, Batch3ViewRenderer } from '@/components/batch3/Batch3Views';
import { BATCH4_VIEW_IDS, Batch4ViewRenderer } from '@/components/batch4/Batch4Views';
import { BATCH5_VIEW_IDS, Batch5ViewRenderer } from '@/components/batch5/Batch5Views';
import RolesPermissionView from '@/components/system-setting/RolesPermissionView';
import { hasPermission } from '@/lib/permissions';
import AdminLoginView, { AdminUser } from '@/components/auth/AdminLoginView';
import { API_BASE } from '@/components/shared/ErpCrudView';
import {
  Menu,
  Search,
  Maximize2,
  MessageSquare,
  Globe,
  Sun,
  Bell,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Wallet,
  Banknote,
  CreditCard,
  GraduationCap,
  CalendarCheck,
  RotateCw,
  Clock,
  Users,
  FileText,
  BookOpen,
  Award,
  Bus,
  Bed,
  Settings,
  Laptop,
  Video,
  FileSpreadsheet,
  Layers,
  Download,
  ClipboardList,
  FileCheck,
  Megaphone,
  Package,
  Library,
  FileSignature,
  Monitor,
  Landmark,
  BarChart3,
  LayoutGrid,
  Receipt,
  LogOut,
} from 'lucide-react';

// Custom SVG Illustrations matching the friendly 3D/flat ERP aesthetic
const HeadsetIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="72" rx="28" ry="8" fill="#F1F5F9" />
    <circle cx="50" cy="40" r="28" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    <path
      d="M26 42C26 26.536 36.745 14 50 14C63.255 14 74 26.536 74 42"
      stroke="#E11D48"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <rect x="20" y="36" width="10" height="18" rx="5" fill="#E11D48" />
    <rect x="70" y="36" width="10" height="18" rx="5" fill="#E11D48" />
    <path
      d="M72 50C72 61 62 64 54 64H50"
      stroke="#0284C7"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <circle cx="48" cy="64" r="4.5" fill="#0284C7" />
    <circle cx="50" cy="33" r="3.5" fill="#0284C7" />
    <rect x="47" y="39" width="6" height="13" rx="3" fill="#0284C7" />
  </svg>
);

const FollowUpIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="72" rx="28" ry="8" fill="#F1F5F9" />
    {/* Left user */}
    <circle cx="34" cy="36" r="12" fill="#F59E0B" />
    <path d="M20 62C20 52 26 48 34 48C42 48 48 52 48 62" fill="#F59E0B" opacity="0.9" />
    {/* Center user */}
    <circle cx="56" cy="30" r="14" fill="#FBBF24" />
    <path d="M40 62C40 50 47 44 56 44C65 44 72 50 72 62" fill="#FBBF24" />
    {/* Plus badge */}
    <circle cx="68" cy="52" r="10" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M68 47V57M63 52H73" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StudentIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Head & Face */}
    <circle cx="50" cy="40" r="14" fill="#FED7AA" />
    <path d="M43 32C45 30 55 30 57 32" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
    {/* Body with uniform */}
    <path d="M35 68C35 56 42 52 50 52C58 52 65 56 65 68" fill="#0284C7" />
    <path d="M47 52L50 63L53 52" fill="#FFFFFF" />
    <path d="M49 56L51 56L50 65Z" fill="#E11D48" />
    {/* Graduation Cap */}
    <path d="M30 26L50 17L70 26L50 34L30 26Z" fill="#1E293B" />
    <rect x="42" y="27" width="16" height="7" rx="3" fill="#0F172A" />
    <path d="M64 27V38" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="64" cy="39" r="2.5" fill="#F59E0B" />
    {/* Diploma book */}
    <rect x="25" y="58" width="14" height="10" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
    <path d="M29 60H35M29 63H34" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);

const PresenceIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Person */}
    <circle cx="48" cy="38" r="14" fill="#FED7AA" />
    <path d="M40 32C42 27 54 27 56 32" fill="#1E293B" />
    <path d="M34 68C34 54 40 50 48 50C56 50 62 54 62 68" fill="#0F766E" />
    <path d="M45 50L48 60L51 50" fill="#FFFFFF" />
    {/* ID / Check badge */}
    <rect x="60" y="44" width="16" height="22" rx="3" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
    <circle cx="68" cy="51" r="3" fill="#FFFFFF" />
    <rect x="64" y="56" width="8" height="2" rx="1" fill="#FFFFFF" />
    <path d="M64 61L67 63L72 59" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FeesIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Calendar */}
    <rect x="30" y="24" width="38" height="42" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
    <rect x="30" y="24" width="38" height="12" rx="6" fill="#0284C7" />
    <circle cx="38" cy="22" r="2.5" fill="#38BDF8" />
    <circle cx="60" cy="22" r="2.5" fill="#38BDF8" />
    {/* Dates grid */}
    <circle cx="40" cy="44" r="2" fill="#CBD5E1" />
    <circle cx="49" cy="44" r="2" fill="#CBD5E1" />
    <circle cx="58" cy="44" r="2" fill="#CBD5E1" />
    <circle cx="40" cy="52" r="2" fill="#CBD5E1" />
    <circle cx="49" cy="52" r="2" fill="#CBD5E1" />
    {/* Currency Coin */}
    <circle cx="66" cy="55" r="14" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
    <text x="66" y="60" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold">₹</text>
  </svg>
);

const IncomeExpenseIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Ledger Invoice */}
    <rect x="38" y="18" width="32" height="44" rx="4" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2" />
    <line x1="44" y1="26" x2="64" y2="26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="44" y1="32" x2="60" y2="32" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    {/* Calculator */}
    <rect x="22" y="34" width="26" height="36" rx="4" fill="#F1F5F9" stroke="#334155" strokeWidth="2" />
    <rect x="26" y="38" width="18" height="7" rx="1.5" fill="#94A3B8" />
    <circle cx="27" cy="50" r="1.5" fill="#64748B" />
    <circle cx="35" cy="50" r="1.5" fill="#64748B" />
    <circle cx="43" cy="50" r="1.5" fill="#64748B" />
    <circle cx="27" cy="57" r="1.5" fill="#64748B" />
    <circle cx="35" cy="57" r="1.5" fill="#64748B" />
    <circle cx="43" cy="57" r="1.5" fill="#F59E0B" />
    {/* Coin pile */}
    <circle cx="68" cy="60" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <circle cx="64" cy="65" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
  </svg>
);

const StaffIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Head */}
    <circle cx="50" cy="36" r="14" fill="#FED7AA" />
    <path d="M38 30C40 24 60 24 62 30" fill="#334155" />
    {/* Glasses */}
    <circle cx="45" cy="36" r="4" stroke="#1E293B" strokeWidth="1.5" />
    <circle cx="55" cy="36" r="4" stroke="#1E293B" strokeWidth="1.5" />
    <line x1="49" y1="36" x2="51" y2="36" stroke="#1E293B" strokeWidth="1.5" />
    {/* Yellow Shirt */}
    <path d="M34 68C34 52 40 48 50 48C60 48 66 52 66 68" fill="#F59E0B" />
    <path d="M48 48L50 56L52 48" fill="#FFFFFF" />
    {/* Book Stack */}
    <rect x="52" y="56" width="22" height="6" rx="1.5" fill="#0284C7" />
    <rect x="54" y="62" width="20" height="6" rx="1.5" fill="#E11D48" />
  </svg>
);

const StaffPresenceIllustration = () => (
  <svg viewBox="0 0 100 85" className="h-16 w-16" fill="none">
    <ellipse cx="50" cy="74" rx="28" ry="8" fill="#F1F5F9" />
    {/* Person standing */}
    <circle cx="38" cy="36" r="12" fill="#FED7AA" />
    <path d="M26 68C26 52 30 46 38 46C46 46 50 52 50 68" fill="#1E293B" />
    <path d="M36 46L38 54L40 46" fill="#0284C7" />
    {/* Clipboard / Sheet */}
    <rect x="52" y="24" width="26" height="38" rx="4" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2" />
    <rect x="58" y="20" width="14" height="6" rx="2" fill="#0284C7" />
    <line x1="58" y1="34" x2="72" y2="34" stroke="#94A3B8" strokeWidth="2" />
    <line x1="58" y1="40" x2="72" y2="40" stroke="#94A3B8" strokeWidth="2" />
    <line x1="58" y1="46" x2="68" y2="46" stroke="#94A3B8" strokeWidth="2" />
    {/* Pencil */}
    <rect x="74" y="44" width="5" height="18" rx="1.5" transform="rotate(-30 74 44)" fill="#E11D48" />
  </svg>
);

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [birthdayTab, setBirthdayTab] = useState<'student' | 'staff'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshMinutes, setRefreshMinutes] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [studentCount, setStudentCount] = useState<number>(521);
  const [openMenu, setOpenMenu] = useState<string | null>('Front Office'); // Front Office open by default
  const [activeView, setActiveView] = useState<string>('dashboard'); // 'dashboard' | 'admission-enquiry' | ...

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('ginopas_admin_token');
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
        } else {
          localStorage.removeItem('ginopas_admin_token');
          localStorage.removeItem('ginopas_admin_user');
        }
      } catch {
        const cached = localStorage.getItem('ginopas_admin_user');
        if (cached) {
          try {
            setAdminUser(JSON.parse(cached));
          } catch {
            // ignore
          }
        }
      } finally {
        setAuthChecked(true);
      }
    };
    verifySession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // ignore network error on logout
    }
    localStorage.removeItem('ginopas_admin_token');
    localStorage.removeItem('ginopas_admin_user');
    setProfileMenuOpen(false);
    setAdminUser(null);
    setActiveView('dashboard');
  };

  // Fetch count or data from MongoDB API if running
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
        const res = await fetch(`${apiUrl}/users`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStudentCount(521 + data.length);
          }
        }
      } catch {
        // Fallback to static mock numbers from screenshot
      }
    };
    fetchApiData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshMinutes(0);
      setIsRefreshing(false);
    }, 600);
  };

  const menuItems = [
    {
      name: 'Front Office',
      icon: Briefcase,
      children: [
        { id: 'admission-enquiry', label: 'Admission Enquiry' },
        { id: 'visitors-book', label: 'Visitors Book' },
        { id: 'postal-dispatch', label: 'Postal Dispatch' },
        { id: 'postal-receive', label: 'Postal Receive' },
        { id: 'complain', label: 'Complain' },
        { id: 'setup', label: 'Setup Front Office' },
        { id: 'gate-pass', label: 'Gate Pass' },
        { id: 'form', label: 'Form' },
      ],
    },
    {
      name: 'Fees Collection',
      icon: Wallet,
      children: [
        { id: 'collect-fee', label: 'Collect Fee' },
        { id: 'payment-receipt', label: 'Payment Receipt' },
        { id: 'online-admission-fee', label: 'Online Admission Fee' },
        { id: 'demand-notice', label: 'Demand Notice' },
        { id: 'fees-opening-balance', label: 'Fees Opening Balance' },
        { id: 'fee-discount', label: 'Fee Discount' },
        { id: 'fee-master', label: 'Fee Master' },
        { id: 'fees-group', label: 'Fees Group' },
        { id: 'fees-types', label: 'Fees Types' },
        { id: 'fee-follow-up', label: 'Fee Follow Up' },
        { id: 'cheques', label: 'Cheques' },
        { id: 'advance-payment', label: 'Advance Payment' },
        { id: 'fees-reports', label: 'Fees Reports' },
      ],
    },
    {
      name: 'Income',
      icon: Banknote,
      children: [
        { id: 'add-income', label: 'Add Income' },
        { id: 'search-income', label: 'Search Income' },
        { id: 'income-head', label: 'Income Head' },
      ],
    },
    {
      name: 'Expense',
      icon: CreditCard,
      children: [
        { id: 'add-expense', label: 'Add Expense' },
        { id: 'expense-search', label: 'Expense Search' },
        { id: 'expense-head', label: 'Expense Head' },
      ],
    },
    {
      name: 'Student Info',
      icon: GraduationCap,
      children: [
        { id: 'student-admission', label: 'Student Admission' },
        { id: 'online-admission', label: 'Online Admission' },
        { id: 'student-details', label: 'Student Details' },
        { id: 'student-category', label: 'Student Category' },
        { id: 'batch', label: 'Batch' },
        { id: 'student-referral', label: 'Student Referral' },
        { id: 'inactive-students', label: 'Inactive Students' },
        { id: 'link-siblings', label: 'Link Siblings' },
        { id: 'student-update', label: 'Student Update' },
        { id: 'student-reports', label: 'Student Reports' },
      ],
    },
    {
      name: 'Attendance',
      icon: CalendarCheck,
      children: [
        { id: 'student-attendance', label: 'Student Attendance' },
        { id: 'attendance-report', label: 'Attendance Report' },
        { id: 'approve-leave', label: 'Approve Leave' },
      ],
    },
    {
      name: 'Academics',
      icon: BookOpen,
      children: [
        { id: 'class-timetable', label: 'Course Time Table' },
        { id: 'teacher-timetable', label: 'Teacher Timetable' },
        { id: 'daily-timetable', label: 'Daily Time Table' },
        { id: 'co-curricular-subject', label: 'Co-Curricular Subject' },
        { id: 'subjects', label: 'Subject' },
        { id: 'subject-group', label: 'Assign Subjects' },
        { id: 'assign-class-teacher', label: 'Assign Class Teacher' },
        { id: 'course', label: 'Course' },
        { id: 'semester', label: 'Semester' },
        { id: 'promote-students', label: 'Promote Students' },
        { id: 'admission-config', label: 'Admission Configuration' },
        { id: 'student-subjects', label: 'Student Subjects' },
      ],
    },
    {
      name: 'Examinations',
      icon: FileText,
      children: [
        { id: 'term-list', label: 'Term List' },
        { id: 'exam-list', label: 'Exam List' },
        { id: 'exam-schedule', label: 'Exam Schedule' },
        { id: 'admit-card', label: 'Admit Card' },
        { id: 'marks-register', label: 'Marks Register' },
        { id: 'co-curricular-grade', label: 'Co-Curricular Grade' },
        { id: 'teacher-remark', label: 'Teacher Remark' },
        { id: 'marks-grade', label: 'Grade List' },
        { id: 'exam-division', label: 'Division' },
        { id: 'exam-attendance', label: 'Attendance' },
        { id: 'report-card', label: 'Report Card' },
        { id: 'examination-report', label: 'Examination Report' },
        { id: 'exam-group', label: 'Exam Group' },
      ],
    },
    {
      name: 'Online Exam',
      icon: Laptop,
      children: [
        { id: 'online-exam', label: 'Online Exam' },
        { id: 'question-bank', label: 'Question Bank' },
        { id: 'online-exam-result', label: 'Online Exam Result' },
      ],
    },
    {
      name: 'Online Class',
      icon: Video,
      children: [
        { id: 'online-class', label: 'Online Class' },
        { id: 'online-class-timetable', label: 'Online Class Teacher Timetable' },
        { id: 'online-class-attendees', label: 'Online Class Attendees Report' },
      ],
    },
    {
      name: 'Question Paper',
      icon: FileSpreadsheet,
      children: [
        { id: 'qp-type', label: 'Type' },
        { id: 'qp-question', label: 'Question' },
        { id: 'qp-generate', label: 'Generate' },
      ],
    },
    {
      name: 'Other programs',
      icon: Layers,
      children: [
        { id: 'op-parameter', label: 'Parameter' },
        { id: 'op-assessment', label: 'Assessment' },
        { id: 'op-report', label: 'Other Programs Report' },
      ],
    },
    {
      name: 'Download Center',
      icon: Download,
      children: [
        { id: 'dc-upload', label: 'Upload Content' },
        { id: 'dc-assignments', label: 'Assignments' },
        { id: 'dc-study-material', label: 'Study Material' },
        { id: 'dc-syllabus', label: 'Syllabus' },
        { id: 'dc-other', label: 'Other Downloads' },
        { id: 'dc-videos', label: 'Videos' },
      ],
    },
    {
      name: 'Lesson Planner',
      icon: ClipboardList,
      children: [
        { id: 'lp-lesson', label: 'Lesson' },
        { id: 'lp-topic', label: 'Topic' },
        { id: 'lp-manage', label: 'Manage Lesson Planner' },
        { id: 'lp-report', label: 'Lesson Planner Report' },
        { id: 'lp-topic-report', label: 'Topic Report' },
        { id: 'lp-topic-progress', label: 'Topic Progress Report' },
        { id: 'lp-lesson-progress', label: 'Lesson Progress Report' },
      ],
    },
    {
      name: 'Assignment',
      icon: FileCheck,
      children: [
        { id: 'assign-add', label: 'Add Assignment' },
        { id: 'assign-eval', label: 'Evaluation Report' },
      ],
    },
    {
      name: 'Communicate',
      icon: Megaphone,
      children: [
        { id: 'comm-notice', label: 'Notice Board' },
        { id: 'comm-send', label: 'Send Email / SMS' },
        { id: 'comm-log', label: 'Email / SMS Log' },
      ],
    },
    {
      name: 'Human Resource',
      icon: Users,
      children: [
        { id: 'hr-staff', label: 'Staff Directory' },
        { id: 'hr-recruitment', label: 'Recruitment' },
        { id: 'hr-attendance', label: 'Staff Attendance' },
        { id: 'hr-apply-leave', label: 'Apply Leave' },
        { id: 'hr-approve-leave', label: 'Approve Leave Request' },
        { id: 'hr-leave-type', label: 'Leave Type' },
        { id: 'hr-payroll', label: 'Payroll' },
        { id: 'hr-advance', label: 'Staff Advance' },
        { id: 'hr-department', label: 'Department' },
        { id: 'hr-designation', label: 'Designation' },
        { id: 'hr-inactive-staff', label: 'Inactive Staff' },
        { id: 'hr-reports', label: 'Human Resource Reports' },
      ],
    },
    {
      name: 'Inventory',
      icon: Package,
      children: [
        { id: 'inv-category', label: 'Item Category' },
        { id: 'inv-sub-category', label: 'Item Sub Category' },
        { id: 'inv-add-item', label: 'Add Item' },
        { id: 'inv-item-set', label: 'Item Set' },
        { id: 'inv-store', label: 'Item Store' },
        { id: 'inv-supplier', label: 'Item Supplier' },
        { id: 'inv-add-stock', label: 'Add Item Stock' },
        { id: 'inv-sell-item', label: 'Sell Item' },
        { id: 'inv-issue-item', label: 'Issue Item' },
        { id: 'inv-workorder', label: 'Workorder' },
        { id: 'inv-workorder-payment', label: 'Workorder Payment' },
        { id: 'inv-sold-payments', label: 'Sold Item Payments' },
        { id: 'inv-sales-report', label: 'Inventory Sales Report' },
        { id: 'inv-stock-reminder', label: 'Stock Reminder List' },
        { id: 'inv-return-item', label: 'Return Item' },
        { id: 'inv-sales-return', label: 'Sales Return' },
        { id: 'inv-profit-loss', label: 'Estimated Profit & Loss' },
      ],
    },
    {
      name: 'Library',
      icon: Library,
      children: [
        { id: 'lib-books', label: 'Book List' },
        { id: 'lib-issue-return', label: 'Issue / Return' },
        { id: 'lib-add-student', label: 'Add Student' },
        { id: 'lib-add-staff', label: 'Add Staff' },
        { id: 'lib-report', label: 'Issued Return Report' },
      ],
    },
    {
      name: 'Transport',
      icon: Bus,
      children: [
        { id: 'trans-route-vehicle', label: 'Route & Vehicle' },
        { id: 'trans-bus-stop', label: 'Bus Stop' },
        { id: 'trans-assign', label: 'Student Transport Assign' },
        { id: 'trans-change-stop', label: 'Change Bus Stop' },
        { id: 'trans-vehicle', label: 'Vehicle Management' },
        { id: 'trans-vehicle-doc', label: 'Vehicle Document' },
        { id: 'trans-report', label: 'Transport Report' },
      ],
    },
    {
      name: 'Hostel',
      icon: Bed,
      children: [
        { id: 'hostel-list', label: 'Hostel' },
        { id: 'hostel-room-type', label: 'Room Type' },
        { id: 'hostel-rooms', label: 'Hostel Rooms' },
        { id: 'hostel-assign', label: 'Hostel Room Assign' },
        { id: 'hostel-change', label: 'Change Hostel' },
        { id: 'hostel-students', label: 'Hostel Student Details' },
      ],
    },
    {
      name: 'Certificate',
      icon: Award,
      children: [
        { id: 'cert-student', label: 'Student Certificate' },
        { id: 'cert-staff', label: 'Staff Certificate' },
        { id: 'cert-student-id', label: 'Student Id Card' },
        { id: 'cert-staff-id', label: 'Staff Id Card' },
        { id: 'cert-id-config', label: 'ID Card Configuration' },
      ],
    },
    {
      name: 'Consent Letter',
      icon: FileSignature,
      children: [
        { id: 'cl-letter', label: 'Consent Letter' },
        { id: 'cl-assign', label: 'Assign Consent Letter' },
        { id: 'cl-report', label: 'Consent Letter Report' },
      ],
    },
    {
      name: 'Digital Notice Board',
      icon: Monitor,
      children: [{ id: 'dnb-board', label: 'Digital Notice Board' }],
    },
    {
      name: 'Student Wallet',
      icon: Wallet,
      children: [
        { id: 'wallet-main', label: 'Wallet' },
        { id: 'wallet-history', label: 'Wallet History' },
      ],
    },
    {
      name: 'Bank Info',
      icon: Landmark,
      children: [
        { id: 'bank-list', label: 'Bank' },
        { id: 'bank-account-type', label: 'Account Type' },
        { id: 'bank-account-list', label: 'Account List' },
        { id: 'bank-passbook', label: 'Passbook' },
        { id: 'bank-passbook-report', label: 'Passbook Report' },
      ],
    },
    {
      name: 'Report',
      icon: BarChart3,
      children: [
        { id: 'rep-transaction', label: 'Transaction Report' },
        { id: 'rep-activity', label: 'Activity Log' },
        { id: 'rep-tally', label: 'Tally Report' },
        { id: 'rep-document', label: 'Document Availability' },
        { id: 'rep-app-login', label: 'App Login Status' },
      ],
    },
    {
      name: 'Front CMS',
      icon: LayoutGrid,
      children: [
        { id: 'cms-events', label: 'Events' },
        { id: 'cms-sections', label: 'Sections' },
        { id: 'cms-gallery', label: 'Gallery' },
        { id: 'cms-notice', label: 'Notice' },
        { id: 'cms-media', label: 'Media Manager' },
        { id: 'cms-pages', label: 'Pages' },
        { id: 'cms-menus', label: 'Menus' },
        { id: 'cms-counter', label: 'Counter' },
        { id: 'cms-banner', label: 'Banner Image' },
        { id: 'cms-testimonials', label: 'Testimonials' },
        { id: 'cms-blogs', label: 'Blogs' },
        { id: 'cms-courses', label: 'Courses' },
      ],
    },
    {
      name: 'Subscription',
      icon: Receipt,
      children: [{ id: 'sub-installment-report', label: 'Subscription Installment Report' }],
    },
    {
      name: 'System Setting',
      icon: Settings,
      children: [
        { id: 'set-general', label: 'General Setting' },
        { id: 'set-custom-columns', label: 'Custom Columns' },
        { id: 'set-document-master', label: 'Document Master' },
        { id: 'set-meta-data', label: 'Meta Data' },
        { id: 'set-language', label: 'Language' },
        { id: 'set-session', label: 'Session Setting' },
        { id: 'set-institute-times', label: 'Institute Times' },
        { id: 'set-referral', label: 'Referral Setting' },
        { id: 'set-template', label: 'Template Setting' },
        { id: 'set-staff-slots', label: 'Staff Time Slots' },
        { id: 'set-communication', label: 'Communication Setting' },
        { id: 'set-biometric', label: 'Biometric Setup' },
        { id: 'set-payment', label: 'Payment Setting' },
        { id: 'set-firebase', label: 'Firebase Details' },
        { id: 'set-front-cms', label: 'Front CMS Setting' },
        { id: 'set-student-delete', label: 'Student Delete' },
        { id: 'set-remove-session', label: 'Remove Student Session' },
        { id: 'set-roles', label: 'Roles Permission' },
        { id: 'set-backup', label: 'Backup / Restore' },
        { id: 'set-disabled-status', label: 'Student Disabled Status' },
        { id: 'set-users', label: 'Users' },
        { id: 'set-configurations', label: 'Configurations' },
        { id: 'set-student-privilege', label: 'Student Privilege' },
        { id: 'set-staff-privilege', label: 'Staff Privilege' },
      ],
    },
  ];

  const MENU_MODULE_MAP: Record<string, string> = {
    'Front Office': 'front-office',
    'Fees Collection': 'fees-collection',
    'Income': 'income',
    'Expense': 'expense',
    'Student Info': 'student-info',
    'Attendance': 'attendance',
    'Academics': 'academics',
    'Examinations': 'examinations',
    'Online Exam': 'online-exam',
    'Online Class': 'online-class',
    'Question Paper': 'question-paper',
    'Other Programs': 'other-programs',
    'Download Center': 'download-center',
    'Lesson Planner': 'lesson-planner',
    'Assignment': 'assignment',
    'Communicate': 'communicate',
    'Human Resource': 'human-resource',
    'Inventory': 'inventory',
    'Library': 'library',
    'Transport': 'transport',
    'Hostel': 'hostel',
    'Certificate': 'certificate',
    'Consent Letter': 'consent-letter',
    'Digital Notice Board': 'digital-notice-board',
    'Student Wallet': 'student-wallet',
    'Bank Info': 'bank-info',
    'Report': 'reports',
    'Front CMS': 'front-cms',
    'Subscription': 'subscription',
    'System Setting': 'system-setting',
  };

  const filteredMenu = menuItems.filter((item) => {
    const modKey = MENU_MODULE_MAP[item.name];
    if (modKey && !hasPermission(adminUser, modKey, 'view')) {
      return false;
    }
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.children.some((c) => c.label.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const studentBirthdays = [
    {
      name: 'VIVEK KUMAR GHENGHAT',
      date: '17th Oct',
      avatarBg: 'bg-emerald-100 text-emerald-800',
      initials: 'VK',
    },
    {
      name: 'UTTAM SINGH',
      date: '18th Oct',
      avatarBg: 'bg-amber-100 text-amber-800',
      initials: 'US',
    },
    {
      name: 'ANIKET PATIL',
      date: '24th Oct',
      avatarBg: 'bg-indigo-100 text-indigo-800',
      initials: 'AP',
    },
  ];

  const staffBirthdays = [
    {
      name: 'DR. POOJA SHARMA',
      date: '21st Oct',
      avatarBg: 'bg-rose-100 text-rose-800',
      initials: 'PS',
    },
    {
      name: 'PROF. RAJESH KUMAR',
      date: '27th Oct',
      avatarBg: 'bg-sky-100 text-sky-800',
      initials: 'RK',
    },
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#80229a] flex items-center justify-center text-white text-sm font-semibold">
        Verifying session...
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLoginView onLoginSuccess={(user) => setAdminUser(user)} />;
  }

  return (
    <div className="h-screen max-h-screen bg-[#80229a] flex flex-col font-sans select-none overflow-hidden">
      {/* ============================================================== */}
      {/* TOP APP HEADER BAR */}
      {/* ============================================================== */}
      <header className="h-16 px-4 md:px-6 flex items-center justify-between text-white border-b border-purple-700/40">
        {/* Left: Institute Emblem & Brand Title */}
        <div
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to go to Dashboard"
        >
          {/* Logo Badge */}
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 shadow group-hover:scale-105 transition">
            <svg viewBox="0 0 100 100" className="h-8 w-8">
              <circle cx="50" cy="50" r="45" fill="#facc15" opacity="0.2" />
              {/* Sun rays */}
              <path
                d="M50 15L53 25L50 22L47 25Z M30 22L38 29L35 27L33 30Z M70 22L67 30L65 27L62 29Z M20 37L29 41L27 39L26 43Z M80 37L74 43L73 39L71 41Z"
                fill="#facc15"
              />
              {/* Rising Sun */}
              <circle cx="50" cy="52" r="18" fill="#f59e0b" />
              {/* Lotus Base */}
              <path
                d="M32 60C38 52 46 56 50 62C54 56 62 52 68 60C62 66 54 66 50 64C46 66 38 66 32 60Z"
                fill="#38bdf8"
              />
              <path
                d="M40 64C45 58 50 60 50 64C50 60 55 58 60 64C55 68 50 68 50 66C50 68 45 68 40 64Z"
                fill="#0284c7"
              />
            </svg>
          </div>

          <button className="p-1.5 hover:bg-white/10 rounded-lg transition" aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </button>

          <span className="font-bold tracking-wide text-sm md:text-base drop-shadow-sm uppercase group-hover:text-amber-200 transition">
            GANGAPUR INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
          </span>
        </div>

        {/* Right Action Icons & User Control */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90">
            <Search className="h-4 w-4" />
          </button>

          {/* Academic Year Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/20 border border-white/25 rounded-md text-xs font-semibold tracking-wide cursor-pointer shadow-sm">
            <Clock className="h-3.5 w-3.5 text-white/90" />
            <span>2025-26</span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => { });
              } else {
                document.exitFullscreen().catch(() => { });
              }
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Messages Icon with Badge */}
          <div className="relative cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition">
            <MessageSquare className="h-4 w-4 text-white/90" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white ring-1 ring-white">
              0
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/10 rounded cursor-pointer">
            <Globe className="h-3.5 w-3.5 text-white/90" />
            <span className="font-semibold">EN</span>
            <ChevronDown className="h-3 w-3 opacity-75" />
          </div>

          {/* Sun / Theme Icon */}
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-amber-300">
            <Sun className="h-4 w-4 fill-amber-300" />
          </button>

          {/* Super Admin User Profile Pill + Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white/15 border border-white/20 hover:bg-white/25 px-2.5 py-1 rounded-full cursor-pointer transition"
            >
              <div className="h-6 w-6 rounded-full bg-emerald-700 border border-white flex items-center justify-center text-[10px] font-bold">
                👨‍💼
              </div>
              <span className="text-xs font-semibold">{adminUser.name}</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-slate-700 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{adminUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{adminUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-100 text-[#80229a] text-[10px] font-semibold uppercase">
                    {adminUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTAINER (SIDEBAR + CONTENT CANVAS) */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR */}
        {/* ============================================================ */}
        <aside className="w-64 md:w-72 p-3 flex flex-col gap-3 h-full overflow-y-auto shrink-0 scrollbar-thin">
          {/* Super Admin Profile Card */}
          <div className="bg-white rounded-2xl p-4 shadow-md text-center flex flex-col items-center">
            {/* Operator Avatar */}
            <div className="relative mb-2">
              <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-purple-200 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 80 80" className="h-14 w-14">
                  <circle cx="40" cy="35" r="16" fill="#fde68a" />
                  <path d="M28 26C30 20 50 20 52 26" fill="#334155" />
                  {/* Headset */}
                  <path
                    d="M24 35C24 20 32 12 40 12C48 12 56 20 56 35"
                    stroke="#0284c7"
                    strokeWidth="4"
                    fill="none"
                  />
                  <rect x="20" y="30" width="6" height="12" rx="3" fill="#0284c7" />
                  <rect x="54" y="30" width="6" height="12" rx="3" fill="#0284c7" />
                  <path d="M54 38C54 46 48 50 42 50" stroke="#0284c7" strokeWidth="2.5" fill="none" />
                  <circle cx="41" cy="50" r="3" fill="#0284c7" />
                  {/* Tie / Suit */}
                  <path d="M24 65C24 50 30 46 40 46C50 46 56 50 56 65" fill="#047857" />
                  <path d="M37 46L40 56L43 46" fill="#FFFFFF" />
                  <polygon points="40,50 42,54 40,65 38,54" fill="#E11D48" />
                </svg>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-sm">{adminUser.name}</h3>
            <p className="text-[11px] text-slate-500 mb-3 capitalize">{adminUser.role}</p>

            <button
              onClick={() => setClockedIn(!clockedIn)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold shadow transition-all transform active:scale-95 ${
                clockedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#80229a] hover:bg-[#68167f] text-white'
              }`}
            >
              {clockedIn ? 'Clocked In ✓' : 'Clock In / Out'}
            </button>
          </div>

          {/* Search Menu Input */}
          <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-between shadow-sm border border-slate-100">
            <input
              type="text"
              placeholder="Search Menu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <Search className="h-4 w-4 text-purple-400 shrink-0" />
          </div>

          {/* Menu Items List */}
          <nav className="flex flex-col gap-1.5">
            {filteredMenu.map((item, idx) => {
              const Icon = item.icon;
              const hasChildren = item.children.length > 0;
              const isOpen = openMenu === item.name;

              return (
                <div key={idx}>
                  {/* Parent Menu Item */}
                  <button
                    onClick={() => {
                      if (isOpen) {
                        setOpenMenu(null);
                      } else {
                        setOpenMenu(item.name);
                        if (item.name === 'Front Office') {
                          setActiveView('dashboard');
                        } else if (item.children.length > 0) {
                          setActiveView(item.children[0].id);
                        }
                      }
                    }}
                    className={`w-full rounded-2xl px-3 py-2 flex items-center justify-between shadow-sm cursor-pointer group transition duration-150 ${isOpen
                        ? 'bg-[#80229a] text-white shadow-md'
                        : 'bg-white hover:bg-purple-50/80 text-slate-700 border border-slate-100/80'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 shadow-sm transition ${isOpen ? 'bg-[#f43f5e] text-white' : 'bg-[#80229a] text-white group-hover:bg-[#68167f]'
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={`text-xs font-semibold transition ${isOpen ? 'text-white font-bold' : 'text-slate-700 group-hover:text-[#80229a]'
                          }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {hasChildren ? (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400 group-hover:text-[#80229a]'
                          }`}
                      />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#80229a] group-hover:translate-x-0.5 transition" />
                    )}
                  </button>

                  {/* Dropdown Sub-items */}
                  {hasChildren && isOpen && (
                    <div className="bg-white rounded-2xl p-1.5 mt-1 border border-purple-100 shadow-sm flex flex-col gap-0.5 transition-all">
                      {item.children.map((child) => {
                        const isChildActive = activeView === child.id;

                        return (
                          <button
                            key={child.id}
                            onClick={() => setActiveView(child.id)}
                            className={`w-full flex items-start gap-2 px-3 py-2 rounded-xl text-xs transition text-left cursor-pointer ${
                              isChildActive
                                ? 'bg-[#ede9fe] text-[#80229a] font-bold shadow-xs'
                                : 'text-slate-600 hover:text-[#80229a] hover:bg-purple-50/70 font-medium'
                            }`}
                          >
                            <span className="text-[#80229a] font-bold text-xs leading-none mt-0.5">›</span>
                            <span className="leading-snug">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ============================================================ */}
        {/* MAIN DASHBOARD CANVAS */}
        {/* ============================================================ */}
        <main className="flex-1 bg-[#f8f9fe] rounded-tl-[32px] p-5 md:p-6 overflow-y-auto space-y-5 shadow-inner">
          {activeView === 'admission-enquiry' ? (
            <AdmissionEnquiryView onNavigate={setActiveView} />
          ) : activeView === 'visitors-book' ? (
            <VisitorsView onNavigate={setActiveView} />
          ) : activeView === 'postal-dispatch' ? (
            <PostalDispatchView onNavigate={setActiveView} />
          ) : activeView === 'postal-receive' ? (
            <PostalReceiveView onNavigate={setActiveView} />
          ) : activeView === 'complain' ? (
            <ComplainView onNavigate={setActiveView} />
          ) : activeView === 'setup' ? (
            <SetupFrontOfficeView onNavigate={setActiveView} />
          ) : activeView === 'gate-pass' ? (
            <GatePassView onNavigate={setActiveView} />
          ) : activeView === 'form' ? (
            <FormView onNavigate={setActiveView} />
          ) : activeView === 'collect-fee' ? (
            <CollectFeeView onNavigate={setActiveView} />
          ) : activeView === 'payment-receipt' ? (
            <PaymentReceiptView onNavigate={setActiveView} />
          ) : activeView === 'online-admission-fee' ? (
            <OnlineAdmissionFeeView onNavigate={setActiveView} />
          ) : activeView === 'demand-notice' ? (
            <DemandNoticeView onNavigate={setActiveView} />
          ) : activeView === 'fees-opening-balance' ? (
            <FeesOpeningBalanceView onNavigate={setActiveView} />
          ) : activeView === 'fee-discount' ? (
            <FeeDiscountView onNavigate={setActiveView} />
          ) : activeView === 'fee-master' ? (
            <FeeMasterView onNavigate={setActiveView} />
          ) : activeView === 'fees-group' ? (
            <FeeGroupView onNavigate={setActiveView} />
          ) : activeView === 'fees-types' ? (
            <FeesTypesView onNavigate={setActiveView} />
          ) : activeView === 'fee-follow-up' ? (
            <FeeFollowUpView onNavigate={setActiveView} />
          ) : activeView === 'cheques' ? (
            <ChequesView onNavigate={setActiveView} />
          ) : activeView === 'advance-payment' ? (
            <AdvancePaymentView onNavigate={setActiveView} />
          ) : activeView === 'fees-reports' ? (
            <FeesReportsView onNavigate={setActiveView} />
          ) : activeView === 'add-income' ? (
            <AddIncomeView onNavigate={setActiveView} />
          ) : activeView === 'search-income' ? (
            <SearchIncomeView onNavigate={setActiveView} />
          ) : activeView === 'income-head' ? (
            <IncomeHeadView onNavigate={setActiveView} />
          ) : activeView === 'add-expense' ? (
            <AddExpenseView onNavigate={setActiveView} />
          ) : activeView === 'expense-search' ? (
            <SearchExpenseView onNavigate={setActiveView} />
          ) : activeView === 'expense-head' ? (
            <ExpenseHeadView onNavigate={setActiveView} />
          ) : activeView === 'student-admission' ? (
            <StudentAdmissionView onNavigate={setActiveView} />
          ) : activeView === 'online-admission' ? (
            <OnlineAdmissionView onNavigate={setActiveView} />
          ) : activeView === 'student-details' ? (
            <StudentDetailsView onNavigate={setActiveView} />
          ) : activeView === 'student-category' || activeView === 'student-categories' ? (
            <StudentCategoriesView onNavigate={setActiveView} />
          ) : activeView === 'batch' ? (
            <BatchView onNavigate={setActiveView} />
          ) : activeView === 'student-referral' ? (
            <StudentReferralView onNavigate={setActiveView} />
          ) : activeView === 'inactive-students' ? (
            <InactiveStudentsView onNavigate={setActiveView} />
          ) : activeView === 'disabled-students' ? (
            <DisabledStudentsView onNavigate={setActiveView} />
          ) : activeView === 'link-siblings' ? (
            <LinkSiblingsView onNavigate={setActiveView} />
          ) : activeView === 'student-update' ? (
            <StudentUpdateView onNavigate={setActiveView} />
          ) : activeView === 'student-import-export' ? (
            <ImportExportStudentView onNavigate={setActiveView} />
          ) : activeView === 'student-reports' ? (
            <StudentReportsView onNavigate={setActiveView} />
          ) : activeView === 'student-house' ? (
            <StudentHouseView onNavigate={setActiveView} />
          ) : activeView === 'student-attendance' ? (
            <StudentAttendanceView onNavigate={setActiveView} />
          ) : activeView === 'attendance-report' ? (
            <AttendanceReportView onNavigate={setActiveView} />
          ) : activeView === 'approve-leave' ? (
            <ApproveLeaveView onNavigate={setActiveView} />
          ) : activeView === 'class-timetable' ? (
            <ClassTimetableView onNavigate={setActiveView} />
          ) : activeView === 'teacher-timetable' ? (
            <TeacherTimetableView onNavigate={setActiveView} />
          ) : activeView === 'daily-timetable' ? (
            <DailyTimetableView onNavigate={setActiveView} />
          ) : activeView === 'co-curricular-subject' ? (
            <CoCurricularSubjectView onNavigate={setActiveView} />
          ) : activeView === 'assign-class-teacher' ? (
            <AssignClassTeacherView onNavigate={setActiveView} />
          ) : activeView === 'promote-students' ? (
            <PromoteStudentsView onNavigate={setActiveView} />
          ) : activeView === 'subject-group' ? (
            <SubjectGroupView onNavigate={setActiveView} />
          ) : activeView === 'subjects' ? (
            <SubjectsView onNavigate={setActiveView} />
          ) : activeView === 'course' ? (
            <CourseView onNavigate={setActiveView} />
          ) : activeView === 'semester' ? (
            <SemesterView onNavigate={setActiveView} />
          ) : activeView === 'admission-config' ? (
            <AdmissionConfigView onNavigate={setActiveView} />
          ) : activeView === 'student-subjects' ? (
            <StudentSubjectsView onNavigate={setActiveView} />
          ) : activeView === 'term-list' ? (
            <TermListView onNavigate={setActiveView} />
          ) : activeView === 'exam-list' ? (
            <ExamListView onNavigate={setActiveView} />
          ) : activeView === 'exam-group' ? (
            <ExamGroupView onNavigate={setActiveView} />
          ) : activeView === 'exam-schedule' ? (
            <ExamScheduleView onNavigate={setActiveView} />
          ) : activeView === 'marks-register' ? (
            <MarksRegisterView onNavigate={setActiveView} />
          ) : activeView === 'marks-grade' ? (
            <MarksGradeView onNavigate={setActiveView} />
          ) : activeView === 'exam-division' ? (
            <DivisionView onNavigate={setActiveView} />
          ) : activeView === 'exam-attendance' ? (
            <ExamAttendanceView onNavigate={setActiveView} />
          ) : activeView === 'report-card' ? (
            <ReportCardView onNavigate={setActiveView} />
          ) : activeView === 'examination-report' ? (
            <ExaminationReportsView onNavigate={setActiveView} />
          ) : activeView === 'admit-card' ? (
            <AdmitCardView onNavigate={setActiveView} />
          ) : activeView === 'co-curricular-grade' ? (
            <CoCurricularGradeView onNavigate={setActiveView} />
          ) : activeView === 'teacher-remark' ? (
            <TeacherCommentView onNavigate={setActiveView} />
          ) : activeView === 'online-exam' ? (
            <OnlineExamListView onNavigate={setActiveView} />
          ) : activeView === 'question-bank' ? (
            <QuestionBankView onNavigate={setActiveView} />
          ) : activeView === 'online-exam-result' ? (
            <OnlineExamResultView onNavigate={setActiveView} />
          ) : (BATCH1_VIEW_IDS as readonly string[]).includes(activeView) ? (
            <Batch1ViewRenderer activeView={activeView} />
          ) : (BATCH2_VIEW_IDS as readonly string[]).includes(activeView) ? (
            <Batch2ViewRenderer activeView={activeView} />
          ) : (BATCH3_VIEW_IDS as readonly string[]).includes(activeView) ? (
            <Batch3ViewRenderer activeView={activeView} />
          ) : (BATCH4_VIEW_IDS as readonly string[]).includes(activeView) ? (
            <Batch4ViewRenderer activeView={activeView} />
          ) : activeView === 'set-roles' ? (
            <RolesPermissionView onNavigate={setActiveView} />
          ) : (BATCH5_VIEW_IDS as readonly string[]).includes(activeView) ? (
            <Batch5ViewRenderer activeView={activeView} />
          ) : activeView !== 'dashboard' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 text-[#80229a] flex items-center justify-center text-2xl mx-auto shadow-sm">
                💼
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 capitalize">
                  {activeView.replace('-', ' ')}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  This module is in progress. You can explore the active Admission Enquiry module below.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('admission-enquiry')}
                  className="px-4 py-2 bg-[#80229a] hover:bg-[#68167f] text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  Open Admission Enquiry
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Refresh Dashboard Bar */}
              <div className="flex justify-end items-center">
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#80229a] hover:text-[#631778] transition"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh Dashboard</span>
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Updated at {refreshMinutes} mins ago
                  </span>
                </div>
              </div>

              {/* 3. Metric Cards Grid (Row 1 - 5 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card 1: Today's Enquiry */}
                <div
                  onClick={() => setActiveView('admission-enquiry')}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] hover:shadow-md transition cursor-pointer group"
                  title="Click to open Admission Enquiry"
                >
                  <HeadsetIllustration />
                  <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                    Today&apos;s Enquiry
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">0</div>
                </div>

                {/* Card 2: Today's Follow Up */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] hover:shadow-md transition">
                  <FollowUpIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1">
                    Today&apos;s Follow Up
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">0</div>
                </div>

                {/* Card 3: Student */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] hover:shadow-md transition">
                  <StudentIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-5 py-1 rounded-full shadow-sm mt-1">
                    Student
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">{studentCount}</div>
                </div>

                {/* Card 4: Student Presence */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] relative hover:shadow-md transition">
                  {/* Green Today Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Today
                  </div>
                  <PresenceIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1">
                    Student Presence
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">3</div>
                </div>

                {/* Card 5: Monthly Fees */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] hover:shadow-md transition">
                  <FeesIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1">
                    Monthly Fees
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">709000</div>
                </div>
              </div>

              {/* 4. Metric Cards Grid (Row 2 - 3 Cards + Upcoming Birthday Widget) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card 6: Income / Expense */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] relative hover:shadow-md transition">
                  <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Monthly
                  </div>
                  <IncomeExpenseIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1">
                    Income / Expense
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">0 / 0</div>
                </div>

                {/* Card 7: Staff */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] hover:shadow-md transition">
                  <StaffIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-6 py-1 rounded-full shadow-sm mt-1">
                    Staff
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">48</div>
                </div>

                {/* Card 8: Staff Presence */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between min-h-[165px] relative hover:shadow-md transition">
                  <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Today
                  </div>
                  <StaffPresenceIllustration />
                  <div className="bg-[#80229a] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1">
                    Staff Presence
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">36</div>
                </div>

                {/* Card 9: Upcoming Birthday Card (Spans 2 columns) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between min-h-[165px] relative hover:shadow-md transition">
                  {/* Yellow Upcoming Pill Badge */}
                  <div className="absolute top-3 right-3 bg-[#fbc02d] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    Upcoming
                  </div>

                  {/* Title & Tabs */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🎂</span>
                      <h4 className="font-bold text-slate-800 text-sm tracking-tight">Upcoming Birthday</h4>
                    </div>

                    <div className="flex border-b border-slate-100 pb-1 mb-3 text-xs font-semibold gap-6">
                      <button
                        onClick={() => setBirthdayTab('student')}
                        className={`transition pb-1 relative ${birthdayTab === 'student'
                            ? 'text-[#80229a] border-b-2 border-[#80229a]'
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        Student
                      </button>
                      <button
                        onClick={() => setBirthdayTab('staff')}
                        className={`transition pb-1 relative ${birthdayTab === 'staff'
                            ? 'text-[#80229a] border-b-2 border-[#80229a]'
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        Staff
                      </button>
                    </div>

                    {/* Birthday List */}
                    <div className="space-y-2.5">
                      {(birthdayTab === 'student' ? studentBirthdays : staffBirthdays).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${item.avatarBg}`}
                            >
                              {item.initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#80229a] tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-slate-400">{item.date}</p>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">🎂 Birthday</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer notice */}
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-right">
                    Next 7 Days Notifications Active
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ERP System Footer */}
          <footer className="pt-6 pb-2 text-center text-xs text-slate-400 font-medium select-none">
            Copyright © 2026 NLET. All rights reserved. Version (5.6)
          </footer>
        </main>
      </div>
    </div>
  );
}
