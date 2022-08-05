const express = require('express')
const cors = require('cors')
require('dotenv').config();
const pool = require('./database')
const bcrypt = require('bcrypt')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const multer = require('multer')
const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const unlinkFile = util.promisify(fs.unlink)

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json())

const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer(app)

// Creates new Server
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.PORT,'https://food-recipe-card-app.herokuapp.com']
    }
})


// Array to hold user email with socket id's
let activeUsers = []

// Adds the user with the current broswer socket id to activeUsers array
const addUser = (userName, socketId) => {
    const checkValue = activeUsers.some((user) => user.userName === userName)

    if(checkValue){
        let foundUser = getActiveUser(userName)
        foundUser.socketId = socketId;
    }
    else activeUsers.push({userName, socketId})
}

// Removes the user from the activeUser array
const removeUser = (userEmail) => {
    activeUsers = activeUsers.filter((user) => user.userName !== userEmail)
}

// Gets the user form the activeUser array 
const getActiveUser = (userName) => {
    return activeUsers.find((user) => user.userName === userName)
} 



// Starts connection 
io.on('connection', (socket) => {
    
    // Listens for new login, adds user to the activeUser array
    socket.on('newLogin', (userName) => {
        addUser(userName, socket.id)
    })

    // Listens for new like on post recieves the post id and current like count
    socket.on('newLike', async (like) => {

        const currentLike = parseInt(like.currentLike)
        const resultEmail = await getUserEmail(like.foodId)
        const userEmail = resultEmail.rows[0].profile_email
        

        const activeSocket = getActiveUser(userEmail)

        /*io.to(activeSocket.socketId).emit('getNotification', {
            updatedLike: currentLike + 1,
            foodId: like.foodId

        })*///updat to send notification to poster user 

        // Sends the new updated like the post liked
        io.emit('getNotification', {
            updatedLike: currentLike + 1,
            foodId: like.foodId

        })

    })

    // Listens for new comments, recieves the current count and post id
    socket.on('newComment', async (comment) => {
        console.log("in the comment", comment)

        const currentCommentCount = parseInt(comment.currentCount)
        const resultEmail = await getUserEmail(comment.commentFoodId)
        const userEmail = resultEmail.rows[0].profile_email

        const activeSocket = getActiveUser(userEmail)
        console.log(activeSocket, activeSocket.socketId)

        /*io.to(activeSocket.socketId).emit('getNotification', {
            updatedLike: currentLike + 1,
            foodId: like.foodId

        })//updat to send notification to poster user */

        // Sends the updated comment count to the client 
        io.emit('getNotificationComment', {
            updatedCount: currentCommentCount + 1,
            foodId: comment.commentFoodId
        })

    })

    // Listens to user unliking a post recieves the food post id and current liek count
    socket.on('deleteLike', async (like) => {

        const currentLikeCount = parseInt(like.currentLike)

        io.emit('getCurrentLike', {
            updatedCount: currentLikeCount - 1,
            foodId: like.foodId
        })
    })

    // Removes the user from activeUsers includes the userEmail and socket id
    socket.on('disconnectUser', (userEmail) => {
        removeUser(userEmail);
      });

   

})


app.use(cors({
    origin: [process.env.PORT, 'https://food-recipe-card-app.herokuapp.com'],
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'DELETE']
}))
app.use(express.urlencoded({ extended: true }));

/**uses the multer middleware to set uploads when image is uploaded */
const upload = multer({dest: 'uploads/'});

/** Using function from s3.js to upload from multer upload folder to s3 */
const { uploadImage, getImageS3, deleteImage } = require('./s3');
//const { create } = require('domain')



// Session needed to track user 
const sessionConfig = {
    store: new pgSession({
        pool: pool,
        tableName: 'session',
    }),
    secret: process.env.COOKIE_SECRET_ONE, //used to encrypt the cookie 
    resave: false,                     // set to flase - forces session to be saved back to the session store
    key: "test.cookie",
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000},
    saveUninitialized: false,          // Chooisng false wil help with login sessions
                                       // naming the cookie sent to the client side
}

app.use(session(sessionConfig))

//Get user email from food post to send socket notification
const getUserEmail = async (food_id) => {
    try {
        const resultUserId = await pool.query('SELECT profile_id FROM foodpost WHERE food_id = $1', [food_id])
        const userId = resultUserId.rows[0].profile_id;
        console.log("In the getUSerEmail --",userId)
        const userEmailAns = await pool.query('SELECT profile_email FROM profiles WHERE profile_id = $1', [userId])
        return userEmailAns
    } catch (error) {
        console.log(error)
    }
    return null;
}




