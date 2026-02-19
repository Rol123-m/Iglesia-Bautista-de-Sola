// ==================== CONFIGURACIÓN PREDETERMINADA ====================
const CONFIG_PREDETERMINADA = {
    BIN_ID: '69961800ae596e708f353340',
    API_KEY: '$2a$10$dIvq0wIoXhyOp0HoP09EretN7mTKeiZPMTyL4LJNpnP7m44LpBwyC',
    BASE_URL: 'https://api.jsonbin.io/v3',
    ADMIN_PASSWORD: 'SoloCristo2026' // Puedes cambiarla después
};

// ==================== VARIABLES GLOBALES ====================
let CONFIG = { ...CONFIG_PREDETERMINADA };
let datosCache = null;
let modalTipoActual = '';
let itemEditandoId = null;
let esAdmin = false;
let notificacionesLeidas = new Set(); // Para recordar qué notificaciones ha visto el usuario

// ==================== DATOS INICIALES ====================
const datosIniciales = {
    eventos: [
        // Eventos existentes
        { id: 'e1', titulo: 'Ayuno y Oración', descripcion: 'Por la evangelización', departamento: 'iglesia', fecha: '2026-03-07', hora: '08:00', responsable: 'Pastor' },
        { id: 'e2', titulo: 'Oración de Damas', descripcion: 'Madres por hijos', departamento: 'damas', fecha: '2026-02-02', hora: '15:00', responsable: 'Odilia' },
        { id: 'e3', titulo: 'Picnic Jóvenes', descripcion: 'En finca Sola 1', departamento: 'jovenes', fecha: '2026-02-13', hora: '15:00', responsable: 'Jóvenes' },
        { id: 'e4', titulo: 'Campaña Evangelística', descripcion: 'Día especial', departamento: 'iglesia', fecha: '2026-03-22', hora: '10:00', responsable: 'Todos' },
        { id: 'e5', titulo: 'Sábado Damas - Grupo 1', descripcion: 'Tema y devocional', departamento: 'damas', fecha: '2026-02-07', hora: '10:00', responsable: 'Yolexis' },
        { id: 'e6', titulo: 'Vigilia Damas', descripcion: 'Oración', departamento: 'damas', fecha: '2026-02-27', hora: '22:00', responsable: 'Damas' },
        { id: 'e7', titulo: 'Inicio Semana de Pasión', descripcion: 'Domingo de Ramos', departamento: 'iglesia', fecha: '2026-03-29', hora: '10:00', responsable: 'Pastor' },
        { id: 'e8', titulo: 'Jueves Santo', descripcion: 'La Cena del Señor', departamento: 'iglesia', fecha: '2026-04-02', hora: '20:00', responsable: 'Pastor' },
        { id: 'e9', titulo: 'Viernes Santo', descripcion: '7 Palabras', departamento: 'iglesia', fecha: '2026-04-03', hora: '15:00', responsable: 'Pastor' },
        { id: 'e10', titulo: 'Domingo Resurrección', descripcion: 'Matutino y culto', departamento: 'iglesia', fecha: '2026-04-05', hora: '07:30', responsable: 'Pastora' },
        { id: 'e11', titulo: 'Evento Alcance Jóvenes', descripcion: 'Caldosa y evangelio', departamento: 'jovenes', fecha: '2026-03-16', hora: '16:00', responsable: 'Jóvenes' },
        { id: 'e12', titulo: 'Confraternización', descripcion: 'Solteros y matrimonios', departamento: 'jovenes', fecha: '2026-04-13', hora: '10:00', responsable: 'Jóvenes' },
        
        // NUEVOS: Eventos de Juveniles
        { id: 'e13', titulo: 'Reunión Juveniles', descripcion: 'Estudio bíblico y dinámicas', departamento: 'juveniles', fecha: '2026-02-15', hora: '16:00', responsable: 'Michel' },
        { id: 'e14', titulo: 'Retiro Juvenil', descripcion: 'Fin de semana de convivencia', departamento: 'juveniles', fecha: '2026-03-20', hora: '09:00', responsable: 'Líderes juveniles' },
        { id: 'e15', titulo: 'Noche de Jóvenes', descripcion: 'Alabanza y palabra', departamento: 'juveniles', fecha: '2026-04-17', hora: '19:00', responsable: 'Michel' },
        
        // NUEVOS: Eventos de Ministerio Infantil
        { id: 'e16', titulo: 'Escuela Dominical Infantil', descripcion: 'Clases para niños', departamento: 'infantil', fecha: '2026-02-07', hora: '09:00', responsable: 'Maestros' },
        { id: 'e17', titulo: 'Reunión de Maestros', descripcion: 'Planificación mensual', departamento: 'infantil', fecha: '2026-02-14', hora: '10:00', responsable: 'Coordinador infantil' },
        { id: 'e18', titulo: 'Día del Niño', descripcion: 'Actividades especiales', departamento: 'infantil', fecha: '2026-04-12', hora: '10:00', responsable: 'Ministerio Infantil' },
        { id: 'e19', titulo: 'Manualidades Bíblicas', descripcion: 'Taller para niños', departamento: 'infantil', fecha: '2026-03-14', hora: '14:00', responsable: 'Maestras' },
        
        // NUEVOS: Eventos de Caballeros
        { id: 'e20', titulo: 'Reunión de Caballeros', descripcion: 'Tema: Liderazgo familiar', departamento: 'caballeros', fecha: '2026-02-14', hora: '09:00', responsable: 'Jarley' },
        { id: 'e21', titulo: 'Desayuno de Varones', descripcion: 'Compartir y oración', departamento: 'caballeros', fecha: '2026-03-14', hora: '08:00', responsable: 'Hnos. caballeros' },
        { id: 'e22', titulo: 'Confraternidad de Caballeros', descripcion: 'Deporte y compañerismo', departamento: 'caballeros', fecha: '2026-04-25', hora: '09:00', responsable: 'Caballeros' },
        { id: 'e23', titulo: 'Sábado de Caballeros', descripcion: 'Tema: El guerrero de Dios', departamento: 'caballeros', fecha: '2026-05-23', hora: '09:00', responsable: 'Jarley' },
        
        // NUEVOS: Eventos de Instituto Bíblico
        { id: 'e24', titulo: 'Inicio Instituto Bíblico', descripcion: 'Clase: Introducción a la Biblia', departamento: 'instituto', fecha: '2026-03-04', hora: '19:00', responsable: 'Pastor' },
        { id: 'e25', titulo: 'Instituto Bíblico - Módulo 2', descripcion: 'Clase: Antiguo Testamento', departamento: 'instituto', fecha: '2026-03-11', hora: '19:00', responsable: 'Pastor' },
        { id: 'e26', titulo: 'Instituto Bíblico - Módulo 3', descripcion: 'Clase: Nuevo Testamento', departamento: 'instituto', fecha: '2026-03-18', hora: '19:00', responsable: 'Pastor' },
        { id: 'e27', titulo: 'Instituto Bíblico - Módulo 4', descripcion: 'Clase: Hermenéutica', departamento: 'instituto', fecha: '2026-03-25', hora: '19:00', responsable: 'Pastor' },
        { id: 'e28', titulo: 'Instituto Bíblico - Examen', descripcion: 'Evaluación del mes', departamento: 'instituto', fecha: '2026-04-01', hora: '19:00', responsable: 'Pastor' },
        
        // Eventos de marzo adicionales
        { id: 'e29', titulo: 'Instituto Bíblico', descripcion: 'Clase regular', departamento: 'instituto', fecha: '2026-03-04', hora: '19:00', responsable: 'Pastor' },
        { id: 'e30', titulo: 'Instituto Bíblico', descripcion: 'Clase regular', departamento: 'instituto', fecha: '2026-03-18', hora: '19:00', responsable: 'Pastor' },
    ],
    anuncios: [
        { id: 'a1', titulo: 'Reunión de damas', descripcion: 'Confirmar asistencia', fecha: '2026-02-10' },
        { id: 'a2', titulo: 'Ensayo de música', descripcion: 'Sábado 4pm', fecha: '2026-02-12' },
        { id: 'a3', titulo: 'Instituto Bíblico', descripcion: 'Inicia el 4 de marzo - 7pm', fecha: '2026-02-20' },
        { id: 'a4', titulo: 'Reunión de Juveniles', descripcion: 'Todos los sábados 4pm', fecha: '2026-02-15' },
    ],
    ensenanzas: [
        { id: 'n1', titulo: 'Principios Bautistas', descripcion: 'Serie de enseñanzas', autor: 'Pastor', fecha: '2026-02-05', url: '' },
        { id: 'n2', titulo: 'Cómo hacer discípulos', descripcion: 'Taller misioneros', autor: 'Pastor', fecha: '2026-03-05', url: '' },
        { id: 'n3', titulo: 'La Fe sobre las obras', descripcion: 'Estudio', autor: 'Pastor', fecha: '2026-04-09', url: '' },
        { id: 'n4', titulo: 'Devocional familias', descripcion: 'Jarley y Yaneisy', autor: 'Jarley', fecha: '2026-05-21', url: '' },
        { id: 'n5', titulo: 'Liderazgo para Caballeros', descripcion: 'Serie para varones', autor: 'Jarley', fecha: '2026-02-14', url: '' },
        { id: 'n6', titulo: 'Enseñanza para Juveniles', descripcion: 'Identidad en Cristo', autor: 'Michel', fecha: '2026-02-15', url: '' },
        // Tus sermones
        { id: 'n7', titulo: 'El Corazón del problema', descripcion: 'Sermón: La raíz de nuestros conflictos', autor: 'Pastor', fecha: '2026-01-15', url: 'https://rol123-m.github.io/El-Coraz%C3%B3n-del-problema/' },
        { id: 'n8', titulo: 'Los procesos de Dios', descripcion: 'Sermón: El Dios de los procesos', autor: 'Pastor', fecha: '2026-01-22', url: 'https://rol123-m.github.io/Los-procesos-de-Dios-y-el-Dios-de-los-procesos/' },
        { id: 'n9', titulo: 'Esclavos del Tiempo', descripcion: 'Sermón: Nuestra relación con el tiempo', autor: 'Pastor', fecha: '2026-01-29', url: 'https://rol123-m.github.io/Esclavos-del-Tiempo/' },
        { id: 'n10', titulo: 'Un ejemplo digno de imitar', descripcion: 'Sermón: Modelos de fe', autor: 'Pastor', fecha: '2026-02-05', url: 'https://rol123-m.github.io/Un-ejemplo-digno-de-imitar/' },
        { id: 'n11', titulo: 'La Suficiencia de las Escrituras', descripcion: 'Sermón: La Palabra es suficiente', autor: 'Pastor', fecha: '2026-02-12', url: 'https://rol123-m.github.io/La-Suficiencia-de-Las-Escrituras.-/' },
        { id: 'n12', titulo: 'La singularidad de la Biblia', descripcion: 'Sermón: Un libro único', autor: 'Pastor', fecha: '2026-02-19', url: 'https://rol123-m.github.io/La-singularidad-de-la-Biblia/' },
    ],
    recursos: [
        { id: 'r1', titulo: 'Libro de Cantos', descripcion: 'PDF con himnos', tipo: 'documento', url: '' },
        { id: 'r2', titulo: 'Predicación: La Cruz', descripcion: 'Audio MP3', tipo: 'audio', url: '' },
        { id: 'r3', titulo: 'Calendario 2026', descripcion: 'Planificación completa', tipo: 'documento', url: '' },
        { id: 'r4', titulo: 'Material para Maestros', descripcion: 'Guías para escuela dominical', tipo: 'documento', url: '' },
        { id: 'r5', titulo: 'Estudio Bíblico - Instituto', descripcion: 'Apuntes del curso', tipo: 'documento', url: '' },
    ]
};

