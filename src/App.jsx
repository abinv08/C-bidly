import { useState } from 'react'
import './App.css'
import LoginForm from "./LoginForm"
import Signup from './Signup'
import Sign from './Sign'
import Home from './Home'
import Homes from './Homes'
import Price from './Pricesm'
import Pricesm from './Pricesm1'
import Pricela from './Pricela'
import Auction from './AuctionPage'
import Otpv from './Otpv'
import VerifyEmail from './VerifyEmail'

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
            <Route path='/Sign' Component={Sign}></Route>
            <Route path='/Home' Component={Home}></Route>
            <Route path='/Homes' Component={Homes}></Route>
            <Route path='/Price' Component={Price}></Route>
            <Route path='/Pricesm' Component={Pricesm}></Route>
            <Route path='/Pricela' Component={Pricela}></Route>
            <Route path='/AuctionPage' Component={AuctionPage}></Route>
            <Route path='/Otpv' Component={Otpv}></Route>
            <Route path='/VerifyEmail' Component={VerifyEmail}></Route>
          </Routes>
        </Router>
        
    </>
  )
}

export default App
