import { Box, Skeleton } from "@mui/material"
import { FC } from "react"

export const FileViewer: FC<{currentFile: string | undefined}> = ({currentFile}) => {
  return (
    <>
      { 
        currentFile ? 
        <Box
          sx={{
            width: 500,
            height: 500,
            backgroundColor: 'rgba(0, 0, 0, 0.11)',
            // '&:hover': {
            //   backgroundColor: 'primary.main',
            //   opacity: [0.9, 0.8, 0.7],
            // },
            padding: '10px'
          }}
          style={{flexGrow: 1, borderRadius: '5px'}}
        >{currentFile}</Box> : 
          <Skeleton variant="rectangular" width={500} height={500} animation={false} style={{flexGrow: 1, borderRadius: '5px'}} />
      }
    </>
  )
}