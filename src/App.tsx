import Layout from "./Layout/Layout";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { useSystemBranding } from "./hooks/useSystemBranding";

function App() {
  useGlobalSearch();
  useSystemBranding();
  return (
    <>
      <Layout />
    </>
  );
}

export default App;
