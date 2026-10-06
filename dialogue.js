document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const answerInput = document.getElementById('answerInput');
  const messagesContainer = document.getElementById('messagesContainer');
  const scenarioSelect = document.getElementById('scenarioSelect');
  const micBtn = document.getElementById('micBtn');

  // Первые фразы
  const initialBotMessages = {
    ordering: 'Сәлем! Ресторанымызға кош келдіңіз! Не тапсырыс бересіз?',
    greeting: 'Сәлем! Менің атым TilEM Bot. Сенің атың кім?',
    directions: 'Кешіріңіз, Байтерекке қалай баруға болады?',
    shopping: 'Сәлеметсіз бе! Сізге қалай көмектесе аламын?'
  };

  // Прокрутка
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Новое сообщение
  function appendMessage(sender, text, isAi = false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', isAi ? 'ai-message' : 'user-message');

    msgDiv.innerHTML = `
      <span class="message-name">${sender}</span>
      <p>${text}</p>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  // Ответ бота
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userText = answerInput.value.trim();
    if (!userText) return;

    // 1. Показываем сообщение пользователя
    appendMessage('Оралхан', userText, false);
    answerInput.value = '';

    // 2. Имитация ответа
    setTimeout(() => {
      appendMessage('TilEM Bot', 'Жақсы! Тағы не айтқыңыз келеді? (Great! What else would you like to say?)', true);
    }, 1000);
  });

  // Переключение сценариев
  scenarioSelect.addEventListener('change', (e) => {
    const scenario = e.target.value;
    messagesContainer.innerHTML = ''; // очистить старый чат
    if (initialBotMessages[scenario]) {
      appendMessage('TilEM Bot', initialBotMessages[scenario], true);
    }
  });

  // Заглушка для голосового ввода
  micBtn.addEventListener('click', () => {
    alert('Voice input (Speech-to-Text) will be connected via Backend / Web Speech API!');
  });
});