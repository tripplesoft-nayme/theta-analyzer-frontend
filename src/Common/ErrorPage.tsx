import { Link } from 'react-router-dom';

const ErrorPage = ({ errorMessage = "Something went wrong!" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text & Button */}
        <div className="text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800 animate-pulse">
            Oops!
          </h1>
          <p className="mt-6 text-2xl md:text-3xl font-semibold text-gray-700">
            {errorMessage}
          </p>
          <p className="mt-4 text-lg text-gray-600">
            We couldn't find the page you're looking for, or an unexpected error occurred.
            Don't worry — our little robot is already working on it!
          </p>
          <div className="mt-10">
            <Link
              to="#"
              className="inline-block px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="flex justify-center">
          <img
            src="https://static.vecteezy.com/system/resources/previews/008/568/882/non_2x/website-page-not-found-error-404-robot-character-broken-chatbot-mascot-disabled-site-on-technical-work-web-design-template-cartoon-online-bot-crash-accident-robotic-assistance-failure-eps-vector.jpg"
            alt="Broken robot illustration for error page"
            className="w-full max-w-md rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;