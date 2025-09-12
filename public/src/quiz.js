// Stores all journey/quiz data for Linear Equations in Two Variables
// Each level has a "quizzes" array, allowing for multiple questions per level.
export const journeyData = [
  {
    id: 0,
    status: 'unlocked',
    quizzes: [
      {
        question: "What is the standard form of a linear equation in two variables?",
        options: [
          { text: "ax + by = c", correct: true },
          { text: "ax² + bx + c = 0", correct: false },
          { text: "y = mx² + c", correct: false },
          { text: "x = y", correct: false }
        ]
      },
      {
        question: "In the equation 3x + 2y = 6, what are the variables?",
        options: [
          { text: "3 and 2", correct: false },
          { text: "x and y", correct: true },
          { text: "3 and 6", correct: false },
          { text: "2 and 6", correct: false }
        ]
      }
    ]
  },
  {
    id: 1,
    status: 'locked',
    quizzes: [
      {
        question: "If x = 2 in the equation 2x + y = 10, what is the value of y?",
        options: [
          { text: "y = 4", correct: false },
          { text: "y = 8", correct: false },
          { text: "y = 6", correct: true },
          { text: "y = 12", correct: false }
        ]
      },
      {
        question: "Which of the following is a solution to the equation x - y = 3?",
        options: [
          { text: "(5, 2)", correct: true },
          { text: "(2, 5)", correct: false },
          { text: "(1, 4)", correct: false },
          { text: "(4, 2)", correct: false }
        ]
      },
      {
        question: "Solve for y in the equation 4x + 2y = 8.",
        options: [
          { text: "y = 4 - 2x", correct: true },
          { text: "y = 8 - 4x", correct: false },
          { text: "y = 2x - 4", correct: false },
          { text: "y = 4 + 2x", correct: false }
        ]
      }
    ]
  },
  {
    id: 2,
    status: 'locked',
    quizzes: [
      {
        question: "What does the graph of a linear equation in two variables look like?",
        options: [
          { text: "A parabola", correct: false },
          { text: "A circle", correct: false },
          { text: "A straight line", correct: true },
          { text: "A point", correct: false }
        ]
      }
    ]
  },
  {
    id: 3,
    status: 'locked',
    quizzes: [
      {
        question: "The cost of 5 pencils and 2 pens is $19. If 'x' is the cost of a pencil and 'y' is the cost of a pen, which equation represents this situation?",
        options: [
          { text: "5x + 2y = 19", correct: true },
          { text: "2x + 5y = 19", correct: false },
          { text: "5x - 2y = 19", correct: false },
          { text: "7(x+y) = 19", correct: false }
        ]
      }
    ]
  },
  {
    id: 4,
    status: 'locked',
    quizzes: [
      {
        question: "What is the y-intercept of the equation y = 4x + 8?",
        options: [
          { text: "4", correct: false },
          { text: "8", correct: true },
          { text: "-4", correct: false },
          { text: "x", correct: false }
        ]
      }
    ]
  },
  {
    id: 5,
    status: 'locked',
    quizzes: [
      {
        question: "What is the slope of the equation y = -3x + 5?",
        options: [
          { text: "5", correct: false },
          { text: "3", correct: false },
          { text: "-3", correct: true },
          { text: "x", correct: false }
        ]
      }
    ]
  }
];
