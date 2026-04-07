import { useNavigate, useParams } from "react-router-dom";
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
import { useCache } from "../context/CacheContext";
import back_button from "../assets/icons/back-btn.png";
function Mainpage() {
  const { id } = useParams();
  const [clinicData, setClinicData] = useState<any>(null);
  const [isPatientInClinic, setIsPatientInClinic] = useState(false);
  const [mobile, setMobile] = useState("");
  const { loading } = useLoader();
  const { showLoader, hideLoader } = useLoader();

  // const [appointments, setAppointments] = useState<any[]>([]);
  const { appointments, setAppointments } = useCache();
  const navigate = useNavigate();
  // y ===== Functions -- (T)
  function getClinicById() {
    showLoader();
    axios
      .get(`${API_BASE_URL}/patient-web/clinic_by_id/${id}`)
      .then((res) => {
        console.log("Clinic Data:", res.data);
        if (res.data.status) {
          setClinicData(res.data.data || []);
          localStorage.setItem("clinic_id", JSON.stringify(res.data.data.id));
          localStorage.setItem(
            "user_map_id",
            JSON.stringify(res.data.data?.user_map_id),
          );
          localStorage.setItem(
            "clinic_name",
            JSON.stringify(res.data.data?.clinic_name),
          );
          getAllDoctorData(res.data.data?.user_map_id);
        } else {
          alert("Failed to fetch clinic data");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong while fetching clinic data");
      })
      .finally(() => {
        hideLoader();
      });
  }

  function getAllDoctorData(user_map_id: any) {
    axios
      .post(`${API_BASE_URL}/patient-web/doctor_data_on_user_map_id`, {
        user_map_id: user_map_id,
      })
      .then((res) => {
        console.log("Doctor Data:", res.data);
        localStorage.setItem(
          "pharmaclient_id",
          JSON.stringify(res?.data?.data?.[0].pharmaclient_id),
        );
        // console.log("app id: ", res?.data.data?.[0]?.app_id);

        localStorage.setItem(
          "app_id",
          JSON.stringify(res?.data.data?.[0]?.app_id),
        );
      });
  }

  function onToggleResponse(e: any) {
    console.log("Toggle State:", e.target.checked);
    setIsPatientInClinic(e.target.checked);
    if (isPatientInClinic === false) {
      toast("welcome, you can now check in appointment!", {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#393939",
          color: "#fff",
        },
      });
    } else if (isPatientInClinic === true) {
      toast("You have marked that you are not in clinic!", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#393939",
          color: "#fff",
        },
      });
    }
  }

  async function LoadPatentList() {
    if (mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (isPatientInClinic) {
      localStorage.setItem("patient_mobile", mobile);
      getBookedPatient(mobile);
    }
  }
  function getBookedPatient(mobile: any) {
    showLoader();

    axios
      .post(`${API_BASE_URL}/patient/dashboard/appointments`, {
        patient_id: 0,
        app_id: JSON.parse(localStorage.getItem("app_id") || "null"),
        mobile_no: mobile,
      })
      .then((res) => {
        console.log("Booked Patient Data:", res.data);

        if (res.data.code === 200) {
          setAppointments(res.data.data || []);
        } else {
          toast.error("No appointments found");
        }
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        hideLoader();
      });
  }

  function formatTime(time: string) {
    return time?.slice(0, 5); // 12:30:00 → 12:30
  }

  function getGender(gender: number) {
    return gender === 1 ? "Male" : "Female";
  }

  // @ -- Check In Patient -- (T)
  async function checkInPatient(item: any) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to check in this appointment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Check In",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      showLoader();
      const res = await axios.post(
        `${API_BASE_URL}/patient-web/check_in_patient`,
        {
          booking_id: item.appt_id,
          user_map_id: JSON.parse(
            localStorage.getItem("user_map_id") || "null",
          ),
        },
      );

      if (res.data.status) {
        // await LoadPatentList(); // ✅ now works properly
        const patient_mobile = localStorage.getItem("patient_mobile");
        if (!patient_mobile) {
          toast.error(
            "Please re-enter your mobile number to view appointment status!",
          );
          return;
        }
        if (patient_mobile) {
          // localStorage.setItem("patient_mobile", JSON.stringify(mobile));
          getBookedPatient(patient_mobile);
        }
        toast.success("Patient checked in successfully");
      } else {
        toast.error(res.data.message || "Check-in failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      hideLoader();
    }
  }
  // @ -- Check In Patient -- (B)

  // % -- Get Patient Queue -- (T)
  function getCurrentQueue() {
    // axios
    //   .post(`${API_BASE_URL}/patient-web/patient-queue`, {
    //     clinic_id: JSON.parse(localStorage.getItem("clinic_id") || "null"),
    //   })
    //   .then((res) => {
    //     console.log("Queue Data:", res.data);
    //   });
    // console.log("appointment on caches: ", appointments);

    navigate("/queue");
  }
  // % -- Get Patient Queue -- (B)

  // y ===== Functions -- (B)

  useEffect(() => {
    console.log("Clinic ID:", id);
    getClinicById();
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

          {/* CARD */}
          <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-5 mt-[40px]">
            {/* Toggle Row */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">You are in clinic ?</span>
              <div className="response">
                <span className="font-bold text-gray-500">
                  {isPatientInClinic ? "Yes" : "No"}
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
                  LoadPatentList();
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
                <button onClick={getCurrentQueue}>View Queue</button>
              </div>
            </div>
          </div>
          {appointments.length > 0 && (
            <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-4 mt-6 bg-[rgb(198_219_232)]">
              <h3 className="text-gray-600 font-bold mb-3 ">
                Booked Appointments
              </h3>

              {appointments.map((item: any, index: any) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-xl p-3 mb-3 shadow-md bg-white"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {item.gender === 1 ? (
                        <img src={male_icon} alt="" />
                      ) : (
                        <img src={female_icon} alt="" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {item.patient_name}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {getGender(item.gender)} | {item.age}
                      </p>

                      <p className="text-xs text-gray-400">
                        {item.date} • {formatTime(item.start_time)}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT BUTTON */}
                  {item.checked_in === 0 ? (
                    <button
                      onClick={() => {
                        checkInPatient(item);
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Check In
                    </button>
                  ) : (
                    <button className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium">
                      Checked In
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* IMAGE */}
          {appointments.length === 0 && (
            <div className="mt-10 flex justify-center">
              <img
                src={doctors_team_image}
                className="w-[70%] max-w-xs"
                alt="Doctors"
              />
            </div>
          )}
        </div>
        <Footer clinicData={clinicData} />
      </div>
    </>
  );
}

export default Mainpage;
