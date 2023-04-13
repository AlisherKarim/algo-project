import { User } from '@/types';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { Button, Form, NavItem } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import LogoutIcon from '@mui/icons-material/Logout';

export const NavBar: FC = (props) => {
  const router = useRouter()
  const signOutAndNavigate = () => {
    Auth.signOut()
    router.push("/")
  }

  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log("User: ", user.attributes.username)
      })
      .catch(err => {
        console.log(err)
      })
  }, [])

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">Logo</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" data-bs-target="#basic-navbar-nav" data-bs-toggle="collapse"/>
        <Navbar.Collapse id="basic-navbar-nav" >
          <Nav className="me-auto">
            <Nav.Link onClick={() => router.push("/")}>Home</Nav.Link>
            <Nav.Link onClick={() => router.push("/contribute")}>Contribute</Nav.Link>
            
          </Nav>
          <Form className="d-flex m-1">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-secondary">Search</Button>
            </Form>
          <Nav.Item>
            {user ? 
              <>
                {/* <Navbar.Text></Navbar.Text> */}
                <Button variant='link' onClick={signOutAndNavigate}>
                  {user.attributes?.name + ' '}<LogoutIcon>A</LogoutIcon>
                </Button>
              </>
               : 
              <Button variant='link' onClick={() => router.push("/login")}>Login</Button> 
            }
          </Nav.Item>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}