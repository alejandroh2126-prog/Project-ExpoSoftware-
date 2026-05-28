const respuestas = [
    { palabras: ['hola','buenas','saludos','hey'],
        resp: '¡Hola! Soy tu asistente emprendedor 🤖 ¿En qué puedo ayudarte hoy?' },
    { palabras: ['que es','para que','sirve','propósito','objetivo'],
        resp: 'Esta plataforma te ayuda a gestionar tus emprendimientos: puedes registrar negocios, controlar ingresos y gastos, establecer presupuestos y acceder a guías de administración empresarial.' },
    { palabras: ['emprendimiento','negocio','empresa','crear negocio'],
        resp: 'Para crear un emprendimiento ve al Dashboard y haz clic en "Nuevo emprendimiento". Puedes registrar el nombre, descripción, sector y fecha de inicio.' },
    { palabras: ['ingreso','venta','ganancia','entrada'],
        resp: 'Para registrar un ingreso ve al módulo de Finanzas, selecciona tu emprendimiento y haz clic en "+ Nueva transacción". Elige el tipo "Ingreso" y completa los datos.' },
    { palabras: ['gasto','egreso','pago','costo','salida'],
        resp: 'Para registrar un gasto ve a Finanzas → Nueva transacción → tipo "Gasto". Recuerda categorizar bien tus gastos para tener un mejor control financiero.' },
    { palabras: ['presupuesto','limite','control','planificar'],
        resp: 'Los presupuestos te permiten establecer un límite de gasto por categoría cada mes. Ve a Finanzas → "Nuevo presupuesto" y define el límite según tu planificación.' },
    { palabras: ['balance','ganando','perdiendo','resultado'],
        resp: 'El balance es la diferencia entre tus ingresos y gastos. Si es positivo estás generando utilidades. Si es negativo debes revisar tus gastos o aumentar tus ingresos.' },
    { palabras: ['flujo','caja','liquidez'],
        resp: 'El flujo de caja muestra cuándo entra y sale el dinero. Un consejo clave: registra todas las transacciones el mismo día que ocurran para tener datos precisos.' },
    { palabras: ['rut','dian','registro','formalizar','camara'],
        resp: 'Para formalizar tu negocio en Colombia necesitas: 1) Registro en la Cámara de Comercio, 2) RUT en la DIAN, 3) Cuenta bancaria empresarial. Revisa la sección de Guía para más detalles.' },
    { palabras: ['marketing','publicidad','clientes','redes','instagram'],
        resp: 'Para atraer clientes te recomiendo: crear perfil en Google Mi Negocio, publicar en redes sociales 3 veces por semana, usar WhatsApp Business y pedir reseñas a tus clientes actuales.' },
    { palabras: ['precio','cobrar','tarifa','valor'],
        resp: 'Para fijar precios considera: tus costos fijos + costos variables + margen de ganancia deseado. Una fórmula simple: Precio = Costo total × (1 + % ganancia). Investiga también los precios de tu competencia.' },
    { palabras: ['credito','prestamo','financiacion','dinero','capital'],
        resp: 'Las principales fuentes de financiación para emprendedores en Colombia son: Fondo Emprender (SENA), Bancóldex, iNNpulsa Colombia y las líneas de crédito de los bancos comerciales.' },
    { palabras: ['contraseña','cuenta','perfil','usuario'],
        resp: 'Si olvidaste tu contraseña, por ahora debes contactar al administrador. Tu sesión dura 7 días antes de que debas iniciar sesión nuevamente.' },
    { palabras: ['ayuda','no entiendo','como','instrucciones'],
        resp: 'Con gusto te ayudo. Puedes preguntarme sobre: cómo registrar ingresos y gastos, cómo crear emprendimientos, consejos de administración, cómo formalizar tu negocio, o cualquier función de la plataforma.' },
    { palabras: ['gracias','perfecto','excelente','genial'],
        resp: '¡De nada! 😊 Estoy aquí para ayudarte a hacer crecer tu emprendimiento. ¿Tienes alguna otra pregunta?' },
    { palabras: ['adios','hasta luego','chao','bye'],
        resp: '¡Hasta pronto! Mucho éxito con tu emprendimiento 🚀 Recuerda que estaré aquí cuando me necesites.' },
];

const respuestaDefault = 'No estoy seguro de cómo ayudarte con eso. Puedes preguntarme sobre: gestión de emprendimientos, control de finanzas, formalización de negocios, marketing o cómo usar la plataforma. 💡';

function obtenerRespuesta(msg) {
    const texto = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const r of respuestas) {
        if (r.palabras.some(p => texto.includes(p))) return r.resp;
    }
    return respuestaDefault;
}

function agregarMensaje(texto, tipo) {
    const cont = document.getElementById('chatMessages');
    const div  = document.createElement('div');
    div.className = `chat-msg ${tipo}`;
    div.textContent = texto;
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;
}

// Mensaje de bienvenida
setTimeout(() => {
    const cont = document.getElementById('chatMessages');
    if (cont) agregarMensaje('¡Hola! 👋 Soy tu asistente. Pregúntame sobre cómo usar la plataforma o cómo administrar tu emprendimiento.', 'bot');
}, 800);

document.getElementById('chatbotBtn').addEventListener('click', () => {
    const win = document.getElementById('chatbotWindow');
    win.style.display = win.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('cerrarChat').addEventListener('click', () => {
    document.getElementById('chatbotWindow').style.display = 'none';
});

document.getElementById('enviarChat').addEventListener('click', enviar);
document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') enviar();
});

function enviar() {
    const input = document.getElementById('chatInput');
    const msg   = input.value.trim();
    if (!msg) return;
    agregarMensaje(msg, 'user');
    input.value = '';
    setTimeout(() => agregarMensaje(obtenerRespuesta(msg), 'bot'), 500);
}