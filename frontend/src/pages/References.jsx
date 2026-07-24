import { useState, useRef, useEffect } from "react";
import axios from "../utils/axios.js";
import { useAuth } from "../context/AuthProvider.jsx";
import { FaPlus, FaTrash, FaFilePdf, FaImage, FaTimes, FaBookOpen, FaEdit, FaCheck } from "react-icons/fa";

const References = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";
  const [activeCategory, setActiveCategory] = useState("Frontend");
  const [materials, setMaterials] = useState({ Frontend: [], Backend: [], DSA: [] });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef(null);
  const categories = ["Frontend", "Backend", "DSA"];

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get("/api/references");
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
      const res = await axios.post("/api/references/add_reference", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMaterials(res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const deleteFile = async (e, id, fileName) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${fileName}"?`)) {
      try {
        const res = await axios.delete(`/api/references/${id}?category=${activeCategory}`);
        setMaterials(res.data);
      } catch (error) {
        console.error("Error in deleting the file:", error);
      }
    }
  };

  const handleUpdateName = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newName.trim()) return;

    try {
      const res = await axios.put(`/api/references/${id}`, {
        name: newName.trim(),
        category: activeCategory,
      });
      setMaterials(res.data);
      setEditingId(null);
      setNewName("");
    } catch (error) {
      console.error("Error updating file name:", error);
      alert("Backend route");
    }
  };

  const getFileUrl = (file) => {
    const rawPath = file.url || file.photo_url || file.fileUrl || file.path;
    if (!rawPath) return "";
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }
    return `http://localhost:2222${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`;
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 pb-20">
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-3xl">
              <FaBookOpen />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Reference Library</h1>
              <p className="text-slate-700 dark:text-slate-400 mt-1 font-medium">Curated technical assets for your growth</p>
            </div>
          </div>
          
          {isAdmin && (
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()} 
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <FaPlus /> Add New Resource
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
        </header>

        <nav className="flex p-2 rounded-3xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-md mb-12 w-full">
          {categories.map((cat) => (
            <button 
              key={cat} 
              type="button"
              onClick={() => setActiveCategory(cat)} 
              className={`flex-1 py-5 text-lg font-bold transition-all rounded-2xl ${
                activeCategory === cat 
                  ? "bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {materials[activeCategory]?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {materials[activeCategory].map((file) => (
              <div 
                key={file._id} 
                onClick={() => {
                  if (editingId !== file._id) setPreview(file);
                }} 
                className="group relative bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-md hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[240px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl text-3xl">
                      {file.type === "pdf" ? <FaFilePdf /> : <FaImage />}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(file._id);
                            setNewName(file.name);
                          }} 
                          className="text-slate-400 hover:text-indigo-500 transition-colors p-2 text-lg"
                          title="Edit Name"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => deleteFile(e, file._id, file.name)} 
                          className="text-slate-400 hover:text-red-500 transition-colors p-2 text-lg"
                          title="Delete Resource"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {isAdmin && editingId === file._id ? (
                    <form 
                      onSubmit={(e) => handleUpdateName(e, file._id)} 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex items-center gap-2 mb-3"
                    >
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl text-base border border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <FaCheck size={16} />
                      </button>
                    </form>
                  ) : (
                    <h3 className="font-bold text-xl truncate mb-2">{file.name}</h3>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added: {file.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-4xl bg-white/50 dark:bg-slate-900/20">
            <div className="text-6xl mb-4 opacity-40">📂</div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-400">No resources available in {activeCategory}</p>
          </div>
        )}
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-0">
          <button 
            type="button"
            onClick={() => setPreview(null)} 
            className="absolute top-8 right-8 z-50 p-2 bg-red-900/40 border border-red-500/30 text-red-200 rounded-xl hover:bg-red-800/60 transition-all"
          >
            <FaTimes size={24} />
          </button>
          <div className="w-full h-full flex items-center justify-center p-4">
            {preview.type === "pdf" ? (
              <iframe src={getFileUrl(preview)} className="w-full h-full border-none bg-white rounded-2xl" title={preview.name || "Reference File"} />
            ) : (
              <img src={getFileUrl(preview)} className="max-w-full max-h-full object-contain" alt={preview.name || "Reference File"} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default References;