import { useState } from 'react'
import './SignUp.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import ReactPlayer from 'react-player'
import pizzaVideo from '../../asset/pizzaVid.mp4'


/**
 * Sign in/Log in page checks if user has an email and comapres password from the server
 * uses bcrypt to hash the user password
 */
const SignUp = () => {
    const [userEmail, setEmail] = useState('')
    const [userPassword, setPassword] = useState('')
    const [incorrectSign, setIncorrectSign] = useState(false)
    const [disableBtn, setDisableBtn] = useState(false)
    const [emailExist, setEmailExist] = useState(false)
    const nav = useNavigate()
    axios.defaults.withCredentials = true

    window.addEventListener('beforeunload', event =>{
        event.preventDefault()
    })



// Sends email and password to be stored in the database
    const handleSignIn = async e =>{
        e.preventDefault();

        if(!userEmail){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }
        else if(!emailVarification()){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }

        if(!userPassword){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }
        

        const params = {
            Email: userEmail,
            Password: userPassword
        }

        try {
            const result = await axios.post('/sign-up', {params})
            const request = result.data.Message
            if(request === true){
                nav('/profile-setup')
            }
            if(request === false){
                setEmailExist(true)
                setTimeout(() => {
                    setDisableBtn(false)
                    setEmailExist(false)
                }, 3000)

                setTimeout(() => {
                    setEmailExist(false)
                }, 5000)
            }
        } catch (error) {
            console.log(error)
        }

        
    }

// Logs the user in, if email and password match 
    const handleLogIn = async e =>{
        e.preventDefault();

        if(!userEmail){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }
        else if(!emailVarification()){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }

        if(!userPassword){
            setIncorrectSign(true)
            setTimeout(() => {
                setIncorrectSign(false)
            }, 5000)
            return
        }
        const params = {
            userEmail,
            userPassword
        }

        try {
            const result = await axios.post('/login', params)
            console.log(result.data)

            if(result.data === true){
                nav('/profile-home')
            }
        } catch (error) {
            console.log(error)
        }
    }

        // Varification of email structure
        const emailVarification = () => {
            const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    
            if(regex.test(userEmail) === false){
                return false;
            }
            else
                return true
        }


  return (
    <div className='sign-up-wrapper'>
        <div className='sign-up-left-container'>
            <ReactPlayer className='react-player' width='100%' height='100%' 
            playing url={pizzaVideo} />
        </div>
        <div className='sign-up-right-container'>

            <div className='sign-up-form-container'>
                <h1 className='sign-up-welcome-title'>Welcome</h1>
                <form>
                    <label className='email-label'>Email
                        <input value={userEmail} onChange={(e) => {setEmail(e.target.value)}}/>
                    </label>
                    
                    <label className='password-label'>Password
                        <input value={userPassword} onChange={(e) => {setPassword(e.target.value)}}/>
                    </label>
                </form>

                <div className='sign-up-btns-container'>
                    <button disabled={disableBtn} onClick={(e) => {handleSignIn(e); setDisableBtn(true)}}>Sign Up</button>
                    <button onClick={(e) => {handleLogIn(e)}}>Log In</button>
                </div>

                {incorrectSign && <p className='incorrect-sign-title'>Incorrect Email/Password</p>}
                {emailExist && <p className='incorrect-sign-title'>Email exist</p>}
            </div>

        </div>
        
        
    </div>
  )
}

export default SignUp