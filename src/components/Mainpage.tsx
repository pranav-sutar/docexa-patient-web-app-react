import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apis";
import { Button, Input, Switch, TextField } from "@mui/material";
import phone_icon from "../assets/icons/phone_icon.png";
import doctors_team_image from "../assets/pngs/doctors_team_icon.png";
import Footer from "./Footer";
function Mainpage() {
  const { id } = useParams();
  const [clinicData, setClinicData] = useState<any>(null);
  const [toggleStauts, setToggleStatus] = useState(false);
  const [mobile, setMobile] = useState("");
  // y ===== Functions -- (T)
  function getClinicById() {
    axios
      .get(`${API_BASE_URL}/patient-web/clinic_by_id/${id}`)
      .then((res) => {
        console.log("Clinic Data:", res.data);
        if (res.data.status) {
          setClinicData(res.data.data || []);
        } else {
          alert("Failed to fetch clinic data");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong while fetching clinic data");
      });
  }
  function onToggleResponse(e: any) {
    console.log("Toggle State:", e.target.checked);
    setToggleStatus(e.target.checked);
  }

  function goToNextPage() {
    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
  }

  // y ===== Functions -- (B)

  useEffect(() => {
    console.log("Clinic ID:", id);
    getClinicById();
  }, [id]);

  return (
    <>
      <div className="outer-container flex flex-col">
        <div className="min-h-[90vh] bg-gray-100  flex flex-col items-center">
          {/* HEADER */}
          <div className="w-full bg-blue-200 rounded-b-[60px] pt-10 p-6 text-center relative">
            <span className="text-gray-600">Welcome to</span>
            <h2 className="text-3xl font-bold text-gray-800">
              {clinicData?.clinic_name || "Clinic"}
            </h2>
          </div>

          {/* CARD */}
          <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-5 mt-[40px]">
            {/* Toggle Row */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">You are in clinic ?</span>
              <div className="response">
                <span className="font-bold text-gray-500">
                  {toggleStauts ? "Yes" : "No"}
                </span>
                <Switch onChange={onToggleResponse} />
              </div>
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-2">
              <img src={phone_icon} className="w-5 h-5" />

              <Input
                // variant="standard"
                placeholder="+91 Enter Mobile"
                fullWidth
                type="tel"
                value={mobile}
                inputProps={{
                  maxLength: "10",
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                  setMobile(value.slice(0, 10)); // max 10 digits
                }}
                disableUnderline
              />

              <Button
                variant="contained"
                sx={{
                  borderRadius: "20px",
                  background: "linear-gradient(to right, #34d399, #16a34a)",
                }}
                onClick={() => {
                  goToNextPage();
                }}
              >
                GO
              </Button>
            </div>

            {/* Queue */}
            <div className="que-div flex items-center justify-end">
              <div className="flex items-center justify-center gap-2 mt-5 text-blue-600 font-medium">
                <span className="bg-blue-500 text-white px-2 py-1 rounded">
                  Q
                </span>
                View Queue
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="mt-10 flex justify-center">
            <img
              src={doctors_team_image}
              className="w-[70%] max-w-xs"
              alt="Doctors"
            />
          </div>
        </div>
        <Footer clinicData={clinicData} />
      </div>
    </>
  );
}

export default Mainpage;
