export const orgData = {
  acronym: "AICTE",
  fullName: "All India Council for Technical Education",
  department: "Ministry of Education, Government of India",
  motto: "Quality Education for a Stronger India",
};

export const currentUser = {
  name: "Shanmukh",
  role: "Administrator",
  avatarLetter: "S",
};

export const navLinks = [
  { id: "home", label: "Home", hasDropdown: false, isActive: true },
  { id: "applications", label: "Applications", hasDropdown: true, isActive: true, isPill: true },
  { id: "institutions", label: "Institutions", hasDropdown: true },
  { id: "regulatory-services", label: "Regulatory Services", hasDropdown: true },
  { id: "reports", label: "Reports", hasDropdown: true },
  { id: "help-support", label: "Help & Support", hasDropdown: true },
];

export const megaDropdownItems = {
  col1: [
    {
      title: "New Application",
      description: "Submit institutional approval dossiers",
      icon: "FilePlus",
    },
    {
      title: "Track Application",
      description: "Real-time verification audit trail",
      icon: "ShieldSearch",
    },
    {
      title: "Application History",
      description: "Archived cycles & previous session logs",
      icon: "Clock",
    },
  ],
  col2: [
    {
      title: "Document Submission",
      description: "Upload affidavits, NOC & certificates",
      icon: "FileUp",
    },
    {
      title: "Verification Status",
      description: "Scrutiny committee inspection results",
      icon: "FileCheck",
    },
    {
      title: "Correspondence",
      description: "Official clarification & notice inquiries",
      icon: "MessageSquare",
    },
  ],
};

