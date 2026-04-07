import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import toast, { Toaster } from "react-hot-toast";
import Footer from "./Footer";
import { useNavigate, useLocation } from "react-router-dom";
import back_button from "../assets/icons/back-btn.png";
import { useLoader } from "../context/LoaderContext";
import axios from "axios";
import { STAGING_BASE_URL, STAGING_V3_URL } from "../config/apis";

type Props = {};

function AddVitals({}: Props) {
  const [allVitals, setAllVitals] = useState<any[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<any[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<any>({});
  const [selectedVitals, setSelectedVitals] = useState<any>({});
  const [activeVital, setActiveVital] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const initialSymptomForm = {
    since: {
      preset: "",
      value: "",
      unit: "",
    },
    severity: "",
    description: "",
    value: "",
    unit: "",
  };
  const location = useLocation();
  const appointmentData = location.state?.appointment_data;

  const navigate = useNavigate();
  const { loading, showLoader, hideLoader } = useLoader();

  const [clinicName, setClinicName] = useState<any>(null);

  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);
  const [symptomForm, setSymptomForm] = useState(initialSymptomForm);

  const [showAllVitals, setShowAllVitals] = useState(false);

  useEffect(() => {
    setClinicName(JSON.parse(localStorage.getItem("clinic_name") || "null"));
    getPatientSelectedVitals();
    getVitalsAndSymptoms();
  }, []);

  // 🚀 Fetch Data
  async function getVitalsAndSymptoms() {
    try {
      showLoader();

      const [vitalsRes, symptomsRes] = await Promise.all([
        axios.get(`${STAGING_V3_URL}/establishments/users/70671/vital`),
        axios.get(`${STAGING_V3_URL}/getsymptoms/70671`),
      ]);

      setAllVitals(vitalsRes?.data?.data || []);
      setAllSymptoms(symptomsRes?.data?.data?.symptoms || []);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  }
  //   y -- get patient selected vitals and symptoms -- (T)

  const [previosSelectedVitals, setPreviousSelectedVitals] =
    useState<any>(null);
  const [previosSelectedSymptoms, setPreviosSelectedSymptoms] =
    useState<any>(null);
  async function getPatientSelectedVitals() {
    showLoader();

    const doctor_id = localStorage.getItem("pharmaclient_id");
    const booking_id = appointmentData.appt_id || null;
    const user_map_id = localStorage.getItem("user_map_id") || null;

    try {
      const symRes = await axios.get(
        `${STAGING_BASE_URL}/patient/dashboard/booking-symptoms/${doctor_id}/${booking_id}`,
      );

      const vitRes = await axios.get(
        `${STAGING_V3_URL}/establishments/users/${user_map_id}/assistant/vital/${booking_id}`,
      );

      // ✅ STORE
      setPreviosSelectedSymptoms(symRes.data?.data || []);
      setPreviousSelectedVitals(vitRes.data?.data || []);
    } catch {
      toast.error("something went wrong.");
    } finally {
      hideLoader();
    }
  }
  //   y -- get patient selected vitals and symptoms -- (B)

  //   y -- Functions for post vitals and symptoms -- (T)
  async function handleSubmit() {
    try {
      showLoader();

      const vitalsPayloadRaw = prepareVitalsPayload();
      const symptomsPayloadRaw = prepareSymptomsPayload();

      // ✅ CLEAN DATA
      const vitalsPayload = getValidVitals(vitalsPayloadRaw);
      const symptomsPayload = getValidSymptoms(symptomsPayloadRaw);

      console.log("Clean Vitals:", vitalsPayload);
      console.log("Clean Symptoms:", symptomsPayload);

      // ❗ NOTHING SELECTED
      if (vitalsPayload.length === 0 && symptomsPayload.length === 0) {
        hideLoader();
        toast.error("Please add at least one vital or symptom");
        return;
      }

      const commonPayload = {
        booking_id: appointmentData?.appt_id,
        patientId: appointmentData?.patient_id,
        user_map_id: localStorage.getItem("user_map_id"),
        doctor_id: localStorage.getItem("pharmaclient_id"),
      };

      const config = {
        headers: {
          "app-id": localStorage.getItem("app_id"),
          "user-id": "1",
          "Content-Type": "application/json",
        },
      };

      // =========================
      // ✅ 1. VITALS (only if exists)
      // =========================
      if (vitalsPayload.length > 0) {
        const vitalsApiPayload = vitalsPayload.map((v: any) => ({
          appointment_id: commonPayload.booking_id,
          name: v.vital_name,
          patient_id: commonPayload.patientId,
          user_map_id: commonPayload.user_map_id,
          unit: v.unit ?? null,
          data: {
            note: v.unit ?? null,
            title: v.vital_name,
            type: "vitals",
            vitals: v.value,
          },
        }));

        const vital_resonse = await axios.post(
          `${STAGING_V3_URL}/establishments/users/${commonPayload.user_map_id}/assistant/vital/add`,
          vitalsApiPayload,
          config,
        );

        if (vital_resonse.data.status === true) {
          toast.success("Vitals added successfully");
        }
      }

      // =========================
      // ✅ 2. SYMPTOMS (only if exists)
      // =========================
      if (symptomsPayload.length > 0) {
        const symptomsApiPayload = symptomsPayload.map((s: any) => ({
          booking_id: commonPayload.booking_id,
          patient_id: commonPayload.patientId,
          doctor_id: commonPayload.doctor_id,
          user_map_id: commonPayload.user_map_id,
          name: s.name,
          data: {
            title: s.name,
            note: s.description || null,
            severity: s.severity ?? null,
            since: {
              preset: s?.since?.preset ?? null,
              value: s?.since?.value ?? null,
              unit: s?.since?.unit ?? null,
            },
            type: "symptom",
          },
        }));

        const symptoms_response = await axios.post(
          `${STAGING_BASE_URL}/patient/dashboard/booking-symptoms-bulk`,
          symptomsApiPayload,
          config,
        );

        if (symptoms_response.data.status === true) {
          toast.success("Symptoms added successfully");
        }
      }
      navigate(-1);
      hideLoader();
      console.log("✅ Done");
    } catch (error) {
      hideLoader();
      console.error("❌ Error:", error);
      toast.error("Something went wrong");
    }
  }
  function getValidVitals(vitalsPayload: any[]) {
    return vitalsPayload.filter(
      (v) => v.value !== "" && v.value !== null && v.value !== undefined,
    );
  }
  function getValidSymptoms(symptomsPayload: any[]) {
    return symptomsPayload.filter((s) => s.name);
  }

  function prepareVitalsPayload() {
    return Object.keys(selectedVitals).map((key) => {
      const vitalMeta = allVitals.find((v) => v.vital_name === key);

      return {
        vital_name: key,
        value: selectedVitals[key],
        unit: vitalMeta?.unit || null,
      };
    });
  }
  function prepareSymptomsPayload() {
    return Object.keys(selectedSymptoms).map((key) => {
      const s = selectedSymptoms[key];

      return {
        name: key,
        selected: true,
        description: s.description,
        severity: s.severity,
        since: {
          preset: s?.since?.preset || null,
          value: s?.since?.value || null,
          unit: s?.since?.unit || null,
        },
      };
    });
  }
  //   y -- Functions for post vitals and symptoms -- (B)
  // 🔹 Limited display

  return (
    <>
      {loading && <Loader />}

      <div className="outer-container flex flex-col">
        <Toaster />

        <div className="min-h-[90vh] bg-gray-100 flex flex-col items-center">
          {/* HEADER */}
          <div className="w-full bg-blue-200 rounded-b-[60px] pt-10 p-6 text-center">
            <div className="backbtn">
              <img
                src={back_button}
                onClick={() => navigate(-1)}
                className="w-6 cursor-pointer"
                alt=""
              />
            </div>

            <span className="text-gray-600">Welcome to</span>
            <h2 className="text-3xl font-bold text-gray-800">
              {clinicName || "Clinic"}
            </h2>
          </div>

          <div className="main-container w-full flex flex-col items-center">
            <h3 className="text-xl font-semibold mt-6">
              Add Vitals & Symptoms
            </h3>

            {/* Patient Info */}
            <div className="flex flex-col gap-2 mt-4 p-4 bg-yellow-100 rounded shadow w-[90%] max-w-md">
              <span>Patient: {appointmentData?.patient_name}</span>
              <span>
                Gender: {appointmentData?.gender === 1 ? "Male" : "Female"}
              </span>
              <span>Age: {appointmentData?.age}</span>
            </div>

            {/* 🔹 VITALS */}
            <div className="w-[90%] max-w-md mt-6">
              <h3 className="font-semibold text-lg mb-2">Vitals</h3>

              {/* show previously selected vitals */}
              {previosSelectedVitals?.length > 0 && (
                <div className="w-[90%] max-w-md mt-4 mb-4">
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">
                    Previously Added Vitals
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {previosSelectedVitals.map((item: any) => (
                      <div
                        key={item.id}
                        className="px-3 py-1 rounded-full bg-gray-300 text-gray-800 text-sm"
                      >
                        {item.vital_name} ({item.value})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* show previously selected vitals */}

              <div className="flex flex-wrap items-center gap-2">
                {/* SELECTED VITALS */}
                {Object.keys(selectedVitals).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-sm"
                  >
                    <span>
                      {key} ({selectedVitals[key]})
                    </span>

                    <button
                      onClick={() => {
                        const updated = { ...selectedVitals };
                        delete updated[key];
                        setSelectedVitals(updated);
                      }}
                      className="text-xs"
                    >
                      ❌
                    </button>
                  </div>
                ))}

                {/* ADD BUTTON */}
                <button
                  onClick={() => setShowAllVitals(true)}
                  className="flex items-center justify-center px-3 py-1 rounded-full bg-green-600 text-white text-sm"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="symptoms-section w-[90%] max-w-md mt-6">
              <h3 className="font-semibold text-lg mb-2">Symptoms</h3>

              {/* show previously selected symptoms */}
              {previosSelectedSymptoms?.length > 0 && (
                <div className="w-[90%] max-w-md mt-4 mb-4">
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">
                    Previously Added Symptoms
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {previosSelectedSymptoms.map((item: any) => {
                      let parsedData = null;

                      try {
                        parsedData = JSON.parse(item.data);
                      } catch {}

                      return (
                        <div
                          key={item.id}
                          className="px-3 py-1 rounded-full bg-gray-300 text-gray-800 text-sm"
                        >
                          {item.name}
                          {parsedData?.since?.preset &&
                            ` (${parsedData.since.preset})`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* show previously selected symptoms */}
              <div className="flex flex-wrap items-center gap-2">
                {/* CHIPS */}
                {Object.keys(selectedSymptoms).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-sm"
                  >
                    <span>{key}</span>

                    <button
                      onClick={() => {
                        const updated = { ...selectedSymptoms };
                        delete updated[key];
                        setSelectedSymptoms(updated);
                      }}
                      className="text-xs"
                    >
                      ❌
                    </button>
                  </div>
                ))}

                {/* ADD BUTTON */}
                <button
                  onClick={() => setShowAllSymptoms(true)}
                  className="flex items-center justify-center px-3 py-1 rounded-full bg-green-600 text-white text-sm"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* 🔹 SUBMIT */}
            <button
              onClick={handleSubmit}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded mb-4"
            >
              Submit
            </button>
          </div>
        </div>

        <Footer clinicData={clinicName} />
      </div>

      {/* 🔥 MODAL */}
      {activeVital && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl w-[300px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{activeVital.vital_name}</h3>
              <button onClick={() => setActiveVital(null)}>❌</button>
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              className="w-full border p-2 rounded"
            />

            <button
              onClick={() => {
                setSelectedVitals((prev: any) => ({
                  ...prev,
                  [activeVital.vital_name]: inputValue,
                }));
                setActiveVital(null);
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* y modal */}
      {showAllVitals && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-md max-h-[80vh] overflow-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Select Vital</h3>
              <button onClick={() => setShowAllVitals(false)}>❌</button>
            </div>

            {/* LIST */}
            <div className="flex flex-wrap gap-2">
              {allVitals.map((item) => {
                const isSelected = selectedVitals[item.vital_name];

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveVital(item);
                      setInputValue(selectedVitals[item.vital_name] || "");
                      setShowAllVitals(false);
                    }}
                    className={`px-3 py-1 rounded-full text-sm
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-green-200 text-black"
                }`}
                  >
                    {item.vital_name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* y modal */}

      {/* y Symptom modal */}

      {showAllSymptoms && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-md  h-[85vh] overflow-y-auto">
            <div className="flex justify-between mb-3">
              <h3>Select Symptom</h3>
              <button onClick={() => setShowAllSymptoms(false)}>❌</button>
            </div>

            <div className="flex flex-wrap gap-2">
              {allSymptoms.map((item: any) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveSymptom(item.name);
                    setShowAllSymptoms(false);
                  }}
                  className="px-3 py-1 bg-green-200 rounded-full"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSymptom && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-md">
            {/* HEADER */}
            <h3 className="font-semibold text-lg mb-3">{activeSymptom}</h3>

            {/* SINCE */}
            <p className="text-sm mb-2">Since</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["1d", "2d", "3d", "1w", "2w", "1m", "3m", "6m", "1y"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setSymptomForm((prev: any) => ({
                        ...prev,
                        since: {
                          preset: item,
                          value: "",
                          unit: "",
                        },
                      }))
                    }
                    className={`px-2 py-1 rounded
              ${
                symptomForm.since.preset === item
                  ? "bg-green-600 text-white"
                  : "bg-green-200"
              }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            {/* VALUE + UNIT */}
            <div className="flex gap-2 mb-3">
              <input
                placeholder="Value"
                className="border p-2 w-full"
                onChange={(e) =>
                  setSymptomForm((prev) => ({
                    ...prev,
                    since: {
                      preset: "",
                      value: e.target.value,
                      unit: prev.since.unit,
                    },
                  }))
                }
              />
              <input
                placeholder="Unit"
                className="border p-2 w-full"
                onChange={(e) =>
                  setSymptomForm((prev) => ({
                    ...prev,
                    since: {
                      preset: "",
                      value: prev.since.value,
                      unit: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* SEVERITY */}
            <p className="mb-1">Severity</p>
            {["Mild", "Moderate", "Severe"].map((item) => (
              <div key={item} className="flex justify-between mb-1">
                <span>{item}</span>
                <input
                  type="radio"
                  checked={symptomForm.severity === item}
                  onChange={() =>
                    setSymptomForm((prev) => ({
                      ...prev,
                      severity: item,
                    }))
                  }
                />
              </div>
            ))}

            {/* DESCRIPTION */}
            <textarea
              placeholder="Description"
              className="border w-full mt-3 p-2"
              onChange={(e) =>
                setSymptomForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setActiveSymptom(null);
                  setSymptomForm(initialSymptomForm);
                }}
                className="text-red-500"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const finalSince =
                    symptomForm.since.value && symptomForm.since.unit
                      ? {
                          preset: null,
                          value: symptomForm.since.value,
                          unit: symptomForm.since.unit,
                        }
                      : {
                          preset: symptomForm.since.preset,
                          value: null,
                          unit: null,
                        };

                  setSelectedSymptoms((prev: any) => ({
                    ...prev,
                    [activeSymptom]: {
                      ...symptomForm,
                      since: finalSince,
                    },
                  }));

                  // ✅ RESET FORM
                  setSymptomForm(initialSymptomForm);

                  // ✅ CLOSE MODAL
                  setActiveSymptom(null);
                }}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* y Symptom modal */}
    </>
  );
}

export default AddVitals;
