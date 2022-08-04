import './BackDrop.css'
import { motion } from 'framer-motion'



/**
 * Back drop placed for Modals through application 
 * @param {*} param0 
 * @returns 
 */
const BackDrop = ({ children, onClick}) => {
  return (
    <motion.div className='backdrop' 
    onClick={onClick} 
    initial={{opacity: 0}} 
    animate={{opacity:1}} 
    exit={{opacity:0}}>

        {children}
        
    </motion.div>
  )
}

export default BackDrop