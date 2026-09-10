export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "PARENT";

export interface School {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  plan: "BASIC" | "PREMIUM" | "ENTERPRISE";
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  academicYear: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdmissionEnquiry {
  id?: string;
  schoolId: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  classApplyingFor: string;
  enquiryDate: string;
  status: "NEW" | "CONTACTED" | "INTERESTED" | "ADMISSION" | "NOT_INTERESTED";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string;
  createdAt: string;
}

export interface Student {
  id?: string;
  schoolId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  parentId: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  dob?: string;
  gender?: string;
  address?: string;
  admissionDate?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Teacher {
  id?: string;
  schoolId: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  classes?: string[];
  joiningDate?: string;
  qualification?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Notice {
  id?: string;
  schoolId: string;
  title: string;
  content: string;
  audience: "ALL_PARENTS" | "ALL_TEACHERS" | "ALL_STUDENTS" | "SPECIFIC_CLASS" | "SPECIFIC_SECTION";
  targetClass?: string;
  targetSection?: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishDate?: string;
  scheduledDate?: string;
  attachments?: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  id?: string;
  schoolId: string;
  userId: string;
  title: string;
  message: string;
  type: "NOTICE" | "FEE_REMINDER" | "ATTENDANCE_ALERT" | "HOMEWORK" | "SYSTEM";
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id?: string;
  schoolId: string;
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  events: {
    attendance: boolean;
    fees: boolean;
    homework: boolean;
    exams: boolean;
    notices: boolean;
  };
  updatedAt: string;
}

export interface FeeStructure {
  id?: string;
  schoolId: string;
  academicYear: string;
  className: string;
  feeName: string;
  amount: number;
  frequency: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | "ONE_TIME";
  dueDate: string;
  isOptional: boolean;
  description: string;
  lateFeeType?: "FIXED" | "PERCENTAGE";
  lateFeeValue?: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface StudentFee {
  id?: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  discountAmount: number;
  discountType?: "PERCENTAGE" | "FIXED" | "SCHOLARSHIP";
  discountReason?: string;
  lateFeeAmount: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeTransaction {
  id?: string;
  schoolId: string;
  receiptNumber: string;
  studentId: string;
  studentFeeId: string;
  amount: number;
  discount: number;
  lateFee: number;
  totalPayable: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "OTHER";
  referenceNumber?: string;
  paymentDate: string;
  status: "SUCCESS" | "FAILED" | "REFUNDED";
  notes?: string;
  collectedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeRefund {
  id?: string;
  schoolId: string;
  transactionId: string;
  studentId: string;
  amount: number;
  reason: string;
  refundMethod: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "OTHER";
  referenceNumber?: string;
  processedBy: string;
  createdAt: string;
}

export interface Homework {
  id?: string;
  schoolId: string;
  teacherId: string;
  class: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

export interface AttendanceRecord {
  id?: string;
  schoolId: string;
  class: string;
  section: string;
  date: string;
  teacherId: string;
  records: {
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id?: string;
  schoolId: string;
  title: string;
  class: string;
  section: string;
  subjects: string[];
  date: string;
  status: "SCHEDULED" | "COMPLETED" | "PUBLISHED";
  createdAt: string;
}

export interface ExamResult {
  id?: string;
  schoolId: string;
  examId: string;
  studentId: string;
  marks: Record<string, number>; // subject -> marks
  maxMarks: Record<string, number>; // subject -> maxMarks
  total: number;
  percentage: number;
  grade: string;
  createdAt: string;
  updatedAt: string;
}



export interface ClassRecord {
  id?: string;
  schoolId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}

export interface Section {
  id?: string;
  schoolId: string;
  classId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}

export interface Subject {
  id?: string;
  schoolId: string;
  name: string;
  classId?: string; // Optional if generic across school
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdBy: string;
}

export interface SupportTicket {
  id?: string;
  schoolId: string;
  subject: string;
  category: "TECHNICAL" | "ACCOUNT" | "STUDENT" | "TEACHER" | "FEES" | "ATTENDANCE" | "HOMEWORK" | "RESULTS" | "GENERAL";
  priority: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED";
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface PlatformEnquiry {
  id?: string;
  source: "CONTACT" | "BOOK_DEMO";
  name: string;
  email: string;
  phone?: string;
  schoolName?: string;
  country?: string;
  city?: string;
  role?: string;
  studentCount?: string;
  preferredContactMethod?: string;
  subject?: string;
  message: string;
  status: "NEW" | "CONTACTED" | "DEMO_SCHEDULED" | "CONVERTED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  notes?: string;
}
