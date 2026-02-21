// ==================== CONFIGURACIÓN DE FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyD7vuff1k8wU8NZ5CHgVwmIkQK9mmBF-tY",
    authDomain: "iglesia-solo-cristo-salva.firebaseapp.com",
    projectId: "iglesia-solo-cristo-salva",
    storageBucket: "iglesia-solo-cristo-salva.firebasestorage.app",
    messagingSenderId: "949195395163",
    appId: "1:949195395163:web:bdf73a4812ccd26e072f7e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==================== VARIABLES GLOBALES ====================
let modalTipoActual = '';
let esAdmin = false;
let usuarioActual = null;
let notificacionesLeidas = new Set();

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

// Obtener iniciales del nombre
function obtenerIniciales(nombre) {
    if (!nombre) return '?';
    return nombre
        .split(' ')
        .map(p => p[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Verificar si un usuario es administrador
async function esUsuarioAdmin(uid) {
    try {
        if (!uid) return false;
        const userDoc = await db.collection('usuarios').doc(uid).get();
        return userDoc.exists && userDoc.data().rol === 'admin';
    } catch (error) {
        console.error('Error verificando admin:', error);
        return false;
    }
}

// Registrar nuevo usuario (cualquier persona)
async function registrarUsuario(email, password, nombre) {
    try {
        email = email.trim().toLowerCase();
        
        // Crear usuario en Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Actualizar perfil con nombre
        await user.updateProfile({
            displayName: nombre
        });
        
        // Guardar información en Firestore (rol por defecto: 'usuario')
        await db.collection('usuarios').doc(user.uid).set({
            nombre: nombre,
            email: email,
            fechaRegistro: new Date().toISOString(),
            uid: user.uid,
            rol: 'usuario', // Por defecto son usuarios normales
            fotoURL: user.photoURL || null
        });
        
        return { exito: true, user };
        
    } catch (error) {
        console.error('Error registrando:', error);
        let mensaje = 'Error al registrar';
        if (error.code === 'auth/email-already-in-use') {
            mensaje = 'Este email ya está registrado';
        } else if (error.code === 'auth/weak-password') {
            mensaje = 'La contraseña debe tener al menos 6 caracteres';
        }
        return { exito: false, error: mensaje };
    }
}

// Iniciar sesión con Email/Password
async function loginConEmail(email, password) {
    try {
        email = email.trim().toLowerCase();
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Verificar rol en Firestore
        const esAdmin = await esUsuarioAdmin(user.uid);
        
        return { 
            exito: true, 
            user,
            esAdmin 
        };
        
    } catch (error) {
        console.error('Error login:', error);
        let mensaje = 'Error al iniciar sesión';
        
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                mensaje = 'Email o contraseña incorrectos';
                break;
            case 'auth/invalid-email':
                mensaje = 'Email inválido';
                break;
            case 'auth/too-many-requests':
                mensaje = 'Demasiados intentos. Intenta más tarde';
                break;
        }
        
        return { exito: false, error: mensaje };
    }
}

// Iniciar sesión con Google
async function loginConGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Verificar si el usuario ya existe en Firestore
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Primer inicio con Google - crear registro
            await db.collection('usuarios').doc(user.uid).set({
                nombre: user.displayName,
                email: user.email,
                fechaRegistro: new Date().toISOString(),
                uid: user.uid,
                rol: 'usuario', // Por defecto usuario normal
                fotoURL: user.photoURL || null
            });
        }
        
        // Verificar si es admin
        const esAdmin = userDoc.exists ? userDoc.data().rol === 'admin' : false;
        
        return { 
            exito: true, 
            user,
            esAdmin 
        };
        
    } catch (error) {
        console.error('Error Google login:', error);
        return { exito: false, error: 'Error al iniciar con Google' };
    }
}

// Cerrar sesión
async function cerrarSesion() {
    try {
        await auth.signOut();
        esAdmin = false;
        usuarioActual = null;
        actualizarUIporPermisos();
        mostrarNotificacion('Sesión cerrada', 'exito');
        
        // Recargar datos en modo lectura
        await Promise.all([
            renderCalendario('todos'),
            renderAnuncios(),
            renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas'),
            renderRecursos()
        ]);
        
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        mostrarNotificacion('Error al cerrar sesión', 'error');
    }
}

// ==================== FUNCIONES DE ADMINISTRACIÓN ====================

