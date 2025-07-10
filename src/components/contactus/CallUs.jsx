import React from 'react'
import { PiPhoneCallDuotone } from "react-icons/pi";
import { RiMessage2Line } from "react-icons/ri";
import { IoArrowForwardOutline } from "react-icons/io5";

const CallUs = () => {
    const contactOptions = [
      {
        id: 1,
        icon: <PiPhoneCallDuotone />,
        title: "Call us now",
        description: "Available online from 9:00 AM to 5:00 PM (GMT+5:45)",
        contactInfo: "+61 466 468 528",
        buttonText: "CALL NOW",
        buttonColor: "bg-smallHeader",
        arrow: <IoArrowForwardOutline />,
        buttonWidth: "w-36",
      },
      {
        id: 2,
        icon: <RiMessage2Line />,
        title: "Email Us",
        description: "Available online from 9:00 AM to 5:00 PM (GMT+5:45)",
        contactInfo: "Support@clicon.com",
        buttonText: "CONTACT US",
        buttonColor: "bg-pink",
        arrow: <IoArrowForwardOutline />,
        buttonWidth: "w-44",
      },
    ];
  return (
    <div className="bg-activeFilter pb-12">
      <div className="Mycontainer">
        <div className="text-center mb-8">
          <h2 className="lg:text-3xl pt-6 md:text-3xl sm:text-3xl text-2xl max-w-96 m-auto text-brand font-semibold">
            Don't find your answer? Contact with us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {contactOptions.map((option) => (
            <div
              key={option.id}
              className=" flex flex-wrap lg:flex-nowrap md:flex-nowrap sm:flex-nowrap items-start p-6 border bg-white rounded-md "
            >
              <div
                className={`p-4  inline-block text-4xl  ${
                  option.id === 1 ? "bg-phoneHover" : "bg-green-50"
                }`}
              >
                {option.icon}
              </div>
              <div className="lg:px-5 md:px-5 sm:px-5 px-0 pt-2 lg:pt-0 md:pt-0 sm:pt-0">
                <h3 className="font-bold">{option.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {option.description}
                </p>
                <p className="font-bold mb-5">{option.contactInfo}</p>
                <div
                  className={`text-left flex items-center gap-2 justify-center py-2.5 text-white rounded-sm ${option.buttonColor} ${option.buttonWidth}`}
                >
                  <button className="">{option.buttonText}</button>
                  <p>{option.arrow}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CallUs