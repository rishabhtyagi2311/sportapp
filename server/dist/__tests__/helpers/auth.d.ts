/** Mints a real JWT the same way AuthService does, so tests exercise the
 * actual `authenticatePartner` middleware instead of bypassing it. */
export declare function makeAuthToken(partnerId: string): string;
export declare function authHeader(partnerId: string): {
    Authorization: string;
};
/** Mints a real JWT the same way UserAuthService does, so tests exercise the
 * actual `authenticateUser` middleware instead of bypassing it. */
export declare function makeUserAuthToken(userId: number): string;
export declare function userAuthHeader(userId: number): {
    Authorization: string;
};
//# sourceMappingURL=auth.d.ts.map