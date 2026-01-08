import { useState } from "react";
import { CheckCircle, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeMessageProps {
  type: 'welcome' | 'goodbye';
  userName: string;
  onComplete?: () => void;
}

const WelcomeMessage = ({ type, userName, onComplete }: WelcomeMessageProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNextMessage = () => {
    if (type === 'welcome' && currentMessage === 0) {
      // Passar para a segunda mensagem
      setCurrentMessage(1);
    } else {
      // Finalizar e fechar
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Aguarda a animação de saída
      }
    }
  };

  if (!isVisible) return null;

  const welcomeMessages = [
    {
      icon: <Shield className="h-16 w-16 text-emerald-600 mx-auto mb-4" />,
      title: "Não Morremos nem que nos Matem!",
      message: "O nosso lema de resistência e dedicação",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      buttonText: "Continuar"
    },
    {
      icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />,
      title: `Bem-vindo, ${userName}!`,
      message: "Acesso autorizado com sucesso",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      buttonColor: "bg-green-600 hover:bg-green-700",
      buttonText: "Entrar no Sistema"
    }
  ];

  const goodbyeContent = {
    icon: <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />,
    title: `Obrigado, ${userName}!`,
    message: "Por lutar pelos animais",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    buttonColor: "bg-red-600 hover:bg-red-700",
    buttonText: "OK"
  };

  const content = type === 'welcome' ? welcomeMessages[currentMessage] : goodbyeContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full ${content.bgColor} ${content.borderColor} border-2 rounded-lg shadow-2xl transform transition-all duration-300 scale-100`}>
        <div className="p-8 text-center">
          {content.icon}
          <h2 className={`text-2xl font-bold ${content.textColor} mb-4`}>
            {content.title}
          </h2>
          <p className={`${content.textColor} mb-6 text-lg`}>
            {content.message}
          </p>
          <Button 
            onClick={handleNextMessage}
            className={`${content.buttonColor} text-white px-8 py-2 rounded-lg font-semibold transition-colors duration-200`}
          >
            {content.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;