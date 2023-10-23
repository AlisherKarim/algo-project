import type { AppProps } from 'next/app'
import { Amplify } from "aws-amplify"
import awsconfig from "../aws-exports"
import '@aws-amplify/ui-react/styles.css'
import { Authenticator } from '@aws-amplify/ui-react'
import { ProjectContext } from "@/context"
import { useState } from 'react'
import { IAlert } from '@/types'
import { Backdrop, CircularProgress } from '@mui/material'

Amplify.configure({...awsconfig,ssr:true})

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<IAlert>({title: 'error', text: 'test', severity: 'error'});
  return <>
    <Authenticator.Provider>
      <ProjectContext.Provider value={{isLoading, setLoading, alertMessage, setAlertMessage}}>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
            onClick={() => setLoading(false)}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        <Component {...pageProps} />
      </ProjectContext.Provider>
    </Authenticator.Provider>
  </>
}
