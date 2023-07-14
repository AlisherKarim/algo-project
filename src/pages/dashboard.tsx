import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import React, { FC, useState } from "react"
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import { TransactionList } from "@/components/TransactionList"
import styles from '@/styles/Home.module.css'
import { NavBar } from "@/components/Navbar"
import { withSSRContext } from "aws-amplify"
import { Container } from "@mui/material"
import Link from "next/link"

const Dashboard: FC<{authenticated: boolean, username: string}> = ({authenticated, username}) => {
  const [currentFile, setCurrentFile] = useState<string>()
  const [keyPath, setKeyPath] = useState<string>()
  if(!authenticated) {
    return (
      <>
        <NavBar />
        <Container>
          <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>
            Please, sign in first to see your dashboard
          </div>
          <Link href="/login">Login</Link>
        </Container>
      </>
    )
  }
  return <>
    <NavBar />
    <div style={{display: 'flex', marginTop: '0.5rem', height: '90vh'}} >
      <Splitter 
        direction={SplitDirection.Horizontal}
        initialSizes={[20, 20, 60]}
        gutterClassName={styles.customGutter}
        draggerClassName="custom-dragger-horizontal"
        minWidths={[200, 200, 200]}
      >
        <TransactionList setKeyPath={setKeyPath}/>
        <FolderView setCurrentFile={setCurrentFile} keyPath={keyPath}/>
        <FileViewer currentFile={currentFile} />
      </Splitter>
    </div>
  </>
}

export async function getServerSideProps(context: { req?: any; res: any; modules?: any[] | undefined; } | undefined) {
  const { Auth } = withSSRContext(context)
  try {
    const user = await Auth.currentAuthenticatedUser()
    return {
      props: {
        authenticated: true,
        username: user.username
      }
    }
  } catch (err) {
    context?.res.writeHead(302, { Location: '/login' })
    context?.res.end()
  }
  return {props: {}}
}

export default Dashboard