import { userModel } from '../models/userModel.js';
import { patientModel } from '../models/patientModel.js';
import { logAuditEvent } from '../utils/helpers.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/security.js';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// --- Helpers ---

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9).';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§±]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&* etc.).';
  }
  return null;
};

const signTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role_name,
    role_id: user.role_id,
    patient_id: user.patient_id || null
  };

  const secret = getJwtSecret();
  const accessToken = jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};

const safeUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role_name,
  role_id: user.role_id,
  patient_id: user.patient_id || null
});

// --- Controller ---

export const authController = {
  async login(req, res) {
    try {
      const { email, username, password } = req.body;
      const userEmail = (email || username || '').trim().toLowerCase();

      if (!userEmail) return res.status(400).json({ success: false, message: 'Email address is required.' });
      if (!password) return res.status(400).json({ success: false, message: 'Password is required.' });

      const user = await userModel.findByUsernameOrEmail(userEmail);
      if (!user) {
        // Constant-time response to prevent user enumeration
        await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection00000000000000000');
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Clean bcrypt-only comparison — no plaintext or sha256 fallbacks
      const isPasswordValid = await bcrypt.compare(password, user.password).catch(() => false);

      if (!isPasswordValid) {
        logAuditEvent('LOGIN_FAILED', user.email, `Failed login attempt for ${user.email}`);
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Upgrade old bcrypt cost factor (<12) if needed
      const cost = parseInt(user.password.split('$')[2], 10);
      if (!isNaN(cost) && cost < 12) {
        const newHash = await hashPassword(password);
        await userModel.updatePassword(user.id, newHash);
      }

      const { accessToken, refreshToken } = signTokens(user);

      logAuditEvent('USER_LOGIN', user.email, `User ${user.email} (${user.role_name}) logged in`);

      return res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: safeUserPayload(user)
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during login' });
    }
  },

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required.' });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, getJwtSecret());
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token. Please log in again.' });
      }

      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists.' });
      }

      const { accessToken, refreshToken: newRefreshToken } = signTokens(user);

      return res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      console.error('Refresh error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during token refresh' });
    }
  },

  async patientRegister(req, res) {
    try {
      const { first_name, last_name, email, password, contact, dob, gender, address } = req.body;

      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required.' });
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) return res.status(400).json({ success: false, message: passwordError });

      const existing = await userModel.findByUsernameOrEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
      }

      const newPatient = await patientModel.create({
        first_name,
        last_name,
        dob: dob || '1995-01-01',
        gender: gender || 'Other',
        contact: contact || '',
        address: address || '',
        medical_history: 'Registered via Patient Portal'
      });

      const newHash = await hashPassword(password);
      const username = email.split('@')[0] || `${first_name.toLowerCase()}.${last_name.toLowerCase()}`;

      const newUser = await userModel.create({
        username,
        email: email.trim().toLowerCase(),
        password: newHash,
        role_id: 'r_patient',
        role_name: 'Patient',
        patient_id: newPatient.id
      });

      const { accessToken, refreshToken } = signTokens({ ...newUser, role_name: 'Patient', role_id: 'r_patient', patient_id: newPatient.id });

      logAuditEvent('PATIENT_REGISTERED', email, `New patient registered: ${first_name} ${last_name} (${email})`);

      return res.status(201).json({
        success: true,
        message: 'Patient account created successfully',
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: 'Patient',
          role_id: 'r_patient',
          patient_id: newPatient.id
        }
      });
    } catch (err) {
      console.error('Patient register error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during patient registration' });
    }
  },

  async register(req, res) {
    try {
      // req.user is populated by authenticate middleware — only Administrators may call this
      const requestingUser = req.user;
      if (!requestingUser || requestingUser.role !== 'Administrator') {
        return res.status(403).json({ success: false, message: 'Only Administrators can register new user accounts.' });
      }

      const { username, email, password, role_name } = req.body;

      if (!username || !email || !password || !role_name) {
        return res.status(400).json({ success: false, message: 'Username, email, password, and role are required.' });
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) return res.status(400).json({ success: false, message: passwordError });

      const existing = (await userModel.findByUsernameOrEmail(username)) || (await userModel.findByUsernameOrEmail(email));
      if (existing) return res.status(409).json({ success: false, message: 'A user with this username or email already exists.' });

      const roles = await userModel.getRoles();
      const role = roles.find(r => r.name.toLowerCase() === role_name.toLowerCase()) || roles[0];
      const newHash = await hashPassword(password);

      const newUser = await userModel.create({
        username,
        email: email.trim().toLowerCase(),
        password: newHash,
        role_id: role.id,
        role_name: role.name
      });

      logAuditEvent('USER_REGISTERED', requestingUser.email, `Admin registered new user: ${email} (${role.name})`);
      return res.status(201).json({
        success: true,
        message: 'User account created',
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role_name }
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error during registration' });
    }
  },

  async getUsers(req, res) {
    try {
      const users = await userModel.getAll();
      return res.json({ success: true, count: users.length, data: users });
    } catch (err) {
      console.error('Get users error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
  },

  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      // User identity comes from the verified JWT (req.user), not from untrusted body params
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!current_password) return res.status(400).json({ success: false, message: 'Current password is required.' });

      const passwordError = validatePasswordStrength(new_password);
      if (passwordError) return res.status(400).json({ success: false, message: passwordError });

      const user = await userModel.findById(userId) || await userModel.findByUsernameOrEmail(userEmail);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found.' });

      const isCurrentValid = await bcrypt.compare(current_password, user.password).catch(() => false);

      if (!isCurrentValid) {
        logAuditEvent('PASSWORD_CHANGE_FAILED', user.email, 'Failed password change attempt');
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      if (new_password === current_password) {
        return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
      }

      const newHash = await hashPassword(new_password);
      await userModel.updatePassword(user.id, newHash);
      logAuditEvent('PASSWORD_CHANGED', user.email, 'Password changed successfully');
      return res.json({ success: true, message: 'Password successfully updated' });
    } catch (err) {
      console.error('Change password error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  },

  async getRoles(req, res) {
    try {
      const roles = await userModel.getRoles();
      return res.json({ success: true, data: roles });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve roles' });
    }
  }
};