// ==================== FUNCIONES DE NOTIFICACIONES ====================

function cargarNotificacionesLeidas() {
    const leidas = localStorage.getItem('notificaciones_leidas');
    if (leidas) {
        notificacionesLeidas = new Set(JSON.parse(leidas));
    }
}

function guardarNotificacionesLeidas() {
    localStorage.setItem('notificaciones_leidas', JSON.stringify([...notificacionesLeidas]));
}

function generarIdNotificacion(tipo, item) {
    return `${tipo}_${item.id}_${item.fecha}`;
}

async function obtenerNotificaciones() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const eventos = await obtenerEventos();
    const anuncios = await obtenerAnuncios();
    
    const notificaciones = [];
    
    // Eventos de hoy
    eventos.forEach(event => {
        const fechaEvento = new Date(event.fecha + 'T12:00:00');
        fechaEvento.setHours(0, 0, 0, 0);
        
        if (fechaEvento.getTime() === hoy.getTime()) {
            notificaciones.push({
                id: generarIdNotificacion('evento', event),
                tipo: 'evento',
                titulo: event.titulo,
                descripcion: event.descripcion,
                fecha: event.fecha,
                hora: event.hora,
                departamento: event.departamento,
                leida: notificacionesLeidas.has(generarIdNotificacion('evento', event))
            });
        }
    });
    
    // Anuncios de los últimos 3 días
    const hace3Dias = new Date();
    hace3Dias.setDate(hace3Dias.getDate() - 3);
    hace3Dias.setHours(0, 0, 0, 0);
    
    anuncios.forEach(anuncio => {
        const fechaAnuncio = new Date(anuncio.fecha + 'T12:00:00');
        fechaAnuncio.setHours(0, 0, 0, 0);
        
        if (fechaAnuncio >= hace3Dias) {
            notificaciones.push({
                id: generarIdNotificacion('anuncio', anuncio),
                tipo: 'anuncio',
                titulo: anuncio.titulo,
                descripcion: anuncio.descripcion,
                fecha: anuncio.fecha,
                leida: notificacionesLeidas.has(generarIdNotificacion('anuncio', anuncio))
            });
        }
    });
    
    // Ordenar: primero las no leídas, luego por fecha (más recientes primero)
    notificaciones.sort((a, b) => {
        if (a.leida !== b.leida) {
            return a.leida ? 1 : -1; // No leídas primero
        }
        return new Date(b.fecha) - new Date(a.fecha);
    });
    
    return notificaciones;
}

