import { FileViewer } from "@/components/FileViewer"
import { FolderView } from "@/components/FolderView"
import { withAuthenticator } from "@aws-amplify/ui-react"
import React, { useState } from "react"
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import { TransactionList } from "@/components/TransactionList"
import styles from '@/styles/Home.module.css'

const Dashboard = () => {
  const [currentFile, setCurrentFile] = useState<string>()
  const [keyPath, setKeyPath] = useState<string>()

  return <>
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

export default withAuthenticator(Dashboard)