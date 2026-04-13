import React from "react";
import Promotional from "./Promotional";
import Breadcrumb from "../../shared/Breadcrumb";

const PromotionalPage = () => {
  return (
    <div>
      <Breadcrumb />
      <Promotional />
      <div className="mt-10">{/* <TabsBtns /> */}</div>
    </div>
  );
};

export default PromotionalPage;