async function actualizarBadgeNotificaciones() {
    const notificaciones = await obtenerNotificaciones();
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    const badge = document.getElementById('notificationBadge');
    
    if (noLeidas > 0) {
        badge.textContent = noLeidas > 9 ? '9+' : noLeidas;
        badge.style.display = 'flex';
        
        // Hacer sonar una campanita (opcional)
        if (noLeidas > 0 && !window.notificacionSonada) {
            // Solo para no ser muy intrusivo
            window.notificacionSonada = true;
        }
    } else {
        badge.style.display = 'none';
    }
}

async function renderizarPanelNotificaciones() {
    const notificaciones = await obtenerNotificaciones();
    const lista = document.getElementById('notificationsList');
    
    if (notificaciones.length === 0) {
        lista.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    notificaciones.forEach(notif => {
        const fecha = new Date(notif.fecha + 'T12:00:00');
        const fechaStr = fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short' 
        });
        
        const icono = notif.tipo === 'evento' ? 'fa-calendar-day' : 'fa-bullhorn';
        const color = notif.tipo === 'evento' ? '#e67e22' : '#17a2b8';
        
        html += `
            <div class="notification-item ${notif.leida ? 'leida' : 'no-leida'}" data-id="${notif.id}">
                <div class="notification-icon" style="background: ${color}20; color: ${color};">
                    <i class="fas ${icono}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.titulo}</div>
                    <div class="notification-desc">${notif.descripcion.substring(0, 60)}${notif.descripcion.length > 60 ? '...' : ''}</div>
                    <div class="notification-meta">
                        <span><i class="far fa-calendar"></i> ${fechaStr}</span>
                        ${notif.hora ? `<span><i class="far fa-clock"></i> ${notif.hora}</span>` : ''}
                    </div>
                </div>
                ${!notif.leida ? '<span class="notification-dot"></span>' : ''}
            </div>
        `;
    });
    
    lista.innerHTML = html;
    
    // Marcar como leídas al hacer click
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            marcarNotificacionComoLeida(id);
        });
    });
}

function marcarNotificacionComoLeida(id) {
    notificacionesLeidas.add(id);
    guardarNotificacionesLeidas();
    
    // Actualizar UI
    const item = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (item) {
        item.classList.remove('no-leida');
        item.classList.add('leida');
        const dot = item.querySelector('.notification-dot');
        if (dot) dot.remove();
    }
    
    actualizarBadgeNotificaciones();
}

function marcarTodasComoLeidas() {
    // Obtener todas las notificaciones actuales
    obtenerNotificaciones().then(notificaciones => {
        notificaciones.forEach(notif => {
            notificacionesLeidas.add(notif.id);
        });
        guardarNotificacionesLeidas();
        
        // Actualizar UI
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('no-leida');
            item.classList.add('leida');
            const dot = item.querySelector('.notification-dot');
            if (dot) dot.remove();
        });
        
        actualizarBadgeNotificaciones();
    });
}

// ==================== FUNCIONES DE AUTENTICACIÓN ====================
function verificarAdmin() {
    const sesion = sessionStorage.getItem('iglesia_admin');
    esAdmin = sesion === 'true';
    
    // Actualizar UI según permisos
    actualizarUIporPermisos();
    
    return esAdmin;
}

function iniciarSesion(password) {
    cargarConfiguracion(); // Asegurar que tenemos la config actualizada
    if (password === CONFIG.ADMIN_PASSWORD) {
        esAdmin = true;
        sessionStorage.setItem('iglesia_admin', 'true');
        actualizarUIporPermisos();
        cerrarLoginModal();
        mostrarNotificacion('Sesión iniciada como administrador', 'exito');
        return true;
    } else {
        document.getElementById('loginError').style.display = 'block';
        return false;
    }
}

