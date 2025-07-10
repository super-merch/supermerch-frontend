import React from "react";

import team1 from "/team1.png";
import team2 from "/team2.png";
import team3 from "/team3.png";
import team4 from "/team4.png";
import team5 from "/team5.png";
import team6 from "/team6.png";
import team7 from "/team7.png";
import team8 from "/team8.png";

const TeamMember = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Kevin Gilbert",
      role: "Chief Executive Officer",
      image: team1,
    },
    {
      id: 2,
      name: "Kevin Gilbert",
      role: "Assistant CEO",
      image: team2,
    },
    {
      id: 3,
      name: "Kevin Gilbert",
      role: "Head of Designer",
      image: team3,
    },
    {
      id: 4,
      name: "Kevin Gilbert",
      role: "UX Designer",
      image: team4,
    },
    {
      id: 5,
      name: "Kevin Gilbert",
      role: "Product Designer",
      image: team5,
    },
    {
      id: 6,
      name: "Kevin Gilbert",
      role: "Head of Development",
      image: team6,
    },
    {
      id: 7,
      name: "Kevin Gilbert",
      role: "Design Engineer",
      image: team7,
    },
    {
      id: 8,
      name: "Kevin Gilbert",
      role: "UI Designer",
      image: team8,
    },
  ];

  return (
    <section className="lg:py-12 md:py-12 sm:py-12 py-0 bg-white">
      <div className="Mycontainer">
        {/* Section Header */}
        <h2 className="text-2xl font-semibold text-brand text-center mb-8">
          Our Core Team Member
        </h2>

        {/* Team Members Grid */}
        <div className=" mt-4 grid max-default:grid-cols-1 max-sm2:grid-cols-2 max-md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex gap-6  items-center bg-white border px-5 py-6 rounded "
            >
              <img
                src={member.image}
                alt=""
                className="w-16 h-16 rounded-full object-cover "
              />
              <div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-gogle">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamMember;
