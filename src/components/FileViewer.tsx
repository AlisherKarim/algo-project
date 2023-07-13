import { Skeleton } from "@mui/material"
import { FC } from "react"
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export const FileViewer: FC<{currentFile: string | undefined}> = ({currentFile}) => {
  // TODO: change language according to the file
  return (
    <>
      { 
        currentFile ? 
          <SyntaxHighlighter language="cpp" style={monokaiSublime} customStyle={{
            height: '100%',
            backgroundColor: '#001E3C',
            color: 'white',
            paddingLeft: '2px',
            position: 'relative',
            top: '-1rem'
          }} showLineNumbers={true} wrapLines={true}>
            {currentFile}
            </SyntaxHighlighter>
        : 
          <Skeleton variant="rectangular" height={'100%'} animation={false} style={{backgroundColor: '#001E3C'}} />
      }
    </>
  )
}