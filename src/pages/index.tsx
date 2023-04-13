import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import { Button, Container, Form, InputGroup } from 'react-bootstrap'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <main>
        <Container style={{marginTop: "7rem"}}>
          <Form.Label htmlFor="basic-url">Search your algo</Form.Label>
          <InputGroup size="sm" className="mb-3">
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
            />
            <Button className='btn-secondary'>Search</Button>
          </InputGroup>
        </Container>
      </main>
    </>
  )
}
