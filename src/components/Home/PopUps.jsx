import React, { useState } from "react";
import HelpMePickModal from "./HelpMePickModal";

const PopUp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center mt-1">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 bg-blue-500 text-white font-normal rounded hover:bg-blue-600 transition duration-300"
      >
        Help me Pick
      </button>

      <HelpMePickModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default PopUp;
