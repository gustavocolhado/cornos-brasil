'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaFire, FaPlay, FaEye, FaHeart, FaClock, FaUsers, FaVideo, FaSearch, FaCrown, FaTags, FaThLarge, FaComments, FaUpload, FaPlus, FaUserCircle, FaCheck, FaArrowRight, FaCopy, FaSpinner, FaTimes, FaUnlock, FaShieldAlt, FaMobile, FaCalendarAlt, FaHeadphones, FaChevronLeft, FaChevronRight, FaCreditCard } from 'react-icons/fa';
import Image from 'next/image';
import Container from '@/components/Container';
import QRCode from 'qrcode';


interface Plan {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  popular?: boolean;
  savings?: string;
}

interface PixResponse {
  id: string;
  qr_code: string;
  status: string;
  value: number;
  qr_code_base64: string;
}

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<{
    source: string;
    campaign: string;
    referrer: string;
  } | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Capturar dados da campanha da URL
  useEffect(() => {
    const captureCampaignData = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer;
      
      // Capturar parâmetros da campanha
      const source = urlParams.get('source') || urlParams.get('ref') || urlParams.get('utm_source');
      const campaign = urlParams.get('campaign') || urlParams.get('utm_campaign') || urlParams.get('xclickads');
      const referrerDomain = referrer ? new URL(referrer).hostname : null;
      
      // Se não há parâmetros na URL, usar o referrer
      const finalSource = source || referrerDomain || 'direct';
      const finalCampaign = campaign || 'organic';
      const finalReferrer = referrer || 'direct';
      
      setReferralData({
        source: finalSource,
        campaign: finalCampaign,
        referrer: finalReferrer
      });
      
      // Salvar dados da campanha no localStorage
      const campaignData = {
        source: finalSource,
        campaign: finalCampaign,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: finalReferrer,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content')
      };
      
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      
      // Salvar dados da campanha no servidor
      saveCampaignData(campaignData);
      
      console.log('📊 Campanha capturada:', {
        source: finalSource,
        campaign: finalCampaign,
        referrer: finalReferrer
      });
    };
    
    captureCampaignData();
  }, []);

  // Processar retorno do Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');

    if (success === 'true' && sessionId && email) {
      // Processar retorno do Stripe
      processStripeReturn(sessionId, email);
    } else if (canceled === 'true') {
      // Usuário cancelou o pagamento
      setError('Pagamento cancelado. Tente novamente.');
    }
  }, [email]);

  // Função para salvar dados da campanha
  const saveCampaignData = async (data: any) => {
    try {
      await fetch('/api/campaigns/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Erro ao salvar dados da campanha:', error);
    }
  };

  // Função para processar retorno do Stripe
  const processStripeReturn = async (sessionId: string, userEmail: string) => {
    try {
      const response = await fetch('/api/landing-page/process-stripe-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          email: userEmail
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment Stripe processado:', data);
        // Mostrar formulário de senha após processar payment
        setShowPasswordForm(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao processar pagamento Stripe');
      }
    } catch (error) {
      console.error('❌ Erro ao processar retorno do Stripe:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    }
  };

  // Se o usuário estiver logado, não renderizar a landing page
  if (session) {
    return null;
  }

  const faqData = [
    {
      question: "Minha privacidade e segurança estão garantidas ?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta e não armazenamos dados pessoais sensíveis. Seu acesso é 100% seguro e discreto."
    },
    {
      question: "O conteúdo vale a pena?",
      answer: "Absolutamente! Temos milhares de vídeos exclusivos em qualidade HD, com conteúdo atualizado diariamente. Nossos usuários confirmam que vale cada centavo!"
    },
    {
      question: "O preço é justo?",
      answer: "Sim! Nossos preços são os mais competitivos do mercado. O plano de 3 meses custa apenas R$ 0,22 por dia - menos que um café!"
    },
    {
      question: "É fácil de usar?",
      answer: "Muito fácil! Basta escolher seu plano, fazer o pagamento e você terá acesso imediato. Interface intuitiva e responsiva para todos os dispositivos."
    },
    {
      question: "Posso assistir em todos os meus dispositivos?",
      answer: "Sim! Você pode acessar de qualquer dispositivo: celular, tablet, computador ou smart TV. Seu login funciona em todos os lugares."
    },
    {
      question: "Como é o suporte ao cliente?",
      answer: "Oferecemos suporte 24/7 através do chat e email. Nossa equipe está sempre pronta para ajudar com qualquer dúvida ou problema."
    },
    {
      question: "Tenho que assinar por um longo prazo?",
      answer: "Não! Temos planos flexíveis de 3 dias até vitalício. Você escolhe o que melhor se adapta às suas necessidades, sem compromisso."
    },
    {
      question: "Por que escolher vocês e não outro site?",
      answer: "Somos a plataforma mais confiável e segura do mercado, com conteúdo exclusivo, preços justos e suporte excepcional. Milhares de usuários já nos escolheram!"
    }
  ];

  const plans: Plan[] = [
    {
      id: 'monthly',
      title: 'Mensal',
      price: 50, // R$ 19,90 em centavos
      description: 'Acesso completo por 1 mês',
      popular: false
    },
    {
      id: 'quarterly',
      title: 'Trimestral',
      price: 3290, // R$ 32,90 em centavos
      description: 'Apenas R$ 0,36 por dia - 45% OFF',
      originalPrice: 5970,
      popular: false
    },
    {
      id: 'semiannual',
      title: 'Semestral',
      price: 5790, // R$ 57,90 em centavos
      description: 'Apenas R$ 0,32 por dia - 52% OFF',
      originalPrice: 11940,
      popular: false
    },
    {
      id: 'yearly',
      title: 'Anual',
      price: 9990, // R$ 99,90 em centavos
      description: 'Apenas R$ 0,27 por dia - 58% OFF - MAIS VENDIDO',
      originalPrice: 23880,
      popular: true
    },
    {
      id: 'lifetime',
      title: 'Vitalício',
      price: 49990, // R$ 499,90 em centavos
      description: 'Acesso para sempre - 79% OFF',
      originalPrice: 238800,
      popular: false
    }
  ];

  // Timer para o PIX
  useEffect(() => {
    if (showPixPayment && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPixPayment, timeLeft]);

  // Gerar QR Code quando pixData for atualizado
  useEffect(() => {
    if (pixData && !pixData.qr_code_base64 && pixData.qr_code) {
      generateQRCode(pixData.qr_code);
    }
  }, [pixData]);

  // Função para verificar status do pagamento manualmente
  const checkPaymentStatus = async () => {
    if (!pixData) return;
    
    setIsCheckingPayment(true);
    try {
      const response = await fetch('/api/landing-page/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pixId: pixData.id
        }),
      });

      if (response.ok) {
        const statusData = await response.json();
        if (statusData.paid && !paymentConfirmed) {
          // Pagamento confirmado! Mostrar formulário de senha
          setPaymentConfirmed(true);
          setShowPixPayment(false);
          setShowPasswordForm(true);
        } else {
          alert('Pagamento ainda não foi confirmado. Tente novamente em alguns instantes.');
        }
      } else {
        alert('Erro ao verificar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      alert('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
    setShowPaymentMethod(false);
    setShowPixPayment(false);
    setShowPasswordForm(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPixData(null);
    setPaymentMethod(null);
    setError(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedPlan) return;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obter dados da campanha do localStorage
      const storedCampaignData = localStorage.getItem('campaignData');
      const campaignInfo = storedCampaignData ? JSON.parse(storedCampaignData) : referralData;

      // Criar conta com email
      const response = await fetch('/api/landing-page/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          referralData: campaignInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const accountData = await response.json();
      console.log('✅ Conta criada:', accountData);

      // Salvar userId no localStorage para usar depois
      localStorage.setItem('landingPageUserId', accountData.userId);

      setShowPaymentMethod(true);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: 'pix' | 'card') => {
    setPaymentMethod(method);
    setError(null);
    
    if (method === 'pix') {
      createPixPayment();
    } else if (method === 'card') {
      createStripePayment();
    }
  };

  const createPixPayment = async () => {
    if (!email || !selectedPlan) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Obter dados da campanha do localStorage
      const storedCampaignData = localStorage.getItem('campaignData');
      const campaignInfo = storedCampaignData ? JSON.parse(storedCampaignData) : referralData;
      
      // Criar PIX usando a API específica da LandingPage
      const response = await fetch('/api/landing-page/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: selectedPlan.price,
          email: email,
          planId: selectedPlan.id,
          referralData: campaignInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar PIX');
      }

      const pixResponse: PixResponse = await response.json();
      setPixData(pixResponse);
      setShowPixPayment(true);
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const createStripePayment = async () => {
    if (!email || !selectedPlan) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Obter dados da campanha do localStorage
      const storedCampaignData = localStorage.getItem('campaignData');
      const campaignInfo = storedCampaignData ? JSON.parse(storedCampaignData) : referralData;
      
      // Criar checkout do Stripe usando a API específica da LandingPage
      const response = await fetch('/api/landing-page/create-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          email: email,
          referralData: campaignInfo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar checkout');
      }

      const data = await response.json();
      
      // Não registrar conversão aqui - será feito após definir senha
      console.log('✅ Checkout Stripe criado, redirecionando...');
      
      // Redirecionar para checkout do Stripe
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.qr_code) {
      try {
        await navigator.clipboard.writeText(pixData.qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar:', error);
      }
    }
  };

  // Função para gerar QR Code quando base64 não estiver disponível
  const generateQRCode = async (qrCodeText: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeText, {
        width: 192,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setGeneratedQRCode(qrCodeDataURL);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2).replace('.', ',')}`;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword || !email) return;
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Atualizar senha e ativar premium
      const response = await fetch('/api/landing-page/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          planId: selectedPlan?.id,
          paymentId: pixData?.id || null,
          amount: selectedPlan?.price || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar senha');
      }

      const userData = await response.json();
      
      // Limpar dados do localStorage
      localStorage.removeItem('landingPageUserId');
      localStorage.removeItem('campaignData');
      
      // Sucesso! Redirecionar para a página inicial
      alert('Senha definida e conta ativada com sucesso! Você será redirecionado para a página inicial.');
      router.push('/');
      
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setShowPaymentMethod(false);
    setShowPixPayment(false);
    setShowPasswordForm(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPixData(null);
    setTimeLeft(15 * 60);
    setPaymentConfirmed(false);
    setPaymentMethod(null);
    setError(null);
    setIsCheckingPayment(false);
    setGeneratedQRCode(null);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Funções do Slider
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 9);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 9) % 9);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Função para scroll suave até os planos
  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans-section');
    if (plansSection) {
      plansSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Auto-play do slider
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-black flex flex-col w-full">
      {/* Header Responsivo */}
      <header className="w-full bg-black px-4 py-4 md:px-8 md:py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
                     <div className="text-yellow-400 font-bold text-xl md:text-2xl"><Image src="/imgs/logo.png" alt="Vazadex" width={100} height={100} /></div>
          <div className="flex gap-2 md:gap-4">
            <Link href="/login" className="px-3 py-2 md:px-6 md:py-3 bg-black text-white border border-white rounded text-sm md:text-base font-bold hover:bg-white hover:text-black transition">ENTRAR</Link>
            <button 
              onClick={scrollToPlans}
              className="px-3 py-2 md:px-6 md:py-3 bg-red-600 text-white rounded text-sm md:text-base font-bold hover:bg-red-700 transition"
            >
              ASSINAR AGORA
            </button>
          </div>
        </div>
      </header>

      {/* Preview de Vídeos - Responsivo */}
      <div className="w-full">
        <video src="./cta.webm" className="w-full h-auto max-h-[500px] object-cover" autoPlay muted loop />
      </div>

      {/* Chamada Principal - Responsivo */}
      <div className="px-4 py-6 md:px-8 md:py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-red-500 mb-2">ASSINE JÁ!</h1>
          <p className="text-white text-sm md:text-lg mb-2">EM QUALQUER HORA DO DIA OU DA NOITE! VOCÊ PAGA E JÁ ACESSA IMEDIATAMENTE!</p>
          <h2 className="text-lg md:text-2xl font-bold text-white">LIBERAÇÃO IMEDIATA DO ACESSO!</h2>
        </div>
      </div>

      {/* Plano Selecionado - Se houver */}
      {selectedPlan && (
        <div className="px-4 py-4 md:px-8 md:py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCheck className="text-green-500 text-sm" />
                    <span className="text-green-400 text-sm font-medium">PLANO SELECIONADO</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedPlan.title}</h3>
                  <p className="text-neutral-300 text-sm">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatPrice(selectedPlan.price)}</div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-green-400 text-sm hover:text-green-300 transition"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Seção Promocional com Benefícios */}
       <div className="px-4 py-6 md:px-8 md:py-12">
         <div className="max-w-6xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
             {/* Slider com 9 Imagens */}
             <div className="relative">
               <div className="relative rounded-lg overflow-hidden">
                 <div className="w-full h-96 md:h-[500px] bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg">
                   {/* Container das imagens */}
                   <div className="relative w-full h-full">
                     {/* Imagem 1 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/01.jpg" 
                         alt="Slide 1" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 0}
                       />
                     </div>

                     {/* Imagem 2 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/02.jpg" 
                         alt="Slide 2" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 1}
                       />
                     </div>

                     {/* Imagem 3 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/03.jpg" 
                         alt="Slide 3" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 2}
                       />
                     </div>

                     {/* Imagem 4 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 3 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/04.jpg" 
                         alt="Slide 4" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 3}
                       />
                     </div>

                     {/* Imagem 5 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 4 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/05.jpg" 
                         alt="Slide 5" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 4}
                       />
                     </div>

                     {/* Imagem 6 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 5 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/06.jpg" 
                         alt="Slide 6" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 5}
                       />
                     </div>

                     {/* Imagem 7 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 6 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/07.jpg" 
                         alt="Slide 7" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 6}
                       />
                     </div>

                     {/* Imagem 8 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 7 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/08.jpg" 
                         alt="Slide 8" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 7}
                       />
                     </div>

                     {/* Imagem 9 */}
                     <div className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === 8 ? 'opacity-100' : 'opacity-0'}`}>
                       <Image 
                         src="/imgs/capas/09.jpg" 
                         alt="Slide 9" 
                         fill 
                         className="object-cover"
                         priority={currentSlide === 8}
                       />
                     </div>
                   </div>

                   {/* Setas de navegação */}
                   <button 
                     onClick={prevSlide}
                     className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
                   >
                     <FaChevronLeft className="text-sm" />
                   </button>
                   <button 
                     onClick={nextSlide}
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
                   >
                     <FaChevronRight className="text-sm" />
                   </button>

                   {/* Indicadores de slide */}
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                     {Array.from({ length: 9 }, (_, index) => (
                       <button
                         key={index}
                         onClick={() => goToSlide(index)}
                         className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                           currentSlide === index ? 'bg-white' : 'bg-white/50'
                         }`}
                       />
                     ))}
                   </div>
                 </div>
               </div>
             </div>

             {/* Grid de Benefícios */}
             <div className="bg-black p-6 md:p-8 rounded-lg">
               <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6">
                 {/* Linha 1 */}
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaUnlock className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Liberação de acesso imediata</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaShieldAlt className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">100% Seguro e sem Anuncios</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaMobile className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Compatível com smartphone</p>
                 </div>

                 {/* Linha 2 */}
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaCalendarAlt className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Atualização diária</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaFire className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Conteúdo exclusivo</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaUserCircle className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Sigilo absoluto na hora da compra</p>
                 </div>

                 {/* Linha 3 */}
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaHeadphones className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Suporte Ativo</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaPlay className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Mais de 50.000 conteúdos exclusivos</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FaUsers className="text-white text-xl" />
                   </div>
                   <p className="text-white text-sm font-medium">Acesso ao Canal do Telegram e ao Site</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>



       {/* Planos de Assinatura - Responsivo */}
       <div id="plans-section" className="px-4 py-6 md:px-8 md:py-12">
         <div className="max-w-4xl mx-auto">
           {/* Header dos Planos */}
           <div className="text-center mb-8">
             <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">ESCOLHA SEU PLANO</h2>
             <p className="text-neutral-300 text-sm md:text-base">Planos flexíveis que se adaptam às suas necessidades</p>
           </div>

                     {/* Grid de Planos */}
           <div className="max-w-2xl mx-auto space-y-4">
             {plans.map((plan) => (
               <div 
                 key={plan.id}
                 className={`relative bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-red-500/30 rounded-lg transition-all duration-300 cursor-pointer hover:border-red-500/50 ${
                   selectedPlan?.id === plan.id 
                     ? 'border-green-500 bg-green-900/20' 
                     : ''
                 }`}
                 onClick={() => handlePlanSelect(plan)}
               >

                 {/* Badge Popular */}
                 {plan.popular && (
                   <div className="absolute -top-3 right-4">
                     <div className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold shadow-lg">
                       MAIS VENDIDO
                     </div>
                   </div>
                 )}

                 {/* Conteúdo do Plano */}
                 <div className="flex items-center p-4 md:p-6">
                   {/* Radio Button */}
                   <div className="flex items-center justify-center mr-4">
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                       selectedPlan?.id === plan.id 
                         ? 'border-green-500 bg-green-500' 
                         : 'border-neutral-500'
                     }`}>
                       {selectedPlan?.id === plan.id && (
                         <div className="w-2 h-2 bg-white rounded-full"></div>
                       )}
                     </div>
                   </div>

                   {/* Informações do Plano */}
                   <div className="flex-1">
                     <h3 className="text-lg md:text-xl font-bold text-white mb-1">{plan.title}</h3>
                     <p className="text-neutral-300 text-sm">{plan.description}</p>
                   </div>

                   {/* Preços */}
                   <div className="text-right">
                     {plan.originalPrice && (
                       <div className="text-neutral-400 text-sm line-through mb-1">
                         {formatPrice(plan.originalPrice)}
                       </div>
                     )}
                     <div className="text-2xl md:text-3xl font-bold text-red-500">
                       {formatPrice(plan.price)}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>

          
        </div>
      </div>

             {/* Botão de Ação - Responsivo */}
       <div className="px-4 py-6 md:px-8 md:py-12">
         <div className="max-w-2xl mx-auto">
                       <button 
              onClick={() => handlePlanSelect(plans.find(p => p.popular) || plans[3])} // Seleciona o plano mais popular (anual)
              className="block w-full bg-red-600 text-white font-bold py-4 md:py-6 rounded-lg text-center text-lg md:text-xl hover:bg-red-700 transition shadow-lg"
            >
              ASSINAR AGORA →
            </button>
         </div>
       </div>

      {/* Badges de Confiança - Responsivo */}
      <div className="px-4 py-6 md:px-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center">
            <Image src="/imgs/security.webp" alt="Segurança" width={300} height={82} />
          </div>
        </div>
      </div>

      {/* FAQ - Responsivo */}
      <div className="px-4 py-6 md:px-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-3 md:space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 rounded-xl overflow-hidden hover:border-red-500/30 transition-all duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-neutral-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openFaq === index 
                        ? 'bg-red-500 text-white' 
                        : 'bg-neutral-600 text-neutral-300'
                    }`}>
                      <FaArrowRight className={`text-xs transition-transform duration-300 ${
                        openFaq === index ? 'rotate-90' : ''
                      }`} />
                    </div>
                    <span className="text-white text-base md:text-lg font-medium">{faq.question}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    openFaq === index 
                      ? 'border-red-500 bg-red-500'
                      : 'border-neutral-500'
                  }`}>
                    {openFaq === index && (
                      <FaCheck className="w-3 h-3 text-white mx-auto mt-0.5" />
                    )}
                  </div>
                </button>
                
                {/* Resposta */}
                <div className={`overflow-hidden transition-all duration-500 mt-2 ease-in-out ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
                    <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-l-4 border-red-500 rounded-r-lg p-4">
                      <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA após FAQ */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Ainda tem dúvidas?</h3>
              <p className="text-neutral-300 text-sm md:text-base mb-4">
                Nossa equipe está pronta para ajudar! Entre em contato conosco.
              </p>
                                                           <button 
                  onClick={() => handlePlanSelect(plans.find(p => p.popular) || plans[3])}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg"
                >
                  ASSINAR AGORA
                </button>
            </div>
          </div>
        </div>
      </div>

             {/* Footer - Responsivo */}
       <footer className="w-full bg-gradient-to-b from-neutral-900 to-black border-t border-red-500/20 py-8 md:py-12 px-4 md:px-8">
         <div className="max-w-6xl mx-auto">
           {/* Logo e Informações Principais */}
           <div className="text-center mb-8 md:mb-12">
             <div className="flex justify-center items-center mb-6">
               <div className="relative">
                 <Image 
                   src="/imgs/logo.png" 
                   alt="Vazadex" 
                   width={120} 
                   height={120}
                   className="w-24 h-24 md:w-32 md:h-32"
                 />
                 <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                   <FaFire className="text-white text-xs" />
                 </div>
               </div>
             </div>
             
             <h3 className="text-white font-bold text-xl md:text-2xl mb-2">Vazadex</h3>
             <p className="text-neutral-300 text-sm md:text-base mb-4">A melhor plataforma de conteúdo exclusivo</p>
             
             {/* Links Rápidos */}
             <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-6">
               <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors text-sm md:text-base">Sobre Nós</a>
               <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors text-sm md:text-base">Política de Privacidade</a>
               <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors text-sm md:text-base">Termos de Uso</a>
               <a href="https://t.me/@supvazadex" className="text-neutral-400 hover:text-red-500 transition-colors text-sm md:text-base">Suporte</a>
               <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors text-sm md:text-base">Remoção de Conteúdos</a>
             </div>
           </div>
           
           {/* Badges de Confiança */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
             <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4 md:p-6 text-center">
               <div className="flex justify-center mb-3">
                 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                 </div>
               </div>
               <h4 className="text-white font-bold text-sm md:text-base mb-1">COMPRA SEGURA</h4>
               <p className="text-neutral-300 text-xs md:text-sm">Pagamentos 100% seguros e criptografados</p>
             </div>
             
             <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4 md:p-6 text-center">
               <div className="flex justify-center mb-3">
                 <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                   </svg>
                 </div>
               </div>
               <h4 className="text-white font-bold text-sm md:text-base mb-1">SATISFAÇÃO GARANTIDA</h4>
               <p className="text-neutral-300 text-xs md:text-sm">Satisfação garantida ou seu dinheiro de volta</p>
             </div>
             
             <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4 md:p-6 text-center">
               <div className="flex justify-center mb-3">
                 <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                   </svg>
                 </div>
               </div>
               <h4 className="text-white font-bold text-sm md:text-base mb-1">PRIVACIDADE PROTEGIDA</h4>
               <p className="text-neutral-300 text-xs md:text-sm">Seus dados estão 100% protegidos</p>
             </div>
           </div>
           
           {/* Copyright e Informações Legais */}
           <div className="border-t border-neutral-700 pt-6 md:pt-8">
             <div className="text-center mb-4">
               <p className="text-white text-sm md:text-base font-medium">© 2025 Vazadex - Todos os Direitos Reservados</p>
             </div>
             
             <p className="text-neutral-500 text-xs md:text-sm text-center leading-relaxed">
               Todos os direitos reservados. É proibida a reprodução do conteúdo desta página em qualquer meio de comunicação, 
               sem autorização escrita do Vazadex ou do detentor do copyright. Os textos e as imagens (fotos, vídeos, ilustrações, etc.) 
               de todas as Atrações do Vazadex são protegidas pela LEI DO DIREITO AUTORAL, não sendo permitidas cópias ou divulgações 
               por qualquer motivo ou justificativa, nem mesmo com autorização das(os) modelos. Infratores serão punidos na forma da lei.
             </p>
           </div>
         </div>
       </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-neutral-900 rounded-lg border border-neutral-700 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <h2 className="text-xl font-bold text-white">
                {showPasswordForm ? 'Criar Conta' : showPixPayment ? 'Pagamento PIX' : 'Finalizar Assinatura'}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {showPasswordForm ? (
                // Formulário de criação de senha
                <div>
                  <div className="text-center mb-6">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FaCheck className="text-green-500" />
                        <span className="text-green-400 font-bold">Pagamento Confirmado!</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{selectedPlan?.title}</h3>
                      <p className="text-neutral-300 text-sm">{selectedPlan?.description}</p>
                      <div className="text-2xl font-bold text-white mt-2">
                        {selectedPlan && formatPrice(selectedPlan.price)}
                      </div>
                    </div>
                    
                    <p className="text-white text-sm">
                      Agora crie sua senha para finalizar o cadastro e acessar imediatamente!
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                        E-mail (já preenchido)
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                        Criar Senha
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
                        placeholder="Digite sua senha (mínimo 6 caracteres)"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
                        placeholder="Confirme sua senha"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-300 text-sm">
                        Sua conta será criada e você terá acesso imediato ao conteúdo premium!
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta e Acessar'
                      )}
                    </button>
                  </form>
                </div>
              ) : showPixPayment && pixData ? (
                // Tela de pagamento PIX
                <div>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Quase lá...</h1>
                    <p className="text-white text-sm">
                      Pague seu Pix dentro de {formatTime(timeLeft)} para liberar seu acesso.
                    </p>
                  </div>

                  {/* Barra de status */}
                  <div className="bg-yellow-100 rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-neutral-800 text-sm">Aguardando pagamento</span>
                      <FaSpinner className="text-blue-500 animate-spin" />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-white text-sm">Valor do Pix: {formatPrice(pixData.value)}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-lg">
                      {pixData.qr_code_base64 ? (
                        <img 
                          src={pixData.qr_code_base64} 
                          alt="QR Code PIX" 
                          className="w-48 h-48"
                        />
                      ) : generatedQRCode ? (
                        <img 
                          src={generatedQRCode} 
                          alt="QR Code PIX Gerado" 
                          className="w-48 h-48"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                          <div className="text-center">
                            <p className="text-gray-600 text-sm mb-2">Gerando QR Code...</p>
                            <FaSpinner className="text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500 text-xs">Use o código copia e cola abaixo</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão copiar código */}
                  <button
                    onClick={copyPixCode}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg mb-4 flex items-center justify-center gap-2 hover:bg-green-700 transition"
                  >
                    <FaCopy />
                    {copied ? 'Código copiado!' : 'Copiar código Pix'}
                  </button>

                  {/* Botão verificar pagamento */}
                  <button
                    onClick={checkPaymentStatus}
                    disabled={isCheckingPayment}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mb-6 flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingPayment ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Verificando pagamento...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Já fiz o pagamento
                      </>
                    )}
                  </button>

                  {/* Instruções */}
                  <div className="text-white text-sm mb-6 space-y-2">
                    <p>Após copiar o código, abra seu aplicativo de pagamento onde você utiliza o Pix.</p>
                    <p>Escolha a opção Pix Copia e Cola e insira o código copiado</p>
                  </div>

                  {/* Badge de segurança */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <FaCheck className="text-green-500" />
                    <span className="text-white text-sm font-medium">COMPRA 100% SEGURA</span>
                  </div>

                  <hr className="border-neutral-700 mb-6" />

                  {/* Footer */}
                  <div className="text-center text-white text-xs space-y-1">
                    <p>Pix processado por: PUSHIN PAY</p>
                    <p>Constará no seu extrato da sua conta bancária o nome PUSHIN PAY.</p>
                  </div>

                  <div className="text-neutral-500 text-xs mt-4 text-center">
                    Esta compra será processada pela PUSHIN PAY © 2025 - Todos os direitos reservados. 
                    Sua compra de acesso será processada com segurança e discrição por PUSHIN PAY. 
                    Se você encontrar algum problema durante o processo de compra, favor contatar Apoio ao Cliente.
                  </div>
                </div>
              ) : showPaymentMethod ? (
                // Tela de seleção de método de pagamento
                <div>
                  <div className="text-center mb-6">
                    <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-bold text-white">{selectedPlan?.title}</h3>
                      <p className="text-neutral-300 text-sm">{selectedPlan?.description}</p>
                      <div className="text-2xl font-bold text-white mt-2">
                        {selectedPlan && formatPrice(selectedPlan.price)}
                      </div>
                    </div>
                    
                    <p className="text-white text-sm">
                      Escolha sua forma de pagamento preferida:
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Opção PIX */}
                    <button
                      onClick={() => handlePaymentMethodSelect('pix')}
                      disabled={isLoading}
                      className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoading && paymentMethod === 'pix' ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processando PIX...
                        </>
                      ) : (
                        <>
                          <FaMobile />
                          Pagar com PIX
                        </>
                      )}
                    </button>

                    {/* Opção Cartão */}
                    <button
                      onClick={() => handlePaymentMethodSelect('card')}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isLoading && paymentMethod === 'card' ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Redirecionando...
                        </>
                      ) : (
                        <>
                          <FaCreditCard />
                          Pagar com Cartão
                        </>
                      )}
                    </button>

                    {/* Voltar */}
                    <button
                      onClick={() => setShowPaymentMethod(false)}
                      disabled={isLoading}
                      className="w-full bg-neutral-700 text-white font-bold py-3 rounded-lg hover:bg-neutral-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Voltar
                    </button>
                  </div>

                  <div className="mt-6 text-center text-white text-xs space-y-1">
                    <p>PIX processado por: PUSHIN PAY</p>
                    <p>Cartão processado por: STRIPE</p>
                  </div>
                </div>
              ) : (
                // Formulário de email
                <div>
                  <div className="text-center mb-6">
                    <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-bold text-white">{selectedPlan?.title}</h3>
                      <p className="text-neutral-300 text-sm">{selectedPlan?.description}</p>
                      <div className="text-2xl font-bold text-white mt-2">
                        {selectedPlan && formatPrice(selectedPlan.price)}
                      </div>
                    </div>
                    

                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                        Seu E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
                        placeholder="Digite seu e-mail"
                        required
                      />
                    </div>

                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-300 text-sm">
                        Seu e-mail está 100% seguro, usaremos apenas para identificar seu cadastro e processar a assinatura.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Continuar'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 