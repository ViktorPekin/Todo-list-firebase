import TodoList from '../todo-list/TodoList'
import PopupAddTask from '../popup-add-task/PopupAddTask'
import PopupEditTask from '../poput-edit-task/PopupEditTask'

function App() {
  return (
    <div className='app'>
      <TodoList />
      <PopupAddTask />
      <PopupEditTask />
    </div>
  )
}

export default App
