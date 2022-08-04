import { useState } from 'react'
import './SignUp.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


/**
 * Sign in/Log in page checks if user has an email and comapres password from the server
 * uses bcrypt to hash the user password
 */
const SignUp = () => {
    const [userEmail, setEmail] = useState('')
    const [userPassword, setPassword] = useState('')
    const nav = useNavigate()
    axios.defaults.withCredentials = true




// Sends email and password to be stored in the database
    const handleSignIn = async e =>{
        e.preventDefault();

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
            console.log(result.data.Message)
        } catch (error) {
            console.log(error)
        }
    }

// Logs the user in, if email and password match 
    const handleLogIn = async e =>{
        e.preventDefault();

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




  return (
    <div className='sign-up-wrapper'>
        <div className='sign-up-left-container'>
            <h1>Upload your recipes</h1>
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
                    <button onClick={(e) => {handleSignIn(e)}}>Sign Up</button>
                    <button onClick={(e) => {handleLogIn(e)}}>Log In</button>
                </div>
            </div>

        </div>
        
        
    </div>
  )
}

export default SignUp