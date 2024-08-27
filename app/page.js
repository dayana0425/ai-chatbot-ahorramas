"use client";

import { Box, Stack, TextField, Button, MenuItem, Select, FormControl, InputLabel, } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const getInitialMessages = (language) => {
    const messages = {
      en: "Hello! I'm here to help you with managing your finances. While I'm not a professional advisor, I can guide you through basic financial concepts. How can I assist you today?",
      es: "¡Hola! Estoy aquí para ayudarte a manejar tus finanzas. Aunque no soy una asesora profesional, puedo guiarte en conceptos básicos de finanzas. ¿En qué puedo asistirte hoy?",
    };

    return [
      {
        role: "assistant",
        content: messages[language],
      },
    ];
  };

  const [language, setLanguage] = useState("es");
  const [messages, setMessages] = useState(() => getInitialMessages("es"));
  const [message, setMessage] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);

  const presetQuestions = {
    en: [
      "How should I prioritize my expenses after getting paid?",
      "What steps can I take to create an effective budget?",
      "What are the best ways to start investing for retirement?",
      "How can I efficiently save for a down payment on a house?",
    ],
    es: [
      "¿Cómo debo priorizar mis gastos después de que me paguen?",
      "¿Qué pasos puedo seguir para crear un presupuesto efectivo?",
      "¿Cuáles son las mejores formas de comenzar a invertir para la jubilación?",
      "¿Cómo puedo ahorrar de manera eficiente para el pago inicial de una casa?",
    ],
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setMessages(getInitialMessages(selectedLanguage));
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setConversationStarted(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("Current language:", language);
    
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: language === "en" 
            ? "An error occurred. Please refresh the page and try again." 
            : "Ocurrió un error. Por favor, actualiza la página y vuelve a intentarlo.",
        },
      ]);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "linear-gradient(135deg, #FF5F6D, #FFC371)",
        padding: "16px",
      }}
    >
      <Stack
        direction={"column"}
        width={{ xs: "100%", sm: "90%", md: "500px" }}
        height={{ xs: "100%", sm: "90%", md: "700px" }}
        border="1px solid #ccc"
        p={2}
        spacing={3}
        sx={{
          borderRadius: "16px",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
          backgroundColor: "#FFFFFFCC",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <Select
          value={language}
          onChange={handleLanguageChange}
          variant="outlined"
          disabled={conversationStarted} // Disable language selection after the conversation starts
          sx={{
            mb: 2,
            bgcolor: "#FFFFFF99",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
          }}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Español</MenuItem>
        </Select>

        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FF5F6D",
              borderRadius: "8px",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={12}
                p={4}
                sx={{
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease",
                  marginLeft: 2,
                  marginRight: 2,
                  marginTop: 2,
                  padding: "24px",

                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        <Stack direction={"column"} spacing={2}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel htmlFor="preset-question">
              {language === "en" ? "Choose a question" : "Elige una pregunta"}
            </InputLabel>
            <Select
              label="Choose a question"
              value=""
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF99",
                  backdropFilter: "blur(10px)",
                  paddingRight: "32px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FF5F6D",
                },
                "@media (max-width: 600px)": {
                  "& .MuiSelect-select": {
                    padding: "12px 14px",
                    fontSize: "14px",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                    "@media (max-width: 600px)": {
                      width: "100%",
                      fontSize: "14px",
                    },
                  },
                },
              }}
              inputProps={{
                id: "preset-question",
              }}
            >
              {presetQuestions[language].map((question, index) => (
                <MenuItem
                  key={index}
                  value={question}
                  sx={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontSize: "14px",
                    padding: "10px 14px",
                  }}
                >
                  {question}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={
              language === "en"
                ? "Type your message here"
                : "Escribe tu mensaje aquí"
            }
            fullWidth
            rows={4}
            multiline
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "8px",
                backgroundColor: "#FFFFFF99",
                backdropFilter: "blur(10px)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#FF5F6D",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              backgroundColor: "#FF5F6D",
              backgroundImage: "linear-gradient(135deg, #FF5F6D, #FFC371)",
              color: "white",
              "&:hover": {
                backgroundColor: "#FF5F6D",
                backgroundImage: "linear-gradient(135deg, #FFC371, #FF5F6D)",
              },
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
