// import bot from './assets/bot.svg'
// import user from './assets/user.svg'

const bot = './assets/bot.svg';
const user = './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    );
}

async function fetchWithRetry(url, options, retries = 3, backoff = 500) {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 && retries > 0) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetchWithRetry(url, options, retries - 1, backoff * 2)
                        .then(resolve)
                        .catch(reject);
                }, backoff);
            });
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetchWithRetry(url, options, retries - 1, backoff * 2)
                        .then(resolve)
                        .catch(reject);
                }, backoff);
            });
        } else {
            throw error;
        }
    }
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    const response = await fetchWithRetry('https://five4287xv2.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
};

form.addEventListener('submit', async (e) => handleSubmit(e));
form.addEventListener('keyup', async (e)

