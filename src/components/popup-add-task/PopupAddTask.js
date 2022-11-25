import { getDatabase, ref, set, child, push } from 'firebase/database'
import { getStorage, ref as refStorage, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTodo } from '../../features/todoList/todoListSlice'
import { openPopup } from '../../features/todoList/todoListSlice'
import * as dayjs from 'dayjs'

const PopupAddTask = () => {
  const popup = useSelector((state) => state.todoList.popup)
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [task, setTask] = useState('')
  const [time, setTime] = useState('')
  const [fileLoading, setFileLoading] = useState('')
  const [validDate, setValidDate] = useState(true)
  const storage = getStorage()
  const db = getDatabase()
  const newPostKey = push(child(ref(db), 'task')).key

  const handleName = (e) => {
    setName(e.target.value)
  }

  const handleTask = (e) => {
    setTask(e.target.value)
  }

  const handleTime = (e) => {
    const date = dayjs(e.target.value)
    const dateNow = dayjs()
    if (date.diff(dateNow) < 0) {
      setValidDate(false)
    } else {
      setValidDate(true)
    }
    setTime(e.target.value)
  }

  const handleFile = (e) => {
    setFileLoading(e.target.files[0])
  }

  const addNewTask = (listTask) => {
    set(ref(db, 'task/' + newPostKey), listTask)
    dispatch(addTodo(listTask))
  }

  const closePopup = () => {
    dispatch(openPopup({ open: false }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const storageRef = refStorage(storage, `file/${newPostKey + fileLoading.name}`)

    if (fileLoading) {
      uploadBytes(storageRef, fileLoading)
        .then((snapshot) => {
          return snapshot.metadata.name
        })
        .then((res) => {
          return getDownloadURL(refStorage(storage, `file/${res}`))
        })
        .then((res) => {
          const newTask = {
            id: newPostKey,
            name,
            task,
            time,
            progress: false,
            fileName: newPostKey + fileLoading.name,
            fileUrl: res,
          }
          addNewTask(newTask)
        })
    } else {
      const newTask = {
        id: newPostKey,
        name,
        task,
        time,
        progress: false,
        fileName: '',
        fileUrl: '',
      }
      addNewTask(newTask)
    }
    e.target.reset()
    setName('')
    setTask('')
    setFileLoading('')
    dispatch(openPopup({ openAdd: false }))
  }

  return (
    <section className={popup.openAdd ? 'popup popup_opened' : 'popup'}>
      <div className='popup__container'>
        <button onClick={closePopup} className='popup__close' type='button'></button>
        <form className='popup__form' onSubmit={handleSubmit}>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Название</p>
            <input className='popup__input' value={name} onChange={handleName} type='text' required></input>
          </label>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Задача</p>
            <textarea className='popup__input popup__input_task' value={task} onChange={handleTask} required></textarea>
          </label>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Дата окончания</p>
            <input className='popup__input' onChange={handleTime} type='datetime-local' required></input>
            {validDate ? '' : <p className='popup__error'>Нельзя добавить задачу задним числом</p>}
          </label>
          <label className='popup__form-field'>
            <input className='popup__input' onChange={handleFile} type='file'></input>
          </label>
          {validDate ? (
            <button className='popup__form-button'>Добавить</button>
          ) : (
            <button className='popup__form-button popup__form-button_disabled' disabled>
              Добавить
            </button>
          )}
        </form>
      </div>
    </section>
  )
}

export default PopupAddTask
