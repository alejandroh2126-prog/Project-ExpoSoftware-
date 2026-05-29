/* MENÚ MÓVIL */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');
if (menuToggle) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
}

/* DATOS DE LOS PILARES */
const pilaresData = {
    admin: {
        icon: '📋', titulo: 'Herramientas Administrativas',
        descripcion: 'Todo lo que necesitas para formalizar y estructurar tu negocio.',
        pasos: [
            { titulo: 'Registro en Cámara de Comercio', desc: 'Inscríbete presencialmente o en línea. El costo varía según el capital declarado.' },
            { titulo: 'RUT y NIT en la DIAN',           desc: 'Obligatorio para cualquier actividad económica en Colombia.' },
            { titulo: 'Tipo de sociedad',                desc: 'Elige entre Persona Natural, SAS, EIRL. La SAS es la más recomendada.' },
            { titulo: 'Cuenta bancaria empresarial',     desc: 'Separa las finanzas del negocio de las personales desde el inicio.' },
            { titulo: 'Libros de contabilidad',          desc: 'Usa Siigo, Alegra o una hoja de cálculo para registrar ingresos y egresos.' },
        ],
        tip: '💡 <strong>Consejo:</strong> Formalizar tu negocio te da acceso a créditos, convocatorias y contratos con empresas grandes.',
    },
    financiero: {
        icon: '💰', titulo: 'Gestión Financiera',
        descripcion: 'Maneja el dinero de tu negocio y accede a fuentes de financiación.',
        pasos: [
            { titulo: 'Flujo de caja mensual',  desc: 'Proyecta cuánto entra y cuánto sale para anticipar momentos críticos.' },
            { titulo: 'Punto de equilibrio',    desc: 'Calcula cuánto debes vender para cubrir costos fijos y variables.' },
            { titulo: 'Fondo Emprender',        desc: 'Capital semilla no reembolsable del SENA para emprendimientos.' },
            { titulo: 'Bancóldex y Finagro',    desc: 'Líneas de crédito para MiPymes con tasas preferenciales.' },
            { titulo: 'iNNpulsa Colombia',      desc: 'Recursos y programas de aceleración para emprendimientos de alto impacto.' },
            { titulo: 'Ahorro e inversión',     desc: 'Separa el 10% de ganancias para reinvertir y el 5% como fondo de emergencia.' },
        ],
        tip: '💡 <strong>Consejo:</strong> La mayoría de emprendimientos fracasan por flujo de caja. Controla tus números cada semana.',
    },
    normativo: {
        icon: '⚖️', titulo: 'Marco Normativo',
        descripcion: 'Conoce las leyes, permisos y obligaciones legales de tu negocio.',
        pasos: [
            { titulo: 'Ley 1014 de 2006',        desc: 'Ley de fomento a la cultura del emprendimiento en Colombia.' },
            { titulo: 'Registro de marca',       desc: 'Protege tu marca ante la Superintendencia de Industria y Comercio (SIC).' },
            { titulo: 'Uso de suelo',            desc: 'Verifica con la Secretaría de Planeación si el lugar permite actividad comercial.' },
            { titulo: 'Sayco y Acinpro',         desc: 'Si usas música en tu negocio, necesitas el permiso de reproducción pública.' },
            { titulo: 'Obligaciones laborales',  desc: 'Afilia empleados a salud, pensión y ARL. Paga prestaciones de ley.' },
            { titulo: 'Facturación electrónica', desc: 'Obligatoria para responsables de IVA. La DIAN la habilita gratuitamente.' },
        ],
        tip: '💡 <strong>Consejo:</strong> Unas pocas horas con un abogado o contador al inicio pueden ahorrarte multas costosas después.',
    },
    gestion: {
        icon: '⚙️', titulo: 'Gestión Empresarial',
        descripcion: 'Planifica, lidera y toma mejores decisiones en tu negocio.',
        pasos: [
            { titulo: 'Plan de negocio',     desc: 'Define propuesta de valor, mercado, competencia y proyecciones a 1, 3 y 5 años.' },
            { titulo: 'Modelo Canvas',       desc: 'Visualiza los 9 elementos clave de tu negocio en un lienzo ágil.' },
            { titulo: 'KPIs principales',    desc: 'Mide ventas, clientes nuevos, retención y costos. Lo que no se mide, no mejora.' },
            { titulo: 'Atención al cliente', desc: 'Un cliente satisfecho trae 3 más; uno insatisfecho aleja a 10.' },
            { titulo: 'Gestión del tiempo',  desc: 'Usa Trello, Notion o una agenda para priorizar y no perder el foco.' },
            { titulo: 'Red de apoyo',        desc: 'Conecta con otros emprendedores, incubadoras y aceleradoras locales.' },
        ],
        tip: '💡 <strong>Consejo:</strong> Trabaja EN tu negocio, no solo DENTRO de él. Dedica tiempo cada semana a pensar estratégicamente.',
    },
    publicidad: {
        icon: '📣', titulo: 'Publicidad y Marketing',
        descripcion: 'Atrae y fideliza clientes con estrategias efectivas y económicas.',
        pasos: [
            { titulo: 'Identidad de marca',    desc: 'Define logo, colores y tono de comunicación. La coherencia genera confianza.' },
            { titulo: 'Presencia digital',     desc: 'Crea perfiles en Instagram, Facebook y Google Mi Negocio. Publica 3 veces/semana.' },
            { titulo: 'SEO local',             desc: 'Optimiza tu ficha de Google Mi Negocio con fotos, horarios y palabras clave.' },
            { titulo: 'WhatsApp Business',     desc: 'Configura catálogo, respuestas automáticas y etiquetas de clientes.' },
            { titulo: 'Publicidad pagada',     desc: 'Desde $10.000/día puedes hacer campañas en Meta Ads o Google Ads.' },
            { titulo: 'Programa de referidos', desc: 'Incentiva a clientes actuales a recomendarte. Es el canal más rentable.' },
        ],
        tip: '💡 <strong>Consejo:</strong> El contenido educativo genera más confianza que la publicidad directa. ¡Comparte tu conocimiento!',
    },
    tecnologia: {
        icon: '💡', titulo: 'Innovación Tecnológica',
        descripcion: 'Digitaliza y potencia tu negocio con las herramientas correctas.',
        pasos: [
            { titulo: 'E-commerce',               desc: 'Vende en línea con Shopify, WooCommerce o MercadoLibre.' },
            { titulo: 'CRM gratuito',             desc: 'Usa HubSpot gratis para gestionar clientes y seguimientos.' },
            { titulo: 'Pagos digitales',          desc: 'Acepta Nequi, Daviplata, Bold o PSE. Más métodos = más ventas.' },
            { titulo: 'Automatización',           desc: 'Zapier o Make permiten automatizar tareas repetitivas sin programar.' },
            { titulo: 'Inteligencia Artificial',  desc: 'ChatGPT, Canva AI o Copy.ai para crear contenido sin ser experto.' },
            { titulo: 'Ciberseguridad básica',    desc: 'Contraseñas fuertes, doble autenticación y copias de seguridad regulares.' },
        ],
        tip: '💡 <strong>Consejo:</strong> No necesitas saber programar. Hoy existen herramientas sin código que aprendes a usar en pocas horas.',
    },
};

