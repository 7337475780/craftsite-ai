import { Router } from "express";

const router = Router({ mergeParams: true });

// Dummy auth middleware
const requireAuth = (req: any, res: any, next: any) => next();
router.use(requireAuth);

// Get simulated site traffic data for a project
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  
  try {
    // In Phase 30, we mock this data for the Dashboard UI
    const mockAnalytics = {
      overview: {
        pageViews: 12540,
        uniqueVisitors: 4320,
        bounceRate: "34%",
        avgDuration: "2m 15s"
      },
      trafficSources: [
        { source: "Google", visits: 2100 },
        { source: "Direct", visits: 1500 },
        { source: "Twitter", visits: 720 }
      ],
      performance: {
        score: 96,
        lcp: "1.2s",
        cls: 0.04,
        fid: "45ms"
      }
    };
    
    res.json(mockAnalytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch project analytics" });
  }
});

export default router;
