// const Tour = require('../models/packages');
// const uploadFileToS3 = require('../middleware/s3'); // Assuming you moved your S3 logic to a separate file
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { default: axios } = require('axios');

// const s3Client = new S3Client({
//   region: "us-east-1",
//   credentials: {
// 
//   },
// });

// // Create a new tour
// // exports.createTour = async (req, res) => {
// //   try {
// //     const tour = await Tour.create(req.body);
// //     res.status(201).json(tour);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // exports.createTour = async (req, res) => {
// //   console.log(req.file)
// //   try {
// //     const parsedItinerary = JSON.parse(itinerary);
// //     // Extract package_image from the request
// //     const { file } = req; // Assuming you're using middleware like multer to handle file uploads
// //     const { body } = req; // Get other form data from the request

// //     if (!file) {
// //       return res.status(400).json({ message: "Package image is required" });
// //     }

// //     // Upload the image to S3
// //     const fileBuffer = file.buffer; // Buffer from multer (or similar middleware)
// //     const fileName = `tours/${Date.now()}_${file.originalname}`; // Unique file name
// //     const fileType = file.mimetype;

// //     const s3ImageUrl = await uploadFileToS3(fileBuffer, fileName, fileType);

// //     // Add the S3 URL to the tour data
// //     const tourData = {
// //       ...body, // All other tour fields
// //       package_image: s3ImageUrl, // Store the S3 image URL in the database
// //     };
// //     console.log(tourData,'tour')

// //     // Create the tour in the database
// //     const tour = await Tour.create(tourData);
// //     // zoho integrations

// //     const zohoUrl = "https://www.zohoapis.com/crm/v2/functions/maha_balloons_packages/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893";

// //     // Make a POST request to Zoho API with user data
    
// //     // Send response
// //     res.status(201).json(tour);
   
// //     await axios.post(zohoUrl,tour, {
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     })
// //     .then(response => {
// //       console.log('Data sent to Zoho successfully:', response.data);
// //     })
// //     .catch(err => {
// //       console.error('Error sending data to Zoho:', err.message);
// //     });

// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// exports.createTour = async (req, res) => {
//   try {
//     const { file, body } = req; // Extract the file and body from the request

//     // Check if the file is present
//     if (!file) {
//       return res.status(400).json({ message: "Package image is required" });
//     }

//     // Upload the image to S3
//     const fileBuffer = file.buffer; // Buffer from multer (or similar middleware)
//     const fileName = `tours/${Date.now()}_${file.originalname}`; // Generate unique file name
//     const fileType = file.mimetype;

//     const s3ImageUrl = await uploadFileToS3(fileBuffer, fileName, fileType);

//     // Parse the itinerary if it's provided as JSON in the body
//     // let parsedItinerary;
//     // if (body.itinerary) {
//     //   try {
//     //     parsedItinerary = JSON.parse(body.itinerary); // Parse itinerary if it's passed as a JSON string
//     //   } catch (err) {
//     //     return res.status(400).json({ message: "Invalid itinerary format" });
//     //   }
//     // }

//     // Create the tour data object
//     const tourData = {
//       title: body.title,
//       route: body.route,
//       price_adult: body.price_adult,
//       price_child: body.price_child,
//       short_detail: body.short_detail,
//       location: body.location,
//       duration: body.duration,
//       package_image: s3ImageUrl, // Use the S3 image URL
//       itinerary: body.itinerary, // Use parsed itinerary or raw body
//       Details: body.Details, // Details should also be passed in the form-data
//       seo: body.seo ? JSON.parse(body.seo) : null, // Parse SEO data if present
//     };

//     // Create the tour in the database
//     const tour = await Tour.create(tourData);

//     // Zoho API Integration
//     const zohoUrl = "https://www.zohoapis.com/crm/v2/functions/maha_balloons_packages/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893";

//     // Send the tour data to Zoho
//     await axios.post(zohoUrl, tour, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//     .then(response => {
//       console.log('Data sent to Zoho successfully:', response.data);
//     })
//     .catch(err => {
//       console.error('Error sending data to Zoho:', err.message);
//     });

//     // Send a success response
//     res.status(201).json(tour);

//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };
// // // Get all tours
// // exports.getTours = async (req, res) => {
// //   try {
// //     const tours = await Tour.findAll();
// //     res.status(200).json(tours);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // exports.getTours = async (req, res) => {
// //   try {
// //     // Fetch all tours
// //     const tours = await Tour.findAll();

// //     // Format each tour's itinerary and details
// //     const formattedTours = tours.map(tour => {
// //       // Parse itinerary if it's stored as a string
// //       let parsedItinerary;
// //       try {
// //         parsedItinerary = JSON.parse(tour.itinerary);
// //       } catch (err) {
// //         parsedItinerary = tour.itinerary; // If not JSON, keep it as is
// //       }

// //       // Return the formatted tour object
// //       return {
// //         ...tour.toJSON(), // Convert Sequelize object to plain JS object
// //         itinerary: parsedItinerary.replace(/(^"|"$)/g, ''), // Use the parsed itinerary
// //         Details: tour.Details.replace(/(^"|"$)/g, ''), // Remove unnecessary quotes around Details
// //       };
// //     });

// //     // Send the formatted response
// //     res.status(200).json(formattedTours);

// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// exports.getTours = async (req, res) => {
//   try {
//     // Fetch all tours
//     const tours = await Tour.findAll();

//     // Format each tour's itinerary and details
//     const formattedTours = tours.map(tour => {
//       // Parse the itinerary if it's a string
//       let parsedItinerary;
//       try {
//         // Parse itinerary if it's a string with escaped characters
//         parsedItinerary = typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary;
//       } catch (err) {
//         // In case of error, log it and keep itinerary as it is
//         console.error("Error parsing itinerary:", err.message);
//         parsedItinerary = tour.itinerary;
//       }

