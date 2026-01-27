
import React, { useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ProductsContext } from "@/context/ProductsContext";
import { megaMenu } from "@/assets/assets";
import { toast } from "react-toastify";
import trophy from "../../assets/trophy.jpg";
import collection4 from "../../assets/pen.jpg";
import stylus from "../../assets/stylus.jpg";
import metal from "../../assets/metal.jpg";
import plastic from "../../assets/plastic.jpg";
import other from "../../assets/other.jpg";
import grayLead from "../../assets/gray-lead.jpg";
import highlighter from "../../assets/highlighter.jpg";
import marker from "../../assets/marker.jpg";
import eraser from "../../assets/eraser.jpg";
import sharpner from "../../assets/sharpner.jpg";
import packing from "../../assets/packing.jpg";
import cases from "../../assets/cases.jpg";
import grocery from "../../assets/grocery.jpg";
import tote from "../../assets/tote.jpg";
import cooler from "../../assets/cooler.jpg";
import magnet from "../../assets/magnet.jpg";
import sports from "../../assets/sports.jpg";
import travel from "../../assets/travel.jpg";
import lunch from "../../assets/lunch.jpg";
import laptop from "../../assets/laptop.jpg";
import satchel from "../../assets/satchels.jpg";
import wheel from "../../assets/wheel.jpg";
import paper from "../../assets/paper.jpg";
import toiletry from "../../assets/toiletry.jpg";
import tags from "../../assets/tags.jpg";
import wallet from "../../assets/wallet.jpg";
import bottled from "../../assets/bottled.jpg";
import drinkBottle from "../../assets/drinkBottle.jpg";
import thermose from "../../assets/thermose.jpg";
import coffee from "../../assets/coffee.jpg";
import beerMugs from "../../assets/beerMugs.jpg";
import travelMugs from "../../assets/travelMugs.jpg";
import reuseCoffee from "../../assets/reuseCoffee.jpg";
import glass from "../../assets/glass.jpg";
import cockGlass from "../../assets/cockGlass.jpg";
import beerGlass from "../../assets/beerGlass.jpg";
import shotGlass from "../../assets/shotGlass.jpg";
import wineGlass from "../../assets/wineGlass.jpg";
import protienShaker from "../../assets/protienShaker.jpg";
import glassTumbler from "../../assets/glassTumbler.jpg";
import plasticCup from "../../assets/plasticCup.jpg";
import lapel from "../../assets/lapel.jpg";
import nameBadge from "../../assets/nameBadge.jpg";
import badgeReel from "../../assets/badgeReel.jpg";
import lanyard from "../../assets/lanyard.jpg";
import eventWrist from "../../assets/eventWrist.jpg";
import siliconWrist from "../../assets/siliconWrist.jpg";
import keyring from "../../assets/keyring.jpg";
import openerKeyring from "../../assets/openerKeyring.jpg";


