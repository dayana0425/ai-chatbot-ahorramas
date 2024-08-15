'use client'

import { Box, Stack, TextField, Button } from '@mui/material';
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey there! 💖 I'm your fun and fabulous friend here to help you out! What's on your mind today? 😊",
    },
  ]);
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }


  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}

useEffect(() => {
  scrollToBottom()
}, [messages])


return (
  <Box
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    sx={{
      background: 'linear-gradient(135deg, #FF5F6D, #FFC371)',
    }}
  >
    <Stack
      direction={'column'}
      width="500px"
      height="700px"
      border="1px solid #ccc"
      p={2}
      spacing={3}
      sx={{
        borderRadius: '16px',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#FFFFFFCC',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack
        direction={'column'}
        spacing={2}
        flexGrow={1}
        overflow="auto"
        maxHeight="100%"
        sx={{
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#FF5F6D',
            borderRadius: '8px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={
              message.role === 'assistant' ? 'flex-start' : 'flex-end'
            }
          >
            <Box
              bgcolor={
                message.role === 'assistant'
                  ? 'primary.main'
                  : 'secondary.main'
              }
              color="white"
              borderRadius={16}
              p={3}
              sx={{
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              {message.content}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Stack>
      <Stack direction={'row'} spacing={2}>
        <TextField
          label="Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '8px',
              backgroundColor: '#FFFFFF99',
              backdropFilter: 'blur(10px)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF5F6D',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            backgroundColor: '#FF5F6D',
            backgroundImage: 'linear-gradient(135deg, #FF5F6D, #FFC371)',
            color: 'white',
            '&:hover': {
              backgroundColor: '#FF5F6D',
              backgroundImage: 'linear-gradient(135deg, #FFC371, #FF5F6D)',
            },
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
          }}
        >
          Send
        </Button>
      </Stack>
    </Stack>
  </Box>
);
}