import { prisma as globalClient } from "../../../index";

function mapLogForClient(row: any) {
  return {
    ...row,
    date: row.date?.toISOString?.() ?? row.date,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

export class WorkoutLogService {
  static async create(userId: number, data: any) {
    const row = await globalClient.workoutLog.create({
      data: {
        userId,
        date: new Date(data.date),
        type: data.type,
        split: data.split,
        exercises: data.exercises,
      },
    });

    return mapLogForClient(row);
  }

  static async getMine(userId: number) {
    const rows = await globalClient.workoutLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return rows.map(mapLogForClient);
  }
}

export class NutritionLogService {
  static async create(userId: number, data: any) {
    const row = await globalClient.nutritionLog.create({
      data: {
        userId,
        date: new Date(data.date),
        meals: data.meals,
      },
    });

    return mapLogForClient(row);
  }

  static async getMine(userId: number) {
    const rows = await globalClient.nutritionLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return rows.map(mapLogForClient);
  }
}

export class HealthLogService {
  static async create(userId: number, data: any) {
    const row = await globalClient.healthLog.create({
      data: {
        userId,
        date: new Date(data.date),
        weight: data.weight,
        steps: data.steps,
        water: data.water,
        energy: data.energy,
        sleep: data.sleep,
        motivation: data.motivation,
        measurements: data.measurements,
        photoUrl: data.photoUrl,
      },
    });

    return mapLogForClient(row);
  }

  static async getMine(userId: number) {
    const rows = await globalClient.healthLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return rows.map(mapLogForClient);
  }
}