export const sidebarMenuItems = [
  { id: "home", label: "Home", icon: "Home", active: true },
  { id: "applications", label: "Applications", icon: "FileText" },
  { id: "verification", label: "Document\nVerification", icon: "FolderCheck" },
  { id: "compliance", label: "Compliance\nCheck", icon: "ShieldCheck" },
  { id: "institutions", label: "Institutions", icon: "Building2" },
  { id: "reports", label: "Reports", icon: "BarChart3" },
  { id: "audit", label: "Audit Trail", icon: "History" },
  { id: "users", label: "User\nManagement", icon: "Users" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export const weekDays = [
  { day: "Mon", date: 5, hasDot: true, dotColor: "#A8582F" },
  { day: "Tue", date: 6, hasDot: true, dotColor: "#C5B8AD" },
  { day: "Wed", date: 7, hasDot: true, dotColor: "#A8582F" },
  { day: "Thu", date: 8, hasDot: true, dotColor: "#FFFFFF", selected: true },
  { day: "Fri", date: 9, hasDot: true, dotColor: "#A8582F" },
  { day: "Sat", date: 10, hasDot: true, dotColor: "#C5B8AD" },
  { day: "Sun", date: 11, hasDot: true, dotColor: "#C5B8AD" },
];

export const initialKpiMetrics = [
  {
    id: "total",
    value: "1,248",
    numValue: 1248,
    trend: "↑12%",
    trendType: "success",
    label: "Total Applications",
    icon: "FileText",
    tileBg: "bg-[#F3DFD2]",
    tileColor: "text-[#A8582F]",
    sparkline: [20, 28, 35, 30, 45, 42, 60, 58, 70, 75],
  },
  {
    id: "review",
    value: "324",
    numValue: 324,
    trend: "↑6%",
    trendType: "danger",
    label: "Under Review",
    icon: "Hourglass",
    tileBg: "bg-[#F3DFD2]",
    tileColor: "text-[#A8582F]",
    sparkline: [15, 22, 18, 25, 20, 32, 28, 35, 30, 38],
  },
  {
    id: "verified",
    value: "812",
    numValue: 812,
    trend: "↑18%",
    trendType: "success",
    label: "Verified & Compliant",
    icon: "ShieldCheck",
    tileBg: "bg-[#EAE4DC]",
    tileColor: "text-[#0F3D36]",
    sparkline: [10, 16, 24, 28, 36, 42, 50, 55, 62, 68],
  },
  {
    id: "issues",
    value: "186",
    numValue: 186,
    trend: "↑24%",
    trendType: "danger",
    label: "Compliance Issues",
    icon: "AlertTriangle",
    tileBg: "bg-[#F9D9D5]",
    tileColor: "text-[#C0392B]",
    sparkline: [8, 12, 15, 10, 18, 14, 22, 19, 25, 29],
  },
];

export const quickActionItems = [
  { id: "track", label: "Track\nApplication", icon: "Search" },
  { id: "verify", label: "Verify\nDocument", icon: "FileCheck" },
  { id: "rules", label: "Compliance\nRules", icon: "ShieldCheck" },
  { id: "report", label: "Generate\nReport", icon: "BarChart3" },
];

export const chartDatasets = {
  "Last 30 Days": [
    { date: "01 Oct", submitted: 35, underReview: 20, verified: 10, issues: 5 },
    { date: "05 Oct", submitted: 100, underReview: 65, verified: 35, issues: 20 },
    { date: "10 Oct", submitted: 75, underReview: 50, verified: 20, issues: 12 },
    { date: "15 Oct", submitted: 110, underReview: 80, verified: 45, issues: 30 },
    { date: "20 Oct", submitted: 90, underReview: 60, verified: 30, issues: 20 },
    { date: "25 Oct", submitted: 150, underReview: 100, verified: 60, issues: 35 },
    { date: "28 Oct", submitted: 130, underReview: 85, verified: 45, issues: 25 },
    { date: "31 Oct", submitted: 165, underReview: 120, verified: 55, issues: 40 },
  ],
  "Last 7 Days": [
    { date: "15 Oct", submitted: 110, underReview: 80, verified: 45, issues: 30 },
    { date: "16 Oct", submitted: 125, underReview: 85, verified: 48, issues: 22 },
    { date: "17 Oct", submitted: 140, underReview: 95, verified: 50, issues: 28 },
    { date: "18 Oct", submitted: 130, underReview: 88, verified: 52, issues: 26 },
    { date: "19 Oct", submitted: 155, underReview: 105, verified: 58, issues: 32 },
    { date: "20 Oct", submitted: 150, underReview: 100, verified: 60, issues: 35 },
    { date: "21 Oct", submitted: 165, underReview: 120, verified: 55, issues: 40 },
  ],
  "Last 90 Days": [
    { date: "Aug W1", submitted: 20, underReview: 15, verified: 8, issues: 4 },
    { date: "Aug W3", submitted: 55, underReview: 35, verified: 22, issues: 10 },
    { date: "Sep W1", submitted: 90, underReview: 60, verified: 38, issues: 18 },
    { date: "Sep W3", submitted: 125, underReview: 85, verified: 50, issues: 26 },
    { date: "Oct W1", submitted: 145, underReview: 98, verified: 52, issues: 30 },
    { date: "Oct W3", submitted: 165, underReview: 120, verified: 55, issues: 40 },
  ],
  "Academic Year 2026-27": [
    { date: "May 26", submitted: 15, underReview: 10, verified: 5, issues: 2 },
    { date: "Jun 26", submitted: 40, underReview: 28, verified: 18, issues: 8 },
    { date: "Jul 26", submitted: 85, underReview: 55, verified: 32, issues: 15 },
    { date: "Aug 26", submitted: 115, underReview: 78, verified: 42, issues: 22 },
    { date: "Sep 26", submitted: 145, underReview: 95, verified: 49, issues: 28 },
    { date: "Oct 26", submitted: 165, underReview: 120, verified: 55, issues: 40 },
  ],
};

export const applicationOverviewChartData = chartDatasets["Last 30 Days"];

export const recentApplications = [
  {
    id: "AICTE-2026-001245",
    institution: "ABC Engineering College",
    status: "Under Review",
    statusType: "warning",
    submittedOn: "07 Oct 2026",
    category: "Extension of Approval",
  },
  {
    id: "AICTE-2026-001244",
    institution: "XYZ Institute of Technology",
    status: "Verified",
    statusType: "success",
    submittedOn: "06 Oct 2026",
    category: "New Course",
  },
  {
    id: "AICTE-2026-001243",
    institution: "DEF College of Engineering",
    status: "Compliance Issue",
    statusType: "danger",
    submittedOn: "06 Oct 2026",
    category: "New Institution",
  },
  {
    id: "AICTE-2026-001242",
    institution: "GHI Institute",
    status: "Under Review",
    statusType: "warning",
    submittedOn: "05 Oct 2026",
    category: "Extension of Approval",
  },
  {
    id: "AICTE-2026-001241",
    institution: "JKL Technical Campus",
    status: "Verified",
    statusType: "success",
    submittedOn: "04 Oct 2026",
    category: "Seat Increase",
  },
];
