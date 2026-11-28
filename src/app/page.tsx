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
  LayoutDashboard,
  MessageSquare,
  Globe,
  Sun,
  Moon,
  Check,
  X,
  Shield,
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
  const [openMenu, setOpenMenu] = useState<string | null>('Front Office'); // Front Office open by default
  const [activeView, setActiveView] = useState<string>('dashboard'); // 'dashboard' | 'admission-enquiry' | ...
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Header Interactive Controls & Dynamic Dropdowns State
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(2);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Dynamic Dashboard Metrics loaded directly from MongoDB database
  const [stats, setStats] = useState({
    todayEnquiries: 6,
    totalEnquiries: 6,
    todayFollowUps: 4,
    totalStudents: 30,
    studentPresent: 5,
    monthlyFees: 880000,
    totalIncome: 2151200,
    totalExpense: 657420,
    totalStaff: 10,
    staffPresent: 7,
    studentBirthdays: undefined as Array<{ name: string; date: string; avatarBg: string; initials: string }> | undefined,
    staffBirthdays: undefined as Array<{ name: string; date: string; avatarBg: string; initials: string }> | undefined,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats((prev) => ({ ...prev, ...data }));
      }
    } catch {
      // Keep real totals
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
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
      date: '28th Nov',
      avatarBg: 'bg-emerald-100 text-emerald-800',
      initials: 'VK',
    },
    {
      name: 'UTTAM SINGH',
      date: '29th Nov',
      avatarBg: 'bg-amber-100 text-amber-800',
      initials: 'US',
    },
    {
      name: 'ANIKET PATIL',
      date: '30th Nov',
      avatarBg: 'bg-indigo-100 text-indigo-800',
      initials: 'AP',
    },
    {
      name: 'SNEHA PATIL',
      date: '2nd Dec',
      avatarBg: 'bg-rose-100 text-rose-800',
      initials: 'SP',
    },
  ];

  const staffBirthdays = [
    {
      name: 'DR. K. N. JOSHI',
      date: '28th Nov',
      avatarBg: 'bg-sky-100 text-sky-800',
      initials: 'DK',
    },
    {
      name: 'DR. POOJA SHARMA',
      date: '29th Nov',
      avatarBg: 'bg-rose-100 text-rose-800',
      initials: 'PS',
    },
    {
      name: 'PROF. S. R. DIXIT',
      date: '30th Nov',
      avatarBg: 'bg-purple-100 text-purple-800',
      initials: 'PS',
    },
    {
      name: 'PROF. RAJESH KUMAR',
      date: '1st Dec',
      avatarBg: 'bg-amber-100 text-amber-800',
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
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - Toggles Sidebar */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition cursor-pointer active:scale-95"
            aria-label="Toggle sidebar menu"
            title="Toggle Sidebar Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo & Institute Title - Navigates to Dashboard */}
          <div
            onClick={() => {
              setActiveView('dashboard');
              setOpenMenu(null);
            }}
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

            <span className="font-bold tracking-wide text-sm md:text-base drop-shadow-sm uppercase group-hover:text-amber-200 transition">
              ELECTRO INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
            </span>
          </div>
        </div>

        {/* Right Action Icons & User Control */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* 1. Expandable Header Quick Search */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setHeaderSearchOpen((prev) => !prev);
                setYearMenuOpen(false);
                setLangMenuOpen(false);
                setMessagesOpen(false);
                setNotificationsOpen(false);
                setProfileMenuOpen(false);
              }}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                headerSearchOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/90'
              }`}
              title="Quick Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {headerSearchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search any module or page..."
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                  />
                  {headerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHeaderSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Quick Results */}
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1 scrollbar-thin">
                  {filteredMenu
                    .flatMap((m) =>
                      m.children.map((c) => ({
                        module: m.name,
                        label: c.label,
                        id: c.id,
                      }))
                    )
                    .filter(
                      (item) =>
                        !headerSearchQuery ||
                        item.label.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
                        item.module.toLowerCase().includes(headerSearchQuery.toLowerCase())
                    )
                    .slice(0, 7)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveView(item.id);
                          setOpenMenu(item.module);
                          setHeaderSearchOpen(false);
                          setHeaderSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-purple-50 text-slate-700 hover:text-[#80229a] flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-medium truncate">{item.label}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                          {item.module}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Dynamic Academic Year Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setYearMenuOpen((prev) => !prev);
                setHeaderSearchOpen(false);
                setLangMenuOpen(false);
                setMessagesOpen(false);
                setNotificationsOpen(false);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/20 border border-white/25 rounded-md text-xs font-semibold tracking-wide cursor-pointer shadow-sm transition active:scale-95"
              title="Change Academic Year"
            >
              <Clock className="h-3.5 w-3.5 text-white/90" />
              <span>{academicYear}</span>
              <ChevronDown className="h-3 w-3 opacity-75" />
            </button>

            {yearMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-slate-700">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Academic Session
                </div>
                {['2023-24', '2024-25', '2025-26', '2026-27'].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setAcademicYear(year);
                      setYearMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                      academicYear === year
                        ? 'bg-[#ede9fe] text-[#80229a] font-bold'
                        : 'hover:bg-purple-50 text-slate-600'
                    }`}
                  >
                    <span>{year}</span>
                    {academicYear === year && <Check className="h-3.5 w-3.5 text-[#80229a]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Fullscreen Button */}
          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90 cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* 4. Messages / Communication Popover with Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMessagesOpen((prev) => !prev);
                setNotificationsOpen(false);
                setYearMenuOpen(false);
                setLangMenuOpen(false);
                setHeaderSearchOpen(false);
                setProfileMenuOpen(false);
              }}
              className="relative cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition text-white/90"
              title="Messages & Communication"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white ring-1 ring-white">
                  {unreadMessages}
                </span>
              )}
            </button>

            {messagesOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 text-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Messages & Circulars</span>
                  {unreadMessages > 0 && (
                    <button
                      type="button"
                      onClick={() => setUnreadMessages(0)}
                      className="text-[10px] text-[#80229a] hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-2">
                  <div
                    onClick={() => {
                      setActiveView('admission-enquiry');
                      setOpenMenu('Front Office');
                      setMessagesOpen(false);
                    }}
                    className="p-2 bg-purple-50/60 hover:bg-purple-50 rounded-xl cursor-pointer transition text-xs"
                  >
                    <p className="font-semibold text-slate-800">4 Enquiries Pending Follow-up</p>
                    <p className="text-[10px] text-slate-500">Contact scheduled today for B.Sc. Nursing</p>
                  </div>
                  <div
                    onClick={() => {
                      setActiveView('comm-notice');
                      setOpenMenu('Communicate');
                      setMessagesOpen(false);
                    }}
                    className="p-2 bg-slate-50 hover:bg-purple-50/50 rounded-xl cursor-pointer transition text-xs"
                  >
                    <p className="font-semibold text-slate-800">Blood Donation & Health Camp</p>
                    <p className="text-[10px] text-slate-500">Community Health Nursing department circular</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('comm-notice');
                      setOpenMenu('Communicate');
                      setMessagesOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#80229a] hover:underline"
                  >
                    Notice Board →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('comm-send');
                      setOpenMenu('Communicate');
                      setMessagesOpen(false);
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-[#80229a]"
                  >
                    Send SMS / Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangMenuOpen((prev) => !prev);
                setYearMenuOpen(false);
                setHeaderSearchOpen(false);
                setMessagesOpen(false);
                setNotificationsOpen(false);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/10 rounded cursor-pointer transition"
              title="Select Language"
            >
              <Globe className="h-3.5 w-3.5 text-white/90" />
              <span className="font-semibold">{selectedLang}</span>
              <ChevronDown className="h-3 w-3 opacity-75" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-slate-700">
                {[
                  { code: 'EN', name: 'English' },
                  { code: 'HI', name: 'हिन्दी' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                      selectedLang === lang.code
                        ? 'bg-[#ede9fe] text-[#80229a] font-bold'
                        : 'hover:bg-purple-50 text-slate-600'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {selectedLang === lang.code && <Check className="h-3.5 w-3.5 text-[#80229a]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Dynamic Theme Toggle (☀️ Light / 🌙 Dark) */}
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={`p-1.5 rounded-lg transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-purple-900/60 text-amber-200 hover:bg-purple-900/80'
                : 'hover:bg-white/10 text-amber-300'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Moon className="h-4 w-4 fill-amber-200 text-amber-200" />
            ) : (
              <Sun className="h-4 w-4 fill-amber-300" />
            )}
          </button>

          {/* 7. Super Admin User Profile Pill + Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((prev) => !prev);
                setYearMenuOpen(false);
                setLangMenuOpen(false);
                setMessagesOpen(false);
                setNotificationsOpen(false);
                setHeaderSearchOpen(false);
              }}
              className="flex items-center gap-2 bg-white/15 border border-white/20 hover:bg-white/25 px-2.5 py-1 rounded-full cursor-pointer transition active:scale-95"
            >
              <div className="h-6 w-6 rounded-full bg-emerald-700 border border-white flex items-center justify-center text-[10px] font-bold">
                👨‍💼
              </div>
              <span className="text-xs font-semibold">{adminUser.name}</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-slate-700 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{adminUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{adminUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-100 text-[#80229a] text-[10px] font-semibold uppercase">
                    {adminUser.role}
                  </span>
                </div>

                <div className="py-1 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setClockedIn((prev) => !prev);
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-purple-50 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Duty Status:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        clockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {clockedIn ? 'Clocked In ✓' : 'Clock Out'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('set-configurations');
                      setOpenMenu('System Setting');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-purple-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    System Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('set-roles');
                      setOpenMenu('System Setting');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-purple-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5 text-slate-400" />
                    Roles & Permissions
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* 8. Notification Bell Popover with Dynamic Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setMessagesOpen(false);
                setYearMenuOpen(false);
                setLangMenuOpen(false);
                setHeaderSearchOpen(false);
                setProfileMenuOpen(false);
              }}
              className="relative p-1.5 hover:bg-white/10 rounded-lg transition text-white/90 cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 text-[10px] font-bold flex items-center justify-center text-slate-900 ring-1 ring-white">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 text-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Alerts & Notifications</span>
                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      onClick={() => setUnreadNotifications(0)}
                      className="text-[10px] text-[#80229a] hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="py-2 space-y-2">
                  <div
                    onClick={() => {
                      setActiveView('admission-enquiry');
                      setOpenMenu('Front Office');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 bg-amber-50/70 hover:bg-amber-50 rounded-xl cursor-pointer transition text-xs border border-amber-100/60"
                  >
                    <p className="font-bold text-amber-900">Today&apos;s Follow-Ups Pending</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      {stats.todayFollowUps} prospective student enquiries scheduled for call today.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveView('collect-fee');
                      setOpenMenu('Fees Collection');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 bg-purple-50/70 hover:bg-purple-50 rounded-xl cursor-pointer transition text-xs border border-purple-100/60"
                  >
                    <p className="font-bold text-purple-900">Monthly Fees Collection</p>
                    <p className="text-[10px] text-purple-700 mt-0.5">
                      ₹ {stats.monthlyFees.toLocaleString('en-IN')} collected this month across batches.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveView('hr-attendance');
                      setOpenMenu('Human Resource');
                      setNotificationsOpen(false);
                    }}
                    className="p-2.5 bg-emerald-50/70 hover:bg-emerald-50 rounded-xl cursor-pointer transition text-xs border border-emerald-100/60"
                  >
                    <p className="font-bold text-emerald-900">Faculty & Staff Attendance</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      {stats.staffPresent} of {stats.totalStaff} staff members marked present today.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('dashboard');
                      setNotificationsOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#80229a] hover:underline"
                  >
                    View All in Dashboard Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTAINER (SIDEBAR + CONTENT CANVAS) */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR */}
        {/* ============================================================ */}
        <aside
          className={`${
            sidebarOpen ? 'w-64 md:w-72' : 'hidden'
          } p-3 flex flex-col gap-3 h-full overflow-y-auto shrink-0 scrollbar-thin transition-all duration-200`}
        >
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
            {/* Dedicated Top Dashboard Navigation Button */}
            <button
              type="button"
              onClick={() => {
                setActiveView('dashboard');
                setOpenMenu(null);
              }}
              className={`w-full rounded-2xl px-3 py-2 flex items-center justify-between shadow-sm cursor-pointer group transition duration-150 ${
                activeView === 'dashboard'
                  ? 'bg-[#80229a] text-white shadow-md'
                  : 'bg-white hover:bg-purple-50/80 text-slate-700 border border-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 shadow-sm transition ${
                    activeView === 'dashboard'
                      ? 'bg-[#f43f5e] text-white'
                      : 'bg-[#80229a] text-white group-hover:bg-[#68167f]'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`text-xs font-semibold transition ${
                    activeView === 'dashboard'
                      ? 'text-white font-bold'
                      : 'text-slate-700 group-hover:text-[#80229a]'
                  }`}
                >
                  Dashboard
                </span>
              </div>
            </button>

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
                        if (item.children.length > 0) {
                          setActiveView(item.children[0].id);
                        }
                      }
                    }}
                    className={`w-full rounded-2xl px-3 py-2 flex items-center justify-between shadow-sm cursor-pointer group transition duration-150 ${
                      isOpen
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

              {/* Helper for clean currency display */}
              {(() => {
                const formatLakhs = (val: number) => {
                  if (!val) return '₹ 0';
                  if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
                  if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} L`;
                  if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)} k`;
                  return `₹ ${val.toLocaleString('en-IN')}`;
                };

                return (
                  <>
                    {/* 3. Metric Cards Grid (Row 1 - 5 Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Card 1: Today's Enquiry */}
                      <div
                        onClick={() => {
                          setActiveView('admission-enquiry');
                          setOpenMenu('Front Office');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to open Admission Enquiry"
                      >
                        <HeadsetIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Today&apos;s Enquiry
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.todayEnquiries}</div>
                      </div>

                      {/* Card 2: Today's Follow Up */}
                      <div
                        onClick={() => {
                          setActiveView('admission-enquiry');
                          setOpenMenu('Front Office');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to open Enquiry Follow Ups"
                      >
                        <FollowUpIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Today&apos;s Follow Up
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.todayFollowUps}</div>
                      </div>

                      {/* Card 3: Student */}
                      <div
                        onClick={() => {
                          setActiveView('student-details');
                          setOpenMenu('Student Info');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to view Student Details"
                      >
                        <StudentIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-5 py-1 rounded-full shadow-sm mt-1 transition">
                          Student
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalStudents}</div>
                      </div>

                      {/* Card 4: Student Presence */}
                      <div
                        onClick={() => {
                          setActiveView('student-attendance');
                          setOpenMenu('Attendance');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] relative hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to view Student Attendance"
                      >
                        {/* Green Today Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Today
                        </div>
                        <PresenceIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Student Presence
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.studentPresent}</div>
                      </div>

                      {/* Card 5: Monthly Fees */}
                      <div
                        onClick={() => {
                          setActiveView('collect-fee');
                          setOpenMenu('Fees Collection');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to view Fees Collection"
                      >
                        <FeesIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Monthly Fees
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                          {stats.monthlyFees.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* 4. Metric Cards Grid (Row 2 - 3 Cards + Upcoming Birthday Widget) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Card 6: Income / Expense */}
                      <div
                        onClick={() => {
                          setActiveView('search-income');
                          setOpenMenu('Income');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] relative hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title={`Total Income: ₹ ${stats.totalIncome.toLocaleString('en-IN')} | Total Expense: ₹ ${stats.totalExpense.toLocaleString('en-IN')}`}
                      >
                        <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Monthly
                        </div>
                        <IncomeExpenseIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Income / Expense
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 tracking-tight">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/80">
                            {formatLakhs(stats.totalIncome)}
                          </span>
                          <span className="text-slate-300 font-normal">/</span>
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100/80">
                            {formatLakhs(stats.totalExpense)}
                          </span>
                        </div>
                      </div>

                      {/* Card 7: Staff */}
                      <div
                        onClick={() => {
                          setActiveView('hr-staff');
                          setOpenMenu('Human Resource');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to view Staff Directory"
                      >
                        <StaffIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-6 py-1 rounded-full shadow-sm mt-1 transition">
                          Staff
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalStaff}</div>
                      </div>

                      {/* Card 8: Staff Presence */}
                      <div
                        onClick={() => {
                          setActiveView('hr-attendance');
                          setOpenMenu('Human Resource');
                        }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-between h-[180px] relative hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition cursor-pointer group active:scale-[0.98]"
                        title="Click to view Staff Attendance"
                      >
                        <div className="absolute top-2.5 right-2.5 bg-[#00c853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Today
                        </div>
                        <StaffPresenceIllustration />
                        <div className="bg-[#80229a] group-hover:bg-[#68167f] text-white text-[11px] font-semibold px-4 py-1 rounded-full shadow-sm mt-1 transition">
                          Staff Presence
                        </div>
                        <div className="text-2xl font-bold text-slate-800">{stats.staffPresent}</div>
                      </div>

                      {/* Card 9: Upcoming Birthday Card (Spans 2 columns) */}
                      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 lg:col-span-2 flex flex-col justify-between h-[180px] relative hover:shadow-md transition overflow-hidden">
                        {/* Yellow Upcoming Pill Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-[#fbc02d] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Upcoming
                        </div>

                        {/* Title & Tabs */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-base">🎂</span>
                            <h4 className="font-bold text-slate-800 text-xs tracking-tight">Upcoming Birthday</h4>
                          </div>

                          <div className="flex border-b border-slate-100 pb-1 mb-2 text-xs font-semibold gap-5">
                            <button
                              onClick={() => setBirthdayTab('student')}
                              className={`transition pb-0.5 relative cursor-pointer ${
                                birthdayTab === 'student'
                                  ? 'text-[#80229a] border-b-2 border-[#80229a]'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              Student
                            </button>
                            <button
                              onClick={() => setBirthdayTab('staff')}
                              className={`transition pb-0.5 relative cursor-pointer ${
                                birthdayTab === 'staff'
                                  ? 'text-[#80229a] border-b-2 border-[#80229a]'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              Staff
                            </button>
                          </div>

                          {/* Birthday List - Cleanly capped to top 3 for uniform height */}
                          <div className="space-y-1">
                            {(birthdayTab === 'student'
                              ? stats.studentBirthdays || studentBirthdays
                              : stats.staffBirthdays || staffBirthdays
                            )
                              .slice(0, 3)
                              .map((item, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (birthdayTab === 'student') {
                                      setActiveView('student-details');
                                      setOpenMenu('Student Info');
                                    } else {
                                      setActiveView('hr-staff');
                                      setOpenMenu('Human Resource');
                                    }
                                  }}
                                  className="flex items-center justify-between py-0.5 border-b border-slate-50 last:border-0 hover:bg-purple-50/50 px-1 rounded transition cursor-pointer"
                                  title={birthdayTab === 'student' ? 'View Student Profile' : 'View Staff Profile'}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${item.avatarBg}`}
                                    >
                                      {item.initials}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-[#80229a] tracking-tight truncate max-w-[130px] md:max-w-[170px]">
                                        {item.name}
                                      </p>
                                      <p className="text-[9px] text-slate-400 leading-none">{item.date}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium shrink-0">🎂 Birthday</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Footer notice */}
                        <div className="pt-1 border-t border-slate-100 text-[9px] text-slate-400 text-right leading-none">
                          Next 7 Days Notifications Active
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
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
