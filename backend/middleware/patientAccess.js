export const isPatient = (req) => req.user?.role === 'Patient';

export const getAuthenticatedPatientId = (req) => req.user?.patient_id || null;

export const assertPatientAccess = (req, res, patientId) => {
  if (!isPatient(req)) return true;

  if (!patientId || patientId !== getAuthenticatedPatientId(req)) {
    res.status(403).json({
      success: false,
      message: 'You may only access your own patient records.'
    });
    return false;
  }

  return true;
};

export const patientFilter = (req, requestedPatientId) => {
  if (!isPatient(req)) return requestedPatientId;
  return getAuthenticatedPatientId(req);
};
