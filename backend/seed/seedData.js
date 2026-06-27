import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// ── Import all models ─────────────────────────────────────────────────────────
import User          from '../models/User.js';
import WasteReport   from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';
import Route         from '../models/Route.js';
import Staff         from '../models/Staff.js';
import Vehicle       from '../models/Vehicle.js';
import AIInsight     from '../models/AIInsight.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/waste_management';

// ── Helpers ───────────────────────────────────────────────────────────────────
const daysFromNow  = (n) => new Date(Date.now() + n * 86400000);
const daysAgo      = (n) => new Date(Date.now() - n * 86400000);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═════════════════════════════════════════════════════════════════════════════
//  SEED FUNCTION
// ═════════════════════════════════════════════════════════════════════════════
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing data
    await Promise.all([
      User.deleteMany({}),
      WasteReport.deleteMany({}),
      PickupRequest.deleteMany({}),
      Route.deleteMany({}),
      Staff.deleteMany({}),
      Vehicle.deleteMany({}),
      AIInsight.deleteMany({}),
    ]);
    console.log('🗑  Cleared existing collections');

    // ── 1. Users ──────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 12);
    const adminPasswordHash = await bcrypt.hash('Aritra@2003', 12);

    const users = await User.insertMany([
      {
        name:     'Aritra Sarkar',
        email:    'sarkararitra2003@gmail.com',
        password: adminPasswordHash,
        role:     'admin',
        phone:    '+91 81015 07172',
        isActive: true,
        lastLogin: daysAgo(1),
        address: { street: '1 Admin Plaza', city: 'Kolkata', state: 'West Bengal', zip: '700001' },
      },
      {
        name:     'Priya Sharma',
        email:    'priya@example.com',
        password: passwordHash,
        role:     'user',
        phone:    '+91 98765 11111',
        isActive: true,
        lastLogin: daysAgo(2),
        address: { street: '42 Park Street', city: 'Kolkata', state: 'West Bengal', zip: '700016' },
      },
      {
        name:     'Rahul Mehta',
        email:    'rahul@example.com',
        password: passwordHash,
        role:     'user',
        phone:    '+91 98765 22222',
        isActive: true,
        lastLogin: daysAgo(5),
        address: { street: '7 Salt Lake Blvd', city: 'Kolkata', state: 'West Bengal', zip: '700091' },
      },
      {
        name:     'Anita Das',
        email:    'anita@example.com',
        password: passwordHash,
        role:     'user',
        phone:    '+91 98765 33333',
        isActive: true,
        lastLogin: daysAgo(10),
        address: { street: '15 New Town Ave', city: 'Kolkata', state: 'West Bengal', zip: '700156' },
      },
      {
        name:     'Suresh Nair',
        email:    'suresh@example.com',
        password: passwordHash,
        role:     'user',
        phone:    '+91 98765 44444',
        isActive: false,
        address: { street: '88 Howrah Bridge Rd', city: 'Howrah', state: 'West Bengal', zip: '711101' },
      },
    ]);

    const [admin, priya, rahul, anita, suresh] = users;
    console.log(`👤 Created ${users.length} users`);

    // ── 2. Staff ──────────────────────────────────────────────────────────────
    const staffMembers = await Staff.insertMany([
      {
        name:         'Rajesh Kumar',
        employeeId:   'EMP001',
        role:         'driver',
        phone:        '+91 70000 10001',
        email:        'rajesh.driver@ecomanage.com',
        licenseNumber: 'WB-0120230045123',
        availability:  'available',
        shiftTiming:   { start: '06:00 AM', end: '02:00 PM' },
        joiningDate:   daysAgo(365),
        isActive:      true,
        performanceRating: 4.7,
        totalPickupsCompleted: 142,
      },
      {
        name:         'Mohan Singh',
        employeeId:   'EMP002',
        role:         'driver',
        phone:        '+91 70000 10002',
        email:        'mohan.driver@ecomanage.com',
        licenseNumber: 'WB-0120230067890',
        availability:  'available',
        shiftTiming:   { start: '02:00 PM', end: '10:00 PM' },
        joiningDate:   daysAgo(200),
        isActive:      true,
        performanceRating: 4.2,
        totalPickupsCompleted: 87,
      },
      {
        name:         'Deepa Roy',
        employeeId:   'EMP003',
        role:         'collector',
        phone:        '+91 70000 10003',
        availability:  'available',
        shiftTiming:   { start: '06:00 AM', end: '02:00 PM' },
        joiningDate:   daysAgo(180),
        isActive:      true,
        performanceRating: 4.5,
        totalPickupsCompleted: 210,
      },
      {
        name:         'Vikram Patil',
        employeeId:   'EMP004',
        role:         'supervisor',
        phone:        '+91 70000 10004',
        email:        'vikram.sup@ecomanage.com',
        availability:  'available',
        shiftTiming:   { start: '08:00 AM', end: '04:00 PM' },
        joiningDate:   daysAgo(730),
        isActive:      true,
        performanceRating: 4.9,
        totalPickupsCompleted: 0,
      },
    ]);

    const [rajesh, mohan, deepa, vikram] = staffMembers;
    console.log(`👷 Created ${staffMembers.length} staff members`);

    // ── 3. Vehicles ───────────────────────────────────────────────────────────
    const vehicles = await Vehicle.insertMany([
      {
        registrationNumber: 'WB-02-AB-1234',
        type:          'compactor',
        model:         'Tata Ultra 1518',
        manufacturer:  'Tata Motors',
        year:          2021,
        capacity:      { value: 8000, unit: 'kg' },
        fuelType:      'diesel',
        status:        'available',
        currentMileage: 42500,
        lastServiced:   daysAgo(30),
        nextServiceDue: daysFromNow(60),
        isActive:      true,
      },
      {
        registrationNumber: 'WB-02-CD-5678',
        type:          'large_truck',
        model:         'Ashok Leyland 2518',
        manufacturer:  'Ashok Leyland',
        year:          2020,
        capacity:      { value: 12000, unit: 'kg' },
        fuelType:      'diesel',
        status:        'available',
        currentMileage: 68200,
        lastServiced:   daysAgo(15),
        nextServiceDue: daysFromNow(45),
        isActive:      true,
      },
      {
        registrationNumber: 'WB-02-EF-9012',
        type:          'recycling_van',
        model:         'Mahindra Supro',
        manufacturer:  'Mahindra',
        year:          2022,
        capacity:      { value: 2000, unit: 'kg' },
        fuelType:      'electric',
        status:        'available',
        currentMileage: 12800,
        lastServiced:   daysAgo(7),
        nextServiceDue: daysFromNow(90),
        isActive:      true,
      },
      {
        registrationNumber: 'WB-02-GH-3456',
        type:          'hazmat_vehicle',
        model:         'Force Traveller HazMat',
        manufacturer:  'Force Motors',
        year:          2019,
        capacity:      { value: 3000, unit: 'kg' },
        fuelType:      'diesel',
        status:        'maintenance',
        currentMileage: 95000,
        lastServiced:   daysAgo(90),
        nextServiceDue: daysAgo(1),   // Overdue!
        isActive:      true,
      },
    ]);

    const [compactor, largeTruck, recyclingVan, hazmat] = vehicles;
    console.log(`🚛 Created ${vehicles.length} vehicles`);

    // ── 4. Waste Reports ──────────────────────────────────────────────────────
    const reportData = [
      {
        reportedBy:   priya._id,
        title:        'Overflowing bin near Central Park',
        description:  'The general waste bin at the park entrance has been overflowing for 3 days. Causing smell and attracting pests.',
        category:     'general',
        status:       'pending',
        priority:     'high',
        location:     { address: 'Central Park Entrance, Park Street', city: 'Kolkata', coordinates: { lat: 22.5448, lng: 88.3426 } },
        images:       [],
      },
      {
        reportedBy:   rahul._id,
        title:        'Plastic waste dumped in storm drain',
        description:  'Large quantity of plastic bags and bottles found blocking the storm drain on Salt Lake Sector V.',
        category:     'recyclable',
        status:       'reviewed',
        priority:     'critical',
        location:     { address: 'Sector V, Salt Lake', city: 'Kolkata', coordinates: { lat: 22.5697, lng: 88.4306 } },
        images:       [],
        adminNotes:   'Assigned to North-East Zone team for immediate clearance.',
        aiAnalysis: {
          classifiedCategory: 'recyclable',
          isRecyclable:       true,
          disposalMethod:     'Collect and send to nearest plastic recycling facility.',
          confidence:         0.92,
          analyzedAt:         daysAgo(1),
        },
      },
      {
        reportedBy:   anita._id,
        title:        'Old electronics dumped on roadside',
        description:  'Several broken TVs and computers left on the footpath near New Town Eco Park.',
        category:     'electronic',
        status:       'in_progress',
        priority:     'high',
        location:     { address: 'New Town Eco Park, Action Area II', city: 'Kolkata' },
        images:       [],
        aiAnalysis: {
          classifiedCategory: 'electronic',
          isRecyclable:       true,
          disposalMethod:     'Transport to certified e-waste recycling facility. Do not dispose in landfill.',
          confidence:         0.88,
          analyzedAt:         daysAgo(3),
        },
      },
      {
        reportedBy:   priya._id,
        title:        'Organic waste left near market',
        description:  'Vegetable and fruit waste from weekly market not cleared in 2 days.',
        category:     'organic',
        status:       'resolved',
        priority:     'medium',
        location:     { address: 'Gariahat Market, Gariahat', city: 'Kolkata' },
        images:       [],
        resolvedAt:   daysAgo(1),
      },
      {
        reportedBy:   rahul._id,
        title:        'Construction debris on public road',
        description:  'Bricks, cement bags, and debris from a building project blocking half the road.',
        category:     'construction',
        status:       'pending',
        priority:     'high',
        location:     { address: 'Lake Road, Ballygunge', city: 'Kolkata' },
        images:       [],
      },
    ];

    const reports = await WasteReport.insertMany(reportData);
    console.log(`📋 Created ${reports.length} waste reports`);

    // ── 5. Pickup Requests ────────────────────────────────────────────────────
    const pickupData = [
      {
        requestedBy:      priya._id,
        wasteType:        'recyclable',
        quantity:         { value: 15, unit: 'kg' },
        description:      'Mixed plastic bottles, cardboard boxes, and newspaper.',
        pickupAddress:    { street: '42 Park Street', city: 'Kolkata', state: 'West Bengal', zip: '700016', coordinates: { lat: 22.5448, lng: 88.3426 } },
        preferredDate:    daysFromNow(2),
        preferredTimeSlot: 'morning',
        status:           'approved',
        statusHistory:    [
          { status: 'pending',  changedAt: daysAgo(3) },
          { status: 'approved', changedAt: daysAgo(2) },
        ],
      },
      {
        requestedBy:      rahul._id,
        wasteType:        'electronic',
        quantity:         { value: 5, unit: 'items' },
        description:      'Old laptop, 2 monitors, broken printer and a microwave.',
        pickupAddress:    { street: '7 Salt Lake Blvd', city: 'Kolkata', state: 'West Bengal', zip: '700091' },
        preferredDate:    daysFromNow(1),
        preferredTimeSlot: 'afternoon',
        status:           'assigned',
        assignedTo: {
          staff:   rajesh._id,
          vehicle: recyclingVan._id,
        },
        scheduledDate:    daysFromNow(1),
        statusHistory:    [
          { status: 'pending',  changedAt: daysAgo(4) },
          { status: 'approved', changedAt: daysAgo(3) },
          { status: 'assigned', changedAt: daysAgo(2) },
        ],
      },
      {
        requestedBy:      anita._id,
        wasteType:        'general',
        quantity:         { value: 8, unit: 'bags' },
        description:      'Weekly household waste — regular collection.',
        pickupAddress:    { street: '15 New Town Ave', city: 'Kolkata', state: 'West Bengal', zip: '700156' },
        preferredDate:    daysAgo(5),
        preferredTimeSlot: 'morning',
        status:           'completed',
        assignedTo: {
          staff:   mohan._id,
          vehicle: compactor._id,
        },
        scheduledDate: daysAgo(5),
        completedAt:   daysAgo(5),
        statusHistory: [
          { status: 'pending',     changedAt: daysAgo(10) },
          { status: 'approved',    changedAt: daysAgo(9) },
          { status: 'assigned',    changedAt: daysAgo(8) },
          { status: 'in_progress', changedAt: daysAgo(5) },
          { status: 'completed',   changedAt: daysAgo(5) },
        ],
        feedback: {
          rating:  5,
          comment: 'Very prompt and professional service. Highly recommended!',
          givenAt: daysAgo(4),
        },
      },
      {
        requestedBy:      priya._id,
        wasteType:        'organic',
        quantity:         { value: 20, unit: 'kg' },
        description:      'Kitchen compost waste from restaurant.',
        pickupAddress:    { street: '42 Park Street', city: 'Kolkata', state: 'West Bengal', zip: '700016' },
        preferredDate:    daysFromNow(3),
        preferredTimeSlot: 'evening',
        status:           'pending',
        statusHistory:    [{ status: 'pending', changedAt: daysAgo(1) }],
      },
      {
        requestedBy:      rahul._id,
        wasteType:        'hazardous',
        quantity:         { value: 3, unit: 'items' },
        description:      'Old car batteries and paint cans.',
        pickupAddress:    { street: '7 Salt Lake Blvd', city: 'Kolkata', state: 'West Bengal', zip: '700091' },
        preferredDate:    daysFromNow(4),
        preferredTimeSlot: 'morning',
        status:           'rejected',
        rejectionReason:  'Hazmat vehicle currently under maintenance. Please reschedule for next week.',
        statusHistory:    [
          { status: 'pending',  changedAt: daysAgo(2) },
          { status: 'rejected', changedAt: daysAgo(1) },
        ],
      },
      {
        requestedBy:      anita._id,
        wasteType:        'general',
        quantity:         { value: 6, unit: 'bags' },
        description:      'Regular weekly collection.',
        pickupAddress:    { street: '15 New Town Ave', city: 'Kolkata', state: 'West Bengal', zip: '700156' },
        preferredDate:    daysAgo(2),
        preferredTimeSlot: 'morning',
        status:           'completed',
        assignedTo: {
          staff:   deepa._id,
          vehicle: largeTruck._id,
        },
        scheduledDate: daysAgo(2),
        completedAt:   daysAgo(2),
        statusHistory: [
          { status: 'pending',     changedAt: daysAgo(7) },
          { status: 'approved',    changedAt: daysAgo(6) },
          { status: 'assigned',    changedAt: daysAgo(5) },
          { status: 'in_progress', changedAt: daysAgo(2) },
          { status: 'completed',   changedAt: daysAgo(2) },
        ],
        feedback: {
          rating:  4,
          comment: 'Good service, arrived slightly late but did a thorough job.',
          givenAt: daysAgo(1),
        },
      },
    ];

    const pickups = await PickupRequest.insertMany(pickupData);
    console.log(`🗂  Created ${pickups.length} pickup requests`);

    // ── 6. Routes ─────────────────────────────────────────────────────────────
    const routesData = [
      {
        name:            'North Zone Morning Run',
        zone:            'North Kolkata',
        assignedVehicle: compactor._id,
        assignedDriver:  rajesh._id,
        scheduledDate:   daysFromNow(1),
        startTime:       '06:30 AM',
        endTime:         '01:00 PM',
        status:          'planned',
        totalDistance:   { value: 34.5, unit: 'km' },
        estimatedDuration: 390,
        stops: [
          { order: 1, address: '42 Park Street, Kolkata', estimatedArrival: '07:00 AM', isCompleted: false, coordinates: { lat: 22.5448, lng: 88.3426 } },
          { order: 2, address: 'Shyambazar Crossing, Kolkata', estimatedArrival: '08:15 AM', isCompleted: false, coordinates: { lat: 22.5887, lng: 88.3726 } },
          { order: 3, address: 'Sovabazar Market, Kolkata', estimatedArrival: '09:30 AM', isCompleted: false, coordinates: { lat: 22.5894, lng: 88.3640 } },
          { order: 4, address: 'Ultadanga Main Road, Kolkata', estimatedArrival: '10:45 AM', isCompleted: false, coordinates: { lat: 22.5856, lng: 88.3961 } },
        ],
        aiOptimizationNotes: {
          suggestion:    'Reorder stops 2→3→4→1 to reduce backtracking by 6.2 km. Start from Ultadanga and sweep south to Park Street.',
          savedDistance: 6.2,
          generatedAt:  daysAgo(1),
        },
        notes: 'Prioritize the Park Street area — report of overflowing bins.',
      },
      {
        name:            'East Zone Recycling Collection',
        zone:            'East Kolkata',
        assignedVehicle: recyclingVan._id,
        assignedDriver:  mohan._id,
        scheduledDate:   daysFromNow(2),
        startTime:       '08:00 AM',
        endTime:         '03:00 PM',
        status:          'planned',
        totalDistance:   { value: 28.0, unit: 'km' },
        estimatedDuration: 420,
        stops: [
          { order: 1, address: '7 Salt Lake Blvd, Kolkata', estimatedArrival: '08:30 AM', isCompleted: false },
          { order: 2, address: 'Sector V IT Hub, Salt Lake', estimatedArrival: '09:45 AM', isCompleted: false },
          { order: 3, address: 'New Town Eco Park, Action Area II', estimatedArrival: '11:00 AM', isCompleted: false },
          { order: 4, address: 'Rajarhat Township, New Town', estimatedArrival: '12:30 PM', isCompleted: false },
        ],
      },
      {
        name:            'South Zone Yesterday',
        zone:            'South Kolkata',
        assignedVehicle: largeTruck._id,
        assignedDriver:  rajesh._id,
        scheduledDate:   daysAgo(1),
        startTime:       '07:00 AM',
        endTime:         '02:30 PM',
        status:          'completed',
        totalDistance:   { value: 41.2, unit: 'km' },
        estimatedDuration: 450,
        stops: [
          { order: 1, address: 'Gariahat Market, Gariahat', estimatedArrival: '07:30 AM', isCompleted: true },
          { order: 2, address: 'Lake Road, Ballygunge', estimatedArrival: '09:00 AM', isCompleted: true },
          { order: 3, address: 'Tollygunge Metro, Kolkata', estimatedArrival: '10:30 AM', isCompleted: true },
          { order: 4, address: 'Behala Chowrasta, Kolkata', estimatedArrival: '12:00 PM', isCompleted: true },
        ],
      },
    ];

    const routes = await Route.insertMany(routesData);
    console.log(`🗺  Created ${routes.length} routes`);

    // ── 7. AI Insights ────────────────────────────────────────────────────────
    const aiInsightsData = [
      {
        type: 'waste_classification',
        relatedTo: { model: 'WasteReport', documentId: reports[1]._id },
        payload: {
          classifiedCategory: 'recyclable',
          isRecyclable:       true,
          confidence:         0.92,
          disposalMethod:     'Collect and transport to nearest plastic recycling facility. Separate PET, HDPE, and LDPE plastics before processing.',
          tags:               ['plastic', 'recyclable', 'high-confidence'],
          rawInput:           'Plastic waste dumped in storm drain — Salt Lake Sector V',
          summary:            'Recyclable plastic detected with 92% confidence. Recommend immediate collection and recycling.',
        },
        model:       'mock',
        generatedBy: priya._id,
        isRead:      false,
        createdAt:   daysAgo(1),
      },
      {
        type: 'route_optimization',
        relatedTo: { model: 'Route', documentId: routes[0]._id },
        payload: {
          originalDistance:  34.5,
          optimizedDistance: 28.3,
          savedDistance:     6.2,
          routeSuggestion:   'Reorder stops to follow a geographic sweep from north to south rather than the current out-and-back pattern. This reduces total distance by 18% and estimated time by 45 minutes.',
          summary:           'Route optimization found 6.2 km saving for North Zone Morning Run.',
        },
        model:       'mock',
        generatedBy: admin._id,
        isRead:      false,
        createdAt:   daysAgo(1),
      },
      {
        type: 'predictive_analytics',
        payload: {
          forecastPeriod:  'next_7_days',
          predictedVolume: 1240,
          trend:           'increasing',
          recommendedActions: [
            'Schedule an additional compactor run on Thursday — predicted 35% volume spike near Gariahat market.',
            'Pre-position the recycling van in Salt Lake Sector V by Tuesday morning.',
            'Alert North Zone residents about weekend collection schedule change.',
            'Consider deploying a third driver for the coming weekend due to forecasted bulk waste increase.',
          ],
          summary: 'Waste generation is expected to increase by 23% over the next 7 days with an estimated 1,240 kg total. Recyclable waste accounts for the largest share at 38%. Proactive scheduling adjustments are strongly recommended for Thursday and the weekend.',
        },
        model:       'mock',
        generatedBy: admin._id,
        isRead:      false,
        createdAt:   daysAgo(2),
      },
      {
        type: 'anomaly_detection',
        payload: {
          anomalyDescription: 'Unusual spike in hazardous waste reports detected in the Howrah district over the past 72 hours — 4 reports vs. baseline average of 0.5/week.',
          severity:           'high',
          summary:            'High-severity anomaly: Hazardous waste spike in Howrah. Immediate investigation recommended.',
          recommendedActions: [
            'Dispatch supervisor to Howrah district for on-ground assessment.',
            'Cross-reference with local industrial permits and recent activity.',
            'Prepare hazmat vehicle for deployment pending assessment.',
          ],
        },
        model:       'mock',
        generatedBy: admin._id,
        isRead:      true,
        createdAt:   daysAgo(3),
      },
      {
        type: 'disposal_recommendation',
        payload: {
          classifiedCategory: 'electronic',
          isRecyclable:       true,
          confidence:         0.88,
          disposalMethod:     'E-waste must be transported to a certified CPCB-approved e-waste dismantler. Data storage devices should be securely wiped before handover. Do not crush or incinerate.',
          tags:               ['e-waste', 'certified-disposal', 'data-security'],
          summary:            'Electronic waste requires certified disposal. Identified 5 items for e-waste collection route.',
        },
        model:       'mock',
        generatedBy: rahul._id,
        isRead:      false,
        createdAt:   daysAgo(4),
      },
    ];

    const aiInsights = await AIInsight.insertMany(aiInsightsData);
    console.log(`🤖 Created ${aiInsights.length} AI insights`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY');
    console.log('════════════════════════════════════════════');
    console.log('\n📌 Login credentials\n');
    console.log('  ADMIN');
    console.log('  Email:    sarkararitra2003@gmail.com');
    console.log('  Password: Aritra@2003\n');
    console.log('  USER 1');
    console.log('  Email:    priya@example.com');
    console.log('  Password: password123\n');
    console.log('  USER 2');
    console.log('  Email:    rahul@example.com');
    console.log('  Password: password123\n');
    console.log('  USER 3');
    console.log('  Email:    anita@example.com');
    console.log('  Password: password123\n');
    console.log('════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

seed();