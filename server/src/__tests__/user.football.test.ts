import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeProfile(overrides: Partial<any> = {}) {
  return { id: 10, userId: 1, nickname: 'Speedy', role: 'forward', experience: '3 years', ...overrides };
}

function fakeTeam(overrides: Partial<any> = {}) {
  return {
    id: 100,
    name: 'Thunder FC',
    location: 'Pune',
    maxPlayers: 11,
    createdById: 10,
    createdBy: fakeProfile(),
    members: [],
    ...overrides,
  };
}

describe('POST /api/v1/user/football/profile', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/user/football/profile')
      .send({ role: 'forward', nickname: 'Speedy', experience: '3 years' });
    expect(res.status).toBe(401);
  });

  it('creates a football profile for the authenticated user', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(null);
    prismaMock.footballProfile.create.mockResolvedValue(fakeProfile() as any);

    const res = await request(app)
      .post('/api/v1/user/football/profile')
      .set(userAuthHeader(1))
      .send({ role: 'forward', nickname: 'Speedy', experience: '3 years' });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(1);
    expect(prismaMock.footballProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 1 }) })
    );
  });

  it('rejects creating a second profile for the same user', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);

    const res = await request(app)
      .post('/api/v1/user/football/profile')
      .set(userAuthHeader(1))
      .send({ role: 'forward', nickname: 'Speedy', experience: '3 years' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
    expect(prismaMock.footballProfile.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/football/profile/check', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/user/football/profile/check');
    expect(res.status).toBe(401);
  });

  it('reports exists:false when the user has no profile', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/football/profile/check').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.exists).toBe(false);
  });

  it('reports exists:true with the profile when one exists', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);

    const res = await request(app).get('/api/v1/user/football/profile/check').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.exists).toBe(true);
    expect(res.body.data.profile.nickname).toBe('Speedy');
  });
});

describe('POST /api/v1/user/football/teams', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/user/football/teams')
      .send({ name: 'Thunder FC', location: 'Pune', maxPlayers: 11, playerIds: [] });
    expect(res.status).toBe(401);
  });

  it('rejects creating a team without a football profile', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/football/teams')
      .set(userAuthHeader(1))
      .send({ name: 'Thunder FC', location: 'Pune', maxPlayers: 11, playerIds: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/football profile/i);
    expect(prismaMock.footballTeam.create).not.toHaveBeenCalled();
  });

  it('creates a team owned by the requester\'s football profile, with the creator as captain and a member', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.create.mockResolvedValue(fakeTeam() as any);
    prismaMock.footballTeamMember.createMany.mockResolvedValue({ count: 3 } as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);

    const res = await request(app)
      .post('/api/v1/user/football/teams')
      .set(userAuthHeader(1))
      .send({ name: 'Thunder FC', location: 'Pune', maxPlayers: 11, playerIds: [11, 12] });

    expect(res.status).toBe(201);
    expect(prismaMock.footballTeam.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdById: 10, captainId: 10 }) })
    );
    expect(prismaMock.footballTeamMember.createMany).toHaveBeenCalledWith({
      data: [
        { footballProfileId: 10, footballTeamId: 100 },
        { footballProfileId: 11, footballTeamId: 100 },
        { footballProfileId: 12, footballTeamId: 100 },
      ],
    });
  });

  it('does not double-add the creator if they also passed their own id in playerIds', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.create.mockResolvedValue(fakeTeam() as any);
    prismaMock.footballTeamMember.createMany.mockResolvedValue({ count: 2 } as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);

    const res = await request(app)
      .post('/api/v1/user/football/teams')
      .set(userAuthHeader(1))
      .send({ name: 'Thunder FC', location: 'Pune', maxPlayers: 11, playerIds: [10, 11] });

    expect(res.status).toBe(201);
    expect(prismaMock.footballTeamMember.createMany).toHaveBeenCalledWith({
      data: [
        { footballProfileId: 10, footballTeamId: 100 },
        { footballProfileId: 11, footballTeamId: 100 },
      ],
    });
  });
});

describe('PATCH /api/v1/user/football/teams/:teamId/captain', () => {
  it('requires authentication', async () => {
    const res = await request(app).patch('/api/v1/user/football/teams/100/captain').send({ captainId: 11 });
    expect(res.status).toBe(401);
  });

  it('rejects reassigning captain on a team the requester does not own', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/football/teams/100/captain')
      .set(userAuthHeader(1))
      .send({ captainId: 11 });

    expect(res.status).toBe(400);
    expect(prismaMock.footballTeam.update).not.toHaveBeenCalled();
  });

  it('rejects assigning a captain who is not a team member', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam() as any);
    prismaMock.footballTeamMember.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/football/teams/100/captain')
      .set(userAuthHeader(1))
      .send({ captainId: 99 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/must be a member/i);
    expect(prismaMock.footballTeam.update).not.toHaveBeenCalled();
  });

  it('reassigns the captain to an existing member', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam() as any);
    prismaMock.footballTeamMember.findUnique.mockResolvedValue({ id: 1, footballProfileId: 11, footballTeamId: 100 } as any);
    prismaMock.footballTeam.update.mockResolvedValue(fakeTeam({ captainId: 11 }) as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam({ captainId: 11 }) as any);

    const res = await request(app)
      .patch('/api/v1/user/football/teams/100/captain')
      .set(userAuthHeader(1))
      .send({ captainId: 11 });

    expect(res.status).toBe(200);
    expect(prismaMock.footballTeam.update).toHaveBeenCalledWith({ where: { id: 100 }, data: { captainId: 11 } });
  });
});

