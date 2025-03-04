import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-config";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import ConfirmationModal from "../components/ConfirmationModal";
import AccountModal from "../components/AccountModal";
import { useAuth } from "../contexts/AuthContext";
import { DeleteIcon, EditIcon, Plus } from "../components/svgs/Icons";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function AccountsPage() {
  const { user: currentUser } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accountList, setAccountList] = useState([]);
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch users from Firestore
  const fetchAccounts = async () => {
    const accountsCollection = collection(db, "users");
    const accountsSnapshot = await getDocs(accountsCollection);
    const accountsList = accountsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAccountList(accountsList);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const selectedAccountDetails = accountList.find(
    (acc) => acc.id === selectedAccountId
  );

  const handleAccountClick = (accountId) => {
    setSelectedAccountId((prevId) => (prevId === accountId ? null : accountId));
  };

  // Opens the modal for adding a new user
  const handleAdd = () => {
    setSelectedAccount(null); // Ensure we're adding a new user, not editing
    setAccountModalOpen(true);
  };

  // Opens the modal for editing an existing user
  const handleEdit = (account) => {
    setSelectedAccount(account);
    setAccountModalOpen(true);
  };

  // Saves a new user or updates an existing one
  const handleSaveAccount = async (accountData) => {
    console.log("handleSaveAccount called with:", accountData);

    // Ensure user is logged in
    if (!auth.currentUser) {
      console.error("User is not authenticated. Cannot create a new user.");
      alert("Authentication error. Please log in again.");
      return;
    }

    console.log("Authenticated User UID:", auth.currentUser.uid);

    if (selectedAccount) {
      // Editing an existing user
      const userRef = doc(db, "users", selectedAccount.id);
      try {
        console.log("Updating existing user:", selectedAccount.id);
        await updateDoc(userRef, accountData);
        fetchAccounts();
      } catch (error) {
        console.error("Error updating account:", error);
        alert("Failed to update account. See console for details.");
      }
    } else {
      // Creating a new user
      try {
        const functions = getFunctions();
        const createNewUser = httpsCallable(functions, "createNewUser");
        // ✅ Explicitly ensure auth context is available
        console.log("Calling function as user:", currentUser.uid);
        const idToken = await auth.currentUser.getIdToken();
        console.log("✅ ID Token:", idToken);

        // ✅ Include the token in the request data
        const result = await createNewUser({
          ...accountData,
          idToken, // Manually pass token
        });

        console.log("User created:", result.data);
        fetchAccounts();
      } catch (error) {
        console.error("Error creating user:", error);
        alert("Failed to create user. See console for details.");
      }
    }

    setAccountModalOpen(false);
  };

  // Deletes an account from Firestore and Firebase Auth
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", selectedAccountDetails.id));
      const firebaseUser = auth.currentUser;
      if (firebaseUser && firebaseUser.uid === selectedAccountDetails.uid) {
        await deleteUser(firebaseUser);
      }
      fetchAccounts();
      setSelectedAccountId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setDeleteModalOpen(false);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return <p className="text-red-500">Access Denied: Admins Only</p>;
  }

  return (
    <>
      <header className="w-full flex justify-between border-b-2 border-tertiaryGray p-8">
        <h1 className="font-accent font-bold text-4xl">Accounts</h1>
        <button
          onClick={handleAdd}
          className="flex gap-2 bg-primaryGreen hover:bg-secondaryGreen text-primaryWhite py-2 px-4 rounded-lg"
        >
          <Plus />
          <span>Add Account</span>
        </button>
      </header>

      {/* Account Modal for Adding and Editing */}
      {isAccountModalOpen && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onSave={handleSaveAccount}
          initialData={selectedAccount} // Null for new, existing data for editing
        />
      )}

      {/* Confirmation Modal for Deleting */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Account"
          message={
            <>
              <p>
                Are you sure you want to delete this account? This action cannot
                be undone.
              </p>
              <p className="pl-4 py-2">
                <strong>{selectedAccountDetails?.email}</strong>
              </p>
            </>
          }
        />
      )}

      <section className="p-8 max-h-screen flex flex-col gap-8">
        {selectedAccountDetails && (
          <article className="rounded-xl flex justify-between flex-shrink-0 gap-8 px-8 p-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {selectedAccountDetails.firstName}{" "}
                {selectedAccountDetails.lastName}
              </h2>
              <p>
                <strong>Email:</strong> {selectedAccountDetails.email}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                {selectedAccountDetails.role.charAt(0).toUpperCase() +
                  selectedAccountDetails.role.slice(1)}
              </p>
              <p>
                <strong>Title:</strong> {selectedAccountDetails.title}
              </p>
            </div>

            <div className="flex flex-col justify-between items-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-secondaryGray hover:text-errorRed"
              >
                <DeleteIcon />
              </button>
              <button
                onClick={() => handleEdit(selectedAccountDetails)}
                className="text-secondaryGray hover:text-primaryGreen"
              >
                <EditIcon />
              </button>
            </div>
          </article>
        )}

        <div
          className={`w-full overflow-x-auto overflow-y-auto flex-grow ${
            selectedAccountDetails
              ? "max-h-[calc(100vh-355px)]"
              : "max-h-[calc(100vh-170px)]"
          }`}
        >
          <table className="w-full min-w-full divide-y divide-secondaryGray rounded-xl">
            <thead className="sticky top-0 z-10 bg-tertiaryGray rounded-xl border-b border-primaryWhite">
              <tr>
                <th className="px-6 py-3 text-left rounded-tl-xl rounded-bl-xl">
                  Email
                </th>
                <th className="px-6 py-3 text-left">First Name</th>
                <th className="px-6 py-3 text-left">Last Name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Title</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300 overflow-y-auto max-h-[calc(100vh-350px)]">
              {accountList?.map((account) => (
                <tr
                  key={account.id}
                  className={`group hover:bg-gray-50 ${
                    selectedAccountId === account.id ? "bg-tertiaryGreen" : ""
                  }`}
                  onClick={() => handleAccountClick(account.id)}
                >
                  <td className="px-6 py-4">{account.email}</td>
                  <td className="px-6 py-4">{account.firstName}</td>
                  <td className="px-6 py-4">{account.lastName}</td>
                  <td className="px-6 py-4">{account.role}</td>
                  <td className="px-6 py-4">{account.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
