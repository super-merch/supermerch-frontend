import React from "react";
import ContactUs from "../components/contactus/ContactUs";
import CallUs from "../components/contactus/CallUs";
import FAQS from "../components/contactus/FAQS";
import PopularTags from "../components/contactus/PopularTags";

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <CallUs />
      <FAQS />
      {/* <ContactUs /> */}
      {/* <PopularTags /> */}
    </div>
  );
};

export default ContactPage;
