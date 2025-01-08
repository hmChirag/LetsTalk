import LandingPage from './pages/landing';
import './App.css'
import {Route,BrowserRouter as Router,Routes} from 'react-router-dom'
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import homeComponent from './pages/homeComponent';
import HomeComponent from './pages/homeComponent';
function App() {

  return (
    <>
      <Router>
        <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingPage></LandingPage>}></Route>
          <Route path='/auth' element={<Authentication></Authentication>}></Route>
          <Route path='/home' element={<HomeComponent></HomeComponent>}></Route>
          <Route path='/history'element={<History></History>}></Route>
          <Route path='/:url' element={<VideoMeetComponent></VideoMeetComponent>}></Route>
        </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
