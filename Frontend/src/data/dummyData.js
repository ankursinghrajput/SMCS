// Centralized dummy data for the frontend
// Replace these with real API calls when backend is connected

export const dummyUser = {
  _id: '64a1b2c3d4e5f6a7b8c9d0e1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@smcs.edu',
  contactNumber: 9876543210,
  role: 'student',
  classId: '64a1b2c3d4e5f6a7b8c9d0f1',
};

export const dummyAdminUser = {
  _id: '64a1b2c3d4e5f6a7b8c9d0e2',
  name: 'Dr. Anjali Gupta',
  email: 'anjali.gupta@smcs.edu',
  role: 'admin',
};

export const dummyFacultyUser = {
  _id: '64a1b2c3d4e5f6a7b8c9d0e3',
  name: 'Prof. Vikram Singh',
  email: 'vikram.singh@smcs.edu',
  role: 'faculty',
};

export const dummyStudents = [
  { _id: '1', name: 'Rahul Sharma', email: 'rahul@smcs.edu', contactNumber: 9876543210, role: 'student', classId: 'Class 10-A' },
  { _id: '2', name: 'Priya Patel', email: 'priya@smcs.edu', contactNumber: 9876543211, role: 'student', classId: 'Class 10-A' },
  { _id: '3', name: 'Arjun Mehta', email: 'arjun@smcs.edu', contactNumber: 9876543212, role: 'student', classId: 'Class 10-B' },
  { _id: '4', name: 'Sneha Reddy', email: 'sneha@smcs.edu', contactNumber: 9876543213, role: 'student', classId: 'Class 11-A' },
  { _id: '5', name: 'Kiran Joshi', email: 'kiran@smcs.edu', contactNumber: 9876543214, role: 'student', classId: 'Class 11-A' },
  { _id: '6', name: 'Rohan Verma', email: 'rohan@smcs.edu', contactNumber: 9876543215, role: 'student', classId: 'Class 10-B' },
];

export const dummyFaculties = [
  { _id: '1', name: 'Prof. Vikram Singh', email: 'vikram@smcs.edu', contactNumber: 9812345670, role: 'faculty', subject: 'Mathematics' },
  { _id: '2', name: 'Ms. Meena Iyer', email: 'meena@smcs.edu', contactNumber: 9812345671, role: 'faculty', subject: 'Physics' },
  { _id: '3', name: 'Mr. Suresh Kumar', email: 'suresh@smcs.edu', contactNumber: 9812345672, role: 'faculty', subject: 'Chemistry' },
  { _id: '4', name: 'Dr. Leela Nair', email: 'leela@smcs.edu', contactNumber: 9812345673, role: 'faculty', subject: 'English' },
];

export const dummyAttendance = [
  { subjectName: 'Mathematics', totalClasses: 45, attendedClasses: 42, percentage: 93.33 },
  { subjectName: 'Physics', totalClasses: 40, attendedClasses: 36, percentage: 90.00 },
  { subjectName: 'Chemistry', totalClasses: 38, attendedClasses: 26, percentage: 68.42 },
  { subjectName: 'English', totalClasses: 35, attendedClasses: 30, percentage: 85.71 },
  { subjectName: 'Computer Science', totalClasses: 30, attendedClasses: 22, percentage: 73.33 },
];

export const dummyMarks = [
  { _id: '1', subject: { name: 'Mathematics' }, examType: 'Mid-Term', marks: 88, totalMarks: 100, passingMarks: 40, grade: 'A', percentage: 88, status: 'passed' },
  { _id: '2', subject: { name: 'Physics' }, examType: 'Mid-Term', marks: 74, totalMarks: 100, passingMarks: 40, grade: 'B+', percentage: 74, status: 'passed' },
  { _id: '3', subject: { name: 'Chemistry' }, examType: 'Mid-Term', marks: 52, totalMarks: 100, passingMarks: 40, grade: 'C', percentage: 52, status: 'passed' },
  { _id: '4', subject: { name: 'English' }, examType: 'Final', marks: 91, totalMarks: 100, passingMarks: 40, grade: 'A+', percentage: 91, status: 'passed' },
  { _id: '5', subject: { name: 'Computer Science' }, examType: 'Final', marks: 96, totalMarks: 100, passingMarks: 40, grade: 'A+', percentage: 96, status: 'passed' },
];

export const dummyNotices = [
  { _id: '1', title: 'Annual Sports Day - 20th June 2026', description: 'All students are required to participate in the annual sports day event scheduled on 20th June. Please report to the ground by 8:00 AM.', audience: 'all', createdAt: '2026-06-07T10:00:00Z' },
  { _id: '2', title: 'Mid-Term Exam Schedule Released', description: 'The mid-term examination schedule for all classes has been released. Please check the notice board for detailed timetables.', audience: 'student', createdAt: '2026-06-05T09:00:00Z' },
  { _id: '3', title: 'Faculty Meeting - 15th June', description: 'All teaching staff must attend the mandatory faculty meeting on 15th June at 2:00 PM in the conference hall.', audience: 'faculty', createdAt: '2026-06-04T11:00:00Z' },
  { _id: '4', title: 'Holiday Notice: Eid Al-Adha', description: 'The school will remain closed on 17th June 2026 on account of Eid Al-Adha.', audience: 'all', createdAt: '2026-06-01T08:00:00Z' },
];

export const dummyClasses = [
  { _id: '1', name: 'Class 10-A', students: 32 },
  { _id: '2', name: 'Class 10-B', students: 30 },
  { _id: '3', name: 'Class 11-A', students: 28 },
  { _id: '4', name: 'Class 11-B', students: 29 },
  { _id: '5', name: 'Class 12-A', students: 25 },
  { _id: '6', name: 'Class 12-B', students: 26 },
];

export const dummyAnalytics = {
  totalStudents: 170,
  totalFaculty: 18,
  totalClasses: 6,
  averageAttendance: 81.5,
};
