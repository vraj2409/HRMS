import { dbService } from '../config/db.js';

export const getAttendance = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'HR') {
      query.employeeId = req.user.id;
    } else if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }
    
    const records = await dbService.attendance.find(query);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to query attendance reports.', error: err.message });
  }
};

export const clockIn = async (req, res) => {
  const employeeId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  let hours = 9;
  let minutes = 0;
  try {
    const istTimeStrPart = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    const parts = istTimeStrPart.split(':').map(Number);
    if (parts.length >= 2) {
      hours = parts[0];
      minutes = parts[1];
    }
  } catch (e) {}

  const checkInTimeStr = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + " IST";

  try {
    const exists = await dbService.attendance.find({ employeeId, date: todayStr });
    if (exists.length > 0) {
       return res.status(400).json({ message: 'You have already clocked-in for today!', record: exists[0] });
    }

    const isLate = hours > 9 || (hours === 9 && minutes > 5);
    const lateMinutes = isLate ? ((hours - 9) * 60 + minutes) : 0;
    const statusValue = isLate ? 'Late' : 'Present';

    const newRecord = {
      id: "ATT-" + Date.now(),
      employeeId,
      date: todayStr,
      checkIn: checkInTimeStr,
      status: statusValue,
      lateMinutes,
      earlyExitMinutes: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const saved = await dbService.attendance.create(newRecord);

    await dbService.notifications.create({
      id: "NOT-CL-" + Date.now(),
      employeeId,
      title: "Punch In Recorded",
      message: `Clocked in successfully at ${checkInTimeStr}. Status: ${statusValue}${isLate ? ` (${lateMinutes}m Late)` : ''}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Punched In fail.', error: err.message });
  }
};

export const clockOut = async (req, res) => {
  const employeeId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const checkOutTimeStr = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + " IST";

  try {
    const records = await dbService.attendance.find({ employeeId, date: todayStr });
    if (records.length === 0) {
       return res.status(400).json({ message: 'Error: Cannot clock-out because you have not clocked-in today!' });
    }

    const attendanceRecord = records[0];
    if (attendanceRecord.checkOut) {
       return res.status(400).json({ message: 'You have already clocked-out today!', record: attendanceRecord });
    }

    let workHoursStr = "0h 00m 00s";
    if (attendanceRecord.createdAt) {
      try {
        const checkInDate = new Date(attendanceRecord.createdAt);
        const diffMs = now.getTime() - checkInDate.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        workHoursStr = `${diffHrs.toString().padStart(2, '0')}h ${diffMins.toString().padStart(2, '0')}m ${diffSecs.toString().padStart(2, '0')}s`;
      } catch (e) {
        workHoursStr = "0h 00m 00s";
      }
    }

    let hours = 18;
    let minutes = 0;
    try {
      const istTimeStrPart = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
      const parts = istTimeStrPart.split(':').map(Number);
      if (parts.length >= 2) {
        hours = parts[0];
        minutes = parts[1];
      }
    } catch (e) {}
    const isEarly = hours < 18;
    const earlyMins = isEarly ? ((18 - hours) * 60 - minutes) : 0;

    const finalUpdate = {
      checkOut: checkOutTimeStr,
      workHours: workHoursStr,
      earlyExitMinutes: earlyMins,
      status: (attendanceRecord.status === 'Present' && isEarly) ? 'Early Exit' : attendanceRecord.status,
      updatedAt: now.toISOString()
    };

    await dbService.attendance.updateOne({ id: attendanceRecord.id }, finalUpdate);

    await dbService.notifications.create({
      id: "NOT-CO-" + Date.now(),
      employeeId,
      title: "Punch Out Recorded",
      message: `Clocked out successfully at ${checkOutTimeStr}. Worked total ${workHoursStr}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ ...attendanceRecord, ...finalUpdate });
  } catch (err) {
    res.status(500).json({ message: 'Punched Out fail.', error: err.message });
  }
};

export const resetAttendance = async (req, res) => {
  const employeeId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    await dbService.attendance.deleteOne({ employeeId, date: todayStr });
    res.json({ success: true, message: 'Attendance reset successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset attendance.', error: err.message });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const list = await dbService.holidays.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load holidays.', error: err.message });
  }
};

export const getPolicies = async (req, res) => {
  try {
    const list = await dbService.policies.find({});
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load policies.', error: err.message });
  }
};
