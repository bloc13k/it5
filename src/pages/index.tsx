import type { NextPage } from 'next'
import abi from '../components/ABIs/v2Router.json';
import erc20Abi from '../components/ABIs/erc20.json'
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent }= require('@bloc13k/v2-sdk');

import Head from 'next/head'
import {
  Select,
  ButtonGroup,
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  VStack,
  Text
} from '@chakra-ui/react';

import { useState, useEffect} from 'react'
import {ethers} from "ethers"
import { CurrencyAmount } from '@bloc13k/v2-sdk';

declare let window:any

const Home: NextPage =  () => {

  const [optionsInfo, setOptionsInfo] = useState({
    slippage: '',
    deadline: "",
  });
  const [optionsAddInfo, setOptionsAddInfo] = useState({
    slippage: '',
    deadline: "",
  });
  const [token0Info, setToken0Info] = useState({
    amount: '',
    address: "",
  });
  const [token0AddInfo, setToken0AddInfo] = useState({
    amount: '',
    address: "",
  });
  const [token1Info, setToken1Info] = useState({
    amount: '',
    address: "",
  });
  const [token1AddInfo, setToken1AddInfo] = useState({
    amount: '',
    address: "",
  });
  //change handlers
  const optionsHandleChange = (event) => {
    setOptionsInfo((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
   })
  };
  const optionsAddHandleChange = (event) => {
    //add
    setOptionsAddInfo((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
  })
};
  const token0HandleChange = (event) => {
    setToken0Info((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
   })
  };
  const token0AddHandleChange = (event) => {
    //add
    setToken0AddInfo((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
   })
  };
  const token1HandleChange = (event) => {
    setToken1Info((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
   })
  };
  const token1AddHandleChange = (event) => {
    //add
    setToken1AddInfo((prevalue) => {
      return {
          ...prevalue,
          [event.target.name]: event.target.value
      }      
   })
  };
  
//
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()
  const [signer, setSigner] = useState<any | undefined>()
  const [provider, setProvider] = useState<any | undefined>()
  const [quote, setQuote] = useState<any | undefined>()

  
  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    if(!window.ethereum) return
    const my_provider = new ethers.providers.Web3Provider(window.ethereum)
    my_provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
      setProvider(my_provider)
      setSigner(my_provider.getSigner())
    })
    my_provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    })
  },[currentAccount])

  const onClickConnect = () => {
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch((e)=>console.log(e))
  }
  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  const routerAddress = "0x986e234F3edA0d6CACF32A3A1761bA37013f80aF";
  const IT5Address = '0x83162b5f83535e927cc02efC3Fb57065c7f5a98C'
  const chain4id = ChainId.RINKEBY
  const deadline = '87656767621';

  const allowanceAdd = async () => {
    const token0contract = new ethers.Contract(token0AddInfo.address, erc20Abi.output.abi, signer);
     await token0contract.approve(routerAddress,ethers.utils.parseUnits('10000' ,18))
     const token1contract = new ethers.Contract(token1AddInfo.address, erc20Abi.output.abi, signer);
     await token1contract.approve(routerAddress, ethers.utils.parseUnits('10000',18) )
  }
  const allowance = async () => {
    const token0contract = new ethers.Contract(token0Info.address, erc20Abi.output.abi, signer);
     await token0contract.approve(routerAddress,ethers.utils.parseUnits('10000' ,18))
     const token1contract = new ethers.Contract(token1Info.address, erc20Abi.output.abi, signer);
     await token1contract.approve(routerAddress, ethers.utils.parseUnits('10000' ,18) )
  }
//
  const quoteInit = async () => {
    const token = await Fetcher.fetchTokenData(chain4id, token1Info.address, provider);
    const weth = WETH[chain4id];
    const pair = await Fetcher.fetchPairData(token, weth, provider);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther(token0Info.amount)), TradeType.EXACT_INPUT);  
    const outputAmount = trade.outputAmount.raw;
    setQuote(ethers.utils.formatEther(outputAmount.toString()));
  }
