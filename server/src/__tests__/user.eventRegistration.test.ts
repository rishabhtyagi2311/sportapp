import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeEvent(overrides: Partial<any> = {}) {
  return {
    id: 'event-1',
    creatorId: 1,
    venueId: null,
    locationName: 'Community Ground, Pune',
    name: 'Sunday Football 5-a-side',
    eventType: 'regular',
    participationType: 'individual',
    maxParticipants: 10,
    currentParticipants: 0,
    dateTime: new Date('2026-08-01T10:00:00Z'),
    duration: 60,
    status: 'upcoming',
    isPublic: true,
    registrationDeadline: new Date('2099-01-01T00:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeFootballProfile(overrides: Partial<any> = {}) {
  return { id: 10, userId: 2, nickname: 'Speedy', role: 'forward', experience: '3 years', ...overrides };
}

function fakeTeam(overrides: Partial<any> = {}) {
  return { id: 100, name: 'Thunder FC', location: 'Pune', maxPlayers: 11, createdById: 10, ...overrides };
}

function fakeRegistration(overrides: Partial<any> = {}) {
  return {
    id: 'reg-1',
    eventId: 'event-1',
    userId: 2,
    footballTeamId: null,
    status: 'pending',
    notes: null,
    processedAt: null,
    processedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/user/events/:id/registrations', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .send({ participationType: 'individual' });
    expect(res.status).toBe(401);
  });

  it('creates an individual registration', async () => {
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent() as any);
    prismaMock.eventRegistration.create.mockResolvedValue(fakeRegistration() as any);

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'individual' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('rejects registering for a non-upcoming event', async () => {
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ status: 'completed' }) as any);

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'individual' });

    expect(res.status).toBe(400);
    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });

  it('rejects registering after the registration deadline', async () => {
    prismaMock.event.findUnique.mockResolvedValue(
      fakeEvent({ registrationDeadline: new Date('2000-01-01T00:00:00Z') }) as any
    );

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'individual' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/deadline/i);
  });

  it('rejects a duplicate individual registration', async () => {
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent() as any);
    prismaMock.eventRegistration.create.mockRejectedValue({ code: 'P2002' });

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'individual' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('registers a team when the requester is the team captain', async () => {
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ participationType: 'team' }) as any);
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile() as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);
    prismaMock.eventRegistration.create.mockResolvedValue(fakeRegistration({ userId: null, footballTeamId: 100 }) as any);

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'team', footballTeamId: 100 });

    expect(res.status).toBe(201);
    expect(prismaMock.eventRegistration.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ footballTeamId: 100 }) })
    );
  });

  it("rejects a team registration from someone who isn't the team's captain", async () => {
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ participationType: 'team' }) as any);
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile({ id: 999 }) as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);

    const res = await request(app)
      .post('/api/v1/user/events/event-1/registrations')
      .set(userAuthHeader(2))
      .send({ participationType: 'team', footballTeamId: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/captain/i);
    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/registrations/mine', () => {
  it('unifies individual registrations and team-captain registrations', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile() as any);
    prismaMock.eventRegistration.findMany.mockResolvedValue([
      fakeRegistration({ id: 'reg-1', userId: 2 }),
      fakeRegistration({ id: 'reg-2', userId: null, footballTeamId: 100 }),
    ] as any);

    const res = await request(app).get('/api/v1/user/registrations/mine').set(userAuthHeader(2));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(prismaMock.eventRegistration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ userId: 2 }, { footballTeam: { createdById: 10 } }] },
      })
    );
  });
});

describe('PATCH /api/v1/user/events/:id/registrations/:registrationId', () => {
  it('rejects processing for an event not owned by the requester', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/events/event-1/registrations/reg-1')
      .set(userAuthHeader(2))
      .send({ status: 'accepted' });

    expect(res.status).toBe(400);
  });

  it('accepts a pending registration and atomically increments currentParticipants', async () => {
    prismaMock.event.findFirst.mockResolvedValue(fakeEvent() as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration() as any);
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent() as any);
    prismaMock.event.update.mockResolvedValue(fakeEvent({ currentParticipants: 1 }) as any);
    prismaMock.eventRegistration.update.mockResolvedValue(fakeRegistration({ status: 'accepted' }) as any);

    const res = await request(app)
      .patch('/api/v1/user/events/event-1/registrations/reg-1')
      .set(userAuthHeader(1))
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('accepted');
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { currentParticipants: { increment: 1 } },
    });
  });

  it('rejects accepting into a full event', async () => {
    prismaMock.event.findFirst.mockResolvedValue(fakeEvent() as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration() as any);
    prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ currentParticipants: 10, maxParticipants: 10 }) as any);

    const res = await request(app)
      .patch('/api/v1/user/events/event-1/registrations/reg-1')
      .set(userAuthHeader(1))
      .send({ status: 'accepted' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/full/i);
    expect(prismaMock.eventRegistration.update).not.toHaveBeenCalled();
  });

  it('rejects processing a non-pending registration', async () => {
    prismaMock.event.findFirst.mockResolvedValue(fakeEvent() as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration({ status: 'accepted' }) as any);

    const res = await request(app)
      .patch('/api/v1/user/events/event-1/registrations/reg-1')
      .set(userAuthHeader(1))
      .send({ status: 'rejected' });

    expect(res.status).toBe(400);
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('does not touch currentParticipants when rejecting', async () => {
    prismaMock.event.findFirst.mockResolvedValue(fakeEvent() as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration() as any);
    prismaMock.eventRegistration.update.mockResolvedValue(fakeRegistration({ status: 'rejected' }) as any);

    const res = await request(app)
      .patch('/api/v1/user/events/event-1/registrations/reg-1')
      .set(userAuthHeader(1))
      .send({ status: 'rejected', notes: 'Not enough experience' });

    expect(res.status).toBe(200);
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });
});
