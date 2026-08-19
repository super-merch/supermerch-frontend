import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "../Common";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

import tradie from "../../assets/bag.jpg";
import tracksuit from "../../assets/trouser.png";
import corporate from "../../assets/laptop.jpg";
import cap from "../../assets/cap.png";
import lanyard from "../../assets/lanyard.jpg";
import packing from "../../assets/packing.jpg";
import notebook from "../../assets/category-notebook.webp";
import jersey from "../../assets/shirt2.png";

import industryTrades from "../../assets/mwts-industry-trades.jpg";
import industryRealEstate from "../../assets/mwts-industry-realestate.jpg";
import industryIT from "../../assets/mwts-industry-it.jpg";
import industryHospitality from "../../assets/mwts-industry-hospitality.png";

import recipientExecutives from "../../assets/mwts-recipient-executives.png";
import recipientConference from "../../assets/mwts-recipient-conference.png";
import recipientStaff from "../../assets/mwts-recipient-staff.jpg";
import recipientCustomer from "../../assets/mwts-recipient-customer.jpg";

const shopTabs = [
  {
    id: "industry",
    label: "Industry",
    subCategories: [
      { label: "For the Tradie",               image: industryTrades,      path: "/collections/trades?page=1",        color: "#b07d5a" },
      { label: "For the Real Estate Agent",    image: industryRealEstate,  path: "/collections/real-estate?page=1",  color: "#6b8f71" },
      { label: "For the IT Professional",      image: industryIT,          path: "/promotional?categoryName=Phone+%26+Technology&category=PS&type=Promotional&page=1", color: "#5a7a9e" },
      { label: "For the Hospitality Business", image: industryHospitality, path: "/collections/hospitality?page=1",  color: "#a07868" },
    ],
  },
  {
    id: "recipient",
    label: "Recipient",
    subCategories: [
      { label: "For the Executive",            image: recipientExecutives, path: "/return-gifts?page=1",              color: "#8a7050" },
      { label: "For the Conference Attendee",  image: recipientConference, path: "/collections/conference?page=1",   color: "#5a8a88" },
      { label: "For the Staff & Team",         image: recipientStaff,      path: "/promotional?categoryName=Office+%26+Business&category=PR&type=Promotional&page=1", color: "#7a6a90" },
      { label: "For the Customer",             image: recipientCustomer,   path: "/promotional?categoryName=Exhibitions+%26+Events&category=PF&type=Promotional&page=1", color: "#7a8f60" },
    ],
  },
  {
    id: "bundles",
    label: "Bundles",
    subCategories: [
      { label: "For the Tradie Bundle",  image: tradie,    path: "/contact", color: "#b07d5a" },
      { label: "For the Workwear Team",  image: tracksuit, path: "/contact", color: "#5a7a9e" },
      { label: "For the Corporate Pack", image: corporate, path: "/contact", color: "#4a6a5a" },
      { label: "For the Headwear Fan",   image: cap,       path: "/contact", color: "#a07868" },
    ],
  },
  {
    id: "overseas",
    label: "Overseas Sourcing",
    subCategories: [
      { label: "For the Custom Lanyard",  image: lanyard,  path: "/contact", color: "#6b8f71" },
      { label: "For the Gift Hamper",     image: packing,  path: "/contact", color: "#8a7050" },
      { label: "For the Notebook Lover",  image: notebook, path: "/contact", color: "#5a7a9e" },
      { label: "For the Sports Team",     image: jersey,   path: "/contact", color: "#7a6a90" },
    ],
  },
];

// Carousel geometry
const CARD_W  = 260;
const CARD_H  = 400;
const IMG_H   = CARD_H * 0.60;
const STEP    = 210;
const CONFIGS = {
  "-2": { scale: 0.76, opacity: 0.60, z: 1 },
  "-1": { scale: 0.88, opacity: 0.88, z: 2 },
   "0": { scale: 1.00, opacity: 1.00, z: 3 },
   "1": { scale: 0.88, opacity: 0.88, z: 2 },
   "2": { scale: 0.76, opacity: 0.60, z: 1 },
};

const getConfig = (pos) => CONFIGS[String(pos)] ?? { scale: 0.70, opacity: 0, z: 0 };

const displayPos = (rel, n) => {
  if (rel === 0) return 0;
  if (rel <= Math.floor(n / 2)) return rel;
  return rel - n;
};

const AUTO_MS = 3000;

const TabsCategory = () => {
  const navigate  = useNavigate();
  const [tabIndex,  setTabIndex]  = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const pausedRef = useRef(false);

  const tab   = shopTabs[tabIndex];
  const items = tab.subCategories;
  const n     = items.length;

  useEffect(() => {
    setCardIndex(0);
    const t = setInterval(() => {
      if (!pausedRef.current) setCardIndex((c) => (c + 1) % n);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [tabIndex, n]);

  const prev = () => setCardIndex((c) => (c - 1 + n) % n);
  const next = () => setCardIndex((c) => (c + 1) % n);

  return (
    <div className="py-12 bg-primary/5">
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
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {shopTabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => { setTabIndex(i); setCardIndex(0); }}
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
      </div>

      {/* Carousel */}
      <div
        className="relative overflow-hidden"
        style={{ height: CARD_H + 40 }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div className="relative w-full h-full">
          {items.map((item, i) => {
            const rel     = ((i - cardIndex) + n) % n;
            const pos     = displayPos(rel, n);
            const cfg     = getConfig(pos);
            const isCenter = pos === 0;

            return (
              <div
                key={item.label}
                onClick={() => isCenter && navigate(item.path || `/category?categoryName=${encodeURIComponent(tab.label)}&subCategory=${encodeURIComponent(item.label)}`)}
                style={{
                  position:  "absolute",
                  top:       "50%",
                  left:      "50%",
                  width:     CARD_W,
                  height:    CARD_H,
                  transform: `translate(-50%, -50%) translateX(${pos * STEP}px) scale(${cfg.scale})`,
                  zIndex:    cfg.z,
                  opacity:   cfg.opacity,
                  transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease",
                  cursor:    isCenter ? "pointer" : "default",
                  borderRadius: "16px",
                  overflow:  "hidden",
                  boxShadow: isCenter
                    ? "0 4px 18px rgba(0,0,0,0.13)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  border: isCenter ? "2px solid rgba(0,0,0,0.18)" : "1.5px solid rgba(0,0,0,0.07)",
                }}
              >
                {/* Image section */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{ height: IMG_H, background: "#f5f2ee" }}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    draggable="false"
                  />
                </div>

                {/* Colour label section */}
                <div
                  className="w-full flex flex-col justify-center px-5"
                  style={{ height: CARD_H - IMG_H, background: item.color }}
                >
                  <p className="text-white font-semibold leading-snug"
                     style={{ fontSize: isCenter ? "1.1rem" : "0.95rem" }}>
                    {item.label}
                  </p>
                  {isCenter && (
                    <p className="text-white/70 text-xs mt-1">Explore collection →</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow border border-secondary/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
          aria-label="Previous"
        >
          <IoArrowBackOutline size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow border border-secondary/10 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
          aria-label="Next"
        >
          <IoArrowForwardOutline size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCardIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === cardIndex ? "bg-primary w-6" : "bg-secondary/25 w-2"
            }`}
            aria-label={`Card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TabsCategory;
