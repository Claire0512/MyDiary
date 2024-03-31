import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  tag: String,
  mood: String,
  file: String,
});

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
