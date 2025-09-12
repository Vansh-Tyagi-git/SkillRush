// Stores all journey/quiz data
// Each level now has a "quizzes" array, allowing for multiple questions per level.
export const journeyData = [
    {
      id: 0,
      status: 'unlocked',
      quizzes: [
        {
          question: "Le chat est sur la table.",
          options: [
            { text: "The cat is on the table.", correct: true },
            { text: "The dog is under the chair.", correct: false }
          ]
        },
        {
          question: "La femme mange une pomme.",
          options: [
            { text: "The woman eats an apple.", correct: true },
            { text: "The man drinks water.", correct: false }
          ]
        }
      ]
    },
    {
      id: 1,
      status: 'locked',
      quizzes: [
        {
          question: "J'aime les pommes.",
          options: [
            { text: "I like pears.", correct: false },
            { text: "I like apples.", correct: true }
          ]
        },
        {
          question: "Il lit un livre.",
          options: [
            { text: "He reads a book.", correct: true },
            { text: "She writes a letter.", correct: false }
          ]
        },
        {
            question: "Nous sommes étudiants.",
            options: [
              { text: "They are teachers.", correct: false },
              { text: "We are students.", correct: true }
            ]
        }
      ]
    },
    {
      id: 2,
      status: 'locked',
      quizzes: [
        {
          question: "Où est la gare ?",
          options: [
            { text: "Where is the train station?", correct: true },
            { text: "When is the train?", correct: false }
          ]
        }
      ]
    },
    {
      id: 3,
      status: 'locked',
      quizzes: [
        {
          question: "Il fait beau aujourd'hui.",
          options: [
            { text: "He is handsome today.", correct: false },
            { text: "The weather is nice today.", correct: true }
          ]
        }
      ]
    },
    {
      id: 4,
      status: 'locked',
      quizzes: [
        {
          question: "C'est combien ?",
          options: [
            { text: "How is this?", correct: false },
            { text: "How much is it?", correct: true }
          ]
        }
      ]
    },
    {
      id: 5,
      status: 'locked',
      quizzes: [
        {
          question: "Je ne comprends pas.",
          options: [
            { text: "I don't understand.", correct: true },
            { text: "I am not coming.", correct: false }
          ]
        }
      ]
    }
  ];

