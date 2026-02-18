// ==================== CONFIGURACIÓN PREDETERMINADA ====================
const CONFIG_PREDETERMINADA = {
    BIN_ID: '69961800ae596e708f353340',
    API_KEY: '$2a$10$dIvq0wIoXhyOp0HoP09EretN7mTKeiZPMTyL4LJNpnP7m44LpBwyC',
    BASE_URL: 'https://api.jsonbin.io/v3'
};

// ==================== VARIABLES GLOBALES ====================
let CONFIG = { ...CONFIG_PREDETERMINADA };
let datosCache = null;
let modalTipoActual = '';
let itemEditandoId = null;

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
    ],
    recursos: [
        { id: 'r1', titulo: 'Libro de Cantos', descripcion: 'PDF con himnos', tipo: 'documento', url: '' },
        { id: 'r2', titulo: 'Predicación: La Cruz', descripcion: 'Audio MP3', tipo: 'audio', url: '' },
        { id: 'r3', titulo: 'Calendario 2026', descripcion: 'Planificación completa', tipo: 'documento', url: '' },
        { id: 'r4', titulo: 'Material para Maestros', descripcion: 'Guías para escuela dominical', tipo: 'documento', url: '' },
        { id: 'r5', titulo: 'Estudio Bíblico - Instituto', descripcion: 'Apuntes del curso', tipo: 'documento', url: '' },
    ]
};

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

function mostrarConfiguracionModal() {
    const config = cargarConfiguracion();
    
    // Crear modal de configuración
    const modalHtml = `
        <div id="configModal" class="modal" style="display:flex;">
            <div class="modal-content" style="max-width:500px;">
                <span class="close-config-modal" style="float:right; font-size:28px; cursor:pointer;">&times;</span>
                <h2><i class="fas fa-cog"></i> Configuración de JSONBin</h2>
                <p style="color:#666; margin-bottom:20px;">Estos datos son necesarios para que todos vean los mismos anuncios y enseñanzas.</p>
                
                <div class="form-group">
                    <label>BIN ID:</label>
                    <input type="text" id="configBinId" value="${config.BIN_ID}" placeholder="Ej: 65abc123def456">
                    <small style="color:#999;">Lo encuentras en la URL de tu bin en jsonbin.io</small>
                </div>
                
                <div class="form-group">
                    <label>API Key:</label>
                    <input type="text" id="configApiKey" value="${config.API_KEY}" placeholder="Ej: $2a$10$...">
                    <small style="color:#999;">La encuentras en tu perfil de jsonbin.io</small>
                </div>
                
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="guardarConfigBtn" class="btn-primary" style="flex:2;"><i class="fas fa-save"></i> Guardar Configuración</button>
                    <button id="probarConfigBtn" class="btn-primary" style="flex:1; background:#17a2b8;"><i class="fas fa-plug"></i> Probar</button>
                </div>
                
                <div id="configResultado" style="margin-top:15px; padding:10px; border-radius:5px; display:none;"></div>
                
                <p style="margin-top:20px; font-size:0.9rem; color:#999;">
                    <i class="fas fa-info-circle"></i> Después de guardar, la página se recargará para aplicar los cambios.
                </p>
            </div>
        </div>
    `;
    
    // Añadir al body
    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div);
    
    // Event listeners
    document.querySelector('.close-config-modal').addEventListener('click', () => {
        document.getElementById('configModal').remove();
    });
    
    document.getElementById('probarConfigBtn').addEventListener('click', async () => {
        const binId = document.getElementById('configBinId').value;
        const apiKey = document.getElementById('configApiKey').value;
        const resultado = document.getElementById('configResultado');
        
        resultado.style.display = 'block';
        resultado.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Probando conexión...';
        resultado.style.background = '#e3f2fd';
        resultado.style.color = '#0d47a1';
        
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                headers: { 'X-Master-Key': apiKey }
            });
            
            if (response.ok) {
                resultado.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Conexión exitosa! El bin es accesible.';
                resultado.style.background = '#d4edda';
                resultado.style.color = '#155724';
            } else {
                resultado.innerHTML = '<i class="fas fa-exclamation-circle"></i> ❌ Error: No se pudo acceder al bin. Verifica el ID y la API Key.';
                resultado.style.background = '#f8d7da';
                resultado.style.color = '#721c24';
            }
        } catch (error) {
            resultado.innerHTML = '<i class="fas fa-exclamation-circle"></i> ❌ Error de conexión: ' + error.message;
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
        }
    });
    
    document.getElementById('guardarConfigBtn').addEventListener('click', () => {
        const nuevaConfig = {
            BIN_ID: document.getElementById('configBinId').value,
            API_KEY: document.getElementById('configApiKey').value,
            BASE_URL: 'https://api.jsonbin.io/v3'
        };
        
        guardarConfiguracion(nuevaConfig);
        
        const resultado = document.getElementById('configResultado');
        resultado.style.display = 'block';
        resultado.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Configuración guardada. Recargando página...';
        resultado.style.background = '#d4edda';
        resultado.style.color = '#155724';
        
        setTimeout(() => {
            location.reload();
        }, 1500);
    });
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
        mostrarNotificacion('Error al conectar con JSONBin. Verifica tu configuración.', 'error');
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
    if (!datosCache) await cargarDatos();
    datosCache.eventos = nuevosEventos;
    return await guardarDatos(datosCache);
}

