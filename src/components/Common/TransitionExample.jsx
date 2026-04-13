import { useState } from "react";
import TransitionWrapper from "./TransitionWrapper";
import LoadingBar from "./LoadingBar";

const TransitionExample = () => {
  const [currentAnimation, setCurrentAnimation] = useState("fade");
  const [showLoading, setShowLoading] = useState(false);

  const animationTypes = [
    "fade",
    "slideUp",
    "slideDown",
    "slideLeft",
    "slideRight",
    "scale",
    "flip",
  ];

  const handleAnimationChange = (type) => {
    setCurrentAnimation(type);
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transition System Demo</h1>

      <LoadingBar isVisible={showLoading} color="purple" />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Choose Animation Type:</h2>
        <div className="flex flex-wrap gap-2">
          {animationTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleAnimationChange(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentAnimation === type
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[300px]">
        <TransitionWrapper type={currentAnimation} duration={0.6}>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Current Animation: {currentAnimation}
            </h3>
            <p className="text-gray-600 mb-4">
              This content is animated using the {currentAnimation} transition.
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
              <p>✨ Smooth transitions make your app feel more polished!</p>
            </div>
          </div>
        </TransitionWrapper>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Usage in Your Components:</h4>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`import TransitionWrapper from "./components/Common/TransitionWrapper";

<TransitionWrapper type="${currentAnimation}" duration={0.6}>
  <YourComponent />
</TransitionWrapper>`}
        </pre>
      </div>
    </div>
  );
};

export default TransitionExample;
