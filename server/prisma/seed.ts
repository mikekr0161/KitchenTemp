import { PrismaClient, Role, ChecklistCategory, Frequency, ChecklistRunStatus, EquipmentType, WasteType, ShiftStatus, ShiftSource, ClockInMethod, TrainingAssignmentStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.allergen.createMany({
    data: [
      'Gluten', 'Peanuts', 'Tree Nuts', 'Soy', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Sesame', 'Celery', 'Mustard', 'Sulphites', 'Lupin', 'Molluscs',
    ].map((name) => ({ name })),
    skipDuplicates: true,
  });

  const organisation = await prisma.organisation.create({
    data: {
      name: 'The Good Food Co.',
      billing_email: 'billing@goodfood.com',
      plan: 'PREMIUM',
      timezone: 'Europe/London',
      settings_json: { notifications: true },
    },
  });

  const [location1, location2] = await Promise.all([
    prisma.location.create({
      data: { organisation_id: organisation.id, name: 'Bristol Kitchen', address: '123 Fake Street', city: 'Bristol', postcode: 'BS1 1AA', country: 'UK' },
    }),
    prisma.location.create({
      data: { organisation_id: organisation.id, name: 'London Central', address: '456 High Road', city: 'London', postcode: 'W1 1BB', country: 'UK' },
    }),
  ]);

  const [owner, manager, chef, staff] = await Promise.all([
    prisma.user.create({
      data: { organisation_id: organisation.id, email: 'owner@goodfood.com', password_hash: hashedPassword, first_name: 'Jane', last_name: 'Owner', global_role: Role.OWNER },
    }),
    prisma.user.create({
      data: { organisation_id: organisation.id, email: 'manager@goodfood.com', password_hash: hashedPassword, first_name: 'Mike', last_name: 'Manager', global_role: Role.MANAGER },
    }),
    prisma.user.create({
      data: { organisation_id: organisation.id, email: 'chef@goodfood.com', password_hash: hashedPassword, first_name: 'Carlos', last_name: 'Chef', global_role: Role.CHEF },
    }),
    prisma.user.create({
      data: { organisation_id: organisation.id, email: 'staff@goodfood.com', password_hash: hashedPassword, first_name: 'Sasha', last_name: 'Server', global_role: Role.STAFF },
    }),
  ]);

  await prisma.userLocation.createMany({
    data: [
      { user_id: owner.id, location_id: location1.id, role: Role.OWNER },
      { user_id: owner.id, location_id: location2.id, role: Role.OWNER },
      { user_id: manager.id, location_id: location1.id, role: Role.MANAGER },
      { user_id: chef.id, location_id: location1.id, role: Role.CHEF },
      { user_id: staff.id, location_id: location1.id, role: Role.STAFF },
    ],
    skipDuplicates: true,
  });

  const fridges = await prisma.equipment.createMany({
    data: [
      { location_id: location1.id, name: 'Walk-in Fridge 1', type: EquipmentType.FRIDGE, target_temp_min: 1, target_temp_max: 5 },
      { location_id: location1.id, name: 'Freezer 2', type: EquipmentType.FREEZER, target_temp_min: -18, target_temp_max: -12 },
    ],
  });

  const equipment = await prisma.equipment.findMany({ where: { location_id: location1.id } });
  await prisma.temperatureLog.createMany({
    data: equipment.flatMap((eq) => [
      { equipment_id: eq.id, user_id: manager.id, recorded_at: new Date(), temperature_c: 3.5, is_within_range: true },
      { equipment_id: eq.id, user_id: chef.id, recorded_at: new Date(Date.now() - 86400000), temperature_c: 4, is_within_range: true },
    ]),
  });

  const checklistTemplate = await prisma.checklistTemplate.create({
    data: {
      organisation_id: organisation.id,
      location_id: location1.id,
      name: 'Opening Routine',
      category: ChecklistCategory.OPENING,
      frequency: Frequency.DAILY,
      items: {
        create: [
          { order_index: 1, label: 'Fridge temperatures recorded', description: 'Record all fridges', is_required: true },
          { order_index: 2, label: 'Sanitise prep surfaces', is_required: true },
          { order_index: 3, label: 'Check wash stations', requires_photo: false },
        ],
      },
    },
    include: { items: true },
  });

  const checklistRun = await prisma.checklistRun.create({
    data: {
      checklist_template_id: checklistTemplate.id,
      location_id: location1.id,
      started_by_user_id: manager.id,
      started_at: new Date(Date.now() - 2 * 3600000),
      status: ChecklistRunStatus.IN_PROGRESS,
      run_items: { create: checklistTemplate.items.map((item) => ({ checklist_item_id: item.id })) },
    },
    include: { run_items: true },
  });

  await prisma.checklistRun.update({
    where: { id: checklistRun.id },
    data: {
      status: ChecklistRunStatus.COMPLETED,
      completed_at: new Date(Date.now() - 3600000),
      run_items: {
        updateMany: { where: {}, data: { checked_by_user_id: chef.id, checked_at: new Date(Date.now() - 4500000), value: 'true' } },
      },
    },
  });

  await prisma.hygieneScore.create({
    data: {
      location_id: location1.id,
      period_start: new Date(Date.now() - 7 * 86400000),
      period_end: new Date(),
      compliance_score: 94,
      completion_rate: 0.92,
      issue_count: 2,
      notes: 'Strong performance, minor issues resolved.',
    },
  });

  const supplier = await prisma.supplier.create({
    data: { organisation_id: organisation.id, name: 'Fresh Farms', contact_email: 'orders@freshfarms.com' },
  });

  const [chicken, lettuce] = await Promise.all([
    prisma.ingredient.create({ data: { organisation_id: organisation.id, name: 'Chicken Breast', unit: 'KG', category: 'Protein', default_cost_per_unit: 5.2 } }),
    prisma.ingredient.create({ data: { organisation_id: organisation.id, name: 'Lettuce', unit: 'UNIT', category: 'Produce', default_cost_per_unit: 1.1 } }),
  ]);

  const batch = await prisma.stockBatch.create({
    data: {
      location_id: location1.id,
      ingredient_id: chicken.id,
      batch_code: 'CB-1001',
      quantity: 20,
      unit_cost: 5,
      received_at: new Date(Date.now() - 3 * 86400000),
      use_by_date: new Date(Date.now() + 5 * 86400000),
    },
  });

  await prisma.stockMovement.create({
    data: { stock_batch_id: batch.id, type: 'DELIVERY', quantity_delta: 20, created_by_user_id: manager.id, reason: 'Initial delivery' },
  });

  await prisma.wasteLog.createMany({
    data: [
      { location_id: location1.id, ingredient_id: chicken.id, type: WasteType.PREP_WASTE, estimated_quantity: 1, estimated_cost: 5, logged_by_user_id: chef.id, logged_at: new Date(Date.now() - 2 * 86400000) },
      { location_id: location1.id, ingredient_id: lettuce.id, type: WasteType.PLATE_WASTE, estimated_quantity: 3, estimated_cost: 3.3, logged_by_user_id: staff.id, logged_at: new Date() },
    ],
  });

  const burger = await prisma.menuItem.create({
    data: {
      location_id: location1.id,
      name: 'House Burger',
      description: 'Prime beef with brioche bun',
      price: 14,
      is_active: true,
      ingredients: { create: [{ ingredient_id: chicken.id, quantity: 0.2 }] },
      allergens: {
        create: await prisma.allergen.findMany({ where: { name: { in: ['Gluten', 'Dairy'] } } }).then((allergens) =>
          allergens.map((a) => ({ allergen_id: a.id }))
        ),
      },
    },
  });

  await prisma.liveMenuStatus.create({
    data: { menu_item_id: burger.id, is_available: true, last_updated_by_user_id: manager.id, last_updated_at: new Date() },
  });

  await prisma.staffProfile.create({
    data: { user_id: staff.id, default_location_id: location1.id, hourly_rate: 12.5, contracted_hours_per_week: 35 },
  });

  const shift = await prisma.shift.create({
    data: {
      location_id: location1.id,
      user_id: staff.id,
      start_time: new Date(Date.now() + 2 * 3600000),
      end_time: new Date(Date.now() + 6 * 3600000),
      status: ShiftStatus.CONFIRMED,
      source: ShiftSource.ROTA,
    },
  });

  await prisma.timeEntry.create({
    data: {
      shift_id: shift.id,
      user_id: staff.id,
      clock_in_time: new Date(Date.now() - 3600000),
      clock_out_time: new Date(Date.now() - 600000),
      clock_in_method: ClockInMethod.MOBILE,
    },
  });

  const trainingModule = await prisma.trainingModule.create({
    data: {
      organisation_id: organisation.id,
      title: 'Food Hygiene Level 2',
      description: 'Core hygiene practices for kitchen staff',
      estimated_minutes: 45,
      category: 'HYGIENE',
      content: 'Keep fridges between 1-5C and record twice daily.',
    },
  });

  const assignment = await prisma.trainingAssignment.create({
    data: {
      training_module_id: trainingModule.id,
      user_id: staff.id,
      assigned_at: new Date(Date.now() - 3 * 86400000),
      due_at: new Date(Date.now() + 2 * 86400000),
      status: TrainingAssignmentStatus.ASSIGNED,
    },
  });

  await prisma.trainingResult.create({
    data: { training_assignment_id: assignment.id, completed_at: new Date(Date.now() - 86400000), score: 92, passed: true },
  });
  await prisma.trainingAssignment.update({ where: { id: assignment.id }, data: { status: TrainingAssignmentStatus.COMPLETED } });
  await prisma.gamificationPoint.create({ data: { user_id: staff.id, source_type: 'TRAINING', source_id: assignment.id, points: 25, awarded_at: new Date() } });
  await prisma.venueScore.create({ data: { location_id: location1.id, week_start: new Date(), week_end: new Date(), total_points: 120, average_points_per_staff: 60, rank_within_org: 1 } });

  await prisma.notification.createMany({
    data: [
      { user_id: manager.id, title: 'Checklist overdue', message: 'Closing routine not started', type: NotificationType.CHECKLIST_REMINDER },
      { user_id: staff.id, title: 'Training due', message: 'Complete Food Hygiene Level 2', type: NotificationType.TRAINING_REMINDER },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
