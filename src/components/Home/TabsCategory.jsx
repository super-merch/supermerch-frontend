import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heading } from "../Common";

import tradie from "../../assets/bag.jpg";
import tracksuit from "../../assets/trouser.png";
import corporate from "../../assets/laptop.jpg";
import cap from "../../assets/cap.png";
import lanyard from "../../assets/lanyard.jpg";
import packing from "../../assets/packing.jpg";
import notebook from "../../assets/category-notebook.webp";
import jersey from "../../assets/shirt2.png";

import industryTrades from "../../assets/mwts-industry-trades-new.jpg";
import industryRealEstate from "../../assets/mwts-industry-realestate-new.jpg";
import industryIT from "../../assets/mwts-industry-it.jpg";
import industryHospitality from "../../assets/mwts-industry-hospitality-new.jpg";

import recipientExecutives from "../../assets/mwts-recipient-executives-new.jpg";
import recipientConference from "../../assets/mwts-recipient-conference.png";
import recipientStaff from "../../assets/mwts-recipient-staff.jpg";
import recipientCustomer from "../../assets/mwts-recipient-customer.jpg";

const shopTabs = [
  {
    id: "industry",
    label: "Industry",
    tagline: "Products built for your industry and the way you work.",
    subCategories: [
      { label: "For the Tradie",               desc: "Hi-vis, tees and hard-wearing site gear.",              image: industryTrades,      path: "/collections/trades?page=1" },
      { label: "For the Real Estate Agent",    desc: "Branded essentials that keep your name top of mind.",   image: industryRealEstate,  path: "/collections/real-estate?page=1" },
      { label: "For the IT Professional",      desc: "Tech accessories and desk gear clients will love.",     image: industryIT,          path: "/promotional?categoryName=Phone+%26+Technology&category=PS&type=Promotional&page=1" },
      { label: "For the Hospitality Business", desc: "Uniforms and drinkware for front-of-house teams.",      image: industryHospitality, path: "/collections/hospitality?page=1" },
    ],
  },
  {
    id: "recipient",
    label: "Recipient",
    tagline: "Curated picks for every person on your list.",
    subCategories: [
      { label: "For the Executive",            desc: "Premium gifts that leave a lasting impression.",          image: recipientExecutives, path: "/return-gifts?page=1" },
      { label: "For the Conference Attendee",  desc: "Practical take-home packs delegates will actually use.",  image: recipientConference, path: "/collections/conference?page=1" },
      { label: "For the Staff & Team",         desc: "Merch your crew will be proud to wear.",                 image: recipientStaff,      path: "/promotional?categoryName=Office+%26+Business&category=PR&type=Promotional&page=1" },
      { label: "For the Customer",             desc: "Branded giveaways that turn buyers into loyal fans.",     image: recipientCustomer,   path: "/promotional?categoryName=Exhibitions+%26+Events&category=PF&type=Promotional&page=1" },
    ],
  },
  {
    id: "bundles",
    label: "Bundles",
    tagline: "Everything you need in one ready to brand pack.",
    subCategories: [
      { label: "For the Tradie Bundle",  desc: "Tees, hi-vis and site gear packed together.",         image: tradie,    path: "/contact" },
      { label: "For the Workwear Team",  desc: "Full uniform packs from polos to jackets.",           image: tracksuit, path: "/contact" },
      { label: "For the Corporate Pack", desc: "Notebooks, pens and bags in one boardroom kit.",      image: corporate, path: "/contact" },
      { label: "For the Headwear Fan",   desc: "Caps, beanies and bucket hats all in one.",           image: cap,       path: "/contact" },
    ],
  },
  {
    id: "overseas",
    label: "Overseas Sourcing",
    tagline: "Custom made products at scale for large orders with your exact spec.",
    subCategories: [
      { label: "For the Custom Lanyard",  desc: "Full colour lanyards with custom fittings and finishes.", image: lanyard,  path: "/contact" },
      { label: "For the Gift Hamper",     desc: "Bespoke hampers assembled and packed to your brief.",     image: packing,  path: "/contact" },
      { label: "For the Notebook Lover",  desc: "Printed notebooks in any size or colour.",                image: notebook, path: "/contact" },
      { label: "For the Sports Team",     desc: "Jerseys and team gear made to your design.",              image: jersey,   path: "/contact" },
    ],
  },
];

const TabsCategory = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const tab = shopTabs[tabIndex];

  return (
    <div className="py-10 bg-primary/5">
      <div className="Mycontainer">
        <Heading
          title="More ways to shop"
          align="center"
          size="default"
          titleClassName="uppercase"
          description="Explore our wide range of promotional products"
          showUnderline={true}
          containerClassName="mb-6"
        />

        {/* Tab pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          {shopTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTabIndex(i)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${
                i === tabIndex
                  ? "bg-primary text-white shadow-md"
                  : "bg-secondary/10 text-secondary hover:bg-secondary/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab tagline */}
        <p className="text-center text-sm text-secondary/70 mb-6 max-w-xl mx-auto">
          {tab.tagline}
        </p>

        {/* 4-box grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
          {tab.subCategories.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              aria-label={item.label}
              className="bg-white rounded-xl overflow-hidden border border-secondary/10 shadow-sm hover:shadow-lg hover:border-primary transition-all duration-300 group"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="400"
                  className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = "/noimage.png"; }}
                />
              </div>
              <div className="p-2">
                <h3 className="text-secondary text-xs font-semibold text-center group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {item.label}
                </h3>
                <p className="text-secondary/60 text-xs text-center mt-0.5 line-clamp-2 leading-tight">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabsCategory;
