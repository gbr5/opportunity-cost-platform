export default {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/opportunitycost',
  },
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
};
