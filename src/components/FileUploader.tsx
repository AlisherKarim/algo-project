import { useAuthenticator } from '@aws-amplify/ui-react'
import { StorageManager } from '@aws-amplify/ui-react-storage'
import { Alert, Box, Button, Card, CardContent, Modal, Typography } from "@mui/material"
import { useEffect } from 'react'
import { ChangeEvent } from 'react'
import { FC, FormEvent, useState } from "react"

const UploadModal: FC<{open: boolean, handleClose: () => void, file: File | undefined, storagePath: string}> = ({open, handleClose, file, storagePath}) => {
  const { user } = useAuthenticator((context) => [context.user]);

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

  const [error, setError] = useState<string>()

  const handleSubmit = async () => {
    if (!file || !user.username) 
      return
    var data = new FormData()
    data.append('file', file)
    data.append('path', storagePath)
    data.append('username', user.username)
    console.log(data)
    fetch("https://1c2kn07ik5.execute-api.us-east-1.amazonaws.com/publish", {
      method: 'POST',
      body: data,
      mode: 'no-cors',
    }).then(res => handleClose())
    .catch(err => setError("Something went wrong"))
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography id="modal-modal-title" variant="h6" component="h2">
          You are uploading the next file: <span>{file?.name}</span>
        </Typography>
        <Button variant='outlined' color='success' onClick={handleSubmit}>Approve and submit</Button>
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
      <UploadModal open={open} handleClose={handleClose} file={file} storagePath={`public/${username}/${folder}`}/>
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