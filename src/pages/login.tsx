import { useAuthenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Authenticator } from '@aws-amplify/ui-react';
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import QRCodeCanvas from 'qrcode.react';
import { Alert, CircularProgress } from "@mui/material";

const LoginPage: FC = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const router = useRouter()

  const handleLogOut = () => {
    Auth.signOut().then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div style={{marginTop: "3rem"}}>
      <Container maxWidth="sm">
        {authStatus === 'unauthenticated' && <SignIn />}
        {authStatus === 'configuring' && <CircularProgress />}
        {authStatus === 'authenticated' && user &&
          <Box sx={{
            margin: 'auto'
          }}>
            <Typography>You are currently logged in as {user.attributes?.name}</Typography>
            <Button variant='contained' size='small' onClick={handleLogOut}>Log out</Button>
          </Box>
        }
      </Container>
    </div>
  );
}

export default LoginPage;

// TODO: create authentication flow, to check admin (MFA)

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

export function SignIn() {

  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>('')
  const [showConfirmationField, setConfirmationFieldShow] = React.useState<boolean>(false)
  const [str, setStr] = React.useState<string>('')
  const [user, setUser] = React.useState<any | undefined>()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email')
    const password = data.get('password')
    if(!email || !password) {
      return
    }
    if(typeof email == 'string' && typeof password == 'string') {
      setLoading(true)
      console.log({
        email: data.get('email'),
        password: data.get('password'),
      });
      try {
        const signedUser = await Auth.signIn(email, password)
        setLoading(false)
        setUser(signedUser)
        console.log(signedUser)
        if(signedUser?.getSignInUserSession()?.getAccessToken().payload['cognito:groups']?.includes('admins')) {
          Auth.setupTOTP(signedUser).then((code) => {
            setStr("otpauth://totp/AWSCognito:"+ signedUser.username + "?secret=" + code + "&issuer=google")
            setConfirmationFieldShow(true)
          });
        } else if (signedUser["challengeName"] == "SOFTWARE_TOKEN_MFA") {
          setConfirmationFieldShow(true)
        } else {
          router.push("/")
        }
      } catch (e) {
        if(typeof e == 'string')
          setError(e)
        // else if(e.message)
        //   setError(e.message)
        console.log(e)
      }
    }
  };


  const handleMFA = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const userAnswer = data.get("auth-code")
    if(typeof userAnswer == 'string') {
      if(user?.challengeName == "SOFTWARE_TOKEN_MFA") {
        console.log(user)
        const loggedUser = await Auth.confirmSignIn(user, userAnswer, "SOFTWARE_TOKEN_MFA")
        router.push("/")
      } else {
        Auth.verifyTotpToken(user, userAnswer)
          .then(() => {
            // don't forget to set TOTP as the preferred MFA method
            console.log('Done')
            Auth.setPreferredMFA(user, 'TOTP');
            router.push('/')
          })
          .catch((e) => {
            setError(e.message)
            console.log(e)
          });
        }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {error && <Alert severity="error" sx={{margin: '1rem'}}>{error}</Alert>}
          {!user && 
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading && <CircularProgress size={20} sx={{marginRight: '1rem'}} style={{color: '#fff'}}/>} 
                <span>Sign In</span>
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          }
        </Box>

        {str && 
          <Box sx={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <QRCodeCanvas value={str} size={175}/>
          </Box>
        }
        {showConfirmationField && 
          <Box component="form" onSubmit={handleMFA} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="auth-code"
              label="Verification Code"
              name="auth-code"
            />
            <Button type="submit">Send</Button>
          </Box>
        }

        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}