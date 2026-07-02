import Goal from "../models/goal.js";

export const getGoals = async(req,res)=>{
    try {
        const goals = await Goal.find({user: req.user._id});
        return res.status(200).json(goals);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Server Error"});
    }
}

export const addGoal = async(req,res)=>{
    try{
        const {goal_name} = req.body;
        const newGoal = await Goal.create({
            user: req.user._id,
            goal_name
        });
        return res.status(201).json(newGoal);
    }catch(error){
        console.log(error);
        return res.status(500).json({msg:"Server Error"});
    }
}
export const updateGoal = async(req,res)=>{
    try {
        const {goal_name, completed} = req.body;
        const goal = await Goal.findOne({
            user:req.user.id,
            _id: req.params.id
        });
        if(!goal){
            return res.status(404).json({msg:"Goal not found"});
        }
        if(goal_name !== undefined)goal.goal_name = goal_name;
        if(completed !== undefined)goal.completed = completed;
        await goal.save();
        return res.status(200).json(goal);

    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"Server Error"});
    }
}

export const deleteGoal = async(req,res)=>{
    try{
        const goal = await Goal.findOneAndDelete({
            user:req.user.id,
            _id: req.params.id
            });
        if(!goal){
            return res.status(404).json({msg:"Goal not found"});
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({msg:"Server Error"});
    }
}