//       // Return the formatted tour object
//       return {
//         ...tour.toJSON(), // Convert Sequelize object to plain JS object
//         itinerary: parsedItinerary, // Use parsed itinerary
//       };
//     });

//     // Send the formatted response
//     res.status(200).json(formattedTours);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



// // Get a specific tour by ID
// exports.getTourById = async (req, res) => {
//   try {
//     const tour = await Tour.findByPk(req.params.id);
//     if (!tour) {
//       return res.status(404).json({ message: 'Tour not found' });
//     }
//     res.status(200).json(tour);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update a tour
// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByPk(req.params.id);
//     if (!tour) {
//       return res.status(404).json({ message: 'Tour not found' });
//     }
//     await tour.update(req.body);
//     res.status(200).json(tour);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete a tour
// exports.deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByPk(req.params.id);
//     if (!tour) {
//       return res.status(404).json({ message: 'Tour not found' });
//     }
//     await tour.destroy();
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const Tour = require('../models/packages');
// const uploadFileToS3 = require('../services/s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { default: axios } = require('axios');
require('dotenv').config(); // To use environment variables
const Itinerary = require('../models/itinerary');

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// // });
// const s3Client = new S3Client({
//     region: "us-east-1",
//     credentials: {
//      
//     },
//   });

// Create a new tour
exports.createTour = async (req, res) => {
  try {
   

    // Create the tour data object
    const tourData = {
      title: req.body.title,
      route:req.body.route,
      price_adult: req.body.price_adult,
      price_child: req.body.price_child,
      short_detail: req.body.short_detail,
      location: req.body.location,
      duration: req.body.duration,
      package_image: req.body.package_image, // Use the image data directly from the body
      itinerary: req.body.itinerary,
      // seo: parsedSEO,
      featured: false
    };

    // Create the tour in the database
    const tour = await Tour.create(tourData);

    // Zoho API Integration (if applicable)
    const zohoUrl = `https://www.zohoapis.com/crm/v2/functions/packages/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`
    try {
      // Send the tour data to Zoho
      await axios.post(zohoUrl, tour, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Data sent to Zoho successfully');
    } catch (err) {
      console.error('Error sending data to Zoho:', err.message);
    }

    // Send a success response
    res.status(201).json(tour);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// Get all tours
exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: [{
        model: Itinerary,
        as: 'itineraries'  // Fetch associated itineraries
      }]
    });


    // Format each tour's itinerary and details
    const formattedTours = tours.map(tour => {
      let parsedItinerary = tour.itinerary;
      let parsedDetails = tour.Details;
      let parsedSEO = tour.seo;

      try {
        parsedItinerary = typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary;
      } catch (err) {
        console.error("Error parsing itinerary:", err.message);
      }

      try {
        parsedDetails = typeof tour.Details === 'string' ? JSON.parse(tour.Details) : tour.Details;
      } catch (err) {
        console.error("Error parsing Details:", err.message);
      }

      try {
        parsedSEO = typeof tour.seo === 'string' ? JSON.parse(tour.seo) : tour.seo;
      } catch (err) {
        console.error("Error parsing SEO:", err.message);
      }

      return {
        ...tour.toJSON(),
        itinerary: parsedItinerary,
        Details: parsedDetails,
        seo: parsedSEO,
      };
    });

    res.status(200).json(formattedTours);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific tour by ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      // Include the itineraries associated with the tour 
      include: [{ model: Itinerary, as: 'itineraries' }],
    });
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Parse itinerary, Details, and SEO for this specific tour
    let parsedItinerary = tour.itinerary;
    let parsedDetails = tour.Details;
    let parsedSEO = tour.seo;

    try {
      parsedItinerary = typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary;
    } catch (err) {
      console.error("Error parsing itinerary:", err.message);
    }

    try {
      parsedDetails = typeof tour.Details === 'string' ? JSON.parse(tour.Details) : tour.Details;
    } catch (err) {
      console.error("Error parsing Details:", err.message);
    }

    try {
      parsedSEO = typeof tour.seo === 'string' ? JSON.parse(tour.seo) : tour.seo;
    } catch (err) {
      console.error("Error parsing SEO:", err.message);
    }

    const formattedTour = {
      ...tour.toJSON(),
      itinerary: parsedItinerary,
      Details: parsedDetails,
      seo: parsedSEO,
    };

    res.status(200).json(formattedTour);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a tour
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Parse itinerary, Details, and SEO from request body
    let parsedItinerary, parsedDetails, parsedSEO;
    
    try {
      parsedItinerary = req.body.itinerary ? JSON.parse(req.body.itinerary) : null;
    } catch (err) {
      return res.status(400).json({ message: "Invalid itinerary format" });
    }

    try {
      parsedDetails = req.body.Details ? JSON.parse(req.body.Details) : null;
    } catch (err) {
      return res.status(400).json({ message: "Invalid Details format" });
    }

    try {
      parsedSEO = req.body.seo ? JSON.parse(req.body.seo) : null;
    } catch (err) {
      return res.status(400).json({ message: "Invalid SEO format" });
    }

    // Update the tour
    await tour.update({
      ...req.body,
      itinerary: parsedItinerary,
      Details: parsedDetails,
      seo: parsedSEO,
    });

    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    await tour.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTourWithItineraries = async (req, res) => {
  try {
    const tour = await Tour.findOne({
      where: { id: req.params.id },  // Fetch the tour by its ID from the request
      include: [{
        model: Itinerary,
        as: 'itineraries'  // Fetch associated itineraries
      }]
    });

    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    res.status(200).json(tour);  // Send the fetched tour and itineraries as JSON
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ message: 'Server error' });
  }
};