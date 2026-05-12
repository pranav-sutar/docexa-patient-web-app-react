import React, { useEffect } from "react";
import docexa_logo from "../assets/pngs/docexa-logo.png"; // adjust path if needed
import { useCache } from "../context/CacheContext";
type FooterProps = {
  clinicData: any;
};

import male_icon from "../assets/icons/gender/male.png";
import female_icon from "../assets/icons/gender/female.png";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL, LOCAL_HOST_URL } from "../config/apis";
export default function DoctorSideApiTest() {
      const { appointments, setAppointments } = useCache();
      
  function formatTime(time: string) {
    return time?.slice(0, 5); // 12:30:00 → 12:30
  }

  function getGender(gender: number) {
    return gender === 1 ? "Male" : "Female";
  }
  useEffect(()=>{

    getBookedPatient(localStorage.getItem('patient_mobile'));
  },[]);

  function donePrescrion(data: any){
    console.log(data);
    const payload = {
        patient_id: data.patient_id,
        booking_id: data.appt_id,
        user_map_id: localStorage.getItem('user_map_id'),
        set_status: 2
    }
    try{
        axios.post(API_BASE_URL + '/patient-web/change-appointment-status', payload)
        .then((res: any)=>{
            if(res.status){
                toast.success('Marked as Done...');
            }
            else{
                toast.error("something went wrong...")
            }
        })
    } catch(e){
        console.log("error : ", e);
        
    }
    
  }

  async function getBookedPatient(mobile: any) {
//   showLoader();

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
    //   await getAllPatients(mobile, filteredData);

      if (res.data.message === "Data not found") {
        toast.error("No appointments found for this mobile number");
      }
    } else {
      toast.error("No appointments found");
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    // hideLoader(); // ✅ now runs after BOTH APIs
  }
}
  return (
    <div className="doctyor-side-component">
        <Toaster />
        <span>Doctor Side Component -- Test</span>
        <span>List</span>
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
                        // checkInPatient(item);
                      }}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Check In
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        donePrescrion(item);
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
