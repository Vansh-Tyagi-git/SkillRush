export function setupQuizGUI(journeyData, createLevelNodes, updateCharacterPosition, sceneRef) {
  const quizContainer = document.getElementById('quiz-container');
  const optionsContainer = document.getElementById('options-container');
  const checkBtn = document.getElementById('check-btn');
  const feedbackSection = document.getElementById('feedback-section');
  const questionText = document.getElementById('question-text');
  const closeQuizBtn = document.getElementById('close-quiz-btn');

  // Create a new container specifically for the video player
  const videoContainer = document.createElement('div');
  videoContainer.id = 'video-container';
  videoContainer.className = 'absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-900 bg-opacity-75 z-50 hidden'; // Added flex and items-center
  
  // Create the iframe element for YouTube
  const iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('frameborder', '0');
  iframeElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframeElement.setAttribute('allowfullscreen', 'true');
  iframeElement.className = 'w-full h-full md:w-full lg:w-3/4 xl:w-2/3 rounded-xl shadow-2xl'; 
  videoContainer.appendChild(iframeElement);

  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'mt-4'; // Add margin for spacing
  videoContainer.appendChild(buttonWrapper);

  document.body.appendChild(videoContainer);

  let selectedOption = null;
  let activeLevelId = null;
  let currentQuestionIndex = 0;
  let activeLevelData = null;

  function showQuiz(levelId) {
      activeLevelId = levelId;
      activeLevelData = journeyData.find(l => l.id === levelId);
      currentQuestionIndex = 0;
      if (!activeLevelData) return;

      const quizData = activeLevelData.quizzes[currentQuestionIndex];
      if (quizData && quizData.youtubeId) {
          playYouTubeVideo(quizData.youtubeId);
      } else {
          displayCurrentQuestion();
          quizContainer.classList.remove('hidden');
      }
  }

  function playYouTubeVideo(youtubeId) {
      videoContainer.classList.remove('hidden');
      quizContainer.classList.add('hidden');
      
      iframeElement.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&enablejsapi=1`;

      // Create the 'Continue to Quiz' button
      const closeVideoBtn = document.createElement('button');
      closeVideoBtn.textContent = 'Continue to Quiz';
      closeVideoBtn.className = 'px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700';
      closeVideoBtn.onclick = () => {
          iframeElement.src = '';
          videoContainer.classList.add('hidden');
          displayCurrentQuestion();
          quizContainer.classList.remove('hidden');
          closeVideoBtn.remove();
      };

      // Append the button to the new wrapper
      buttonWrapper.appendChild(closeVideoBtn);
  }
  
  function displayCurrentQuestion() {
      const quizData = activeLevelData.quizzes[currentQuestionIndex];
      questionText.textContent = `"${quizData.question}"`;
      optionsContainer.innerHTML = '';
      feedbackSection.innerHTML = '';
      selectedOption = null;
  
      const shuffledOptions = quizData.options.sort(() => Math.random() - 0.5);
      shuffledOptions.forEach(option => {
          const button = document.createElement('button');
          button.textContent = option.text;
          button.dataset.correct = option.correct;
          button.className = "w-full text-left p-4 bg-white border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200";
          button.onclick = () => selectOption(button);
          optionsContainer.appendChild(button);
      });
      resetCheckButton();
  }

  function hideQuiz() {
      quizContainer.classList.add('hidden');
  }

  closeQuizBtn.addEventListener('click', hideQuiz);

  function selectOption(button) {
      document.querySelectorAll('#options-container button').forEach(btn => {
          btn.classList.remove('bg-purple-200', 'border-purple-500', 'ring-2', 'ring-purple-400');
      });
      button.classList.add('bg-purple-200', 'border-purple-500', 'ring-2', 'ring-purple-400');
      selectedOption = button;
  }

  function resetCheckButton() {
      checkBtn.textContent = 'Check';
      checkBtn.disabled = false;
      checkBtn.className = "w-full md:w-1/2 bg-purple-600 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-md";
      checkBtn.onclick = checkAnswer;
  }

  function checkAnswer() {
      if (!selectedOption) return;
      const isCorrect = selectedOption.dataset.correct === 'true';

      document.querySelectorAll('#options-container button').forEach(btn => {
          btn.disabled = true;
          if (btn.dataset.correct === 'true') btn.classList.add('bg-green-200', 'border-green-500');
          else if (btn === selectedOption) btn.classList.add('bg-red-200', 'border-red-500');
      });

      const feedbackMessage = document.createElement('div');
      if (isCorrect) {
          feedbackMessage.className = 'text-green-600 font-bold text-lg';
          feedbackMessage.textContent = "Correct!";
          currentQuestionIndex++;

          if (currentQuestionIndex < activeLevelData.quizzes.length) {
              checkBtn.textContent = 'Next Question';
              checkBtn.onclick = displayCurrentQuestion;
          } else {
              checkBtn.textContent = 'Continue';
              checkBtn.className = "w-full md:w-1/2 bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-md";
              checkBtn.onclick = completeLevel;
          }
      } else {
          feedbackMessage.className = 'text-red-600 font-bold text-lg';
          feedbackMessage.textContent = "Try again next time!";
          checkBtn.textContent = 'Continue';
          checkBtn.className = "w-full md:w-1/2 bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-md";
          checkBtn.onclick = hideQuiz;
      }
      feedbackSection.innerHTML = '';
      feedbackSection.appendChild(feedbackMessage);
  }

  function completeLevel() {
      const currentLevel = journeyData.find(l => l.id === activeLevelId);
      currentLevel.status = 'completed';

      const nextLevelId = activeLevelId + 1;
      if (nextLevelId < journeyData.length) {
          const nextLevel = journeyData.find(l => l.id === nextLevelId);
          nextLevel.status = 'unlocked';
          sceneRef.currentLevelId = nextLevelId;
      }

      createLevelNodes();
      hideQuiz();
  }

  return { showQuiz, quizContainer };
}