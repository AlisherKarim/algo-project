import type { AppProps } from 'next/app'
import { Amplify } from "aws-amplify"
import awsconfig from "../aws-exports"
import '@aws-amplify/ui-react/styles.css'
import { Authenticator } from '@aws-amplify/ui-react'

Amplify.configure({...awsconfig,ssr:true})

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Authenticator.Provider>
      <Component {...pageProps} />
    </Authenticator.Provider>
  </>
}
