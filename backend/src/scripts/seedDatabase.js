import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import connectDB from '../config/database.js';
import logger from '../utils/logger.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});

    logger.info('Database cleared');

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@rhms.com',
      password: 'admin123',
      phone: '+919876543210',
      role: 'admin'
    });

    // Create sample pharmacies
    const pharmacies = await User.create([
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@ruralhealth.com',
        password: 'pharmacy123',
        phone: '+919876543211',
        role: 'pharmacy',
        location: {
          address: 'Village Center, Gram Panchayat Road',
          coordinates: { latitude: 28.6139, longitude: 77.2090 },
          district: 'Rural District',
          state: 'Uttar Pradesh'
        },
        pharmacyDetails: {
          licenseNumber: 'PH001',
          pharmacyName: 'Rural Health Pharmacy',
          address: 'Village Center, 2 km from Main Road',
          verified: true
        }
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya@communitymed.com',
        password: 'pharmacy123',
        phone: '+919876543212',
        role: 'pharmacy',
        location: {
          address: 'Main Road, Near Bus Stand',
          coordinates: { latitude: 28.7041, longitude: 77.1025 },
          district: 'Rural District',
          state: 'Uttar Pradesh'
        },
        pharmacyDetails: {
          licenseNumber: 'PH002',
          pharmacyName: 'Community Medical Store',
          address: 'Main Road, 5 km from Village Center',
          verified: true
        }
      },
      {
        name: 'Dr. Amit Patel',
        email: 'amit@districthealth.com',
        password: 'pharmacy123',
        phone: '+919876543213',
        role: 'pharmacy',
        location: {
          address: 'Town Square, District Headquarters',
          coordinates: { latitude: 28.5355, longitude: 77.3910 },
          district: 'Rural District',
          state: 'Uttar Pradesh'
        },
        pharmacyDetails: {
          licenseNumber: 'PH003',
          pharmacyName: 'District Health Center',
          address: 'Town Square, 8 km from Village',
          verified: true
        }
      }
    ]);

    // Create sample patients
    const patients = await User.create([
      {
        name: 'Ramesh Singh',
        email: 'ramesh@example.com',
        password: 'patient123',
        phone: '+919876543214',
        role: 'patient',
        location: {
          address: 'Village Mohalla, House No. 123',
          coordinates: { latitude: 28.6129, longitude: 77.2295 },
          district: 'Rural District',
          state: 'Uttar Pradesh'
        }
      },
      {
        name: 'Sunita Devi',
        email: 'sunita@example.com',
        password: 'patient123',
        phone: '+919876543215',
        role: 'patient',
        location: {
          address: 'Farmer Colony, Plot No. 45',
          coordinates: { latitude: 28.6149, longitude: 77.2085 },
          district: 'Rural District',
          state: 'Uttar Pradesh'
        }
      }
    ]);

    // Create medicines
    const medicines = await Medicine.create([
      {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        category: 'Pain Relief',
        manufacturer: 'Cipla Ltd',
        description: 'Pain reliever and fever reducer',
        dosage: {
          form: 'tablet',
          strength: '500mg',
          instructions: 'Take 1-2 tablets every 4-6 hours as needed'
        },
        requiresPrescription: false
      },
      {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'Sun Pharma',
        description: 'Antibiotic for bacterial infections',
        dosage: {
          form: 'capsule',
          strength: '250mg',
          instructions: 'Take 1 capsule 3 times daily for 7 days'
        },
        requiresPrescription: true
      },
      {
        name: 'Insulin',
        genericName: 'Human Insulin',
        category: 'Diabetes',
        manufacturer: 'Novo Nordisk',
        description: 'Insulin for diabetes management',
        dosage: {
          form: 'injection',
          strength: '100 IU/ml',
          instructions: 'As prescribed by doctor'
        },
        requiresPrescription: true
      },
      {
        name: 'Metformin',
        genericName: 'Metformin HCl',
        category: 'Diabetes',
        manufacturer: 'Dr. Reddy\'s',
        description: 'Medication for type 2 diabetes',
        dosage: {
          form: 'tablet',
          strength: '500mg',
          instructions: 'Take 1 tablet twice daily with meals'
        },
        requiresPrescription: true
      },
      {
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        category: 'Pain Relief',
        manufacturer: 'Bayer',
        description: 'Pain reliever and blood thinner',
        dosage: {
          form: 'tablet',
          strength: '75mg',
          instructions: 'Take 1 tablet daily as prescribed'
        },
        requiresPrescription: false
      }
    ]);

    // Create inventory for pharmacies
    const inventoryData = [];
    
    // Pharmacy 1 inventory
    inventoryData.push(
      {
        medicine: medicines[0]._id, // Paracetamol
        pharmacy: pharmacies[0]._id,
        currentStock: 45,
        minStockLevel: 20,
        maxStockLevel: 100,
        price: 12,
        batchNumber: 'PAR001',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        supplier: 'Medical Distributors Ltd'
      },
      {
        medicine: medicines[3]._id, // Metformin
        pharmacy: pharmacies[0]._id,
        currentStock: 28,
        minStockLevel: 25,
        maxStockLevel: 80,
        price: 35,
        batchNumber: 'MET001',
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        supplier: 'Pharma Supply Co'
      }
    );

    // Pharmacy 2 inventory
    inventoryData.push(
      {
        medicine: medicines[1]._id, // Amoxicillin
        pharmacy: pharmacies[1]._id,
        currentStock: 12,
        minStockLevel: 15,
        maxStockLevel: 60,
        price: 85,
        batchNumber: 'AMX001',
        expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
        supplier: 'Medical Distributors Ltd'
      },
      {
        medicine: medicines[4]._id, // Aspirin
        pharmacy: pharmacies[1]._id,
        currentStock: 5,
        minStockLevel: 15,
        maxStockLevel: 50,
        price: 8,
        batchNumber: 'ASP001',
        expiryDate: new Date(Date.now() + 450 * 24 * 60 * 60 * 1000),
        supplier: 'Health Supply Chain'
      }
    );

    // Pharmacy 3 inventory
    inventoryData.push(
      {
        medicine: medicines[2]._id, // Insulin
        pharmacy: pharmacies[2]._id,
        currentStock: 0,
        minStockLevel: 10,
        maxStockLevel: 30,
        price: 450,
        batchNumber: 'INS001',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        supplier: 'Diabetes Care Supplies'
      }
    );

    await Inventory.create(inventoryData);

    logger.info('Database seeded successfully');
    console.log('\n✅ Database seeded with sample data:');
    console.log(`📊 Admin: admin@rhms.com (password: admin123)`);
    console.log(`🏥 Pharmacies: ${pharmacies.length} created`);
    console.log(`👥 Patients: ${patients.length} created`);
    console.log(`💊 Medicines: ${medicines.length} created`);
    console.log(`📦 Inventory items: ${inventoryData.length} created`);

    process.exit(0);

  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedData();