// Obtener todos los usuarios (solo admin)
async function obtenerTodosLosUsuarios() {
    try {
        if (!esAdmin) throw new Error('No autorizado');
        
        const snapshot = await db.collection('usuarios').get();
        const usuarios = [];
        snapshot.forEach(doc => {
            usuarios.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return usuarios;
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        return [];
    }
}

// Cambiar rol de usuario (solo admin)
async function cambiarRolUsuario(uid, nuevoRol) {
    try {
        if (!esAdmin) throw new Error('No autorizado');
        
        await db.collection('usuarios').doc(uid).update({
            rol: nuevoRol
        });
        
        return { exito: true };
    } catch (error) {
        console.error('Error cambiando rol:', error);
        return { exito: false, error: error.message };
    }
}

// Enviar mensaje a usuarios (solo admin)
async function enviarMensajeAUsuarios(asunto, mensaje, usuarios = []) {
    try {
        if (!esAdmin) throw new Error('No autorizado');
        
        // Guardar mensaje en Firestore
        const mensajeData = {
            asunto,
            mensaje,
            fecha: new Date().toISOString(),
            remitente: usuarioActual.uid,
            remitenteNombre: usuarioActual.displayName || usuarioActual.email,
            destinatarios: usuarios.length ? usuarios : 'todos' // Vacío = todos
        };
        
        await db.collection('mensajes').add(mensajeData);
        
        // Aquí podrías integrar con OneSignal o email
        if (window.OneSignal) {
            // Enviar notificación push
            window.OneSignal.sendSelf(message);
        }
        
        return { exito: true };
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        return { exito: false, error: error.message };
    }
}

// ==================== FUNCIONES DE BASE DE DATOS ====================
async function cargarDatos() {
    try {
        console.log('Cargando datos desde Firebase...');
        
        const eventosSnapshot = await db.collection('eventos').get();
        const eventos = [];
        eventosSnapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
        
        const anunciosSnapshot = await db.collection('anuncios').get();
        const anuncios = [];
        anunciosSnapshot.forEach(doc => anuncios.push({ id: doc.id, ...doc.data() }));
        
        const ensenanzasSnapshot = await db.collection('ensenanzas').get();
        const ensenanzas = [];
        ensenanzasSnapshot.forEach(doc => ensenanzas.push({ id: doc.id, ...doc.data() }));
        
        const recursosSnapshot = await db.collection('recursos').get();
        const recursos = [];
        recursosSnapshot.forEach(doc => recursos.push({ id: doc.id, ...doc.data() }));
        
        const datos = { eventos, anuncios, ensenanzas, recursos };
        localStorage.setItem('iglesia_backup', JSON.stringify(datos));
        
        return datos;
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        const backup = localStorage.getItem('iglesia_backup');
        return backup ? JSON.parse(backup) : { eventos: [], anuncios: [], ensenanzas: [], recursos: [] };
    }
}

async function guardarItem(tipo, item) {
    try {
        if (!esAdmin) throw new Error('No autorizado');
        
        const colecciones = {
            'evento': 'eventos',
            'anuncio': 'anuncios',
            'ensenanza': 'ensenanzas',
            'recurso': 'recursos'
        };
        
        const coleccion = colecciones[tipo];
        
        if (item.id) {
            await db.collection(coleccion).doc(item.id).set(item);
        } else {
            item.id = generarId(tipo);
            await db.collection(coleccion).doc(item.id).set(item);
        }
        
        return { exito: true, id: item.id };
        
    } catch (error) {
        console.error('Error guardando:', error);
        return { exito: false, error: error.message };
    }
}

async function eliminarItem(tipo, id) {
    try {
        if (!esAdmin) throw new Error('No autorizado');
        
        const colecciones = {
            'evento': 'eventos',
            'anuncio': 'anuncios',
            'ensenanza': 'ensenanzas',
            'recurso': 'recursos'
        };
        
        const coleccion = colecciones[tipo];
        await db.collection(coleccion).doc(id).delete();
        return { exito: true, id };
        
    } catch (error) {
        console.error('Error eliminando:', error);
        return { exito: false, error: error.message };
    }
}

function generarId(tipo) {
    const prefijos = { evento: 'e', anuncio: 'a', ensenanza: 'n', recurso: 'r' };
    const prefijo = prefijos[tipo] || 'x';
    return prefijo + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==================== FUNCIONES DE UI ====================
function mostrarCargando(mostrar) {
    let loader = document.getElementById('loader');
    if (!loader && mostrar) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = '<div class="spinner"></div><p>Cargando...</p>';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; flex-direction: column; z-index: 10001; color: white;
        `;
        document.body.appendChild(loader);
        
        const style = document.createElement('style');
        style.textContent = `
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #e67e22;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    if (loader) loader.style.display = mostrar ? 'flex' : 'none';
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        border-radius: 5px; color: white; z-index: 9999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: slideIn 0.3s ease;
        background: ${tipo === 'exito' ? '#28a745' : tipo === 'info' ? '#17a2b8' : '#dc3545'};
    `;
    notificacion.innerHTML = `<i class="fas ${tipo === 'exito' ? 'fa-check-circle' : tipo === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'}"></i> ${mensaje}`;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Actualizar UI según permisos
function actualizarUIporPermisos() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.display = esAdmin ? 'inline-flex' : 'none';
    });
    
    const adminLoginLink = document.getElementById('adminLoginLink');
    const userMenu = document.getElementById('userMenu');
    const indicador = document.getElementById('modoIndicador');
    const userAvatar = document.getElementById('userAvatar');
    const userEmail = document.getElementById('userEmail');
    
    if (usuarioActual) {
        // Hay usuario logueado (admin o normal)
        if (adminLoginLink) adminLoginLink.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            
            // Actualizar avatar con iniciales o foto
            if (userAvatar) {
                if (usuarioActual.photoURL) {
                    // Tiene foto de Google
                    userAvatar.innerHTML = `<img src="${usuarioActual.photoURL}" alt="avatar">`;
                } else {
                    // Mostrar iniciales
                    const iniciales = obtenerIniciales(usuarioActual.displayName || usuarioActual.email);
                    userAvatar.innerHTML = `<span class="avatar-iniciales">${iniciales}</span>`;
                }
            }
            
            if (userEmail) userEmail.textContent = usuarioActual.email;
        }
        
        // Si es admin, ocultar modo lectura
        if (indicador) indicador.style.display = esAdmin ? 'none' : 'block';
        
        // Botón de notificaciones admin
        if (esAdmin && !document.getElementById('notificacionAdminBtn')) {
            const toolbar = document.querySelector('.admin-toolbar');
            if (toolbar) {
                const notifBtn = document.createElement('button');
                notifBtn.id = 'notificacionAdminBtn';
                notifBtn.className = 'btn-primary';
                notifBtn.style.background = '#17a2b8';
                notifBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar notificación';
                notifBtn.onclick = mostrarPanelMensajes;
                toolbar.appendChild(notifBtn);
                
                // Botón de administrar usuarios
                const userBtn = document.createElement('button');
                userBtn.id = 'adminUsersBtn';
                userBtn.className = 'btn-primary';
                userBtn.style.background = '#6f42c1';
                userBtn.innerHTML = '<i class="fas fa-users-cog"></i> Usuarios';
                userBtn.onclick = mostrarPanelUsuarios;
                toolbar.appendChild(userBtn);
            }
        }
    } else {
        // No hay usuario
        if (adminLoginLink) adminLoginLink.style.display = 'inline';
        if (userMenu) userMenu.style.display = 'none';
        if (indicador) indicador.style.display = 'block';
        
        const notifBtn = document.getElementById('notificacionAdminBtn');
        if (notifBtn) notifBtn.remove();
        
        const userBtn = document.getElementById('adminUsersBtn');
        if (userBtn) userBtn.remove();
    }
}

// ==================== RENDERIZADO ====================
async function renderCalendario(filtro = 'todos') {
    const datos = await cargarDatos();
    const eventos = datos.eventos || [];
    const grid = document.getElementById('calendar-grid');
    
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = '';
    eventos.forEach(event => {
        if (filtro !== 'todos' && event.departamento !== filtro) return;
        
        const fecha = event.fecha ? new Date(event.fecha + 'T12:00:00') : new Date();
        const fechaStr = event.fecha ? fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }) : 'Fecha no asignada';
        
        const nombreDepartamento = {
            'iglesia': 'Iglesia General', 'damas': 'Damas', 'jovenes': 'Jóvenes',
            'juveniles': 'Juveniles', 'infantil': 'Ministerio Infantil',
            'caballeros': 'Caballeros', 'instituto': 'Instituto Bíblico'
        }[event.departamento] || event.departamento || 'Sin departamento';
        
        const colores = {
            'iglesia': '#2c3e50', 'damas': '#e83e8c', 'jovenes': '#17a2b8',
            'juveniles': '#fd7e14', 'infantil': '#28a745',
            'caballeros': '#007bff', 'instituto': '#6f42c1'
        };
        
        const hoy = new Date(); 
        hoy.setHours(0, 0, 0, 0);
        let esHoy = false;
        
        if (event.fecha) {
            const fechaEvento = new Date(event.fecha + 'T12:00:00');
            fechaEvento.setHours(0, 0, 0, 0);
            esHoy = fechaEvento.getTime() === hoy.getTime();
        }
        
        html += `
            <div class="event-card ${esHoy ? 'evento-hoy' : ''}" style="border-left-color: ${colores[event.departamento] || '#2c3e50'};" data-id="${event.id}">
                ${esHoy ? '<div class="hoy-badge"><i class="fas fa-bell"></i> HOY</div>' : ''}
                <div class="event-date"><i class="far fa-calendar-alt"></i> ${fechaStr}</div>
                <h3 class="event-title">${event.titulo || 'Sin título'}</h3>
                <span class="event-department" style="background: ${colores[event.departamento] || '#2c3e50'}; color: white;">
                    ${nombreDepartamento}
                </span>
                <p class="event-description">${event.descripcion || ''}</p>
                <div class="event-meta">
                    ${event.hora ? `<span><i class="far fa-clock"></i> ${event.hora}</span>` : ''}
                    ${event.responsable ? `<span><i class="fas fa-user"></i> ${event.responsable}</span>` : ''}
                </div>
                ${esAdmin ? `
                <div class="card-actions">
                    <button class="edit-evento" data-id="${event.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-evento" data-id="${event.id}"><i class="fas fa-trash"></i></button>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    grid.innerHTML = html || '<p class="no-results">No hay eventos para este filtro.</p>';
    
    if (esAdmin) {
        document.querySelectorAll('.delete-evento').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar este evento?')) {
                    await eliminarItem('evento', e.currentTarget.dataset.id);
                    await renderCalendario(filtro);
                }
            });
        });
        
        document.querySelectorAll('.edit-evento').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalEvento(e.currentTarget.dataset.id);
            });
        });
    }
}

async function renderAnuncios() {
    const datos = await cargarDatos();
    const anuncios = datos.anuncios || [];
    const container = document.getElementById('anuncios-list');
    
    anuncios.sort((a, b) => new Date(b.fecha || '2000-01-01') - new Date(a.fecha || '2000-01-01'));
    
    const hace3Dias = new Date(); 
    hace3Dias.setDate(hace3Dias.getDate() - 3); 
    hace3Dias.setHours(0, 0, 0, 0);
    
    let html = '';
    anuncios.forEach(anuncio => {
        let esReciente = false;
        if (anuncio.fecha) {
            const fechaAnuncio = new Date(anuncio.fecha + 'T12:00:00'); 
            fechaAnuncio.setHours(0, 0, 0, 0);
            esReciente = fechaAnuncio >= hace3Dias;
        }
        
        html += `
            <div class="card ${esReciente ? 'anuncio-reciente' : ''}" data-id="${anuncio.id}">
                ${esReciente ? '<span class="nuevo-badge"><i class="fas fa-bell"></i> NUEVO</span>' : ''}
                <h3>${anuncio.titulo || 'Sin título'}</h3>
                <p>${anuncio.descripcion || ''}</p>
                <div class="card-meta">
                    <span><i class="far fa-calendar"></i> ${anuncio.fecha || 'Sin fecha'}</span>
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
                    await eliminarItem('anuncio', e.currentTarget.dataset.id);
                    await renderAnuncios();
                }
            });
        });
        
        document.querySelectorAll('.edit-anuncio').forEach(btn => {
            btn.addEventListener('click', (e) => abrirModalAnuncio(e.currentTarget.dataset.id));
        });
    }
}

