import axios from "axios"
import { useEffect, useState } from "react"

const Login = () => {
    const [email, setEmail] = useState(null)
    const [pass, setPass] = useState(null)
    const [error, setError] = useState(false)
    useEffect(() => {
        if (!email || !pass){
        setError("Заполните все поля !")
        }
        // } else {
        //     setError(false)
        // }
    })
    

    const postUser = () => {
        axios.post('http://localhost:3000/guser', {email: email, password: pass}).then((response) => {
            localStorage.setItem('userId', response.data.id)
            localStorage.setItem('userQuizzes', response.data.quizzes)
        }).catch((error) => {setError(error.response.data.msg)})
    }
  return (
    <>
    <h2>Выполните вход в ваш профиль</h2>
    {email + '\n' + pass}
        <form className='form'>
            <label>Введите e-mail: </label>
            <input name="email"  onChange={(e) => setEmail(e.target.value)}/>
            <label>Введите пароль: </label>
            <input name="password" type="password"  onChange={(e) => setPass(e.target.value)}/>
            {error ? <div className="errortext">{error}</div> : ''}
            <button type="button"
            onClick={() => postUser()}
            >Вход</button>
        </form>
        <a href="/register">Регистрация нового аккаунта</a>
    </>
  )
}

export default Login