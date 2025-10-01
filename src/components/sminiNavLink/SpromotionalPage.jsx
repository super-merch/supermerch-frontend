import React from "react";
import Breadcrumb from "../shared/Breadcrumb";
import Spromotional from "./Spromotional";

const SpromotionalPage = () => {
  return (
    <div>
      <Breadcrumb />
      <Spromotional />
      <div className="mt-10">{/* <TabsBtns /> */}</div>
    </div>
  );
};

export default SpromotionalPage;