async function actualizarAnuncios(nuevosAnuncios) {
    if (!datosCache) await cargarDatos();
    datosCache.anuncios = nuevosAnuncios;
    return await guardarDatos(datosCache);
}

async function actualizarEnsenanzas(nuevasEnsenanzas) {
    if (!datosCache) await cargarDatos();
    datosCache.ensenanzas = nuevasEnsenanzas;
    return await guardarDatos(datosCache);
}

async function actualizarRecursos(nuevosRecursos) {
    if (!datosCache) await cargarDatos();
    datosCache.recursos = nuevosRecursos;
    return await guardarDatos(datosCache);
}

async function eliminarItem(tipo, id) {
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
        
        html += `
            <div class="event-card" style="border-left-color: ${colores[event.departamento] || '#2c3e50'};" data-id="${event.id}">
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
                <div class="card-actions" style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                    <button class="edit-evento" data-id="${event.id}" style="background:none; border:none; color:#007bff; cursor:pointer; margin-right:10px;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-evento" data-id="${event.id}" style="background:none; border:none; color:#dc3545; cursor:pointer;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<p class="no-results">No hay eventos para este filtro.</p>';
    }
    
    grid.innerHTML = html;
    
    // Asignar eventos a botones
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

// ==================== RENDERIZAR ANUNCIOS ====================
async function renderAnuncios() {
    const anuncios = await obtenerAnuncios();
    const container = document.getElementById('anuncios-list');
    
    anuncios.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    anuncios.forEach(anuncio => {
        html += `
            <div class="card" data-id="${anuncio.id}">
                <h3>${anuncio.titulo}</h3>
                <p>${anuncio.descripcion}</p>
                <div class="card-meta">
                    <span><i class="far fa-calendar"></i> ${anuncio.fecha}</span>
                    <div class="card-actions">
                        <button class="edit-anuncio" data-id="${anuncio.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-anuncio" data-id="${anuncio.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
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
                    ${ens.url ? `<a href="${ens.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Ver</a>` : '<span>Sin enlace</span>'}
                    <div class="card-actions">
                        <button class="edit-ensenanza" data-id="${ens.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-ensenanza" data-id="${ens.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
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
                    <div class="card-actions">
                        <button class="edit-recurso" data-id="${recurso.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-recurso" data-id="${recurso.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
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

// ==================== MODALES ====================
function abrirModal(titulo, tipo, item = null) {
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
    
    // Añadir botón de configuración al header
    const header = document.querySelector('.header .container');
    if (header) {
        const configBtn = document.createElement('button');
        configBtn.innerHTML = '<i class="fas fa-cog"></i> Configurar JSONBin';
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
    
    // Filtros calendario - ACTUALIZADO con nuevos departamentos
    const filterContainer = document.querySelector('.calendar-filters');
    if (filterContainer) {
        filterContainer.innerHTML = `
            <button class="filter-btn active" data-filter="todos">Todos</button>
            <button class="filter-btn" data-filter="iglesia"><i class="fas fa-users"></i> Iglesia General</button>
            <button class="filter-btn" data-filter="damas"><i class="fas fa-female"></i> Damas</button>
            <button class="filter-btn" data-filter="jovenes"><i class="fas fa-user-graduate"></i> Jóvenes</button>
            <button class="filter-btn" data-filter="juveniles"><i class="fas fa-child"></i> Juveniles</button>
            <button class="filter-btn" data-filter="infantil"><i class="fas fa-baby"></i> Infantil</button>
            <button class="filter-btn" data-filter="caballeros"><i class="fas fa-male"></i> Caballeros</button>
            <button class="filter-btn" data-filter="instituto"><i class="fas fa-book"></i> Instituto</button>
            <button id="nuevoEventoBtn" class="btn-primary" style="margin-left:auto;"><i class="fas fa-plus"></i> Nuevo Evento</button>
        `;
        
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
        // Actualizar opciones del filtro de enseñanzas
        filtroEnsenanza.innerHTML = `
            <option value="todas">Todas</option>
            <option value="Pastor">Pastor</option>
            <option value="Pastora">Pastora</option>
            <option value="Jarley">Jarley</option>
            <option value="Marice">Marice</option>
            <option value="Michel">Michel</option>
            <option value="Jóvenes">Jóvenes</option>
            <option value="Damas">Damas</option>
            <option value="Caballeros">Caballeros</option>
            <option value="Infantil">Infantil</option>
        `;
        
        filtroEnsenanza.addEventListener('change', (e) => {
            renderEnsenanzas(e.target.value);
        });
    }
    
    // Botones nuevos
    document.getElementById('nuevoAnuncioBtn')?.addEventListener('click', () => abrirModalAnuncio());
    document.getElementById('nuevaEnsenanzaBtn')?.addEventListener('click', () => abrirModalEnsenanza());
    document.getElementById('nuevoRecursoBtn')?.addEventListener('click', () => abrirModalRecurso());
    
    // Cerrar modal
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
});

// Añadir estilos de animación
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
`;
document.head.appendChild(style);