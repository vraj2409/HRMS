import { dbService } from '../config/db.js';

// --- Leaves ---
export const getLeaves = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    }
    const records = await dbService.leaves.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve leaves list.', error: err.message });
  }
};

export const applyLeave = async (req, res) => {
  const { leaveType, fromDate, toDate, totalDays, reason } = req.body;

  if (!leaveType || !fromDate || !toDate || !reason) {
     return res.status(400).json({ message: 'Required details are missing for filing leave.' });
  }

  try {
    const newLeave = {
      id: "LV-" + Date.now().toString(36).toUpperCase(),
      employeeId: req.user.id,
      leaveType,
      fromDate,
      toDate,
      totalDays: Number(totalDays) || 1,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    const saved = await dbService.leaves.create(newLeave);

    await dbService.notifications.create({
      id: "NOT-LV-" + Date.now(),
      employeeId: "*",
      title: "New Leave Application",
      message: `${req.user.name} requested ${totalDays} day(s) of ${leaveType} from ${fromDate} to ${toDate}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Leave application submission failed.', error: err.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'Approved' && status !== 'Rejected') {
     return res.status(400).json({ message: 'Status must be Approved or Rejected' });
  }

  try {
    const leaves = await dbService.leaves.find({ id });
    if (leaves.length === 0) {
       return res.status(404).json({ message: 'Leave record not found.' });
    }

    await dbService.leaves.updateOne({ id }, { status });

    await dbService.notifications.create({
      id: "NOT-LVA-" + Date.now(),
      employeeId: leaves[0].employeeId,
      title: `Leave request ${status}`,
      message: `Your ${leaves[0].leaveType} request filing from ${leaves[0].fromDate} to ${leaves[0].toDate} has been ${status.toLowerCase()} by HR.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ message: `Leave application status resolved to ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Leave approval failed.', error: err.message });
  }
};

// --- WFH ---
export const getWFH = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    }
    const records = await dbService.wfhRequests.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve WFH requests.', error: err.message });
  }
};

export const applyWFH = async (req, res) => {
  const { fromDate, toDate, reason } = req.body;
  try {
    const newW = {
      id: "WFH-" + Date.now(),
      employeeId: req.user.id,
      fromDate,
      toDate,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    const saved = await dbService.wfhRequests.create(newW);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'WFH requested failed.', error: err.message });
  }
};

export const updateWFHStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await dbService.wfhRequests.updateOne({ id }, { status });
    res.json({ message: 'WFH request processed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'WFH status edit failed.', error: err.message });
  }
};

// --- Overtime ---
export const getOvertime = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    }
    const records = await dbService.otRequests.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve Overtime requests.', error: err.message });
  }
};

export const applyOvertime = async (req, res) => {
  const { date, hours, reason } = req.body;
  try {
    const newOt = {
      id: "OT-" + Date.now(),
      employeeId: req.user.id,
      date,
      hours: Number(hours),
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    const saved = await dbService.otRequests.create(newOt);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'OT logging failed.', error: err.message });
  }
};

export const updateOvertimeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await dbService.otRequests.updateOne({ id }, { status });
    res.json({ message: 'Overtime resolved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Overtime edit failed.', error: err.message });
  }
};
