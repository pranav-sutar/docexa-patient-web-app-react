import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, STAGING_BASE_URL, STAGING_V3_URL } from "../config/apis";
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
  // const [unBookedAllPatients, setUnBookedAllPatients] = useState<any>([]);
  const { unBookedAllPatients, setUnBookedAllPatients } = useCache();

  // const [appointments, setAppointments] = useState<any[]>([]);
  const { appointments, setAppointments } = useCache();
  const navigate = useNavigate();
  const bookedPatientIds = new Set(
    appointments.map((appt: any) => appt.patient_id)
  );

  // y ===== Functions -- (T)
  // g -- Get Clinic By ID and store data into Local Storage
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
            JSON.stringify(res.data.data?.user_map_id)
          );
          localStorage.setItem(
            "clinic_name",
            JSON.stringify(res.data.data?.clinic_name)
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

  // g -- Get Doctor Data on User Map ID
  function getAllDoctorData(user_map_id: any) {
    axios
      .post(`${API_BASE_URL}/patient-web/doctor_data_on_user_map_id`, {
        user_map_id: user_map_id,
      })
      .then((res) => {
        console.log("Doctor Data:", res.data);
        localStorage.setItem(
          "pharmaclient_id",
          JSON.stringify(res?.data?.data?.[0].pharmaclient_id)
        );
        getSKUDetails();
        // console.log("app id: ", res?.data.data?.[0]?.app_id);

        localStorage.setItem(
          "app_id",
          JSON.stringify(res?.data.data?.[0]?.app_id)
        );
      });
  }

  // g -- Toggle for In clinic or not
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
  //  g -- on GO load patient list and booked patients
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
  // g -- Get Booked Patients
async function getBookedPatient(mobile: any) {
  showLoader();

  try {
    const res: any = await axios.post(
      `${API_BASE_URL}/patient/dashboard/appointments`,
      {
        patient_id: 0,
        app_id: JSON.parse(localStorage.getItem("app_id") || "null"),
        mobile_no: mobile,
      }
    );

    console.log("Booked Patient Data:", res.data);

    if (res.data.code === 200) {
      const clinicId = Number(localStorage.getItem("clinic_id"));

      const filteredData = (res.data.data || []).filter(
        (item: any) => Number(item.clinic_id) === clinicId
      );

      setAppointments(filteredData);

      // 🔥 WAIT for patients also
      await getAllPatients(mobile, filteredData);

      if (res.data.message === "Data not found") {
        toast.error("No appointments found for this mobile number");
      }
    } else {
      toast.error("No appointments found");
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    hideLoader(); // ✅ now runs after BOTH APIs
  }
}

  // g -- Get All Patients
  async function getAllPatients(mobile: any, bookedAppointments: any[]) {
    try {
      const app_id = localStorage.getItem("app_id");
      const doctor_id = localStorage.getItem("doctor_id");
      const mobile_no = localStorage.getItem("mobile_no") || mobile;
      const user_map_id = localStorage.getItem("user_map_id");
      const config = {
        headers: {
          "app-id": app_id,
          "doctor-id": doctor_id,
          "mobile-no": mobile_no,
          "created-by-doctor": user_map_id,
        },
      };
      axios
        .get(`${API_BASE_URL}/patient/dashboard/patients`, config)
        .then((res) => {
          console.log("patients: ", res.data);
          const patients = res?.data?.patients || [];
          const bookedIds = new Set(
            bookedAppointments.map((appt: any) => Number(appt.patient_id))
          );
          const filteredPatients = patients.filter(
            (patient: any) => !bookedIds.has(Number(patient.patient_id))
          );

          setUnBookedAllPatients(filteredPatients);
        });
    } catch (e: any) {
      toast.error("something went wrong to get patient list.", e);
    }
  }
  // g -- Book Appointment and Check In
  async function bookAndCheckIn(item: any) {
    showLoader();
    console.log("data: ", item);
    const today = new Date().toISOString().split("T")[0];

    // instead creating new api for book, we have used walkIn appointment frm website --
    try {
      // get slots for respected clinic
      const slotsData = await getSlots();
      // g -- assign current slot from slots and pass to payload
      const currentSlot = getCurrentSlot(slotsData?.slot || []);
      console.log("Current Slot:", currentSlot);
      const payload = {
        age: getAge(item?.dob),
        clinic_id: localStorage.getItem("clinic_id"),
        email: item?.email_id ?? null,
        gender: item.gender,
        patient_mobile_no: item.mobile_no,
        patient_name: item.patient_name,
        payment_mode: "direct",
        schedule_date: today,
        schedule_remark: "",
        schedule_time: currentSlot,
        sku_id: localStorage.getItem("sku_id"),
        user_map_id: localStorage.getItem("user_map_id"),
        patient_id: item?.patient_id,
        vitals: [],
      };
      console.log("payload: ", payload);

      axios
        .post(STAGING_V3_URL + `/appointment/createForWalkIn`, payload)
        .then((res) => {
          console.log(res);
          if (res.data.status == "success" && res.status == 200) {
            const patient_data = {
              appt_id: res?.data?.data?.appointment_id,
            };
            DirectCheckInPatient(patient_data);
            // toast("SuccessFully Booked Appointment...");
          } else {
            toast.error("Something Went Wrong...");
          }
        });
      hideLoader();
    } catch (error) {
      console.error("error : ", error);
      hideLoader();
    }
  }

  // g -- Get SKU Details for perticular clinic
  function getSKUDetails() {
    console.log("calling function");

    const user_map_id = localStorage.getItem("user_map_id");
    try {
      axios
        .get(STAGING_V3_URL + `/establishments/users/${user_map_id}/skus`)
        .then((res) => {
          const clinic_id = localStorage.getItem("clinic_id");
          const data = res.data.data || [];
          const relatedSkus = data.filter(
            (item: any) => String(item.clinic_id) === String(clinic_id)
          );
          if (relatedSkus) {
            localStorage.setItem("sku_id", relatedSkus?.[0]?.id);
          }
        });
    } catch (e) {
      console.log("Error: ", e);
    }
  }

  // g -- Get slots for perticular clinic --
  async function getSlots() {
    try {
      const user_map_id = localStorage.getItem("user_map_id");
      const clinic_id = localStorage.getItem("clinic_id");

      if (!clinic_id || !user_map_id) {
        toast.error("something went wrong.");
        return null;
      }

      const res = await axios.get(
        `${STAGING_V3_URL}/establishments/users/${user_map_id}/bookingslots/${clinic_id}`
      );

      const data = res.data?.data || [];
      console.log("data : ", data);

      const filteredData = data.filter(
        (item: any) => item.day_id === getDayNumber()
      );

      return filteredData?.[0] ?? null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // g -- Direct CheckIn On Appointment Create --
  async function DirectCheckInPatient(item: any) {
    try {
      // showLoader();
      Swal.fire({
        title: "Checking in...",
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await axios.post(
        `${API_BASE_URL}/patient-web/check_in_patient`,
        {
          booking_id: item.appt_id,
          user_map_id: JSON.parse(
            localStorage.getItem("user_map_id") || "null"
          ),
        }
      );

      if (res.data.status) {
        // await LoadPatentList(); // ✅ now works properly
        const patient_mobile = localStorage.getItem("patient_mobile");
        if (!patient_mobile) {
          toast.error(
            "Please re-enter your mobile number to view appointment status!"
          );
          return;
        }
        if (patient_mobile) {
          // localStorage.setItem("patient_mobile", JSON.stringify(mobile));
          getBookedPatient(patient_mobile);
        }
        const queueData = await getQueAndNumber();

        const activeQueue = queueData.filter((q: any) => q.checked_in === 1);

        // find current patient
        const currentPatient = activeQueue.find(
          (q: any) => q.appt_id === item.appt_id
        );

        // index-based position
        const myIndex = activeQueue.findIndex(
          (q: any) => q.appt_id === item.appt_id
        );

        const myPosition = myIndex !== -1 ? myIndex + 1 : "N/A";
        const peopleAhead = myIndex !== -1 ? myIndex : 0;

        // 🔥 NEW ALERT INSTEAD OF TOAST

        const result = await Swal.fire({
          html: `
    <div style="text-align:center;">
      
      <h3 style="margin-bottom:10px;">Patient Checked In!</h3>

      <p style="margin-bottom:15px;">Your Waiting Number is:</p>

      <!-- BIG CIRCLE -->
      <div style="
        width:90px;
        height:90px;
        border-radius:50%;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        color:white;
        font-weight:bold;
        margin: 0 auto 15px auto;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      ">
        ${myPosition}
      </div>

      <div style="font-size:14px; color:#555; margin-bottom:10px;">
        🧾 Token Number: <b>${currentPatient?.queue_number}</b><br/>
        👥 People Ahead: <b>${peopleAhead}</b>
      </div>

      <p style="margin-top:10px;">Do you want to add vitals?</p>

    </div>
  `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Add Vitals",
          cancelButtonText: "Skip for now",
          buttonsStyling: false,
          customClass: {
            confirmButton: "bg-green-500 text-white px-4 py-2 rounded-lg mr-2",
            cancelButton: "bg-red-500 text-white px-4 py-2 rounded-lg",
          },
        });

        if (result.isConfirmed) {
          addVitals(item); // 👈 navigate to vitals page
        }
        if (result.dismiss) {
          return;
        }
      } else {
        hideLoader();
        toast.error(res.data.message || "Check-in failed");
      }
    } catch (error) {
      console.error(error);
      hideLoader();

      toast.error("Something went wrong");
    } finally {
      console.log("hello");
    }
  }

  // o -- Helper Functions -- (T)

  function formatTime(time: string) {
    return time?.slice(0, 5); // 12:30:00 → 12:30
  }

  function getGender(gender: number) {
    return gender === 1 ? "Male" : "Female";
  }

  function getAge(dob: string): string {
    console.log("Date of Birth : ", dob);

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust if days are negative
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    // Adjust if months are negative
    if (months < 0) {
      years--;
      months += 12;
    }

    // 🎯 Return formatted result
    if (years > 0) {
      return `${years} Y`;
    } else if (months > 0) {
      return `${months} M`;
    } else {
      return `${days} D`;
    }
  }

  function getDayNumber(): number {
    const day = new Date().getDay();

    // Convert: Sunday(0) → 7, Monday(1) → 1, ..., Saturday(6) → 6
    return day === 0 ? 7 : day;
  }

  function getCurrentSlot(slots: string[]): string | null {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const time of slots) {
      const [hours, minutes] = time.split(":").map(Number);
      const slotMinutes = hours * 60 + minutes;

      if (slotMinutes >= currentMinutes) {
        return time; // ✅ first future slot
      }
    }

    return null; // ❌ no future slot available
  }

  // o -- Helper Functions -- (B)

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
      // showLoader();
      Swal.fire({
        title: "Checking in...",
        text: "Please wait",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await axios.post(
        `${API_BASE_URL}/patient-web/check_in_patient`,
        {
          booking_id: item.appt_id,
          user_map_id: JSON.parse(
            localStorage.getItem("user_map_id") || "null"
          ),
        }
      );

      if (res.data.status) {
        // await LoadPatentList(); // ✅ now works properly
        const patient_mobile = localStorage.getItem("patient_mobile");
        if (!patient_mobile) {
          toast.error(
            "Please re-enter your mobile number to view appointment status!"
          );
          return;
        }
        if (patient_mobile) {
          // localStorage.setItem("patient_mobile", JSON.stringify(mobile));
          getBookedPatient(patient_mobile);
        }
        const queueData = await getQueAndNumber();

        const activeQueue = queueData.filter((q: any) => q.checked_in === 1);

        // find current patient
        const currentPatient = activeQueue.find(
          (q: any) => q.appt_id === item.appt_id
        );

        // index-based position
        const myIndex = activeQueue.findIndex(
          (q: any) => q.appt_id === item.appt_id
        );

        const myPosition = myIndex !== -1 ? myIndex + 1 : "N/A";
        const peopleAhead = myIndex !== -1 ? myIndex : 0;

        // 🔥 NEW ALERT INSTEAD OF TOAST

        const result = await Swal.fire({
          html: `
    <div style="text-align:center;">
      
      <h3 style="margin-bottom:10px;">Patient Checked In!</h3>

      <p style="margin-bottom:15px;">Your Waiting Number is:</p>

      <!-- BIG CIRCLE -->
      <div style="
        width:90px;
        height:90px;
        border-radius:50%;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        color:white;
        font-weight:bold;
        margin: 0 auto 15px auto;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      ">
        ${myPosition}
      </div>

      <div style="font-size:14px; color:#555; margin-bottom:10px;">
        🧾 Token Number: <b>${currentPatient?.queue_number}</b><br/>
        👥 People Ahead: <b>${peopleAhead}</b>
      </div>

      <p style="margin-top:10px;">Do you want to add vitals?</p>

    </div>
  `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Add Vitals",
          cancelButtonText: "Skip for now",
          buttonsStyling: false,
          customClass: {
            confirmButton: "bg-green-500 text-white px-4 py-2 rounded-lg mr-2",
            cancelButton: "bg-red-500 text-white px-4 py-2 rounded-lg",
          },
        });

        if (result.isConfirmed) {
          addVitals(item); // 👈 navigate to vitals page
        }
        if (result.dismiss) {
          return;
        }
      } else {
        hideLoader();
        toast.error(res.data.message || "Check-in failed");
      }
    } catch (error) {
      console.error(error);
      hideLoader();

      toast.error("Something went wrong");
    } finally {
      console.log("hello");
    }
  }

  // @ -- Get Queue Number
  async function getQueAndNumber() {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/patient-web/patient-queue`,
        {
          clinic_id: JSON.parse(localStorage.getItem("clinic_id") || "null"),
        }
      );

      if (res.data.status) {
        return res.data.data; // ✅ return queue list
      } else {
        toast.error("Failed to fetch queue");
        return [];
      }
    } catch (error: any) {
      toast.error("Something went wrong", error);
      return [];
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

  // # -- Add Vitals -- (T)
  function addVitals(item: any) {
    console.log(item);

    navigate("/add-vitals", {
      state: {
        appointment_data: item,
      },
    });
  }
  // # -- Add Vitals -- (B)

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
                    <button
                      onClick={() => {
                        addVitals(item);
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Add Vitals
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ===========  Patient List ============ */}
          {unBookedAllPatients.length > 0 && (
            <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-4 mt-6 bg-[#acbcc1] mb-6">
              <h3 className="text-gray-600 font-bold mb-3 ">Patient List</h3>

              {unBookedAllPatients.map((item: any, index: any) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-xl p-3 mb-3 shadow-md bg-white cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {item.gender === 1 ? (
                          <img src={male_icon} alt="" />
                        ) : (
                          <img src={female_icon} alt="" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 capitalize">
                          {item.patient_name}
                        </h4>

                        <p className="text-sm text-gray-500">
                          {getGender(item.gender)} {item.age ? item.age : ""}
                        </p>

                        <p className="text-xs text-gray-400">
                          {item.mobile_no}
                        </p>
                      </div>
                    </div>

                    <button
                      className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                      onClick={() => bookAndCheckIn(item)}
                    >
                      Book Appt.
                    </button>
                  </div>
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
