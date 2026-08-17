import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "../../utils/axios.js";
import { FaPlus, FaCheck, FaPen, FaTrash, FaGripVertical } from "react-icons/fa";

function StudyPlanner() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  /*  TO STORE IN THE LOCAL STORAGE
    useEffect(() => {
    const storedGoals = localStorage.getItem("studyGoals");
    if (storedGoals) {
      // setTimeout is for not to get syncronised with the useEffect and the useState
      setTimeout(() => {
        setGoals(JSON.parse(storedGoals));
      }, 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studyGoals", JSON.stringify(goals));
  }, [goals]); */

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await axios.get("/api/goals");
        setGoals(res.data);
        /* sicne isEditing is not there in the backend..
        const updatedGoals = res.data.map((goal) => ({
          ...goal,
          isEditing: false,
        }));
        setGoals(updatedGoals); */
      } catch (error) {
        console.log(error);
      }
    };
    fetchGoals();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(goals);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setGoals(updated);
  };

  const addGoal = async () => {
    if (newGoal.trim() === "") return;
    try {
      const res = await axios.post("/api/goals", {
        goal_name: newGoal,
      });
      setGoals([...goals, { ...res.data, isEditing: false }]);
      setNewGoal("");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleGoal = async (index) => {
    try {
      const goal = goals[index];
      const res = await axios.put(`/api/goals/${goal._id}`, {
        goal_name: goal.goal_name,
        completed: !goal.completed,
      });
      const updated = [...goals];
      updated[index] = { ...res.data, isEditing: goal.isEditing };
      setGoals(updated);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteGoal = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) return;

    try {
      const goal = goals[index];
      await axios.delete(`/api/goals/${goal._id}`);
      // FIX: update frontend immediately
      setGoals((prevGoals) => prevGoals.filter((_, i) => i !== index));
    } catch (error) {
      console.log(error);
    }
  };

  const startEdit = (index) => {
    const updated = [...goals];
    updated[index].isEditing = true;
    setGoals(updated);
  };

  const editGoal = (index, newText) => {
    const updated = [...goals];
    updated[index].goal_name = newText;
    setGoals(updated);
  };

  const finishEdit = async (index) => {
    try {
      const goal = goals[index];
      const res = await axios.put(`/api/goals/${goal._id}`, {
        goal_name: goal.goal_name,
        completed: goal.completed,
      });
      const updated = [...goals];
      updated[index] = { ...res.data, isEditing: false };
      setGoals(updated);
    } catch (error) {
      console.log(error);
    }
  };

  const completedCount = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/80 via-teal-50/40 to-green-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 sm:px-6 pb-16">
      <div className="max-w-3xl sm:max-w-5xl mx-auto pt-20 sm:pt-28">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Set Your Goals 🚀
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 mt-2 font-medium">
            Organize, prioritize, and track your daily preparation goals
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            placeholder="Add a new study goal..."
            className="w-full flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-slate-800 dark:text-slate-100 transition"
          />
          <button
            className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-teal-600 hover:shadow-lg text-white px-6 py-3.5 rounded-xl sm:rounded-2xl cursor-pointer text-sm sm:text-base font-bold transition flex items-center justify-center gap-2 shrink-0"
            onClick={addGoal}
          >
            <FaPlus />
            <span>Add Goal</span>
          </button>
        </div>
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8">
          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
            <span>Overall Progress</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount} / {goals.length} completed ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-emerald-500 to-teal-500 rounded-full h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Drag and Drop List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="goalList">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {goals.length === 0 ? (
                  <div className="text-center py-12 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 dark:text-slate-500 font-semibold text-base sm:text-lg italic">
                      No goals yet. Add one above to get started!
                    </p>
                  </div>
                ) : (
                  goals.map((goal, index) => (
                    <Draggable key={goal._id} draggableId={goal._id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between bg-white dark:bg-slate-900 px-4 sm:px-6 py-4 rounded-xl sm:rounded-2xl shadow-xs border transition-all ${
                            snapshot.isDragging
                              ? "shadow-xl ring-2 ring-emerald-500/50 dark:ring-emerald-400/50"
                              : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {/* Drag Handle & Left Content */}
                          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                            <div
                              {...provided.dragHandleProps}
                              className="text-slate-300 dark:text-slate-600 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block"
                            >
                              <FaGripVertical />
                            </div>

                            <input
                              type="checkbox"
                              checked={goal.completed}
                              onChange={() => toggleGoal(index)}
                              className="h-5 w-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-500 shrink-0"
                            />

                            {goal.isEditing ? (
                              <input
                                type="text"
                                value={goal.goal_name}
                                onChange={(e) => editGoal(index, e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && finishEdit(index)}
                                autoFocus
                                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm sm:text-base text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            ) : (
                              <span
                                className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                                  goal.completed
                                    ? "line-through text-slate-400 dark:text-slate-500"
                                    : "text-slate-800 dark:text-slate-100"
                                }`}
                              >
                                {goal.goal_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {goal.isEditing ? (
                              <button
                                onClick={() => finishEdit(index)}
                                className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition cursor-pointer"
                                title="Save"
                              >
                                <FaCheck className="text-xs sm:text-sm" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startEdit(index)}
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                                title="Edit"
                              >
                                <FaPen className="text-xs sm:text-sm" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteGoal(index)}
                              className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash className="text-xs sm:text-sm" />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default StudyPlanner;