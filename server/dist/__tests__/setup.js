"use strict";
// Deterministic env for tests — deliberately decoupled from the developer's
// real .env, so the suite runs the same locally and in CI without a
// database or AWS credentials.
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_BUCKET_NAME = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
//# sourceMappingURL=setup.js.map