import { getDatabase, ref, remove, update } from 'firebase/database'
import { getStorage, ref as refStorage, deleteObject } from 'firebase/storage'
import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { removeTodo, addChangeTodo } from '../../features/todoList/todoListSlice'
import { openPopup } from '../../features/todoList/todoListSlice'
import { editProgress } from '../../features/todoList/todoListSlice'
import * as dayjs from 'dayjs'

const Task = (props) => {
  const [dedline, setDedline] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    const date = dayjs(props.task.time)
    const dateNow = dayjs()
    if (date.diff(dateNow) <= 0) {
      setDedline(false)
    }
    const timer = setInterval(() => {
      const dateNow = dayjs()
      if (date.diff(dateNow) <= 0) {
        setDedline(false)
        clearInterval(timer)
      }
    }, 1000)
  }, [])

  const removeTask = () => {
    const storage = getStorage()
    const storageFile = refStorage(storage, `file/${props.task.fileName}`)
    if (props.task.fileUrl) {
      deleteObject(storageFile)
        .then(() => {})
        .catch((error) => {
          console.log(error)
        })
    }
    const db = getDatabase()
    remove(ref(db, 'task/' + props.task.id))
    dispatch(removeTodo(props.task.id))
  }

  const changeTask = () => {
    dispatch(addChangeTodo(props.task))
    dispatch(openPopup({ openEdit: true }))
    console.log(props.task)
  }

  const togleProgress = () => {
    const db = getDatabase()
    update(ref(db, 'task/' + props.task.id), { progress: true })
    dispatch(editProgress(props.task))
  }

  return (
    <li className='task'>
      <div className='task__container'>
        <h2 className='task__title'>{props.task.name}</h2>
        <p className='task__task'>{props.task.task}</p>
        <p className='task__end-time'>Дата окончания: {dayjs(props.task.time).format('DD.MM.YYYY HH.mm')}</p>
        <a className='task__file' href={props.task.fileUrl} target='_blunk' download>
          {props.task.fileName ? `Скачать файл: ${props.task.fileName.substr(20)}` : ''}
        </a>
      </div>
      <div className='task__buttons'>
        {dedline ? (
          props.task.progress ? (
            <p className='task__title task__title_task-completed'>Задача выполнена</p>
          ) : (
            <>
              <button onClick={changeTask} className='task__button task__button_change'>
                Изменить
              </button>
              <button onClick={togleProgress} className='task__button'>
                Выполнено
              </button>
            </>
          )
        ) : (
          <p className='task__title task__title_end-time'>Время вышло</p>
        )}
        <button onClick={removeTask} className='task__button task__button_delete'>
          Удалить
        </button>
      </div>
    </li>
  )
}

export default Task
