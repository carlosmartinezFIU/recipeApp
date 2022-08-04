import './CommentLike.css'
import { motion } from 'framer-motion/dist/framer-motion'
import { useEffect, useState } from 'react'
import BackDrop from '../BackDrop/BackDrop'
import axios from 'axios'


/**
 * Modal to show foodpost comments of certain post
 * @param {*} param0 
 * @returns 
 */
const CommentLike = ({handleClose, selectedFoodId}) => {
    const [comments, setComments] = useState([])

// Settings for animation drop on Modal
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

    const close = (e) =>{
        handleClose(false)
    }


    /**
     * Server call to get all comments to a certain post 
     */
    useEffect(() =>{
        const getAllComments = async() => {
            try {
                const result = await axios.get('/food-card-comments', {params: {foodId: selectedFoodId}})
                console.log(result.data)
                setComments(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        //
        getAllComments()
    }, [])


  return (
    <BackDrop onClick={handleClose}>
        <motion.div
        onClick={(e) => e.stopPropagation()}
        className='comment-modal'
        variants={dropIn}
        initial='hidden'
        animate='visible'
        exit='exit' 
        >
        <p className='comment-like-title'>Comments</p>
            {comments && comments.map((item, i) => {
                return(
                    <div key={i} className='comment-like-container'>
                        <p>{item.comment_body}</p>
                    </div>
                )
            })}
        </motion.div>
    </BackDrop>
  )
}

export default CommentLike