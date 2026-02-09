'use client';

import WordCard from './WordCard';
import CompleteDisplay from './CompleteDisplay';
import ArticlePanel from './ArticlePanel';
import PersonalWordForm from './PersonalWordForm';
import { useGameLogic } from '@/app/hooks/useGameLogic';
import { useState } from 'react';

interface GameBoardProps {
  userId: string;
}

export default function GameBoard({ userId }: GameBoardProps) {
  const {
    currentWord,
    guessedLetters,
    incorrectGuesses,
    isCompleted,
    isFailed,
    failedWords,
    error,
    startNewGame,
  } = useGameLogic(userId);

  const [showArticle, setShowArticle] = useState(false);
  const [showPersonalWord, setShowPersonalWord] = useState(false);

  if (!currentWord) return <p>No words available.</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

      {error && <p className="text-red-600">{error}</p>}

      <WordCard
        word={currentWord.word}
        guessedLetters={
          isFailed
            ? new Set(currentWord.word.toUpperCase().split(''))
            : guessedLetters
        }
        meaning={currentWord.meaning}
      />

      {(isCompleted || isFailed) && (
        <CompleteDisplay
          word={currentWord.word}
          meaning={currentWord.meaning}
          examples={currentWord.examples}
          failed={isFailed}
        />
      )}

      {failedWords.length > 0 && !showArticle && (
        <button onClick={() => setShowArticle(true)}>
          Generate Article
        </button>
      )}

      {showArticle && (
        <ArticlePanel
          failedWords={failedWords}
          onClose={() => setShowArticle(false)}
        />
      )}

      <button onClick={() => setShowPersonalWord(p => !p)}>
        {showPersonalWord ? 'Close Form' : 'Add Your Word'}
      </button>

      {showPersonalWord && <PersonalWordForm userProfile={userId} />}

      <button onClick={startNewGame}>
        {isCompleted || isFailed ? 'Start New Game' : 'Next Word'}
      </button>

      <div>
        Incorrect: {incorrectGuesses.length} / {currentWord.word.length + 3}
      </div>
    </div>
  );
}
