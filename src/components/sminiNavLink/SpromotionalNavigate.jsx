import { AppContext } from '@/context/AppContext';
import React, { useContext } from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const megaMenu = [
  {
    "id": "N",
    "name": "Writing",
    "subTypes": [
      {
        "id": "N-07",
        "name": "Metal Pens"
      },
      {
        "id": "N-11",
        "name": "Plastic Pens"
      },
      {
        "id": "N-12",
        "name": "Stylus Pens"
      },
      {
        "id": "N-08",
        "name": "Other Pens"
      },
      {
        "id": "N-06",
        "name": "Grey-Lead Pencils"
      },
      {
        "id": "N-01",
        "name": "Coloured Pencils"
      },
      {
        "id": "N-05",
        "name": "Highlighters"
      },
      {
        "id": "N-09",
        "name": "Markers"
      },
      {
        "id": "N-10",
        "name": "Pencil Sharpeners"
      },
      {
        "id": "N-03",
        "name": "Erasers"
      },
      {
        "id": "N-09",
        "name": "Pen Packaging"
      },
      {
        "id": "3",
        "name": "Pencils Cases"
      },
      {
        "id": "4",
        "name": "Rulers"
      },
    ]
  },
  {
    "id": "A",
    "name": "Bags",
    "subTypes": [
      {
        "id": "A-13",
        "name": "Tote Bags"
      },
      {
        "id": "5",
        "name": "Reuseable Grocery Bags"
      },
      {
        "id": "A-03",
        "name": "Cooler Bags"
      },
      {
        "id": "A-08",
        "name": "Lunch Bags/Lunch Boxes"
      },
      {
        "id": "A-05",
        "name": "Duffle/Sports Bags"
      },
      {
        "id": "A-14",
        "name": "Travel Bum Bags"
      },
      {
        "id": "6",
        "name": "Camping Dry Bags"
      },
      {
        "id": "A-04",
        "name": "Drawstring Backpacks"
      },
      {
        "id": "A-01",
        "name": "Backpacks"
      },
      {
        "id": "A-06",
        "name": "Laptops Bags"
      },
      {
        "id": "A-09",
        "name": "Paper Bags"
      },
      {
        "id": "A-10",
        "name": "Satchels"
      },
      {
        "id": "A-02",
        "name": "Wheeled Bags"
      },
      {
        "id": "A-15",
        "name": "Wallets & Purses"
      },
      {
        "id": "A-12",
        "name": "Toiletry Bags & Accessories"
      },
      {
        "id": "A-07",
        "name": "Luggage Tags"
      },
    ]
  },
  {
    "id": "C",
    "name": "Drinkware",
    "subTypes": [
      {
        "id": "C-04",
        "name": "Drink Bottles"
      },
      {
        "id": "7",
        "name": "Thermoses"
      },
      {
        "id": "8",
        "name": "Bottled Water"
      },
      {
        "id": "C-09",
        "name": "Coffee Mugs"
      },
      {
        "id": "C-08",
        "name": "Beer Mugs"
      },
      {
        "id": "9",
        "name": "Reusable Coffee Cups"
      },
      {
        "id": "C-12",
        "name": "Travel Mugs"
      },
      {
        "id": "C-01",
        "name": "Beer Glasses"
      },
      {
        "id": "10",
        "name": "Cocktail Glasses"
      },
      {
        "id": "C-13",
        "name": "Shot Glasses"
      },
      {
        "id": "11",
        "name": "Wine Glasses"
      },
      {
        "id": "C-03",
        "name": "Plastic Cups And Tumblers"
      },
      {
        "id": "C-10",
        "name": "Protein Shakers"
      },
      {
        "id": "C-02",
        "name": "Glass Tumblers"
      },



      {
        "id": "C-05",
        "name": "Bottle Coolers"
      },
      {
        "id": "C-06",
        "name": "Coasters"
      },
      {
        "id": "C-11",
        "name": "Bottle Openers"
      },
      {
        "id": "12",
        "name": "Stubby Holders"
      },
      {
        "id": "13",
        "name": "Drinking Straws"
      },
      {
        "id": "14",
        "name": "Flasks"
      },
    ]
  },
  {
    "id": "D",
    "name": "Exhibitions & Events",
    "subTypes": [
      {
        "id": "D-01",
        "name": "Awards & Trophies"
      },
      {
        "id": "D-07",
        "name": "Lanyards"
      },
      {
        "id": "D-08",
        "name": "Name Badges"
      },
      {
        "id": "D-02",
        "name": "Lapel Pins"
      },
      {
        "id": "15",
        "name": "Badge Reels"
      },
      {
        "id": "16",
        "name": "Button Badge"
      },
      {
        "id": "17",
        "name": "Badge Holders"
      },
      {
        "id": "D-10",
        "name": "Event Wristbands"
      },
      {
        "id": "18",
        "name": "Silicon Wristbands"
      },
      {
        "id": "19",
        "name": "Bottle Opener Keyrings"
      },
      {
        "id": "K-05",
        "name": "Keyrings"
      },
      {
        "id": "D-04",
        "name": "Flags & Bunting"
      },
      {
        "id": "20",
        "name": "Balloons"
      },
      {
        "id": "D-03",
        "name": "Banners"
      },
      {
        "id": "D-11",
        "name": "Marquees"
      },
      {
        "id": "21",
        "name": "Signs"
      },
      {
        "id": "D-09",
        "name": "Table Covers"
      },
    ]
  },
  {
    "id": "E",
    "name": "Food",
    "subTypes": [
      {
        "id": "53",
        "name": "Jelly Beans"
      },
      {
        "id": "54",
        "name": "Choc Beans"
      },
      {
        "id": "55",
        "name": "Jelly Babies"
      },
      {
        "id": "56",
        "name": "Mixed Lollies"
      },
      {
        "id": "E-05",
        "name": "Lollipops"
      },
      {
        "id": "E-06",
        "name": "Mints"
      },
      {
        "id": "57",
        "name": "Gummi Lollies"
      },
      {
        "id": "58",
        "name": "Lozenges"
      },
      {
        "id": "59",
        "name": "Nuts & Savoury"
      },
      {
        "id": "E-02",
        "name": "Chocolates"
      },
      {
        "id": "60",
        "name": "Chewy Fruits"
      },
      {
        "id": "61",
        "name": "Biscuits & Cookies"
      },
      {
        "id": "62",
        "name": "Snakes"
      },
      {
        "id": "63",
        "name": "Popcorn"
      },
    ]
  },
  {
    "id": "F",
    "name": "Fun & Games",
    "subTypes": [
      {
        "id": "64",
        "name": "Stress Balls"
      },
      {
        "id": "65",
        "name": "Stress Fruit & Vegetables"
      },
      {
        "id": "66",
        "name": "Stress Keyrings"
      },
      {
        "id": "67",
        "name": "Stress Transport"
      },
      {
        "id": "68",
        "name": "Stress Animals"
      },
      {
        "id": "69",
        "name": "More Stress Shapes"
      },
      {
        "id": "70",
        "name": "Golf Ball Markers"
      },
      {
        "id": "L-05",
        "name": "Golf Balls"
      },
      {
        "id": "71",
        "name": "Golf Tees"
      },
      {
        "id": "72",
        "name": "Misc Golf"
      },
      {
        "id": "73",
        "name": "Frisbees & Throwing Toys"
      },
      {
        "id": "74",
        "name": "Yo Yos"
      },
      {
        "id": "L-12",
        "name": "Sports Gear"
      },
      {
        "id": "75",
        "name": "Jigsaws"
      },
      {
        "id": "F-02",
        "name": "Novelty Items"
      },
      {
        "id": "76",
        "name": "Plush Toys"
      },
      {
        "id": "F-03",
        "name": "Puzzles"
      },
      {
        "id": "F-01",
        "name": "Games"
      },
    ]
  },
  {
    "id": "B",
    "name": "Clothing",
    "subTypes": [
      {
        "id": "B-01",
        "name": "Accessories"
      },
      {
        "id": "B-02",
        "name": "Aprons"
      },
      {
        "id": "B-03",
        "name": "Dresses"
      },
      {
        "id": "B-04",
        "name": "Footwear"
      },
      {
        "id": "B-05",
        "name": "Gloves"
      },
      {
        "id": "B-06",
        "name": "Hoodies"
      },
      {
        "id": "B-07",
        "name": "Jackets"
      },
      {
        "id": "B-08",
        "name": "Pants"
      },
      {
        "id": "B-09",
        "name": "Polo Shirts"
      },
      {
        "id": "B-10",
        "name": "Pullovers"
      },
      {
        "id": "B-11",
        "name": "Roughalls & Overalls"
      },
      {
        "id": "B-12",
        "name": "Scarves"
      },
      {
        "id": "B-13",
        "name": "Shirts"
      },
      {
        "id": "B-14",
        "name": "Shorts"
      },
      {
        "id": "B-15",
        "name": "Singlets"
      },
      {
        "id": "B-16",
        "name": "Skirts"
      },
      {
        "id": "B-17",
        "name": "Socks"
      },
      {
        "id": "B-18",
        "name": "T Shirts"
      },
      {
        "id": "B-19",
        "name": "Vests"
      },
      {
        "id": "B-20",
        "name": "Misc Clothing"
      }
    ]
  },
  {
    "id": "G",
    "name": "Headwear",
    "subTypes": [
      {
        "id": "G-01",
        "name": "Baseball Caps"
      },
      {
        "id": "G-02",
        "name": "Beanies"
      },
      {
        "id": "G-03",
        "name": "Bucket & Sun Hats"
      },
      {
        "id": "G-04",
        "name": "Flat Peak Caps"
      },
      {
        "id": "G-05",
        "name": "Headbands"
      },
      {
        "id": "G-06",
        "name": "Kid's Caps"
      },
      {
        "id": "G-07",
        "name": "Straw Hats"
      },
      {
        "id": "G-08",
        "name": "Trucker Caps"
      },
      {
        "id": "G-09",
        "name": "Visors"
      },
      {
        "id": "G-10",
        "name": "Misc Headwear"
      }
    ]
  },
  {
    "id": "H",
    "name": "Health & Personal",
    "subTypes": [
      {
        "id": "H-01",
        "name": "Blankets"
      },
      {
        "id": "H-02",
        "name": "Brushes"
      },
      {
        "id": "H-03",
        "name": "Eye Masks"
      },
      {
        "id": "H-04",
        "name": "Face Masks"
      },
      {
        "id": "H-05",
        "name": "Fans"
      },
      {
        "id": "H-06",
        "name": "First Aid Kits"
      },
      {
        "id": "H-07",
        "name": "Hand Sanitisers"
      },
      {
        "id": "H-08",
        "name": "Head Massagers"
      },
      {
        "id": "H-09",
        "name": "Heat Packs"
      },
      {
        "id": "H-10",
        "name": "Lip Balms"
      },
      {
        "id": "H-11",
        "name": "Manicure Accessories"
      },
      {
        "id": "H-12",
        "name": "Manicure Sets"
      },
      {
        "id": "H-13",
        "name": "Mirrors"
      },
      {
        "id": "H-14",
        "name": "Misc Health"
      },
      {
        "id": "H-15",
        "name": "Pillows"
      },
      {
        "id": "H-16",
        "name": "Safety Whistles"
      },
      {
        "id": "H-17",
        "name": "Sunscreens"
      },
      {
        "id": "H-18",
        "name": "Towel Wipes"
      },
      {
        "id": "H-19",
        "name": "Towels"
      }
    ]
  },
  {
    "id": "J",
    "name": "Home & Office",
    "subTypes": [
      {
        "id": "22",
        "name": "Candles"
      },
      {
        "id": "23",
        "name": "Cheese Boards & Knives"
      },
      {
        "id": "H-19",
        "name": "Towels"
      },
      {
        "id": "24",
        "name": "Tea Towels"
      },
      {
        "id": "25",
        "name": "Chopping Boards"
      },
      {
        "id": "26",
        "name": "Cutlery Sets"
      },
      {
        "id": "H-01",
        "name": "Blankets"
      },
      {
        "id": "27",
        "name": "Bar Mats"
      },
      {
        "id": "28",
        "name": "Floor Mats"
      },
      {
        "id": "Q-09",
        "name": "Mouse Mats"
      },
      {
        "id": "29",
        "name": "Counter Mats"
      },
      {
        "id": "30",
        "name": "Money Boxes"
      },
      {
        "id": "31",
        "name": "Photo Frames"
      },
      {
        "id": "J-12",
        "name": "Picture Frames"
      },
      {
        "id": "J-13",
        "name": "Watches"
      },
      {
        "id": "32",
        "name": "Magnetic Photo Frames"
      },
      {
        "id": "33",
        "name": "Tea & Coffee Accessories"
      },
      {
        "id": "J-11",
        "name": "Pet Accessories"
      },
      {
        "id": "M-02",
        "name": "Calculators"
      },
    ]
  },
  {
    "id": "P",
    "name": "PRINTING and Magnets",
    "subTypes": [
      {
        "id": "M-07",
        "name": "Diaries"
      },
      {
        "id": "M-10",
        "name": "Notepads"
      },
      {
        "id": "M-09",
        "name": "Notebooks"
      },
      {
        "id": "34",
        "name": "Letter Openers"
      },
      {
        "id": "P-02",
        "name": "Business Cards"
      },
      {
        "id": "35",
        "name": "Magnet Calendars"
      },
      {
        "id": "36",
        "name": "Wall Calendars"
      },
      {
        "id": "37",
        "name": "Desk Calendars"
      },
      {
        "id": "38",
        "name": "Sticky Notes & Flags"
      },
      {
        "id": "P-04",
        "name": "Combo Pads"
      },
      {
        "id": "P-05",
        "name": "Pads & Planners"
      },
      {
        "id": "M-15",
        "name": "Stickers"
      },
      {
        "id": "M-04",
        "name": "Compendiums & Portfolios"
      },
      {
        "id": "D-06",
        "name": "Gift Sets"
      },
      {
        "id": "D-05",
        "name": "Magnets"
      },
      {
        "id": "39",
        "name": "Magnetic To-Do Lists"
      },
      {
        "id": "P-08",
        "name": "Misc"
      },
      {
        "id": "M-01",
        "name": "Business Card Holders"
      },
      {
        "id": "40",
        "name": "Packaging"
      },
      {
        "id": "P-06",
        "name": "Ribbons"
      },
    ]
  },
  {
    "id": "Q",
    "name": "Tech",
    "subTypes": [
      {
        "id": "41",
        "name": "Flashdrives"
      },
      {
        "id": "Q-19",
        "name": "USB Hubs"
      },
      {
        "id": "Q-20",
        "name": "Wireless Chargers"
      },
      {
        "id": "Q-14",
        "name": "Powerbanks"
      },
      {
        "id": "Q-12",
        "name": "Phone Wallets"
      },
      {
        "id": "42",
        "name": "USB Car Chargers"
      },
      {
        "id": "Q-02",
        "name": "Cable Tidies"
      },
      {
        "id": "43",
        "name": "Car Phone Holders"
      },
      {
        "id": "Q-05",
        "name": "Charging Cables"
      },
      {
        "id": "Q-11",
        "name": "Phone Stands"
      },
      {
        "id": "Q-01",
        "name": "Speakers"
      },
      {
        "id": "Q-07",
        "name": "Earbuds"
      },
      {
        "id": "Q-08",
        "name": "Headphones"
      },
      {
        "id": "Q-06",
        "name": "Cleaning Cloths"
      },
      {
        "id": "Q-15",
        "name": "Tablet Covers"
      },
      {
        "id": "Q-17",
        "name": "Travel Adapters"
      },
    ]
  },
  {
    "id": "L",
    "name": "Leisure & Outdoors",
    "subTypes": [
      {
        "id": "L-17",
        "name": "Umbrellas"
      },
      {
        "id": "44",
        "name": "Beach Umbrellas"
      },
      {
        "id": "45",
        "name": "Golf Umbrellas"
      },
      {
        "id": "H-19",
        "name": "Gym Towels"
      },
      {
        "id": "H-18",
        "name": "Bath Towels"
      },
      {
        "id": "H-18",
        "name": "Hand Towels"
      },
      {
        "id": "H-17",
        "name": "Cooling Towels"
      },
      {
        "id": "50",
        "name": "Ice Buckets"
      },
      {
        "id": "H-18",
        "name": "Golf Towels"
      },
      {
        "id": "H-17",
        "name": "Sunscreens"
      },
      {
        "id": "H-01",
        "name": "Blankets"
      },
      {
        "id": "L-08",
        "name": "Picnic Rugs"
      },
      {
        "id": "L-01",
        "name": "BBQ Sets"
      },
      {
        "id": "L-09",
        "name": "Picnic Sets"
      },
      {
        "id": "H-07",
        "name": "Hand Sanitisers"
      },
      {
        "id": "H-04",
        "name": "Face Masks"
      },
      {
        "id": "H-06",
        "name": "First Aid Kits"
      },
      {
        "id": "L-13",
        "name": "Sunglasses & Accessories"
      },
      {
        "id": "L-14",
        "name": "Sunshades"
      },
      {
        "id": "K-08",
        "name": "Tool Sets"
      },
      {
        "id": "52",
        "name": "Carabiners"
      },
      {
        "id": "K-09",
        "name": "Torches"
      },
      {
        "id": "K-07",
        "name": "Tape Measures"
      },
    ]
  },
  {
    "id": "K",
    "name": "Keyrings & Tools",
    "subTypes": [
      {
        "id": "K-01",
        "name": "Auto Accessories"
      },
      {
        "id": "K-02",
        "name": "Binoculars"
      },
      {
        "id": "K-03",
        "name": "Bottle Openers"
      },
      {
        "id": "K-04",
        "name": "General Tools"
      },
      {
        "id": "K-05",
        "name": "Keyrings"
      },
      {
        "id": "K-06",
        "name": "Multi Tools"
      },
      {
        "id": "K-07",
        "name": "Tape Measures"
      },
      {
        "id": "K-08",
        "name": "Tool Sets"
      },
      {
        "id": "K-09",
        "name": "Torches"
      },
      {
        "id": "K-10",
        "name": "Misc Tools"
      }
    ]
  },
  {
    "id": "M",
    "name": "Office Stationery",
    "subTypes": [
      {
        "id": "M-01",
        "name": "Business Card Holders"
      },
      {
        "id": "M-02",
        "name": "Calculators"
      },
      {
        "id": "M-03",
        "name": "Clips"
      },
      {
        "id": "M-04",
        "name": "Compendiums"
      },
      {
        "id": "M-05",
        "name": "Desk Accessories"
      },
      {
        "id": "M-06",
        "name": "Desk Caddies"
      },
      {
        "id": "M-07",
        "name": "Diaries"
      },
      {
        "id": "M-08",
        "name": "Erasers"
      },
      {
        "id": "M-09",
        "name": "Notebooks"
      },
      {
        "id": "M-10",
        "name": "Notepads"
      },
      {
        "id": "M-11",
        "name": "Pencil Cases"
      },
      {
        "id": "M-12",
        "name": "Pencil Sharpeners"
      },
      {
        "id": "M-13",
        "name": "Portfolios"
      },
      {
        "id": "M-14",
        "name": "Rulers"
      },
      {
        "id": "M-15",
        "name": "Stickers"
      },
      {
        "id": "M-16",
        "name": "Sticky Notes"
      },
      {
        "id": "M-17",
        "name": "Misc Office"
      }
    ]
  },
  {
    "id": "R",
    "name": "Capital Equipment",
    "subTypes": [
      {
        "id": "R-01",
        "name": "Embroidery"
      },
      {
        "id": "R-02",
        "name": "Laser"
      },
      {
        "id": "R-03",
        "name": "Printers"
      },
      {
        "id": "R-04",
        "name": "Other"
      }
    ]
  }
]

