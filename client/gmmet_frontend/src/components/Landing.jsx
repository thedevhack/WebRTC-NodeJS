
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import { Link, Navigate, useNavigate,  } from 'react-router-dom'

export default function Landing(){

    const navigate = useNavigate()
    return (
    <Box variant='div' sx={{
        minHeight:"100vh",
        minWidth:"100vw",
        backgroundColor:"primary.main",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    }}>
        <Container sx={{
            display:"flex",
            justifyContent:"center",
            flexDirection:"column",
            alignItems:"center",
            width:"40vw",
            backgroundColor:"secondary.main",
            p:2,
            boxShadow:2
            }}>
            <Typography variant='h4' style={{
            color:"text.primary"
        }}>Welcome to Simplified G-Meet Clone</Typography>
        <Button variant='contained' sx={{color:"text.primary",mt:2}} to={Link} path='/meeting/123'
        onClick={() => {

            let roomId = ""
            for (let i=0; i<4; i++){
                let randomDigit = (Math.random() * 100) % 26
                roomId += String.fromCharCode(randomDigit + 65)
            }
            console.log(roomId)
            navigate('/meeting/' + roomId)
        }}>Create a Room</Button>
        </Container>
        
    </Box>
    )
}