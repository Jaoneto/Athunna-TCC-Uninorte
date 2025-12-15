import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  isVerified: boolean;
}

const generateCaptcha = () => {
  const operations = ['+', '-', 'x'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number, num2: number, answer: number;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      break;
    case 'x':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer: answer.toString(),
  };
};

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onVerify, isVerified }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setUserAnswer('');
    setError(false);
    onVerify(false);
  }, [onVerify]);

  const handleVerify = () => {
    const isCorrect = userAnswer.trim() === captcha.answer;
    setError(!isCorrect);
    onVerify(isCorrect);
    
    if (!isCorrect) {
      // Generate new captcha after wrong answer
      setTimeout(() => {
        refreshCaptcha();
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
          Verificação concluída
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-muted/50 border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Verificação de Segurança
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refreshCaptcha}
          className="h-8 w-8 p-0"
          title="Gerar novo desafio"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-md text-center">
            <span className="text-lg font-mono font-bold text-primary select-none">
              {captcha.question}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Resposta"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
            onKeyDown={handleKeyDown}
            className={`text-center ${error ? 'border-destructive' : ''}`}
            maxLength={4}
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleVerify}
          disabled={!userAnswer.trim()}
        >
          Verificar
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">
          Resposta incorreta. Tente novamente.
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Resolva a operação matemática para continuar
      </p>
    </div>
  );
};

export default SimpleCaptcha;