// Checks if there exists an email in the database given
const checkEmail = async (userEmail) => {
    try {
        const result = await pool.query('SELECT * FROM profiles WHERE profile_email = $1', [userEmail])
        return result.rows;
    } catch (error) {
        console.log(error)
    }
    return null;
}
//exports.checkEmail = checkEmail



// Used to split cookie from browser
const cleanCookie = (cookieData) =>{
    let cookieOne = cookieData.split('=')
    let cookieTwo = cookieOne[1].split('.')
    let finalCookie = cookieTwo[0].substring(4)

    return finalCookie;   
}
//exports.cleanCookie = cleanCookie





// Checks if the user has a unique email, if so saves email/password to postgresql
app.post('/sign-up', async (req,res) => {
   const { Email } = req.body.params
   const { Password } = req.body.params
   
   const existingEmail = await checkEmail(Email)

// If there is no user email found allows the email and password to be saved in the database
   if (!existingEmail.length) {

    try{
        const hash = await bcrypt.hash(Password, 11)
        const signUpResult = await pool.query("INSERT INTO profiles (profile_email, profile_password) VALUES($1,$2) RETURNING *", [Email, hash])
        const userNumberId = signUpResult.rows[0].profile_id
        req.session.user = userNumberId

        const sessionId = req.sessionID
        const sessionJson = req.session
        const expirationCookie = req.session.cookie.expires

        await pool.query('INSERT INTO session (sid, sess, expire) VALUES($1,$2,$3)', [sessionId, sessionJson, expirationCookie])

        res.status(200).json({Message: true})
    }catch(error){
        console.log(error)
    }
    
   } else {
     res.json({Message: false})
   }

})

app.post('/login', async (req,res) => {
    
    const { userEmail } = req.body
    const { userPassword } = req.body

    const accountFound = await checkEmail(userEmail)
    const userId = accountFound[0].profile_id
    const userIntId = parseInt(userId)
    
    
// Examines if there is an existing email in the database
    if(!accountFound){
        res.json("There is no account")
    }

// if there is an existing email then hashed password will be compared with client password
    if(accountFound.length > 0){
        const passwordVarification = await bcrypt.compare(userPassword, accountFound[0].profile_password)
        if(passwordVarification){
            req.session.user = userIntId

            const sessionId = req.sessionID
            const sessionJson = req.session
            const expirationCookie = req.session.cookie.expires

            await pool.query('INSERT INTO session (sid, sess, expire) VALUES($1,$2,$3)', [sessionId, sessionJson, expirationCookie])

            res.status(200).json(true)
        }
    }else{
        console.log(error)
    } 
    
})


// Logs the user out, deletes the session Id from the browser within the cookie
app.post('/logout', async (req, res) => {

    if(req.headers.cookie){

        let browserCookie = cleanCookie(req.headers.cookie)
        let deletedeCookie = await pool.query('DELETE FROM session WHERE sid = $1', [browserCookie])
        res.clearCookie('test.cookie')
        res.set({ 'Content-Type': 'text/plain'})
        res.end();
    }else{
        res.status(500).json({message: "Already logged out"})
    }
})

// Stores the users first, last name zipcode and location
app.post('/profile-setup', async (req,res) => {
    const {firstName} = req.body.params
    const {lastName} = req.body.params
    const {zipcode} = req.body.params
    const {location} = req.body.params

//Checking if the user is authorized
    if(req.headers.cookie){

        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)
    
        //Updating profiles table
        try {
            const profilesetupResult = await pool.query('UPDATE profiles SET profile_first_name = $1, profile_last_name = $2, profile_zipcode =$3, profile_location = $4 WHERE profile_id = $5 RETURNING *', 
            [firstName, lastName, zipcode, location, userIntId])
            res.status(200).json(true)

        } catch (error) {
            console.log(error)
        }


    }else{
        res.status(500).json("Not Authorized")
    } 
})

//Updates the user profile image, stores the image in an S3 bucket and dicards the temp file from the upload file on server side
app.post('/profile-image-update', upload.single('image'), async (req,res) => {

    
    if (req.headers.cookie) {
        const { filename } = req.file
        const filePathFolder = req.file.path
        const newFileRoute = `/profile-image-update/${filename}`
        
        await uploadImage(req.file)

        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            let checkUserImage = await pool.query('SELECT profile_image FROM profiles WHERE profile_id = $1', [userIntId])
            
            if(checkUserImage.rows[0].profile_image){
                let userDataImage = checkUserImage.rows[0].profile_image;
                let newUserDataImage = userDataImage.slice(22)
                
                deleteImage(newUserDataImage)
            }

            const newProfileImage = await pool.query('UPDATE profiles SET profile_image = $1 WHERE profile_id = $2 RETURNING *', [newFileRoute, userIntId])
            await unlinkFile(filePathFolder); // deletes files from the upload folder in server side
            
            
            res.status(200).json(newProfileImage.rows[0].profile_image)
            



        } catch (error) {
            console.log(error)
        }
        
    } else {
        res.status(500).json("No token found")
    }


    
})



