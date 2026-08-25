import { useState, useRef, useEffect } from "react";
import axios from "../utils/axios.js";
import { useAuth } from "../context/AuthProvider.jsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FaPlus,
  FaTrash,
  FaFilePdf,
  FaImage,
  FaTimes,
  FaBookOpen,
  FaEdit,
  FaCheck,
  FaGripVertical,
  FaSpinner,
  FaExpand,
} from "react-icons/fa";

const References = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const [activeCategory, setActiveCategory] = useState("Frontend");
  const [materials, setMaterials] = useState({
    Frontend: [],
    Backend: [],
    DSA: [],
  });
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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

    setUploadingCategory(activeCategory);

    try {
      const res = await axios.post("/api/references/add_reference", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMaterials(res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const deleteFile = async (e, id, fileName) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${fileName}"?`)) {
      try {
        const res = await axios.delete(
          `/api/references/${id}?category=${activeCategory}`,
        );
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
      alert("Backend route error");
    }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const currentList = Array.from(materials[activeCategory] || []);
    const [reorderedItem] = currentList.splice(result.source.index, 1);
    currentList.splice(result.destination.index, 0, reorderedItem);

    const updatedMaterials = {
      ...materials,
      [activeCategory]: currentList,
    };
    setMaterials(updatedMaterials);

    try {
      const res = await axios.put("/api/references/reorder", {
        category: activeCategory,
        items: currentList.map((item) => item._id),
      });
      setMaterials(res.data);
    } catch (error) {
      console.error("Failed to save reordered list:", error);
    }
  };

  const getFileUrl = (file) => {
    const rawPath = file.url || file.photo_url || file.fileUrl || file.path;
    if (!rawPath) return "";
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    return `${backendUrl}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`;
  };

  const renderCardContent = (file, dragHandleProps = null) => (
    <div
      onClick={() => {
        if (editingId !== file._id) {
          setPreviewLoading(true);
          setPreview(file);
        }
      }}
      className="group relative bg-white dark:bg-slate-900/95 backdrop-blur-md p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 shadow-xs hover:shadow-xl cursor-pointer flex flex-col justify-between min-h-47 sm:min-h-55 h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <div
                {...dragHandleProps}
                onClick={(e) => e.stopPropagation()}
                className="text-slate-300 dark:text-slate-600 hover:text-indigo-500 p-1 cursor-grab active:cursor-grabbing touch-none"
                title="Drag to reorder"
              >
                <FaGripVertical className="text-base sm:text-xl" />
              </div>
            )}
            <div className="p-3.5 sm:p-4 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl sm:rounded-2xl text-xl sm:text-3xl shrink-0">
              {file.type === "pdf" ? <FaFilePdf /> : <FaImage />}
            </div>
          </div>

          {isAdmin && (
            <div
              className="flex items-center gap-1 sm:gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(file._id);
                  setNewName(file.name);
                }}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
                title="Edit Name"
              >
                <FaEdit />
              </button>
              <button
                type="button"
                onClick={(e) => deleteFile(e, file._id, file.name)}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
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
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl text-sm border border-indigo-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <FaCheck className="text-xs sm:text-sm" />
            </button>
          </form>
        ) : (
          <h3 className="font-bold text-base sm:text-xl text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {file.name}
          </h3>
        )}
      </div>

      <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4">
        Added: {file.date}
      </p>
    </div>
  );

  const activeItems = materials[activeCategory] || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50/60 via-slate-50 to-blue-50/50 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="p-3.5 sm:p-4 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl text-2xl sm:text-3xl shrink-0 shadow-xs">
              <FaBookOpen />
            </div>
            <div>
              <h1 className="text-2xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Reference Library
              </h1>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Curated technical assets for your preparation
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="w-full md:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingCategory !== null}
                className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95 text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus className="text-xs sm:text-sm" />{" "}
                <span>Add New Resource</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,image/*"
          />
        </header>

        <nav className="flex p-1.5 rounded-xl sm:rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 sm:mb-12 w-full gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-3 sm:py-4 text-xs sm:text-base font-bold transition-all rounded-lg sm:rounded-xl cursor-pointer ${
                activeCategory === cat
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {activeItems.length > 0 || uploadingCategory === activeCategory ? (
          isAdmin ? (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="references-grid">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  >
                    {uploadingCategory === activeCategory && (
                      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center min-h-47 sm:min-h-55 h-full animate-pulse shadow-lg">
                        <FaSpinner className="text-3xl text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">
                          Uploading to Cloudinary...
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Please wait while processing
                        </p>
                      </div>
                    )}
                    {activeItems.map((file, index) => (
                      <Draggable
                        key={file._id}
                        draggableId={file._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-shadow ${snapshot.isDragging ? "z-50 opacity-90 scale-102" : ""}`}
                          >
                            {renderCardContent(file, provided.dragHandleProps)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {uploadingCategory === activeCategory && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center min-h-47 sm:min-h-55 h-full animate-pulse shadow-lg">
                  <FaSpinner className="text-3xl text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">
                    Uploading to Cloudinary...
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Please wait while processing
                  </p>
                </div>
              )}
              {activeItems.map((file) => (
                <div key={file._id}>{renderCardContent(file)}</div>
              ))}
            </div>
          )
        ) : (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white/40 dark:bg-slate-900/30 text-center px-4">
            <div className="text-4xl sm:text-6xl mb-3 opacity-40">📂</div>
            <p className="text-base sm:text-xl font-bold text-slate-600 dark:text-slate-400">
              No resources available in {activeCategory}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
              Check back later or add new files to this section.
            </p>
          </div>
        )}
      </main>

      {preview && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-1 sm:p-2">
          {/* Top Absolute Action Bar with High Z-Index */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-60 flex items-center gap-2">
            <a
              href={getFileUrl(preview)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 sm:p-3 bg-slate-800/90 hover:bg-indigo-600 text-white rounded-full transition-all border border-slate-700 shadow-2xl cursor-pointer flex items-center justify-center"
              title="Open Full Screen in New Tab"
            >
              <FaExpand className="text-base sm:text-lg" />
            </a>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setPreviewLoading(false);
              }}
              className="p-2.5 sm:p-3 bg-slate-800/90 hover:bg-rose-600 text-white rounded-full transition-all border border-slate-700 shadow-2xl cursor-pointer flex items-center justify-center"
              title="Close Preview"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>

          {/* Title Header overlay */}
          <div className="absolute top-4 left-6 z-60 max-w-[50%] hidden sm:block">
            <h3 className="text-sm sm:text-base font-bold text-white truncate bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-lg">
              {preview.name || "Resource Preview"}
            </h3>
          </div>

          {/* True Full Screen Display Container */}
          <div className="w-full h-full max-w-full max-h-full bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-800 shadow-2xl flex items-center justify-center relative">
            {previewLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs">
                <FaSpinner className="text-4xl text-indigo-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-200">
                  Loading preview...
                </p>
              </div>
            )}

            {preview.type === "pdf" ? (
              <iframe
                src={getFileUrl(preview)}
                onLoad={() => setPreviewLoading(false)}
                className="w-full h-full border-none bg-white"
                title={preview.name || "Reference File"}
              />
            ) : (
              <img
                src={getFileUrl(preview)}
                onLoad={() => setPreviewLoading(false)}
                className="w-full h-full object-contain p-2 sm:p-4"
                alt={preview.name || "Reference File"}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default References;