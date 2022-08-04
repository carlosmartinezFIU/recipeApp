import './CommentModal.css'
import axios from 'axios'
import { useState } from 'react'


/**
 * Modal to hold food post card comments
 */
const CommentModal = ({ commentShow, closeModal, commentFoodId, commentCount, socket }) => {
  const [userComment, setUserComment] = useState('')

    const handleClose = () => {
        closeModal(false)
    }

    const handlePost = async() => {
      // Socket call to server, sends when user comments on a post
        socket?.emit('newComment', {
          currentCount: commentCount,
          commentFoodId
        })

        //Object holding user comment and food id
        const params = {
          userComment,
          commentFoodId
        }
        try {
          await axios.post('/post-comment', params)
        } catch (error) {
          console.log(error)
        }
    }


  return (
    
    <div className={`comment-modal-wrapper ${commentShow ? 'active' : ''}`}>
        <h2>Comment</h2>
        <button className='close-comment-card-modal' onClick={handleClose}>X</button>
        <div>
            <textarea className='text-area-food-card' maxLength='300' value={userComment} onChange={(e) => setUserComment(e.target.value)}></textarea>
        </div>

        <button className='post-food-card-btn' onClick={() => {handlePost(); handleClose()}}>Post</button>
    </div>
  )
}

export default CommentModal