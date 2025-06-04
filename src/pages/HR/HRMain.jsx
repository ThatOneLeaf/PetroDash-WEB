import { useState } from "react";
import HREmployability from "./HR";
import HRParental from "./HRParentalLeave";
import HRSafetyWorkData from "./HRSafetyWorkData";
import HRTraining from "./HRTraining";
import HROSH from "./HROSH";

import PageButtons from "../../components/hr_components/page_button";

function HR() {
  const [selected, setSelected] = useState("Employability");

  const renderPage = () => {
    switch (selected) {
      case "Employability":
        return <HREmployability />;
      case "Parental Leave":
        return <HRParental />;
      case "Safety Work Data":
        return <HRSafetyWorkData />;
      case "Training":
        return <HRTraining />;
      case "OSH":
        return <HROSH />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <div>
      <PageButtons selected={selected} setSelected={setSelected} />
      {renderPage()}
    </div>
  );
}
export default HR;
