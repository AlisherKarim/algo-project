import { Inter } from 'next/font/google'
import Button from '@mui/material/Button';
import { Storage } from 'aws-amplify'
import { Container, FormControl, Input, InputAdornment, InputLabel, TextField } from '@mui/material'

export default function Home() {
  return (
    <>
      <main>
        <Container style={{marginTop: "7rem"}}>
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="standard-adornment-amount">Search your algorithm</InputLabel>
            <Input
              id="standard-adornment-amount"
            />
          </FormControl>
          <Button>Search</Button>
        </Container>
      </main>
    </>
  )
}
