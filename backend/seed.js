const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_system');
  console.log('Connected to MongoDB');
  
  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@jims.edu',
    password: 'Admin@123',
    role: 'admin',
    department: 'Administration',
    employeeId: 'ADM001',
    phone: '9876543210'
  });

  // Create faculty
  const faculties = await User.create([
    { name: 'Prof. Archana Saxena', email: 'archana@jims.edu', password: 'Faculty@123', role: 'faculty', department: 'Computer Science', employeeId: 'FAC001', phone: '9876543211' },
    { name: 'Prof. JP Singh', email: 'jps@jims.edu', password: 'Faculty@123', role: 'faculty', department: 'Mathematics', employeeId: 'FAC002', phone: '9876543212' },
    { name: 'Prof. Deepshika', email: 'deepshika@jims.edu', password: 'Faculty@123', role: 'faculty', department: 'Computer Science', employeeId: 'FAC003', phone: '9876543213' }
  ]);

  // Create students
  const students = await User.create([
    { name: 'Gaurav Arora', email: 'gaurav_arora@jims.edu', password: 'Gaurav@123', role: 'student', department: 'MCA', rollNumber: 'MCA2021001', semester: 2, phone: '9876543220' },
    { name: 'Aastha Setia', email: 'aastha_setia@jims.edu', password: 'Aastha@123', role: 'student', department: 'MCA', rollNumber: 'MCA2021002', semester: 2, phone: '9876543221' },
    { name: 'Rahul Gupta', email: 'rahul@jims.edu', password: 'Rahul@123', role: 'student', department: 'Btech(CS)', rollNumber: 'CS2021003', semester: 5, phone: '9876543222' },
    { name: 'Kavya Reddy', email: 'kavya@jims.edu', password: 'Kavya@123', role: 'student', department: 'Mathematics', rollNumber: 'MA2021001', semester: 3, phone: '9876543223' },
    { name: 'Vikram Nair', email: 'vikram@jims.edu', password: 'Vikram@123', role: 'student', department: 'Btech(CS)', rollNumber: 'CS2021004', semester: 5, phone: '9876543224' }
  ]);

  // Create courses
  const courses = await Course.create([
    { name: 'Data Structures & Algorithms', code: 'CS301', department: 'Computer Science', semester: 5, credits: 4, faculty: faculties[0]._id, students: [students[0]._id, students[1]._id, students[2]._id, students[4]._id], schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'CS-101' }, { day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'CS-101' }] },
    { name: 'Operating Systems', code: 'CS302', department: 'Computer Science', semester: 5, credits: 3, faculty: faculties[2]._id, students: [students[0]._id, students[1]._id, students[2]._id, students[4]._id], schedule: [{ day: 'Tuesday', startTime: '11:00', endTime: '12:00', room: 'CS-102' }] },
    { name: 'Discrete Mathematics', code: 'MA201', department: 'Mathematics', semester: 3, credits: 3, faculty: faculties[1]._id, students: [students[3]._id, students[0]._id], schedule: [{ day: 'Thursday', startTime: '14:00', endTime: '15:00', room: 'MA-201' }] }
  ]);

  // Update faculty teaching courses
  await User.findByIdAndUpdate(faculties[0]._id, { teachingCourses: [courses[0]._id] });
  await User.findByIdAndUpdate(faculties[1]._id, { teachingCourses: [courses[2]._id] });
  await User.findByIdAndUpdate(faculties[2]._id, { teachingCourses: [courses[1]._id] });

  // Update student enrolled courses
  await User.findByIdAndUpdate(students[0]._id, { enrolledCourses: [courses[0]._id, courses[1]._id, courses[2]._id] });
  await User.findByIdAndUpdate(students[1]._id, { enrolledCourses: [courses[0]._id, courses[1]._id] });
  await User.findByIdAndUpdate(students[2]._id, { enrolledCourses: [courses[0]._id, courses[1]._id] });
  await User.findByIdAndUpdate(students[3]._id, { enrolledCourses: [courses[2]._id] });
  await User.findByIdAndUpdate(students[4]._id, { enrolledCourses: [courses[0]._id, courses[1]._id] });

  console.log('\n✅ Database seeded successfully!\n');
  console.log('LOGIN CREDENTIALS:');
  console.log('==================');
  console.log('Admin:   admin@jims.edu    | Admin@123');
  console.log('Faculty: archana@jims.edu   | Faculty@123');
  console.log('Faculty: jps@jims.edu    | Faculty@123');
  console.log('Student: gaurav_arora@jims.edu    | Gaurav@123');
  console.log('Student: aastha_setia@jims.edu    | Aastha@123');
  
  mongoose.connection.close();
};

seed().catch(console.error);
