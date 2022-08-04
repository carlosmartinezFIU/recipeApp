import './FoodModal.css'
import axios from 'axios'
import { motion } from 'framer-motion/dist/framer-motion'
import BackDrop from '../BackDrop/BackDrop'
import { BsImage } from 'react-icons/bs'
import { useState, useContext } from 'react'
import { DataContext } from '../../DataContext'

/**
 * 
 * @param {
 * handleClose: Allows the Modal to be passed boolean type
 * } 
 * @returns 
 */
const FoodModal = ({handleClose}) => {
    const [foodName, setFoodName] = useState('');
    const [foodHour, setFoodHour] = useState('');
    const [foodMinute, setFoodMinute] = useState('')
    const [foodDescription, setFoodDescription] = useState('');
    const [foodIngredients, setFoodIngredients] = useState('');
    const [file, setFile] = useState()
    const {profileRecipe, setProfileRecipe} = useContext(DataContext)

// Settings for transformation 
    const dropIn = {
        hidden: {
            y: '-100vh',
            opacity: 0,
        },
        visible: {
            y: '0',
            opacity: '1',
            transition: {
                duration: '0.1',
                type: 'spring',
                damping: 25,
                siffness: 500,
            },
        },
        exit: {
            y: '100vh',
            opacity: '0',
        },
    }

/**
 * Post function includes: Food Image, name, 
 * time, description and ingredients
 * 
 */
    const handleFoodDescription = async (e) => {
        e.preventDefault();

        const data = new FormData()
        data.append('image', file)
        data.append('foodName', foodName)
        data.append('foodHour', foodHour)
        data.append('foodMinute', foodMinute)
        data.append('foodDescription', foodDescription)
        data.append('foodIngredients', foodIngredients)


        try {
            const submissionResult = await axios.post('/recipe-submission', data)
            setProfileRecipe([submissionResult.data, ...profileRecipe])
        } catch (error) {
            console.log(error)
        }
    }

    const handleFile = e => {
        setFile(e.target.files[0])
    }

    const close = (e) =>{
        handleClose(false)
    }

// Validating the user can only input numbers for hour input
    const handleHourInput = (e) => {
        const validation = /^[0-9\b]+$/

        if(e.target.value === '' || validation.test(e.target.value)){
            if(e.target.value < 0 || e.target.value > 10){
                return
            }
            else
                setFoodHour(e.target.value)
        } 
        else 
            return
    }


// Validating the user can only input numbers for minute input
    const handleMinuteInput = (e) => {
        const validation = /^[0-9\b]+$/

        if(e.target.value === '' || validation.test(e.target.value)){
            if(e.target.value < 0 || e.target.value > 59){
                return
            }
            else
                setFoodMinute(e.target.value)
        } 
        else 
            return
    }



  return (
    <BackDrop onClick={handleClose}>
       <motion.div
       onClick={(e) => e.stopPropagation()}
       className='food-modal'
       variants={dropIn}
       initial='hidden'
       animate='visible'
       exit='exit'
       >
        <form className='food-modal-form-container'>
            <div className='form-left-container'>
                <div className='form-top-description-container'>

                    <div>
                        <label className='food-modal-image-label'>Image
                        <BsImage className='image-logo' />
                        <input type='file' style={{display: 'none'}} accept='image/*' 
                        filename={file} onChange={handleFile}/>
                        </label>   
                    </div>

                    <label className='food-modal-name-label'>Name
                        <input className='food-modal-input' value={foodName} onChange={(e) => setFoodName(e.target.value)}/>
                    </label>
                </div>


                <div className='modal-time-logo-input-container'>

                    <label className='food-modal-time-label'>Time
                        <input className='food-modal-input-hour' value={foodHour} onChange={handleHourInput} placeholder='1hr' maxLength={2}/> :
                        <input className='food-modal-input-minute' value={foodMinute} onChange={handleMinuteInput} placeholder='30 min' maxLength={2} type='text'/>
                    </label>
                </div>

                <label className='modal-description-label'>Description
                        <textarea className='description-textarea' value={foodDescription} onChange={(e) => setFoodDescription(e.target.value)}/>
                </label>

                <button className='food-modal-save-button' onClick={(e) => {handleFoodDescription(e); close()}}>Save Changes</button>
            </div>

            <div className='form-right-container'>
                <label className='modal-ingredients-label'>Ingredients
                    <textarea className='ingredients-textarea'  value={foodIngredients} onChange={(e) => setFoodIngredients(e.target.value)}/>
                </label>
            </div>
        </form>

       </motion.div>
    

    </BackDrop>
  )
}

export default FoodModal