import './Explore.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import FoodCard from '../../components/FoodCard/FoodCard'
import { BsArrowLeftSquareFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import CommentLike from '../../components/CommentLikeModal/CommentLike'


/**
 * Page allows user to get random recipe post from other users
 */
const Explore = () => {

  const [exploreRecipe, setExploreRecipe] = useState([])
  const [loggedUser, setLoggedUser] = useState()
  const [userEmail, setUserEmail] = useState()
  const [socket, setSocket] = useState()
  const [commentLikeModal, setCommentLikeModal] = useState(false)
  const [selectedFoodId, setSelectedFoodId] = useState()
  const nav = useNavigate()

  const closeOne = () => setCommentLikeModal(false)
  //const openOne = () => setCommentLikeModal(true)
  const PORT = process.env.PORT

// Creates a new socket.io connection 
  useEffect(() => {
    setSocket(io(PORT)) 
  }, [])

// Sends user emial to server, creating userEmail, socket id object
  useEffect(() => {  
    socket?.emit('newLogin', userEmail)
  }, [socket, userEmail])


  
// Api call to select random food recipe post 
  useEffect(() => {
    const exploreCard = async () => {
      try {
        const result = await axios.get('/explore-user-page')
        setExploreRecipe(result.data.value)
        setLoggedUser(result.data.userIntId)

        const profileResult = await axios.get('/profile-data')
        setUserEmail(profileResult.data.profile_email)

      } catch (error) {
        console.log(error)
      }
    }
    exploreCard();
  }, [])


// Returns user back to home profile
  const handleReturn = () =>{
    nav('/profile-home')
  }

// Allows user to view post comments
  const openComment = (data) =>{
    setCommentLikeModal(data)
  }

// Selects current food id
  const foodIdData = (data) => {
    setSelectedFoodId(data)
  }




  return (
    <div className='explore-wrapper'>
      <div className='explore-recipe-btn-back-container'>
        <BsArrowLeftSquareFill className='explore-recipe-back-btn' onClick={handleReturn}/>
      </div>

      {commentLikeModal && <CommentLike  handleClose={closeOne} selectedFoodId={selectedFoodId}/>}

      <div className='explore-recipe-container'>
        {exploreRecipe.length ? exploreRecipe.map((item, i) => <FoodCard item={item} key={i} loggedUser={loggedUser} socket={socket} foodIdData={foodIdData} openComment={openComment} />)
        : <p>No Recipes Found</p> }
      </div>
    </div>
  )
}

export default Explore