import { useEffect, useState } from "react";
import { CheckCircle, Heart } from "lucide-react";

interface WelcomeMessageProps {
  type: 'welcome' | 'goodbye';
  userName: string;
  onComplete?: () => void;
}

const WelcomeMessage = ({ type, userName, onComplete }: WelcomeMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Aguarda a animação de saída
      }
    }, type === 'welcome' ? 6000 : 4000); // ✅ Eko: 6s para login, 4s para logout

    return () => clearTimeout(timer);
  }, [onComplete, type]);

  if (!isVisible) return null;

  const welcomeContent = {
    welcome: {
      icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />,
      title: `Bem-vindo, ${userName}!`,
      message: "Acesso autorizado com sucesso",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
    goodbye: {
      icon: <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />,
      title: `Obrigado, ${userName}!`,
      message: "Por lutar pelos animais",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800"
    }
  };

  const content = welcomeContent[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${content.bgColor} ${content.borderColor} border-2 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {content.icon}
        <h2 className={`text-2xl font-bold ${content.textColor} mb-2`}>
          {content.title}
        </h2>
        <p className={`${content.textColor} opacity-80`}>
          {content.message}
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;