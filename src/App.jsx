import { useState } from 'react'
import './App.css'
import LoginForm from "./LoginForm"
import Signup from './Signup'
import Home from './Home'
import Homes from './Homes'
import Pricesm from './Pricesm'
import Auction from './AuctionPage'
import Otpv from './Otpv'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuctionPage from './AuctionPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
          <Routes>
            <Route path='/LoginForm' Component={LoginForm}></Route>
            <Route path='/Signup' Component={Signup}></Route>
            <Route path='/Home' Component={Home}></Route>
            <Route path='/Homes' Component={Homes}></Route>
            <Route path='/Pricesm' Component={Pricesm}></Route>
            <Route path='/AuctionPage' Component={AuctionPage}></Route>
            <Route path='/Otpv' Component={Otpv}></Route>
          </Routes>
        </Router>
        
    </>
  )
}

export default App
