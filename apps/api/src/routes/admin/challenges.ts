import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate";
import { createError } from "../../middleware/error";
import { findUserById } from "../../db/queries/users";
import { refundChallenge } from "../../services/refund";

const router = Router();

router.use(authenticate);

router.use(async (req, _res, next) => {
  const user = await findUserById(req.user!.sub);
  if (!user || user.role !== "admin") throw createError("Forbidden", 403, "FORBIDDEN");
  next();
});

router.post("/:id/refund", async (req, res) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  const { reason } = z
    .object({ reason: z.string().min(1).max(500).default("manual_refund") })
    .parse(req.body ?? {});

  try {
    const refund = await refundChallenge({ challengeId: id, adminId: req.user!.sub, reason });
    res.status(201).json({ refund });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refund failed";
    if (message === "Challenge not found") throw createError(message, 404);
    if (message === "Challenge already settled")
      throw createError(message, 409, "CHALLENGE_SETTLED");
    if (message === "No deposit found") throw createError(message, 404, "NO_DEPOSIT_FOUND");
    throw error;
  }
});

export default router;
