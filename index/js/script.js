/**
 * Clase Evento - Representa un evento gastronómico básico
 */
class Evento {
  #id;
  #nombre;
  #fecha;
  #ubicacion;
  #costo;
  #imagen;

  constructor(data) {
    this.#id = data.id;
    this.#nombre = data.nombre;
    this.#fecha = data.fecha;
    this.#ubicacion = data.ubicacion;
    this.#costo = data.costo;
    this.#imagen = data.imagen;
  }

  getId() { return this.#id; }
  getNombre() { return this.#nombre; }
  getFecha() { return this.#fecha; }
  getUbicacion() { return this.#ubicacion; }
  getCosto() { return this.#costo; }
  getImagen() { return this.#imagen; }

  getDetailedInfoHover() {
    return `<strong>${this.#nombre}</strong><br>
            <small>${this.#fecha} | ${this.#ubicacion} | ${this.#costo}</small>`;
  }

  getPopupInfo() {
    return {
      nombre: this.#nombre,
      imagen: this.#imagen,
      fecha: this.#fecha,
      ubicacion: this.#ubicacion,
      costo: this.#costo
    };
  }
}

/**
 * Clase EventoGastronomico - Extiende Evento con información específica de gastronomía
 */
class EventoGastronomico extends Evento {
  #tipoCocina;
  #chefInvitado;

  constructor(data) {
    super(data);
    this.#tipoCocina = data.tipoCocina || 'General';
    this.#chefInvitado = data.chefInvitado || 'No especificado';
  }

  getTipoCocina() { return this.#tipoCocina; }
  getChefInvitado() { return this.#chefInvitado; }

  getDetailedInfoHover() {
    const baseInfo = super.getDetailedInfoHover();
    return `${baseInfo}<br>
            <small>Cocina: ${this.#tipoCocina} | Chef: ${this.#chefInvitado}</small>`;
  }

  getPopupInfo() {
    const baseInfo = super.getPopupInfo();
    return {
        ...baseInfo,
        tipoCocina: this.#tipoCocina,
        chefInvitado: this.#chefInvitado
    };
  }
}

/**
 * Clase DataManager - Maneja el almacenamiento local de datos
 */
class DataManager {
  constructor() {
    this.#validateLocalStorage();
  }

  /**
   * Valida que localStorage esté disponible
   */
  #validateLocalStorage() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
    } catch (e) {
      console.warn('localStorage no está disponible:', e);
    }
  }

  /**
   * Guarda eventos seleccionados en localStorage
   */
  saveSelectedEvents(eventIds) {
    try {
      localStorage.setItem("eventosSeleccionados", JSON.stringify({ eventos: eventIds }));
      return true;
    } catch (error) {
      console.error('Error al guardar eventos:', error);
      return false;
    }
  }

  /**
   * Carga eventos seleccionados desde localStorage
   */
  loadSelectedEvents() {
    try {
      const data = JSON.parse(localStorage.getItem("eventosSeleccionados"));
      return (data && Array.isArray(data.eventos)) ? data.eventos : [];
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      return [];
    }
  }

  /**
   * Guarda datos de registro de usuario
   */
  saveUserRegistration(registrationData) {
    try {
      localStorage.setItem("registroEventos", JSON.stringify(registrationData));
      return true;
    } catch (error) {
      console.error('Error al guardar registro:', error);
      return false;
    }
  }

  /**
   * Carga datos de registro de usuario
   */
  loadUserRegistration() {
    try {
      return JSON.parse(localStorage.getItem("registroEventos"));
    } catch (error) {
      console.error('Error al cargar registro:', error);
      return null;
    }
  }

  /**
   * Limpia datos de registro de usuario
   */
  clearUserRegistrationData() {
    try {
      localStorage.removeItem("registroEventos");
      return true;
    } catch (error) {
      console.error('Error al limpiar registro:', error);
      return false;
    }
  }
  
  /**
   * Limpia todos los datos
   */
  clearAllData() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar datos:', error);
      return false;
    }
  }
}

/**
 * Clase Validator - Maneja todas las validaciones del formulario
 */
class Validator {
  /**
   * Valida formato de email
   */
  static isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de DNI
   */
  static isValidDNI(dni) {
    return /^\d{8}$/.test(dni);
  }

  /**
   * Valida formato de celular
   */
  static isValidCelular(celular) {
    return /^\d{9}$/.test(celular);
  }

  /**
   * Valida que el nombre no esté vacío
   */
  static isValidNombre(nombre) {
    return nombre.trim().length >= 2;
  }

  /**
   * Valida todos los campos del formulario
   */
  static validateForm(formData) {
    const errors = {};

    if (!this.isValidNombre(formData.nombre)) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!this.isValidEmail(formData.email)) {
      errors.email = 'Por favor, ingresa un correo electrónico válido';
    }

    if (!this.isValidDNI(formData.dni)) {
      errors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
    }

    if (!this.isValidCelular(formData.celular)) {
      errors.celular = 'El número de celular debe tener exactamente 9 dígitos numéricos';
    }

    if (!formData.mayorEdad) {
      errors.mayorEdad = 'Debes aceptar los términos y condiciones';
    }

    return errors;
  }
}

/**
 * Clase AppManager - Maneja toda la lógica de la aplicación
 */
class AppManager {
  #eventos;
  #eventosSeleccionados;
  #dataManager;
  #maxEventos = 5; // Límite de eventos que se pueden seleccionar

  // Elementos del DOM
  #eventListContainer;
  #popupEvento;
  #popupEventoInfo;
  #popupConfirmacion;
  #popupMensaje;
  #popupCancelar;
  #userForm;
  #btnNuevoRegistro;
  #btnCerrarMensaje;
  #btnConfirmarCancelar;
  #btnCancelarCancelar;
  #loadingOverlay;

  #eventoAEliminar;

  constructor(datosEventosRaw) {
    this.#dataManager = new DataManager();
    this.#eventos = this.#createEventos(datosEventosRaw);
    this.#eventosSeleccionados = this.#dataManager.loadSelectedEvents();
    this.#initializeDOM();
    this.#bindEvents();
    this.#cargarDatosUsuarioYEventosUI();
  }

  /**
   * Crea instancias de eventos desde datos raw
   */
  #createEventos(datosEventosRaw) {
    return datosEventosRaw.map(data => {
      if (data.tipoCocina) {
        return new EventoGastronomico(data);
      }
      return new Evento(data);
    });
  }

  /**
   * Inicializa referencias a elementos del DOM
   */
  #initializeDOM() {
    this.#eventListContainer = document.getElementById("event-selection-list");
    this.#popupEvento = document.getElementById("popup-evento");
    this.#popupEventoInfo = document.getElementById("popup-evento-info");
    this.#popupConfirmacion = document.getElementById("popup-confirmacion");
    this.#popupMensaje = document.getElementById("popup-mensaje");
    this.#popupCancelar = document.getElementById("popup-cancelar");
    this.#userForm = document.getElementById("user-event-form");
    this.#btnNuevoRegistro = document.getElementById("btn-nuevo-registro");
    this.#btnCerrarMensaje = document.getElementById("btn-cerrar-mensaje");
    this.#btnConfirmarCancelar = document.getElementById("btn-confirmar-cancelar");
    this.#btnCancelarCancelar = document.getElementById("btn-cancelar-cancelar");
    this.#loadingOverlay = document.getElementById("loading-overlay");
    this.#eventoAEliminar = null;
  }

  /**
   * Vincula eventos del DOM
   */
  #bindEvents() {
    this.#btnCerrarMensaje.addEventListener("click", () => {
      this.#hidePopup(this.#popupMensaje);
    });

    this.#btnNuevoRegistro.addEventListener("click", () => {
      this.#resetForm();
      this.#hidePopup(this.#popupConfirmacion);
    });

    this.#userForm.addEventListener("submit", (e) => this.#confirmarRegistro(e));

    this.#btnConfirmarCancelar.addEventListener("click", () => {
      if (this.#eventoAEliminar !== null) {
        this.#eliminarSuscripcion(this.#eventoAEliminar);
        this.#eventoAEliminar = null;
        this.#hidePopup(this.#popupCancelar);
      }
    });

    this.#btnCancelarCancelar.addEventListener("click", () => {
      this.#eventoAEliminar = null;
      this.#hidePopup(this.#popupCancelar);
    });

    this.#eventListContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-toggle"); 
      if (btn) { 
        this.#gestionarEvento(e);
      }
    });

    // Navegación por teclado
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.#closeAllPopups();
      }
    });

    // Manejo de errores de imágenes
    this.#handleImageErrors();
  }

  /**
   * Maneja errores de carga de imágenes
   */
  #handleImageErrors() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('error', () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==';
        img.alt = 'Imagen no disponible';
      });
    });
  }

  /**
   * Muestra popup con animación
   */
  #showPopup(popup) {
    popup.classList.remove("hidden");
    popup.setAttribute("aria-hidden", "false");
    
    // Focus en el primer elemento interactivo
    const firstFocusable = popup.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Oculta popup con animación
   */
  #hidePopup(popup) {
    popup.classList.add("hidden");
    popup.setAttribute("aria-hidden", "true");
  }

  /**
   * Cierra todos los popups
   */
  #closeAllPopups() {
    const popups = [this.#popupEvento, this.#popupConfirmacion, this.#popupMensaje, this.#popupCancelar];
    popups.forEach(popup => this.#hidePopup(popup));
  }

  /**
   * Muestra loading
   */
  #showLoading() {
    this.#loadingOverlay.classList.remove("hidden");
  }

  /**
   * Oculta loading
   */
  #hideLoading() {
    this.#loadingOverlay.classList.add("hidden");
  }

  /**
   * Muestra eventos en la interfaz
   */
  #mostrarEventos() {
    this.#eventListContainer.innerHTML = "";

    this.#eventos.forEach(evento => {
      const wrapper = document.createElement("div");
      wrapper.className = "evento-wrapper";

      const card = document.createElement("div");
      card.className = "evento-card";
      card.innerHTML = `
        <img src="img/${evento.getImagen()}" alt="${evento.getNombre()}" loading="lazy" />
        <div class="info-hover">
          ${evento.getDetailedInfoHover()}
        </div>
      `;

      const toggleBtns = document.createElement("div");
      toggleBtns.className = "toggle-buttons";
      toggleBtns.innerHTML = `
        <button class="btn-toggle" data-id="${evento.getId()}" data-action="suscribir" aria-label="Suscribirse a ${evento.getNombre()}">Suscribirse</button>
        <button class="btn-toggle" data-id="${evento.getId()}" data-action="cancelar" disabled aria-label="Cancelar suscripción a ${evento.getNombre()}">Cancelar</button>
      `;

      wrapper.appendChild(card);
      wrapper.appendChild(toggleBtns);
      this.#eventListContainer.appendChild(wrapper);
    });

    this.#actualizarBotonesEventosUI();
  }

  /**
   * Gestiona eventos de botones
   */
  #gestionarEvento(e) {
    e.preventDefault();

    const btn = e.target.closest(".btn-toggle"); 
    if (!btn) return; 

    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;

    const eventoEncontrado = this.#eventos.find(evt => evt.getId() === id);
    if (!eventoEncontrado) {
        this.#mostrarMensaje("Error: Evento no encontrado.");
        return;
    }

    if (action === "suscribir") {
      if (this.#eventosSeleccionados.includes(id)) {
        this.#mostrarMensaje("Ya estás suscrito a este evento.");
        return;
      }
      
      if (this.#eventosSeleccionados.length >= this.#maxEventos) {
        this.#mostrarMensaje(`Solo puedes suscribirte a un máximo de ${this.#maxEventos} eventos.`);
        return;
      }
      
      this.#mostrarPopupEvento(eventoEncontrado);
    } else if (action === "cancelar") {
      if (!this.#eventosSeleccionados.includes(id)) {
        this.#mostrarMensaje("No estás suscrito a este evento.");
        return;
      }
      this.#eventoAEliminar = id;
      this.#showPopup(this.#popupCancelar);
    }
  }

  /**
   * Muestra popup de evento
   */
  #mostrarPopupEvento(evento) {
    const info = evento.getPopupInfo();

    this.#popupEventoInfo.innerHTML = `
      <h2 id="popup-evento-title">${info.nombre}</h2>
      <img src="img/${info.imagen}" alt="${info.nombre}" loading="lazy" />
      <p><strong>Fecha:</strong> ${info.fecha}</p>
      <p><strong>Ubicación:</strong> ${info.ubicacion}</p>
      <p><strong>Costo:</strong> ${info.costo}</p>
      ${info.tipoCocina ? `<p><strong>Tipo de Cocina:</strong> ${info.tipoCocina}</p>` : ''}
      ${info.chefInvitado ? `<p><strong>Chef Invitado:</strong> ${info.chefInvitado}</p>` : ''}
      <button id="btn-confirmar-evento" class="btn-submit">Confirmar Suscripción</button>
    `;

    this.#showPopup(this.#popupEvento);

    const btnConfirmarEvento = document.getElementById("btn-confirmar-evento");
    btnConfirmarEvento.onclick = () => {
      this.#eventosSeleccionados.push(evento.getId());
      this.#dataManager.saveSelectedEvents(this.#eventosSeleccionados);
      this.#actualizarBotonesEventosUI();
      this.#hidePopup(this.#popupEvento);
      this.#mostrarMensaje(`Te has suscrito exitosamente a "${evento.getNombre()}"`);
    };
  }

  /**
   * Confirma registro del formulario
   */
  #confirmarRegistro(e) {
    e.preventDefault();

    const formData = {
      nombre: document.getElementById("user-name").value.trim(),
      email: document.getElementById("user-email").value.trim(),
      dni: document.getElementById("user-dni").value.trim(),
      celular: document.getElementById("user-celular").value.trim(),
      mayorEdad: document.getElementById("user-age-check").checked
    };

    // Limpiar mensajes de error anteriores
    this.#clearErrorMessages();

    // Validar formulario
    const errors = Validator.validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      this.#showFieldErrors(errors);
      return;
    }

    if (this.#eventosSeleccionados.length === 0) {
      this.#mostrarMensaje("Por favor, suscríbete al menos a un evento antes de continuar.");
      return;
    }

    this.#showLoading();

    // Simular procesamiento
    setTimeout(() => {
      this.#hideLoading();
      this.#showConfirmationPopup(formData);
    }, 1000);
  }

  /**
   * Limpia mensajes de error
   */
  #clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
  }

  /**
   * Muestra errores de campos específicos
   */
  #showFieldErrors(errors) {
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`${field}-error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
      }
    });
  }

  /**
   * Muestra popup de confirmación
   */
  #showConfirmationPopup(formData) {
    document.getElementById("conf-user-name").textContent = formData.nombre;
    document.getElementById("conf-user-email").textContent = formData.email;
    document.getElementById("conf-user-dni").textContent = formData.dni;
    document.getElementById("conf-user-celular").textContent = formData.celular;

    const lista = document.getElementById("conf-event-list");
    lista.innerHTML = "";
    this.#eventosSeleccionados.forEach(id => {
      const evento = this.#eventos.find(evt => evt.getId() === id);
      if (evento) {
        const li = document.createElement("li");
        li.textContent = evento.getNombre();
        lista.appendChild(li);
      }
    });

    const datosRegistro = { 
      ...formData, 
      eventos: this.#eventosSeleccionados 
    };
    this.#dataManager.saveUserRegistration(datosRegistro);

    this.#showPopup(this.#popupConfirmacion);
  }

  /**
   * Muestra mensaje al usuario
   */
  #mostrarMensaje(texto) {
    document.getElementById("mensaje-texto").textContent = texto;
    this.#showPopup(this.#popupMensaje);
  }

  /**
   * Actualiza la UI de los botones de eventos
   */
  #actualizarBotonesEventosUI() {
    this.#eventos.forEach(evento => {
      const id = evento.getId();
      const suscribirBtn = this.#eventListContainer.querySelector(`.btn-toggle[data-id="${id}"][data-action="suscribir"]`);
      const cancelarBtn = this.#eventListContainer.querySelector(`.btn-toggle[data-id="${id}"][data-action="cancelar"]`);

      if (suscribirBtn && cancelarBtn) {
        if (this.#eventosSeleccionados.includes(id)) {
          suscribirBtn.textContent = "Suscrito";
          suscribirBtn.disabled = true;
          suscribirBtn.classList.add("suscrito");
          cancelarBtn.disabled = false;
        } else {
          suscribirBtn.textContent = "Suscribirse";
          suscribirBtn.disabled = false;
          suscribirBtn.classList.remove("suscrito");
          cancelarBtn.disabled = true;
        }
      }
    });
  }

  /**
   * Carga datos de usuario y actualiza UI
   */
  #cargarDatosUsuarioYEventosUI() {
    this.#eventosSeleccionados = this.#dataManager.loadSelectedEvents();
    this.#actualizarBotonesEventosUI();

    const datosRegistroGuardados = this.#dataManager.loadUserRegistration();
    if (datosRegistroGuardados) {
        document.getElementById("user-name").value = datosRegistroGuardados.nombre || '';
        document.getElementById("user-email").value = datosRegistroGuardados.email || '';
        document.getElementById("user-dni").value = datosRegistroGuardados.dni || '';
        document.getElementById("user-celular").value = datosRegistroGuardados.celular || '';
        document.getElementById("user-age-check").checked = true;
    }
  }

  /**
   * Elimina suscripción a un evento
   */
  #eliminarSuscripcion(id) {
    this.#eventosSeleccionados = this.#eventosSeleccionados.filter(eid => eid !== id);
    this.#dataManager.saveSelectedEvents(this.#eventosSeleccionados);
    this.#actualizarBotonesEventosUI();
    
    const evento = this.#eventos.find(evt => evt.getId() === id);
    if (evento) {
      this.#mostrarMensaje(`Has cancelado tu suscripción a "${evento.getNombre()}"`);
    }
  }

  /**
   * Resetea el formulario
   */
  #resetForm() {
    this.#userForm.reset();
    this.#clearErrorMessages();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.#mostrarEventos();
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const datosEventos = [
    { id: 1, nombre: "Cata de Vinos Premium", fecha: "2025-09-10", ubicacion: "Hotel Gourmet Plaza", costo: "S/ 150", imagen: "vinos.jpeg", tipoCocina: "Vinos y Aperitivos", chefInvitado: "Sommelier Ricardo Paz" },
    { id: 2, nombre: "Festival del Ceviche", fecha: "2025-10-05", ubicacion: "Costa Verde", costo: "S/ 80", imagen: "ceviche.jpeg", tipoCocina: "Comida Marina Peruana", chefInvitado: "Chef Gastón Acurio" },
    { id: 3, nombre: "Taller de Cócteles Exóticos", fecha: "2025-11-02", ubicacion: "Bar Central", costo: "S/ 120", imagen: "cocteles.jpeg" },
    { id: 4, nombre: "Clase de Cocina Nikkei", fecha: "2025-12-01", ubicacion: "Escuela Gastronómica", costo: "S/ 130", imagen: "nikkei.jpeg", tipoCocina: "Fusión Peruano-Japonesa", chefInvitado: "Mitsuharu Tsumura" },
    { id: 5, nombre: "Feria Internacional de Pastelería", fecha: "2025-12-18", ubicacion: "ExpoCenter Lima", costo: "S/ 90", imagen: "pasteleria.jpeg" },
  ];

  const app = new AppManager(datosEventos);
  app.init();
});