import React, { useState, useEffect, useRef } from 'react';
import { IoSearchSharp, IoCartOutline } from 'react-icons/io5';
import { CiHeart } from 'react-icons/ci';
import { BiUser } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IoPricetagSharp } from 'react-icons/io5';
import { AppContext } from '../../context/AppContext';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { RiArrowDropDownLine } from 'react-icons/ri';
import {
  setSelectedCategory,
  applyFilters,
} from '../../redux/slices/filterSlice';
import {
  fetchcategoryProduct,
  matchProduct,
} from '@/redux/slices/categorySlice';
import {
  matchPromotionalProduct,
  setAllProducts,
} from '@/redux/slices/promotionalSlice';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import supermerch from '../../assets/supermerch.png';

const SMiniNav = () => {
  const megaMenu = [
    {
      id: 'N',
      name: 'Writing',
      subTypes: [
        {
          label: 'Pens',
          items: [
            {
              id: 'N-07',
              name: 'Metal Pens',
            },
            {
              id: 'N-11',
              name: 'Plastic Pens',
            },
            {
              id: 'N-12',
              name: 'Stylus Pens',
            },
            {
              id: 'N-08',
              name: 'Other Pens',
            },
          ],
        },
        {
          label: 'Pencils',
          items: [
            {
              id: 'N-06',
              name: 'Grey-Lead Pencils',
            },
            {
              id: 'N-01',
              name: 'Coloured Pencils',
            },
          ],
        },
        {
          label: 'Highlighter',
          items: [
            {
              id: 'N-05',
              name: 'Highlighters',
            },
            {
              id: 'N-09',
              name: 'Markers',
            },
          ],
        },
        {
          label: 'Misc',
          items: [
            {
              id: 'N-10',
              name: 'Pencil Sharpeners',
            },
            {
              id: 'N-03',
              name: 'Erasers',
            },
            {
              id: 'N-09',
              name: 'Pen Packaging',
            },
            {
              id: '3',
              name: 'Pencils Cases',
            },
            {
              id: '4',
              name: 'Rulers',
            },
          ],
        },
      ],
    },
    {
      id: 'A',
      name: 'Bags',
      subTypes: [
        {
          label: 'Tote Bag',
          items: [
            {
              id: 'A-13',
              name: 'Tote Bags',
            },
            {
              id: '5',
              name: 'Reuseable Grocery Bags',
            },
          ],
        },
        {
          label: 'Outdoor Bag',
          items: [
            {
              id: 'A-03',
              name: 'Cooler Bags',
            },
            {
              id: 'A-08',
              name: 'Lunch Bags/Lunch Boxes',
            },
            {
              id: 'A-05',
              name: 'Duffle/Sports Bags',
            },
            {
              id: 'A-14',
              name: 'Travel Bum Bags',
            },
            {
              id: '6',
              name: 'Camping Dry Bags',
            },
            {
              id: 'A-04',
              name: 'Drawstring Backpacks',
            },
            {
              id: 'A-01',
              name: 'Backpacks',
            },
          ],
        },
        {
          label: 'Business Bag',
          items: [
            {
              id: 'A-06',
              name: 'Laptops Bags',
            },
            {
              id: 'A-09',
              name: 'Paper Bags',
            },
            {
              id: 'A-10',
              name: 'Satchels',
            },
            {
              id: 'A-02',
              name: 'Wheeled Bags',
            },
          ],
        },
        {
          label: 'Misc',
          items: [
            {
              id: 'A-15',
              name: 'Wallets & Purses',
            },
            {
              id: 'A-12',
              name: 'Toiletry Bags & Accessories',
            },
            {
              id: 'A-07',
              name: 'Luggage Tags',
            },
          ],
        },
      ],
    },
    {
      id: 'C',
      name: 'Drinkware',
      subTypes: [
        {
          label: 'Bottles',
          items: [
            {
              id: 'C-04',
              name: 'Drink Bottles',
            },
            {
              id: '7',
              name: 'Thermoses',
            },
            {
              id: '8',
              name: 'Bottled Water',
            },
          ],
        },
        {
          label: 'Mugs',
          items: [
            {
              id: 'C-09',
              name: 'Coffee Mugs',
            },
            {
              id: 'C-08',
              name: 'Beer Mugs',
            },
            {
              id: '9',
              name: 'Reusable Coffee Cups',
            },
            {
              id: 'C-12',
              name: 'Travel Mugs',
            },
          ],
        },
        {
          label: 'Glasses',
          items: [
            {
              id: 'C-01',
              name: 'Beer Glasses',
            },
            {
              id: '10',
              name: 'Cocktail Glasses',
            },
            {
              id: 'C-13',
              name: 'Shot Glasses',
            },
            {
              id: '11',
              name: 'Wine Glasses',
            },
          ],
        },
        {
          label: 'Thumblers',
          items: [
            {
              id: 'C-03',
              name: 'Plastic Cups And Tumblers',
            },
            {
              id: 'C-10',
              name: 'Protein Shakers',
            },
            {
              id: 'C-02',
              name: 'Glass Tumblers',
            },
          ],
        },
        {
          label: 'Misc',
          items: [
            {
              id: 'C-05',
              name: 'Bottle Coolers',
            },
            {
              id: 'C-06',
              name: 'Coasters',
            },
            {
              id: 'C-11',
              name: 'Bottle Openers',
            },
            {
              id: '12',
              name: 'Stubby Holders',
            },
            {
              id: '13',
              name: 'Drinking Straws',
            },
            {
              id: '14',
              name: 'Flasks',
            },
          ],
        },
      ],
    },
    {
      id: 'D',
      name: 'Exhibitions & Events',
      subTypes: [
        {
          label: 'Awards & Trophies',
          items: [
            {
              id: 'D-01',
              name: 'Awards & Trophies',
            },
          ],
        },
        {
          label: 'Lanyards, Bagdes and Pins',
          items: [
            {
              id: 'D-07',
              name: 'Lanyards',
            },
            {
              id: 'D-08',
              name: 'Name Badges',
            },
            {
              id: 'D-02',
              name: 'Lapel Pins',
            },
            {
              id: '15',
              name: 'Badge Reels',
            },
            {
              id: '16',
              name: 'Button Badge',
            },
            {
              id: '17',
              name: 'Badge Holders',
            },
          ],
        },
        {
          label: 'WristBands',
          items: [
            {
              id: 'D-10',
              name: 'Event Wristbands',
            },
            {
              id: '18',
              name: 'Silicon Wristbands',
            },
          ],
        },
        {
          label: 'Keyrings',
          items: [
            {
              id: 'K-05',
              name: 'Bottle Opener Keyrings',
            },
            {
              id: '19',
              name: 'Keyrings',
            },
          ],
        },
        {
          label: 'Misc',
          items: [
            {
              id: 'D-04',
              name: 'Flags & Bunting',
            },
            {
              id: '20',
              name: 'Balloons',
            },
            {
              id: 'D-03',
              name: 'Banners',
            },
            {
              id: 'D-11',
              name: 'Marquees',
            },
            {
              id: '21',
              name: 'Signs',
            },
            {
              id: 'D-09',
              name: 'Table Covers',
            },
          ],
        },
      ],
    },
    {
      id: 'J',
      name: 'Home & Office',
      subTypes: [
        {
          label: 'Candles',
          items: [
            {
              id: '22',
              name: 'Candles',
            },
          ],
        },
        {
          label: 'Kitchen',
          items: [
            {
              id: '23',
              name: 'Cheese Boards & Knives',
            },
            {
              id: 'H-19',
              name: 'Towels',
            },
            {
              id: '24',
              name: 'Tea Towels',
            },
            {
              id: '25',
              name: 'Chopping Boards',
            },
            {
              id: '26',
              name: 'Cutlery Sets',
            },
          ],
        },
        {
          label: 'Blanket and mats',
          items: [
            {
              id: 'H-01',
              name: 'Blankets',
            },
            {
              id: '27',
              name: 'Bar Mats',
            },
            {
              id: '28',
              name: 'Floor Mats',
            },
            {
              id: 'Q-09',
              name: 'Mouse Mats',
            },
            {
              id: '29',
              name: 'Counter Mats',
            },
          ],
        },
        {
          label: 'Decorative',
          items: [
            {
              id: '30',
              name: 'Money Boxes',
            },
            {
              id: '31',
              name: 'Photo Frames',
            },
            {
              id: 'J-12',
              name: 'Picture Frames',
            },
            {
              id: 'J-13',
              name: 'Watches',
            },
            {
              id: '32',
              name: 'Magnetic Photo Frames',
            },
          ],
        },
        {
          label: 'Misc',
          items: [
            {
              id: '33',
              name: 'Tea & Coffee Accessories',
            },
            {
              id: 'J-11',
              name: 'Pet Accessories',
            },
            {
              id: 'M-02',
              name: 'Calculators',
            },
          ],
        },
      ],
    },
    {
      id: 'P',
      name: 'PRINTING and Magnets',
      subTypes: [
        {
          label: 'Diaries',
          items: [
            {
              id: 'M-07',
              name: 'Diaries',
            },
            {
              id: 'M-10',
              name: 'Notepads',
            },
            {
              id: 'M-09',
              name: 'Notebooks',
            },
            {
              id: '34',
              name: 'Letter Openers',
            },
          ],
        },
        {
          label: 'Cards and Calender',
          items: [
            {
              id: 'P-02',
              name: 'Business Cards',
            },
            {
              id: '35',
              name: 'Magnet Calendars',
            },
            {
              id: '36',
              name: 'Wall Calendars',
            },
            {
              id: '37',
              name: 'Desk Calendars',
            },
          ],
        },
        {
          label: 'Stickers',
          items: [
            {
              id: '38',
              name: 'Sticky Notes & Flags',
            },
            {
              id: 'P-04',
              name: 'Combo Pads',
            },
            {
              id: 'P-05',
              name: 'Pads & Planners',
            },
            {
              id: 'M-15',
              name: 'Stickers',
            },
            {
              id: 'M-04',
              name: 'Compendiums & Portfolios',
            },
          ],
        },
        {
          label: 'Gift Sets',
          items: [
            {
              id: 'D-06',
              name: 'Gift Sets',
            },
          ],
        },
        {
          label: 'Magnetic',
          items: [
            {
              id: 'D-05',
              name: 'Magnets',
            },
            {
              id: '39',
              name: 'Magnetic To-Do Lists',
            },
          ],
        },
        {
          label: 'More',
          items: [
            {
              id: 'P-08',
              name: 'Misc',
            },
            {
              id: 'M-01',
              name: 'Business Card Holders',
            },
            {
              id: '40',
              name: 'Packaging',
            },
            {
              id: 'P-06',
              name: 'Ribbons',
            },
          ],
        },
      ],
    },
    {
      id: 'Q',
      name: 'Tech',
      subTypes: [
        {
          label: 'Flashdrives',
          items: [
            {
              id: '41',
              name: 'Flashdrives',
            },
            {
              id: 'Q-19',
              name: 'USB Hubs',
            },
          ],
        },
        {
          label: 'Mobile',
          items: [
            {
              id: 'Q-20',
              name: 'Wireless Chargers',
            },
            {
              id: 'Q-14',
              name: 'Powerbanks',
            },
            {
              id: 'Q-12',
              name: 'Phone Wallets',
            },
            {
              id: '42',
              name: 'USB Car Chargers',
            },
            {
              id: 'Q-02',
              name: 'Cable Tidies',
            },
            {
              id: '43',
              name: 'Car Phone Holders',
            },
            {
              id: 'Q-05',
              name: 'Charging Cables',
            },
            {
              id: 'Q-11',
              name: 'Phone Stands',
            },
          ],
        },
        {
          label: 'Speakers and Headphones',
          items: [
            {
              id: 'Q-01',
              name: 'Speakers',
            },
            {
              id: 'Q-07',
              name: 'Earbuds',
            },
            {
              id: 'Q-08',
              name: 'Headphones',
            },
          ],
        },
        {
          label: 'MISC',
          items: [
            {
              id: 'Q-06',
              name: 'Cleaning Cloths',
            },
            {
              id: 'Q-15',
              name: 'Tablet Covers',
            },
            {
              id: 'Q-17',
              name: 'Travel Adapters',
            },
          ],
        },
      ],
    },
    {
      id: 'L',
      name: 'Leisure & Outdoors',
      subTypes: [
        {
          label: 'Umbrellas',
          items: [
            {
              id: 'L-17',
              name: 'Umbrellas',
            },
            {
              id: '44',
              name: 'Beach Umbrellas',
            },
            {
              id: '45',
              name: 'Golf Umbrellas',
            },
          ],
        },
        {
          label: 'Towels',
          items: [
            {
              id: 'H-19',
              name: 'Gym Towels',
            },
            {
              id: 'H-18',
              name: 'Bath Towels',
            },
            {
              id: 'H-18',
              name: 'Hand Towels',
            },
            {
              id: 'H-17',
              name: 'Cooling Towels',
            },
            {
              id: '50',
              name: 'Ice Buckets',
            },
            {
              id: 'H-18',
              name: 'Golf Towels',
            },
          ],
        },
        {
          label: 'Picnic',
          items: [
            {
              id: 'H-17',
              name: 'Sunscreens',
            },
            {
              id: 'H-01',
              name: 'Blankets',
            },
            {
              id: 'L-08',
              name: 'Picnic Rugs',
            },
            {
              id: 'L-01',
              name: 'BBQ Sets',
            },
            {
              id: 'L-09',
              name: 'Picnic Sets',
            },
          ],
        },
        {
          label: 'Medical',
          items: [
            {
              id: 'H-07',
              name: 'Hand Sanitisers',
            },
            {
              id: 'H-04',
              name: 'Face Masks',
            },
            {
              id: 'H-06',
              name: 'First Aid Kits',
            },
          ],
        },
        {
          label: 'Shades',
          items: [
            {
              id: 'L-13',
              name: 'Sunglasses & Accessories',
            },
            {
              id: 'L-14',
              name: 'Sunshades',
            },
          ],
        },
        {
          label: 'Tools',
          items: [
            {
              id: 'K-08',
              name: 'Tool Sets',
            },
            {
              id: '52',
              name: 'Carabiners',
            },
            {
              id: 'K-09',
              name: 'Torches',
            },
            {
              id: 'K-07',
              name: 'Tape Measures',
            },
          ],
        },
      ],
    },
    {
      id: 'E',
      name: 'Food',
      subTypes: [
        {
          label: 'Beans',
          items: [
            {
              id: '53',
              name: 'Jelly Beans',
            },
            {
              id: '54',
              name: 'Choc Beans',
            },
            {
              id: '55',
              name: 'Jelly Babies',
            },
          ],
        },
        {
          label: 'Lollies',
          items: [
            {
              id: '56',
              name: 'Mixed Lollies',
            },
            {
              id: 'E-05',
              name: 'Lollipops',
            },
            {
              id: 'E-06',
              name: 'Mints',
            },
            {
              id: '57',
              name: 'Gummi Lollies',
            },
            {
              id: '58',
              name: 'Lozenges',
            },
          ],
        },
        {
          label: 'Choclates',
          items: [
            {
              id: '59',
              name: 'Nuts & Savoury',
            },
            {
              id: 'E-02',
              name: 'Chocolates',
            },
            {
              id: '60',
              name: 'Chewy Fruits',
            },
            {
              id: '61',
              name: 'Biscuits & Cookies',
            },
            {
              id: '62',
              name: 'Snakes',
            },
          ],
        },
        {
          label: 'Popcorn',
          items: [
            {
              id: '63',
              name: 'Popcorn',
            },
          ],
        },
      ],
    },
    {
      id: 'F',
      name: 'Games',
      subTypes: [
        {
          label: 'Balls',
          items: [
            {
              id: '64',
              name: 'Stress Balls',
            },
            {
              id: '65',
              name: 'Stress Fruit & Vegetables',
            },
            {
              id: '66',
              name: 'Stress Keyrings',
            },
            {
              id: '67',
              name: 'Stress Transport',
            },
            {
              id: '68',
              name: 'Stress Animals',
            },
            {
              id: '69',
              name: 'More Stress Shapes',
            },
          ],
        },
        {
          label: 'GOLF',
          items: [
            {
              id: '70',
              name: 'Golf Ball Markers',
            },
            {
              id: 'L-05',
              name: 'Golf Balls',
            },
            {
              id: '71',
              name: 'Golf Tees',
            },
            {
              id: '72',
              name: 'Misc Golf',
            },
          ],
        },
        {
          label: 'Outdoor toys',
          items: [
            {
              id: '73',
              name: 'Frisbees & Throwing Toys',
            },
            {
              id: '74',
              name: 'Yo Yos',
            },
            {
              id: 'L-12',
              name: 'Sports Gear',
            },
          ],
        },
        {
          label: 'Indoor toys',
          items: [
            {
              id: '75',
              name: 'Jigsaws',
            },
            {
              id: 'F-02',
              name: 'Novelty Items',
            },
            {
              id: '76',
              name: 'Plush Toys',
            },
            {
              id: 'F-03',
              name: 'Puzzles',
            },
            {
              id: 'F-01',
              name: 'Games',
            },
          ],
        },
      ],
    },
  ];

  const megaMenuClothing = [
  {
    id: 'B-CW',
    name: 'Corporate Wear',
    subTypes: [
      {
        label: 'Top',
        items: [
          { id: 'B-09', name: 'Polo Shirts' },
          { id: 'B-13', name: 'Shirts' },
          { id: 'B-18', name: 'T Shirts' },
        ]
      },
      {
        label: 'Pants',
        items: [
          { id: 'B-08', name: 'Pants' },
          { id: 'B-14', name: 'Shorts' },
          { id: 'B-16', name: 'Skirts' },
          { id: 'B-03', name: 'Dresses' }

        ]
      },
      {
        label: 'Outwears',
        items: [
          { id: 'B-06', name: 'Hoodies' },
          { id: 'B-07', name: 'Jackets' },
          { id: 'B-10', name: 'Pullovers' },
          { id: 'B-19', name: 'Vests' }
        ]
      },
      {
        label: 'Footwears',
        items: [
          { id: 'B-04', name: 'Footwear' }
        ]
      }
    ]
  },
  {
    id: 'B-WW',
    name: 'Workwear',
    subTypes: [
      {
        label: 'Top',
        items: [
          { id: 'B-18', name: 'T Shirts' },
          { id: 'B-09', name: 'Polo Shirts' },
          { id: 'B-13', name: 'Shirts' }
        ]
      },
      {
        label: 'Pants',
        items: [
          { id: 'B-08', name: 'Pants' },
          { id: 'B-14', name: 'Shorts' },
          { id: 'B-11', name: 'Roughalls & Overalls' }
        ]
      },
      {
        label: 'Outwears',
        items: [
          { id: 'B-06', name: 'Hoodies' },
          { id: 'B-07', name: 'Jackets' },
          { id: 'B-19', name: 'Vests' }
        ]
      },
      {
        label: 'Footwears',
        items: [
          { id: 'B-04', name: 'Safety Footwear' }
        ]
      }
    ]
  },
  {
    id: 'B-HT',
    name: 'Hospitality',
    subTypes: [
      {
        label: 'Top',
        items: [
          { id: 'B-18', name: 'T Shirts' },
          { id: 'B-09', name: 'Polo Shirts' },
          { id: 'B-13', name: 'Shirts' },
          { id: 'B-02', name: 'Aprons' }
        ]
      },
      {
        label: 'Pants',
        items: [
          { id: 'B-08', name: 'Pants' },
          { id: 'B-14', name: 'Shorts' },
          { id: 'B-16', name: 'Skirts' }
        ]
      },
      {
        label: 'Outwears',
        items: [] // Empty as no specific items for this category
      },
      {
        label: 'Footwears',
        items: [] // Empty as no specific items for this category
      }
    ]
  },
  {
    id: 'B-AW',
    name: 'Activewear',
    subTypes: [
      {
        label: 'Top',
        items: [
          { id: 'B-18', name: 'Athletic T Shirts' },
          { id: 'B-09', name: 'Athletic Polo Shirts' },
          { id: 'B-15', name: 'Singlets' }
        ]
      },
      {
        label: 'Pants',
        items: [
          { id: 'B-08', name: 'Athletic Pants' },
          { id: 'B-14', name: 'Athletic Shorts' }
        ]
      },
      {
        label: 'Outwears',
        items: [
          { id: 'B-06', name: 'Athletic Hoodies' },
          { id: 'B-07', name: 'Athletic Jackets' }
        ]
      },
      {
        label: 'Footwears',
        items: [
          { id: 'B-04', name: 'Athletic Footwear' }
        ]
      }
    ]
  },
  {
    id: 'B-BR',
    name: 'Brands',
    subTypes: [
      {
        label: 'Top',
        items: [
          { id: 'B-09', name: 'Corporate Polo Shirts' },
          { id: 'B-13', name: 'Corporate Shirts' },
          { id: 'B-18', name: 'Corporate T Shirts' }
        ]
      },
      {
        label: 'Pants',
        items: [
          { id: 'B-14', name: 'Athletic Shorts' }
        ]
      },
      {
        label: 'Outwears',
        items: [
          { id: 'B-06', name: 'Athletic Hoodies' }
        ]
      },
      {
        label: 'Footwears',
        items: [
          { id: 'B-04', name: 'Safety Footwear' }
        ]
      }
    ]
  }
];

  const megaMenuHeadwear = [
    {
      id: 'G',
      name: 'Headwear',
      subTypes: [
        {
          label: 'Headwear',
          items: [
            {
              id: 'G-01',
              name: 'Baseball Caps',
            },
            {
              id: 'G-02',
              name: 'Beanies',
            },
            {
              id: 'G-03',
              name: 'Bucket & Sun Hats',
            },
            {
              id: 'G-04',
              name: 'Flat Peak Caps',
            },
            {
              id: 'G-05',
              name: 'Headbands',
            },
            {
              id: 'G-06',
              name: "Kid's Caps",
            },
            {
              id: 'G-07',
              name: 'Straw Hats',
            },
            {
              id: 'G-08',
              name: 'Trucker Caps',
            },
            {
              id: 'G-09',
              name: 'Visors',
            },
            {
              id: 'G-10',
              name: 'Misc Headwear',
            },
          ],
        },
      ],
    },
  ];

  const {
    token,
    setToken,
    products,
    setProducts,
    fetchProducts,
    handleLogout,
    categoryProducts,
    setCategoryProducts,
    fetchCategories,
    activeFilterCategory,
    setActiveFilterCategory,
    setSelectedParamCategoryId,
    setCurrentPage,
    paramProducts,
    setParamProducts,
    v1categories,
    setV1categories,
    sidebarActiveCategory,
    setSidebarActiveCategory,
    sidebarActiveLabel,
    setSidebarActiveLabel,
  } = useContext(AppContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [megaMenuMobile, setMegaMenuMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleCategory = (index) => {
    setActiveCategory(activeCategory === index ? null : index); // Toggle category
  };
  const dispatch = useDispatch();
  const [navbarLogout, setNavbarLogout] = useState(false);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const { favouriteQuantity } = useSelector((state) => state.favouriteProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [isnav, setIsnav] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const toggleNavbar = () => setIsnav((prev) => !prev);
  const handleChange = (e) => setInputValue(e.target.value.toLowerCase());
  const applyFilter = () => {
    if (inputValue) {
      setProducts(
        products.filter((product) =>
          product.overview.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    } else {
      fetchProducts();
    }
  };

  const toggleLogout = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [inputValue]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    setIsDropdownOpen(false);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const route = [
    { name: 'Promotional', path: '/Spromotional' },
    { name: 'Clothing', path: '/Spromotional' },
    { name: 'Headwear', path: '/Headwear' },
    { name: 'Return Gifts', path: '/ReturnGifts' },
    { name: '24 Hour production', path: '/production' },
    { name: 'Sale', path: '/Sale' },
    { name: 'australia Made', path: '/Australia' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsnav(false);
        setDropDown(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/signup');
  };

  useEffect(() => {
    if (navbarLogout) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [navbarLogout]);

  const mobileNavDropHeading = [
    {
      title: "Men's and Unisex Apparel",
      children: [
        { title: "Men's and Unisex T-Shirts" },
        { title: "Men's and Unisex Polos" },
        { title: "Men's and Unisex Dress-Shirts" },
        { title: "Men's and Unisex Sweat-Shirts" },
        { title: "Men's and Unisex Quarter-Zip" },
        { title: "Men's and Unisex Jackets" },
        { title: 'Other Apparel' },
      ],
    },
    {
      title: 'Headwear',
      children: [
        { title: 'Hats and Caps' },
        { title: 'Beanies' },
        { title: 'Other Headwear' },
      ],
    },
    {
      title: 'Awards and Recognition',
      children: [
        { title: 'Office Essentials' },
        { title: 'Journals and Notebooks' },
        { title: 'Desk Accessories' },
        { title: 'Calendars' },
        { title: 'Notepads and Flags' },
        { title: 'Padfolios' },
      ],
    },
    {
      title: 'Awards and Recognition',
      children: [
        { title: 'Office Essentials' },
        { title: 'Journals and Notebooks' },
        { title: 'Desk Accessories' },
        { title: 'Calendars' },
        { title: 'Notepads and Flags' },
        { title: 'Padfolios' },
      ],
    },
    {
      title: 'Pens and Writing Instruments',
      children: [
        { title: 'Pens' },
        { title: 'Pencils' },
        { title: 'Markers & Highlighters' },
        { title: 'Writing Sets' },
      ],
    },
  ];
  useEffect(() => {
    if (products) {
      dispatch(setAllProducts(products));
    }
  }, [products, dispatch]);
  const handleCategoryClick = (category) => {
    dispatch(setSelectedCategory(category));
    setTimeout(() => {
      dispatch(applyFilters());
    }, 0);
  };

  const [isPromotionClickeed, setIsPromotionClickeed] = useState(false);

  let checkcatPro = useSelector(
    (state) => state.categoryProduct.categoryProduct
  );
  const { filterLocalProducts, setFilterLocalProducts } =
    useContext(AppContext);

  const filteredProducts = useSelector(
    (state) => state.promotionals.filteredPromotionalProducts
  );
  const productCategory = () => {
    navigate(`/Spromotional`);
    const matchedProducts = products.filter((product) => {
      const typeId =
        product.product?.categorisation?.promodata_product_type?.type_id;
      if (!typeId) return false;
      return categoryProducts.some((category) =>
        category.subTypes.some((sub) => sub.id === typeId)
      );
    });
    setParamProducts({ data: matchedProducts, total_pages: 1 });
    setSelectedParamCategoryId(null);
    setActiveFilterCategory(null);
    setSidebarActiveCategory(null);
  };
  const [hoverMegaMenu, sethoverMegaMenu] = useState(false);
  const [hoverClothingMenu, sethoverClothingMenu] = useState(false);
  const handleNameCategories = (titleName, NameId) => {
    sethoverMegaMenu(false);
    sethoverClothingMenu(false);
    const encodedTitleName = encodeURIComponent(titleName);
    navigate(
      `/Spromotional?categoryName=${encodedTitleName}&category=${NameId}`
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
    labelName
  ) => {
    sethoverMegaMenu(false);
    sethoverClothingMenu(false);
    const encodedTitleName = encodeURIComponent(titleName); // Encode the title
    const encodedLabel = encodeURIComponent(labelName);
    navigate(
      `/Spromotional?categoryName=${encodedTitleName}&category=${categoryId}&label=${encodedLabel}`
    );
    setSelectedParamCategoryId(categoryId);
    setActiveFilterCategory(subCategory);
    setCurrentPage(1);
    setSidebarActiveCategory(titleName);
    setSidebarActiveLabel(labelName);
  };
  const conditionalCategoryNameHandler = (link) => {
    if (link.name === 'Promotional') {
      sethoverMegaMenu(false);
      setMegaMenuMobile(!megaMenuMobile);
      productCategory();
      return;
    }
    if (link.name === 'Clothing') {
      sethoverClothingMenu(false);
      const clothingCategory = v1categories.find(
        (category) => category.name === 'Clothing'
      );
      if (clothingCategory) {
        handleNameCategories(clothingCategory.name, clothingCategory.id);
      } else {
        toast.error('Clothing category not found!');
      }
    }
    if (
      link.name === 'Return Gifts' ||
      link.name === '24 Hour production' ||
      link.name === 'Sale' ||
      link.name === 'australia Made'
    ) {
      navigate('/shop');
    }
  };
  const [activeItem, setActiveItem] = useState(megaMenu[0].id);
  const [activeClothingItem, setActiveClothingItem] = useState(megaMenuClothing[0].id)
  const activeContent =
    megaMenu.find((item) => item.id === activeItem)?.subTypes || [];
  const [openPromoId, setOpenPromoId] = useState(null);
  return (
    <>
      <div className='bg-line'>
        <div className='flex items-center justify-between gap-6 pt-2 text-white Mycontainer'>
          <Link to={'/'}>
            <img
              src={supermerch}
              className='object-contain w-24 ml-8 lg:w-36'
              alt=''
            />
          </Link>
          <div className='lg:flex md:flex hidden gap-2 border border-black   items-center bg-white lg:w-[55%] md:w-[55%] w-full h-[48px] px-4'>
            <input
              value={inputValue}
              onChange={handleChange}
              type='text'
              placeholder='Search for anything...'
              className='w-full text-black bg-transparent outline-none'
            />
            <IoSearchSharp className='text-xl text-black' />
          </div>
          <div className='relative z-20 flex items-center gap-2 lg:gap-6 md:gap-6 sm:gap-5'>
            <Link to={'/cart'}>
              {totalQuantity > 0 && (
                <span className='absolute -top-1.5 right-[75%] bg-white border border-red-500 text-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {totalQuantity}
                </span>
              )}
              <IoCartOutline className='text-3xl text-customBlue' />
            </Link>
            <Link to={'/favourites'}>
              {favouriteQuantity > 0 && (
                <span className='absolute -top-1.5 right-[35%] bg-white border border-red-500 text-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {favouriteQuantity}
                </span>
              )}
              <CiHeart className='text-3xl text-customBlue' />
            </Link>
            {!token ? (
              <Link to={'/signup'}>
                <BiUser className='text-3xl text-customBlue' />
              </Link>
            ) : (
              <div className='relative' ref={dropdownRef}>
                <BiUser
                  onClick={toggleLogout}
                  className='text-3xl cursor-pointer text-customBlue'
                />
                {isDropdownOpen && (
                  <div className='absolute right-0 w-48 mt-2 bg-white border rounded shadow-lg'>
                    <ul>
                      <Link
                        onClick={() => setIsDropdownOpen(false)}
                        to='/admin'
                        className='px-4 py-2 text-black cursor-pointer hover:bg-gray-100'
                      >
                          Manage Orders
                      </Link>

                      <li
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setNavbarLogout(true);
                        }}
                        className='px-4 py-2 text-black cursor-pointer hover:bg-gray-100'
                      >
                        Log Out
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='relative bg-line'>
        <div className='absolute flex items-center gap-1 Mycontainer lg:relative md:relative -top-10 lg:-top-0 md:-top-0 sm:left-7 left-4 lg:left-0 lg:justify-center'>
          <div className='relative z-10 hidden lg:block'>
            {isOpen && (
              <div
                className={`absolute mt-2 bg-white border border-gray-300 rounded-md shadow-lg w-48 
                  transform transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                  }`}
              >
                <ul className='py-1'>
                  {route.map((link, index) => (
                    <li key={index} onClick={() => setIsOpen(false)}>
                      <Link
                        to={link.path}
                        className='block px-4 py-2 cursor-pointer text-gray-700 capitalize hover:bg-blue-500 hover:text-white'
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <nav className='py-3 text-white lg:px-4'>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <div className='flex items-center justify-between'>
                <SheetTrigger>
                  <div
                    onClick={toggleNavbar}
                    className='text-black focus:outline-none lg:hidden'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-6 h-6'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d={
                          // isnav ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'
                          'M4 6h16M4 12h16M4 18h16'
                        }
                      />
                    </svg>
                  </div>
                </SheetTrigger>
              </div>
              <SheetContent className='overflow-y-auto' side={'left'}>
                <SheetHeader>
                  <SheetTitle className='mb-3 text-2xl text-smallHeader'>
                    PGSHOP
                  </SheetTitle>
                </SheetHeader>
                <div className='space-y-2'>
                  {route.map((link, index) => (
                    <li key={index} className='list-none cursor-pointer'>
                      <Collapsible>
                        <CollapsibleTrigger className='flex items-center capitalize cursor-pointer'>
                          {link.name}
                          {(link.name === 'Promotional' ||
                            link.name === 'Clothing' ||
                            link.name === 'Headwear') && (
                            <RiArrowDropDownLine className='text-xl transition-all duration-300' />
                          )}
                        </CollapsibleTrigger>
                        {link.name === 'Promotional' && (
                          <CollapsibleContent className='ml-4 space-y-2'>
                            {megaMenu?.map((item) => (
                              <Collapsible
                                key={item.id}
                                open={openPromoId === item.id}
                                onOpenChange={(isOpen) =>
                                  setOpenPromoId(isOpen ? item.id : null)
                                }
                              >
                                <div>
                                  <CollapsibleTrigger className='flex items-center justify-between gap-2 text-sm font-medium text-black transition-colors text-start'>
                                    
                                      {item.name}
                                      <ChevronRight
                                        className={`h-3 w-3 ${
                                          openPromoId === item.id && 'rotate-90'
                                        }`}
                                      />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className='ml-6 space-y-2'>
                                      {item.subTypes?.map((section, index) => (
                                        <div key={index}>
                                          <h3 className='text-sm font-semibold text-blue-500'>
                                            {section.label}
                                          </h3>
                                          <div className='space-y-2'>
                                            {section.items?.map(
                                              (subItem, itemIndex) => (
                                                <button
                                                  key={itemIndex}
                                                  onClick={() => {
                                                    handleSubCategories(
                                                      subItem.name,
                                                      subItem.id,
                                                      item.name,
                                                      section.label
                                                    );
                                                    setIsSheetOpen(false);
                                                  }}
                                                  className='font-semibold hover:underline text-[13px] block text-start text-black'
                                                >
                                                  {subItem.name}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ))}
                          </CollapsibleContent>
                        )}
                        {link.name === 'Clothing' && (
  <CollapsibleContent className='ml-4 space-y-2'>
    {megaMenuClothing?.map((item) => (
      <Collapsible
        key={item.id}
        open={openPromoId === item.id}
        onOpenChange={(isOpen) =>
          setOpenPromoId(isOpen ? item.id : null)
        }
      >
        <div>
          <CollapsibleTrigger className='flex items-center justify-between gap-2 text-sm font-medium text-black transition-colors text-start'>
            {item.name}
            <ChevronRight
              className={`h-3 w-3 ${
                openPromoId === item.id && 'rotate-90'
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='ml-6 space-y-2'>
              {item.subTypes?.map((section, index) => (
                <div key={index}>
                  <h3 className='text-sm font-semibold text-blue-500'>
                    {section.label}
                  </h3>
                  <div className='space-y-2'>
                    {section.items?.map(
                      (subItem, itemIndex) => (
                        <button
                          key={itemIndex}
                          onClick={() => {
                            handleSubCategories(
                              subItem.name,
                              subItem.id,
                              item.name,
                              section.label
                            );
                            setIsSheetOpen(false);
                          }}
                          className='font-semibold hover:underline text-[13px] block text-start text-black'
                        >
                          {subItem.name}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    ))}
  </CollapsibleContent>
)}

                        {link.name === 'Headwear' && (
                          <CollapsibleContent className='ml-4 space-y-2'>
                            {megaMenuHeadwear
                              .map((category, categoryIndex) => (
                                <div key={category.id}>
                                  <button
                                    className='flex items-center justify-between gap-2 px-4 py-2 text-lg text-black transition-colors'
                                    onClick={() =>
                                      handleNameCategories(
                                        category.name,
                                        category.id
                                      )
                                    }
                                  >
                                    {category.name}
                                  </button>
                                  <div className='ml-6 space-y-2'>
                                    {category.subTypes?.map(
                                      (section, index) => (
                                        <div key={index}>
                                          {section.items.map(
                                            (subItem, subIndex) => (
                                              <div key={subIndex}>
                                                <div className='space-y-2'>
                                                  <button
                                                    onClick={() => {
                                                      handleSubCategories(
                                                        subItem.name,
                                                        subItem.id,
                                                        category.name,
                                                        section.label
                                                      );
                                                      setIsSheetOpen(false);
                                                    }}
                                                    className='font-semibold hover:underline text-[13px] block text-start text-black'
                                                  >
                                                    {subItem.name}
                                                  </button>
                                                  {/* ))} */}
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              ))}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </li>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <div className='hidden lg:block'>
              <ul className='space-y-3 lg:space-y-0 lg:flex lg:space-x-6'>
                {route.map((link, index) => (
                  <li
                    key={index}
                    onMouseLeave={() => {
                      sethoverMegaMenu(false);
                      sethoverClothingMenu(false);
                    }}
                    className={`cursor-pointer ${
                      link.name === 'Promotional' ||
                      link.name === 'Clothing' ||
                      link.name === 'Headwear'
                        ? 'group relative'
                        : ''
                    }`}
                  >
                    <div
                      // to={link.path}
                      className='text-customBlue'
                    >
                      <span
                        className='flex capitalize'
                        onMouseEnter={() => {
                          if(link.name === 'Promotional') {
                            sethoverMegaMenu(true);

                          } else if(link.name === 'Clothing') {
                            sethoverClothingMenu(true);
                          }
                        }}
                        onClick={() => {
                          if (link.name === 'Promotional') return;
                          conditionalCategoryNameHandler(link);
                        }}
                      >
                        {link.name}
                        {(link.name === 'Promotional' ||
                          link.name === 'Clothing' ||
                          link.name === 'Headwear') && (
                          <RiArrowDropDownLine className='-rotate-90 group-hover:rotate-[52px] text-xl transition-all duration-300' />
                        )}
                      </span>

                      {link.name === 'Promotional' && megaMenuMobile && (
                        <div className='absolute left-0 w-64 p-3 mt-2 bg-white shadow-lg md:hidden'>
                          {mobileNavDropHeading.map((category, index) => (
                            <div key={index} className='mb-2'>
                              <h6
                                className='text-base flex justify-between items-center text-[#007bff] font-semibold cursor-pointer'
                                onClick={() => toggleCategory(index)}
                              >
                                {category.title}
                                <RiArrowDropDownLine
                                  className={`text-xl transition-all duration-300 ${
                                    activeCategory === index
                                      ? 'rotate-0'
                                      : '-rotate-90'
                                  }`}
                                />
                              </h6>
                              {activeCategory === index && (
                                <ul className='pl-4 mt-2 space-y-1'>
                                  {category.children.map((child, i) => (
                                    <li key={i}>
                                      <Link
                                        to={child.path}
                                        className=' font-semibold text-[15px] block'
                                      >
                                        {child.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {link.name === 'Clothing' && (
  <div
    className={`absolute -left-[120px] lg:-left-[150px] top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden 
                ${
                  hoverClothingMenu
                    ? 'group-hover:flex'
                    : 'hidden'
                }`}
  >
    <div className='container mx-auto'>
      <div
        className='overflow-hidden rounded-lg border 
                    bg-[#333333] w-[900px] shadow-lg'
      >
        <div className='grid grid-cols-[1fr_3fr]'>
          <div className='border-r backdrop-blur-sm'>
            <nav className='flex flex-col py-2'>
              {megaMenuClothing?.map((item) => {
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted',
                      activeClothingItem === item.id
                        ? 'bg-muted font-medium text-primary'
                        : 'text-white'
                    )}
                    onMouseEnter={() =>
                      setActiveClothingItem(item.id)
                    }
                    onClick={() =>
                      handleNameCategories(
                        item.name,
                        item.id
                      )
                    }
                  >
                    {item.name}
                    <ChevronRight className='w-4 h-4' />
                  </button>
                );
              })}
            </nav>
          </div>
          <div className='w-full p-5'>
            <div className='flex justify-start gap-10'>
              {megaMenuClothing
                .find((category) => category.id === activeClothingItem)
                ?.subTypes?.map((section, index) => (
                  <div key={index} className='space-y-2'>
                    <h3 className='text-sm font-semibold text-blue-500'>
                      {section.label}
                    </h3>
                    <div className='space-y-4'>
                      {section?.items?.map(
                        (subItem, itemIndex) => (
                          <button
                            key={itemIndex}
                            onClick={() =>
                              handleSubCategories(
                                subItem.name,
                                subItem.id,
                                megaMenuClothing.find(
                                  (item) => item.id === activeClothingItem
                                )?.name,
                                section.label
                              )
                            }
                            className='font-semibold hover:underline text-[13px] block text-start text-white'
                          >
                            {subItem.name}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
                    {link.name === 'Headwear' && (
                      <div className='absolute max-lg:top-8 -left-[100px] lg:-left-[10px] z-50 flex shadow-lg bg-[#333333] max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[700px] px-8 group-hover:pb-8 group-hover:pt-6 transition-all duration-500 gap-10 max-sm2:hidden'>
                        {megaMenuHeadwear
                          // .filter(category => category.name === 'Clothing')
                          .map((category, categoryIndex) => (
                            <div
                              key={categoryIndex}
                              className='lg:min-w-[180px] max-lg:min-w-[140px]'
                            >
                              <p
                                onClick={() =>
                                  handleNameCategories(
                                    category.name,
                                    category.id
                                  )
                                }
                                className='text-lg font-semibold text-blue-500 cursor-pointer'
                              >
                                {category?.name}
                              </p>
                              <ul>
                                {category.subTypes.map((item, index) => (
                                  <div key={index}>
                                    {item.items.map((subItem, subIndex) => (
                                      <li
                                        key={subIndex}
                                        className='py-1 rounded'
                                      >
                                        <button
                                          onClick={() =>
                                            handleSubCategories(
                                              subItem.name,
                                              subItem.id,
                                              category?.name,
                                              item?.label
                                            )
                                          }
                                          className='font-semibold hover:underline text-[13px] block'
                                        >
                                          {subItem.name}
                                        </button>
                                      </li>
                                    ))}
                                  </div>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    )}

                    {link.name === 'Promotional' && (
                      <div
                        className={`absolute -left-[120px] lg:-left-[150px] top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 max-sm:hidden 
                                            ${
                                              hoverMegaMenu
                                                ? 'group-hover:flex'
                                                : 'hidden'
                                            }`}
                      >
                        <div className='container mx-auto'>
                          <div
                            className='overflow-hidden rounded-lg border 
                                                bg-[#333333] w-[900px] shadow-lg'
                          >
                            <div className='grid grid-cols-[1fr_3fr]'>
                              <div className='border-r backdrop-blur-sm'>
                                <nav className='flex flex-col py-2'>
                                  {megaMenu?.map((item) => {
                                    return (
                                      <button
                                        key={item.id}
                                        className={cn(
                                          'flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted',
                                          activeItem === item.id
                                            ? 'bg-muted font-medium text-primary'
                                            : 'text-white'
                                        )}
                                        onMouseEnter={() =>
                                          setActiveItem(item.id)
                                        }
                                        onClick={() =>
                                          handleNameCategories(
                                            item.name,
                                            item.id
                                          )
                                        }
                                      >
                                        {item.name}
                                        <ChevronRight className='w-4 h-4' />
                                      </button>
                                    );
                                  })}
                                </nav>
                              </div>
                              <div className='w-full p-5'>
                                <div className='flex justify-start gap-10'>
                                  {activeContent?.map((section, index) => (
                                    <div key={index} className='space-y-2'>
                                      <h3 className='text-sm font-semibold text-blue-500'>
                                        {section.label}
                                      </h3>
                                      <div className='space-y-4'>
                                        {section?.items?.map(
                                          (subItem, itemIndex) => (
                                            <button
                                              key={itemIndex}
                                              onClick={() =>
                                                handleSubCategories(
                                                  subItem.name,
                                                  subItem.id,
                                                  megaMenu.find(
                                                    (item) =>
                                                      item.id === activeItem
                                                  )?.name,
                                                  section.label
                                                )
                                              }
                                              className='font-semibold hover:underline text-[13px] block text-start text-white'
                                            >
                                              {subItem.name}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
      <div className='Mycontainer'>
        <div className='  mt-2  lg:hidden md:hidden flex gap-2 border border-black  items-center bg-white w-full h-[40px] px-4'>
          <input
            value={inputValue}
            onChange={handleChange}
            type='text'
            placeholder='Search for anything...'
            className='w-full text-black bg-transparent outline-none'
          />
          <IoSearchSharp className='text-xl text-black' />
        </div>
      </div>

      <div className='py-3 mt-1 bg-shipping lg:mt-0 md:mt-0'>
        <div className='flex flex-wrap items-center justify-center gap-2 Mycontainer lg:gap-8 md:gap-8'>
          <h1 className='text-sm font-medium lg:text-lg md:text-lg text-smallHeader'>
            20% OFF + FREE Shipping on $150
          </h1>
          <div className='flex items-center gap-2 px-4 py-1 border-2 border-smallHeader'>
            <IoPricetagSharp className='text-sm font-bold lg:text-lg md:text-lg text-smallHeader' />
            <button className='text-sm font-bold uppercase lg:text-lg md:text-lg text-smallHeader'>
              code cyber
            </button>
          </div>
        </div>
      </div>
      {navbarLogout && (
        <motion.div className='fixed inset-0 top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50 backdrop-blur-sm'>
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className='flex flex-col w-[100%] sm:max-w-[40%] sm:w-full text-gray-800 justify-center bg-white p-5 rounded-md'
          >
            <p className='text-sm font-semibold'>
              Are you sure you want to logout?
            </p>
            <p className='text-sm text-gray-500'>
              You can login back at any time. All the changes you've been made
              will not be lost.
            </p>
            <div className='flex justify-end gap-2'>
              <button
                className='px-3 py-1 text-gray-700 transition duration-300 border rounded hover:bg-gray-100'
                onClick={() => setNavbarLogout(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setNavbarLogout(false);
                }}
                className='px-3 py-1 text-white transition-all bg-red-600 rounded hover:bg-red-500'
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default SMiniNav;
