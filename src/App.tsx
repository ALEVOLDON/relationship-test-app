// Добавьте это в начало файла src/App.tsx
declare global {
  interface Window {
    // Укажите тип возвращаемого значения и опций, если установите @types/html2canvas
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

// --- Начало кода компонента App ---
import React, { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
// html2canvas будет загружен из CDN

// --- Конфигурация и типы ---

type RelationshipType = 'openness' | 'avoidant' | 'anxious' | 'perfectionist' | 'stable' | 'hunter';

interface Question {
  id: number;
  textKey: string; // Ключ для перевода
  category: RelationshipType;
}

interface Scores {
  openness: number;
  avoidant: number;
  anxious: number;
  perfectionist: number;
  stable: number;
  hunter: number;
}

interface Translations {
  [key: string]: {
    [lang: string]: string;
  };
}

// --- Константы ---

const relationshipTypes: RelationshipType[] = ['openness', 'avoidant', 'anxious', 'perfectionist', 'stable', 'hunter'];
const HTML2CANVAS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

const questions: Question[] = [
  // Открытость
  { id: 1, textKey: 'q1', category: 'openness' },
  { id: 7, textKey: 'q7', category: 'openness' },
  // Избегающий
  { id: 2, textKey: 'q2', category: 'avoidant' },
  { id: 8, textKey: 'q8', category: 'avoidant' },
  // Тревожный
  { id: 3, textKey: 'q3', category: 'anxious' },
  { id: 9, textKey: 'q9', category: 'anxious' },
  // Перфекционист
  { id: 4, textKey: 'q4', category: 'perfectionist' },
  { id: 10, textKey: 'q10', category: 'perfectionist' },
  // Стабильный
  { id: 5, textKey: 'q5', category: 'stable' },
  { id: 11, textKey: 'q11', category: 'stable' },
  // Охотник
  { id: 6, textKey: 'q6', category: 'hunter' },
  { id: 12, textKey: 'q12', category: 'hunter' },
  // Добавьте больше вопросов до 15 при желании, обеспечивая баланс
];

const initialScores: Scores = {
  openness: 0,
  avoidant: 0,
  anxious: 0,
  perfectionist: 0,
  stable: 0,
  hunter: 0,
};

// --- Переводы ---

const translations: Translations = {
  // Заголовок приложения
  appTitle: { en: 'Relationship Personality Test', ru: 'Тест на тип личности в отношениях' },
  // Вопросы (Примерные ключи)
  q1: { en: 'I easily trust new partners.', ru: 'Я легко доверяю новым партнерам.' },
  q2: { en: 'I prefer keeping some emotional distance.', ru: 'Я предпочитаю сохранять некоторую эмоциональную дистанцию.' },
  q3: { en: 'I often worry about my partner leaving me.', ru: 'Я часто беспокоюсь, что партнер меня бросит.' },
  q4: { en: 'I strive for the "perfect" relationship.', ru: 'Я стремлюсь к "идеальным" отношениям.' },
  q5: { en: 'I feel secure and content in my relationships.', ru: 'Я чувствую себя безопасно и удовлетворенно в отношениях.' },
  q6: { en: 'I enjoy the thrill of pursuing new romantic interests.', ru: 'Мне нравится азарт погони за новыми романтическими интересами.' },
  q7: { en: 'I am comfortable sharing my deepest feelings.', ru: 'Мне комфортно делиться самыми сокровенными чувствами.' },
  q8: { en: 'Commitment makes me feel trapped.', ru: 'Обязательства заставляют меня чувствовать себя в ловушке.' },
  q9: { en: 'I need constant reassurance from my partner.', ru: 'Мне нужно постоянное подтверждение чувств от партнера.' },
  q10: { en: 'Minor flaws in a relationship bother me significantly.', ru: 'Мелкие недостатки в отношениях меня сильно беспокоят.' },
  q11: { en: 'I handle relationship conflicts calmly and constructively.', ru: 'Я спокойно и конструктивно разрешаю конфликты в отношениях.' },
  q12: { en: 'The "chase" is often more exciting than the relationship itself.', ru: '"Охота" часто более захватывающая, чем сами отношения.' },
  // Добавьте ключи для q13, q14, q15, если добавите больше вопросов

  // Варианты ответов
  definitelyNo: { en: 'Definitely No', ru: 'Точно нет' },
  ratherNo: { en: 'Rather No', ru: 'Скорее нет' },
  ratherYes: { en: 'Rather Yes', ru: 'Скорее да' },
  definitelyYes: { en: 'Definitely Yes', ru: 'Точно да' },

  // Результаты
  resultTitle: { en: 'Your Dominant Relationship Style:', ru: 'Ваш доминирующий стиль отношений:' },
  openness: { en: 'Openness', ru: 'Открытость' },
  avoidant: { en: 'Avoidant', ru: 'Избегающий' },
  anxious: { en: 'Anxious', ru: 'Тревожный' },
  perfectionist: { en: 'Perfectionist', ru: 'Перфекционист' },
  stable: { en: 'Stable', ru: 'Стабильный' },
  hunter: { en: 'Hunter', ru: 'Охотник' },
  // Описания (Сделайте краткими или загружайте динамически)
  desc_openness: { en: 'You are generally trusting and comfortable with intimacy.', ru: 'Вы обычно доверчивы и комфортно чувствуете себя в близости.' },
  desc_avoidant: { en: 'You value independence and may feel uncomfortable with too much closeness.', ru: 'Вы цените независимость и можете чувствовать дискомфорт от слишком тесной близости.' },
  desc_anxious: { en: 'You crave intimacy but often worry about your partner\'s commitment.', ru: 'Вы жаждете близости, но часто беспокоитесь о приверженности партнера.' },
  desc_perfectionist: { en: 'You have high standards for relationships and may focus on flaws.', ru: 'У вас высокие стандарты в отношениях, и вы можете сосредотачиваться на недостатках.' },
  desc_stable: { en: 'You feel secure in relationships and handle challenges constructively.', ru: 'Вы чувствуете себя уверенно в отношениях и конструктивно справляетесь с трудностями.' },
  desc_hunter: { en: 'You enjoy the pursuit of new connections, sometimes more than stability.', ru: 'Вам нравится погоня за новыми связями, иногда больше, чем стабильность.' },

  // Кнопки и метки
  startTest: { en: 'Start Test', ru: 'Начать тест' },
  next: { en: 'Next', ru: 'Далее' },
  finish: { en: 'Finish', ru: 'Завершить' },
  restartTest: { en: 'Restart Test', ru: 'Пройти тест заново' },
  shareTelegram: { en: 'Share on Telegram', ru: 'Поделиться в Telegram' },
  downloadResult: { en: 'Download Result (PNG)', ru: 'Скачать результат (PNG)' },
  getAIInsights: { en: 'Get AI Insights (Optional)', ru: 'Получить ИИ-рекомендации (Опционально)' },
  scoreDistribution: { en: 'Score Distribution', ru: 'Распределение баллов' },
  language: { en: 'Language', ru: 'Язык' },
  question: { en: 'Question', ru: 'Вопрос' },
  of: { en: 'of', ru: 'из' },
  loading: { en: 'Loading...', ru: 'Загрузка...' },
  aiPlaceholder: { en: 'AI insights would appear here...', ru: 'Здесь появятся рекомендации ИИ...' },
  error: { en: 'Error', ru: 'Ошибка' },
  errorHtml2Canvas: { en: 'Could not generate image.', ru: 'Не удалось создать изображение.' },
  errorLoadingLibrary: { en: 'Error loading download library. Please try again later.', ru: 'Ошибка загрузки библиотеки для скачивания. Пожалуйста, попробуйте позже.'},
};

// --- Вспомогательные функции ---

const getTranslation = (key: string, lang: string): string => {
  return translations[key]?.[lang] || key;
};

// --- Основной компонент приложения ---

const App: React.FC = () => {
  const [language, setLanguage] = useState<string>('ru'); // Устанавливаем русский по умолчанию
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [scores, setScores] = useState<Scores>(initialScores);
  const [dominantType, setDominantType] = useState<RelationshipType | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false); // Для загрузки ИИ-рекомендаций
  const [aiInsight, setAiInsight] = useState<string | null>(null); // Для текста ИИ-рекомендаций
  const [isHtml2CanvasLoaded, setIsHtml2CanvasLoaded] = useState<boolean>(false); // Отслеживание загрузки библиотеки
  const resultRef = useRef<HTMLDivElement>(null); // Ref для области скриншота

  // Эффект для загрузки html2canvas из CDN
  useEffect(() => {
    const scriptId = 'html2canvas-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    // Добавляем скрипт, только если его еще нет
    if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = HTML2CANVAS_CDN_URL;
        script.async = true;
        script.onload = () => {
            console.log('html2canvas загружен успешно.');
            setIsHtml2CanvasLoaded(true);
            // Проверяем, существует ли глобальный объект после загрузки
            if (typeof window.html2canvas === 'undefined') {
                 console.error('html2canvas загружен, но window.html2canvas не определен.');
                 setIsHtml2CanvasLoaded(false); // Отмечаем как не загруженный, если объекта нет
            }
        };
        script.onerror = () => {
            console.error('Не удалось загрузить скрипт html2canvas.');
            setIsHtml2CanvasLoaded(false);
            // Опционально: показать сообщение об ошибке пользователю
            alert(getTranslation('errorLoadingLibrary', language));
        };
        document.body.appendChild(script);
    } else if (typeof window.html2canvas !== 'undefined') {
        // Если тег скрипта существует и библиотека уже есть в window, отмечаем как загруженную
        setIsHtml2CanvasLoaded(true);
    }

  }, [language]); // Перезапускаем, если язык изменился, чтобы обновить язык сообщения об ошибке


  // Загрузка состояния из localStorage при монтировании
  useEffect(() => {
    const savedState = localStorage.getItem('relationshipTestState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setLanguage(state.language || 'ru'); // Русский по умолчанию
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setAnswers(state.answers || {});
        setScores(state.scores || initialScores);
        setDominantType(state.dominantType || null);
        setShowResult(state.showResult || false);
        setAiInsight(state.aiInsight || null); // Загружаем сохраненные ИИ-рекомендации, если есть
      } catch (error) {
        console.error("Не удалось разобрать сохраненное состояние:", error);
        localStorage.removeItem('relationshipTestState'); // Очищаем поврежденное состояние
      }
    }
  }, []);

  // Сохранение состояния в localStorage при его изменении
  useEffect(() => {
    // Не сохраняем начальное состояние до того, как что-либо произошло
    if (currentQuestionIndex === 0 && Object.keys(answers).length === 0 && !showResult) {
        return;
    }
    const stateToSave = JSON.stringify({
      language,
      currentQuestionIndex,
      answers,
      scores,
      dominantType,
      showResult,
      aiInsight, // Сохраняем ИИ-рекомендации
    });
    localStorage.setItem('relationshipTestState', stateToSave);
  }, [language, currentQuestionIndex, answers, scores, dominantType, showResult, aiInsight]);

  const t = (key: string) => getTranslation(key, language);

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const newScores = { ...initialScores };
    questions.forEach(q => {
      const answerScore = answers[q.id];
      if (answerScore !== undefined) {
        newScores[q.category] += answerScore;
      }
    });
    setScores(newScores);

    // Находим доминирующий тип
    let maxScore = -1;
    let dominant: RelationshipType | null = null;
    // Обеспечиваем стабильное сравнение при равенстве очков (например, предпочитаем первый встреченный)
    for (const type of relationshipTypes) {
        const score = newScores[type as RelationshipType];
         if (score > maxScore) {
            maxScore = score;
            dominant = type as RelationshipType;
        }
    }

    // Запасной вариант, если доминирующий тип не найден (не должно произойти при начальных очках >= 0)
    if (!dominant && Object.values(newScores).some(s => s > 0)) {
        dominant = relationshipTypes[0]; // По умолчанию первый тип, если очки есть, но логика не сработала
    }

    setDominantType(dominant);
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScores(initialScores);
    setDominantType(null);
    setShowResult(false);
    setAiInsight(null); // Очищаем ИИ-рекомендации при перезапуске
    localStorage.removeItem('relationshipTestState'); // Очищаем хранилище при явном перезапуске
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  // --- Поделиться и Экспорт ---

  const handleShareTelegram = () => {
    if (!dominantType) return;
    const resultText = `${t('resultTitle')} ${t(dominantType)}. ${t(`desc_${dominantType}`)}`;
    // Используем общий URL или фактический развернутый URL, если доступен
    const shareUrl = window.location.href; // Или канонический URL вашего приложения
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(resultText)}`;
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
      // Проверяем, доступна ли функция библиотеки в объекте window
      if (!window.html2canvas) {
          console.error("html2canvas еще не загружен.");
          alert(t('errorLoadingLibrary')); // Информируем пользователя
          return;
      }
      if (resultRef.current) {
          try {
              // Используем window.html2canvas
              const canvas = await window.html2canvas(resultRef.current, {
                  useCORS: true, // Важно, если есть внешние изображения/шрифты
                  scale: 2, // Увеличиваем разрешение для лучшего качества
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff', // Соответствие фону
                  logging: false // Уменьшаем шум в консоли
              });
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `relationship-test-result-${dominantType || 'summary'}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          } catch (error) {
              console.error("Ошибка при генерации canvas:", error);
              alert(t('errorHtml2Canvas'));
          }
      }
  };


  // --- ИИ-рекомендации (Заполнитель) ---
  const handleGetAIInsights = async () => {
    if (!dominantType) return;
    setIsLoadingAI(true);
    setAiInsight(null); // Очищаем предыдущие рекомендации

    // --- !!! Заполнитель для вызова API !!! ---
    // В реальном приложении здесь вы бы вызвали ваш бэкенд, который затем вызывает OpenAI/Ollama.
    console.log("Симуляция запроса ИИ-рекомендаций для:", dominantType, "Очки:", scores, "Язык:", language);
    // --- Конец Заполнителя ---

    // Симуляция задержки API-вызова
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Симулированный ответ на основе доминирующего типа
    const simulatedAdvice: { [key in RelationshipType]?: { [lang: string]: string } } = {
        openness: { en: 'AI suggests embracing your trusting nature while maintaining healthy boundaries.', ru: 'ИИ предлагает принять вашу доверчивую натуру, сохраняя при этом здоровые границы.' },
        avoidant: { en: 'AI recommends exploring the roots of your need for distance and practicing vulnerability in small steps.', ru: 'ИИ рекомендует изучить корни вашей потребности в дистанции и практиковать уязвимость маленькими шагами.' },
        anxious: { en: 'AI advises focusing on self-soothing techniques and communicating your needs clearly without demanding reassurance.', ru: 'ИИ советует сосредоточиться на техниках самоуспокоения и четко сообщать о своих потребностях, не требуя постоянного подтверждения.' },
        perfectionist: { en: 'AI encourages accepting imperfections in yourself and partners, focusing on connection over flawlessness.', ru: 'ИИ призывает принимать несовершенства в себе и партнерах, сосредотачиваясь на связи, а не на безупречности.' },
        stable: { en: 'AI commends your secure base and suggests continuing to nurture open communication and mutual respect.', ru: 'ИИ одобряет вашу надежную базу и предлагает продолжать развивать открытое общение и взаимное уважение.' },
        hunter: { en: 'AI suggests reflecting on what you seek in relationships beyond the initial excitement and exploring deeper connection.', ru: 'ИИ предлагает поразмышлять о том, что вы ищете в отношениях помимо первоначального волнения, и исследовать более глубокую связь.' },
    };
    setAiInsight(simulatedAdvice[dominantType]?.[language] || t('aiPlaceholder'));
    setIsLoadingAI(false);
  };


  // --- Подготовка данных для диаграммы ---
  const chartData = relationshipTypes.map(type => ({
    subject: t(type), // Переведенная метка для оси диаграммы
    score: scores[type],
    fullMark: questions.filter(q => q.category === type).length * 3, // Максимально возможный балл для этой категории
  }));

  // --- Логика рендеринга ---

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <motion.div
        key={currentQuestionIndex} // Важно для AnimatePresence
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {/* Индикатор прогресса */}
         <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                <span>{t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                    className="bg-indigo-600 h-2 rounded-full"
                    // Начальная ширина основана на предыдущем вопросе для плавной анимации
                    initial={{ width: `${Math.round(((currentQuestionIndex > 0 ? currentQuestionIndex : 0) / questions.length) * 100)}%` }}
                    // Анимируем к текущему вопросу (индекс + 1)
                    animate={{ width: `${Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                 />
            </div>
        </div>

        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t(question.textKey)}</p>
        <div className="space-y-3">
          {[
            { labelKey: 'definitelyNo', score: 0 },
            { labelKey: 'ratherNo', score: 1 },
            { labelKey: 'ratherYes', score: 2 },
            { labelKey: 'definitelyYes', score: 3 },
          ].map(({ labelKey, score }) => (
            <button
              key={score}
              onClick={() => handleAnswer(question.id, score)}
              className={`w-full text-left p-3 rounded-md border transition-all duration-200 transform active:scale-[0.98] ${
                answers[question.id] === score
                  ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-600 shadow-inner'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } text-gray-700 dark:text-gray-300`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={answers[question.id] === undefined}
          className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 transform active:scale-[0.98]"
        >
          {isLastQuestion ? t('finish') : t('next')}
        </button>
      </motion.div>
    );
  };

  const renderResult = () => {
    if (!dominantType) return null;
    // Определяем текущую тему для стилизации диаграммы
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const tickColor = currentTheme === 'dark' ? '#e5e7eb' : '#374151'; // Цвет меток осей
    const gridColor = currentTheme === 'dark' ? '#4b5563' : '#d1d5db'; // Цвет сетки

    return (
        // Этот div захватывается html2canvas
        <div ref={resultRef} className="w-full max-w-2xl p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
            {/* Заголовок */}
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-indigo-700 dark:text-indigo-400">{t('resultTitle')}</h2>
            <p className="text-xl md:text-2xl font-semibold text-center mb-6">{t(dominantType)}</p>

            {/* Описание */}
            <p className="text-base text-center mb-8 px-4">{t(`desc_${dominantType}`)}</p>

            {/* Диаграмма */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-center">{t('scoreDistribution')}</h3>
                <div className="w-full h-64 md:h-80"> {/* Убедитесь, что у диаграммы есть высота */}
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke={gridColor} /> {/* Цвет линий сетки */}
                            <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} tick={false} axisLine={false} />
                            <Radar name={t('appTitle')} dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} strokeWidth={2} /> {/* Цвет радара (Tailwind Violet-500) */}
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Секция ИИ-рекомендаций (Включена в скриншот) */}
            <div className="mt-8 p-4 border-t border-gray-200 dark:border-gray-700">
                 <button
                    onClick={handleGetAIInsights}
                    disabled={isLoadingAI}
                    className="w-full mb-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-wait transition-colors duration-200 transform active:scale-[0.98]"
                >
                    {isLoadingAI ? t('loading') : t('getAIInsights')}
                </button>
                {aiInsight && (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{aiInsight}</p>
                    </div>
                )}
                 {/* Показываем плейсхолдер, если нет рекомендаций и не идет загрузка */}
                 {!aiInsight && !isLoadingAI && (
                     <p className="text-xs text-center text-gray-500 dark:text-gray-400">{t('aiPlaceholder')}</p>
                 )}
            </div>
        </div>
    );
};


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 flex flex-col items-center justify-center transition-colors duration-300">
      {/* Переключатель языка и темы */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow">
        {/* Кнопки языка */}
        <button
          onClick={() => handleLanguageChange('en')}
          title="Switch to English"
          className={`px-3 py-1 rounded text-sm transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('ru')}
          title="Переключить на русский"
          className={`px-3 py-1 rounded text-sm transition-colors ${language === 'ru' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          RU
        </button>
         {/* Пример простого переключателя темы */}
        <button
            onClick={() => document.documentElement.classList.toggle('dark')}
            title="Переключить темную/светлую тему"
            className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
        >
            {/* Простая симуляция иконки Солнце/Луна */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center my-6 md:my-8 text-gray-800 dark:text-gray-200">{t('appTitle')}</h1>

      <AnimatePresence mode="wait">
        {!showResult ? (
          renderQuestion()
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center"
          >
              {renderResult()}
              {/* Кнопки действий вне области скриншота */}
              <div className="mt-6 w-full max-w-2xl flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                      onClick={handleShareTelegram}
                      disabled={!dominantType} // Отключаем, если результата еще нет
                      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                  >
                      {t('shareTelegram')}
                  </button>
                  <button
                      onClick={handleDownload}
                      disabled={!isHtml2CanvasLoaded || !dominantType} // Отключаем, если библиотека не загружена или нет результата
                      title={!isHtml2CanvasLoaded ? t('errorLoadingLibrary') : t('downloadResult')}
                      className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                  >
                      {t('downloadResult')}
                  </button>
                  <button
                      onClick={handleRestart}
                      className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200 flex-1 transform active:scale-[0.98]"
                  >
                      {t('restartTest')}
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Подвал или дополнительная информация */}
      <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Описания типов личности являются иллюстративными. Для получения рекомендаций по отношениям проконсультируйтесь со специалистом.
      </footer>

    </div>
  );
};

// --- Экспорт для рендеринга ---
export default App;
// --- Конец кода компонента App ---
