export function setupQuizGUI(journeyData, createLevelNodes, updateCharacterPosition, sceneRef) {
    const quizContainer = document.getElementById('quiz-container');
    const optionsContainer = document.getElementById('options-container');
    const checkBtn = document.getElementById('check-btn');
    const feedbackSection = document.getElementById('feedback-section');
    const questionText = document.getElementById('question-text');
    const closeQuizBtn = document.getElementById('close-quiz-btn');
  
    let selectedOption = null;
    let activeLevelId = null;
    let currentQuestionIndex = 0;
    let activeLevelData = null;
  
    function showQuiz(levelId) {
      activeLevelId = levelId;
      activeLevelData = journeyData.find(l => l.id === levelId);
      currentQuestionIndex = 0;
      if (!activeLevelData) return;
  
      displayCurrentQuestion();
      quizContainer.classList.remove('hidden');
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
            // More questions in this level
            checkBtn.textContent = 'Next Question';
            checkBtn.onclick = displayCurrentQuestion;
        } else {
            // Last question answered, level complete
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
      if(nextLevelId < journeyData.length) {
        const nextLevel = journeyData.find(l => l.id === nextLevelId);
        nextLevel.status = 'unlocked';
        sceneRef.currentLevelId = nextLevelId; // Use the sceneRef to update
      }
      
      createLevelNodes();
      // The character position is now updated automatically via the setter in scene.js
      hideQuiz();
    }
  
    return { showQuiz, quizContainer };
  }
