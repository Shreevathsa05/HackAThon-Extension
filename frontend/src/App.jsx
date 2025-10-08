import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { SessionContext } from './SessionContext';
import Chat from './pages/Chat';
import Summary from './pages/Summary';
import Upcoming from './pages/Upcoming';
import Header from './components/Header';
import FlashCard from './FlashCard';

function App() {
  const { sessionData } = useContext(SessionContext);

  return (
    <BrowserRouter>
      {/* Header with sessionData */}
      <Header sessionData={sessionData} />

      <Routes>
        {/* Redirect "/" to chat (new home) */}
        <Route path="/" element={<Navigate to={`/${sessionData}/chat`} replace />} />

        {/* Session-specific routes */}
        <Route path="/:session/chat" element={<Chat sessionData={sessionData} />} />
        <Route path="/:session/summary" element={<Summary sessionData={sessionData} />} />
        <Route path="/:session/flashcards" element={<FlashCard sessionData={sessionData} />} />
        <Route path="/:session/ppt" element={<Upcoming sessionData={sessionData} />} />
        <Route path="/:session/video" element={<Upcoming sessionData={sessionData} />} />

        {/* Catch-all: redirect to chat */}
        <Route path="*" element={<Navigate to={`/${sessionData}/chat`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
