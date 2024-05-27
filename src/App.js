import "./App.css";
import UploadImages from "./components/UploadImages";

function App() {
  return (
    <div className="App">
      <div className="container mx-auto w-3/4">
        <div className="my-6">
          <h1 className="text-3xl text-center font-bold underline text-red-600">
            Multi Image Uploader Application
          </h1>
          <p className="text-gray-600 mb-4">
            You can upload images in any format (JPEG, PNG, GIF, etc.).
          </p>
        </div>
        <UploadImages />
      </div>
    </div>
  );
}

export default App;
