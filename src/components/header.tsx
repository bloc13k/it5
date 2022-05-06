import NextLink from "next/link"
import { Flex, useColorModeValue, Heading, LinkBox, LinkOverlay } from '@chakra-ui/react'

const siteTitle="IT5 AMM / deployed on Rinkbey testnet"
export default function Header() {

  return (
    <Flex as='header' bg={useColorModeValue('gray.100', 'gray.900')} p={4} alignItems='center'>
      <LinkBox>
        <NextLink href={'/'} passHref>
          <LinkOverlay>
          <Heading isTruncated size="sm">
          {siteTitle}
          </Heading>
          </LinkOverlay>
        </NextLink>
      </LinkBox>      
    </Flex>
  )
}