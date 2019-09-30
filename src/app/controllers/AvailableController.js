import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import pt from 'date-fns/locale/pt';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date, timezone } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);
    const timezoneLocal = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
    ];

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx")) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
        newdata: new Date(),
        UtcToZonedata: utcToZonedTime(new Date(), {
          timeZone: timezone,
          locale: pt,
        }),
        zonedTimeToUtc: zonedTimeToUtc(new Date(), {
          timeZone: timezone,
          locale: pt,
        }),
        formatData: format(
          utcToZonedTime(new Date(), {
            timeZone: timezone,
            locale: pt,
          }),
          "yyyy-MM-dd'T'HH:mm:ssxxx",
          {
            timeZone: timezone,
          }
        ),
        UtcToZoneformatData: utcToZonedTime(
          format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          {
            timeZone: timezone,
            locale: pt,
          }
        ),
        ZoneToUtcformatData: zonedTimeToUtc(
          format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          {
            timeZone: timezone,
            locale: pt,
          }
        ),
        timezone,
        timezoneLocal,
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
