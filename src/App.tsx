import { useEffect, useState } from "react";
import "./App.css";
import { API_BASE_URL } from "./config/apis";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import { useLoader } from "./context/LoaderContext";
import Loader from "./components/Loader";
import { QRCodeCanvas } from "qrcode.react";
function App() {
  // const { loading } = useLoader();
  const [selectedClinicId, setSelectedClinicId] = useState<number | "">("");
  const [clinicData, setClinicData] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAllClinics();
  }, []);

  function getAllClinics() {
    axios
      .get(`${API_BASE_URL}/patient-web/clinic_list`)
      .then((res) => {
        setClinicData(res.data.data || []);
      })
      .catch((err) => console.error(err));
  }

  function handleSelect(e: any) {
    const clinicId = Number(e.target.value);
    setSelectedClinicId(clinicId);

    const clinic = clinicData.find((c) => c.id === clinicId);
    setSelectedClinic(clinic);
  }

  function handleViewSite() {
    if (selectedClinic) {
      navigate(`/mainpage/${selectedClinic.id}`);
    }
  }
  const qrUrl = selectedClinicId
    ? `http://192.168.1.87:3000/mainpage/${selectedClinicId}`
    : "";

  return (
    <div className="app">
      {/* {loading && <Loader />} */}
      <Toaster position="top-right" />
      <div className="container">
        <h1 className="title">Patient Portal</h1>

        {/* Dropdown */}
        <div className="field">
          <label>Select Clinic</label>
          <select value={selectedClinicId} onChange={handleSelect}>
            <option value="">-- Select Clinic --</option>
            {clinicData.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.clinic_name}
              </option>
            ))}
          </select>
        </div>

        {/* Clinic Card */}
        {selectedClinic && (
          <div className="card">
            {/* Image (optional) */}
            {selectedClinic.clinic_images && (
              <img
                src={selectedClinic.clinic_images.split(",")[0]}
                alt="clinic"
                className="clinic-img"
              />
            )}

            <h2>{selectedClinic.clinic_name}</h2>

            <div className="info">
              <p>
                <b>📍 Address:</b> {selectedClinic.address}
              </p>
              <p>
                <b>🏙 City:</b> {selectedClinic.city}
              </p>
              <p>
                <b>📮 Pincode:</b> {selectedClinic.pincode}
              </p>
              <p>
                <b>🌐 Website:</b> {selectedClinic.website || "N/A"}
              </p>
              {/* show RQ here */}
              {qrUrl && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Scan to access clinic
                  </p>

                  <QRCodeCanvas value={qrUrl} size={180} />

                  <p className="text-xs mt-2 text-gray-500 break-all">
                    {qrUrl}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          className="btn"
          disabled={!selectedClinic}
          onClick={handleViewSite}
        >
          View Site
        </button>
      </div>
    </div>
  );
}

export default App;
