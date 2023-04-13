import React, { FC, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const SubmitModal: FC<{show: boolean, setShow: (s: boolean) => void}> = ({show, setShow}) => {
  // const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch static backdrop modal
      </Button> */}

      <Modal
        size='lg'
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit your files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Here will be the description of the manifest.yaml
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary">Confirm and submit</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
