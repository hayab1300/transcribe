
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActionButton } from './components/ActionButton';
import { MicrophoneIcon, StopIcon, SaveIcon, AlertTriangleIcon, InfoIcon } from './components/IconComponents';
import { type SpeechRecognition, type SpeechRecognitionEvent, type SpeechRecognitionErrorEvent } from './types';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Clicca "Inizia Trascrizione" per cominciare.');
  const [error, setError] = useState<string | null>(null);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState<boolean>(false);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const SpeechRecognitionSvc = useRef<any>(null); // To store SpeechRecognition constructor

  useEffect(() => {
    SpeechRecognitionSvc.current = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionSvc.current) {
      setShowUnsupportedMessage(true);
      setError("L'API di Riconoscimento Vocale non è supportata nel tuo browser. Prova Chrome o Edge.");
      setStatusMessage("Riconoscimento Vocale non supportato.");
    }
  }, []);

  const handleListen = useCallback(() => {
    if (!SpeechRecognitionSvc.current) {
      setShowUnsupportedMessage(true);
      setError("L'API di Riconoscimento Vocale non è supportata.");
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      setStatusMessage('Trascrizione fermata. Clicca "Inizia Trascrizione" per riprendere.');
      return;
    }

    setIsListening(true);
    setError(null);
    setInterimTranscript('');
    // setTranscript(''); // Decommenta se vuoi cancellare la trascrizione precedente al nuovo avvio
    setStatusMessage('In ascolto... Parla nel microfono.');

    const recognition = new SpeechRecognitionSvc.current();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'it-IT'; // Default to Italian, can be changed or made configurable

    recognition.onstart = () => {
      console.log('Riconoscimento vocale avviato');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscriptChunk = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const segment = event.results[i];
        if (segment.isFinal) {
          finalTranscriptChunk += segment[0].transcript + ' ';
        } else {
          currentInterim += segment[0].transcript;
        }
      }
      if (finalTranscriptChunk) {
        setTranscript(prev => prev + finalTranscriptChunk);
        setInterimTranscript(''); // Cancella l'interim quando il finale è processato
      }
      if (currentInterim) {
         setInterimTranscript(currentInterim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Errore riconoscimento vocale', event.error, event.message);
      let errorMessage = `Errore: ${event.error}.`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Accesso al microfono negato. Consenti l\'accesso al microfono nelle impostazioni del browser.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'Nessun discorso rilevato. Prova a parlare più forte o più vicino al microfono.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Microfono non disponibile. Assicurati che sia connesso e non in uso da un\'altra applicazione.';
      }
      setError(errorMessage);
      setIsListening(false);
      setStatusMessage('Si è verificato un errore. Trascrizione fermata.');
    };

    recognition.onend = () => {
      console.log('Riconoscimento vocale terminato');
      // Aggiorna lo stato solo se non è stato un errore a impostare già un messaggio
      if (isListening && !error) { // se isListening è ancora true, significa che si è fermato inaspettatamente
         setStatusMessage('Ascolto interrotto inaspettatamente. Clicca "Inizia" per riprovare.');
      }
      setIsListening(false); // Assicura che lo stato di ascolto sia false
      speechRecognitionRef.current = null;
    };
    
    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Errore durante l'avvio del riconoscimento: ", e);
      setError("Impossibile avviare il microfono. Potrebbe essere in uso o non configurato.");
      setIsListening(false);
      setStatusMessage("Errore durante l'avvio della trascrizione.");
    }

  }, [isListening, error]); // Aggiunto error alle dipendenze per assicurare che la logica di onend sia corretta

  const handleSaveTranscript = () => {
    if (!transcript.trim() && !interimTranscript.trim()) {
      setError("Niente da salvare. La trascrizione è vuota.");
      return;
    }
    const completeTranscript = transcript + interimTranscript; // Salva finale + qualsiasi interim rimanente
    const blob = new Blob([completeTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trascrizione.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage('Trascrizione salvata!');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-100">
      <div className="w-full max-w-3xl bg-gray-800 shadow-2xl rounded-lg p-6 md:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-sky-400">Trascrittore Microfono Live</h1>
          <p className="text-gray-400 mt-2">
            Trascrizione audio in tempo reale utilizzando il tuo microfono.
          </p>
        </header>

        {showUnsupportedMessage && (
           <div className="mb-4 p-3 bg-red-700 border border-red-500 rounded-md text-sm text-white flex items-center">
             <AlertTriangleIcon className="h-5 w-5 mr-2" />
             {error}
           </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <ActionButton
            onClick={handleListen}
            disabled={showUnsupportedMessage}
            className={`w-full ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500'
            }`}
          >
            {isListening ? (
              <>
                <StopIcon className="h-5 w-5 mr-2" /> Ferma Trascrizione
              </>
            ) : (
              <>
                <MicrophoneIcon className="h-5 w-5 mr-2" /> Inizia Trascrizione
              </>
            )}
          </ActionButton>
          <ActionButton
            onClick={handleSaveTranscript}
            disabled={(!transcript.trim() && !interimTranscript.trim()) || isListening}
            className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:opacity-50"
          >
            <SaveIcon className="h-5 w-5 mr-2" /> Salva Trascrizione
          </ActionButton>
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-md text-sm text-gray-300 flex items-center">
            {isListening ? <MicrophoneIcon className="h-5 w-5 mr-2 text-red-500 animate-pulse" /> : <InfoIcon className="h-5 w-5 mr-2 text-sky-400" />}
            <span>{statusMessage}</span>
        </div>

        {error && !showUnsupportedMessage && (
          <div className="mb-4 p-3 bg-red-700 border border-red-500 rounded-md text-sm text-white flex items-center">
            <AlertTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="bg-gray-750 p-4 rounded-lg shadow-inner min-h-[200px] max-h-[40vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Trascrizione:</h2>
          <p className="whitespace-pre-wrap break-words text-gray-200">
            {transcript}
            {interimTranscript && <span className="text-gray-400 italic">{interimTranscript}</span>}
            {(!transcript && !interimTranscript && !isListening && !error) && <span className="text-gray-500">Il testo trascritto apparirà qui...</span>}
          </p>
        </div>
        
        <footer className="mt-6 text-center text-xs text-gray-500">
          <p>Questa app trascrive l'audio dal tuo microfono. Per l'audio di sistema, assicurati che il microfono possa captare l'output degli altoparlanti o usa un software di routing audio.</p>
          <p>L'accuratezza della trascrizione dipende dalla qualità del microfono, dal rumore di fondo e dalla chiarezza del parlato.</p>
           <p className="mt-2">Per risultati ottimali, usa Chrome o Edge su desktop. Lingua: Italiano (it-IT) - creator: Marco Ferrari @ARL.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
