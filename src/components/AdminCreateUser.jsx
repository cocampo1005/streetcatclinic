import { useState } from "react";
import { auth, db } from "../firebase"; // Firebase SDK
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AdminCreateUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("trapper"); // Default role
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      // Ensure the current user is an admin
      const currentUser = auth.currentUser;
      const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
        setError("Only admins can create users.");
        return;
      }

      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Step 2: Store user info in Firestore
      await setDoc(doc(db, "users", userId), { email, role });

      setSuccess(`User ${email} (${role}) created successfully!`);
      setEmail("");
      setPassword("");
      setRole("trapper");
    } catch (err) {
      setError("Error creating user: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-center mb-4">
        Create New User
      </h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleCreateUser} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="trapper">Trapper</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-primaryGreen text-white py-2 rounded-lg"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default AdminCreateUser;
