
(function() {
  if (window.BuddyWidgetLoaded) return;
  window.BuddyWidgetLoaded = true;


  if (!document.querySelector('link[href*="buddy_widget.css"]')) {

    const link = document.createElement('link');

    link.rel = 'stylesheet';

    link.href = '/css/buddy_widget.css';

    document.head.appendChild(link);
  }


  const button = document.createElement('div');

  button.className = 'buddy-widget-button';

  button.innerText = 'B';

  button.title = 'Chat with Buddy';

  document.body.appendChild(button);

 
  const popup = document.createElement('div');
  popup.className = 'buddy-widget-popup';
  popup.style.display = 'none';
  popup.innerHTML = `
    <div class="buddy-widget-header">
      <span>Buddy</span>
      <button class="buddy-widget-close" title="Close">&times;</button>
    </div>
    <div class="buddy-widget-messages" id="buddyWidgetMessages"></div>
    <form class="buddy-widget-input-area">
      <input class="buddy-widget-input" type="text" placeholder="Ask me anything..." required />
      <button class="buddy-widget-send" type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(popup);

 
  button.addEventListener('click', () => {
    popup.style.display = 'flex';
    setTimeout(() => {
      const messagesDiv = popup.querySelector('.buddy-widget-messages');
     
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
     
      popup.querySelector('.buddy-widget-input').focus();
    }, 100);
  });
  popup.querySelector('.buddy-widget-close').onclick = () => {
    popup.style.display = 'none';
  };

  
  const messagesDiv = popup.querySelector('.buddy-widget-messages');
  
  const input = popup.querySelector('.buddy-widget-input');
  
  const form = popup.querySelector('.buddy-widget-input-area');

  function addMessage(text, sender) {
   
    const msg = document.createElement('div');
   
    msg.className = 'buddy-widget-message ' + sender;
   
    msg.innerHTML = text;
   
    messagesDiv.appendChild(msg);
   
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendToBuddy(message) {

    addMessage(message, 'user');

    addMessage('<span style="opacity:0.7;">Buddy is typing...</span>', 'buddy');

    try {

      const res = await fetch('/api/groq-quiz-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });
      const data = await res.json();


      messagesDiv.removeChild(messagesDiv.lastChild);
      if (data && data.result) {
        addMessage(data.result, 'buddy');
      } else {
        addMessage('Sorry, I could not get a response.', 'buddy');
      }
    } catch (e) {
      messagesDiv.removeChild(messagesDiv.lastChild);
      addMessage('Error connecting to Buddy.', 'buddy');
    }
  }

  form.onsubmit = function(e) {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    sendToBuddy(val);
    input.value = '';
  };

  
  addMessage('Hi! I\'m Buddy. Ask me anything or get study help!', 'buddy');
})();
