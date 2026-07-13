import jwt from 'jsonwebtoken';

/** Mints a real JWT the same way AuthService does, so tests exercise the
 * actual `authenticatePartner` middleware instead of bypassing it. */
export function makeAuthToken(partnerId: string): string {
  return jwt.sign({ id: partnerId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
}

export function authHeader(partnerId: string): { Authorization: string } {
  return { Authorization: `Bearer ${makeAuthToken(partnerId)}` };
}
