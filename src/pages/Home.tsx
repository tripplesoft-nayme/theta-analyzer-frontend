import CommonWrapper from "../Common/CommonWrapper";

const Home = () => {
  return (
    <CommonWrapper>
      <div className="h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen ">
          <h2 className="text-5xl font-semibold mb-4">Welcome To</h2>
          <h1 className="text-7xl text-blue-500! font-bold">Theta Analyzer</h1>
        </div>
      </div>
    </CommonWrapper>
  );
};

export default Home;
