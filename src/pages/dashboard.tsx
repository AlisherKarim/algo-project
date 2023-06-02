import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import { useAuthenticator, withAuthenticator } from "@aws-amplify/ui-react"
import React, { useEffect, useState } from "react"
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import { TransactionList } from "@/components/TransactionList"
import styles from '@/styles/Home.module.css'
import { NavBar } from "@/components/Navbar"
import { Auth } from "aws-amplify"
import { useRouter } from "next/router"

const Dashboard = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter()

  useEffect(() => {
    console.log(user)
    Auth.currentAuthenticatedUser().then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
      router.push('/login')
    })
  }, [])

  const [currentFile, setCurrentFile] = useState<string>()
  const [keyPath, setKeyPath] = useState<string>()

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

export default Dashboard