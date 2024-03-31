import Todo from "../models/Todo.js";

// 获取所有todos
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 创建一个新的todo
export const createTodo = async (req, res) => {
  const { title, description, tag, mood, file } = req.body;

  try {
    const todo = new Todo({
      title,
      description,
      tag,
      mood,
      file,
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: "Bad Request" });
  }
};

// 更新一个todo
export const updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, description, tag, mood, file } = req.body;

  try {
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found!" });
    }

    if (title) todo.title = title;
    if (description) todo.description = description;
    if (tag) todo.tag = tag;
    if (mood) todo.mood = mood;
    if (file) todo.file = file;

    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(400).json({ message: "Bad Request" });
  }
};

// 删除一个todo
export const deleteTodo = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findByIdAndRemove(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found!" });
    }

    res.status(200).json({ message: "Todo deleted!", deletedTodo });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