// Stores the users recipe image , name , description and ingredients as well as time to prepare
// Images get stores in an S3 bucket, image name key gets saved in the database
app.post('/recipe-submission', upload.single('image'), async (req,res) => {
    
    if (req.headers.cookie) {
        const { foodName } = req.body
        const { foodDescription } = req.body
        const { foodIngredients } = req.body
        let hourInt = 0
        let minuteInt = 0

        const { foodHour } = req.body
        if(foodHour){
             hourInt = parseInt(foodHour)

        }

        const { foodMinute } = req.body
        if(foodMinute){
             minuteInt = parseInt(foodMinute)
        }


        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        const filePathFolder = req.file.path; // Needed to unlike file from back end "/uploads" folder
        const { filename } = req.file // Name to store in AWS
        const newFileName = `/images/${filename}` 
        const awsResult = await uploadImage(req.file)

        try {
            const result = await pool.query('INSERT INTO foodpost (food_img, food_name, food_hour, food_minute, food_description, profile_id, food_ingredients) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', 
            [newFileName, foodName, hourInt, minuteInt, foodDescription, userIntId, foodIngredients])

            await unlinkFile(filePathFolder); // deletes files from the upload folder in server side

            res.status(200).json(result.rows[0])
        } catch (error) {
            console.log(error)
        }
        
    } else {
        res.status(500).json("No token")
    }

})


//Adds new like to post liked
app.post('/add-to-like', async (req,res) => {
    
    const { foodId } = req.body
    const foodIntId = parseInt(foodId)
    const {profileId} = req.body

    if (req.headers.cookie) {
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {

            const resultOne = await pool.query('INSERT INTO likes (liked_food_post_id, profile_id) VALUES($1, $2) RETURNING *', [foodIntId, profileId])
            
            const value = resultOne.rows[0].liked_food_post_id
            if(value > 0){
                res.status(200).json(true)
            }
            else res.json(false)
        
        } catch (error) {
            console.log(error)
        }

    } else {
        res.status(500).json("No token found")
    }
    

})

// Updates the unliked post from database
app.post('/delete-like', async (req,res) => {
    const {foodId} = req.body
    //console.log(foodId)

    if (req.headers.cookie) {

        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const deletedLike = await pool.query('DELETE FROM likes WHERE liked_food_post_id = $1 AND profile_id = $2 RETURNING *', [foodId, userIntId])
            //console.log(deletedLike.rows)
        } catch (error) {
            console.log(error)
        }
        
    } else {
        
    }
})






//Delete a food post
app.post('/delete-card', async (req,res) => {
    const { foodId } = req.body
    const foodIdInt = parseInt(foodId)
    

    if (req.headers.cookie) {
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        

        try {
            let foodImage = await pool.query('SELECT food_img FROM foodpost WHERE food_id = $1', [foodId])
            const foodImageName = foodImage.rows[0].food_img
            
            if(foodImageName){
                let imageKey = foodImageName.slice(8)
                deleteImage(imageKey)
            }



            const deleteComment = await pool.query('DELETE FROM comments WHERE foodpost_id = $1', [foodId])
            const deleteLike = await pool.query('DELETE FROM likes WHERE liked_food_post_id = $1', [foodId])
            
            const resultTwo = await pool.query('DELETE FROM foodpost WHERE food_id = $1 RETURNING *', [foodIdInt])
            res.status(200).json(resultTwo.rows[0].food_id)
            //res.status(200).json(resultTwo.rows[0])
            
        } catch (error) {
            console.log(error)
        }

    } else {
        res.status(500).json("No token found")
    }

})                                                     

//Gets selected food recipe information
app.post('/get-selected-recipe', async (req,res) => {
    const value = req.body
    let ans = Object.keys(value)

    try {
        const answer = await pool.query('SELECT * from foodpost WHERE food_id = $1', [ans[0]])
        res.json(answer.rows[0])
    } catch (error) {
        console.log(error)
    }
})



