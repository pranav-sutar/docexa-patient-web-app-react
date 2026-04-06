import { useLottie } from "lottie-react";
import loaderAnimation from "../assets/lotties/loading.json";

function Loader() {
  const options = {
    animationData: loaderAnimation,
    loop: true,
  };

  const { View } = useLottie(options, { width: 150 });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">{View}</div>
    </div>
  );
}

export default Loader;
