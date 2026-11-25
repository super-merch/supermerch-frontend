import PropTypes from "prop-types";
import { FaStar } from "react-icons/fa";
import { ExternalLink } from "lucide-react";

// Exported so the homepage hero's rating badge links to the same profile.
export const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/cXd6s7xCWRjYiD1Z7";

const REVIEWS = [
  {
    name: "Lloyd Thompson",
    timeAgo: "3 weeks ago",
    rating: 5,
    text: "I bought branded merchandise for my business through Super Merch, embroidered logos on the baseball caps and business shirts, and custom printed t-shirts. The quality of everything was excellent. What stood out was the service. Ankit called me personally to confirm the details and gave genuinely useful advice on logo positioning and sizing before anything went into production. The merchandise arrived looking exactly as planned, and I was delighted with it. I'd highly recommend Super Merch to any business owner after custom branded merchandise done to a high level of quality and service.",
    avatar: "/reviewers/lloyd-thompson.png",
    initials: "LT",
    color: "bg-blue-500",
  },
  {
    name: "Faarooq Dean",
    timeAgo: "3 weeks ago",
    rating: 5,
    text: "Thank you to Ankit for delivering our lanyards ordered for the event in urgent timeframe. The product is absolutely on point and great quality. Highly recommend Ankit for any merchandise and we hope to do more business with Supermerch.",
    avatar: "/reviewers/faarooq-dean.png",
    initials: "FD",
    color: "bg-red-500",
  },
  {
    name: "Anthony Gamauf",
    timeAgo: "7 months ago",
    rating: 5,
    text: "Ankit and the team at Super Merch were fantastic to deal with! They took care of my business logo, stickers/decals and work uniforms. The attention to detail with ensuring that all my expectations were met was 10/10. Very happy with the quality of the products, thank you guys! Highly recommend Super Merch.",
    avatar: "/reviewers/anthony-gamauf.png",
    initials: "AG",
    color: "bg-green-600",
  },
  {
    name: "Kevin Paulraj",
    timeAgo: "7 months ago",
    rating: 5,
    text: "Ankit is such a pleasure to work with. When we made my shirts he was willing to go back and forth, was very open to feedback, even invited me into his home and was so welcoming. Even the client I referred to him was raving about him as well and the result he got. I would trust no one less when getting custom shirts and promotional work done — is a legend and always goes above and beyond.",
    avatar: "/reviewers/kevin-paulraj.png",
    initials: "KP",
    color: "bg-yellow-600",
  },
  {
    name: "Deborah Fay",
    timeAgo: "7 months ago",
    rating: 5,
    text: "If you're looking for a supplier for merch — whether it's t-shirts, jumpers, or just about anything you can think of — Ankit from Super Merch is fantastic. He offers great options, can source almost anything you need, and delivers excellent quality every time. Hands down one of the easiest and most reliable people to deal with. Thanks for the amazing shirts Ankit.",
    avatar: "/reviewers/deborah-fay.png",
    initials: "DF",
    color: "bg-pink-500",
  },
];

// Number of review cards shown in the desktop grid. Mobile shows every
// review in a swipeable row.
const DESKTOP_REVIEW_COUNT = 3;

const GoogleG = ({ className = "" }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

GoogleG.propTypes = { className: PropTypes.string };

const StarRow = ({ rating = 5, label }) => (
  <div
    className="flex gap-0.5"
    {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-sm-amber" : "text-sm-line"}
        size={16}
        aria-hidden="true"
      />
    ))}
  </div>
);

StarRow.propTypes = {
  rating: PropTypes.number,
  label: PropTypes.string,
};

const ReviewCard = ({ review }) => (
  <figure className="flex h-full flex-col rounded-3xl border border-sm-line bg-white p-6">
    <StarRow rating={review.rating} label={`${review.rating} out of 5 stars`} />
    <blockquote className="mt-4 text-sm-deep">
      <p className="line-clamp-5 text-[15px] leading-relaxed">“{review.text}”</p>
    </blockquote>
    <figcaption className="mt-auto flex items-center gap-3 pt-6">
      <img
        src={review.avatar}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-sm-deep">
          {review.name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-sm-muted">
          <GoogleG className="h-3 w-3" />
          Google review
        </span>
      </span>
    </figcaption>
  </figure>
);

ReviewCard.propTypes = {
  review: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
};

const GoogleReviewsComponent = () => (
  <section className="w-full bg-white py-14 sm:py-20" aria-labelledby="google-reviews-heading">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Summary panel */}
        <div className="flex flex-col rounded-3xl bg-sm-tint p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sm-teal">
            Customer reviews
          </p>
          <h2
            id="google-reviews-heading"
            className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-sm-deep sm:text-4xl"
          >
            Businesses come back to us. Here&apos;s why.
          </h2>
          <div className="mt-6">
            <StarRow />
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-sm-800">
            <GoogleG className="h-5 w-5" />
            Verified Google reviews
          </p>
          {/* mt-auto pins the button to the bottom when the panel is stretched */}
          <div className="mt-auto pt-8">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-sm-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-sm-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sm-teal"
            >
              Read all reviews on Google
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        {/* Review cards: swipeable row below lg, 3-up grid on lg */}
        <div className="min-w-0 lg:col-span-2">
          <ul
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:h-full lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0"
            aria-label="Customer reviews from Google"
          >
            {REVIEWS.map((review, index) => (
              <li
                key={review.name}
                className={`w-[85vw] max-w-[360px] flex-shrink-0 snap-start lg:w-auto lg:max-w-none ${
                  index >= DESKTOP_REVIEW_COUNT ? "lg:hidden" : ""
                }`}
              >
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default GoogleReviewsComponent;
