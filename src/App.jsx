import { useState } from 'react'
import './App.css'
import LoginForm from "./LoginForm"
// import Signup from './Signup'
import Sign from './Sign'
import Home from './Home'
import Homes from './Homes'
import Pricesm1 from './Pricesm1'
import Pricesm from './Pricesm'
import Pricela from './Pricela'
import Auction from './AuctionPage'
import SAuctionPage from './SAuctionPage'
import Otpv from './Otpv'
import VerifyEmail from './VerifyEmail'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuctionPage from './AuctionPage'
import DashboardPage from './DashboardPage'
import CardamomAuctionForm from './CardamomAuctionForm'
import AuctionAdminDashboard from './DashboardPage'
// import AdminDashboard from './AdminDashboard'
import AuctionAdd from './AuctionAdd'
import AdminAuctionPage from './AdminAuctionPage'
import PriceInputForm from './PriceInputForm'
import ProfilePopup from './ProfilePopup'
import AprovalPanel from './AprovalPanel'
import SellerInputForm from './SellerInputForm'
import PendingApproval from './PendingApproval'
import CardamomPriceTracker from './CardamomPriceTracker'
import AuctionLotAdd from './AuctionLotAdd'
import LotApproval from './LotApproval'
import BiddingPage from './BiddingPage'
import AuctionDetails from './AuctionDetails'
import ReceiptPage from './ReceiptPage'
import BidHistoryPage from './BidHistoryPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
          <Routes>
            <Route path='/LoginForm' Component={LoginForm}></Route>
            {/* <Route path='/Signup' Component={Signup}></Route> */}
            <Route path='/Sign' Component={Sign}></Route>
            <Route path='/' Component={Home}></Route>
            <Route path='/Homes' Component={Homes}></Route>
            <Route path='/Pricesm1' Component={Pricesm1}></Route>
             <Route path='/AuctionDetails' Component={AuctionDetails}></Route>
            {/* <Route path='/Pricela' Component={Pricela}></Route>  */}
            <Route path='/AuctionPage' Component={AuctionPage}></Route>
            <Route path='/DashboardPage' Component={DashboardPage}></Route>
            <Route path='/Otpv' Component={Otpv}></Route>
            <Route path='/VerifyEmail' Component={VerifyEmail}></Route>
            {/* <Route path='/AdminDashboard' Component={AdminDashboard}></Route> */}
            <Route path='/CardamomAuctionForm' Component={CardamomAuctionForm}></Route>
            <Route path='/AdminAuctionPage' Component={AuctionAdminDashboard}></Route>
            <Route path='/AuctionAdd' Component={AuctionAdd}></Route> 
            <Route path='/PriceInputForm' Component={PriceInputForm}></Route> 
            <Route path='/ProfilePopup' Component={ProfilePopup}></Route> 
            <Route path='/AprovalPanel' Component={AprovalPanel}></Route> 
            <Route path='/LotApproval' Component={LotApproval}></Route> 
            <Route path='/SAuctionPage' Component={SAuctionPage}></Route>
            <Route path='/SellerInputForm' Component={SellerInputForm}></Route>
            <Route path='/PendingApproval' Component={PendingApproval}></Route>
            <Route path='/CardamomPriceTracker' Component={CardamomPriceTracker}></Route>
            <Route path='/AuctionLotAdd' Component={AuctionLotAdd}></Route>
            <Route path='/BiddingPage' Component={BiddingPage}></Route>
            <Route path='/bid-history/:lotId' Component={BidHistoryPage}></Route> 
            
            <Route path="/receipt/:lotId" Component={ReceiptPage} />
          </Routes>
        </Router>
     

    </>
  )
}

export default App
