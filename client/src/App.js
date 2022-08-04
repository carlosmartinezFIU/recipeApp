import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignUp from './containers/SignUp/SignUp';
import ProfileSetUp from './containers/ProfileSetup/ProfileSetUp';
import Home from './containers/Home/Home'
import Explore from './containers/Explore/Explore';

import { DataProvider } from './DataContext'
import FoodRecipe from './containers/FoodRecipe/FoodRecipe';


function App() {
  return (
    <DataProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path='/' element={<SignUp/>}/>
            <Route path='/profile-setup' element={<ProfileSetUp/>}/>
            <Route path='/profile-home' element={<Home/>}/>
            <Route path='/profile-explore' element={<Explore/>}/>
            <Route path='/food-recipe' element={<FoodRecipe/>}/>
          </Routes>
        </Router>
        
      </div>
    </DataProvider>
  );
}

export default App;
