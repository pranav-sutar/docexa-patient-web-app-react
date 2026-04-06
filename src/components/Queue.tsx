import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, STAGING_BASE_URL } from "../config/apis";
import { Button, Input, Switch, TextField } from "@mui/material";
import phone_icon from "../assets/icons/phone_icon.png";
import doctors_team_image from "../assets/pngs/doctors_team_icon.png";
import Footer from "./Footer";
import toast, { Toaster } from "react-hot-toast";
import { useLoader } from "../context/LoaderContext";
import Loader from "./Loader";
import male_icon from "../assets/icons/gender/male.png";
import female_icon from "../assets/icons/gender/female.png";
import Swal from "sweetalert2";

function Queue() {
  const { id } = useParams();
  const [clinicData, setClinicData] = useState<any>(null);
  const [isPatientInClinic, setIsPatientInClinic] = useState(false);
  const [mobile, setMobile] = useState("");
  const { loading } = useLoader();
  // const { showLoader, hideLoader } = useLoader();
  const [appointments, setAppointments] = useState<any[]>([]);
  // y ===== Functions -- (T)

  // % -- Get Patient Queue -- (T)
  function getCurrentQueue() {
    axios
      .post(`${API_BASE_URL}/patient-web/patient-queue`, {
        clinic_id: JSON.parse(localStorage.getItem("clinic_id") || "null"),
      })
      .then((res) => {
        console.log("Queue Data:", res.data);
      });
  }
  // % -- Get Patient Queue -- (B)

  // y ===== Functions -- (B)

  useEffect(() => {
    console.log("Clinic ID:", id);
  }, [id]);

  return (
    <>
      {loading && <Loader />}
      <div className="outer-container flex flex-col">
        <Toaster />
        <div className="min-h-[90vh] bg-gray-100  flex flex-col items-center">
          {/* HEADER */}
          <div className="w-full bg-blue-200 rounded-b-[60px] pt-10 p-6 text-center relative">
            <span className="text-gray-600">Welcome to</span>
            <h2 className="text-3xl font-bold text-gray-800">
              {clinicData?.clinic_name || "Clinic"}
            </h2>
          </div>
        </div>
        <Footer clinicData={clinicData} />
      </div>
    </>
  );
}

export default Queue;
