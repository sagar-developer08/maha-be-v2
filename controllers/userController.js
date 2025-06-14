const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const config = require("../environment/config");
const axios = require("axios");
const SocialMedia = require("../models/socialMedia");
const crypto = require("crypto");
const doubletick = require("@api/doubletick");
// const { error } = require("console");
const { v2: cloudinary } = require("cloudinary");
const { v4: uuidv4 } = require("uuid");

doubletick.auth("key_2hj3FLXub8"); // Authenticate with your API key
// const doubletick = require('@api/doubletick');

// const axios = require('axios');

// const uploadFileToS3 = require("../services/s3");
const emailService = require("../services/email");
// const generatePresignedUrl = require("../services/s3");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt.secretKey,
    {
      expiresIn: "1d",
    }
  );

  // res.json({  user:user, token: token });
  const userResponse = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // Send response
  res.json({
    user: userResponse,
    token: token,
  });
};

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
      contributor,
      referral_code,
      // referrerId,
    } = req.body; ////Added

    console.log("----body", req.body);
    // Find the referrer based on the referral code provided
    const referrer = referral_code
      ? await User.findOne({ where: { referral_code: referral_code } })
      : null;

    console.log(referrer, "reffere");
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Generate a random OTP
    const otp = crypto.randomBytes(3).toString("hex").toUpperCase();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // user uuid id
    const shortUuid = uuidv4().split("-")[0].substring(0, 5);
    // Create the user in your system
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      role,
      contributor,
      uuid: shortUuid,
      referrerId: referrer ? referrer.id : null, // Set referrerId if a referrer is found////Added
      otp, // Store OTP for verification
    });
    console.log(user, "---user");
    const dataZoho = user.dataValues;
    // Determine Zoho API URL based on role
    let zohoUrl;
    if (role === "Customer") {
      zohoUrl =
        "https://www.zohoapis.com/crm/v2/functions/register_accounts/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893";
    } else if (
      role === "B2B-Individual" ||
      role === "B2B-company" ||
      role === "B2B-Influencer"
    ) {
      zohoUrl =
        "https://www.zohoapis.com/crm/v2/functions/customers/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893";
    }

    // Send data to the appropriate Zoho API
    await axios
      .post(zohoUrl, dataZoho, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("Data sent to Zoho successfully:", response.data);
      })
      .catch((err) => {
        console.error("Error sending data to Zoho:", err.message);
      });

    // Determine the URL based on the role
    let registrationLink;
    if (role === "B2B-company") {
      registrationLink = `https://www.mahaballoonadventures.ae/en?auth=register&company=${user.id}.`;
    } else {
      registrationLink = `https://www.mahaballoonadventures.ae/en?auth=register&user=${user.id}`;
    }

    // Send the OTP email
    await emailService.send({
      to: user.email,
      subject: "Your Verification OTP",
      text: `Your OTP for verification is: ${otp}`,
    });

    if (role === "Customer") {
      await doubletick
        .outgoingMessagesWhatsappTemplate({
          messages: [
            {
              from: "+971502600101",
              to: user.phone,
              content: {
                templateName: "b2b_useronboarding_v2", // Adjust the template name for Customer
                language: "en",
                templateData: {
                  header: { type: "TEXT", placeholder: user.first_name },
                  body: { placeholders: [user.first_name] },
                },
              },
            },
          ],
        })
        .then(({ data }) => {
          console.log("WhatsApp notification sent to customer:", data);
        })
        .catch((err) => {
          console.error(
            "Error sending WhatsApp notification to customer:",
            err
          );
        });
    } else {
      await doubletick
        .outgoingMessagesWhatsappTemplate({
          messages: [
            {
              from: "+971502600101",
              to: user.phone,
              content: {
                templateName: "onboarding_v8",
                language: "en",
                templateData: {
                  header: { type: "TEXT", placeholder: user.first_name },
                  body: { placeholders: [user.first_name, registrationLink] },
                },
              },
            },
          ],
        })
        .then(({ data }) => {
          console.log("WhatsApp notification sent:", data);
        })
        .catch((err) => {
          console.error("Error sending WhatsApp notification:", err);
        });
    }

    // Conditional email based on the role
    if (role === "Customer") {
      console.log("Sending email specific to customer role...");
      // Send email specific to customer role
      await emailService.send({
        to: user.email,
        subject:
          "Thank you for Registering to win a Free Hot Air Balloon Ride with Maha Balloon Adventures",
        text: `Dear ${user.first_name},\n\n
Thank you for registering to win a Free Hot Air Balloon Ride with Maha Balloon Adventures.\n\n
Please do the following steps to properly register and be one of the 30 winners:\n
1. Register on the landing page with your name, email, WhatsApp number, and other details. Follow Maha Balloon on social media.\n
2. Take a selfie and a video and share it with us on WhatsApp. You will get a referral link from us to share with your friends and family.\n
3. The more friends you invite with your referral link, the higher your chances to win!\n\n
We will select one lucky winner every day who shares their referral code with the most friends and family.\n\n
Warm Regards,\n
Maha Balloon Adventures`,
      });
    } else {
      // Send registration confirmation email with the correct URL for other roles
      await emailService.send({
        to: user.email,
        subject:
          "Thank you for Registering as a B2B Partner with Maha Balloon Adventures",
        text: `Thank you for registering as a B2B Partner with Maha Balloon Adventures. 
      
Please submit the documents on the following link: ${registrationLink} 

If you have any questions, please feel free to call us on 056 687 6264 or email us at sales.executives3@mahab.net, 
cc: fly@mahab.net, or WhatsApp us on +971 56 687 6264.

Looking forward to working with you!

Warm Regards, 
Maha Balloon Adventures`,
      });
    }

    // Prepare user data for response
    const userData = user.toJSON();
    delete userData.password;
    delete userData.otp;
    delete userData.role;

    // Send final response to the client
    res.status(201).json({
      message: "User registered successfully! Please verify your email.",
      user: userData,
    });
  } catch (error) {
    console.log(error, "error");
    // Handle any errors that occur during the registration process
    res.status(500).json({ error: error.message });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

exports.generateAndStoreOTP = async (req, res) => {
  try {
    const { email, id } = req.body;
    const user = await User.findOne({ where: { email, id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP(); // Function to generate OTP
    user.otp = otp; // Store OTP in the user record
    await user.save();

    // Optionally send OTP email here
    // await sendOTPEmail(email, otp);

    // Set timeout to clear OTP after 5 seconds
    setTimeout(async () => {
      const updatedUser = await User.findOne({ where: { email, id } });
      if (updatedUser && updatedUser.otp === otp) {
        // Ensure OTP hasn't been verified yet
        updatedUser.otp = null; // Clear OTP after 5 seconds if not verified
        await updatedUser.save();
      }
    }, 120000); // 5000 ms = 5 seconds

    return res.status(200).json({ message: "OTP sent to your email", otp }); // For development purposes, send OTP in response
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

//
exports.verifyOtp = async (req, res) => {
  try {
    const { email, enteredOtp } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the OTP matches
    if (user.otp === enteredOtp) {
      // OTP is correct, update is_verified and clear OTP
      user.is_verified = true;
      user.otp = null; // Clear OTP after successful verification
      await user.save();

      return res.status(200).json({ message: "User verified successfully!" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    // Handle any errors that occur during the verification process
    res.status(500).json({ error: error.message });
  }
};
//

// const User = require('../models/User');
// const transporter = require('../config/emailConfig');

// Function to generate OTP

// Function to handle OTP generation

//

exports.saveSocialMedia = async (req, res) => {
  try {
    const { userId, socialMediaDetails } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is a B2B Influencer
    if (user.role !== "B2B Influencer") {
      return res.status(400).json({
        error: "Social media details are only applicable to B2B Influencers",
      });
    }

    // Save social media data
    const socialMedia = await SocialMedia.create({
      user_id: user.id,
      ...socialMediaDetails,
    });

    res.status(200).json({
      message: "Social media details saved successfully",
      socialMedia,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save social media details" });
  }
};

cloudinary.config({
  cloud_name: "dmcknuzk4",
  api_key: "744463455963954",
  api_secret: "L-EUIQ9LzkE-Xkd4iIYhtGC5eYg", // Replace with your actual Cloudinary API secret
});

// const uploadToCloudinary = async (fileBuffer, folderName, fileName) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream({ folder: folderName }, (error, result) => {
//       if (error) {
//         console.log(error,'clounary')
//         reject(error);
//       } else {
//         console.log(result.secure_url,'--reuslt')
//         resolve(result.secure_url); // Return the URL from Cloudinary
//       }
//     }).end(fileBuffer);
//   });
// };
// //
// exports.uploadIDs = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const files = req.files;

//     console.log("Received files:", files);

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     let fileUploadPromises = [];
//     // Check user role
//     if (user.role === 'B2B-company' || user.role === 'B2B-Individual') {
//       console.log('data')
//       // Upload Trade License
//       if (files.trade_license && files.trade_license.length > 0) {
//         console.log("Uploading trade license...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.trade_license[0].buffer, `B2B-company/${userId}`)
//             .then(url => user.trade_license = url)
//             .catch(error => console.error("Failed to upload trade license:", error)) // Handle specific errors
//         );
//       }

//       // Upload TRN Certificate
//       if (files.trn_certificate && files.trn_certificate.length > 0) {
//         console.log("Uploading TRN certificate...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.trn_certificate[0].buffer, `B2B-company/${userId}`)
//             .then(url => user.trn_certificate = url)
//             .catch(error => console.error("Failed to upload TRN certificate:", error))
//         );
//       }

//       // Upload Owner Passport Copy
//       if (files.passport_id && files.passport_id.length > 0) {
//         console.log("Uploading owner passport...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.passport_id[0].buffer, `B2B-company/${userId}`)
//             .then(url => user.passport_id = url)
//             .catch(error => console.error("Failed to upload owner passport:", error))
//         );
//       }
//       // Upload Visa Copy
//       if (files.visa_copy && files.visa_copy.length > 0) {
//         console.log("Uploading visa copy...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.visa_copy[0].buffer, `B2B-company/${userId}`)
//             .then(url => user.visa_copy = url)
//             .catch(error => console.error("Failed to upload visa copy:", error))
//         );
//       }

//       // Upload Emirates ID Copy
//       if (files.emt_id && files.emt_id.length > 0) {
//         console.log("Uploading Emirates ID copy...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.emt_id[0].buffer, `B2B-company/${userId}`)
//             .then(url => user.emt_id = url)
//             .catch(error => console.error("Failed to upload Emirates ID copy:", error))
//         );
//       }
//     }
//     // If the user is a B2B-influencer, upload Owner Passport Copy
//     if (user.role === 'B2B-Influencer') {
//       if (files.passport_id && files.passport_id.length > 0) {
//         console.log("Uploading owner passport for influencer...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.passport_id[0].buffer, `B2B-Influencer/${userId}`)
//             .then(url => user.passport_id = url)
//             .catch(error => console.error("Failed to upload owner passport for influencer:", error))
//         );
//       }
//       if (files.emt_id && files.emt_id.length > 0) {
//         console.log("Uploading Emirates ID copy influncer...");
//         fileUploadPromises.push(
//           uploadToCloudinary(files.emt_id[0].buffer, `B2B-Influencer/${userId}`)
//             .then(url => user.emt_id = url)
//             .catch(error => console.error("Failed to upload Emirates ID copy:", error))
//         );
//       }
//     }

//     // Upload files and save user record with URLs
//     await Promise.all(fileUploadPromises);
//     await user.save();

//     res.status(200).json({ message: "Files uploaded successfully", user });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ error: "Failed to upload files" });
//   }
// };

//

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving user" });
  }
};

// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { first_name, last_name, email, phone } = req.body;

//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update user details
//     user.first_name = first_name || user.first_name;
//     user.last_name = last_name || user.last_name;
//     user.email = email || user.email;
//     user.phone = phone || user.phone;

//     await user.save();

//     res.status(200).json({ message: 'User updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating user' });
//   }
// };

// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the user by ID
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update user with values from req.body
//     await user.update(req.body);

//     res.status(200).json({ message: 'User updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating user' });
//   }
// };

// const axios = require('axios');

// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the user by ID
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update user with values from req.body
//     await user.update(req.body);

//     // Check if the user is verified by the admin
//     if (req.body.is_verified_byadmin === true && user.is_verified_byadmin === false) {
//       // Send WhatsApp notification
//       await axios.post('https://app.doubletick.io/api/send_template', {
//         to: user.phone,  // Send to user's phone number
//         template_name: 'user_verification_success', // Your template name in DoubleTick
//         parameters: [
//           { key: '{{1}}', value: user.first_name }  // Replace placeholder with user's first name
//         ],
//         // Additional fields like headers, media attachments, if needed
//       }, {
//         headers: {
//           'Authorization': `key_2hj3FLXub8`,
//           'Content-Type': 'application/json'
//         }
//       }).then(response => {
//         console.log('WhatsApp notification sent:', response.data);
//       }).catch(err => {
//         console.error('Error sending WhatsApp notification:', err.message);
//       });
//     }

//     res.status(200).json({ message: 'User updated successfully', user });
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating user' });
//   }
// };

// const crypto = require('crypto'); // For generating referral code

// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the user by ID
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (!user.referral_code) {
//       const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates a random referral code
//       user.referral_code = referralCode;
//       await user.save(); // Save the updated user with referral code
//     }
//     // Update user with values from req.body
//     await user.update(req.body);
//     console.log(user, "user");
//     // Check if is_verified_byadmin is true and send WhatsApp notification
//     if (user.is_verified_byadmin) {
//       doubletick
//         .outgoingMessagesWhatsappTemplate({
//           messages: [
//             {
//               from: "+971502600101", // Your registered WhatsApp number
//               to: user.phone, // The user's phone number
//               content: {
//                 templateName: "user_verification_success_admin_v2", // Template name
//                 language: "en", // Language code
//                 templateData: {
//                   header: { type: "TEXT", placeholder: user.first_name }, // Dynamic header content
//                   body: { placeholders: [user.first_name, user.referral_code] }, // Body content with name and referral code                  // Dynamic body content (e.g., name or other details)
//                 },
//               },
//             },
//           ],
//         })
//         .then(({ data }) => {
//           // console.log(data);
//           console.log("WhatsApp notification sent:", data);
//         })
//         .catch((err) => {
//           console.error("Error sending WhatsApp notification:", err);
//         });

//       //
//       console.log(user, "user");
//       await emailService.send({
//         to: user.email,
//         subject:
//           "Congrats you are now onboarded as a B2B partner with Maha Balloons Adventures",
//         text: `Congratulations !!

//       ${user.first_name} is now successfully registered as a B2B Partner with Maha Balloon Adventures.

//       We have checked all of your submitted documents and completed the onboarding process. Our B2B Customer Success manager will call you to finalize the next steps. Till then, please find our B2B Brochure attached for your reference.

//       Your referral code is: ${user.referral_code}

//       If you have any questions, please feel free to call us on 056 687 6264 or email us on sales.executives3@mahab.net cc: fly@mahab.net or WhatsApp us on +971 56 687 6264.

//       Looking forward to working with you!

//       Warm Regards,

//       Maha Balloon Adventures`,
//         attachments: [
//           {
//             filename: "B2B_Brochure.pdf",
//             path: "./path-to-brochure/B2B_Brochure.pdf",
//           },
//         ], // Add the brochure attachment
//       });
//     }

//     if(user.is_verified_byadmin)

//     res.status(200).json({ message: "User updated successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: "Error updating user" });
//   }
//   // email services
// };

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body; // Get remark from request body

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user with values from req.body
    await user.update(req.body);
    console.log(user, "user");

    // Generate a referral code only if the user is verified and does not have one
    if (user.is_verified_byadmin && !user.referral_code) {
      const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase(); // Generates a random referral code
      user.referral_code = referralCode;
      await user.save(); // Save the updated user with referral code
    }

    // If the user is verified by admin, send WhatsApp and email notification
    if (user.is_verified_byadmin) {
      // zoho
      const zohoData = {
        Id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referral_code: user.referral_code,
        status: "verified",
        remark: req.body.remark || "", // Include the remark if provided
      };

      try {
        const zohoResponse = await axios.post(
          "https://www.zohoapis.com/crm/v2/functions/referral_accounts/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893",
          zohoData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Data successfully sent to Zoho:", zohoResponse.data);
      } catch (zohoError) {
        console.error("Error sending data to Zoho:", zohoError);
      }
      // Send WhatsApp notification for successful verification
      doubletick
        .outgoingMessagesWhatsappTemplate({
          messages: [
            {
              from: "+971502600101", // Your registered WhatsApp number
              to: user.phone, // The user's phone number
              content: {
                templateName: "user_verification_success_admin_v2", // Template name
                language: "en", // Language code
                templateData: {
                  header: { type: "TEXT", placeholder: user.first_name }, // Dynamic header content
                  body: { placeholders: [user.first_name, user.referral_code] }, // Body content with name and referral code
                },
              },
            },
          ],
        })
        .then(({ data }) => {
          console.log("WhatsApp notification sent:", data);
        })
        .catch((err) => {
          console.error("Error sending WhatsApp notification:", err);
        });

      // Send email for successful verification
      await emailService.send({
        to: user.email,
        subject:
          "Congrats you are now onboarded as a B2B partner with Maha Balloons Adventures",
        text: `Congratulations !!

        ${user.first_name}, you are now successfully registered as a B2B Partner with Maha Balloon Adventures.

        We have checked all of your submitted documents and completed the onboarding process. Our B2B Customer Success manager will call you to finalize the next steps. Till then, please find our B2B Brochure attached for your reference.

        Your referral code is: ${user.referral_code}

        If you have any questions, please feel free to call us on 056 687 6264 or email us at sales.executives3@mahab.net cc: fly@mahab.net or WhatsApp us at +971 56 687 6264.

        Looking forward to working with you!

        Warm Regards,

        Maha Balloon Adventures`,
        attachments: [
          {
            filename: "B2B_Brochure.pdf",
            path: "./path-to-brochure/B2B_Brochure.pdf", // Path to the brochure
          },
        ],
      });
      // user credtinals
      const userWithCredentials = await User.findOne({
        where: { id },
        attributes: ["email", "password"], // Only fetch email and password
      });

      if (userWithCredentials) {
        const tempPassword = crypto.randomBytes(4).toString("hex"); // Simple temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        user.password = hashedPassword;
        await user.save();
        const { email } = userWithCredentials;

        // Send WhatsApp notification with email and password
        doubletick
          .outgoingMessagesWhatsappTemplate({
            messages: [
              {
                from: "+971502600101",
                to: user.phone,
                content: {
                  templateName: "user_credentials_template", // Replace with actual template name for credentials
                  language: "en",
                  templateData: {
                    header: { type: "TEXT", placeholder: "Your Credentials" },
                    body: { placeholders: [email, tempPassword] }, // Include email and password
                  },
                },
              },
            ],
          })
          .then(({ data }) => {
            console.log("WhatsApp credentials notification sent:", data);
          })
          .catch((err) => {
            console.error(
              "Error sending WhatsApp credentials notification:",
              err
            );
          });

        // Send email with credentials
        await emailService.send({
          to: email,
          subject: "Your Account Credentials",
          text: `Dear ${user.first_name},

          Congratulations on your successful verification!

          Here are your account credentials:

          Email: ${email}
          Password: ${tempPassword} (Please ensure you change this password after logging in for the first time)

          If you have any questions, feel free to reach out to us.

          Best regards,

          Maha Balloon Adventures`,
        });
      } else {
        console.error("User credentials not found in the database");
      }
    }

    // If the user is rejected, send WhatsApp and email notification
    if (req.body.is_verified_byadmin === false) {
      // Send WhatsApp notification for rejection with remark
      doubletick
        .outgoingMessagesWhatsappTemplate({
          messages: [
            {
              from: "+971502600101", // Your registered WhatsApp number
              to: user.phone, // The user's phone number
              content: {
                templateName: "user_rejection_template_v2", // Template name for rejection
                language: "en", // Language code
                templateData: {
                  header: { type: "TEXT", placeholder: user.first_name }, // Dynamic header content
                  body: { placeholders: [user.first_name, user.remark] }, // Include rejection remark in the body
                },
              },
            },
          ],
        })
        .then(({ data }) => {
          console.log("WhatsApp rejection notification sent:", data);
        })
        .catch((err) => {
          console.error("Error sending WhatsApp rejection notification:", err);
        });

      // Send rejection email with remark
      await emailService.send({
        to: user.email,
        subject: "B2B Partnership Application - Rejection Notice",
        text: `Dear ${user.first_name},

        We hope this message finds you well.

        After carefully reviewing your application, we regret to inform you that your request to join Maha Balloon Adventures as a B2B Partner has been declined.

        Reason for Rejection: ${remark}

        If you would like more information or have any further questions, feel free to reach out to us on WhatsApp at +971 56 687 6264 or via email at sales.executives3@mahab.net cc: fly@mahab.net.

        We appreciate your interest in working with us, and we wish you all the best in your future endeavors.

        Best regards,

        Maha Balloon Adventures`,
      });
    }

    // Send response back to the client
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};

const getContentType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "pdf":
      return "application/pdf";
    // Add more cases as needed
    default:
      return "application/octet-stream"; // Fallback type
  }
};

// exports.uploadIDs = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     let files = req.files;

//     console.log("Received files:", files);

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     let fileUploadPromises = [];
//     const folderName = 'uploads'; // All files will go into the 'uploads' folder

//     // Handle file uploads for B2B-company or B2B-Individual
//     if (user.role === "B2B-company" || user.role === "B2B-Individual") {
//       console.log("Processing files for B2B-company or B2B-Individual...");

//       if (files.trade_license && files.trade_license.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.trade_license[0].buffer, `${folderName}/trade_license_${userId}.jpg`, getContentType('trade_license.jpg'))
//             .then((url) => user.trade_license = url)
//             .catch((error) => console.error("Failed to upload trade license:", error))
//         );
//       }

//       if (files.trn_certificate && files.trn_certificate.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.trn_certificate[0].buffer, `${folderName}/trn_certificate_${userId}.jpg`, getContentType('trn_certificate.jpg'))
//             .then((url) => user.trn_certificate = url)
//             .catch((error) => console.error("Failed to upload TRN certificate:", error))
//         );
//       }

//       if (files.passport_id && files.passport_id.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.passport_id[0].buffer, `${folderName}/passport_id_${userId}.jpg`, getContentType('passport_id.jpg'))
//             .then((url) => user.passport_id = url)
//             .catch((error) => console.error("Failed to upload passport ID:", error))
//         );
//       }

//       if (files.visa_copy && files.visa_copy.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.visa_copy[0].buffer, `${folderName}/visa_copy_${userId}.jpg`, getContentType('visa_copy.jpg'))
//             .then((url) => user.visa_copy = url)
//             .catch((error) => console.error("Failed to upload visa copy:", error))
//         );
//       }

//       if (files.emt_id && files.emt_id.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.emt_id[0].buffer, `${folderName}/emt_id_${userId}.jpg`, getContentType('emt_id.jpg'))
//             .then((url) => user.emt_id = url)
//             .catch((error) => console.error("Failed to upload Emirates ID:", error))
//         );
//       }
//     }

//     // Handle file uploads for B2B-influencer
//     if (user.role === "B2B-Influencer") {
//       console.log("Processing files for B2B-Influencer...");

//       if (files.passport_id && files.passport_id.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.passport_id[0].buffer, `${folderName}/passport_id_${userId}.jpg`, getContentType('passport_id.jpg'))
//             .then((url) => user.passport_id = url)
//             .catch((error) => console.error("Failed to upload passport ID for influencer:", error))
//         );
//       }

//       if (files.emt_id && files.emt_id.length > 0) {
//         fileUploadPromises.push(
//           uploadFileToS3(files.emt_id[0].buffer, `${folderName}/emt_id_${userId}.jpg`, getContentType('emt_id.jpg'))
//             .then((url) => user.emt_id = url)
//             .catch((error) => console.error("Failed to upload Emirates ID for influencer:", error))
//         );
//       }
//     }

//     // Wait for all uploads to complete
//     await Promise.all(fileUploadPromises);

//     // Save the user with the uploaded URLs
//     await user.save();

//     // Return the user with updated URLs in the response
//     res.status(200).json({ message: "Files uploaded successfully", user });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ error: "Failed to upload files" });
//   }
// };
// const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

// exports.uploadIDs = async (req, res) => {
//   try {
//     const { userId, emt_id, passport_id, trade_license, trn_certificate, owner_passport, visa_copy } = req.body;

//     // Find the user by primary key (userId)
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Update user fields with the received data
//     user.emt_id = emt_id || user.emt_id; // Only update if provided, otherwise retain old value
//     user.passport_id = passport_id || user.passport_id;
//     user.trade_license = trade_license || user.trade_license;
//     user.trn_certificate = trn_certificate || user.trn_certificate;
//     user.owner_passport = owner_passport || user.owner_passport;
//     user.visa_copy = visa_copy || user.visa_copy;

//     // Save the updated user data
//     await user.save();
//     console.log(user,'----user');
//     const zohoResponse = await axios.post(
//      'https://www.zohoapis.com/crm/v2/functions/documents_attached_contacts/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893',
//       user,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // await axios.post()
//     // Respond with the updated user data
//     res.status(200).json({ message: "Documents uploaded successfully", user,zohoResponse: zohoResponse.data,
//     });

//   } catch (error) {
//     console.error(error); // Log the error
//     res.status(500).json({ error: "Error uploading files", details: error.message });
//   }
// };

exports.uploadIDs = async (req, res) => {
  try {
    const {
      userId,
      emt_id,
      passport_id,
      trade_license,
      trn_certificate,
      owner_passport,
      visa_copy,
    } = req.body;

    // Find the user by primary key (userId)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields with the received data, retaining old values if not provided
    user.emt_id = emt_id || user.emt_id;
    user.passport_id = passport_id || user.passport_id;
    user.trade_license = trade_license || user.trade_license;
    user.trn_certificate = trn_certificate || user.trn_certificate;
    user.owner_passport = owner_passport || user.owner_passport;
    user.visa_copy = visa_copy || user.visa_copy;

    // Save the updated user data
    await user.save();
    console.log("-------user", user.phone, "----user");

    // send message to doubletick
    await doubletick
      .outgoingMessagesWhatsappTemplate({
        messages: [
          {
            from: "+971502600101",
            to: user.phone,
            content: {
              templateName: "document_received_verification", // Adjust the template name for Customer
              language: "en",
              templateData: {
                header: { type: "TEXT", placeholder: user.first_name },
                body: { placeholders: [user.first_name] },
              },
            },
          },
        ],
      })
      .then(({ data }) => {
        console.log("WhatsApp notification sent to customer:", data);
      })
      .catch((err) => {
        console.error("Error sending WhatsApp notification to customer:", err);
      });

    // Prepare payload for Zoho API
    const zohoPayload = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emt_id: user.emt_id,
      passport_id: user.passport_id,
      trade_license: user.trade_license,
      trn_certificate: user.trn_certificate,
      owner_passport: user.owner_passport,
      visa_copy: user.visa_copy,
    };

    console.log(zohoPayload, "----zoho");
    // Send data to Zoho CRM using API
    const zohoResponse = await axios.post(
      `https://www.zohoapis.com/crm/v2/functions/documents_attached/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`,
      user,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Respond with the updated user data and Zoho response
    res.status(200).json({
      message: "Documents uploaded successfully",
      zohoResponse: zohoResponse.data,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error uploading files", details: error.message });
  }
};

// forget password

exports.forgotPassword = async (req, res) => {
  try {
    const { emailOrPhone } = req.body; // Get user email or phone from request body

    // Find the user by email or phone
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset token (valid for 5 minutes)
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry (in milliseconds)

    // Save the reset token and expiry to the user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    // resetlink
    const resetLink = `https://maha-balloons.prismcloudhosting.com/?generate=password&token=${resetToken}`;

    // Send WhatsApp notification with reset token/link
    doubletick
      .outgoingMessagesWhatsappTemplate({
        messages: [
          {
            from: "+971502600101", // Your registered WhatsApp number
            to: user.phone, // The user's phone number
            content: {
              templateName: "user_reset_password_v2", // Template name for reset password
              language: "en", // Language code
              templateData: {
                header: { type: "TEXT", placeholder: user.first_name }, // Dynamic header content
                body: { placeholders: [user.first_name, resetLink] }, // Body content with name and reset token
              },
            },
          },
        ],
      })
      .then(({ data }) => {
        console.log("WhatsApp reset notification sent:", data);
      })
      .catch((err) => {
        console.error("Error sending WhatsApp reset notification:", err);
      });

    // Send email notification with reset token/link
    await emailService.send({
      to: user.email,
      subject: "Reset Your Password for Maha Balloon Adventures",
      text: `Dear ${user.first_name},

      We received a request to reset your password for Maha Balloon Adventures.

      Your password reset code is: ${resetLink}

      This code is valid for 5 minutes. If you did not request this reset, please ignore this message.

      If you have any questions, please contact us on WhatsApp at +971 56 687 6264 or email at sales.executives3@mahab.net.

      Warm Regards,
      Maha Balloon Adventures`,
    });

    // Send response back to the client
    res.status(200).json({
      message: "Password reset instructions sent to your email and WhatsApp",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error initiating password reset" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token and check if it is not expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }, // Token should be valid
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update the user's password (hashing should be done here)
    user.password = newPassword;
    user.resetPasswordToken = null; // Clear reset token
    user.resetPasswordExpires = null; // Clear token expiry
    await user.save();

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error resetting password" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, currentPassword } = req.body; // Receive current password and new password from request

    // Find the user by their ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password matches the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    // Hash the new password before saving
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Password has been successfully updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating password" });
  }
};

exports.registergiftCustomer = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      country_of_residence,
      password,
    } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      country_of_residence,
      password: hashedPassword,
      role: "customer",
      gifted: true,
    });

    res.json({ user: user });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "Error updating password" });
  }
};