describe('DELETE /api/v1/user/football/teams/:teamId/members/:playerId', () => {
  it('requires authentication', async () => {
    const res = await request(app).delete('/api/v1/user/football/teams/100/members/11');
    expect(res.status).toBe(401);
  });

  it('rejects removing a member from a team the requester does not own', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/v1/user/football/teams/100/members/11')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.footballTeamMember.delete).not.toHaveBeenCalled();
  });

  it('rejects removing the team creator', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam({ captainId: 10 }) as any);

    const res = await request(app)
      .delete('/api/v1/user/football/teams/100/members/10')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/creator cannot be removed/i);
    expect(prismaMock.footballTeamMember.delete).not.toHaveBeenCalled();
  });

  it('rejects removing the current captain without reassigning first', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam({ captainId: 11 }) as any);

    const res = await request(app)
      .delete('/api/v1/user/football/teams/100/members/11')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/reassign the captain/i);
    expect(prismaMock.footballTeamMember.delete).not.toHaveBeenCalled();
  });

  it('removes a non-captain member from the team', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam({ captainId: 10 }) as any);
    prismaMock.footballTeamMember.delete.mockResolvedValue({ id: 1, footballProfileId: 12, footballTeamId: 100 } as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam({ captainId: 10 }) as any);

    const res = await request(app)
      .delete('/api/v1/user/football/teams/100/members/12')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(prismaMock.footballTeamMember.delete).toHaveBeenCalledWith({
      where: { footballProfileId_footballTeamId: { footballProfileId: 12, footballTeamId: 100 } },
    });
  });
});

describe('GET /api/v1/user/football/teams/mine', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/user/football/teams/mine');
    expect(res.status).toBe(401);
  });

  it("returns only the authenticated user's teams (regression test for the fixed IDOR)", async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findMany.mockResolvedValue([fakeTeam()] as any);

    const res = await request(app).get('/api/v1/user/football/teams/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.footballTeam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ createdById: 10 }, { members: { some: { footballProfileId: 10 } } }] },
      })
    );
  });

  it('rejects when the authenticated user has no football profile', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/football/teams/mine').set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });
});

describe('GET /api/v1/user/football/players', () => {
  it('is publicly accessible and lists all football profiles', async () => {
    prismaMock.footballProfile.findMany.mockResolvedValue([fakeProfile()] as any);

    const res = await request(app).get('/api/v1/user/football/players');

    expect(res.status).toBe(200);
    expect(res.body.players).toHaveLength(1);
  });
});

describe('GET /api/v1/user/football/teams', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/user/football/teams');
    expect(res.status).toBe(401);
  });

  it('lists every team for browsing/opponent-selection', async () => {
    prismaMock.footballTeam.findMany.mockResolvedValue([fakeTeam()] as any);

    const res = await request(app).get('/api/v1/user/football/teams').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /api/v1/user/football/teams/:teamId', () => {
  it('returns 404 for a missing team', async () => {
    prismaMock.footballTeam.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/football/teams/999');

    expect(res.status).toBe(404);
  });

  it('returns the team detail', async () => {
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);

    const res = await request(app).get('/api/v1/user/football/teams/100');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Thunder FC');
  });
});

describe('POST /api/v1/user/football/teams/:teamId/members', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/football/teams/100/members').send({ playerId: 11 });
    expect(res.status).toBe(401);
  });

  it('rejects adding a member to a team the requester does not own', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/football/teams/100/members')
      .set(userAuthHeader(1))
      .send({ playerId: 11 });

    expect(res.status).toBe(400);
    expect(prismaMock.footballTeamMember.create).not.toHaveBeenCalled();
  });

  it('adds a member to a team the requester owns', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue(fakeProfile() as any);
    prismaMock.footballTeam.findFirst.mockResolvedValue(fakeTeam() as any);
    prismaMock.footballTeamMember.create.mockResolvedValue({ id: 1, footballProfileId: 11, footballTeamId: 100 } as any);
    prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam() as any);

    const res = await request(app)
      .post('/api/v1/user/football/teams/100/members')
      .set(userAuthHeader(1))
      .send({ playerId: 11 });

    expect(res.status).toBe(200);
    expect(prismaMock.footballTeamMember.create).toHaveBeenCalledWith({
      data: { footballProfileId: 11, footballTeamId: 100 },
    });
  });
});
