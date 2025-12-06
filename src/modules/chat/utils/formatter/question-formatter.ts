export const formatQuestionForSpeech = (questions: any[]): string => {
    if (!questions || questions.length === 0) {
      return "No questions available.";
    }
  
    let speechText = "";
  
    questions.forEach((question, index) => {
      if (questions.length > 1) {
        speechText += `Question ${index + 1}: `;
      }
      
      speechText += question.question + " ";
      
      if (question.options && question.options.length > 0) {
        speechText += "The options are: ";
        question.options.forEach((option: string, optionIndex: number) => {
          const letter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          speechText += `${letter}. ${option}. `;
        });
      }
      
      if (index < questions.length - 1) {
        speechText += " Next question: ";
      }
    });
  
    return speechText;
  };