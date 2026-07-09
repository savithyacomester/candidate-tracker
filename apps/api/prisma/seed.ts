import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear any existing data safely
  await prisma.application.deleteMany({});
  await prisma.candidate.deleteMany({});

  const sampleCandidates = [
    { name: 'Alice Smith', email: 'alice.smith@example.com', location: 'London' },
    { name: 'Bob Jones', email: 'bob.jones@example.com', location: 'New York' },
    { name: 'Charlie Brown', email: 'charlie.brown@example.com', location: 'San Francisco' },
    { name: 'Diana Prince', email: 'diana.prince@example.com', location: 'Berlin' },
    { name: 'Evan Wright', email: 'evan.wright@example.com', location: 'Austin' },
    { name: 'Fiona Gallagher', email: 'fiona.g@example.com', location: 'Chicago' },
    { name: 'George Clark', email: 'george.clark@example.com', location: 'Toronto' },
    { name: 'Hannah Abbott', email: 'hannah.a@example.com', location: 'Sydney' },
    { name: 'Ian Malcolm', email: 'ian.chaos@example.com', location: 'Los Angeles' },
    { name: 'Julia Roberts', email: 'julia.r@example.com', location: 'Paris' },
  ];

  const jobs = [
    { title: 'Software Engineer', company: 'TechCorp', source: 'LinkedIn' },
    { title: 'Frontend Developer', company: 'DesignStudio', source: 'Referral' },
    { title: 'Full-Stack Engineer', company: 'FinTech Solutions', source: 'Indeed' },
    { title: 'Backend Engineer', company: 'CloudScale', source: 'LinkedIn' },
  ];

  const statuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  console.log('Seeding database with candidates and applications...');

  for (const c of sampleCandidates) {
    const candidate = await prisma.candidate.create({
      data: {
        name: c.name,
        email: c.email,
        location: c.location,
        phone: '+1 555-0199',
        linkedin_url: `https://linkedin.com/in/${c.name.toLowerCase().replace(' ', '')}`,
        notes: 'Sourced candidate from recruitment drive.',
      },
    });

    // Generate 2 to 4 unique random applications for each candidate
    const numApps = Math.floor(Math.random() * 3) + 2; 
    const shuffledJobs = [...jobs].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numApps; i++) {
      const job = shuffledJobs[i];
      await prisma.application.create({
        data: {
          candidate_id: candidate.id,
          job_title: job.title,
          company: job.company,
          source: job.source,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          applied_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          salary_expectation: Math.floor(Math.random() * 40000) + 80000,
          notes: 'Initial evaluation pending review.',
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });