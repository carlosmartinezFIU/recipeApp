import './Home.css'
import axios from 'axios'
import FoodCard from '../../components/FoodCard/FoodCard'
import { MdAddCircle } from 'react-icons/md'
import { FaCompass } from 'react-icons/fa'
import { useState, useContext, useEffect } from 'react'
import tamales from '../../asset/tamales.jpeg'
import { CgProfile } from 'react-icons/cg'  
import { AiFillEdit } from 'react-icons/ai'

import { useNavigate } from 'react-router-dom'
import FoodModal from '../../components/FoodModal/FoodModal'
import {DataContext} from '../../DataContext'
import { io } from 'socket.io-client'
import CommentLike from '../../components/CommentLikeModal/CommentLike'




/**
 * Home profile contians user image and user food post's 
 * allows user to post new recipes
 * 
 */
const Home = () => {
  const { profileRecipe, setProfileRecipe } = useContext(DataContext)
  
  const nav = useNavigate()
  const [modalOpen, setModalClose] = useState(false)
  const [commentLikeModal, setCommentLikeModal] = useState(false)
  const [profileData, setProfileData] = useState([])
  const [noImage, setNoImage] = useState(false)
  const [editImage, setEditImage] = useState(false)
  const [file, setFile] = useState([])
  const [updatedImage, setUpdatedImage] = useState()
  const [showUpdateImage, setShowUpdatedImage] = useState(false)
  const [showFirstImage, setShowFirstImage] = useState(false)
  const [loggedUser, setLoggedUser] = useState()
  const [loggedSocket, setLoggedSocket] = useState();
  const [userEmail, setUserEmail] = useState()
  const [socket, setSocket] = useState()
  const [homeCard] = useState(true)
  const [selectedFoodId, setSelectedFoodId] = useState()
  
  axios.defaults.withCredentials = true
  const PORT = process.env.PORT

  
const closedWindow = async () => {
    const params = {
      message: "Window was closed"
    }
  try {
    await axios.post('/window-closed', params)
  } catch (error) {
    console.log(error)
  }
}



// creates a new socket connection with refresh
  useEffect(() => {
    setSocket(io(PORT)) 
  }, [])

// Sends the user email to server with new socket id
  useEffect(() => {  
    socket?.emit('newLogin', userEmail)
  }, [socket, userEmail])



  const stockRecipe ={
    food_img: tamales,
    food_name: "Tamales",
    food_hour: 1,
    food_minute: 30,
  }

// Sends user to explore page
  const handleExplore = () => {
    nav('/profile-explore')
  }

// Closes/Opens the Food modal to input recipes
  const close = () => setModalClose(false)
  const open = () => setModalClose(true)

// Closes/Opens the comments modal for each posts
  const closeOne = () => setCommentLikeModal(false)
  const openOne = () => setCommentLikeModal(true)


//Grabs all the users personal food recipes
  useEffect(() => {
    const getAllCards = async () => {
      try {
          const result = await axios.get('/get-all-foodcards')
          setLoggedUser(result.data.userIntId)
          setProfileRecipe(result.data.value)


          const profileResult = await axios.get('/profile-data')
          if(profileResult.data.profile_image === null || !profileResult.data.profile_image){
              setNoImage(true)
          }
          if(profileResult.data.profile_image){
            setNoImage(false)
            setShowFirstImage(true)
          }
          if(profileResult.data.profile_id){
            setLoggedSocket(profileResult.data.profile_id)
          }
          if(profileResult.data.profile_email){
            setUserEmail(profileResult.data.profile_email)
          }

          
          
          setProfileData(profileResult.data)
      } catch (error) {
        console.log(error)
      }
    }
    getAllCards()
    
  }, [])




// Allows the user to change the user profile image
  const updateImage = async() =>{
    setEditImage(false)
    const data = new FormData()
    data.append("image", file)
    
    try {
      const result = await axios.post('/profile-image-update', data)
      setEditImage(false)
      setShowFirstImage(false)
      setShowUpdatedImage(true)
      setUpdatedImage(result.data)
    } catch (error) {
      console.log(error)
    }
      console.log(editImage)
  }

// Opens the modal to edit image
  const handleImageUpdate = () =>{
    setEditImage(true)
  }
// Close modal to edit image
  const handleCloseButton = () => {
    setEditImage(false)
  }

// Grabs the user image
  const handleFile = e =>{
    setFile(e.target.files[0])
  }

// Logs out the user, sends user to sign/log in page
// deletes the session id broswer cookie
  const handleLogout = () =>{
    socket.emit('disconnectUser', userEmail)
    try {
      axios.post('/logout')
      console.log("In the logout")
      nav('/')
    } catch (error) {
      console.log(error)
    }

  }

  const openComment = (data) =>{
    setCommentLikeModal(data)
  }

  const foodIdData = (data) => {
    setSelectedFoodId(data)
  }


  return (
    <div className='home-wrapper'>
        <div className='home-left-image-container'>
          <div className='home-left-image-container-top'>

              <div className='profile-img-container'>
                  {showFirstImage && <img src={profileData.profile_image} alt='profile'/> }
                  {noImage && <CgProfile className='no-profile-image'/>}
                  {showUpdateImage && <img src={updatedImage} alt='profile'/>}
                  <div className='edit-image-container-wrapper'>
                    <div className='edit-image-container' onClick={handleImageUpdate}>
                      <AiFillEdit className='edit-logo' onClick={handleImageUpdate}/>
                    </div>
                  </div>
              </div>

              <div className='home-description-container'>
              {editImage && 
              <div className='label-input-home-container'>
                <label className='upload-label-home'>
                  <input type='file' accept='image/*' filename={file} onChange={handleFile} className='input-file-home'/>
                  Upload
                </label>
                <button className='submit-home-update-image-btn' onClick={updateImage}>Submit</button>
                <button className='close-update-image-btn' onClick={handleCloseButton}>X</button>
              </div>}
                  <p className='home-user-name'>{profileData.profile_first_name} {profileData.profile_last_name}</p>
                  <p>{profileData.profile_location}</p>
                  <p>{profileData.profile_zipcode}</p>
                  <button className='home-profile-logout-btn' onClick={handleLogout}>Logout</button>
              </div>

          </div>

          <div className='home-left-image-container-bottom'>
              <div className='navigation-profile-btn-contianer'>
                <div className='home-add-btn-container'>
                  <MdAddCircle className='home-logo-add-svg'/>
                  <button className='home-add-btn' onClick={() => (modalOpen ? close() : open())}>Add</button>
                </div>
                
                <div className='home-explore-btn-container'>
                  <FaCompass className='home-logo-explore-svg'/>
                  <button className='home-explore-btn' onClick={handleExplore}>Explore</button>
                </div>
              </div>
          </div>
        </div>

        {modalOpen && <FoodModal handleClose={close}/>}
        {commentLikeModal && <CommentLike  handleClose={closeOne} selectedFoodId={selectedFoodId}/>}

        <div className='home-right-container'>
          {profileRecipe.length ? profileRecipe.map((item, i) => 
          <FoodCard item={item} key={i} loggedUser={loggedUser} socket={socket}  homeCard={homeCard} openComment={openComment} foodIdData={foodIdData}/>) 
          : <FoodCard item={stockRecipe} />}
          
        </div>
    </div>
  )
}

export default Home