async function renderEnsenanzas(filtro = 'todas') {
    const datos = await cargarDatos();
    const ensenanzas = datos.ensenanzas || [];
    const container = document.getElementById('ensenanzas-list');
    
    const autores = [...new Set(ensenanzas.map(e => e.autor).filter(Boolean))];
    const filtroSelect = document.getElementById('filtroEnsenanza');
    let opciones = '<option value="todas">Todos los autores</option>';
    autores.forEach(autor => {
        opciones += `<option value="${autor}">${autor}</option>`;
    });
    filtroSelect.innerHTML = opciones;
    
    let filtradas = ensenanzas;
    if (filtro !== 'todas') filtradas = ensenanzas.filter(e => e.autor === filtro);
    filtradas.sort((a, b) => new Date(b.fecha || '2000-01-01') - new Date(a.fecha || '2000-01-01'));
    
    let html = '';
    filtradas.forEach(ens => {
        html += `
            <div class="card" data-id="${ens.id}">
                <h3>${ens.titulo || 'Sin título'}</h3>
                <p><strong>${ens.autor || 'Anónimo'}</strong> · ${ens.fecha || 'Sin fecha'}</p>
                <p>${ens.descripcion || ''}</p>
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
                    await eliminarItem('ensenanza', e.currentTarget.dataset.id);
                    await renderEnsenanzas(document.getElementById('filtroEnsenanza').value);
                }
            });
        });
        
        document.querySelectorAll('.edit-ensenanza').forEach(btn => {
            btn.addEventListener('click', (e) => abrirModalEnsenanza(e.currentTarget.dataset.id));
        });
    }
}

async function renderRecursos() {
    const datos = await cargarDatos();
    const recursos = datos.recursos || [];
    const container = document.getElementById('recursos-list');
    
    let html = '';
    recursos.forEach(recurso => {
        const icono = recurso.tipo === 'audio' ? 'fa-headphones' : 
                     recurso.tipo === 'video' ? 'fa-video' : 'fa-file-alt';
        html += `
            <div class="card" data-id="${recurso.id}">
                <h3><i class="fas ${icono}"></i> ${recurso.titulo || 'Sin título'}</h3>
                <p>${recurso.descripcion || ''}</p>
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
                    await eliminarItem('recurso', e.currentTarget.dataset.id);
                    await renderRecursos();
                }
            });
        });
        
        document.querySelectorAll('.edit-recurso').forEach(btn => {
            btn.addEventListener('click', (e) => abrirModalRecurso(e.currentTarget.dataset.id));
        });
    }
}

