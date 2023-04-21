import { StorageManager } from '@aws-amplify/ui-react-storage'
import { Box, Button, Card, CardContent, Modal, Typography } from "@mui/material"
import { useEffect } from 'react'
import { ChangeEvent } from 'react'
import { FC, FormEvent, useState } from "react"

const UploadModal: FC<{open: boolean, handleClose: () => void, file: File | undefined}> = ({open, handleClose, file}) => {
  // const [content, setContent] = useState<string>('Loading manifest...')
  // const [blob, setBlob] = useState()
  // useEffect(() => {
  //   if(open && file) {
  //     const url = URL.createObjectURL(blob);
  //     fetch('/api/decompress', {
  //       method: 'POST',
  //       body: JSON.stringify(url),
  //       headers: {
  //         Accept: "application/json, text/plain, */*",
  //         "Content-Type": "application/json",
  //       },
  //     }).then(res => res.json())
  //       .then(result => {
  //         setContent(result.data)
  //       })
  //   }
  // }, [open])
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '5px',
    boxShadow: 24,
    p: 4,
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          You are uploading the next file: <span>{file?.name}</span>
        </Typography>
        <Button variant='outlined' color='success'>Approve and submit</Button>
      </Box>
    </Modal>
  )
}

export const FileUploader: FC<{username: string, folder: string, title: string, subtitle: string}> = ({username, folder, title, subtitle}) => {
  const [file, setFile] = useState<File>()
  const [open, setOpen] = useState<boolean>(false)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0])
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <UploadModal open={open} handleClose={handleClose} file={file} />
      <Card style={{ width: '18rem' }} variant="outlined">
        <CardContent>
          <div style={{height: "100px"}}>
            <Typography sx={{ fontSize: 20 }} color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" component="div">{subtitle}</Typography>
          </div>
          <div>
            <Button variant="contained" component="label">
              Upload
              <input hidden accept=".zip" multiple type="file" onChange={handleInput}/>
            </Button>
          </div>
          {/* <Form.Group controlId="formFile" className="mb-3 mt-3" style={{bottom: "5rem"}}>
            <Form.Control type="file" accept=".zip" size="sm" onInput={handleFileInput} />
          </Form.Group> */}
          {/* <StorageManager
            acceptedFileTypes={['.zip']}
            accessLevel="public"
            maxFileCount={1}
            isResumable
            path={`${username}/${folder}/`}
            onUploadStart={(e) => {
              console.log('uploading', e.key)
            }}
          /> */}
        </CardContent>
      </Card>
    </>
  )
}