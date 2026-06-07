const logger = require('../utils/logger');

async function sendEmail(to, subject, body) {
  logger.info(`Email to ${to}: ${subject}`);
  if (process.env.NODE_ENV === 'development') {
    logger.info(body);
  }
  return true;
}

async function sendAppointmentReminder24h(user, pet, appointment) {
  return sendEmail(
    user.email,
    `Appointment Tomorrow — ${pet.name}`,
    `Reminder: ${pet.name} has an appointment with Dr. ${appointment.vetName} tomorrow at ${appointment.time || 'scheduled time'}.`
  );
}

async function sendAppointmentReminder2h(user, pet, appointment) {
  return sendEmail(
    user.email,
    `Appointment in 2 Hours — ${pet.name}`,
    `Reminder: ${pet.name}'s appointment with Dr. ${appointment.vetName} starts in about 2 hours.`
  );
}

async function sendVaccineReminder30d(user, pet, vaccination) {
  return sendEmail(
    user.email,
    `Vaccine Due in 30 Days — ${pet.name}`,
    `${pet.name} is due for ${vaccination.vaccineName} in 30 days.`
  );
}

async function sendVaccineReminder7d(user, pet, vaccination) {
  return sendEmail(
    user.email,
    `Vaccine Due in 7 Days — ${pet.name}`,
    `${pet.name} is due for ${vaccination.vaccineName} in 7 days.`
  );
}

async function sendVaccineDueToday(user, pet, vaccination) {
  return sendEmail(
    user.email,
    `Vaccine Due Today — ${pet.name}`,
    `${pet.name} is due for ${vaccination.vaccineName} today.`
  );
}

module.exports = {
  sendEmail,
  sendAppointmentReminder24h,
  sendAppointmentReminder2h,
  sendVaccineReminder30d,
  sendVaccineReminder7d,
  sendVaccineDueToday,
};
