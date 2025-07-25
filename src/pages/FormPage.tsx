import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase"; // ✅ make sure this path is correct!
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

interface FormData {
  id: string;
  tripName: string;
  destination: string;
  date: string;
  updatedAt: any;
}

const FormPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchForms(currentUser.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchForms = async (uid: string) => {
    const formsRef = collection(db, "users", uid, "forms");
    const q = query(formsRef, orderBy("updatedAt", "desc"), limit(5));
    const snapshot = await getDocs(q);

    const formsData: FormData[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));
    setForms(formsData);
  };

  const handleCreateForm = () => {
    if (forms.length >= 5) {
      alert("You can only create up to 5 forms.");
      return;
    }
    navigate("/");
  };

  const handleEditForm = (formName: string) => {
    navigate("/", { state: { formName } });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📄 Your Saved Forms</h2>

      <button
        onClick={handleCreateForm}
        className={`mb-4 px-4 py-2 rounded ${
          forms.length >= 5 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
        }`}
        disabled={forms.length >= 5}
      >
        {forms.length >= 5 ? "Limit Reached (5)" : "➕ Create New Form"}
      </button>

      {forms.length === 0 ? (
        <p>No forms found. Create one!</p>
      ) : (
        <ul>
          {forms.map((form) => (
            <li key={form.id} className="mb-3">
              <div className="flex items-center">
                <strong className="mr-2">{form.id}</strong>
                {form.tripName} → {form.destination} on {form.date}
                <button
                  className="ml-4 text-sm text-blue-600 underline"
                  onClick={() => handleEditForm(form.id)}
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormPage;
