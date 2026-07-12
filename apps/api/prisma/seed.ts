import { PrismaClient, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding pipeline...');

  // Clear any existing data safely
  await prisma.application.deleteMany({});
  await prisma.candidate.deleteMany({});

  console.log('🧹 Cleaned existing application and candidate records.');

  const sampleCandidates = [
    { name: 'Alice Smith', email: 'alice.smith@example.com', location: 'London', isDeleted: false },
    { name: 'Bob Jones', email: 'bob.jones@example.com', location: 'New York', isDeleted: false },
    { name: 'Charlie Brown', email: 'charlie.brown@example.com', location: 'San Francisco', isDeleted: false },
    { name: 'Diana Prince', email: 'diana.prince@example.com', location: 'Berlin', isDeleted: false },
    { name: 'Evan Wright', email: 'evan.wright@example.com', location: 'Austin', isDeleted: false },
    { name: 'Fiona Gallagher', email: 'fiona.g@example.com', location: 'Chicago', isDeleted: false },
    { name: 'George Clark', email: 'george.clark@example.com', location: 'Toronto', isDeleted: false },
    { name: 'Hannah Abbott', email: 'hannah.a@example.com', location: 'Sydney', isDeleted: false },
    { name: 'Ian Malcolm', email: 'ian.chaos@example.com', location: 'Los Angeles', isDeleted: false },
    { name: 'Julia Roberts', email: 'julia.r@example.com', location: 'Paris', isDeleted: false },
    // Explicit soft-deleted candidate records to test exclusion rules
    { name: 'Archived Candidate A', email: 'archived.a@legacy.com', location: 'Remote', isDeleted: true },
    { name: 'Archived Candidate B', email: 'archived.b@legacy.com', location: 'Remote', isDeleted: true },
  ];

  const jobs = [
    { title: 'Software Engineer', company: 'TechCorp', source: 'LinkedIn' },
    { title: 'Frontend Developer', company: 'DesignStudio', source: 'Referral' },
    { title: 'Full-Stack Engineer', company: 'FinTech Solutions', source: 'Indeed' },
    { title: 'Backend Engineer', company: 'CloudScale', source: 'LinkedIn' },
  ];

  const statuses: ApplicationStatus[] = [
    ApplicationStatus.applied,
    ApplicationStatus.screening,
    ApplicationStatus.interview,
    ApplicationStatus.offer,
    ApplicationStatus.hired,
    ApplicationStatus.rejected,
  ];

  console.log('👥 Seeding PostgreSQL database with candidates and applications...');

  for (const c of sampleCandidates) {
    const candidate = await prisma.candidate.create({
      data: {
        name: c.name,
        email: c.email,
        location: c.location,
        phone: '+1 555-0199',
        linkedin_url: `https://linkedin.com/in/${c.name.toLowerCase().replace(' ', '')}`,
        notes: c.isDeleted ? 'Profile archived.' : 'Sourced candidate from recruitment drive.',
        deleted_at: c.isDeleted ? new Date() : null,
      },
    });

    // Generate applications for non-deleted candidates
    if (!c.isDeleted) {
      const numApps = Math.floor(Math.random() * 3) + 2; 
      const shuffledJobs = [...jobs].sort(() => 0.5 - Math.random());

      for (let i = 0; i < numApps; i++) {
        const job = shuffledJobs[i];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Ensure that some hired metrics fall safely into the current month boundary
        const appliedAtDate = status === ApplicationStatus.hired
          ? new Date() // Forces it into the current month to show on dashboard metrics cleanly
          : new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000);

        await prisma.application.create({
          data: {
            candidate_id: candidate.id,
            job_title: job.title,
            company: job.company,
            source: job.source,
            status,
            applied_at: appliedAtDate,
            salary_expectation: Math.floor(Math.random() * 40000) + 80000,
            notes: 'Initial evaluation pending review.',
          },
        });
      }
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding pipeline crashed:', e);
    throw e; // Bubble up instead of using process.exit(1) to avoid the missing types error
  })
  .finally(async () => {
    await prisma.$disconnect();
  });