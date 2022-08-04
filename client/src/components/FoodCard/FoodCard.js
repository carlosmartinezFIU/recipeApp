import './FoodCard.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AiOutlineComment, AiFillHeart, AiOutlineHeart } from 'react-icons/ai'


import { useEffect, useContext, useState } from 'react'
import { DataContext } from '../../DataContext'


import  CommentModal  from '../../components/CommentModal/CommentModal'

/**
 * 
 * @param {
 * item        : Item in array
 * loggedUser  : User Id
 * socket      : Passes Socket id
 * homeCard    : Allows display of the delete button for user's post
 * openComment : Displays comment modal
 * foodIdData  : Passes the Food Id from selected post
 * }
 * @returns 
 */
const FoodCard = ({item, loggedUser, socket, homeCard, openComment, foodIdData}) => {
  const nav = useNavigate()
  const [liked, setLiked] =useState(false) 
  const [commentShow, setCommentShow] = useState(false)
  const {setRecipeInfo, setProfileRecipe, profileRecipe} = useContext(DataContext)
  const [updateLikes, setUpdateLikes] = useState('')
  const [IOLikes, setIOLikes] = useState()
  const [showIO, setShowIO] = useState(false)
  const [commentFoodId, setCommentFoodId] = useState()
  const [commentCount, setCommentCount] = useState()
  const [IOComment, setIOComment] = useState()
  const [showIOComment, setShowIOComment] = useState(false)
  
// Function to send user to recipe's information page
  const handleRecipe = (recipeItem) => {
    setRecipeInfo(recipeItem)
    nav('/food-recipe')
  }

// Function to change state of user who liked a post
// heart is red when user liked post 
  const handleLike = () => {
    setLiked(!liked)
  }

// State changes class name in Comment Modal allowing transition to occur for a user to post
  const handleComment = () => {
    setCommentShow(!commentShow)
  }

  const closeModal = (data) =>{
    setCommentShow(data)
  }

// Sends updated like to database
  const addLike = async (foodId, profileId) =>{
// Socket call to update like number in foodpost 
    socket?.emit('newLike', {
      currentLike: updateLikes,
      foodId
    })
  
// Payload to server sneds the Food id and profile id to server
    const params = {
      foodId,
      profileId
    }
    try {
      const result = await axios.post('/add-to-like', params)
      if(result.data === true){
        getLikes()
      }

    } catch (error) {
      console.log(error)
    } 

  }

// Sends update to server updates like count 
  const deleteLike = async (foodId) =>{
// Socket call updates foodpost like counter 
    socket?.emit('deleteLike', {
      currentLike: updateLikes,
      foodId
    })

    const params = {
      foodId
    }
    try {
      await axios.post('/delete-like', params)
    } catch (error) {
      console.log(error)
    }
  }
  

// Grabs the current count of food post likes 
  const getLikes = async () => {
    const param ={
      foodId: item.food_id
    }

    try {
      const likesCount = await axios.post('/get-post-likes-count', param)
      setLiked(likesCount.data.booleanLike)
      setUpdateLikes(likesCount.data.countValue)
      setShowIO(false)
    } catch (error) {
      console.log(error)
    }

  }

// Grabs the comment count on the food post 
  const getCommentCount = async () => {
    const param ={
      foodId: item.food_id
    }

    try {
      const commentCount = await axios.post('/get-post-comment-count', param)
      setCommentCount(commentCount.data)
      setShowIOComment(false)
    } catch (error) {
      console.log(error)
    }

  }

// Calls functions to get the current like and comment count for each food post
  useEffect(() => {
    getCommentCount()
    getLikes()
  }, [])


/**
 * getNotifications grabs the updated count of the current liked post
 * 
 * getNotificationComment grabs the updated comment count on the current post
 * 
 * getCurrentLike grabs count of liked post when user unlikes
 * 
 */
  useEffect(()=>{
    socket?.on('getNotification', (data) => {
      setIOLikes(data.updatedLike)
      if(data.foodId === item.food_id){
        setShowIO(true)
      }
    })

    socket?.on('getNotificationComment', (data) => {
      setIOComment(data.updatedCount)

      if(data.foodId === item.food_id){
        setShowIOComment(true)
      }  
    })

    socket?.on('getCurrentLike', (data) => {
      setIOLikes(data.updatedLike)
      if(data.foodId === item.food_id){
        setShowIO(true)
      }
    })


  }, [socket])


// Deletes food post of current user as well as likes and comment pertaining 
// to the food post
  const handleDeleteCard = async (foodId) =>{
    console.log("Card was delete")

    const params = {
      foodId
    }


    try {
      const result = await axios.post('/delete-card', params)
      console.log("In the delete", result.data)
      setProfileRecipe(profileRecipe.filter(item => item.food_id !== foodId))
 
    } catch (error) {
      console.log(error)
    }
  }

// Sends food recipe card id to Comment Modal
  const handleFoodId = (foodData) =>{
    setCommentFoodId(foodData)
  }

  const showModal = (data) =>{
    foodIdData(data)
    openComment(true)
  }

// In Mobile use takes user to the top of screen when viewing comments
  const scrollToTop = () => {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
  }



  return (
    <div className='foodcard-wrapper'>
      {homeCard && <button className='food-card-delete-btn' onClick={() => handleDeleteCard(item.food_id)}>X</button>}
        <div className='foodcard-container'>
            <div className='food-img-container'>
                <img className='food-card-image-pointer' src={item.food_img} alt='food' onClick={() => handleRecipe(item)}/>
            </div>

            <div className='description-container'>
              <div className='description-container-one'>
                <div className='top-one'>
                    <p>{item.food_name}</p>
                </div>

                <div className='food-card-minutes-container'>
                    <p>{item.food_hour}</p>
                    <p>hour(s)</p>

                    <p>{item.food_minute}</p>
                    <p>minutes</p>
                </div>
              </div>
            </div>
            <p className='view-comment-title'  onClick={() => {showModal(item.food_id); scrollToTop()}}>View Comments</p>

            <div className='likes-comment-food-card-container'>
              <div className='comment-container'> 
              <AiOutlineComment className='comment' onClick={() => {handleComment(); handleFoodId(item.food_id)}}/> 
                {showIOComment ? <p>{IOComment}</p>  :<p>{commentCount}</p> }
              </div>

              <div className='likes-container'>
                {liked ? 
                  <AiFillHeart className='heart-food-card-logo heart' onClick={() => {handleLike(); deleteLike(item.food_id)}}/> 
                  : <AiOutlineHeart className='heart ' onClick={() => {handleLike(); addLike(item.food_id, loggedUser)} } />
                }
                {showIO ? <p>{IOLikes}</p> : <p>{updateLikes}</p>}
               
              </div>
              
            </div>
        </div>

        <CommentModal commentShow={commentShow}  closeModal={closeModal} commentFoodId={commentFoodId} commentCount={commentCount} socket={socket}/>
    </div>
  )
}

export default FoodCard