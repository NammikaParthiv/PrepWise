import { useState, useRef, useEffect } from "react";
import Navbar from "../layouts/NavBar.jsx";
import axios from "../../utils/axios.js";
const AddReference = () => {
  const [activeCategory, setActiveCategory] = useState("Frontend");
  const [materials, setMaterials] = useState({
    Frontend: [],
    Backend: [],
    DSA: [],
  });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const categories = ["Frontend", "Backend", "DSA"];

  useEffect(()=>{
    const fetchReferences = async()=>{
      try{
        const response = await axios.get("/api/admin/references");
        setMaterials(response.data);
      }catch(error){
        console.error("Error at fetching the references",error);
      }
    }
    fetchReferences();
  },[]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
    const formData = new FormData();
    formData.append("file",file);
    formData.append("category",activeCategory);

    try {
      const res = await axios.post("/api/admin/addRefereces",formData);
      setMaterials(res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const deleteFile = async (e, id, fileName) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${fileName}"?`)) {
      try{
        const res = await axios.delete(`/api/admin/reference/${id}?category=${activeCategory}`);
        setMaterials(res.data);
      }catch(error){
        console.error("Error in deleting the file:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-900 pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="relative w-full bg-white p-2 rounded-4xl border border-slate-200 shadow-xl flex mb-16">
          <div className="absolute top-2 bottom-2 rounded-3xl bg-indigo-600 transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
               style={{ width: `${100/categories.length}%`, left: `${(categories.indexOf(activeCategory)*100)/categories.length}%` }} />
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-1 z-10 py-5 text-lg font-black transition-colors ${activeCategory === cat ? "text-white" : "text-slate-400 hover:text-slate-700"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black">{activeCategory} Library</h2>
          <button onClick={() => fileInputRef.current.click()} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition shadow-lg">+ Upload File</button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
        </div>

        {materials[activeCategory].length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials[activeCategory].map((file) => (
              <div key={file.id} onClick={() => setPreview(file)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                <div className="flex justify-between mb-6">
                  <div className="text-5xl">{file.type === "pdf" ? "📄" : "🖼️"}</div>
                  <button onClick={(e) => deleteFile(e, file.id, file.name)} className="p-2 rounded-full text-slate-300 hover:bg-red-500 hover:text-white transition-all">✕</button>
                </div>
                <h3 className="font-bold text-lg text-slate-800 truncate">{file.name}</h3>
                <p className="text-base font-bold text-slate-400 mt-2">Added: {file.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 border-4 border-dashed border-slate-300 rounded-4xl flex flex-col items-center justify-center text-slate-500">
            <span className="text-8xl mb-6">📂</span>
            <p className="text-2xl font-black text-slate-600">No materials available in {activeCategory}</p>
          </div>
        )}
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button 
            onClick={() => setPreview(null)} 
            className="absolute top-8 right-8 z-60 bg-white/10 hover:bg-red-600 transition-colors text-white font-black text-xl px-8 py-4 rounded-2xl border-2 border-white/20 cursor-pointer"
          >
            CLOSE ✕
          </button>
          <div className="w-full h-full flex items-center justify-center p-8">
            {preview.type === "photo" ? 
              <img src={preview.url} className="max-w-full max-h-full object-contain rounded-xl" /> : 
              <iframe src={preview.url} className="w-full h-full rounded-xl" />
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReference;