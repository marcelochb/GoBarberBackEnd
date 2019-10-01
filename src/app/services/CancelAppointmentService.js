import { isBefore, subHours } from 'date-fns';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';
import Appointment from '../models/Appointment';
import User from '../models/User';

import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({ user_id, provider_id }) {
    const appointment = await Appointment.findByPk(provider_id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== user_id) {
      throw new Error("You don't have permission to cancel this appoiment.");
    }
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error('You can only cances appointments 2 hours in advance.');
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    /**
     * Invalidate cache
     */

    await Cache.invalidadePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CancelAppointmentService();
