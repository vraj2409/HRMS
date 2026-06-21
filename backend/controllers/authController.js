import jwt from 'jsonwebtoken';
import { dbService } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

export const login = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const employee = await dbService.employees.findOne({ email: emailLower });

    if (!employee) {
      return res.status(404).json({ 
        message: `Opps! Employee not found with email: ${email}. Please check one of our pre-seeded team emails, such as: john.doe@originedge.com (Employee), or sarah.wilson@originedge.com (HR).` 
      });
    }

    const token = jwt.sign(
      { 
        id: employee.id, 
        email: employee.email, 
        role: employee.role, 
        name: employee.name, 
        title: employee.title 
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      employee
    });
  } catch (err) {
    res.status(500).json({ message: 'Login execution failed.', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const employee = await dbService.employees.findOne({ id: req.user.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve context.', error: err.message });
  }
};
