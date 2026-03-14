const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Helper to calculate days diff
const getDaysSince = (dateStr) => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
};

// POST /api/focus/generate
router.post('/generate', async (req, res) => {
  try {
    const { target_date, job_ids } = req.body;
    
    // In a real app we would query the database. For this mock, we generate intelligent fake data
    // that fits the schema.
    
    const mockFocusPlan = {
      summary: {
        rolesOnTrack: 3,
        rolesAtRisk: 2,
        actionItemsCount: 8,
        targetDate: target_date || new Date().toISOString()
      },
      actionItems: [
        {
          id: 'act_1',
          type: 'STALE_CANDIDATE',
          urgency: 'high',
          title: 'Follow up with David Lee',
          description: 'Offer extended 3 days ago, no response. Risk of losing candidate.',
          candidate: { id: 'c5', name: 'David Lee', role: 'Sr. Frontend', avatar: 'D' },
          actionText: 'Send Follow-up Email'
        },
        {
          id: 'act_2',
          type: 'HIGH_SCORE_UNCONTACTED',
          urgency: 'high',
          title: 'Review Emma Watson',
          description: 'AI Match Score of 98% for UX Designer role, but still in Interview stage for 8 days.',
          candidate: { id: 'c4', name: 'Emma Watson', role: 'UX Designer', avatar: 'E', score: 98 },
          actionText: 'Schedule Final Interview'
        },
        {
          id: 'act_3',
          type: 'PIPELINE_RISK',
          urgency: 'medium',
          title: 'Boost Product Manager Sourcing',
          description: 'Only 3 candidates in screening stage for critical Q3 hire.',
          role: 'Product Manager',
          actionText: 'Resurface from Talent Pool'
        },
        {
          id: 'act_4',
          type: 'STALE_CANDIDATE',
          urgency: 'medium',
          title: 'Screen Sarah Chen',
          description: 'In Screening pipeline for 6 days.',
          candidate: { id: 'c2', name: 'Sarah Chen', role: 'Product Manager', avatar: 'S', score: 88 },
          actionText: 'Review Profile'
        }
      ]
    };

    // Simulate AI processing delay
    setTimeout(() => {
      res.status(200).json({
        status: 'success',
        data: mockFocusPlan
      });
    }, 1500);

  } catch (error) {
    console.error('Focus plan generation error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate focus plan' });
  }
});

module.exports = router;
