import { dbService } from '../config/db.js';

export const getEmployees = async (req, res) => {
  try {
    const employees = await dbService.employees.find({});
    if (req.user.role === 'HR') {
      res.json(employees);
    } else {
      const filtered = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        title: emp.title,
        department: emp.department,
        email: emp.email,
        location: emp.location,
        reportingManager: emp.reportingManager,
        avatar: emp.avatar || emp.name.split(' ').map(n => n[0]).join('')
      }));
      res.json(filtered);
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to query database.', error: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const pendingData = req.body;
    if (!pendingData.email || !pendingData.name || !pendingData.id) {
       return res.status(400).json({ message: 'Employee ID, Name and Email are mandatory fields.' });
    }
    
    const exists = await dbService.employees.findOne({ id: pendingData.id });
    if (exists) {
       return res.status(400).json({ message: `Employee with ID '${pendingData.id}' already exists.` });
    }

    const fullProfile = {
      ...pendingData,
      email: pendingData.email.toLowerCase().trim(),
      personalInfo: pendingData.personalInfo || {
        fatherName: "", motherName: "", dob: "", maritalStatus: "Single",
        bloodGroup: "O+", nationality: "Indian", panCode: "", aadhaarCode: "",
        passportNo: "", drivingLicense: "", languages: ["English"]
      },
      emergencyContact: pendingData.emergencyContact || { name: "", relation: "", phone: "" },
      skills: pendingData.skills || [],
      education: pendingData.education || [],
      certificates: pendingData.certificates || []
    };

    const created = await dbService.employees.create(fullProfile);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed new employee.', error: err.message });
  }
};

export const getEmployeeProfile = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'HR' && req.user.id !== id) {
     return res.status(403).json({ message: 'Access denied. You can only view your own profile card.' });
  }

  try {
    const employee = await dbService.employees.findOne({ id });
    if (!employee) {
       return res.status(404).json({ message: 'Target profile card not found in database.' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Inquiry failed.', error: err.message });
  }
};

export const updateEmployeeProfile = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'HR' && req.user.id !== id) {
     return res.status(403).json({ message: 'Access denied. You can only update your own employee details.' });
  }

  try {
    const fieldsToUpdate = req.body;
    await dbService.employees.updateOne({ id }, fieldsToUpdate);
    
    await dbService.notifications.create({
      id: "NOT-UP-" + Date.now(),
      employeeId: id,
      title: "Profile Card Updated",
      message: "Your detailed profile info has been synchronized successfully in the database.",
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Profile card updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile info.', error: err.message });
  }
};
