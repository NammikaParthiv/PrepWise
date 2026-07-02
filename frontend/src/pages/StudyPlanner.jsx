import Navbar from "./layouts/NavBar";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "../utils/axios.js";
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

  useEffect(()=>{
      const fetchGoals = async()=>{
        try{
          const res = await axios.get("/api/goals");
          setGoals(res.data);
        /* sicne isEditing is not there in the backend..
        const updatedGoals = res.data.map((goal) => ({
        ...goal,
        isEditing: false,
      }));
      setGoals(updatedGoals); */
      }catch(error){
      console.log(error);
    }
  }
  fetchGoals();
  },[]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(goals);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setGoals(updated);
  };

  const addGoal = async () => {
    if (newGoal.trim() === "")return;
    try{
      const res = await axios.post("/api/goals",{
        goal_name: newGoal,
      });
      setGoals([...goals,{...res.data, isEditing: false}]);
      setNewGoal("");
    }catch(error){
      console.log(error);
    }
  };

  const toggleGoal = async (index) => {
    try{
      const goal = goals[index];
      const res = await axios.put(`/api/goals/${goal._id}`,{
        goal_name: goal.goal_name,
        completed: !goal.completed,
      });
      const updated = [...goals];
      updated[index]={...res.data, isEditing: goal.isEditing};
      setGoals(updated);
    }catch(error){
      console.log(error);
    }
  };

  const deleteGoal = async (index) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
  if (!confirmDelete) return;

  try {
    const goal = goals[index];

    await axios.delete(`/api/goals/${goal._id}`);

    /* Not chaging frontend after chaging immediately
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);*/
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

  const finishEdit = async(index) => {
    try{
    const goal = goals[index];
    const res = await axios.put(`/api/goals/${goal._id}`,{
      goal_name: goal.goal_name,
      completed: goal.completed,
    });
    const updated= [...goals];
    updated[index]={...res.data, isEditing: false};
    setGoals(updated);
  }catch(error){
    console.log(error);
  }
  };

  const completedCount = goals.filter((goal) => goal.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="">
      <Navbar />
      <div className="bg-linear-to-br from-green-300 via-pink-100 to-gray-400 p-10 min-h-screen">
        <h1 className="text-5xl font-extrabold mb-8 text-center">
          Set your Goals 🚀
        </h1>

        {/* Input */}
        <div className="flex items-center justify-center mb-6 space-x-3">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a new goal"
            className="border rounded px-4 py-3 w-md text-lg"
          />
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-800 cursor-pointer text-lg font-semibold"
            onClick={addGoal}
          >
            + Add
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 max-w-4xl mx-auto">
          <p className="mb-2 text-xl font-semibold text-center">
            Progress: {completedCount} / {goals.length} goals completed
          </p>
          <div className="w-full bg-gray-400 rounded-full h-7">
            <div
              className="bg-green-600 rounded-full h-7"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Drag and Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="goalList">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-w-4xl mx-auto"
              >
                {goals.length === 0 ? (
                  <p className="text-gray-600 font-semibold text-3xl mt-30 italic text-center">No goals yet</p>
                ) : (
                  goals.map((goal, index) => (
                    <Draggable
                      key={goal._id}
                      draggableId={goal._id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between bg-white px-6 py-6 rounded-xl shadow-md mb-2"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={goal.completed}
                              onChange={() => toggleGoal(index)}
                              className="h-6 w-6 cursor-pointer"
                            />
                            {goal.isEditing ? (
                              <input
                                type="text"
                                value={goal.goal_name}
                                onChange={(e) => editGoal(index, e.target.value)}
                                className="ml-4 border rounded px-4 py-3 w-md text-lg"
                              />
                            ) : (
                              <span
                                className={`ml-4 font-bold text-xl ${
                                  goal.completed
                                    ? "line-through text-gray-500"
                                    : "text-black"
                                }`}
                              >
                                {goal.goal_name}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {goal.isEditing ? (
                              <button
                                onClick={() => finishEdit(index)}
                                className="bg-green-100 text-green-700 px-3 py-2 rounded-md cursor-pointer hover:bg-green-200"
                              >
                                ✅
                              </button>
                            ) : (
                              <button
                                onClick={() => startEdit(index)}
                                className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md cursor-pointer hover:bg-blue-200"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              onClick={() => deleteGoal(index)}
                              className="bg-red-100 text-red-700 px-3 py-2 rounded-md cursor-pointer hover:bg-red-200"
                            >
                              🗑️
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
