import { describe, it, expect } from 'vitest';
import { CreateCandidateSchema } from '@tracker/shared';

describe('Zod Schemas', () => {
  it('should pass with valid candidate data', () => {
    const data = { name: 'Jane', email: 'jane@test.com' };
    expect(CreateCandidateSchema.safeParse(data).success).toBe(true);
  });

  it('should fail with invalid email', () => {
    const data = { name: 'Jane', email: 'not-an-email' };
    expect(CreateCandidateSchema.safeParse(data).success).toBe(false);
  });
});