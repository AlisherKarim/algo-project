import type { AppProps } from 'next/app'
import {Amplify, Auth} from "aws-amplify"
import awsconfig from "../aws-exports"
import '@aws-amplify/ui-react/styles.css'
import { NavBar } from '@/components/Navbar';
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure({...awsconfig,ssr:true})

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Authenticator.Provider>
      <NavBar />
      <Component {...pageProps} />
    </Authenticator.Provider>
  </>
}
