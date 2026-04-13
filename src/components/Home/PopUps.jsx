import React, { useState } from "react";
import HelpMePickModal from "./HelpMePickModal";

const PopUp = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center mt-1">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-1.5 bg-primary text-white font-normal rounded hover:bg-primary/90 transition duration-300"
      >
        Help me Pick
      </button>

      <HelpMePickModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default PopUp;
