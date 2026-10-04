import { patientModel } from './patientModel.js';
import { doctorModel } from './doctorModel.js';
import { appointmentModel } from './appointmentModel.js';
import { admissionModel } from './admissionModel.js';
import { billingModel } from './billingModel.js';
import { pharmacyModel } from './pharmacyModel.js';
import { labModel } from './labModel.js';
import { staffModel } from './staffModel.js';

export const analyticsModel = {
  async getSummary() {
    const [
      patients,
      doctors,
      appointments,
      admissions,
      invoices,
      medicines,
      labTests,
      attendance
    ] = await Promise.all([
      patientModel.getAll(),
      doctorModel.getAll(),
      appointmentModel.getAll(),
      admissionModel.getAll(),
      billingModel.getAll(),
      pharmacyModel.getAll(),
      labModel.getAll(),
      staffModel.getAttendance()
    ]);

    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter(a => a.status === 'Scheduled').length;
    const activeAdmissions = admissions.filter(a => !a.discharged_at && a.status === 'Admitted').length;

    const totalRevenue = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const pendingRevenue = invoices
      .filter(i => i.status === 'Unpaid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const lowStockMedicines = medicines.filter(m => m.stock_qty <= 50).length;
    const pendingLabTests = labTests.filter(l => l.sample_status !== 'Completed').length;
    const presentStaff = attendance.filter(a => a.status === 'Present').length;

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      scheduledAppointments,
      activeAdmissions,
      totalRevenue,
      pendingRevenue,
      lowStockMedicines,
      pendingLabTests,
      presentStaff,
      recentAppointments: appointments.slice(0, 5),
      recentLabTests: labTests.slice(0, 5)
    };
  }
};
