# Street Cat Clinic App 🐾

A comprehensive web application designed to streamline operations for the Street Cat Clinic by managing trapper and cat data, automating MDAS TIP form generation, and replacing inefficient Google Sheets workflows with a scalable Firebase-backed platform.

---

## 🚀 Project Overview

The Street Cat Clinic App is built to support the efforts of clinics and volunteers participating in the **TNVR (Trap-Neuter-Vaccinate-Return)** program in Miami-Dade. The application offers an intuitive, centralized interface for managing records, and qualifying TIP submissions. By automating manual processes, it saves staff time, ensures data consistency, and reduces entry errors.

---

## 🧩 Key Features

- **Centralized Data Management**  
  Track trappers, cats, intake details, and services in one place.

- **Automated PDF Generation**  
  Dynamically generate pre-filled MDAS TIP PDFs for cats eligible under the TIP program.

- **Role-Based Authentication**  
  Firebase Auth with access control for admins, volunteers, and staff.

- **Filtering & Sorting Tools**  
  Search and filter records by trapper, date, eligibility, and more.

- **Scalable & Responsive UI**  
  Built mobile-first for on-the-go use by field trappers, with full desktop support.

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Storage, Hosting)
- **PDF Engine:** @react-pdf/renderer library
- **Version Control:** GitHub

---

## 📄 TIP Form Automation

Each qualifying cat record will generate a filled-out PDF matching the official MDAS TIP Form. PDFs are auto-saved to Firebase Storage upon submission, provided the record is complete and marked `qualifiesForTIP === true`.

Custom validation requires the following fields fields:

- Trapper details
- Animal ID, Sex, Approx. Age, Color, and Pickup/Intake Dates
- Crossing location & ZIP
- Signature block (TIP Coordinator auto-filled)

---

## 👥 Roles & Permissions

| Role  | Permissions                                       |
| ----- | ------------------------------------------------- |
| Admin | Full CRUD access, PDF generation, user management |
| Staff | Limited CRUD, PDF generation                      |

---

## 🐛 Reporting Issues

Use [GitHub Issues](https://github.com/your-repo/issues) to report bugs or request features.  
Please include relevant context, screenshots, or console output when possible.

---

## 🫶 Acknowledgements

This project is made possible by the dedicated volunteers and staff at Street Cat Clinic and Miami-Dade Animal Services.  
Special thanks to the sponsors for helping fund the project and making this tool a reality.
