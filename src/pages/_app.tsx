import type { AppProps } from 'next/app'
import {Amplify, Auth} from "aws-amplify"
import awsconfig from "../aws-exports"
import '@aws-amplify/ui-react/styles.css'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { FC, useEffect, useState } from 'react';
import LoginPage from './login';

Amplify.configure({...awsconfig,ssr:true})

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Authenticator.Provider>
      <Component {...pageProps} />
    </Authenticator.Provider>
  </>
}
