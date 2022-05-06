import React, { ReactNode } from 'react'
import { Text, Center, Container, useColorModeValue } from '@chakra-ui/react'
import Header from './header'

type Props = {
  children: ReactNode
}

export function Layout(props: Props) {
  return (
    <div>
      <Header />
      <Container maxW="container.md" py='8' >
        {props.children}
      </Container>
      <Center as="footer" bg={useColorModeValue('gray', 'gray')} p={2}>
          <Text fontSize="md">IT5Swap 2022</Text>
      </Center>
    </div>
  )
}