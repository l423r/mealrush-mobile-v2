import { describe, it, expect } from 'vitest';
import { registerSchema } from '../utils/validation';

describe('registerSchema validation', () => {
  const base = {
    email: 'user@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    name: 'User',
  };

  it('accepts valid payload', async () => {
    await expect(registerSchema.validate(base)).resolves.toBeTruthy();
  });

  it('rejects invalid email', async () => {
    await expect(
      registerSchema.validate({ ...base, email: 'bad-email' })
    ).rejects.toThrow();
  });

  it('rejects password without digit', async () => {
    await expect(
      registerSchema.validate({
        ...base,
        password: 'PasswordOnly',
        confirmPassword: 'PasswordOnly',
      })
    ).rejects.toThrow();
  });

  it('rejects password without letter', async () => {
    await expect(
      registerSchema.validate({
        ...base,
        password: '12345678',
        confirmPassword: '12345678',
      })
    ).rejects.toThrow();
  });

  it('rejects password shorter than 8 chars', async () => {
    await expect(
      registerSchema.validate({
        ...base,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      })
    ).rejects.toThrow();
  });

  it('rejects when confirmPassword mismatches', async () => {
    await expect(
      registerSchema.validate({
        ...base,
        confirmPassword: 'Other123',
      })
    ).rejects.toThrow();
  });

  it('rejects short name', async () => {
    await expect(
      registerSchema.validate({
        ...base,
        name: 'A',
      })
    ).rejects.toThrow();
  });
});
