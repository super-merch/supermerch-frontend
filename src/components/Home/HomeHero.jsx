import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Zap } from "lucide-react";
import HelpMePickModal from "./HelpMePickModal";
import { GOOGLE_REVIEWS_URL } from "./GoogleReviews";
import { popularCategories } from "./popularCategoriesData";
import heroLarge from "@/assets/mwts-recipient-customer.jpg";
import heroPolo from "@/assets/category-polo.webp";
import heroTote from "@/assets/category-bags.webp";

// Same destination the navbar's "Rush Order" item uses.
const RUSH_ORDER_PATH = "/24hr-production?expressWindow=sameday";

// Chip label -> entry name in popularCategoriesData, so the hero and the
// "Popular categories" section always point at the same category URLs.
const POPULAR_CHIPS = [
  { label: "Water bottles", source: "Water Bottles" },
  { label: "Polo shirts", source: "Polo Shirts" },
  { label: "Bags", source: "Bags" },
  { label: "Pens", source: "Pens" },
  { label: "Hampers", source: "Corporate Hampers" },
]
  .map((chip) => ({
    ...chip,
    path: popularCategories.find((c) => c.name === chip.source)?.path,
  }))
  .filter((chip) => chip.path);

const FiveStars = () => (
  <span className="flex gap-0.5 text-sm-amber" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
    ))}
  </span>
);

const HomeHero = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <section className="bg-sm-paper" aria-labelledby="home-hero-heading">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Text column */}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-sm-line bg-white px-3 py-1.5 text-xs font-semibold text-sm-800 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-sm-teal" aria-hidden="true" />
              Custom promotional products · Sydney, Australia
            </p>

            <h1
              id="home-hero-heading"
              className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-sm-deep sm:text-5xl lg:text-7xl"
            >
              Your logo on merch people{" "}
              <span className="text-sm-teal">actually keep.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-sm-muted sm:text-lg">
              Branded apparel, drinkware, bags and corporate gifts for Australian
              businesses — with in-house embroidery, local service and fast
              turnaround.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-sm-teal px-6 text-base font-semibold text-white transition-colors hover:bg-sm-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sm-teal sm:w-auto"
              >
                Shop products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-sm-deep px-6 text-base font-semibold text-sm-deep transition-colors hover:bg-sm-deep hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sm-teal sm:w-auto"
              >
                Help me pick
              </button>
            </div>

            {POPULAR_CHIPS.length > 0 && (
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-sm font-semibold text-sm-muted">Popular:</span>
                <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {POPULAR_CHIPS.map((chip) => (
                    <li key={chip.label} className="flex-shrink-0">
                      <Link
                        to={chip.path}
                        className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-sm-line bg-white px-4 text-sm font-medium text-sm-deep transition-colors hover:border-sm-teal hover:text-sm-teal"
                      >
                        {chip.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Image column */}
          <div className="relative mx-auto w-full max-w-[400px] sm:max-w-lg lg:max-w-none">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="col-span-2 row-span-2 aspect-square overflow-hidden rounded-3xl bg-white">
                <img
                  src={heroLarge}
                  alt="Drink bottle, candle, notebook and tech gadget branded with colourful logo transfers"
                  width={1081}
                  height={1054}
                  loading="eager"
                  // React 18 has no camelCase fetchPriority; lowercase passes through as-is.
                  // eslint-disable-next-line react/no-unknown-property
                  fetchpriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-3xl bg-white">
                <img
                  src={heroPolo}
                  alt="Man wearing an orange polo shirt"
                  width={800}
                  height={800}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-3xl bg-white">
                <img
                  src={heroTote}
                  alt="Woman carrying a canvas tote bag printed with a logo"
                  width={800}
                  height={800}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Rush order badge */}
            <Link
              to={RUSH_ORDER_PATH}
              className="absolute -top-4 right-3 inline-flex min-h-[44px] max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-sm-amber px-4 text-sm font-semibold text-sm-deep shadow-md transition-transform hover:-translate-y-0.5 sm:right-5"
            >
              <Zap className="h-4 w-4 flex-shrink-0 fill-current" aria-hidden="true" />
              <span className="truncate">Need it fast? 24-hour rush orders</span>
            </Link>

            {/* Google rating badge */}
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-5 left-3 inline-flex min-h-[44px] items-center gap-3 rounded-2xl border border-sm-line bg-white px-4 py-2.5 shadow-lg transition-transform hover:-translate-y-0.5 sm:left-5"
            >
              <FiveStars />
              <span className="text-sm font-semibold text-sm-deep">
                5-star reviews on Google
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <HelpMePickModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </section>
  );
};

export default HomeHero;
