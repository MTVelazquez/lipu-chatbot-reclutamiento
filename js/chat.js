// ============================================================
// LIPU Monterrey - Chatbot de Reclutamiento
// Pure frontend, rule-based state machine
// ============================================================

(function () {
  'use strict';

  // ---- DOM References ----
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const quickReplies = document.getElementById('quick-replies');
  const inputArea = document.getElementById('input-area');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const restartArea = document.getElementById('restart-area');
  const restartBtn = document.getElementById('restart-btn');
  const dataSaved = document.getElementById('data-saved');

  // ---- State ----
  let state = {};

  function resetState() {
    state = {
      currentStep: 'WELCOME',
      path: null,
      candidate: {
        nombre: '',
        perfil: '',
        tiene_licencia: '',
        estado_licencia: '',
        trabajo_previo: '',
        municipio_colonia: '',
        telefono: '',
        sabe_estandar: '',
        tipo_vehiculo: '',
        interesa_entrevista: ''
      }
    };
  }

  // ---- Time helper ----
  function getTimeString() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
           now.getMinutes().toString().padStart(2, '0');
  }

  // ---- Scroll to bottom ----
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  // ---- Add message bubble ----
  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;
    if (sender === 'bot') msgDiv.classList.add('new-message');

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getTimeString();

    msgDiv.appendChild(textDiv);
    msgDiv.appendChild(timeDiv);
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  // ---- Show typing indicator ----
  function showTyping() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
  }

  function hideTyping() {
    typingIndicator.classList.add('hidden');
  }

  // ---- Show quick reply buttons ----
  function showButtons(labels) {
    quickReplies.innerHTML = '';
    labels.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => handleButtonClick(label));
      quickReplies.appendChild(btn);
    });
    quickReplies.classList.remove('hidden');
    inputArea.classList.add('hidden');
    scrollToBottom();
  }

  // ---- Show text input ----
  function showInput(placeholder) {
    userInput.placeholder = placeholder || 'Escribe tu respuesta...';
    inputArea.classList.remove('hidden');
    quickReplies.classList.add('hidden');
    userInput.value = '';
    userInput.focus();
    scrollToBottom();
  }

  // ---- Hide all input controls ----
  function hideAllInputs() {
    quickReplies.classList.add('hidden');
    inputArea.classList.add('hidden');
  }

  // ---- Show restart ----
  function showRestart() {
    restartArea.classList.remove('hidden');
    scrollToBottom();
  }

  // ---- Show data saved indicator ----
  function showDataSaved() {
    dataSaved.classList.remove('hidden');
    setTimeout(() => {
      dataSaved.classList.add('hidden');
    }, 3200);
  }

  // ---- Bot sends a message with typing delay, then calls callback ----
  function botSay(text, callback) {
    hideAllInputs();
    showTyping();
    const delay = 500 + Math.random() * 300; // 500-800ms
    setTimeout(() => {
      hideTyping();
      addMessage(text, 'bot');
      if (callback) callback();
    }, delay);
  }

  // ---- Step definitions ----
  // Each step: { message(state) -> string, type: 'buttons'|'input'|'end', buttons?: [], placeholder?, next(answer, state) -> nextStep }

  const steps = {

    // ===================== WELCOME =====================
    WELCOME: {
      message: () =>
        '¡Hola! 👋 Bienvenido a Reclutamiento LiPU Monterrey.\n\nEn LiPU tenemos una misión clara: Movemos lo más valioso, conectamos destinos. 🚌✨\n\nQueremos que seas parte de este equipo que mueve a Monterrey. Cuéntanos, ¿cuál es tu perfil?',
      type: 'buttons',
      buttons: ['Soy Operador con Experiencia', 'Quiero Aprender'],
      next: (answer) => {
        if (answer === 'Soy Operador con Experiencia') {
          state.path = 'A';
          state.candidate.perfil = 'Operador con Experiencia';
          return 'A_LICENSE';
        } else {
          state.path = 'B';
          state.candidate.perfil = 'Quiero Aprender';
          return 'B_WELCOME';
        }
      }
    },

    // ===================== PATH A: OPERADOR EXPERTO =====================
    A_LICENSE: {
      message: () =>
        '¡Excelente! Sabemos que para conectar destinos se necesita experiencia y seguridad al volante. 🏅\n\nPara ofrecerte las mejores rutas, confírmanos: ¿Cuentas con Licencia Tipo Local o Foránea vigente?',
      type: 'buttons',
      buttons: ['✅ Sí, vigente', '⚠️ Vencida', '❌ No tengo'],
      next: (answer) => {
        if (answer === '✅ Sí, vigente') {
          state.candidate.tiene_licencia = 'Sí';
          state.candidate.estado_licencia = 'Vigente';
        } else if (answer === '⚠️ Vencida') {
          state.candidate.tiene_licencia = 'Sí';
          state.candidate.estado_licencia = 'Vencida';
        } else {
          state.candidate.tiene_licencia = 'No';
          state.candidate.estado_licencia = 'No tengo';
        }
        return 'A_NAME';
      }
    },

    A_NAME: {
      message: () =>
        '¡Muy bien! Para ofrecerte las mejores rutas, confírmanos:\n\nNombre completo:',
      type: 'input',
      placeholder: 'Tu nombre completo...',
      next: (answer) => {
        state.candidate.nombre = answer.trim();
        return 'A_PREVIOUS_WORK';
      }
    },

    A_PREVIOUS_WORK: {
      message: () =>
        `Gracias, ${state.candidate.nombre}. ¿Has laborado en LiPU, Settepi o Utep?`,
      type: 'buttons',
      buttons: ['✅ Sí', '❌ No'],
      next: (answer) => {
        state.candidate.trabajo_previo = answer === '✅ Sí' ? 'Sí' : 'No';
        return 'A_LOCATION';
      }
    },

    A_LOCATION: {
      message: () =>
        '¿Dónde vives?\n\nMunicipio y colonia:',
      type: 'input',
      placeholder: 'Municipio y colonia...',
      next: (answer) => {
        state.candidate.municipio_colonia = answer.trim();
        return 'A_OFFER';
      }
    },

    A_OFFER: {
      message: () =>
        '¡Perfecto! Buscamos operadores que entiendan la responsabilidad de mover personas.\n\nTu oferta LiPU:\n\n💰 Estabilidad: Pago Semanal\n🏆 Reconocimiento: Bonos por rendimiento\n🛒 Vales de despensa\n📚 Capacitación pagada\n\n¿Te interesa agendar una entrevista?',
      type: 'buttons',
      buttons: ['✅ Sí, me interesa', '❌ No por ahora'],
      next: (answer) => {
        if (answer === '✅ Sí, me interesa') {
          state.candidate.interesa_entrevista = 'Sí';
          return 'A_PHONE';
        } else {
          state.candidate.interesa_entrevista = 'No';
          return 'A_LATER';
        }
      }
    },

    A_PHONE: {
      message: () =>
        '¡Excelente! Un reclutador enseguida se comunicará contigo.\n\nNos proporcionas tu número telefónico a 10 dígitos:',
      type: 'input',
      placeholder: 'Ej: 8112345678',
      validate: (answer) => {
        const digits = answer.replace(/\D/g, '');
        return digits.length === 10;
      },
      errorMessage: 'Por favor ingresa un número telefónico válido a 10 dígitos.',
      next: (answer) => {
        state.candidate.telefono = answer.replace(/\D/g, '');
        return 'A_DONE';
      }
    },

    A_DONE: {
      message: () =>
        `¡Gracias ${state.candidate.nombre}! 🎉\n\nTu información ha sido registrada. Un reclutador de LiPU se pondrá en contacto contigo pronto.\n\n¡Bienvenido al equipo que conecta destinos! 🚌✨`,
      type: 'end'
    },

    A_LATER: {
      message: () =>
        '¡Entendemos! Si cambias de opinión, no dudes en contactarnos.\n\nTe gustaría agendar en otro momento? Estamos aquí para ti. 🚌',
      type: 'end'
    },

    // ===================== PATH B: ESCUELA =====================
    B_WELCOME: {
      message: () =>
        '¡Buena decisión! 🎓 En la Escuela de Operadores LiPU te pagamos mientras aprendes y sales con trabajo seguro.\n\nPara entrar, solo necesitas:\n• Saber manejar estándar\n• Disponibilidad de horario para capacitación\n\n¿Sabes manejar estándar?',
      type: 'buttons',
      buttons: ['Sí, sé manejar', 'No, solo automático'],
      next: (answer) => {
        if (answer === 'No, solo automático') {
          state.candidate.sabe_estandar = 'No';
          return 'B_REJECTION';
        } else {
          state.candidate.sabe_estandar = 'Sí';
          return 'B_VEHICLE';
        }
      }
    },


    B_REJECTION: {
      message: () =>
        'Por el momento requerimos manejo básico de estándar. ¡Síguenos para futuras convocatorias! 👋\n\nTe deseamos mucho éxito.',
      type: 'end'
    },

    B_VEHICLE: {
      message: () =>
        '¿Qué tipo de unidades sabes manejar?',
      type: 'buttons',
      buttons: ['Vehículo estándar', 'Plataforma', 'Autobús', 'Otra'],
      next: (answer) => {
        state.candidate.tipo_vehiculo = answer;
        return 'B_NAME';
      }
    },

    B_NAME: {
      message: () =>
        '¡Perfecto! Para registrarte, dinos tu nombre completo:',
      type: 'input',
      placeholder: 'Tu nombre completo...',
      next: (answer) => {
        state.candidate.nombre = answer.trim();
        return 'B_OFFER';
      }
    },

    B_OFFER: {
      message: () =>
        `Gracias, ${state.candidate.nombre}. 💰 Durante tu capacitación recibirás un apoyo económico. Al graduarte, pasas a sueldo de Operador Profesional.\n\n¿Te interesa asistir a una entrevista?`,
      type: 'buttons',
      buttons: ['✅ Sí, me interesa', '❌ No por ahora'],
      next: (answer) => {
        if (answer === '✅ Sí, me interesa') {
          state.candidate.interesa_entrevista = 'Sí';
          return 'B_PHONE';
        } else {
          state.candidate.interesa_entrevista = 'No';
          return 'B_LATER';
        }
      }
    },

    B_PHONE: {
      message: () =>
        '¡Excelente! Un reclutador enseguida se comunicará contigo.\n\nNos proporcionas tu número telefónico a 10 dígitos:',
      type: 'input',
      placeholder: 'Ej: 8112345678',
      validate: (answer) => {
        const digits = answer.replace(/\D/g, '');
        return digits.length === 10;
      },
      errorMessage: 'Por favor ingresa un número telefónico válido a 10 dígitos.',
      next: (answer) => {
        state.candidate.telefono = answer.replace(/\D/g, '');
        return 'B_DONE';
      }
    },

    B_DONE: {
      message: () =>
        `¡Gracias ${state.candidate.nombre}! 🎉\n\nTu información ha sido registrada. Un reclutador de LiPU se pondrá en contacto contigo para la Escuela de Operadores.\n\n¡Bienvenido al equipo que conecta destinos! 🚌✨`,
      type: 'end'
    },

    B_LATER: {
      message: () =>
        '¡Entendemos! Si cambias de opinión, no dudes en contactarnos. ¡Te deseamos éxito! 👋',
      type: 'end'
    }
  };

  // ---- Execute a step ----
  function executeStep(stepName) {
    const step = steps[stepName];
    if (!step) return;

    state.currentStep = stepName;

    const text = step.message();
    botSay(text, () => {
      if (step.type === 'buttons') {
        showButtons(step.buttons);
      } else if (step.type === 'input') {
        showInput(step.placeholder);
      } else if (step.type === 'end') {
        hideAllInputs();
        // Log candidate data and show saved indicator for completion steps
        if (['A_DONE', 'B_DONE'].includes(stepName)) {
          console.log('=== DATOS DEL CANDIDATO ===');
          console.log(JSON.parse(JSON.stringify(state.candidate)));
          console.log('===========================');
          showDataSaved();
        }
        showRestart();
      }
    });
  }

  // ---- Handle button click ----
  function handleButtonClick(label) {
    quickReplies.classList.add('hidden');
    addMessage(label, 'user');

    const step = steps[state.currentStep];
    if (step && step.next) {
      const nextStep = step.next(label);
      executeStep(nextStep);
    }
  }

  // ---- Handle text input submission ----
  function handleTextSubmit() {
    const text = userInput.value.trim();
    if (!text) return;

    const step = steps[state.currentStep];
    if (!step) return;

    // Validate if needed
    if (step.validate && !step.validate(text)) {
      addMessage(text, 'user');
      botSay(step.errorMessage, () => {
        showInput(step.placeholder);
      });
      return;
    }

    addMessage(text, 'user');
    inputArea.classList.add('hidden');

    if (step.next) {
      const nextStep = step.next(text);
      executeStep(nextStep);
    }
  }

  // ---- Event listeners ----
  sendBtn.addEventListener('click', handleTextSubmit);

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    }
  });

  restartBtn.addEventListener('click', () => {
    // Clear chat
    chatMessages.innerHTML = '<div class="date-separator"><span>Hoy</span></div>';
    restartArea.classList.add('hidden');
    hideAllInputs();
    // Reset and start
    resetState();
    executeStep('WELCOME');
  });

  // ---- Initialize ----
  resetState();
  executeStep('WELCOME');

})();
