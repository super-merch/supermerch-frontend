const metrics = [
  { value: "75+", label: "Trusted Brands" },
  { value: "100", label: "Core Team Members" },
  { value: "40", label: "Merchandise Distribution Centers Worldwide" },
  { value: "95", label: "Countries Sold" },
  { value: "40", label: "Merchandise Distribution Centers Worldwide" },
  { value: "38", label: "Projects Completed" },
];

const MetricSec = () => {
    return (
      <div className="bg-smallHeader lg:mt-24 md:mt-16 mt-14">
        <div className="  grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 text-center py-16   text-white  gap-6">
          {metrics.map((metric, idx) => (
            <div className="Mycontainer" key={idx}>
              <p className="text-3xl lg:text-5xl md:text-4xl   font-semibold">
                {metric.value}
              </p>
              <p className=" pt-3 text-sm text-line ">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
};

export default MetricSec;
