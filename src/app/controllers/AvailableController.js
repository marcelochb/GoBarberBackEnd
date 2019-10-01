import AvailableService from '../services/AvailableServices';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      throw new Error('Invalid date');
    }

    const searchDate = Number(date);

    const available = await AvailableService.run({
      provider_id: req.params.providerId,
      date: searchDate,
    });

    return res.json(available);
  }
}

export default new AvailableController();
