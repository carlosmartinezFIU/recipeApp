import './ProfileSetUp.css'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


/**
 * Page allows for user to input first, last name 
 * zipcode and location
 * 
 * Will use in explore paage to filter throught city
 * 
 */
const ProfileSetUp = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [zipcode, setZipcode] = useState('')
    const [location, setLocation] = useState('')
    const nav = useNavigate()
    axios.defaults.withCredentials = true


// Saves the users first, last zipcode and location to the database
    const updateProfile = async e => {
        e.preventDefault()

        const params = {
            firstName,
            lastName,
            zipcode,
            location
        }

        try {
            const setUpProfile = await axios.post('/profile-setup', {params})
            console.log(setUpProfile.data)
            if(setUpProfile.data === true){
                nav('/profile-home')
            }
        } catch (error){
            
        }
    }



  return (
    <div className='profile-setup-wrapper'>
        <div className='profile-setup-form-container'>
            <form className='form-profile-setup'>
                <div className='left-profile-container'>
                    <label className='profile-setup-label'>First Name
                        <input className='input-profile-setup'
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                    </label>

                    <label className='profile-setup-label'>Last Name
                        <input className='input-profile-setup'
                        value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                    </label>
                </div>
                
                <div className='right-profile-container'>
                    <label className='profile-setup-label'>Location
                        <input className='input-profile-setup'
                        value={zipcode} onChange={(e) => setZipcode(e.target.value)}/>
                    </label>

                    <label className='profile-setup-label'>Zipcode
                        <input className='input-profile-setup'
                        value={location} onChange={(e) => setLocation(e.target.value)}/>
                    </label>
                </div>
            </form>


            <button className='profile-setup-save-btn' onClick={updateProfile}>Save Changes</button>
        </div>
    </div>
  )
}

export default ProfileSetUp