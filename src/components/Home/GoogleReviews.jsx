import { FaGoogle } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { Heading } from "../Common";

const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/cXd6s7xCWRjYiD1Z7";

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

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
        size={14}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-5 gap-3 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-3">
      <img
        src={review.avatar}
        alt={review.name}
        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
      />
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{review.name}</p>
        <p className="text-xs text-gray-400">{review.timeAgo}</p>
      </div>
      <FaGoogle className="ml-auto text-gray-300 flex-shrink-0" size={16} />
    </div>
    <StarRating rating={review.rating} />
    <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">{review.text}</p>
  </div>
);

const GoogleReviewsComponent = () => (
  <section className="w-full bg-white py-10" aria-labelledby="google-reviews-heading">
    <div className="Mycontainer">
      <Heading
        id="google-reviews-heading"
        title="Customer Reviews"
        description="Read verified customer feedback on our Google Business Profile."
        align="center"
        size="large"
        titleClassName="uppercase"
        descriptionClassName="text-gray-600"
        containerClassName="mb-8 py-0 !py-0"
        showUnderline={true}
      />

      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide snap-x snap-mandatory">
        {REVIEWS.map((review) => (
          <div key={review.name} className="flex-shrink-0 w-[300px] sm:w-[340px] snap-start">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90 sm:text-base"
        >
          <FaGoogle className="mr-2 h-4 w-4" aria-hidden="true" />
          View Google reviews
        </a>
      </div>
    </div>
  </section>
);

export default GoogleReviewsComponent;
