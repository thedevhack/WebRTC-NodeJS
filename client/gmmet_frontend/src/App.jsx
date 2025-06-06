import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import { createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import MeetingPage from './components/MeetingPage';
import Test from './components/Test';

function App() {

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    // document.body.style.overflow = 'hidden'; // Prevents unwanted scrollbars
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  const theme = createTheme({
    palette:{
      mode:"light",
      primary:{
        main:"#FFD372",
      },
      secondary:{
        main:"#F15B42"
      },
      text:{
        primary:"#353535",
      }
    }
  })

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline/>
    <Router>
      <Routes>

        <Route path='/meeting/:roomId' element={<MeetingPage/>} />
        <Route path='/' element={<Landing/>} />
        <Route path='/test' element={<Test/>} />
      </Routes>
    </Router>
    </ThemeProvider>
  )
}

export default App
