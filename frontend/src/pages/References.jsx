import { useState, useRef, useEffect } from "react";
import Navbar from "./layouts/NavBar.jsx";
import axios from "../utils/axios.js";
import { FaPlus, FaTrash, FaFilePdf, FaImage, FaTimes } from "react-icons/fa";

const References = () => {
  const [activeCategory, setActiveCategory] = useState("Frontend");
  const [materials, setMaterials] = useState({ Frontend: [], Backend: [], DSA: [] });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const categories = ["Frontend", "Backend", "DSA"];
  
  // TODO: Replace this with your actual authentication state logic
  const isAdmin = true; 

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get("/api/admin/references");
        setMaterials(response.data);
      } catch (error) {
        console.error("Error at fetching the references", error);
      }
    };
    fetchReferences();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", activeCategory);

    try {
      const res = await axios.post("/api/admin/add_references", formData);
      setMaterials(res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const deleteFile = async (e, id, fileName) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${fileName}"?`)) {
      try {
        const res = await axios.delete(`/api/admin/reference/${id}?category=${activeCategory}`);
        setMaterials(res.data);
      } catch (error) {
        console.error("Error in deleting the file:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-extrabold text-slate-950">Reference Library</h1>
            <p className="text-slate-500 mt-2 font-medium">Curated resources for your technical growth</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 cursor-pointer"
            >
              <FaPlus /> Upload New Resource
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
        </header>

        <nav className="flex bg-white p-2 rounded-3xl border border-slate-200 shadow-sm mb-12">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`flex-1 py-4 text-lg font-bold transition-all rounded-2xl ${activeCategory === cat ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {materials[activeCategory]?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {materials[activeCategory].map((file) => (
              <div key={file._id} onClick={() => setPreview(file)} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-slate-100 rounded-2xl text-2xl text-indigo-600">
                    {file.type === "pdf" ? <FaFilePdf /> : <FaImage />}
                  </div>
                  {isAdmin && (
                    <button onClick={(e) => deleteFile(e, file._id, file.name)} className="p-2 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-full transition-all">
                      <FaTrash />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 truncate mb-1">{file.name}</h3>
                <p className="text-sm font-semibold text-slate-400">Added: {file.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 bg-white rounded-4xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-xl font-bold">No materials found in {activeCategory}</p>
          </div>
        )}
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button onClick={() => setPreview(null)} className="absolute top-8 right-8 text-white hover:text-red-400 text-3xl"><FaTimes /></button>
          <div className="w-full h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
            {preview.type === "photo" ? 
              <img src={preview.photo_url} className="w-full h-full object-contain" alt="preview" /> : 
              <iframe src={preview.photo_url} className="w-full h-full" title="pdf-preview" />
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default References;


































// const newFile = {
    //   id: Date.now(),
    //   name: file.name.split('.')[0],
    //   url: URL.createObjectURL(file),
    //   type: file.type === "application/pdf" ? "pdf" : "photo",
    //   date: new Date().toLocaleDateString(),
    // };

    // setMaterials(prev => ({ 
    //   ...prev, 
    //   [activeCategory]: [...prev[activeCategory], newFile] 
    // }));