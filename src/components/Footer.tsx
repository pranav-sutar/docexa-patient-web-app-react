import React from "react";
import docexa_logo from "../assets/pngs/docexa-logo.png"; // adjust path if needed
type FooterProps = {
  clinicData: any;
};
export default function Footer({ clinicData }: FooterProps) {
  return (
    <div className="w-full bg-black text-white text-center py-4 border-t-4 border-blue-500">
      {/* Clinic Info */}
      <div>
        <h3 className="font-semibold text-lg">
          {clinicData?.clinic_name || "Clinic Name"}
        </h3>
        <p className="text-sm text-gray-300 px-4">
          {clinicData?.address || "Clinic address here"}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-500 my-3 w-[90%] mx-auto"></div>

      {/* Powered By */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-gray-300">Powered By :</span>
        <img src={docexa_logo} alt="Docexa" className="h-5" />
      </div>
    </div>
  );
}
