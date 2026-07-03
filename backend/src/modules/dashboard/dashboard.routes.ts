import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get(
  "/overview",
  authenticate,
  (req: any, res) => {

    res.json({
      success: true,
      message: "Dashboard API Working",
      loggedInUser: req.user
    });

  }
);

export default router;