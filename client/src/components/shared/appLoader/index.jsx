import Spinner from "../spinner";

const AppLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner isLoading />
    </div>
  );
};

export default AppLoader;
