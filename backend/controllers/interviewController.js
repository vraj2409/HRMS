import { dbService } from '../config/db.js';

export const getApplications = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    }
    const records = await dbService.applications.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving status', error: err.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const records = await dbService.interviews.find({});
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interviews', error: err.message });
  }
};

export const createInterview = async (req, res) => {
  const { candidateName, position, department, stage, interviewers, datetime } = req.body;
  try {
    const newIt = {
      id: "INT-" + Date.now(),
      candidateName,
      position,
      department,
      stage,
      interviewers: interviewers || [],
      datetime,
      status: 'Upcoming'
    };
    const saved = await dbService.interviews.create(newIt);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create interview schedule.', error: err.message });
  }
};
