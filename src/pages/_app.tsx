import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app'
import {Amplify, Auth} from "aws-amplify"
import awsconfig from "../aws-exports"
import '@aws-amplify/ui-react/styles.css'
import { NavBar } from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';

Amplify.configure({...awsconfig,ssr:true})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  // const [user, setUser] = useState<null | User>(null)

  return <>
    <Authenticator.Provider>
      <NavBar />
      <Component {...pageProps} router={router}/>
    </Authenticator.Provider>
  </>
}
