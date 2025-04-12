const express = require('express');
const {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  generateSchedule,
  getExamTypes,
  getSessionStatuses,
  getAvailableTeachers,
  getAvailableClassroomsForTime
} = require('../controllers/sessionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Special routes that need to come before /:id routes
router.route('/bulk')
  .post(authorize('admin'), async (req, res, next) => {
    try {
      const sessions = req.body;

      if (!Array.isArray(sessions) || sessions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of sessions'
        });
      }

      const createdSessions = [];
      let failedCount = 0;

      // Process each session
      for (const sessionData of sessions) {
        try {
          // Create the session using the existing controller function
          req.body = sessionData;
          const session = await createSession(req, {
            status: (code, data) => ({ statusCode: code, data }),
            json: (data) => data
          }, next);

          if (session && session.statusCode === 201) {
            createdSessions.push(session.data.data);
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error('Error creating session:', error);
          failedCount++;
        }
      }

      return res.status(201).json({
        success: true,
        count: createdSessions.length,
        failedCount,
        data: createdSessions
      });
    } catch (error) {
      console.error('Error in bulk session creation:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error in bulk session creation'
      });
    }
  });

router.route('/generate')
  .post(authorize('admin'), generateSchedule);

router.route('/exam-types')
  .get(getExamTypes);

router.route('/statuses')
  .get(getSessionStatuses);

router.route('/available-teachers')
  .get(authorize('admin'), getAvailableTeachers);

router.route('/available-classrooms')
  .get(authorize('admin'), getAvailableClassroomsForTime);

// Public routes (accessible by all authenticated users)
router.route('/')
  .get(getSessions)
  .post(authorize('admin'), createSession);

// Routes with ID parameter must come after all other specific routes
router.route('/:id')
  .get(getSession)
  .put(authorize('admin'), updateSession)
  .delete(authorize('admin'), deleteSession);

module.exports = router;