//
  const swapETHInit = async () => {
    const contract = new ethers.Contract(routerAddress, abi.output.abi, signer);
    const token = await Fetcher.fetchTokenData(chain4id, token1Info.address, provider);
    const weth = WETH[chain4id];
    const pair = await Fetcher.fetchPairData(token, weth, provider);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther(token0Info.amount)), TradeType.EXACT_INPUT);      
    const slippageTolerance = new Percent(optionsInfo.slippage); // 0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
    const path = [weth.address, token.address];
    const inputAmount = trade.inputAmount.raw;
    const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 
    const gasPrice = await provider.getGasPrice();
    const tx = await contract.swapExactETHForTokens(
      amountOutMinHex,
      path,
      currentAccount,
      deadline,
      { 
          value: inputAmountHex, 
          gasPrice: gasPrice.toHexString(),
          gasLimit: ethers.BigNumber.from(500000).toHexString()
      }
  );
}
const swapTokenInit = async () => {
    const contract = new ethers.Contract(routerAddress, abi.output.abi, signer);
    const token = await Fetcher.fetchTokenData(chain4id, token0Info.address, provider);
    const weth = WETH[chain4id];
    const pair = await Fetcher.fetchPairData(token, weth, provider);
    const route = new Route([pair], weth);
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther(token0Info.amount)), TradeType.EXACT_INPUT);      
    const slippageTolerance = new Percent('50', '10000'); 
    const amountOutMinHex = ethers.BigNumber.from('1000000'.toString()).toHexString();
    const path = [IT5Address, weth.address];
    const inputAmount = trade.inputAmount.raw;
    const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 
    const gasPrice = await provider.getGasPrice();
    const tx = await contract.swapExactTokensForETH(
      inputAmountHex,
      amountOutMinHex,
      path,
      currentAccount,
      deadline,
      { 
          gasPrice: gasPrice.toHexString(),
          gasLimit: ethers.BigNumber.from(500000).toHexString()
      }
  );
}
//
  const addLiquidityInit = async () => {  
    const contract = new ethers.Contract('0x986e234F3edA0d6CACF32A3A1761bA37013f80aF', abi.output.abi, signer);
    const tokenDesired = ethers.utils.parseEther(token1AddInfo.amount);
    const ethInput = ethers.utils.parseEther(token0AddInfo.amount);
    provider.getCode(routerAddress);
    const unTx = await contract.populateTransaction.addLiquidityETH(
      token1AddInfo.address,
      tokenDesired.toHexString(),
      tokenDesired.div('1000000000').toHexString(),
      ethInput.div('1000000000').toHexString(),
      currentAccount,
      deadline,
      {
        value: ethInput.toHexString()
      }
    )
    const gas_limit = '5000000';
    const gas_Price = unTx.gasPrice;
    
    const tx = await contract.addLiquidityETH(
      token1AddInfo.address,
      tokenDesired.toHexString(),
      tokenDesired.div('1000000').toHexString(),
      ethInput.div('1000000').toHexString(),
      currentAccount,
      deadline,
      {
        gasPrice: gas_Price,
        gasLimit: gas_limit,
        value: ethInput.toHexString()
      }
    )
    await tx.wait();
  }
  //
 
  //
  return (
    <>
      <Head>
        <title>IT5</title>
      </Head>
      <VStack>
        <Box w='100%' my={1} >
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account:{currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Connect MetaMask
              </Button>
        }
        </Box>
        {currentAccount  
          ?<Box bg={'blackAlpha.600'} textColor={'gray.100'} mb={0} p={2} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={3}  fontSize='xl'>Account info</Heading>
          <Text>ETH Balance of current account : {balance}</Text>
          <Text>Chain : {chainname}</Text>
        </Box>
        :<></>
        }
      </VStack>
      <VStack>
      <Flex width="full"  bg='blackAlpha.400' align="center" justifyContent="center" >
        
        <Box my={6} textAlign="left">
          <form>
            <Box bg='white' w='100%' p={2} >
            <Box bg='white' w='100%' p={2} >
                <FormControl>
                    <HStack spacing='12px'>
                     <Input type="number" size='sm' name="slippage" color='blackAlpha.900'  _placeholder={{ color: 'inherit' }} onChange={optionsHandleChange} placeholder="Slippage" value={optionsInfo.slippage} />
                  </HStack>
                </FormControl>
            </Box>
            <FormControl>
                <HStack spacing='33px'>
                    <FormLabel>Token0</FormLabel>
                    <Select  color='blackAlpha.900'  _placeholder={{ color: 'inherit' }}  placeholder='Select Token' size='md' name='address' onChange={token0HandleChange} value={token0Info.address}>
                        <option value='0xc778417E063141139Fce010982780140Aa0cD5Ab'>WETH</option>
                        <option value='0x83162b5f83535e927cc02efC3Fb57065c7f5a98C'>IT5</option>
                    </Select>
                    <Input type="number" size='md' name='amount' placeholder="Input" color='blackAlpha.900'  _placeholder={{ color: 'inherit' }} onChange={token0HandleChange} value={token0Info.amount}/>
                </HStack>
            </FormControl>
            </Box>            
            <Box bg='white' w='100%' p={2} >
            <FormControl>
                <HStack spacing='33px'>
                    <FormLabel>Token1</FormLabel>
                    <Select size='md' fontSize={'sm'} color='blackAlpha.900'  _placeholder={{ color: 'inherit' }}  placeholder='Select Token' name='address'  onChange={token1HandleChange} value={token1Info.address}>
                        <option value='0xc778417E063141139Fce010982780140Aa0cD5Ab'>WETH</option>
                        <option value='0x83162b5f83535e927cc02efC3Fb57065c7f5a98C'>IT5</option>
                    </Select>     
                    <Box bg='white' w='100%' p={1} >
                <Text align='start' fontSize='14px' color='blackAlpha.800' isTruncated>
                    Quote for token output : {quote}
                    </Text>    
                    </Box>
                </HStack>


            </FormControl>
            </Box>
            <Box bg='white' w='100%' p={2} >

                    <ButtonGroup size={'sm'} variant='ghost' spacing='3'>
                    <Button onClick={quoteInit} colorScheme='pink'>Quote</Button>
                    <Button onClick={allowance} colorScheme='whatsapp'>Approve</Button>
                    <Button onClick={swapETHInit} colorScheme='facebook'>SwapETHForToken</Button>
                    <Button onClick={swapTokenInit} colorScheme='facebook'>SwapTokenForETH</Button>
                    </ButtonGroup>
                    </Box>

          </form>
        </Box>
    </Flex>
    <Flex width="full"  bg='blackAlpha.400' align="center" justifyContent="center" >
        <Box my={6} textAlign="left" >
          <form>
            <Box bg='white'  p={2} >
            <Box bg='white' p={2} >
            </Box>
            <FormControl>
                <HStack spacing='24px'>
                    <FormLabel>Token0</FormLabel>
                    <Select color='blackAlpha.900'  _placeholder={{ color: 'inherit' }}  placeholder='Select Token' name='address' size='md' onChange={token0AddHandleChange} value={token0AddInfo.address}>
                        <option value='0xc778417E063141139Fce010982780140Aa0cD5Ab'>WETH</option>
                    </Select>
                    <Input type="number" color='oblackAlpha.900'  _placeholder={{ color: 'inherit' }} name='amount' placeholder="Input" onChange={token0AddHandleChange} value={token0AddInfo.amount} />
                </HStack>
            </FormControl>
            </Box> 
            <Box bg='white' w='100%' p={2} >
            <FormControl>
                <HStack spacing='24px'>
                    <FormLabel>Token1</FormLabel>
                    <Select color='blackAlpha.900'  _placeholder={{ color: 'inherit' }}  placeholder='Select Token' name='address' size='md' onChange={token1AddHandleChange} value={token1AddInfo.address}>
                        <option value='0x83162b5f83535e927cc02efC3Fb57065c7f5a98C'>IT5</option>
                    </Select>
                    <Input type="number" color='blackAlpha.900'  _placeholder={{ color: 'inherit' }} placeholder="Input" name='amount' onChange={token1AddHandleChange} value={token1AddInfo.amount}/>
                </HStack>
            </FormControl>
            </Box>
            <Box bg='white' w='100%' p={2} >
                    <ButtonGroup size={'sm'} variant='ghost' spacing='3'>
                    <Button onClick={allowanceAdd} colorScheme='whatsapp'>Approve</Button>
                    <Button onClick={addLiquidityInit} colorScheme='facebook'>Add liquidity</Button>
                    </ButtonGroup>
            </Box>

          </form>
        </Box>
    </Flex> 
      </VStack>
    </>
  )
}

export default Home


