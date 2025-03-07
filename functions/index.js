const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const admin = require("firebase-admin");

// Ensure admin is initialized only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Create a new user in Firebase Auth and Firestore
exports.createNewUser = onCall(async (request) => {
  // Destructure data and auth from the request
  const { data, auth } = request;

  // Verbose logging
  logger.info("Request Context:", {
    auth: auth
      ? {
          uid: auth.uid,
          token: Object.keys(auth.token || {}),
        }
      : "No auth",
    dataKeys: Object.keys(data),
  });

  try {
    let uid = null;

    // First, try to use auth from the request
    if (auth) {
      uid = auth.uid;
      logger.info("Authenticated via request.auth:", uid);
    }

    // If no uid, try to verify the ID token passed in data
    if (!uid && data.idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(data.idToken);
        uid = decodedToken.uid;
        logger.info("Authenticated via ID Token:", uid);
      } catch (tokenError) {
        logger.error("Token Verification Error:", tokenError);
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
    }

    // Mandatory authentication check
    if (!uid) {
      logger.error("No valid authentication method found");
      throw new HttpsError("unauthenticated", "No valid authentication method");
    }

    // Fetch authenticating user's details
    const authenticatingUserRef = admin
      .firestore()
      .collection("users")
      .doc(uid);
    const authenticatingUserSnap = await authenticatingUserRef.get();

    if (!authenticatingUserSnap.exists) {
      logger.error("Authenticating user not found in Firestore:", uid);
      throw new HttpsError(
        "not-found",
        "Authenticating user document not found"
      );
    }

    const authenticatingUserData = authenticatingUserSnap.data();
    logger.info("Authenticating User Role:", authenticatingUserData.role);

    // Admin permission check
    if (authenticatingUserData.role !== "admin") {
      logger.error("Permission denied: User is not an admin");
      throw new HttpsError(
        "permission-denied",
        "Must be an admin to create users"
      );
    }

    // Validate input data
    const { email, firstName, lastName, role, title } = data;
    if (!email || !firstName || !lastName || !role) {
      logger.error("Missing required fields:", {
        email,
        firstName,
        lastName,
        role,
      });
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    // User creation
    const userRecord = await admin.auth().createUser({
      email,
      password: "SCCPassword",
      displayName: `${firstName} ${lastName}`,
      disabled: false,
    });

    logger.info("User successfully created:", userRecord.uid);

    // Firestore user document creation
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        firstName,
        lastName,
        role,
        title: title || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    logger.info("User Firestore document created successfully");

    // Return result
    return {
      message: "User created successfully",
      uid: userRecord.uid,
    };
  } catch (error) {
    logger.error("Function Execution Error:", error);
    throw new HttpsError("internal", "User creation failed", error.message);
  }
});

// Delete a user from Firebase Auth and Firestore
exports.deleteFirebaseUser = onCall(async (request) => {
  const { data, auth } = request;

  // Verify that the caller is authenticated
  if (!auth) {
    logger.error("Unauthenticated call to deleteFirebaseUser");
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  // Get the caller's user record to check their role
  const callerUid = auth.uid;
  const callerDoc = await admin
    .firestore()
    .collection("users")
    .doc(callerUid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    logger.error("Permission denied: User is not an admin", { uid: callerUid });
    throw new HttpsError("permission-denied", "Only admins can delete users");
  }

  // Validate the UID to delete
  if (!data.uid) {
    logger.error("Missing user UID to delete");
    throw new HttpsError("invalid-argument", "Missing user UID to delete");
  }

  // Delete the user from Firebase Auth
  try {
    logger.info(`Attempting to delete user: ${data.uid}`);
    await admin.auth().deleteUser(data.uid);
    logger.info(`Successfully deleted user: ${data.uid}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error deleting user: ${data.uid}`, error);
    throw new HttpsError("internal", error.message);
  }
});
