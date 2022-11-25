import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTodo } from '../../features/todoList/todoListSlice'
import { openPopup } from '../../features/todoList/todoListSlice'
import Task from '../task/Task'

const TodoList = () => {
  const todos = useSelector((state) => state.todoList.todos)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTodo())
  }, [])

  const openAddPopup = () => {
    dispatch(openPopup({ openAdd: true }))
  }

  return (
    <main className='todoList'>
      <h1 className='todoList__title'>Todo List Firebase</h1>
      <button onClick={openAddPopup} className='todoList__button-add'>
        Добавить
      </button>
      <ul className='todoList__container'>{todos ? todos.map((item) => <Task key={item.id} task={item} />) : ''}</ul>
    </main>
  )
}

export default TodoList