// ==================== NOTIFICACIONES LOCALES ====================
async function obtenerNotificaciones() {
    const datos = await cargarDatos();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const notificaciones = [];
    
    (datos.eventos || []).forEach(event => {
        if (event.fecha) {
            const fechaEvento = new Date(event.fecha + 'T12:00:00');
            fechaEvento.setHours(0, 0, 0, 0);
            
            if (fechaEvento.getTime() === hoy.getTime()) {
                notificaciones.push({
                    id: `evento_${event.id}`,
                    tipo: 'evento',
                    titulo: event.titulo,
                    descripcion: event.descripcion,
                    fecha: event.fecha,
                    hora: event.hora,
                    leida: notificacionesLeidas.has(`evento_${event.id}`)
                });
            }
        }
    });
    
    const hace3Dias = new Date();
    hace3Dias.setDate(hace3Dias.getDate() - 3);
    hace3Dias.setHours(0, 0, 0, 0);
    
    (datos.anuncios || []).forEach(anuncio => {
        if (anuncio.fecha) {
            const fechaAnuncio = new Date(anuncio.fecha + 'T12:00:00');
            fechaAnuncio.setHours(0, 0, 0, 0);
            
            if (fechaAnuncio >= hace3Dias) {
                notificaciones.push({
                    id: `anuncio_${anuncio.id}`,
                    tipo: 'anuncio',
                    titulo: anuncio.titulo,
                    descripcion: anuncio.descripcion,
                    fecha: anuncio.fecha,
                    leida: notificacionesLeidas.has(`anuncio_${anuncio.id}`)
                });
            }
        }
    });
    
    return notificaciones;
}

