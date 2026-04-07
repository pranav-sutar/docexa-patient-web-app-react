import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apis";
import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";
import { useLoader } from "../context/LoaderContext";
import Loader from "./Loader";
import consulting from "../assets/pngs/consulting.png";
import back_button from "../assets/icons/back-btn.png";
import { useNavigate } from "react-router-dom";

function Queue() {
  const [clinicName, setClinicName] = useState<any>(null);
  const [queueData, setQueueData] = useState<any[]>([]);
  const { loading } = useLoader();
  const { showLoader, hideLoader } = useLoader();
  const patientMobile = localStorage.getItem("patient_mobile");

  const navigate = useNavigate();

  const myPatients = queueData.filter(
    (item) => item.mobile_no === patientMobile,
  );
  // 🚀 Get Queue
  function getCurrentQueue(showInitialLoader = false) {
    if (showInitialLoader) showLoader(); // ✅ only first time

    axios
      .post(`${API_BASE_URL}/patient-web/patient-queue`, {
        clinic_id: JSON.parse(localStorage.getItem("clinic_id") || "null"),
      })
      .then((res) => {
        if (res.data.status) {
          setQueueData(res.data.data || []);
        } else {
          toast.error("Failed to fetch queue");
        }
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        if (showInitialLoader) hideLoader(); // ✅ stop loader
      });
  }

  useEffect(() => {
    setClinicName(JSON.parse(localStorage.getItem("clinic_name") || "null"));

    // ✅ First time → show loader
    getCurrentQueue(true);

    // 🔄 Background refresh → no loader
    const interval = setInterval(() => {
      getCurrentQueue(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🎯 Calculate position
  const currentIndex = queueData.findIndex(
    (item) => item.mobile_no === patientMobile,
  );

  const myPosition = currentIndex >= 0 ? currentIndex + 1 : null;
  const peopleAhead = currentIndex >= 0 ? currentIndex : 0;
  const total = queueData.length;

  const visibleQueue =
    queueData.length > 15 && currentIndex !== -1
      ? queueData.slice(Math.max(currentIndex - 3, 0), currentIndex + 4)
      : queueData;

  return (
    <>
      {loading && <Loader />}

      <div className="outer-container flex flex-col">
        <Toaster />

        <div className="min-h-[90vh] bg-gray-100 flex flex-col items-center">
          {/* HEADER */}
          <div className="w-full bg-blue-200 rounded-b-[60px] pt-10 p-6 text-center">
            <div className="backbtn ">
              <img
                src={back_button}
                onClick={() => {
                  navigate(-1);
                }}
                className="w-6"
                alt=""
              />
            </div>
            <span className="text-gray-600">Welcome to</span>
            <h2 className="text-3xl font-bold text-gray-800">
              {clinicName || "Clinic"}
            </h2>
          </div>
          {!loading && queueData.length === 0 && (
            <p className="mt-6 text-gray-500">No queue available</p>
          )}
          {/* 📊 QUEUE VISUAL */}
          <div className="flex flex-wrap justify-center gap-3 mt-6 w-[90%] max-w-md">
            {queueData.length != 0 && (
              <img
                src={consulting}
                className="w-[50px] h-[50px] align-center border-r-2 border-gray-300 pr-3"
                alt=""
              />
            )}

            {visibleQueue.map((item) => {
              const isMyPatient = item.mobile_no === patientMobile;

              const actualIndex = queueData.findIndex(
                (q) => q.appt_id === item.appt_id,
              );

              return (
                <div
                  key={item.appt_id}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold
        ${
          isMyPatient
            ? "bg-green-500 text-white scale-110"
            : actualIndex < currentIndex
              ? "bg-gray-400 text-white"
              : "bg-blue-200 text-black"
        }`}
                >
                  {item.queue_number}
                </div>
              );
            })}
          </div>

          {/* 🎯 POSITION CARD */}
          <div className="w-[90%] max-w-md mt-6 flex flex-col gap-3">
            {myPatients.length > 0 ? (
              myPatients.map((patient) => {
                const index = queueData.findIndex(
                  (q) => q.appt_id === patient.appt_id,
                );

                const position = index + 1;
                const ahead = index;

                return (
                  <div
                    key={patient.appt_id}
                    className="bg-white rounded-xl p-4 shadow text-center "
                    style={{ borderLeft: "0.3rem solid green" }}
                  >
                    <h3 className="font-semibold text-gray-700 capitalize">
                      {patient.patient_name}
                    </h3>

                    <p className="text-2xl font-bold text-green-600 mt-1">
                      #{position}
                    </p>

                    <p className="text-sm text-gray-500">
                      {ahead} people ahead
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-4 shadow text-center">
                <p className="text-gray-500">You are not in queue</p>
              </div>
            )}
          </div>

          {/* OPTIONAL INFO */}
          <p className="text-sm text-gray-500 mt-4">Total Patients: {total}</p>
        </div>

        <Footer clinicData={clinicName} />
      </div>
    </>
  );
}

export default Queue;
