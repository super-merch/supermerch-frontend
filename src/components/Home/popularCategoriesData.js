import awardsImage from "@/assets/category-awards.webp";
import bagsImage from "@/assets/category-bags.webp";
import waterBottleImage from "@/assets/category-water-bottle.webp";
import notebookImage from "@/assets/category-notebook.webp";
import poloImage from "@/assets/category-polo.webp";
import corporateGiftsImage from "@/assets/category-corporate-gifts.webp";
import pensImage from "@/assets/category-pens.webp";
import rushOrderImage from "@/assets/category-rush-order.webp";

export const popularCategories = [
  {
    name: "Corporate Hampers",
    image: corporateGiftsImage,
    path: "/return-gifts?page=1",
  },
  {
    name: "Notebooks",
    image: notebookImage,
    path: "/promotional?categoryName=Office+%26+Business&category=PR-11&subCategory=Notebooks&type=Promotional&page=1",
  },
  {
    name: "Water Bottles",
    image: waterBottleImage,
    path: "/promotional?categoryName=Drinkware&category=PE-02&subCategory=Drink+Bottles&type=Promotional&page=1",
  },
  {
    name: "Pens",
    image: pensImage,
    path: "/promotional?categoryName=Writing&category=PY&type=Promotional&page=1",
  },
  {
    name: "Polo Shirts",
    image: poloImage,
    path: "/promotional?categoryName=Shirts+%26+Tee&category=PU-03&subCategory=Polo+Shirts&type=Clothing&page=1",
  },
  {
    name: "Bags",
    image: bagsImage,
    path: "/promotional?categoryName=Bags&category=PA&type=Promotional&page=1",
  },
  {
    name: "Awards",
    image: awardsImage,
    path: "/promotional?categoryName=Exhibitions+%26+Events&category=PF-01&subCategory=Awards+%26+Trophies&type=Promotional&page=1",
  },
  {
    name: "Rush Order",
    image: rushOrderImage,
    path: "/24hr-production?expressWindow=sameday&page=1",
  },
];
