const { Slot, Tour, Passenger, Flight } = require("../models"); // Import associations if necessary

// exports.createSlot = async (req, res) => {
//   try {
//     const { date, time, totalSlots } = req.body;

//     // Basic validation
//     if (!date || !time || !totalSlots ) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if a slot already exists for the same date and time
//     const existingSlot = await Slot.findOne({ where: { date, time } });

//     if (existingSlot) {
//       return res.status(400).json({ error: 'Slot for the selected date and time already exists.' });
//     }

//     // Create slot
//     const slot = await Slot.create(req.body);
//     res.status(201).json(slot);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Get all slots with pagination
const moment = require("moment"); // Use moment.js or any other date library for date manipulation

exports.createSlot = async (req, res) => {
  try {
    const { startDate, endDate, totalSlots, flightId, packageId } = req.body;

    // Basic validation
    if (!startDate || !endDate || !totalSlots) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const createdSlots = [];
    // const updatedSlots = [];


    // Iterate through each day in the range
    for (let date = start; date.isSameOrBefore(end); date.add(1, "days")) {
      const formattedDate = date.format("YYYY-MM-DD");

      // Check if a slot already exists for the same date and time
      const existingSlot = await Slot.findOne({
        where: { date: formattedDate },
      });

      if (existingSlot) {
        console.log(`Slot for ${formattedDate}`);
        continue; // Skip existing slots
      }

      // Create slot
      const slot = await Slot.create({
        date: formattedDate,
        totalSlots,
        flightId, // Ensure flightId is passed here
        packageId,
      });

      createdSlots.push(slot);
    }

    if (createdSlots.length === 0) {
      return res
        .status(400)
        .json({
          error:
            "No slots were created, slots might already exist for the given range.",
        });
    }

    res.status(201).json({
      message: "Slots created successfully",
      createdSlots,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.findAll({
      include: [
        // { model: Tour, as: 'tour' }, // Include related Tour model
        { model: Passenger, as: "passengers" }, // Include related Passengers model
        { model: Flight, as: "flight" }, // Include related Flight model
      ],
    });

    res.status(200).json({
      slots: slots, // Return the slots directly without pagination
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific slot by ID with associations
exports.getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findByPk(req.params.id, {
      include: [
        { model: Tour, as: "tour" }, // Include related Tour model
        { model: Passenger, as: "passengers" }, // Include related Passengers
      ],
    });
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.status(200).json(slot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a slot by ID with validation
exports.updateSlot = async (req, res) => {
  try {
    const { date, time, totalSlots, packageId } = req.body;

    // Basic validation
    if (!date || !time || !totalSlots || !packageId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slot = await Slot.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    await slot.update(req.body);
    res.status(200).json(slot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a slot by ID
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    await slot.destroy();
    res.status(204).send(); // No content to send back
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
