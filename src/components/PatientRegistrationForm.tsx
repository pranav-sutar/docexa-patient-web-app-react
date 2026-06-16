import React, { useState, useMemo } from "react";
import {
  FaHospitalUser,
  FaUser,
  FaVenusMars,
  FaWeight,
  FaRulerVertical,
} from "react-icons/fa";

import logo from "../assets/pngs/gst_logo.jpeg";

function PatientRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    height: "",
    heightUnit: "cm",
    weight: "",
  });

  const calculateAge = (dob: any) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} Years ${months} Months ${days} Days`;
  };

  const age = useMemo(() => calculateAge(formData.dob), [formData.dob]);

  const heightInCm = useMemo(() => {
    const height = parseFloat(formData.height);

    if (!height) return 0;

    switch (formData.heightUnit) {
      case "cm":
        return height;
      case "inch":
        return height * 2.54;
      case "ft":
        return height * 30.48;
      case "m":
        return height * 100;
      default:
        return height;
    }
  }, [formData.height, formData.heightUnit]);

  const bsa = useMemo(() => {
    const weight = parseFloat(formData.weight);

    if (!weight || !heightInCm) return "";

    return Math.sqrt((heightInCm * weight) / 3600).toFixed(2);
  }, [heightInCm, formData.weight]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.dob ||
      !formData.gender ||
      !formData.height ||
      !formData.weight
    ) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dob,
      age,
      gender: formData.gender,
      height: {
        value: formData.height,
        unit: formData.heightUnit,
        height_in_cm: Number(heightInCm.toFixed(2)),
      },
      weight_kg: Number(formData.weight),
      body_surface_area: bsa,
    };

    console.log("Patient Registered Payload:");
    console.log(JSON.stringify(payload, null, 2));

    alert("Patient Registered Successfully!");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          background: "#fff",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <img
              src={logo}
              alt="Globalspace"
              style={{
                height: "50px",
                objectFit: "contain",
              }}
            />

            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              Globalspace Technologies
            </h1>
          </div>

          <h3
            style={{
              marginTop: "10px",
              color: "#2563eb",
              fontWeight: 600,
            }}
          >
            हृदय तपासणी शिबीर - कागल तालुका
          </h3>

          <p
            style={{
              color: "#64748b",
              marginTop: "5px",
              fontSize: "15px",
            }}
          >
            Patient Registration Form
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
            }}
          >
            {/* First Name */}
            <div>
              <label>Patient First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                style={inputStyle}
              />
            </div>

            {/* Last Name */}
            <div>
              <label>Surname</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Surname"
                style={inputStyle}
              />
            </div>

            {/* DOB */}
            <div>
              <label>Date Of Birth *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* Age */}
            <div>
              <label>Age</label>
              <input
                value={age}
                readOnly
                style={{
                  ...inputStyle,
                  background: "#f8fafc",
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Gender */}
            <div>
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label>Height *</label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height"
                  style={{
                    ...inputStyle,
                    flex: 1,
                  }}
                />

                <select
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    width: "120px",
                  }}
                >
                  <option value="cm">CM</option>
                  <option value="inch">Inch</option>
                  <option value="ft">Feet</option>
                  <option value="m">Meter</option>
                </select>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label>Weight (KG) *</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight"
                style={inputStyle}
              />
            </div>

            {/* BSA */}
            <div style={{ gridColumn: "1/-1" }}>
              <label>Body Surface Area (BSA)</label>
              <input
                readOnly
                value={bsa ? `${bsa} m²` : ""}
                style={{
                  ...inputStyle,
                  background: "#f8fafc",
                  fontWeight: 700,
                  color: "#2563eb",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "30px",
              padding: "15px",
              border: "none",
              borderRadius: "14px",
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Register Patient
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  marginTop: "6px",
  fontSize: "15px",
  boxSizing: "border-box",
};

export default PatientRegistrationForm;