//Returns profile data 
app.get('/profile-data', async (req,res) => {

    if(req.headers.cookie){

        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const result = await pool.query('SELECT profile_id, profile_first_name, profile_last_name, profile_zipcode, profile_location, profile_image, profile_email FROM profiles WHERE profile_id = $1', [userIntId])
            res.status(200).json(result.rows[0])
        } catch (error) {
           console.log(error) 
        }

    }else{
        res.status(500).json("No token found")
    }
})


//Route grabs the image from the S3 buckets and sends to the client
app.get('/images/:key', (req,res) => {
    const imageKey = req.params.key
    const readFile = getImageS3(imageKey)
    readFile.pipe(res)

})


//Route grabs the image from the S3 buckets and sends to the client
app.get('/profile-image-update/:key', async (req,res) => {
    const imageKey = req.params.key
    const readFile = getImageS3(imageKey)
    readFile.pipe(res)
})


// Retrieves the likes of each post 
app.post('/get-post-likes-count', async (req,res) => {
        const { foodId } = req.body

        if (req.headers.cookie) {

            let browserCookie = cleanCookie(req.headers.cookie)
            let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
            let userId = cookieInDataBase.rows[0].sess.user; // outputs id
            let userIntId = parseInt(userId)


            try {
                const likeTrue = await pool.query('SELECT COUNT(*) FROM likes WHERE liked_food_post_id = $1 AND profile_id = $2', [foodId, userIntId])
                const booleanLikeCheck = likeTrue.rows[0].count
                let booleanLike = false

                if(booleanLikeCheck === "1"){
                    booleanLike = true
                }

                const count = await pool.query('SELECT COUNT(*) FROM likes WHERE liked_food_post_id = $1', [foodId])
                const countValue = count.rows[0].count
                res.status(200).json({countValue, booleanLike})
            } catch (error) {
                console.log(error)
            }
            
        } else {
            res.status(500).json("No token found")
        }
})


// Gets the comment for a certai post
// receives the post id
app.get('/food-card-comments', async (req,res) => {
    const { foodId } = req.query
    
    if (req.headers.cookie) {
        
        try {
            const result = await pool.query('SELECT * FROM comments WHERE foodpost_id = $1', [foodId])
            //console.log(result.rows[0])
            res.status(200).json(result.rows)
        } catch (error) {
            console.log(error)
        }
    } else {
        console.log(error)
    }
})

//Get the count of certain post id passed
app.post('/get-post-comment-count', async (req,res) => {
    const { foodId } = req.body
    
    try {
        const count = await pool.query('SELECT COUNT(*) FROM comments WHERE foodpost_id = $1', [foodId])
        //console.log(count.rows[0].count)
        res.status(200).json(count.rows[0].count)
    } catch (error) {
        console.log(error)
    }
    

})




// Saves the comment for a given post
app.post('/post-comment', async (req,res) => {
    const { userComment } = req.body
    const { commentFoodId } = req.body

    if (req.headers.cookie) {

        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)
        
        try {
            const commentResult = await pool.query('INSERT INTO comments (comment_body, foodpost_id, user_comment_id) VALUES($1,$2,$3)', [userComment, commentFoodId, userIntId])
        } catch (error) {
            console.log(error)
        }

    } else {
        res.status(500).json("No token found")
    }

    
})




// Retrieves all user food recipes
app.get('/get-all-foodcards', async (req,res) => {
    //console.log("food-acticeUser", activeUsers)

    if(req.headers.cookie)
    {
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const result = await pool.query('SELECT * FROM foodpost WHERE profile_id = $1', [userIntId])
            const value = result.rows
            res.status(200).json({value, userIntId})
        } catch (error) {
            console.log(error)
        }

    }else{
        console.log("Its not working")
    }
})

// Returns random food recipes from database
app.get('/explore-user-page', async (req,res) => {
    if (req.headers.cookie) {
        
        let browserCookie = cleanCookie(req.headers.cookie)
        let cookieInDataBase = await pool.query('SELECT * FROM session WHERE sid = $1', [browserCookie])
        let userId = cookieInDataBase.rows[0].sess.user; // outputs id
        let userIntId = parseInt(userId)

        try {
            const result = await pool.query('SELECT food_id, food_img, food_name, food_minute, food_hour, food_description, food_ingredients FROM foodpost ORDER BY RANDOM() LIMIT 10')
            const value = result.rows
            res.status(200).json({value, userIntId})
        } catch (error) {
            console.log(error)
        }
    } else {
        
    }
})


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "client/build")));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "client/build/index.html"))
    })
}




httpServer.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})

