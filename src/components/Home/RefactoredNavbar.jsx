import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { googleLogout } from "@react-oauth/google";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Import reusable components
import { AppContext } from "../../context/AppContext";
import { NavigationMenu, SearchBar, UserActions } from "../Common";
import supermerch from "../../../public/logo.png";
import { useCoupons } from "@/hooks/useCoupons";
import {
  clearCurrentUser,
  currentUserCartAmount,
} from "@/redux/slices/cartSlice";
import { clearFavourites } from "@/redux/slices/favouriteSlice";
import {
  applyFilters,
  setMaxPrice,
  setMinPrice,
} from "../../redux/slices/filterSlice";

const RefactoredNavbar = ({ onCouponClick }) => {
  const {
    token,
    setToken,
    products,
    categoryProducts,
    setActiveFilterCategory,
    setSelectedParamCategoryId,
    setCurrentPage,
    setParamProducts,
    v1categories,
    setSidebarActiveCategory,
    setSidebarActiveLabel,
    setPaginationData,
  } = useContext(AppContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalQuantity = useSelector(currentUserCartAmount);
  const { favouriteQuantity } = useSelector((state) => state.favouriteProducts);

  // State management
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [navbarLogout, setNavbarLogout] = useState(false);
  const [coupenModel, setCoupenModel] = useState(false);
  const { coupons, coupenLoading } = useCoupons();
  // Create menu items from categories
  const createMenuItems = () => {
    const baseMenuItems = [
      {
        name: "Promotional",
        path: "/promotional?categoryName=Bags&category=PA&type=Promotional",
        hasSubmenu: true,
      },
      {
        name: "Clothing",
        path: "/promotional?categoryName=Bottoms&category=PB&type=Clothing",
        hasSubmenu: true,
      },
      {
        name: "Headwear",
        path: "/promotional?categoryName=Headwear&category=PK&type=Headwear",
        hasSubmenu: true,
      },
      { name: "Gifts", path: "/return-gifts", hasSubmenu: true },
      { name: "24hr Prod", path: "/24hr-production" },
      { name: "Deals", path: "/sales" },
      { name: "Australia Made", path: "/australia-made" },
    ];

    return baseMenuItems.map((item) => {
      if (item.name === "Promotional") {
        // Define the promotional structure based on the sheet using v2Categories
        const promotionalStructure = [
          {
            id: "PY", // Writing from v2Categories
            name: "Writing",
            columns: [
              {
                title: "Pens",
                items: [
                  "Metal Pens",
                  "Plastic Pens",
                  "Stylus Pens",
                  "Other Pens",
                  "Wooden Pens",
                ],
              },
              {
                title: "Pencil",
                items: ["Grey-Lead Pencils", "Coloured Pencils"],
              },
              {
                title: "Highlighter",
                items: ["Highlighters", "Markers"],
              },
              {
                title: "Misc",
                items: [
                  "Pencil Sharpeners",
                  "Erasers",
                  "Pen Packaging",
                  "Misc Writing",
                  // "Rulers",
                ],
              },
            ],
          },
          {
            id: "PA", // Bags from v2Categories
            name: "Bags",
            columns: [
              {
                title: "Tote Bag",
                items: ["Tote Bags", "Reusable Grocery Bags"],
              },
              {
                title: "Outdoor Bag",
                items: [
                  "Cooler Bags",
                  "Lunch Bags/Lunch Boxes",
                  "Duffle Bags",
                  "Dry Bags",
                  "Drawstring Bags",
                  "Backpacks",
                  "Bum Bags",
                ],
              },
              {
                title: "Business Bag",
                items: [
                  "Laptop Bags",
                  "Paper Bags",
                  "Satchels",
                  "Wheeled Bags",
                ],
              },
              {
                title: "Misc",
                items: [
                  "Wallets & Purses",
                  "Toiletry Bags & Accessories",
                  "Luggage Tags",
                  "Misc Bags",
                ],
              },
            ],
          },
          {
            id: "PE", // Drinkware from v2Categories
            name: "Drinkware",
            columns: [
              {
                title: "Bottles",
                items: ["Drink Bottles", "Thermoses"],
              },
              {
                title: "Mugs",
                items: ["Coffee Mugs", "Reusable Coffee Cups", "Travel Mugs"],
              },
              // {
              //   title: "Glasses",
              //   items: ["Beer Glasses", "Cocktail Glasses", "Shot Glasses", "Wine Glasses"],
              // },
              {
                title: "Tumblers",
                items: ["Plastic Cups & Tumblers", "Protein Shakers"],
              },
              {
                title: "Misc",
                items: [
                  "Misc Drinkware",
                  // "Coasters",
                  // "Bottle Openers",
                  "Stubby Holders",
                  "Drinking Straws",
                  "Flasks",
                ],
              },
            ],
          },
          {
            id: "PF", // Exhibitions & Events from v2Categories
            name: "Exhibitions & Events",
            columns: [
              {
                title: "Awards and Trophies",
                items: ["Awards & Trophies"],
              },
              {
                title: "Lanyards, Badges and Pins",
                items: [
                  "Lanyards",
                  "Name Badges",
                  "Lapel Pins",
                  "Badge Reels",
                  "Button Badges",
                  "Badge Holders",
                ],
              },
              {
                title: "Wristbands",
                items: ["Event Wristbands", "Silicon Wristbands"],
              },
              // {
              //   title: "Keyrings",
              //   items: ["Bottle Opener Keyrings", "Keyrings"],
              // },
              {
                title: "Misc",
                items: [
                  "Misc Events",
                  "Flags & Bunting",
                  "Balloons",
                  "Banners",
                  "Marquees",
                  "Signs",
                  "Table Covers",
                ],
              },
            ],
          },
          {
            id: "PM", // Home & Living from v2Categories
            name: "Home & Living",
            columns: [
              {
                title: "Candles",
                items: ["Candles"],
              },
              {
                title: "Kitchen",
                items: [
                  "Cheese Boards & Knives",
                  "Tea Towels",
                  "Chopping Boards",
                  "Cutlery Sets",
                  "Bottle Coolers",
                  "Hampers",
                ],
              },
              {
                title: "Blanket and Mats",
                items: ["Blankets", "Bar Mats", "Coasters"],
              },
              {
                title: "Decorative",
                items: [
                  "Money Boxes",
                  "Photo Frames",
                  "Picture Frames",
                  "Watches",
                ],
              },
              {
                title: "Misc",
                items: [
                  "Tea & Coffee Accessories",
                  "Pet Accessories",
                  "Misc Homeware",
                ],
              },
            ],
          },
          {
            id: "PT", // Print from v2Categories
            name: "Print",
            columns: [
              // {
              //   title: "Diaries",
              //   items: ["Diaries", "Notepads", "Notebooks"],
              // },
              {
                title: "Cards and Calendar",
                items: [
                  "Business Cards",
                  "Magnet Calendars",
                  "Wall Calendars",
                  "Desk Calendars",
                ],
              },
              {
                title: "Stickers",
                items: [
                  "Sticky Notes & Flags",
                  "Combo Pads",
                  "Pads & Planners",
                  "Stickers",
                  // "Compendiums & Portfolios",
                ],
              },
              // {
              //   title: "Gift Sets",
              //   items: ["Gift Sets"],
              // },
              {
                title: "Magnetic",
                items: [
                  "Magnets",
                  "Magnetic To-Do Lists",
                  "Magnetic Photo Frames",
                ],
              },
              {
                title: "More",
                items: ["Misc Print", "Packaging", "Ribbons"],
              },
            ],
          },
          {
            id: "PS", // Phone & Technology from v2Categories
            name: "Phone & Technology",
            columns: [
              {
                title: "Flashdrives",
                items: ["Flashdrives", "USB Hubs"],
              },
              {
                title: "Mobile",
                items: [
                  "Wireless Chargers",
                  "Powerbanks",
                  "Phone Wallets",
                  "USB Car Chargers",
                  "Cable Tidies",
                  "Car Phone Holders",
                  "Charging Cables",
                  "Phone Stands",
                ],
              },
              {
                title: "Speakers and Headphones",
                items: ["Speakers", "Earbuds", "Headphones"],
              },
              {
                title: "Misc",
                items: ["Cleaning Cloths", "Tablet Covers", "Travel Adapters"],
              },
            ],
          },
          {
            id: "PQ", // Leisure & Outdoors from v2Categories
            name: "Leisure & Outdoors",
            columns: [
              {
                title: "Umbrellas",
                items: ["Umbrellas", "Beach Umbrellas"],
              },
              {
                title: "Towels",
                items: [
                  "Gym Towels",
                  // "Bath Towels",
                  // "Hand Towels",
                  "Cooling Towels",
                  // "Golf Towels",
                ],
              },
              {
                title: "Picnic",
                items: [
                  "Bottled Water",
                  "Blankets",
                  "Picnic Rugs",
                  "BBQ Sets",
                  "Picnic Sets",
                  "Ice Buckets",
                ],
              },
              // {
              //   title: "Medical",
              //   items: ["Hand Sanitisers", "Face Masks", "First Aid Kits"],
              // },
              {
                title: "Shades",
                items: ["Sunglasses & Accessories", "Sunshades"],
              },
              {
                title: "Misc",
                items: [
                  "Chairs",
                  "Misc Outdoors",
                  "Seeds",
                  "Sports Balls",
                  "Sports Gear",
                  "Tables",
                  "Wine & Beer",
                ],
              },
            ],
          },
          {
            id: "PD", // Confectionery from v2Categories
            name: "Confectionery",
            columns: [
              {
                title: "Beans",
                items: ["Jelly Beans", "Choc Beans", "Jelly Babies"],
              },
              {
                title: "Lollies",
                items: [
                  "Mixed Lollies",
                  "Sugar Free Lollies",
                  "Lollipops",
                  "Mints",
                  "Gummi Lollies",
                  "Lozenges",
                ],
              },
              {
                title: "Chocolates",
                items: [
                  "Nuts & Savoury",
                  "Chocolates",
                  "Chewy Fruits",
                  "Biscuits & Cookies",
                  "Snakes",
                ],
              },
              {
                title: "Popcorn",
                items: ["Popcorn"],
              },
              {
                title: "Misc",
                items: ["Misc Confectionery"],
              },
            ],
          },
          {
            id: "PH", // Fun & Games from v2Categories
            name: "Fun & Games",
            columns: [
              {
                title: "Balls",
                items: [
                  "Stress Balls",
                  "Stress Fruit & Vegetables",
                  "Stress Keyrings",
                  "Stress Transport",
                  "Stress Animals",
                  "Misc Stress Shapes",
                ],
              },
              // {
              //   title: "Golf",
              //   items: ["Ball Markers", "Golf Balls", "Golf Tees", "Misc Golf"],
              // },
              {
                title: "Outdoor Toys",
                items: ["Frisbees & Throwing Toys", "Yo Yos"],
              },
              {
                title: "Indoor Toys",
                items: [
                  "Jigsaws",
                  "Novelty Items",
                  "Plush Toys",
                  "Puzzles",
                  "Games",
                ],
              },
              {
                title: "Misc",
                items: ["Misc Fun & Games"],
              },
            ],
          },
          // Additional categories not in sheet - add at the end
          {
            id: "PI", // Glassware
            name: "Glassware",
            columns: [
              {
                title: "Beer Glasses",
                items: ["Beer Glasses", "Beer Mugs"],
              },
              {
                title: "Wine & Cocktail",
                items: ["Wine Glasses", "Cocktail Glasses", "Shot Glasses"],
              },
              {
                title: "Tumblers",
                items: ["Glass Tumblers"],
              },
              {
                title: "Misc",
                items: ["Misc Glassware"],
              },
            ],
          },
          {
            id: "PJ", // Golf
            name: "Golf",
            columns: [
              {
                title: "Golf Equipment",
                items: ["Golf Balls", "Golf Tees", "Ball Markers"],
              },
              {
                title: "Golf Accessories",
                items: ["Golf Towels", "Golf Umbrellas", "Misc Golf"],
              },
            ],
          },
          {
            id: "PP", // Keyrings & Tools
            name: "Keyrings & Tools",
            columns: [
              {
                title: "Keyrings",
                items: ["Keyrings", "Bottle Opener Keyrings"],
              },
              {
                title: "Tools",
                items: [
                  "Tool Sets",
                  "Tape Measures",
                  "Torches",
                  "Carabiners",
                  "Bottle Openers",
                ],
              },
            ],
          },
          {
            id: "PL", // Health & Personal
            name: "Health & Personal",
            columns: [
              {
                title: "Health",
                items: [
                  "First Aid Kits",
                  "Hand Sanitisers",
                  "Face Masks",
                  "Sunscreens",
                ],
              },
              {
                title: "Personal Care",
                items: [
                  "Lip Balms",
                  "Hair, Nails & Beauty",
                  "Temporary Tattoos",
                ],
              },
              {
                title: "Towels",
                items: ["Bath Towels", "Hand Towels"],
              },
              {
                title: "Misc",
                items: ["Misc Health & Personal"],
              },
            ],
          },
          {
            id: "PR", // Office & Business
            name: "Office & Business",
            columns: [
              {
                title: "Stationery",
                items: [
                  "Notepads",
                  "Notebooks",
                  "Diaries",
                  "Pencil Cases",
                  "Rulers",
                ],
              },
              {
                title: "Office Accessories",
                items: [
                  "Business Card Holders",
                  "Calculators",
                  "Letter Openers",
                  "Sticky Notes & Flags",
                ],
              },
              {
                title: "Mats & More",
                items: [
                  "Mouse Mats",
                  "Counter Mats",
                  "Floor Mats",
                  "Compendiums & Portfolios",
                  "Misc Office",
                  "Gift Sets",
                ],
              },
            ],
          },
        ];

        // Map the structure to match the expected format
        const megaMenu = promotionalStructure.map((category) => {
          // Find matching v1category using the ID
          const v1Cat = v1categories?.find((c) => c.id === category.id);

          return {
            id: category.id,
            name: v1Cat?.name || category.name,
            onClick: () =>
              handleNameCategories(
                v1Cat?.name || category.name,
                category.id,
                "Promotional"
              ),
            columns: category.columns,
            subItems: category.columns.flatMap((col) =>
              col.items.map((itemName) => {
                // Find matching subtype from v1categories
                const subType = v1Cat?.subTypes?.find(
                  (st) => st.name.toLowerCase() === itemName.toLowerCase()
                );

                return {
                  id:
                    subType?.id || itemName.toLowerCase().replace(/\s+/g, "-"),
                  name: itemName,
                  columnTitle: col.title,
                  onClick: () =>
                    handleSubCategories(
                      itemName,
                      subType?.id ||
                        itemName.toLowerCase().replace(/\s+/g, "-"),
                      v1Cat?.name || category.name,
                      "Promotional"
                    ),
                };
              })
            ),
          };
        });

        return {
          ...item,
          id: "promotional",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Clothing") {
        // Define the clothing structure based on v2Categories
        const clothingStructure = [
          {
            id: "PX", // Workwear
            name: "Workwear",
            columns: [
              {
                title: "Work Tops",
                items: [
                  "Work Polo Shirts",
                  "Work Shirts",
                  "Work T-Shirts",
                  "Work Singlets",
                  "Work Hoodies",
                  "Work Jumpers",
                ],
              },
              {
                title: "Work Bottoms",
                items: ["Work Pants", "Work Shorts"],
              },
              {
                title: "Work Jackets & More",
                items: [
                  "Work Jackets",
                  "Work Vests",
                  "Work Polar Fleece",
                  "Aprons",
                  "Work Socks",
                  "Misc Workwear",
                ],
              },
            ],
          },
          {
            id: "PW", // Uniforms
            name: "Hospitality Uniforms",
            columns: [
              {
                title: "Medical Uniforms",
                items: ["Scrubs", "Scrub Tops", "Scrub Bottoms", "Lab Coats"],
              },
              {
                title: "Work Uniforms",
                items: ["Chefwear", "Tunics", "Roughalls & Overalls"],
              },
              {
                title: "Other Uniforms",
                items: ["Safety Wear", "Salon & Spa", "Misc Uniforms"],
              },
            ],
          },
          {
            id: "PV", // Sports Uniforms
            name: "Sportswear",
            columns: [
              {
                title: "Sports Tops",
                items: [
                  "Jerseys",
                  "Crop Tops",
                  "Sports Jumpers",
                  "Bibs",
                  "Sports Vest",
                ],
              },
              {
                title: "Sports Bottoms",
                items: ["Sports Shorts", "Sports Skirts", "Sports Dresses"],
              },
              {
                title: "Accessories",
                items: ["Sports Socks", "Misc Sports Uniforms"],
              },
            ],
          },
          {
            id: "PU", // Shirts
            name: "Shirts",
            columns: [
              {
                title: "Formal Shirts",
                items: ["Button-Up Shirts", "Polo Shirts"],
              },
              {
                title: "Casual Shirts",
                items: ["T-Shirts", "Singlets"],
              },
              {
                title: "Misc",
                items: ["Misc Shirts"],
              },
            ],
          },
          {
            id: "PB", // Bottoms
            name: "Bottoms",
            columns: [
              {
                title: "Pants",
                items: ["Cargo Pants", "Chefs Pants", "Slacks", "Track Pants"],
              },
              {
                title: "Shorts & Dresses",
                items: ["Dress Shorts", "Sports Shorts", "Dresses"],
              },
              {
                title: "Other Bottoms",
                items: ["Leggings", "Skirts", "Misc Bottoms"],
              },
            ],
          },
          {
            id: "PN", // Jackets
            name: "Jackets",
            columns: [
              {
                title: "Formal Jackets",
                items: ["Blazers & Suit Jackets", "Trench Coats"],
              },
              {
                title: "Casual Jackets",
                items: ["Cardigans", "Puffer Jackets", "Varsity Jackets"],
              },
              {
                title: "Work Jackets",
                items: [
                  "Chefs Jackets",
                  "Rain Jackets",
                  "Track Jackets",
                  "Ponchos",
                ],
              },
              {
                title: "Fleece & More",
                items: [
                  "Polar Fleece Jacket",
                  "Soft Shell Jackets",
                  "Misc Jackets",
                ],
              },
            ],
          },
          {
            id: "PO", // Jumpers
            name: "Jumpers",
            columns: [
              {
                title: "Hoodies & Vests",
                items: ["Hoodies", "Vests"],
              },
              {
                title: "Sweaters",
                items: ["Knitted Jumpers", "Sweaters", "Polar Fleece Jumpers"],
              },
              {
                title: "Misc",
                items: ["Misc Jumpers"],
              },
            ],
          },
          {
            id: "PG", // Footwear
            name: "Footwear",
            columns: [
              {
                title: "Footwear",
                items: ["Boots", "Thongs"],
              },
              {
                title: "Accessories",
                items: ["Socks", "Misc Footwear"],
              },
            ],
          },

          {
            id: "PC", // Clothing Accessories
            name: "Clothing Accessories",
            columns: [
              {
                title: "Formal Accessories",
                items: ["Ties", "Cufflinks", "Belts"],
              },
              {
                title: "Winter Accessories",
                items: ["Scarves", "Gloves"],
              },
              {
                title: "Misc",
                items: ["Misc Clothing Accessories"],
              },
            ],
          },
        ];

        // Map the structure to match the expected format
        const megaMenu = clothingStructure.map((category) => {
          // Find matching v1category using the ID
          const v1Cat = v1categories?.find((c) => c.id === category.id);

          return {
            id: category.id,
            name: v1Cat?.name || category.name,
            onClick: () =>
              handleNameCategories(
                v1Cat?.name || category.name,
                category.id,
                "Clothing"
              ),
            columns: category.columns,
            subItems: category.columns.flatMap((col) =>
              col.items.map((itemName) => {
                // Find matching subtype from v1categories
                const subType = v1Cat?.subTypes?.find(
                  (st) => st.name.toLowerCase() === itemName.toLowerCase()
                );

                return {
                  id:
                    subType?.id || itemName.toLowerCase().replace(/\s+/g, "-"),
                  name: itemName,
                  columnTitle: col.title,
                  onClick: () =>
                    handleSubCategories(
                      itemName,
                      subType?.id ||
                        itemName.toLowerCase().replace(/\s+/g, "-"),
                      v1Cat?.name || category.name,
                      "Clothing"
                    ),
                };
              })
            ),
          };
        });

        return {
          ...item,
          id: "clothing",
          submenu: megaMenu,
          megaMenu: true,
          onClick: () => handleMenuClick(item),
        };
      }

      if (item.name === "Headwear") {
        const headwearCategory = v1categories?.find(
          (cat) => cat.name === "Headwear"
        );
        return {
          ...item,
          id: "headwear",
          submenu:
            headwearCategory?.subTypes?.map((subType) => ({
              id: subType.id,
              name: subType.name,
              onClick: () =>
                handleSubCategories(
                  subType.name,
                  subType.id,
                  headwearCategory.name,
                  "Headwear"
                ),
            })) || [],
          onClick: () => handleMenuClick(item),
        };
      }
      if (item.name === "Gifts") {
        return {
          ...item,
          id: "gifts",
          submenu: [
            {
              id: "gift-hampers",
              name: "Gift Hampers",
              onClick: () => handleMenuClick(item),
            },
          ],
          onClick: () => handleMenuClick(item),
        };
      }

      return {
        ...item,
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        onClick: () => handleMenuClick(item),
      };
    });
  };

  const handleSearch = (searchTerm) => {
    navigate(
      `/search?search=${searchTerm}${
        selectedCategory.id ? `&categoryId=${selectedCategory.id}` : ""
      }`
    );
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleMenuClick = (item) => {
    if (item?.name === "Gifts") {
      navigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  const handleNameCategories = (titleName, NameId, parentType) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedType = encodeURIComponent(parentType || titleName);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());
    //also add weather it is promotional, clothing or headwear in url in type
    navigate(
      `/promotional?categoryName=${encodedTitleName}&category=${NameId}&type=${encodedType}`
    );
    setSelectedParamCategoryId(NameId);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
    setActiveFilterCategory(null);
  };

  const handleSubCategories = (
    subCategory,
    categoryId,
    titleName,
    parentType
  ) => {
    const encodedTitleName = encodeURIComponent(titleName);
    const encodedSubCategory = encodeURIComponent(subCategory);
    const encodedType = encodeURIComponent(parentType || titleName);
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000));
    dispatch(applyFilters());

    // Determine the correct route based on the category name
    let targetRoute = "/promotional"; // Default fallback

    // if (titleName === "Clothing") {
    //   targetRoute = "/Clothing";
    // } else if (titleName === "Headwear") {
    //   targetRoute = "/Headwear";
    // } else if (titleName === "Capital Equipment") {
    //   targetRoute = "/promotional"; // Keep as promotional for now
    // }
    // For all other categories, use /Spromotional

    navigate(
      `${targetRoute}?categoryName=${encodedTitleName}&category=${categoryId}&subCategory=${encodedSubCategory}&type=${encodedType}`
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    googleLogout();
    dispatch(clearCurrentUser());
    dispatch(clearFavourites());
    navigate("/login");
  };

  useEffect(() => {
    if (navbarLogout) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navbarLogout]);

  // Close search when clicking outside

  const menuItems = createMenuItems();

  return (
    <>
      {/* Main Navbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sm:py-2 sticky top-0 z-[50] pb-4">
        <div className="flex items-center justify-between gap-3 !px-0 md:px-0 Mycontainer flex-wrap">
          {/* Mobile Menu Button */}
          <Sheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            className="xl:hidden"
          >
            <SheetTrigger className="text-gray-700 focus:outline-none p-2.5 hover:bg-gray-100 rounded-lg transition-colors xl:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </SheetTrigger>
            <SheetContent
              className="overflow-y-auto w-[85vw] sm:w-[400px] bg-white"
              side="left"
            >
              <SheetHeader>
                <SheetTitle className="mb-6 text-2xl text-primary font-bold">
                  <img
                    src={supermerch}
                    alt="SuperMerch"
                    className="h-20 w-auto object-contain mx-auto"
                  />
                </SheetTitle>
              </SheetHeader>
              <NavigationMenu
                menuItems={menuItems}
                onItemClick={(item) => {
                  handleMenuClick(item);
                  setIsSheetOpen(false);
                }}
                onSubItemClick={() => setIsSheetOpen(false)}
                variant="vertical"
                size="default"
              />
            </SheetContent>
          </Sheet>

          {/* Navigation Menu - Desktop */}
          <div className="hidden xl:block">
            <NavigationMenu
              menuItems={menuItems}
              onItemClick={handleMenuClick}
              size="default"
              className="justify-start"
            />
          </div>

          {/* Search Bar - Center */}
          <div className="w-full flex-1 mx-2 sm:mx-4 order-3 lg:order-2">
            <SearchBar
              onSearch={handleSearch}
              categoryData={v1categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              size="small"
              className="w-full"
            />
          </div>

          {/* User Actions - Right */}
          <div className="flex items-center gap-3 order-2 lg:order-3">
            <UserActions
              isAuthenticated={!!token}
              onLogout={() => setNavbarLogout(true)}
              cartQuantity={totalQuantity}
              favouriteQuantity={favouriteQuantity}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {navbarLogout && (
        <motion.div className="fixed inset-0 top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className="flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white p-5 rounded-md"
          >
            <p className="text-sm font-semibold">
              Are you sure you want to logout?
            </p>
            <p className="text-sm text-gray-500">
              You can login back at any time. All the changes you've been made
              will not be lost.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 text-gray-700 transition duration-300 border rounded hover:bg-gray-100"
                onClick={() => setNavbarLogout(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setNavbarLogout(false);
                }}
                className="px-3 py-1 text-white transition-all bg-red-600 rounded hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Coupon Modal */}
      {coupenModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800">
              🎁 Exclusive Offers!
            </h2>

            {coupenLoading ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : coupons.length > 0 ? (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3"
                  >
                    <p className="text-lg font-bold text-primary">
                      {coupon.coupen}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Get <strong>{coupon.discount}% OFF</strong> on your order
                    </p>
                    <p
                      className="text-primary text-sm cursor-pointer hover:underline"
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.coupen);
                        toast.success(`${coupon.coupen} copied!`);
                      }}
                    >
                      📋 Copy Coupon
                    </p>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-3">
                  Use any code at checkout • Valid on all products
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-lg text-gray-600">No Coupons Available</p>
                <p className="text-sm text-gray-500">
                  Check back soon for deals!
                </p>
              </div>
            )}

            <button
              onClick={() => setCoupenModel(false)}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition duration-200"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RefactoredNavbar;
