import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m your AI legal assistant. How can I help you with your legal queries today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How to draft a rent agreement?',
    'What is consumer protection act?',
    'Steps to file an FIR',
    'Property dispute guidance',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsTyping(true);

      setTimeout(() => {
        const aiMessage: Message = {
          id: messages.length + 2,
          text: `I understand you're asking about "${inputText}". Based on Indian law, I can help you with that. This is a simulated response. In a real implementation, this would connect to an AI legal knowledge base trained on Indian legal statutes and case law.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              AI Legal Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              Online
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 1 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
              Suggested questions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {suggestedPrompts.map((prompt, index) => (
                <Chip
                  key={index}
                  label={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 1,
            }}
          >
            {message.sender === 'ai' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#00897B',
                  fontSize: '0.9rem',
                }}
              >
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}

            <Paper
              elevation={0}
              sx={{
                maxWidth: '75%',
                px: 2,
                py: 1.5,
                backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                borderRadius: message.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {message.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                  fontSize: '0.7rem',
                }}
              >
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Paper>

            {message.sender === 'user' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.9rem',
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#00897B',
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                backgroundColor: 'grey.100',
                borderRadius: '16px 16px 16px 4px',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'text.secondary',
                      animation: 'pulse 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.4 },
                        '50%': { opacity: 1 },
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          p: 2,
          backgroundColor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton size="small" sx={{ mb: 0.5 }}>
            <AttachFileIcon />
          </IconButton>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask your legal question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.default',
              },
            }}
          />

          <IconButton size="small" color="primary" sx={{ mb: 0.5 }}>
            <MicIcon />
          </IconButton>

          <IconButton
            size="medium"
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
