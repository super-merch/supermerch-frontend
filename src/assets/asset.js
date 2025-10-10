let v1categories;
const getData = async()=>{
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1-categories`)
    const result = await response.json()
    v1categories = result.data

}
// getData()

export const megaMenu =
  v1categories
    ?.filter(
      (category) =>
        category.name !== "Clothing" &&
        category.name !== "Headwear" &&
        category.name !== "Capital Equipment"
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
      subTypes: category.subTypes || [],
    })) || [];

// Separate clothing category for special handling
const clothingCategory = v1categories?.find((cat) => cat.name === "Clothing");
export const megaMenuClothing = clothingCategory
  ? [
      {
        id: clothingCategory.id,
        name: clothingCategory.name,
        subTypes: clothingCategory.subTypes || [],
      },
    ]
  : [];
export const headWear = [
  {
    id: "G",
    name: "Headwear",
    subTypes: [
      {
        label: "Headwear",
        items: [
          {
            id: "G-01",
            name: "Baseball Caps",
          },
          {
            id: "G-02",
            name: "Beanies",
          },
          {
            id: "G-03",
            name: "Bucket & Sun Hats",
          },
          {
            id: "G-04",
            name: "Flat Peak Caps",
          },
          {
            id: "G-05",
            name: "Headbands",
          },
          {
            id: "G-06",
            name: "Kid's Caps",
          },
          {
            id: "G-07",
            name: "Straw Hats",
          },
          {
            id: "G-08",
            name: "Trucker Caps",
          },
          {
            id: "G-09",
            name: "Visors",
          },
          {
            id: "G-10",
            name: "Misc Headwear",
          },
        ],
      },
    ],
  },
];
