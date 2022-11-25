import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getDatabase, ref, get, child } from 'firebase/database'

const initialState = {
  todos: [],
  selectedTodo: [],
  popup: [],
}

export const getTodo = createAsyncThunk('todoList/getTodo', async (_, { rejectWithValue, dispatch }) => {
  get(child(ref(getDatabase()), `task/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let result = Object.values(snapshot.val()).map((item) => {
          let id = item.id
          let name = item.name
          let task = item.task
          let time = item.time
          let progress = item.progress
          let fileName = item.fileName
          let fileUrl = item.fileUrl
          return { id, name, task, time, progress, fileName, fileUrl }
        })
        dispatch(setTodoList(result))
      }
    })
    .catch((error) => {
      console.error(error)
    })
})

export const todoListSlice = createSlice({
  name: 'todoList',
  initialState,
  reducers: {
    openPopup: (state, action) => {
      state.popup = action.payload
    },
    setTodoList: (state, action) => {
      state.todos = action.payload
    },
    addTodo: (state, action) => {
      state.todos.push(action.payload)
    },
    addChangeTodo: (state, action) => {
      state.selectedTodo = action.payload
    },
    editProgress: (state, action) => {
      const toggleTodo = state.todos.find((todo) => todo.id === action.payload.id)
      toggleTodo.progress = true
    },
    changeTodo: (state, action) => {
      const toggleTodo = state.todos.find((todo) => todo.id === action.payload.id)
      toggleTodo.name = action.payload.name
      toggleTodo.task = action.payload.task
      toggleTodo.time = action.payload.time
      toggleTodo.fileName = action.payload.fileName
      toggleTodo.fileUrl = action.payload.fileUrl
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload)
    },
  },
})

export const { setTodoList } = todoListSlice.actions
export const { removeTodo } = todoListSlice.actions
export const { addChangeTodo } = todoListSlice.actions
export const { changeTodo } = todoListSlice.actions
export const { addTodo } = todoListSlice.actions
export const { openPopup } = todoListSlice.actions
export const { editProgress } = todoListSlice.actions
export default todoListSlice.reducer