function cerrarSesion() {
    esAdmin = false;
    sessionStorage.removeItem('iglesia_admin');
    actualizarUIporPermisos();
    mostrarNotificacion('Sesión cerrada', 'exito');
    
    // Recargar vistas para ocultar botones de edición
    const filtroActivo = document.querySelector('.filter-btn.active')?.dataset.filter || 'todos';
    renderCalendario(filtroActivo);
    renderAnuncios();
    renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas');
    renderRecursos();
}

function actualizarUIporPermisos() {
    // Mostrar/ocultar elementos solo para admin
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        if (esAdmin) {
            el.style.display = 'inline-flex';
        } else {
            el.style.display = 'none';
        }
    });
    
    // Mostrar/ocultar enlace de logout
    const logoutLink = document.getElementById('logoutLink');
    const adminLoginLink = document.getElementById('adminLoginLink');
    
    if (esAdmin) {
        if (logoutLink) logoutLink.style.display = 'inline';
        if (adminLoginLink) adminLoginLink.style.display = 'none';
        
        // Ocultar indicador de modo lectura
        const indicador = document.getElementById('modoIndicador');
        if (indicador) indicador.style.display = 'none';
    } else {
        if (logoutLink) logoutLink.style.display = 'none';
        if (adminLoginLink) adminLoginLink.style.display = 'inline';
        
        // Mostrar indicador de modo lectura
        const indicador = document.getElementById('modoIndicador');
        if (indicador) indicador.style.display = 'block';
    }
    
    // Re-renderizar para actualizar botones de edición en tarjetas
    // Esto se maneja en cada función de render
}

function mostrarLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginPassword').focus();
}

function cerrarLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// ==================== FUNCIONES DE CONFIGURACIÓN ====================
function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('iglesia_config');
    if (configGuardada) {
        try {
            CONFIG = JSON.parse(configGuardada);
        } catch (e) {
            console.error('Error al cargar configuración:', e);
        }
    } else {
        CONFIG = { ...CONFIG_PREDETERMINADA };
    }
    return CONFIG;
}

function guardarConfiguracion(nuevaConfig) {
    CONFIG = nuevaConfig;
    localStorage.setItem('iglesia_config', JSON.stringify(nuevaConfig));
    return true;
}

