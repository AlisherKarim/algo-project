import { useAuthenticator, Authenticator, View } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { Auth, withSSRContext } from "aws-amplify";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { NavBar } from "@/components/Navbar";
import Link from "next/link";

const LoginPage: FC<{authenticated: boolean, username: string, name: string}> = ({authenticated, username, name}) => {
  const { route } = useAuthenticator((context) => [context.route]);
  const router = useRouter()

  const handleLogOut = () => {
    Auth.signOut().then(res => {
      console.log(res)
      router.push('/')
    }).catch(err => {
      console.log(err)
    })
  }

  useEffect(() => {
    if (!authenticated && route === 'authenticated') {
      router.push('/')
    }
  }, [route]);

  if(authenticated) {
    return (
      <>
        <NavBar />
        <div style={{marginTop: "3rem"}}>
          <Container maxWidth="sm">
              <Box sx={{
                margin: 'auto',
              }}>
                <Typography>You are currently logged in as {name}</Typography>
                <Button variant='contained' size='small' onClick={handleLogOut} sx={{marginRight: '1rem'}}>Log out</Button>
                <Button variant='contained' size='small' href="/">Back Home</Button>
              </Box>
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div style={{marginTop: "3rem"}}>
        <Container maxWidth="sm">
          <View className="auth-wrapper">
            <Authenticator></Authenticator>
          </View>
          <Box
            sx={{
              margin: '1rem 0',
              display: "flex",
              justifyContent: 'center'
            }}
          >
            <Link href="/" passHref style={{color: 'rgba(0, 0, 0, 0.87)'}}>
              <Button variant='contained' size='small' color='inherit'>Back home</Button>
            </Link>
          </Box>
        </Container>
      </div>
    </>
  );
}

export default LoginPage;

export async function getServerSideProps(context: { req?: any; res: any; modules?: any[] | undefined; } | undefined) {
  const { Auth } = withSSRContext(context)
  try {
    const user = await Auth.currentAuthenticatedUser()
    console.log('user: ', user)
    return {
      props: {
        authenticated: true, username: user.username, name: user.attributes?.name
      }
    }
  } catch (err) {
    return {
      props: {
        authenticated: false
      }
    }
  }
}