const {Pickup, Passenger} = require('../models');

exports.createPickup = async (req, res) => {
  console.log(req.body)
  try {
    const { house_no, city, address, area, country,landmark, passengerId } = req.body;

   const newPickup = await Pickup.create({
      house_no,
      city,
      address,
      area,
      landmark,
      country,
      passengerId
    });
    res.status(201).json(newPickup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.findAll();
    res.status(200).json(pickups);
  } catch (error) {
    console.error("Error fetching pickups:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findByPk(id, {
      include: [{
        model: Passenger, // Make sure to import the Passenger model at the top
        as: 'passenger' // This should match the alias you defined in your associations
      }]
    });
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    res.status(200).json(pickup);
  } catch (error) {
    console.error("Error fetching pickup:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findByPk(id);
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    const updatedPickup = await pickup.update(req.body);
    res.status(200).json(updatedPickup);
  } catch (error) {
    console.error("Error updating pickup:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findByPk(id);
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    await pickup.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting pickup:", error.message);
    res.status(500).json({ message: error.message });
  }
};
