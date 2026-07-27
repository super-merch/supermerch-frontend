import { FaGoogle } from "react-icons/fa6";
import { Heading } from "../Common";

const GOOGLE_REVIEWS_URL = "https://maps.app.goo.gl/cXd6s7xCWRjYiD1Z7";

/**
 * A stable source link prevents third-party widget outages from publishing an
 * error message on the homepage. Google remains the source of review content.
 */
const GoogleReviewsComponent = () => (
  <section className="w-full bg-white py-10" aria-labelledby="google-reviews">
    <div className="Mycontainer text-center">
      <Heading
        title="Customer Reviews"
        description="Read verified customer feedback on our Google Business Profile."
        align="center"
        size="large"
        titleClassName="uppercase"
        descriptionClassName="text-gray-600"
        containerClassName="mb-8 py-0 !py-0"
        showUnderline={true}
      />
      <a
        id="google-reviews"
        href={GOOGLE_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90 sm:text-base"
      >
        <FaGoogle className="mr-2 h-4 w-4" aria-hidden="true" />
        View our Google reviews
      </a>
    </div>
  </section>
);

export default GoogleReviewsComponent;
