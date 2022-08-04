import { createContext, useState } from "react"

export const DataContext = createContext()

export function DataProvider({children}){
    const [profileRecipe, setProfileRecipe] = useState([])
    const [recipeInfo, setRecipeInfo] = useState([])
    const [socket, setSocket] = useState()


    return(
        <DataContext.Provider
        value={{profileRecipe, setProfileRecipe,
                recipeInfo, setRecipeInfo,
                socket, setSocket}}
        >
            {children}
        </DataContext.Provider>
    )
}

export default DataContext