async function actualizarBadgeNotificaciones() {
    const notificaciones = await obtenerNotificaciones();
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (noLeidas > 0) {
            badge.textContent = noLeidas > 9 ? '9+' : noLeidas;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
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
        const fechaStr = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const icono = notif.tipo === 'evento' ? 'fa-calendar-day' : 'fa-bullhorn';
        const color = notif.tipo === 'evento' ? '#e67e22' : '#17a2b8';
        
        html += `
            <div class="notification-item ${notif.leida ? 'leida' : 'no-leida'}" data-id="${notif.id}">
                <div class="notification-icon" style="background: ${color}20; color: ${color};">
                    <i class="fas ${icono}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.titulo}</div>
                    <div class="notification-desc">${(notif.descripcion || '').substring(0, 60)}${notif.descripcion && notif.descripcion.length > 60 ? '...' : ''}</div>
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
    
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            notificacionesLeidas.add(id);
            localStorage.setItem('notificaciones_leidas', JSON.stringify([...notificacionesLeidas]));
            item.classList.remove('no-leida');
            item.classList.add('leida');
            const dot = item.querySelector('.notification-dot');
            if (dot) dot.remove();
            actualizarBadgeNotificaciones();
        });
    });
}

// ==================== MODALES ====================
function abrirModal(titulo, tipo, item = null) {
    if (!esAdmin) {
        mostrarNotificacion('Solo administradores pueden editar', 'error');
        return;
    }
    
    modalTipoActual = tipo;
    
    document.getElementById('modal-titulo').textContent = titulo;
    
    ['departamento', 'fecha', 'hora', 'autor', 'url', 'tipo'].forEach(campo => {
        const elemento = document.getElementById(`campo-${campo}`);
        if (elemento) elemento.style.display = 'none';
    });
    
    document.getElementById('modal-form').reset();
    document.getElementById('item-id').value = item?.id || '';
    
    if (tipo === 'evento') {
        ['departamento', 'fecha', 'hora', 'autor'].forEach(c => {
            const elemento = document.getElementById(`campo-${c}`);
            if (elemento) elemento.style.display = 'block';
        });
        
        const deptoSelect = document.getElementById('item-departamento');
        if (deptoSelect) {
            deptoSelect.innerHTML = `
                <option value="iglesia">Iglesia General</option>
                <option value="damas">Damas</option>
                <option value="jovenes">Jóvenes</option>
                <option value="juveniles">Juveniles</option>
                <option value="infantil">Ministerio Infantil</option>
                <option value="caballeros">Caballeros</option>
                <option value="instituto">Instituto Bíblico</option>
            `;
        }
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo || '';
            document.getElementById('item-descripcion').value = item.descripcion || '';
            if (document.getElementById('item-departamento')) 
                document.getElementById('item-departamento').value = item.departamento || 'iglesia';
            if (document.getElementById('item-fecha')) 
                document.getElementById('item-fecha').value = item.fecha || '';
            if (document.getElementById('item-hora')) 
                document.getElementById('item-hora').value = item.hora || '';
            if (document.getElementById('item-autor')) 
                document.getElementById('item-autor').value = item.responsable || '';
        }
    } else if (tipo === 'anuncio') {
        const campoFecha = document.getElementById('campo-fecha');
        if (campoFecha) campoFecha.style.display = 'block';
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo || '';
            document.getElementById('item-descripcion').value = item.descripcion || '';
            if (document.getElementById('item-fecha')) 
                document.getElementById('item-fecha').value = item.fecha || '';
        }
    } else if (tipo === 'ensenanza') {
        ['autor', 'fecha', 'url'].forEach(c => {
            const elemento = document.getElementById(`campo-${c}`);
            if (elemento) elemento.style.display = 'block';
        });
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo || '';
            document.getElementById('item-descripcion').value = item.descripcion || '';
            if (document.getElementById('item-autor')) 
                document.getElementById('item-autor').value = item.autor || '';
            if (document.getElementById('item-fecha')) 
                document.getElementById('item-fecha').value = item.fecha || '';
            if (document.getElementById('item-url')) 
                document.getElementById('item-url').value = item.url || '';
        }
    } else if (tipo === 'recurso') {
        ['tipo', 'url'].forEach(c => {
            const elemento = document.getElementById(`campo-${c}`);
            if (elemento) elemento.style.display = 'block';
        });
        
        if (item) {
            document.getElementById('item-titulo').value = item.titulo || '';
            document.getElementById('item-descripcion').value = item.descripcion || '';
            if (document.getElementById('item-tipo')) 
                document.getElementById('item-tipo').value = item.tipo || 'documento';
            if (document.getElementById('item-url')) 
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
        const datos = await cargarDatos();
        const evento = datos.eventos.find(e => e.id === id);
        if (evento) abrirModal('Editar Evento', 'evento', evento);
    } else {
        abrirModal('Nuevo Evento', 'evento');
    }
}

async function abrirModalAnuncio(id = null) {
    if (id) {
        const datos = await cargarDatos();
        const anuncio = datos.anuncios.find(a => a.id === id);
        if (anuncio) abrirModal('Editar Anuncio', 'anuncio', anuncio);
    } else {
        abrirModal('Nuevo Anuncio', 'anuncio');
    }
}

async function abrirModalEnsenanza(id = null) {
    if (id) {
        const datos = await cargarDatos();
        const ens = datos.ensenanzas.find(e => e.id === id);
        if (ens) abrirModal('Editar Enseñanza', 'ensenanza', ens);
    } else {
        abrirModal('Nueva Enseñanza', 'ensenanza');
    }
}

async function abrirModalRecurso(id = null) {
    if (id) {
        const datos = await cargarDatos();
        const recurso = datos.recursos.find(r => r.id === id);
        if (recurso) abrirModal('Editar Recurso', 'recurso', recurso);
    } else {
        abrirModal('Nuevo Recurso', 'recurso');
    }
}

// ==================== PANEL DE ADMINISTRACIÓN DE USUARIOS ====================
async function mostrarPanelUsuarios() {
    if (!esAdmin) return;
    
    const usuarios = await obtenerTodosLosUsuarios();
    
    // Crear modal si no existe
    let modal = document.getElementById('adminUsersModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminUsersModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal" id="closeUsersModal">&times;</span>
                <h2><i class="fas fa-users-cog"></i> Administrar Usuarios</h2>
                <div class="users-list" id="usersList"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeUsersModal').onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    const usersList = document.getElementById('usersList');
    let html = `
        <table style="width:100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th style="padding:10px; text-align:left;">Usuario</th>
                    <th style="padding:10px; text-align:left;">Email</th>
                    <th style="padding:10px; text-align:left;">Rol</th>
                    <th style="padding:10px; text-align:left;">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    usuarios.forEach(user => {
        const esAdminActual = user.rol === 'admin';
        html += `
            <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar-small" style="background:${esAdminActual ? '#e67e22' : '#2c3e50'};">
                            ${user.fotoURL ? 
                                `<img src="${user.fotoURL}" style="width:30px; height:30px; border-radius:50%;">` : 
                                `<span>${obtenerIniciales(user.nombre || user.email)}</span>`
                            }
                        </div>
                        ${user.nombre || 'Sin nombre'}
                    </div>
                </td>
                <td style="padding:10px;">${user.email}</td>
                <td style="padding:10px;">
                    <span style="background:${esAdminActual ? '#e67e22' : '#6c757d'}; color:white; padding:3px 10px; border-radius:15px; font-size:0.8rem;">
                        ${esAdminActual ? 'Administrador' : 'Usuario'}
                    </span>
                </td>
                <td style="padding:10px;">
                    <button class="btn-toggle-role" data-uid="${user.id}" data-role="${user.rol}" style="padding:5px 10px; background:#17a2b8; color:white; border:none; border-radius:5px; cursor:pointer;">
                        ${esAdminActual ? 'Quitar admin' : 'Hacer admin'}
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    usersList.innerHTML = html;
    
    // Agregar eventos a los botones
    document.querySelectorAll('.btn-toggle-role').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const uid = e.target.dataset.uid;
            const rolActual = e.target.dataset.role;
            const nuevoRol = rolActual === 'admin' ? 'usuario' : 'admin';
            
            if (confirm(`¿Cambiar rol a ${nuevoRol === 'admin' ? 'Administrador' : 'Usuario'}?`)) {
                const resultado = await cambiarRolUsuario(uid, nuevoRol);
                if (resultado.exito) {
                    mostrarNotificacion('Rol actualizado', 'exito');
                    mostrarPanelUsuarios(); // Recargar
                }
            }
        });
    });
    
    modal.style.display = 'flex';
}

// ==================== PANEL DE MENSAJES ====================
async function mostrarPanelMensajes() {
    if (!esAdmin) return;
    
    const usuarios = await obtenerTodosLosUsuarios();
    
    let modal = document.getElementById('mensajesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mensajesModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close-modal" id="closeMensajesModal">&times;</span>
                <h2><i class="fas fa-paper-plane"></i> Enviar Mensaje</h2>
                <form id="mensajeForm">
                    <div class="form-group">
                        <label>Destinatarios</label>
                        <select id="mensajeDestinatarios" class="form-control">
                            <option value="todos">Todos los usuarios</option>
                            <option value="admins">Solo administradores</option>
                            <option value="usuarios">Solo usuarios normales</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Asunto</label>
                        <input type="text" id="mensajeAsunto" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Mensaje</label>
                        <textarea id="mensajeTexto" class="form-control" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-block">
                        <i class="fas fa-paper-plane"></i> Enviar
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeMensajesModal').onclick = () => {
            modal.style.display = 'none';
        };
        
        document.getElementById('mensajeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const asunto = document.getElementById('mensajeAsunto').value;
            const mensaje = document.getElementById('mensajeTexto').value;
            const destinatarios = document.getElementById('mensajeDestinatarios').value;
            
            const resultado = await enviarMensajeAUsuarios(asunto, mensaje, destinatarios);
            if (resultado.exito) {
                mostrarNotificacion('Mensaje enviado', 'exito');
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = 'flex';
}

// ==================== LOGIN MODAL ====================
function mostrarLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginEmail').focus();
    }
}

function cerrarLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function mostrarRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
    document.getElementById('registerForm').reset();
    document.getElementById('registerError').style.display = 'none';
}

function cerrarRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// ==================== GUARDAR FORMULARIO ====================
document.getElementById('modal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!esAdmin) {
        cerrarModal();
        mostrarNotificacion('Solo administradores pueden editar', 'error');
        return;
    }
    
    const tipo = modalTipoActual;
    const id = document.getElementById('item-id').value || null;
    const titulo = document.getElementById('item-titulo').value;
    const descripcion = document.getElementById('item-descripcion').value;
    
    let nuevoItem = { id, titulo, descripcion };
    
    if (tipo === 'evento') {
        nuevoItem.departamento = document.getElementById('item-departamento')?.value || 'iglesia';
        nuevoItem.fecha = document.getElementById('item-fecha')?.value || '';
        nuevoItem.hora = document.getElementById('item-hora')?.value || '';
        nuevoItem.responsable = document.getElementById('item-autor')?.value || '';
        
        const resultado = await guardarItem('evento', nuevoItem);
        if (resultado.exito) {
            cerrarModal();
            const filtroActivo = document.querySelector('.filter-btn.active')?.dataset.filter || 'todos';
            await renderCalendario(filtroActivo);
            mostrarNotificacion('Evento guardado', 'exito');
        }
        
    } else if (tipo === 'anuncio') {
        nuevoItem.fecha = document.getElementById('item-fecha')?.value || '';
        const resultado = await guardarItem('anuncio', nuevoItem);
        if (resultado.exito) {
            cerrarModal();
            await renderAnuncios();
            mostrarNotificacion('Anuncio guardado', 'exito');
        }
        
    } else if (tipo === 'ensenanza') {
        nuevoItem.autor = document.getElementById('item-autor')?.value || '';
        nuevoItem.fecha = document.getElementById('item-fecha')?.value || '';
        nuevoItem.url = document.getElementById('item-url')?.value || '';
        const resultado = await guardarItem('ensenanza', nuevoItem);
        if (resultado.exito) {
            cerrarModal();
            await renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas');
            mostrarNotificacion('Enseñanza guardada', 'exito');
        }
        
    } else if (tipo === 'recurso') {
        nuevoItem.tipo = document.getElementById('item-tipo')?.value || 'documento';
        nuevoItem.url = document.getElementById('item-url')?.value || '';
        const resultado = await guardarItem('recurso', nuevoItem);
        if (resultado.exito) {
            cerrarModal();
            await renderRecursos();
            mostrarNotificacion('Recurso guardado', 'exito');
        }
    }
});

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Inicializando aplicación...');
    
    const leidas = localStorage.getItem('notificaciones_leidas');
    if (leidas) {
        notificacionesLeidas = new Set(JSON.parse(leidas));
    }
    
    // Escuchar cambios en el estado de autenticación
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Usuario logueado
            usuarioActual = user;
            
            // Verificar rol en Firestore
            const userDoc = await db.collection('usuarios').doc(user.uid).get();
            
            if (userDoc.exists) {
                esAdmin = userDoc.data().rol === 'admin';
            } else {
                // Si no existe en Firestore, crear registro
                await db.collection('usuarios').doc(user.uid).set({
                    nombre: user.displayName,
                    email: user.email,
                    fechaRegistro: new Date().toISOString(),
                    uid: user.uid,
                    rol: 'usuario',
                    fotoURL: user.photoURL || null
                });
                esAdmin = false;
            }
            
            actualizarUIporPermisos();
            
            const nombre = user.displayName || user.email;
            mostrarNotificacion(`Bienvenido ${nombre}`, 'exito');
            
        } else {
            // Usuario no logueado
            esAdmin = false;
            usuarioActual = null;
            actualizarUIporPermisos();
        }
        
        // Recargar datos
        await Promise.all([
            renderCalendario('todos'),
            renderAnuncios(),
            renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas'),
            renderRecursos()
        ]);
    });
    
    // Event Listeners para modales de login/registro
    document.getElementById('adminLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarLoginModal();
    });
    
    document.getElementById('closeLoginModal')?.addEventListener('click', cerrarLoginModal);
    document.getElementById('closeRegisterModal')?.addEventListener('click', cerrarRegisterModal);
    
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarLoginModal();
        mostrarRegisterModal();
    });
    
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarRegisterModal();
        mostrarLoginModal();
    });
    
    // Tabs de login
    document.getElementById('loginEmailTab')?.addEventListener('click', () => {
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('loginEmailTab').classList.add('active');
        document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
        document.getElementById('emailLoginForm').classList.add('active');
    });
    
    document.getElementById('loginGoogleTab')?.addEventListener('click', () => {
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('loginGoogleTab').classList.add('active');
        document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
        document.getElementById('googleLoginForm').classList.add('active');
    });
    
    // Login con Email
    document.getElementById('emailLoginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        mostrarCargando(true);
        const resultado = await loginConEmail(email, password);
        mostrarCargando(false);
        
        if (resultado.exito) {
            cerrarLoginModal();
        } else {
            document.getElementById('loginError').textContent = resultado.error;
            document.getElementById('loginError').style.display = 'block';
        }
    });
    
    // Login con Google
    document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
        mostrarCargando(true);
        const resultado = await loginConGoogle();
        mostrarCargando(false);
        
        if (resultado.exito) {
            cerrarLoginModal();
        } else {
            document.getElementById('loginError').textContent = resultado.error;
            document.getElementById('loginError').style.display = 'block';
        }
    });
    
    // Registro
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            document.getElementById('registerError').textContent = 'Las contraseñas no coinciden';
            document.getElementById('registerError').style.display = 'block';
            return;
        }
        
        mostrarCargando(true);
        const resultado = await registrarUsuario(email, password, nombre);
        mostrarCargando(false);
        
        if (resultado.exito) {
            cerrarRegisterModal();
            mostrarNotificacion('Registro exitoso', 'exito');
        } else {
            document.getElementById('registerError').textContent = resultado.error;
            document.getElementById('registerError').style.display = 'block';
        }
    });
    
    // Logout
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('loginModal')) cerrarLoginModal();
        if (e.target === document.getElementById('registerModal')) cerrarRegisterModal();
        if (e.target === document.getElementById('modal')) cerrarModal();
    });
    
    // Notificaciones
    const bell = document.getElementById('notificationBell');
    const panel = document.getElementById('notificationPanel');
    
    if (bell && panel) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
            } else {
                renderizarPanelNotificaciones();
                panel.style.display = 'block';
            }
        });
    }
    
    document.getElementById('markAllRead')?.addEventListener('click', (e) => {
        e.preventDefault();
        obtenerNotificaciones().then(notificaciones => {
            notificaciones.forEach(notif => notificacionesLeidas.add(notif.id));
            localStorage.setItem('notificaciones_leidas', JSON.stringify([...notificacionesLeidas]));
            renderizarPanelNotificaciones();
            actualizarBadgeNotificaciones();
            mostrarNotificacion('Todas las notificaciones marcadas como leídas', 'exito');
        });
    });
    
    document.addEventListener('click', (e) => {
        if (bell && panel && !bell.contains(e.target) && !panel.contains(e.target)) {
            panel.style.display = 'none';
        }
    });
    
    // Tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
        });
    });
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.id === 'nuevoEventoBtn') return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCalendario(btn.dataset.filter);
        });
    });
    
    // Botones de nuevo
    document.getElementById('nuevoEventoBtn')?.addEventListener('click', () => abrirModalEvento());
    document.getElementById('nuevoAnuncioBtn')?.addEventListener('click', () => abrirModalAnuncio());
    document.getElementById('nuevaEnsenanzaBtn')?.addEventListener('click', () => abrirModalEnsenanza());
    document.getElementById('nuevoRecursoBtn')?.addEventListener('click', () => abrirModalRecurso());
    
    // Filtro de enseñanzas
    document.getElementById('filtroEnsenanza')?.addEventListener('change', (e) => {
        renderEnsenanzas(e.target.value);
    });
    
    // Cerrar modales con X
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // User dropdown
    document.getElementById('userBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', () => {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    });
    
    console.log('Aplicación inicializada correctamente');
});

// Estilos adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(100%); opacity: 1; }
        to { transform: translateX(0); opacity: 0; }
    }
`;
document.head.appendChild(style);