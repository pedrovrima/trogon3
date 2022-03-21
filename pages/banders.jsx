import React, { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import Taable from "../components/table";

// import Header from "../components/header";
import {
  Container,
  Heading,
  Box,
  Flex,
  Spacer,
  List,
  ListItem,
} from "@chakra-ui/layout";
import {
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Lorem,
  Button,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Table,
  Tr,
  Td,
} from "@chakra-ui/react";

import BanderForm from "../components/bander-form";

const fetcher = (url) => fetch(url).then((r) => r.json());
const poster = async (url, param) => {
  const data = await fetch(url, {
    method: "post",
    body: JSON.stringify({ id: param }),
  }).then((r) => r.json());
  return data;
};

const banderColumns = [
  { Header: "Id", accessor: "bander_id", disableFilters: true, show: false },

  { Header: "Nome", accessor: "name", disableFilters: true },
  { Header: "Código", accessor: "code", disableFilters: true },
];

export default function Banders(props) {
  const { error, data, mutate } = useSWR("/api/get_banders", fetcher);
  const columns = useMemo(() => banderColumns, []);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [id, setId] = useState();
  const [mode, setMode] = useState();

  const openFun = (val) => {
    setId(val.bander_id);
    onOpen();
  };

  return (
    <>
      <Box p="24" mt="8">
        <Flex justify="space-between">
          {" "}
          <Heading>Banders</Heading>{" "}
          <Button
            onClick={() => {
              onOpen();
              setMode("new");
            }}
            colorScheme="green"
          >
            + Add new
          </Button>
        </Flex>
        {data ? (
          <Taable columns={columns} data={data} clickFunction={openFun} />
        ) : (
          <Flex justify="center">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />{" "}
          </Flex>
        )}
        <BModal
          setId={setId}
          mutate={mutate}
          isOpen={isOpen}
          onClose={onClose}
          id={id}
          mode={mode}
          setMode={setMode}
        />
      </Box>
    </>
  );
}

function BModal({ mutate, setId, isOpen, onClose, id, mode, setMode }) {
  const idData = { id: id };
  const [editMode, setEditMode] = useState(false);
  const { error, data } = useSWR(["/api/get_bander_id", id], poster);

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onClose={() => {
        onClose(), setEditMode(false), setMode(), mutate();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        {mode === "new" ? (
          <>
            <ModalHeader>
              <Flex justify="space-between" align="center">
                Novo anilhador{" "}
              </Flex>
            </ModalHeader>              <ModalCloseButton />


            <BanderForm ></BanderForm>
          </>
        ) : data ? (
          !editMode ? (
            <div>
              <ModalHeader>
                <Flex justify="space-between" align="center">
                  {data.name}{" "}
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <p>
                  <strong>Code:</strong> {data.code}
                </p>

                <p>
                  <strong>Email:</strong> {data.email}
                </p>
                <p>
                  <strong> Telefone:</strong> {data.phone}
                </p>
                <p>
                  <strong> Comentários:</strong> {data.notes}
                </p>
              </ModalBody>
            </div>
          ) : (
            <BanderForm defaultValues={data}></BanderForm>
          )
        ) : (
          <Flex W="100%" mt={8} justify="center">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />{" "}
          </Flex>
        )}
        <ModalFooter>
          <Button mr={4} onClick={() => setEditMode(!editMode)}>
            Edit
          </Button>

          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              onClose(), setEditMode(false), setId(null), mutate();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
