import tamales from '../../asset/tamales.jpeg'
import './FoodRecipe.css'
import { BsArrowLeftSquareFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


import {DataContext} from '../../DataContext'
import { useContext, useEffect, useState } from 'react'


/**
 *  Page shows the information of a certain recipe 
 *  Includes steps and ingredients
 * 
 */
const FoodRecipe = () => {
  const nav = useNavigate()
  const {recipeInfo} = useContext(DataContext)
  const [recipeInfoData, setRecipeInfoData] = useState([])

// Returns user to the home profile
  const handleReturn = () =>{
    localStorage.clear()
    nav('/profile-home')
  }

// Makes a call when page refreshes stores the food is in local storage to not lose state when refreshed
  useEffect(() => {
    
    if(recipeInfo.food_id){
      const value = JSON.stringify(recipeInfo.food_id)
      localStorage.setItem('foodId', value)
    }

    const getFullRecipe = async () =>{
      const selectedRecipe = localStorage.getItem('foodId')
    
      try {
        const getRecipeInfo = await axios.post('/get-selected-recipe', JSON.parse(selectedRecipe))
        setRecipeInfoData(getRecipeInfo.data)
        
      } catch (error) {
        console.log(error)
      }

    }

    getFullRecipe()
  }, [])

  const stockIngredients = 'Masa harina: I like the Maseca brand which is a common brand found in the Mexican aisle at the grocery store.\n\nBroth: Beef, chicken or vegetable will work. If using my red chili pork tamale filling, use the leftover broth from the cooked pork.\n\nBaking powder\nSalt\nCumin\n\nLard: lard is used in truly authentic Mexican tamales (and it has less saturated fat then butter)! You can find it in the Mexican aisle at the grocery store, or online. Shortening would work as a substitute.\n\nDried corn husks: 8 ounce package'
  const stockSteps = "1. Soak the corn husks.  Place corn husks in a bowl of very hot water for 30 minutes or until softened.\n\n2. Prepare desired filling. You’ll need about 3 ½-4 cups of filling for one batch of tamale dough. Some filling options include: Salsa verde chicken: 3 ½ cups cooked, shredded chicken mixed with 16 ounce can salsa verde (I like herdez brand) Bean and cheese: 15 oz can refried beans and 1 ½ cups shredded mozzarella cheese Red chili pork: 1 recipe red chili pork\n\n3. Make the masa dough: In a large bowl, use an electric mixer to beat the lard and 2 tablespoons of broth until fluffy, about 3-5 minutes. Combine the masa flour, baking powder, salt, and cumin in a medium bowl; stir into the lard mixture and beat well with an electric mixer. Add the broth, little by little to form a very soft dough. Beat on high speed for several minutes. The dough should spread like creamy peanut butter and be slightly sticky. Cover the mixing bowl with a damp paper towel, to keep the dough from drying out.\n\n4. Assemble the tamales: Lay a corn husk, glossy side up, on the counter with the wide end at the top. Scoop about ¼ cup of dough onto the top, center of the corn husk. Lay a piece of plastic wrap over the dough and use your hands to press and spread the masa into a thin layer, about ¼ inch thick. Keep the dough spread along the top half of the corn husk to allow plenty of room to fold the bottom husk up, when it’s time. Place 1-2 tablespoons of desired filling in a line down the center of the dough. (You don’t want too much filling). Fold-in one long side of the husk over the filling. Fold in the other long side, overlapping the first (like folding a brochure). Fold the bottom of the husk up. Optional: Tear a long strip from an edge of one of the soaked corn husks and use it to tie the tamale, to hold it together.\n\n5. Tie the tamales (optional): Tying the tamales can help you differentiate them if making more than one filling. However, you don’t have to tie a corn husk string around them to secure them, as they will hold together without it, stacked upright, side-by-side in the pot.\n\n6. Cook on the stove-top or Instant Pot: Add water to the bottom of your stove-top steamer or Instant Pot pressure cooker. (About 1 cup for IP and a few cups for a steamer pot—don’t fill above the steamer rack.) Lay a few extra corn husks on the bottom rack to keep the tamales from falling through and any boiling water from directly touching them. Place tamales standing upright, with the open end up, just tightly enough to keep them standing. If using a steamer, lay a few soaked corn husks or a wet towel over the top of the tamales before closing the lid. Steamer: Bring water to a boil and once boiling, reduce to a simmer and steam for 1 to 2 hours (or even longer, depending on how many you’re making). Check them after 1 hour. (In Mexico they would often place a coin at the bottom of the steamer and when the coin started to tap in the pot you know the water was low and you needed to add more.) Instant Pot: Cook on Manual/High Pressure for 25 minutes. Allow pressure to naturally release for 10 minutes, and then quick release."




  return (
    <div className='foodrecipe-wrapper'>
        <div className='food-recipe-container-left'>
          <div className='food-recipe-image-container'>
          {recipeInfoData.food_img ?  <img src={recipeInfoData.food_img} alt='tamales'/> : <img src={tamales} alt='tamales'/> }
          </div>
        </div>

        <div className='food-recipe-container-right'>
          <div className='food-recipe-title-back-btn'>
              <div className='ingredients-title-food-recipe'>
                <h2 className='food-recipe-title-ingredients'>Ingredients</h2>
              </div>
              <div className='food-recipe-btn-back-container'>
                <BsArrowLeftSquareFill className='food-recipe-back-btn' onClick={handleReturn}/>
              </div>

          </div>
          <div className='food-recipe-ingredients'>
            {recipeInfoData.food_ingredients ? <pre>{recipeInfoData.food_ingredients}</pre> : <pre>{stockIngredients}</pre>}  
          </div>


            <h2 className='food-recipe-title-steps'>Steps</h2>
          <div className='food-recipe-instructions'>
             {recipeInfoData.food_description ? <pre>{recipeInfoData.food_description}</pre> : <pre>{stockSteps}</pre>} 
          </div>
        </div>
    </div>
  )
}

export default FoodRecipe