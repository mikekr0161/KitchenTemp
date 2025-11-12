import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Organisation
  const organisation = await prisma.organisation.create({
    data: {
      name: 'The Good Food Co.',
      billing_email: 'billing@goodfood.com',
      plan: 'PREMIUM',
      timezone: 'Europe/London',
    },
  })

  // Create Locations
  const location1 = await prisma.location.create({
    data: {
      organisation_id: organisation.id,
      name: 'Bristol Kitchen',
      address: '123 Fake Street',
      city: 'Bristol',
      postcode: 'BS1 1AA',
      country: 'UK',
    },
  })

  const location2 = await prisma.location.create({
    data: {
      organisation_id: organisation.id,
      name: 'London Central',
      address: '456 High Road',
      city: 'London',
      postcode: 'W1 1BB',
      country: 'UK',
    },
  })

  // Create Users
  const owner = await prisma.user.create({
    data: {
      organisation_id: organisation.id,
      email: 'owner@goodfood.com',
      password_hash: hashedPassword,
      first_name: 'Jane',
      last_name: 'Owner',
      global_role: Role.OWNER,
    },
  })

  const manager = await prisma.user.create({
    data: {
      organisation_id: organisation.id,
      email: 'manager@goodfood.com',
      password_hash: hashedPassword,
      first_name: 'Mike',
      last_name: 'Manager',
      global_role: Role.MANAGER,
    },
  })

  const chef = await prisma.user.create({
    data: {
      organisation_id: organisation.id,
      email: 'chef@goodfood.com',
      password_hash: hashedPassword,
      first_name: 'Carlos',
      last_name: 'Chef',
      global_role: Role.CHEF,
    },
  })

  // Assign users to locations
  await prisma.userLocation.createMany({
    data: [
      { user_id: owner.id, location_id: location1.id, role: Role.OWNER },
      { user_id: owner.id, location_id: location2.id, role: Role.OWNER },
      { user_id: manager.id, location_id: location1.id, role: Role.MANAGER },
      { user_id: chef.id, location_id: location1.id, role: Role.CHEF },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