const Category = () => {
  const { shopCategory, setSelectedParamCategoryId, setActiveFilterCategory, setCurrentPage, setSidebarActiveCategory } = useContext(ProductsContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const mainCategoryId = queryParams.get("category");
  const mainCategoryName = queryParams.get("categoryName");
  const subCategoryLabel = queryParams.get("subCategory");

  // Find the main category using the id from the query parameter
  const mainCategory = megaMenu.find((cat) => cat.id === mainCategoryId);
  // Find the subcategory using the selected shopCategory (e.g., "Pens")
  const subCategory = mainCategory?.subTypes.find(
    (sub) => sub.label === subCategoryLabel
  );

  const handleSubCategories = (subCategory, categoryId, titleName, labelName) => {
    if (!categoryId) {
        toast.error("Category ID is missing!");
        return;
    }
    const encodedTitleName = encodeURIComponent(titleName); // Encode the title
    const encodedLabelName = encodeURIComponent(labelName); // Encode the title
    navigate(`/promotional?categoryName=${encodedTitleName}&category=${categoryId}&label=${encodedLabelName}&subCategory=${subCategory}`);
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory)
    setCurrentPage(1);
    setSidebarActiveCategory(titleName)
};

  return (
    <div className="Mycontainer">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mt-4 text-lg text-smallHeader">
        <Link to="/">Home</Link>
         <span>{`>`}</span>
        <span>{mainCategoryName}</span>
        <span>{`>`}</span>
        <span>{subCategoryLabel}</span>
      </div>

      <h1 className="pt-6 text-3xl font-semibold text-brand">
        {mainCategoryName} - {subCategoryLabel}
      </h1>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {subCategory?.items ? (
          subCategory.items.slice(0,4).map((item) => (
            <div
              key={item.id}
              className="text-center transition duration-300 transform border rounded shadow-sm cursor-pointer group hover:scale-105"
              onClick={() => {
                handleSubCategories(item.name, item.id, mainCategory.name, subCategoryLabel)
              }
              }
            >
              <img
              src={item.name=="Other Pens" && collection4 || item.name=="Metal Pens" && metal || item.name=="Glassware" && glass || item.name=="Fridge Magnets" && magnet || item.name=="Plastic Pens" && plastic || item.name=="Stylus Pens" && stylus || item.name=="Lead Pencils" && grayLead || item.name=="Coloured Pencils" && other || item.name=="Highlighters" && highlighter || item.name=="Markers" && marker || item.name == "Erasers" &&eraser || item.name == "Pencil Sharpeners" &&sharpner || item.name == "Pencils Cases" &&cases || item.name == "Pen Packaging" &&packing || item.name == "Reusable Grocery Bags" &&grocery || item.name ==="Tote Bags" && tote || item.name ==="Cooler Bags" &&cooler || item.name ==="Duffle/Sports Bags" &&sports || item.name ==="Travel Bum Bags" &&travel || item.name ==="Bum Bags" &&travel || item.name ==="Lunch Bags/Lunch Boxes" &&lunch || item.name ==="Laptops Bags" &&laptop || item.name ==="Satchels" &&satchel || item.name ==="Wheeled Bags" &&wheel || item.name ==="Paper Bags" &&paper || item.name ==="Toiletry Bags & Accessories" &&toiletry || item.name ==="Luggage Tags" &&tags || item.name ==="Wallets & Purses" &&wallet || item.name ==="Bottled Water" &&bottled || item.name ==="Drink Bottles" &&drinkBottle || item.name ==="Thermoses" &&thermose || item.name ==="Coffee Mugs" &&coffee || item.name ==="Beer Mugs" &&beerMugs || item.name ==="Travel Mugs" &&travelMugs || item.name ==="Reusable Coffee Cups" &&reuseCoffee || item.name ==="Cocktail Glasses" &&cockGlass || item.name ==="Beer Glasses" &&beerGlass || item.name ==="Shot Glasses" &&shotGlass || item.name ==="Wine Glasses" &&wineGlass || item.name ==="Protein Shakers" &&protienShaker || item.name ==="Sports Shakers" &&protienShaker || item.name ==="Glass Tumblers" &&glassTumbler || item.name ==="Plastic Cups And Tumblers" &&plasticCup ||
              item.name =="Name Badges" && nameBadge || item.name == "Awards & Trophies" && trophy || item.name == "Lanyards" && lanyard || item.name == "Lapel Pins" && lapel || item.name == "Badge Reels" && badgeReel || item.name == "Badge Holders" && badgeReel  || item.name == "Event Wristbands" && eventWrist || item.name == "Wristbands" && eventWrist || item.name == "Silicon Wristbands" && siliconWrist || item.name == "Bottle Opener Keyrings" && openerKeyring || item.name == "Keyrings" && keyring
              }
              alt=""
              className="w-full mb-3"
            />
              <p className="text-lg font-medium">{item.name}</p>
            </div>
          ))
        ) : (
          <p>No items found for this subcategory.</p>
        )}
      </div>
    </div>
  );
};

export default Category;