const SpromotionalNavigate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedParamCategoryId, setCurrentPage, setSidebarActiveCategory, setActiveFilterCategory } = useContext(AppContext)

  // Get the category name from the URL params (it should be encoded if needed)
  const categoryName = searchParams.get("categoryName") ? decodeURIComponent(searchParams.get("categoryName")) : "Category";

  // Get the subcategory id from the URL params (you can choose a key, e.g. "subcategory")
  const subCategoryId = searchParams.get("category") || "";
  // const CategoryLabel = searchParams.get("label") || "";
  const CategoryLabel = searchParams.get("label") ? decodeURIComponent(searchParams.get("label")) : "";

  const encodedCategoryName = encodeURIComponent(categoryName);
  const encodedCategoryLabel = encodeURIComponent(CategoryLabel);


  // Find the subcategory name from the megaMenu data
  let subCategoryName = "";
  let categoryId = ""
  if (subCategoryId) {
    megaMenu.forEach(menu => {
      if (encodedCategoryName === menu.name) {
        categoryId = menu.id;
      }
      menu.subTypes.forEach(subType => {
        // subType.items.forEach(item => {
        if (subType.id === subCategoryId) {
          subCategoryName = subType.name;
        }
        // });
      })
    });
  }


  const handleNameCategories = () => {
    navigate(`/promotional?categoryName=${encodedCategoryName}&category=${categoryId}`);
    setSelectedParamCategoryId(categoryId);
    // setActiveFilterCategory(subCategory)
    setCurrentPage(1);
    setSidebarActiveCategory(categoryName)
    setActiveFilterCategory(null)
  };

  return (
    <div className="Mycontainer">
      <div className="flex items-center gap-2 text-smallHeader mt-4 text-lg">
        <Link to="/" className="flex items-center gap-1">
          <p>Home</p>
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
        <span className='cursor-pointer'
          onClick={() => handleNameCategories()}
        >
          {categoryName}
        </span>
        {/* {CategoryLabel && <>
          <MdKeyboardArrowRight className="text-xl" />
          <span>{CategoryLabel}</span>
        </>} */}
        {subCategoryName && (
          <>
            <MdKeyboardArrowRight className="text-xl" />
            <span>{subCategoryName}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default SpromotionalNavigate