import React, { useState } from "react";
import { Button } from "@mui/material";
import {
  Phone,
  User,
  Calendar,
  Mail,
  VenusAndMars,
} from "lucide-react";
import { STAGING_BASE_URL } from "../config/apis";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useLoader } from "../context/LoaderContext";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import back_button from "../assets/icons/back-btn.png";

export default function AddPatient() {

      const { loading } = useLoader();
  const { showLoader, hideLoader } = useLoader();
  const [formData, setFormData] = useState({
    mobile: Number(localStorage.getItem('patient_mobile') || ""),
    firstName: "",
    surname: "",
    dob: "",
    email: "",
    gender: 1, // 1 = Male, 2 = Female
  });
const navigate = useNavigate();
const [openOtpModal, setOpenOtpModal] = useState(false);
const [otp, setOtp] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: cleaned,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

async function getOtp(mobile: any) {
  showLoader();

  axios
    .post(STAGING_BASE_URL + "/patient/send-otp", {
      mobile: mobile,
    })
    .then((res: any) => {
      console.log("OTP Sent Response : ", res);

      if (res.data.status || res.status === 200) {
        toast.success("OTP Sent Successfully");

        // OPEN MODAL
        setOpenOtpModal(true);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.error("Failed to send OTP");
    })
    .finally(() => {
      hideLoader();
    });
}
function verifyOtp() {
  const payload = {
    mobile: formData.mobile,
    otp: Number(otp),
    app_id: Number(localStorage.getItem("app_id")),
  };

  showLoader();

  axios
    .post(STAGING_BASE_URL + "/patient/verify-otp", payload)
    .then((res: any) => {
      console.log("VERIFY RESPONSE : ", res);

      
      //   y Function for Create Patient -- (T)
      if(res.code == 200 || res.data){
        //   toast.success("OTP Verified Successfully");
          createPatient(res.data.id);
      }
      else{
        toast.error("something went wrong.");
      }
      //   y Function for Create Patient -- (B)
     

      // CLOSE MODAL
      setOpenOtpModal(false);
    })
    .catch((err) => {
      console.log(err);
      toast.error("Invalid OTP");
    })
    .finally(() => {
      hideLoader();
    });
}
function createPatient(head_id: any){
    try {
        showLoader();
        const payload = {
             patient_name:  `${formData.firstName} ${formData.surname}`,
  gender: formData.gender,
  dob: formData.dob,
  doctor_id: Number(localStorage.getItem('pharmaclient_id')),
  patient_head_id: head_id, // from Verify OTP Responce
mobile_no: String(formData.mobile),
  email_id: formData.email?.trim() || null,
        }
        console.log("payload : ", payload);
        
        axios.post(STAGING_BASE_URL + '/patient/dashboard/add_family', payload)
        .then((res: any)=>{
            console.log("responce: ", res);
            if(res.status){
                toast.success("Patient Created Successfully.");
                hideLoader();
                navigate(-1);
                
            }
            else{
                toast.error("something went Wrong.");
            }
            
        })
        
        
    } catch (error) {
        console.log("Error : ", error);
        
    }
    finally{
        hideLoader();
    }
}
  const handleSubmit = async () => {
    if (
      !formData.mobile ||
      !formData.firstName ||
      !formData.surname ||
      !formData.dob ||
      !formData.gender
    ) {
    //   alert("Please fill all mandatory fields");
      toast("Please fill all mandatory fields!", {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#393939",
          color: "#fff",
        },
      });
      return;
    }

    getOtp(formData.mobile);

    console.log("Patient Data:", formData);
  };

  return (
    <>
    {loading && <Loader />}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="header bg-gradient-to-r from-blue-600 to-cyan-500 flex align-center">
            <div className="backnavigation flex ps-2">
                <button onClick={()=>{navigate(-1)}}><img
                src={back_button}
                className="w-6 cursor-pointer"
                alt=""
              /></button>
            </div>
            <div className=" p-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Create New Patient
          </h1>

          <p className="text-blue-100 mt-2 text-sm">
            Fill patient details to continue
          </p>
        </div>
        </div>

        {/* FORM */}
        <div className="p-5 md:p-7 space-y-5">
          {/* Mobile */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Mobile Number *
            </label>

            <div className="flex items-center border rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-blue-500">
              <Phone className="text-gray-400 w-5 h-5 mr-3" />

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              First Name *
            </label>

            <div className="flex items-center border rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-blue-500">
              <User className="text-gray-400 w-5 h-5 mr-3" />

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter Patient Name"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Surname */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Last Name *
            </label>

            <div className="flex items-center border rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-blue-500">
              <User className="text-gray-400 w-5 h-5 mr-3" />

              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Enter Patient Surname"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Gender *
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Male */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: 1,
                  }))
                }
                className={`rounded-2xl p-4 border-2 transition-all duration-200 flex items-center justify-center gap-2 font-semibold
                  
                  ${
                    formData.gender === 1
                      ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                <VenusAndMars size={18} />
                Male
              </button>

              {/* Female */}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: 2,
                  }))
                }
                className={`rounded-2xl p-4 border-2 transition-all duration-200 flex items-center justify-center gap-2 font-semibold
                  
                  ${
                    formData.gender === 2
                      ? "bg-pink-500 text-white border-pink-500 shadow-lg"
                      : "bg-white text-gray-700 border-gray-200 hover:border-pink-300"
                  }
                `}
              >
                <VenusAndMars size={18} />
                Female
              </button>
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Date Of Birth *
            </label>

            <div className="flex items-center border rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-blue-500">
              <Calendar className="text-gray-400 w-5 h-5 mr-3" />

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Email (Optional)
            </label>

            <div className="flex items-center border rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-blue-500">
              <Mail className="text-gray-400 w-5 h-5 mr-3" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email Address"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{
              marginTop: "10px",
              padding: "14px",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              background:
                "linear-gradient(to right, #2563eb, #06b6d4)",
              textTransform: "none",
            }}
          >
            Create Patient
          </Button>
        </div>
      </div>

      {/* y Modal -- (T) */}
      <Dialog
  open={openOtpModal}
  onClose={() => setOpenOtpModal(false)}
  fullWidth
  maxWidth="xs"
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    Verify OTP
  </DialogTitle>

  <DialogContent>
    <div className="py-3">
      <p className="text-sm text-gray-500 mb-4 text-center">
        Enter OTP sent to {formData.mobile}
      </p>

      <TextField
        autoFocus
        fullWidth
        label="Enter OTP"
        variant="outlined"
        value={otp}
        onChange={(e: any) => setOtp(e.target.value)}
        // inputProps={{
        //   maxLength: 6,
        // }}
      />
    </div>
  </DialogContent>

  <DialogActions sx={{ padding: "16px" }}>
    <Button
      onClick={() => setOpenOtpModal(false)}
      color="error"
      variant="outlined"
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={verifyOtp}
      sx={{
        background:
          "linear-gradient(to right, #2563eb, #06b6d4)",
      }}
    >
      Verify OTP
    </Button>
  </DialogActions>
</Dialog>
      {/* y Modal -- (B) */}
    </div>
    </>
  );
}