// const Itinerary = require("../models/itinerary");
// const uploadFileToS3 = require("../services/s3");

// // exports.createItinerary = async (req, res) => {
// //   try {
// //     const { packageId, day, activity, details } = req.body;

// //     if (!req.file) {
// //       return res.status(400).json({ error: "No file uploaded" });
// //     }

// //     const fileBuffer = req.file.buffer;
// //     const fileName = `Itinerary/${Date.now()}_${file.originalname}`;
// //     const fileType = req.file.mimetype;

// //     // Upload the file to S3
// //     const fileUrl = await uploadFileToS3(fileBuffer, fileName, fileType);

// //     // Create itinerary
// //     const itinerary = await Itinerary.create({
// //       packageId,
// //       day,
// //       activity,
// //       details,
// //       fetaure_img: fileUrl, // Save S3 file URL
// //     });

// //     res.status(201).json(itinerary);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Failed to create itinerary" });
// //   }
// // };

// // UPDATE Itinerary

// exports.createItinerary = async (req, res) => {
//   try {
//     const { packageId, day, activity, details } = req.body;

//     // Check if the file is uploaded via multer
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Access file from req.file (provided by multer)
//     const fileBuffer = req.file.buffer;
//     const fileName = `Itinerary/${Date.now()}_${req.file.originalname}`;
//     const fileType = req.file.mimetype;

//     // Upload the file to S3
//     const fileUrl = await uploadFileToS3(fileBuffer, fileName, fileType);

//     console.log(fileUrl,'file')
//     // Create itinerary with the uploaded file URL
//     const itinerary = await Itinerary.create({
//       packageId,
//       day,
//       activity,
//       details,
//       feature_img: fileUrl // Use the correct file URL from S3
//     });

//     res.status(201).json(itinerary);
//   } catch (err) {
//     console.error('Error details:', err);  // Log the actual error
//     res.status(500).json({ error: 'Failed to create itinerary' });
//   }
// };


// exports.updateItinerary = async (req, res) => {
//   try {
//     const { tourId, day, activity, details } = req.body;
//     const itinerary = await Itinerary.findByPk(req.params.id);

//     if (!itinerary) {
//       return res.status(404).json({ error: "Itinerary not found" });
//     }

//     // Upload new file to S3 if a new image is provided
//     let fileUrl = itinerary.fetaure_img;
//     if (req.file) {
//       fileUrl = await uploadFileToS3(
//         req.file.buffer,
//         req.file.originalname,
//         req.file.mimetype
//       );
//     }

//     // Update itinerary
//     const updatedItinerary = await itinerary.update({
//       tourId,
//       day,
//       activity,
//       details,
//       fetaure_img: fileUrl,
//     });

//     res.status(200).json(updatedItinerary);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update itinerary" });
//   }
// };

// // GET All Itineraries
// exports.getAllItineraries = async (req, res) => {
//   try {
//     const itineraries = await Itinerary.findAll();
//     res.status(200).json(itineraries);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to retrieve itineraries" });
//   }
// };

// // DELETE Itinerary
// exports.deleteItinerary = async (req, res) => {
//   try {
//     const itinerary = await Itinerary.findByPk(req.params.id);

//     if (!itinerary) {
//       return res.status(404).json({ error: "Itinerary not found" });
//     }

//     await itinerary.destroy();
//     res.status(200).json({ message: "Itinerary deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete itinerary" });
//   }
// };


// controllers/ItineraryController.js
const Itinerary = require("../models/itinerary");
// const uploadFileToS3 = require("../services/s3");  // Import your S3 upload service
const Package = require("../models/packages");
// CREATE Itinerary
exports.createItinerary = async (req, res) => {
  try {
    const { packageId, day, activity, details ,feature_img} = req.body;

    // Check if the file is uploaded via multer

    // Access file from req.file (provided by multer)
    // const fileBuffer = req.file.buffer;
    // const fileName = `Itinerary/${Date.now()}_${req.file.originalname}`;
    // const fileType = req.file.mimetype;

    // // Upload the file to S3
    // const fileUrl = await uploadFileToS3(fileBuffer, fileName, fileType);

    // Create itinerary with the uploaded file URL
    const itinerary = await Itinerary.create({
      packageId,
      activity,
      details,
      feature_img // Use the correct file URL from S3
    });

    res.status(201).json(itinerary);
  } catch (err) {
    console.error('Error details:', err);  // Log the actual error
    res.status(500).json({ error: 'Failed to create itinerary' });
  }
};

// UPDATE Itinerary
exports.updateItinerary = async (req, res) => {
  try {
    const { tourId, day, activity, details,feature_img } = req.body;
    const itinerary = await Itinerary.findByPk(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Upload new file to S3 if a new image is provided
    // let fileUrl = itinerary.feature_img; // Corrected field name
    // if (req.file) {
    //   fileUrl = await uploadFileToS3(
    //     req.file.buffer,
    //     req.file.originalname,
    //     req.file.mimetype
    //   );
    // }

    // Update itinerary
    const updatedItinerary = await itinerary.update({
      tourId,
      day,
      activity,
      details,
      feature_img,  // Corrected reference
    });

    res.status(200).json(updatedItinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update itinerary" });
  }
};

// GET All Itineraries
exports.getAllItineraries = async (req, res) => {
  try {
    // const itineraries = await Itinerary.findAll();
    const itineraries = await Itinerary.findAll({
    });
    res.status(200).json(itineraries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve itineraries" });
  }
};

// exports.getAllItineraries = async (req, res) => {
//   try {
//     // const itineraries = await Itinerary.findAll();
//     const itineraries = await Itinerary.findAll({});
//     res.status(200).json(itineraries);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to retrieve itineraries" });
//   }
// };

// DELETE Itinerary
exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    await itinerary.destroy();
    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete itinerary" });
  }
};
