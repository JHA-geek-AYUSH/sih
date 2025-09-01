// MongoDB initialization script for Docker
db = db.getSiblingDB('pharmalytics_care');

// Create collections
db.createCollection('users');
db.createCollection('medicines');
db.createCollection('inventories');
db.createCollection('reservations');
db.createCollection('analytics');
db.createCollection('mlmodels');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "location.coordinates": "2dsphere" });

db.medicines.createIndex({ "name": "text", "genericName": "text", "category": "text" });
db.medicines.createIndex({ "category": 1 });
db.medicines.createIndex({ "isActive": 1 });

db.inventories.createIndex({ "pharmacy": 1, "medicine": 1 });
db.inventories.createIndex({ "status": 1 });
db.inventories.createIndex({ "pharmacy": 1, "status": 1 });

db.reservations.createIndex({ "patient": 1, "status": 1 });
db.reservations.createIndex({ "pharmacy": 1, "status": 1 });
db.reservations.createIndex({ "reservationCode": 1 }, { unique: true });
db.reservations.createIndex({ "expiresAt": 1 });

db.analytics.createIndex({ "type": 1, "date": -1 });
db.analytics.createIndex({ "pharmacy": 1, "date": -1 });

print('Database initialized successfully');