/* ABRIR MODAL */
function openModal(pilarId) {
    const data = pilaresData[pilarId];
    if (!data) return;
    document.getElementById('modalContent').innerHTML = `
    <div class="modal-header">
      <span class="modal-icon">${data.icon}</span>
      <div>
        <h2>${data.titulo}</h2>
        <p>${data.descripcion}</p>
      </div>
    </div>
    <div class="modal-section">
      <h4>Pasos y herramientas clave</h4>
      <ul class="modal-list">
        ${data.pasos.map(p => `
          <li>
            <div>
              <strong>${p.titulo}</strong><br/>
              <span style="color:#888780;font-size:13px">${p.desc}</span>
            </div>
          </li>`).join('')}
      </ul>
    </div>
    <div class="modal-tip">${data.tip}</div>
  `;
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/* CERRAR MODAL */
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* CHECKLIST */
const checklistItems = [
    { id:'c1',  titulo:'Registrar el negocio en la Cámara de Comercio', desc:'Trámite en ccb.com.co presencial o en línea' },
    { id:'c2',  titulo:'Obtener el RUT y NIT en la DIAN',               desc:'Obligatorio para cualquier actividad económica' },
    { id:'c3',  titulo:'Abrir una cuenta bancaria empresarial',          desc:'Separa las finanzas personales de las del negocio' },
    { id:'c4',  titulo:'Elaborar el flujo de caja mensual',             desc:'Proyecta ingresos y egresos para los próximos 3 meses' },
    { id:'c5',  titulo:'Verificar el uso de suelo del local',           desc:'Secretaría Distrital de Planeación' },
    { id:'c6',  titulo:'Habilitarme para facturación electrónica',      desc:'Obligatorio según normativa DIAN vigente' },
    { id:'c7',  titulo:'Completar el modelo Canvas del negocio',        desc:'Define los 9 elementos clave del modelo de negocio' },
    { id:'c8',  titulo:'Definir los KPIs principales',                  desc:'Ventas, clientes, costos y retención como mínimo' },
    { id:'c9',  titulo:'Crear perfil en Google Mi Negocio',             desc:'Aumenta la visibilidad en búsquedas locales' },
    { id:'c10', titulo:'Configurar WhatsApp Business',                  desc:'Catálogo, horarios y respuestas automáticas' },
    { id:'c11', titulo:'Habilitar al menos un método de pago digital',  desc:'Nequi, Daviplata, Bold, PSE u otro' },
    { id:'c12', titulo:'Explorar herramientas de IA para el negocio',   desc:'ChatGPT, Canva AI, Copy.ai u otras gratuitas' },
];

const STORAGE_KEY = 'guia_checklist_v2';
function loadChecked() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveChecked(arr) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {} }

function renderChecklist() {
    const checked = loadChecked();
    const ul = document.getElementById('checklistItems');
    if (!ul) return;
    ul.innerHTML = '';
    checklistItems.forEach(item => {
        const isDone = checked.includes(item.id);
        const li = document.createElement('li');
        li.className = 'checklist-item' + (isDone ? ' done' : '');
        li.innerHTML = `
      <div class="check-box">${isDone ? '✓' : ''}</div>
      <div class="check-text">
        <strong>${item.titulo}</strong>
        <p>${item.desc}</p>
      </div>`;
        li.addEventListener('click', () => {
            const current = loadChecked();
            const idx = current.indexOf(item.id);
            if (idx === -1) current.push(item.id); else current.splice(idx, 1);
            saveChecked(current);
            renderChecklist();
        });
        ul.appendChild(li);
    });
    updateProgress();
}

function updateProgress() {
    const pct = Math.round((loadChecked().length / checklistItems.length) * 100);
    const bar = document.getElementById('progressBar');
    const lbl = document.getElementById('progressLabel');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% completado';
}

const resetBtn = document.getElementById('resetChecklist');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm('¿Reiniciar todo el checklist?')) { saveChecked([]); renderChecklist(); }
    });
}

renderChecklist();

/* ANIMACIÓN DE ENTRADA */
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.pilar-card, .recurso-card, .autor-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});