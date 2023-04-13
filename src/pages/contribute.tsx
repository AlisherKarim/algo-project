import { SubmitModal } from "@/components/SubmitModal";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { FC, useState } from "react";
import { FormEvent } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";

const ContributePage: FC<{user: any, signOut: any}> = ({user, signOut}) => {

  const [file, setFile] = useState<File>()
  const [show, setShow] = useState<boolean>(false)

  const handleFileInput = (event: FormEvent) => {
    setFile((event.target as HTMLInputElement)?.files?.[0])
  }

  const handleSubmitButton = () => {
    setShow(true)
  }

  return (
    <> 
      <SubmitModal show={show} setShow={setShow}/>
      <Container>
        <div style={{display: "flex", gap: "1rem", marginTop: "3rem", justifyContent: "space-between"}}>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <div style={{height: "100px"}}>
                <Card.Title className="text-primary">Data Strucure</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Upload your data structure code</Card.Subtitle>
              </div>
              <Form.Group controlId="formFile" className="mb-3 mt-3" style={{bottom: "5rem"}}>
                <Form.Control type="file" onInput={handleFileInput} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <div style={{height: "100px"}}>
                <Card.Title className="text-primary">Algorithm</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Upload your algorithm code</Card.Subtitle>
              </div>
              <Form.Group controlId="formFile" className="mb-3 mt-3">
                <Form.Control type="file" />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <div style={{height: "100px"}}>
                <Card.Title className="text-primary">Problem generator</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Upload your problem generator code</Card.Subtitle>
              </div>
              <Form.Group controlId="formFile" className="mb-3 mt-3">
                <Form.Control type="file" />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card style={{ width: '18rem' }}>
            <Card.Body>
              <div style={{height: "100px"}}>
                <Card.Title className="text-primary">Data set</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Upload your data set</Card.Subtitle>
              </div>
              <Form.Group controlId="formFile" className="mb-3 mt-3">
                <Form.Control type="file" />
              </Form.Group>
            </Card.Body>
          </Card>

        </div>
        <div style={{marginTop: "3rem", display: "flex", justifyContent: "flex-end"}}>
          <Button onClick={handleSubmitButton}>Submit</Button>
        </div>
      </Container>
    </>
  )
}

export default withAuthenticator(ContributePage);