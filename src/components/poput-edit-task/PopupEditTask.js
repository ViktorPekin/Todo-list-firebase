import { getDatabase, ref, update, child, push } from 'firebase/database'
import { getStorage, ref as refStorage, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeTodo } from '../../features/todoList/todoListSlice'
import { openPopup } from '../../features/todoList/todoListSlice'
import * as dayjs from 'dayjs'

const PopupEditTask = () => {
  const dispatch = useDispatch()
  const popup = useSelector((state) => state.todoList.popup)
  const selectedTodo = useSelector((state) => state.todoList.selectedTodo)
  const [name, setName] = useState('')
  const [task, setTask] = useState('')
  const [time, setTime] = useState('')
  const [validDate, setValidDate] = useState(true)
  const [fileName, setFileName] = useState('')
  const [savedFileName, setSavedFileName] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileLoading, setFileLoading] = useState('')
  const [displayDeleteButton, setDisplayDeleteButton] = useState(true)
  const storage = getStorage()
  const db = getDatabase()
  const newPostKey = push(child(ref(db), 'task')).key

  useEffect(() => {
    setName(selectedTodo.name)
    setTask(selectedTodo.task)
    setTime(selectedTodo.time)
    setFileName(selectedTodo.fileName)
    setFileUrl(selectedTodo.fileUrl)
    setDisplayDeleteButton(true)
  }, [selectedTodo])

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

  const closePopup = () => {
    dispatch(openPopup({ open: false }))
  }

  const removeFile = () => {
    setDisplayDeleteButton(false)
    setSavedFileName(fileName)
    setFileName('')
  }

  const removeFileOnServer = () => {
    const storage = getStorage()
    const storageFile = refStorage(storage, `file/${savedFileName}`)
    deleteObject(storageFile)
      .then(() => {})
      .catch((error) => {
        console.log(error)
      })
  }

  const updateTask = (listTask) => {
    update(ref(db, 'task/' + selectedTodo.id), listTask)
    dispatch(changeTodo(listTask))
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
            id: selectedTodo.id,
            name,
            task,
            time,
            progress: false,
            fileName: newPostKey + fileLoading.name,
            fileUrl: res,
          }
          updateTask(newTask)
        })
    } else {
      const newTask = {
        id: selectedTodo.id,
        name,
        task,
        time,
        progress: false,
        fileName: fileName,
        fileUrl: fileUrl,
      }
      if (!displayDeleteButton) {
        removeFileOnServer()
      }
      updateTask(newTask)
    }

    e.target.reset()
    setName('')
    setTask('')
    setFileLoading('')
    dispatch(openPopup({ openEdit: false }))
  }

  return (
    <section className={popup.openEdit ? 'popup popup_opened' : 'popup'}>
      <div className='popup__container'>
        <button onClick={closePopup} className='popup__close' type='button'></button>
        <form className='popup__form' onSubmit={handleSubmit}>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Название</p>
            <input className='popup__input' value={name || ''} onChange={handleName} type='text'></input>
          </label>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Задача</p>
            <textarea className='popup__input popup__input_task' value={task || ''} onChange={handleTask}></textarea>
          </label>
          <label className='popup__form-field'>
            <p className='popup__title-input'>Дата окончания</p>
            <input
              className='popup__input'
              value={time || ''}
              onChange={handleTime}
              type='datetime-local'
              required
            ></input>
            {validDate ? '' : <p className='popup__error'>Нельзя добавить задачу задним числом</p>}
          </label>
          <div className='popup__file-container'>
            <a className='popup__link' href={fileUrl} target='_blunk' download>
              {fileName ? fileName.substr(20) : ''}
            </a>
            {fileName ? (
              displayDeleteButton ? (
                <button className='popup__file-delete' onClick={removeFile} href='#' type='button'>
                  Удалить
                </button>
              ) : (
                ''
              )
            ) : (
              <label className='popup__form-field'>
                <input className='popup__input' onChange={handleFile} type='file'></input>
              </label>
            )}
          </div>
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

export default PopupEditTask