// ==================== FUNCIONES DE SINCRONIZACIÓN ====================
async function cargarDatos() {
    const config = cargarConfiguracion();
    
    try {
        document.body.style.cursor = 'wait';
        
        const response = await fetch(`${config.BASE_URL}/b/${config.BIN_ID}/latest`, {
            headers: { 'X-Master-Key': config.API_KEY }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar datos');
        }
        
        const data = await response.json();
        datosCache = data.record;
        
        // Si el bin está vacío, inicializar con datos por defecto
        if (!datosCache || !datosCache.eventos) {
            await inicializarBin();
        }
        
        document.body.style.cursor = 'default';
        return datosCache;
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarNotificacion('Error al conectar con JSONBin. Usando datos locales.', 'error');
        document.body.style.cursor = 'default';
        
        // Usar datos de respaldo local
        return JSON.parse(localStorage.getItem('iglesia_backup')) || datosIniciales;
    }
}

async function guardarDatos(nuevosDatos) {
    const config = cargarConfiguracion();
    
    try {
        document.body.style.cursor = 'wait';
        
        const response = await fetch(`${config.BASE_URL}/b/${config.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': config.API_KEY
            },
            body: JSON.stringify(nuevosDatos)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar');
        }
        
        datosCache = nuevosDatos;
        localStorage.setItem('iglesia_backup', JSON.stringify(nuevosDatos));
        
        document.body.style.cursor = 'default';
        mostrarNotificacion('Datos guardados correctamente', 'exito');
        return true;
    } catch (error) {
        console.error('Error guardando:', error);
        mostrarNotificacion('Error al guardar. Revisa tu configuración.', 'error');
        document.body.style.cursor = 'default';
        return false;
    }
}

async function inicializarBin() {
    await guardarDatos(datosIniciales);
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.style.position = 'fixed';
    notificacion.style.top = '20px';
    notificacion.style.right = '20px';
    notificacion.style.padding = '15px 25px';
    notificacion.style.borderRadius = '5px';
    notificacion.style.color = 'white';
    notificacion.style.zIndex = '9999';
    notificacion.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notificacion.style.animation = 'slideIn 0.3s ease';
    
    if (tipo === 'exito') {
        notificacion.style.background = '#28a745';
    } else {
        notificacion.style.background = '#dc3545';
    }
    
    notificacion.innerHTML = `<i class="fas ${tipo === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// ==================== FUNCIONES CRUD ====================
async function obtenerEventos() {
    if (!datosCache) await cargarDatos();
    return datosCache?.eventos || [];
}

async function obtenerAnuncios() {
    if (!datosCache) await cargarDatos();
    return datosCache?.anuncios || [];
}

async function obtenerEnsenanzas() {
    if (!datosCache) await cargarDatos();
    return datosCache?.ensenanzas || [];
}

async function obtenerRecursos() {
    if (!datosCache) await cargarDatos();
    return datosCache?.recursos || [];
}

async function actualizarEventos(nuevosEventos) {
    if (!esAdmin) {
        mostrarNotificacion('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    if (!datosCache) await cargarDatos();
    datosCache.eventos = nuevosEventos;
    const resultado = await guardarDatos(datosCache);
    if (resultado) actualizarBadgeNotificaciones(); // Actualizar notificaciones
    return resultado;
}

async function actualizarAnuncios(nuevosAnuncios) {
    if (!esAdmin) {
        mostrarNotificacion('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    if (!datosCache) await cargarDatos();
    datosCache.anuncios = nuevosAnuncios;
    const resultado = await guardarDatos(datosCache);
    if (resultado) actualizarBadgeNotificaciones(); // Actualizar notificaciones
    return resultado;
}

async function actualizarEnsenanzas(nuevasEnsenanzas) {
    if (!esAdmin) {
        mostrarNotificacion('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    if (!datosCache) await cargarDatos();
    datosCache.ensenanzas = nuevasEnsenanzas;
    return await guardarDatos(datosCache);
}

async function actualizarRecursos(nuevosRecursos) {
    if (!esAdmin) {
        mostrarNotificacion('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    if (!datosCache) await cargarDatos();
    datosCache.recursos = nuevosRecursos;
    return await guardarDatos(datosCache);
}

async function eliminarItem(tipo, id) {
    if (!esAdmin) {
        mostrarNotificacion('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    
    let items;
    switch(tipo) {
        case 'eventos':
            items = await obtenerEventos();
            items = items.filter(item => item.id !== id);
            await actualizarEventos(items);
            break;
        case 'anuncios':
            items = await obtenerAnuncios();
            items = items.filter(item => item.id !== id);
            await actualizarAnuncios(items);
            break;
        case 'ensenanzas':
            items = await obtenerEnsenanzas();
            items = items.filter(item => item.id !== id);
            await actualizarEnsenanzas(items);
            break;
        case 'recursos':
            items = await obtenerRecursos();
            items = items.filter(item => item.id !== id);
            await actualizarRecursos(items);
            break;
    }
    return true;
}

function generarId(tipo) {
    const prefijos = {
        eventos: 'e',
        anuncios: 'a',
        ensenanzas: 'n',
        recursos: 'r'
    };
    const prefijo = prefijos[tipo] || 'x';
    return prefijo + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
}

// ==================== RENDERIZAR CALENDARIO ====================
async function renderCalendario(filtro = 'todos') {
    const eventos = await obtenerEventos();
    const grid = document.getElementById('calendar-grid');
    
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = '';
    eventos.forEach(event => {
        if (filtro !== 'todos' && event.departamento !== filtro) return;
        
        const fecha = new Date(event.fecha + 'T12:00:00');
        const fechaStr = fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Mapeo de nombres de departamentos para mostrar
        const nombreDepartamento = {
            'iglesia': 'Iglesia General',
            'damas': 'Damas',
            'jovenes': 'Jóvenes',
            'juveniles': 'Juveniles',
            'infantil': 'Ministerio Infantil',
            'caballeros': 'Caballeros',
            'instituto': 'Instituto Bíblico'
        }[event.departamento] || event.departamento;
        
        // Colores por departamento
        const colores = {
            'iglesia': '#2c3e50',
            'damas': '#e83e8c',
            'jovenes': '#17a2b8',
            'juveniles': '#fd7e14',
            'infantil': '#28a745',
            'caballeros': '#007bff',
            'instituto': '#6f42c1'
        };
        
        // Verificar si es hoy para destacarlo
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const esHoy = fecha.getTime() === hoy.getTime();
        
        html += `
            <div class="event-card ${esHoy ? 'evento-hoy' : ''}" style="border-left-color: ${colores[event.departamento] || '#2c3e50'};" data-id="${event.id}">
                ${esHoy ? '<div class="hoy-badge"><i class="fas fa-bell"></i> HOY</div>' : ''}
                <div class="event-date"><i class="far fa-calendar-alt"></i> ${fechaStr}</div>
                <h3 class="event-title">${event.titulo}</h3>
                <span class="event-department" style="background: ${colores[event.departamento] || '#2c3e50'}; color: white;">
                    ${nombreDepartamento}
                </span>
                <p class="event-description">${event.descripcion}</p>
                <div class="event-meta">
                    ${event.hora ? `<span><i class="far fa-clock"></i> ${event.hora}</span>` : ''}
                    ${event.responsable ? `<span><i class="fas fa-user"></i> ${event.responsable}</span>` : ''}
                </div>
                ${esAdmin ? `
                <div class="card-actions" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <button class="edit-evento" data-id="${event.id}" style="background:none; border:none; color:#007bff; cursor:pointer; margin-right:10px;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-evento" data-id="${event.id}" style="background:none; border:none; color:#dc3545; cursor:pointer;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    if (html === '') {
        html = '<p class="no-results">No hay eventos para este filtro.</p>';
    }
    
    grid.innerHTML = html;
    
    // Asignar eventos a botones solo si es admin
    if (esAdmin) {
        document.querySelectorAll('.delete-evento').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿Estás seguro de eliminar este evento?')) {
                    const id = e.currentTarget.dataset.id;
                    await eliminarItem('eventos', id);
                    await renderCalendario(filtro);
                }
            });
        });
        
        document.querySelectorAll('.edit-evento').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                abrirModalEvento(id);
            });
        });
    }
}

// ==================== RENDERIZAR ANUNCIOS ====================
async function renderAnuncios() {
    const anuncios = await obtenerAnuncios();
    const container = document.getElementById('anuncios-list');
    
    anuncios.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    anuncios.forEach(anuncio => {
        // Verificar si es reciente (últimos 3 días)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaAnuncio = new Date(anuncio.fecha + 'T12:00:00');
        fechaAnuncio.setHours(0, 0, 0, 0);
        
        const hace3Dias = new Date();
        hace3Dias.setDate(hace3Dias.getDate() - 3);
        hace3Dias.setHours(0, 0, 0, 0);
        
        const esReciente = fechaAnuncio >= hace3Dias;
        
        html += `
            <div class="card ${esReciente ? 'anuncio-reciente' : ''}" data-id="${anuncio.id}">
                ${esReciente ? '<span class="nuevo-badge"><i class="fas fa-bell"></i> NUEVO</span>' : ''}
                <h3>${anuncio.titulo}</h3>
                <p>${anuncio.descripcion}</p>
                <div class="card-meta">
                    <span><i class="far fa-calendar"></i> ${anuncio.fecha}</span>
                    ${esAdmin ? `
                    <div class="card-actions">
                        <button class="edit-anuncio" data-id="${anuncio.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-anuncio" data-id="${anuncio.id}"><i class="fas fa-trash"></i></button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    if (esAdmin) {
        document.querySelectorAll('.delete-anuncio').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Eliminar este anuncio?')) {
                    const id = e.currentTarget.dataset.id;
                    await eliminarItem('anuncios', id);
                    await renderAnuncios();
                }
            });
        });
        
        document.querySelectorAll('.edit-anuncio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                abrirModalAnuncio(id);
            });
        });
    }
}

