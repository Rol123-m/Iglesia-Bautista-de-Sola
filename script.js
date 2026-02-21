
        // ==================== CONFIGURACIÓN DE FIREBASE ====================
        // REEMPLAZA ESTO CON TU CONFIGURACIÓN DE FIREBASE
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

        // ==================== VARIABLES GLOBALES ====================
        let modalTipoActual = '';
        let itemEditandoId = null;
        let esAdmin = false;
        let notificacionesLeidas = new Set();

        // ==================== FUNCIONES DE BASE DE DATOS ====================

        // Cargar todos los datos
        async function cargarDatos() {
            try {
                console.log('Cargando datos desde Firebase...');
                
                // Cargar eventos
                const eventosSnapshot = await db.collection('eventos').get();
                const eventos = [];
                eventosSnapshot.forEach(doc => eventos.push({ id: doc.id, ...doc.data() }));
                
                // Cargar anuncios
                const anunciosSnapshot = await db.collection('anuncios').get();
                const anuncios = [];
                anunciosSnapshot.forEach(doc => anuncios.push({ id: doc.id, ...doc.data() }));
                
                // Cargar enseñanzas
                const ensenanzasSnapshot = await db.collection('ensenanzas').get();
                const ensenanzas = [];
                ensenanzasSnapshot.forEach(doc => ensenanzas.push({ id: doc.id, ...doc.data() }));
                
                // Cargar recursos
                const recursosSnapshot = await db.collection('recursos').get();
                const recursos = [];
                recursosSnapshot.forEach(doc => recursos.push({ id: doc.id, ...doc.data() }));
                
                // Cargar configuración
                const configDoc = await db.collection('configuracion').doc('admin').get();
                const config = configDoc.exists ? configDoc.data() : { password: 'SoloCristo2026' };
                
                const datos = { eventos, anuncios, ensenanzas, recursos, config };
                
                // Guardar en localStorage como backup
                localStorage.setItem('iglesia_backup', JSON.stringify(datos));
                
                console.log('Datos cargados:', datos);
                return datos;
                
            } catch (error) {
                console.error('Error cargando datos:', error);
                
                // Intentar con backup
                const backup = localStorage.getItem('iglesia_backup');
                if (backup) {
                    console.log('Usando backup local');
                    return JSON.parse(backup);
                }
                
                return { eventos: [], anuncios: [], ensenanzas: [], recursos: [], config: { password: 'SoloCristo2026' } };
            }
        }

        // Guardar un item
        async function guardarItem(tipo, item) {
            try {
                if (!esAdmin) throw new Error('No autorizado');
                
                console.log(`Guardando ${tipo}:`, item);
                
                const colecciones = {
                    'evento': 'eventos',
                    'anuncio': 'anuncios',
                    'ensenanza': 'ensenanzas',
                    'recurso': 'recursos'
                };
                
                const coleccion = colecciones[tipo];
                
                if (item.id) {
                    // Actualizar existente
                    await db.collection(coleccion).doc(item.id).set(item);
                } else {
                    // Crear nuevo
                    item.id = generarId(tipo);
                    await db.collection(coleccion).doc(item.id).set(item);
                }
                
                return { exito: true, id: item.id };
                
            } catch (error) {
                console.error('Error guardando:', error);
                return { exito: false, error: error.message };
            }
        }

        // Eliminar un item
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

        // Verificar contraseña
        async function verificarAdmin(password) {
            try {
                const configDoc = await db.collection('configuracion').doc('admin').get();
                const config = configDoc.exists ? configDoc.data() : { password: 'SoloCristo2026' };
                
                return password === config.password;
            } catch (error) {
                console.error('Error verificando admin:', error);
                return false;
            }
        }

        // Generar ID
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
                        await eliminarItem('evento', e.currentTarget.dataset.id);
                        await renderCalendario(filtro);
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
                        await eliminarItem('anuncio', e.currentTarget.dataset.id);
                        await renderAnuncios();
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
            
            // Actualizar filtro de autores
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
                        await eliminarItem('ensenanza', e.currentTarget.dataset.id);
                        await renderEnsenanzas(document.getElementById('filtroEnsenanza').value);
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
                        await eliminarItem('recurso', e.currentTarget.dataset.id);
                        await renderRecursos();
                    });
                });
                
                document.querySelectorAll('.edit-recurso').forEach(btn => {
                    btn.addEventListener('click', (e) => abrirModalRecurso(e.currentTarget.dataset.id));
                });
            }
        }

        // ==================== NOTIFICACIONES ====================

        async function obtenerNotificaciones() {
            const datos = await cargarDatos();
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            const notificaciones = [];
            
            // Eventos de hoy
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
            
            // Anuncios recientes
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
                mostrarNotificacion('Debes iniciar sesión como administrador', 'error');
                mostrarLoginModal();
                return;
            }
            
            modalTipoActual = tipo;
            itemEditandoId = item?.id || null;
            
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

        // ==================== LOGIN ====================

        function mostrarLoginModal() {
            document.getElementById('loginModal').style.display = 'flex';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginError').style.display = 'none';
            document.getElementById('loginPassword').focus();
        }

        function cerrarLoginModal() {
            document.getElementById('loginModal').style.display = 'none';
        }

        function actualizarUIporPermisos() {
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = esAdmin ? 'inline-flex' : 'none';
            });
            
            const logoutLink = document.getElementById('logoutLink');
            const adminLoginLink = document.getElementById('adminLoginLink');
            const indicador = document.getElementById('modoIndicador');
            
            if (esAdmin) {
                if (logoutLink) logoutLink.style.display = 'inline';
                if (adminLoginLink) adminLoginLink.style.display = 'none';
                if (indicador) indicador.style.display = 'none';
            } else {
                if (logoutLink) logoutLink.style.display = 'none';
                if (adminLoginLink) adminLoginLink.style.display = 'inline';
                if (indicador) indicador.style.display = 'block';
            }
        }

        // ==================== GUARDAR FORMULARIO ====================

        document.getElementById('modal-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!esAdmin) {
                cerrarModal();
                mostrarNotificacion('Debes iniciar sesión como administrador', 'error');
                mostrarLoginModal();
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
                }
                
            } else if (tipo === 'anuncio') {
                nuevoItem.fecha = document.getElementById('item-fecha')?.value || '';
                const resultado = await guardarItem('anuncio', nuevoItem);
                if (resultado.exito) {
                    cerrarModal();
                    await renderAnuncios();
                }
                
            } else if (tipo === 'ensenanza') {
                nuevoItem.autor = document.getElementById('item-autor')?.value || '';
                nuevoItem.fecha = document.getElementById('item-fecha')?.value || '';
                nuevoItem.url = document.getElementById('item-url')?.value || '';
                const resultado = await guardarItem('ensenanza', nuevoItem);
                if (resultado.exito) {
                    cerrarModal();
                    await renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas');
                }
                
            } else if (tipo === 'recurso') {
                nuevoItem.tipo = document.getElementById('item-tipo')?.value || 'documento';
                nuevoItem.url = document.getElementById('item-url')?.value || '';
                const resultado = await guardarItem('recurso', nuevoItem);
                if (resultado.exito) {
                    cerrarModal();
                    await renderRecursos();
                }
            }
        });

        // ==================== INICIALIZACIÓN ====================

        document.addEventListener('DOMContentLoaded', async () => {
            console.log('Inicializando aplicación con Firebase...');
            
            // Cargar notificaciones leídas
            const leidas = localStorage.getItem('notificaciones_leidas');
            if (leidas) {
                notificacionesLeidas = new Set(JSON.parse(leidas));
            }
            
            // Verificar sesión
            esAdmin = sessionStorage.getItem('iglesia_admin') === 'true';
            actualizarUIporPermisos();
            
            // Configurar event listeners
            document.getElementById('adminLoginLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarLoginModal();
            });
            
            document.getElementById('logoutLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                esAdmin = false;
                sessionStorage.removeItem('iglesia_admin');
                actualizarUIporPermisos();
                mostrarNotificacion('Sesión cerrada', 'exito');
                
                // Recargar vistas
                renderCalendario('todos');
                renderAnuncios();
                renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas');
                renderRecursos();
            });
            
            document.getElementById('loginBtn')?.addEventListener('click', async () => {
                const password = document.getElementById('loginPassword')?.value || '';
                const valido = await verificarAdmin(password);
                
                if (valido) {
                    esAdmin = true;
                    sessionStorage.setItem('iglesia_admin', 'true');
                    actualizarUIporPermisos();
                    cerrarLoginModal();
                    mostrarNotificacion('Sesión iniciada', 'exito');
                    
                    // Recargar vistas con permisos de admin
                    renderCalendario('todos');
                    renderAnuncios();
                    renderEnsenanzas(document.getElementById('filtroEnsenanza')?.value || 'todas');
                    renderRecursos();
                } else {
                    document.getElementById('loginError').style.display = 'block';
                }
            });
            
            document.getElementById('loginCancelBtn')?.addEventListener('click', cerrarLoginModal);
            
            document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') document.getElementById('loginBtn')?.click();
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === document.getElementById('loginModal')) cerrarLoginModal();
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
            
            // Pestañas
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
            
            // Filtros calendario
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (e.target.id === 'nuevoEventoBtn') return;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderCalendario(btn.dataset.filter);
                });
            });
            
            document.getElementById('nuevoEventoBtn')?.addEventListener('click', () => abrirModalEvento());
            document.getElementById('nuevoAnuncioBtn')?.addEventListener('click', () => abrirModalAnuncio());
            document.getElementById('nuevaEnsenanzaBtn')?.addEventListener('click', () => abrirModalEnsenanza());
            document.getElementById('nuevoRecursoBtn')?.addEventListener('click', () => abrirModalRecurso());
            
            document.getElementById('filtroEnsenanza')?.addEventListener('change', (e) => {
                renderEnsenanzas(e.target.value);
            });
            
            document.querySelector('.close-modal')?.addEventListener('click', cerrarModal);
            window.addEventListener('click', (e) => {
                if (e.target === document.getElementById('modal')) cerrarModal();
            });
            
            // Render inicial
            await renderCalendario('todos');
            await renderAnuncios();
            await renderEnsenanzas('todas');
            await renderRecursos();
            
            await actualizarBadgeNotificaciones();
            
            // Actualizar cada 5 minutos
            setInterval(async () => {
                await actualizarBadgeNotificaciones();
            }, 300000);
            
            console.log('Aplicación inicializada correctamente');
        });

        // Estilos de animación
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