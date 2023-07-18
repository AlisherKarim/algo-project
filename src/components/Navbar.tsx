import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import CodeIcon from '@mui/icons-material/Code';
import { useRouter } from 'next/router';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Chip } from '@mui/material';
import { Auth } from 'aws-amplify';
import Link from 'next/link';

const pages = [
  {
    path: '/',
    name: 'Home',
  },
  {
    path: '/components',
    name: 'Components'
  },
  {
    path: '/contribute',
    name: 'Contribute'
  },
  {
    path: '/dashboard',
    name: 'Dashboard'
  },
  {
    path: 'https://algobek.talkyard.net/latest',
    name: 'Discussions'
  },
  {
    path: '/about',
    name: 'About'
  }
];
const settings = [
  {
    path: '/profile', 
    name:'Profile'
  },
  {
    path: '/account',
    name: 'Account'
  }, 
  {
    path: '/dashboard',
    name: 'Dashboard'
  },
  {
    path: '/logout',
    name: 'Logout'
  }
];

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')?.[1]?.[0]}`,
  };
}

export const NavBar: React.FC = () => {
  const { route } = useAuthenticator((context) => [context.route]);
  const router = useRouter()
  const {user, signOut} = useAuthenticator((context) => [context.user])

  const signOutAndMain = () => {
    Auth.signOut().then((res) => {
      router.push('/login')
    }).catch(err => {
      console.log(err)
    })
    handleCloseUserMenu()
  }

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" color='transparent'>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <CodeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 500,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={() => {router.push(page.path); handleCloseNavMenu()}}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <CodeIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 500,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => router.push(`${page.path}`)}
                sx={{ my: 2, color: 'inherit', display: 'block' }}
              >
                {/* <Link href={`/${page}`}> */}
                  {page.name}
                {/* </Link> */}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {route == 'authenticated' ? 
              <>            
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar {...stringAvatar(user.attributes?.name ?? 'John Doe')} />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    setting.name === 'Logout' ? 
                    <MenuItem key={setting.name} onClick={signOutAndMain}>
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                    :
                    <MenuItem key={setting.name} onClick={() => {router.push(`${setting.path}`); handleCloseNavMenu()}}>
                      <Typography textAlign="center">{setting.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
              :
              <Link href="/login" passHref style={{color: 'rgba(0, 0, 0, 0.87)'}}>
                <Button color="inherit">Login</Button>
              </Link>
            }
          </Box>
          {route == 'authenticated' && user?.getSignInUserSession()?.getAccessToken().payload['cognito:groups']?.includes('admins') && <Chip label="Admin" sx={{marginLeft: '1rem'}}/>}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