// ==================== RENDERIZAR ENSEÑANZAS ====================
async function renderEnsenanzas(filtro = 'todas') {
    const ensenanzas = await obtenerEnsenanzas();
    const container = document.getElementById('ensenanzas-list');
    
    let filtradas = ensenanzas;
    if (filtro !== 'todas') {
        filtradas = ensenanzas.filter(e => e.autor === filtro);
    }
    
    filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    filtradas.forEach(ens => {
        html += `
            <div class="card" data-id="${ens.id}">
                <h3>${ens.titulo}</h3>
                <p><strong>${ens.autor}</strong> · ${ens.fecha}</p>
                <p>${ens.descripcion}</p>
                <div class="card-meta">
                    ${ens.url ? `<a href="${ens.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Ver sermón</a>` : '<span>Sin enlace</span>'}
                    ${esAdmin ? `
                    <div class="card-actions">
                        <button class="edit-ensenanza" data-id="${ens.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-ensenanza" data-id="${ens.id}"><i class="fas fa-trash"></i></button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    if (esAdmin) {
        document.querySelectorAll('.delete-ensenanza').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Eliminar esta enseñanza?')) {
                    const id = e.currentTarget.dataset.id;
                    await eliminarItem('ensenanzas', id);
                    await renderEnsenanzas(document.getElementById('filtroEnsenanza').value);
                }
            });
        });
        
        document.querySelectorAll('.edit-ensenanza').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                abrirModalEnsenanza(id);
            });
        });
    }
}

// ==================== RENDERIZAR RECURSOS ====================
async function renderRecursos() {
    const recursos = await obtenerRecursos();
    const container = document.getElementById('recursos-list');
    
    let html = '';
    recursos.forEach(recurso => {
        const icono = recurso.tipo === 'audio' ? 'fa-headphones' : 
                     recurso.tipo === 'video' ? 'fa-video' : 'fa-file-alt';
        html += `
            <div class="card" data-id="${recurso.id}">
                <h3><i class="fas ${icono}"></i> ${recurso.titulo}</h3>
                <p>${recurso.descripcion}</p>
                <div class="card-meta">
                    ${recurso.url ? `<a href="${recurso.url}" target="_blank"><i class="fas fa-download"></i> Descargar</a>` : '<span>Sin archivo</span>'}
                    ${esAdmin ? `
                    <div class="card-actions">
                        <button class="edit-recurso" data-id="${recurso.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-recurso" data-id="${recurso.id}"><i class="fas fa-trash"></i></button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    if (esAdmin) {
        document.querySelectorAll('.delete-recurso').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Eliminar este recurso?')) {
                    const id = e.currentTarget.dataset.id;
                    await eliminarItem('recursos', id);
                    await renderRecursos();
                }
            });
        });
        
        document.querySelectorAll('.edit-recurso').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                abrirModalRecurso(id);
            });
        });
    }
}

// ==================== MODALES ====================
function abrirModal(titulo, tipo, item = null) {
    if (!esAdmin) {
        mostrarNotificacion('Debes iniciar sesión como administrador', 'error');
        mostrarLoginModal();
        return;
    }
    
    modalTipoActual = tipo;
    itemEditandoId = item?.id || null;
    
    document.getElementById('modal-titulo').textContent = titulo;
    
    // Ocultar todos los campos adicionales
    document.getElementById('campo-departamento').style.display = 'none';
    document.getElementById('campo-fecha').style.display = 'none';
    document.getElementById('campo-hora').style.display = 'none';
    document.getElementById('campo-autor').style.display = 'none';
    document.getElementById('campo-url').style.display = 'none';
    document.getElementById('campo-tipo').style.display = 'none';
    
    // Limpiar formulario
    document.getElementById('modal-form').reset();
    document.getElementById('item-id').value = item?.id || '';
    
    // Mostrar campos según tipo
    if (tipo === 'evento') {
        document.getElementById('campo-departamento').style.display = 'block';
        document.getElementById('campo-fecha').style.display = 'block';
        document.getElementById('campo-hora').style.display = 'block';
        document.getElementById('campo-autor').style.display = 'block';
        
        // Añadir opciones al select de departamento
        const deptoSelect = document.getElementById('item-departamento');
        deptoSelect.innerHTML = `
            <option value="iglesia">Iglesia General</option>
            <option value="damas">Damas</option>
            <option value="jovenes">Jóvenes</option>
            <option value="juveniles">Juveniles</option>
            <option value="infantil">Ministerio Infantil</option>
            <option value="caballeros">Caballeros</option>
            <option value="instituto">Instituto Bíblico</option>
        `;
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo;
            document.getElementById('item-descripcion').value = item.descripcion;
            document.getElementById('item-departamento').value = item.departamento;
            document.getElementById('item-fecha').value = item.fecha;
            document.getElementById('item-hora').value = item.hora || '';
            document.getElementById('item-autor').value = item.responsable || '';
        }
    } else if (tipo === 'anuncio') {
        document.getElementById('campo-fecha').style.display = 'block';
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo;
            document.getElementById('item-descripcion').value = item.descripcion;
            document.getElementById('item-fecha').value = item.fecha;
        }
    } else if (tipo === 'ensenanza') {
        document.getElementById('campo-autor').style.display = 'block';
        document.getElementById('campo-fecha').style.display = 'block';
        document.getElementById('campo-url').style.display = 'block';
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo;
            document.getElementById('item-descripcion').value = item.descripcion;
            document.getElementById('item-autor').value = item.autor;
            document.getElementById('item-fecha').value = item.fecha;
            document.getElementById('item-url').value = item.url || '';
        }
    } else if (tipo === 'recurso') {
        document.getElementById('campo-tipo').style.display = 'block';
        document.getElementById('campo-url').style.display = 'block';
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo;
            document.getElementById('item-descripcion').value = item.descripcion;
            document.getElementById('item-tipo').value = item.tipo;
            document.getElementById('item-url').value = item.url || '';
        }
    }
    
    document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

async function abrirModalEvento(id = null) {
    if (id) {
        const eventos = await obtenerEventos();
        const evento = eventos.find(e => e.id === id);
        if (evento) {
            abrirModal('Editar Evento', 'evento', evento);
        }
    } else {
        abrirModal('Nuevo Evento', 'evento');
    }
}

async function abrirModalAnuncio(id = null) {
    if (id) {
        const anuncios = await obtenerAnuncios();
        const anuncio = anuncios.find(a => a.id === id);
        if (anuncio) {
            abrirModal('Editar Anuncio', 'anuncio', anuncio);
        }
    } else {
        abrirModal('Nuevo Anuncio', 'anuncio');
    }
}

async function abrirModalEnsenanza(id = null) {
    if (id) {
        const ensenanzas = await obtenerEnsenanzas();
        const ens = ensenanzas.find(e => e.id === id);
        if (ens) {
            abrirModal('Editar Enseñanza', 'ensenanza', ens);
        }
    } else {
        abrirModal('Nueva Enseñanza', 'ensenanza');
    }
}

async function abrirModalRecurso(id = null) {
    if (id) {
        const recursos = await obtenerRecursos();
        const recurso = recursos.find(r => r.id === id);
        if (recurso) {
            abrirModal('Editar Recurso', 'recurso', recurso);
        }
    } else {
        abrirModal('Nuevo Recurso', 'recurso');
    }
}

// ==================== GUARDAR FORMULARIO ====================
document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!esAdmin) {
        cerrarModal();
        mostrarNotificacion('Debes iniciar sesión como administrador', 'error');
        mostrarLoginModal();
        return;
    }
    
    const tipo = modalTipoActual;
    const id = itemEditandoId || generarId(tipo + 's');
    const titulo = document.getElementById('item-titulo').value;
    const descripcion = document.getElementById('item-descripcion').value;
    
    let nuevoItem = { id, titulo, descripcion };
    
    if (tipo === 'evento') {
        nuevoItem.departamento = document.getElementById('item-departamento').value;
        nuevoItem.fecha = document.getElementById('item-fecha').value;
        nuevoItem.hora = document.getElementById('item-hora').value;
        nuevoItem.responsable = document.getElementById('item-autor').value;
        
        let eventos = await obtenerEventos();
        if (itemEditandoId) {
            eventos = eventos.map(item => item.id === itemEditandoId ? nuevoItem : item);
        } else {
            eventos.push(nuevoItem);
        }
        await actualizarEventos(eventos);
        
    } else if (tipo === 'anuncio') {
        nuevoItem.fecha = document.getElementById('item-fecha').value;
        
        let anuncios = await obtenerAnuncios();
        if (itemEditandoId) {
            anuncios = anuncios.map(item => item.id === itemEditandoId ? nuevoItem : item);
        } else {
            anuncios.push(nuevoItem);
        }
        await actualizarAnuncios(anuncios);
        
    } else if (tipo === 'ensenanza') {
        nuevoItem.autor = document.getElementById('item-autor').value;
        nuevoItem.fecha = document.getElementById('item-fecha').value;
        nuevoItem.url = document.getElementById('item-url').value;
        
        let ensenanzas = await obtenerEnsenanzas();
        if (itemEditandoId) {
            ensenanzas = ensenanzas.map(item => item.id === itemEditandoId ? nuevoItem : item);
        } else {
            ensenanzas.push(nuevoItem);
        }
        await actualizarEnsenanzas(ensenanzas);
        
    } else if (tipo === 'recurso') {
        nuevoItem.tipo = document.getElementById('item-tipo').value;
        nuevoItem.url = document.getElementById('item-url').value;
        
        let recursos = await obtenerRecursos();
        if (itemEditandoId) {
            recursos = recursos.map(item => item.id === itemEditandoId ? nuevoItem : item);
        } else {
            recursos.push(nuevoItem);
        }
        await actualizarRecursos(recursos);
    }
    
    cerrarModal();
    
    // Refrescar vista
    if (tipo === 'evento') {
        const filtroActivo = document.querySelector('.filter-btn.active')?.dataset.filter || 'todos';
        await renderCalendario(filtroActivo);
    } else if (tipo === 'anuncio') {
        await renderAnuncios();
    } else if (tipo === 'ensenanza') {
        await renderEnsenanzas(document.getElementById('filtroEnsenanza').value);
    } else if (tipo === 'recurso') {
        await renderRecursos();
    }
});

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar configuración
    cargarConfiguracion();
    
    // Cargar notificaciones leídas
    cargarNotificacionesLeidas();
    
    // Verificar si hay sesión activa
    verificarAdmin();
    
    // Añadir botón de configuración al header (solo visible para admin)
    const header = document.querySelector('.header .container');
    if (header) {
        const configBtn = document.createElement('button');
        configBtn.innerHTML = '<i class="fas fa-cog"></i> Configurar';
        configBtn.style.position = 'absolute';
        configBtn.style.top = '20px';
        configBtn.style.right = '20px';
        configBtn.style.background = 'rgba(255,255,255,0.2)';
        configBtn.style.border = 'none';
        configBtn.style.color = 'white';
        configBtn.style.padding = '8px 15px';
        configBtn.style.borderRadius = '20px';
        configBtn.style.cursor = 'pointer';
        configBtn.style.fontSize = '0.9rem';
        configBtn.classList.add('admin-only');
        configBtn.style.display = esAdmin ? 'block' : 'none';
        configBtn.addEventListener('click', mostrarConfiguracionModal);
        
        header.style.position = 'relative';
        header.appendChild(configBtn);
    }
    
    // Mostrar indicador de carga
    const grid = document.getElementById('calendar-grid');
    if (grid) grid.innerHTML = '<p style="text-align: center;">Cargando datos...</p>';
    
    try {
        await cargarDatos();
    } catch (error) {
        console.error('Error inicial:', error);
    }
    
    // Eventos de login
    document.getElementById('adminLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        mostrarLoginModal();
    });
    
    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
    });
    
    document.getElementById('loginBtn').addEventListener('click', () => {
        const password = document.getElementById('loginPassword').value;
        iniciarSesion(password);
    });
    
    document.getElementById('loginCancelBtn').addEventListener('click', () => {
        cerrarLoginModal();
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
    
    // Cerrar modal de login al hacer click fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('loginModal');
        if (e.target === modal) {
            cerrarLoginModal();
        }
    });
    
    // Eventos de notificaciones
    const bell = document.getElementById('notificationBell');
    const panel = document.getElementById('notificationPanel');
    
    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            renderizarPanelNotificaciones();
            panel.style.display = 'block';
        }
    });
    
    document.getElementById('markAllRead').addEventListener('click', () => {
        marcarTodasComoLeidas();
    });
    
    // Cerrar panel al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!bell.contains(e.target) && !panel.contains(e.target)) {
            panel.style.display = 'none';
        }
    });
    
    // Pestañas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Filtros calendario
    const filterContainer = document.querySelector('.calendar-filters');
    if (filterContainer) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id === 'nuevoEventoBtn') return;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderCalendario(btn.dataset.filter);
            });
        });
        
        document.getElementById('nuevoEventoBtn')?.addEventListener('click', () => abrirModalEvento());
    }
    
    // Filtro enseñanzas
    const filtroEnsenanza = document.getElementById('filtroEnsenanza');
    if (filtroEnsenanza) {
        filtroEnsenanza.addEventListener('change', (e) => {
            renderEnsenanzas(e.target.value);
        });
    }
    
    // Botones nuevos
    document.getElementById('nuevoAnuncioBtn')?.addEventListener('click', () => abrirModalAnuncio());
    document.getElementById('nuevaEnsenanzaBtn')?.addEventListener('click', () => abrirModalEnsenanza());
    document.getElementById('nuevoRecursoBtn')?.addEventListener('click', () => abrirModalRecurso());
    
    // Cerrar modal principal
    document.querySelector('.close-modal')?.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) {
            cerrarModal();
        }
    });
    
    // Render inicial
    await renderCalendario('todos');
    await renderAnuncios();
    await renderEnsenanzas('todas');
    await renderRecursos();
    
    // Actualizar badge de notificaciones
    await actualizarBadgeNotificaciones();
    
    // Verificar notificaciones cada 5 minutos
    setInterval(async () => {
        await actualizarBadgeNotificaciones();
    }, 300000); // 5 minutos
});

// Función para mostrar modal de configuración
function mostrarConfiguracionModal() {
    if (!esAdmin) {
        mostrarNotificacion('Debes ser administrador', 'error');
        return;
    }
    
    const config = cargarConfiguracion();
    
    const modalHtml = `
        <div id="configModal" class="modal" style="display:flex;">
            <div class="modal-content" style="max-width:500px;">
                <span class="close-config-modal" style="float:right; font-size:28px; cursor:pointer;">&times;</span>
                <h2><i class="fas fa-cog"></i> Configuración</h2>
                
                <div class="form-group">
                    <label>BIN ID:</label>
                    <input type="text" id="configBinId" value="${config.BIN_ID}">
                </div>
                
                <div class="form-group">
                    <label>API Key:</label>
                    <input type="text" id="configApiKey" value="${config.API_KEY}">
                </div>
                
                <div class="form-group">
                    <label>Contraseña de Admin:</label>
                    <input type="text" id="configPassword" value="${config.ADMIN_PASSWORD}">
                    <small style="color:#999;">Cambia la contraseña para acceso de líderes</small>
                </div>
                
                <button id="guardarConfigBtn" class="btn-primary"><i class="fas fa-save"></i> Guardar Configuración</button>
                <div id="configResultado" style="margin-top:15px;"></div>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
    
    document.querySelector('.close-config-modal').addEventListener('click', () => {
        document.getElementById('configModal').remove();
    });
    
    document.getElementById('guardarConfigBtn').addEventListener('click', () => {
        const nuevaConfig = {
            BIN_ID: document.getElementById('configBinId').value,
            API_KEY: document.getElementById('configApiKey').value,
            BASE_URL: 'https://api.jsonbin.io/v3',
            ADMIN_PASSWORD: document.getElementById('configPassword').value
        };
        
        guardarConfiguracion(nuevaConfig);
        
        const resultado = document.getElementById('configResultado');
        resultado.innerHTML = '<p style="color:green;">✅ Configuración guardada. Recargando...</p>';
        
        setTimeout(() => {
            location.reload();
        }, 1500);
    });
}

// Añadir estilos adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 30px;
        font-weight: 600;
        cursor: pointer;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    .modo-lectura {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .no-results {
        text-align: center;
        padding: 40px;
        color: #999;
        font-size: 1.1rem;
    }
    
    /* Estilos para el badge de HOY en eventos */
    .evento-hoy {
        position: relative;
        border: 2px solid #e67e22 !important;
        box-shadow: 0 0 15px rgba(230, 126, 34, 0.3);
    }
    
    .hoy-badge {
        position: absolute;
        top: -10px;
        right: 10px;
        background: #e67e22;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
    }
    
    .hoy-badge i {
        margin-right: 5px;
    }
    
    /* Estilos para badge NUEVO en anuncios */
    .anuncio-reciente {
        position: relative;
    }
    
    .nuevo-badge {
        position: absolute;
        top: -10px;
        right: 10px;
        background: #17a2b8;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
    }
    
    .nuevo-badge i {
        margin-right: 5px;
    }
`;
document.head.appendChild(style);