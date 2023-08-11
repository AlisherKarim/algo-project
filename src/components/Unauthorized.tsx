import { Container } from "@mui/material"
import { NavBar } from "./Navbar"
import Link from "next/link"

const Unauthorized = () => {
  return (
    <>
      <NavBar />
      <Container>
        <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>
          Please, sign in first
        </div>
        <Link href="/login">Login</Link>
      </Container>
    </>
  )
}

export default Unauthorized