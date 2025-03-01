document.addEventListener("DOMContentLoaded", function () {
    const quiz = [
        {
            question: "Which animal is known as the 'Ship of the Desert'?",
            answer: "CAMEL"
        },
        {
            question: "How many days are there in a week? (Number)",
            answer: "7"
        },
        {
            question: "How many hours are there in a day? (Number)",
            answer: "24"
        },
        {
            question: "How many letters are there in the English alphabet? (Number)",
            answer: "26"
        },
        {
            question: "Rainbow consist of how many colours? (Number)",
            answer: "7"
        },
        {
            question: "How many days are there in a year? (Number)",
            answer: "365"
        },
        {
            question: " How many minutes are there in an hour? (Number)",
            answer: "60"
        },
        {
            question: "Baby frog is known as.......",
            answer: "TADPOLE"
        },
        {
            question: "Which animal is known as the king of the jungle? (Animal)",
            answer: "LION"
        },
        {
            question: "Which is the smallest month of the year?",
            answer: "FEBRUARY"
        },
    ]

    const extensinUI = document.getElementById('extension');
    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("reset");
    const timerDisplay = document.getElementById("timer");
    const nextButton = document.getElementById('next');
    const question = document.getElementById('question');
    const answer = document.getElementById('answer-input');
    const quizPage = document.getElementById('quiz');
    let currentQuiz = 0;
    let score = 0;
    
    quizPage.style.display = "none";

    // Update the timer display
    function updateTimerDisplay(secondsLeft) {
        let hours = Math.floor(secondsLeft / 3600);
        let minutes = Math.floor((secondsLeft % 3600) / 60);
        let seconds = secondsLeft % 60;
        timerDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function loadQuiz() {
        if (currentQuiz >= quiz.length) {
            loadResult();
        }
        else {
            answer.value = '';
            question.innerText = quiz[currentQuiz].question;
        }
    }
    
    function checkAnswer() {
        const currentAnswer = answer.value.toUpperCase();
    
        if (!currentAnswer) return;
    
        
        if (currentAnswer === quiz[currentQuiz].answer) {
            score++;
        }
        currentQuiz++;
        loadQuiz();
    }
    
    function loadResult() {
        quizPage.innerHTML = `
        <div id="result">
            <h3>You scored ${score} out of ${quiz.length}.</h3>
            <h3>Youtube access has been granted.</h3>
        </div>
        `;
        chrome.runtime.sendMessage({ action: "unblockYoutube" });

    }

    // Listen for timer updates from background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateTimer") {
            updateTimerDisplay(message.time);
        }
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "quizTime") {
            extensinUI.style.display = "none";
            quizPage.style.display = "block";
            loadQuiz();
        }
    });
    

    // Start and stop buttons
    startButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "startTimer" });
    });

    stopButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "stopTimer" });
    });

    nextButton.addEventListener("click", () => {
        checkAnswer();
    })

    // Request current timer state on popup open
    chrome.runtime.sendMessage({ action: "getTimer" }, (response) => {
        if (response && response.time === 0) {
            extensinUI.style.display = "none";
            quizPage.style.display = "block";
            loadQuiz();
        } else if (response && response.time !== undefined) {
            extensinUI.style.display = "block";
            quizPage.style.display = "none";
            updateTimerDisplay(response.time);
        }
    });
});
