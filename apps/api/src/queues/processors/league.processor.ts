import { Worker, type Job, type WorkerOptions } from "bullmq";
import { redis } from "../../lib/redis";
import { logger } from "../../lib/logger";
import { addUtcDays, getUtcWeekStart } from "../../lib/week";
import { rankAndFlagWeek, recalculateWeeklyPoints, seedWeekAssignments } from "../../db/queries/leagues";
import {
  checkAndAwardLeagueDiamondBadges,
  checkAndAwardLeaguePromotionBadges,
} from "../../services/badges";

export function createLeagueWorker(WorkerCtor: typeof Worker = Worker, opts?: WorkerOptions) {
  return new WorkerCtor(
    "league",
    async (job: Job) => {
      if (job.name === "finalize-week") {
        const weekStart = getUtcWeekStart(new Date());
        logger.info("Finalizing league week", { weekStart, weekEndExclusive: addUtcDays(weekStart, 7) });
        await recalculateWeeklyPoints(weekStart);
        await rankAndFlagWeek(weekStart);
        await checkAndAwardLeagueDiamondBadges(weekStart);
        return;
      }

      if (job.name === "start-week") {
        const weekStart = getUtcWeekStart(new Date());
        logger.info("Seeding league week", { weekStart });
        await seedWeekAssignments(weekStart);
        await checkAndAwardLeaguePromotionBadges(weekStart);
        return;
      }

      logger.warn("Unknown league job", { name: job.name, id: job.id });
    },
    {
      connection: redis,
      ...opts,
    }
  );
}

