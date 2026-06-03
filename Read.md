# SGAPE – Sistema de Gestión, Administración y Promoción de Emprendimientos

> **Proyecto de curso** · Programación de Computadores II (POO)  
> **Autor:** Alejandro Henríquez Quinchia  
> **Docente:** Amilkar José Hernández Oñate  
> **Universidad Popular del Cesar** · Ingeniería de Sistemas · 2024

---

## 📌 Descripción general

SGAPE es una plataforma web completa que permite a emprendedores colombianos gestionar, promover y administrar sus negocios desde un solo lugar. El sistema combina un **módulo Java de consola** (que demuestra los principios de POO) con una **aplicación web completa** (frontend + backend Node.js).

---

## 🎯 Objetivo del proyecto

Aplicar los conceptos y técnicas de la Programación Orientada a Objetos en el diseño y construcción de una solución de software de mediana complejidad, obteniendo como resultado un aplicativo robusto, fiable, flexible, mantenible y bien documentado.

---

## 🏗️ Arquitectura del sistema

SGAPE/
├── src/                        ← Módulo Java (POO pura)
│   └── sgape/
│       ├── Persona.java        ← Clase abstracta base
│       ├── Trabajador.java     ← Hereda de Persona
│       ├── Cargo.java          ← Encapsulamiento + cálculos
│       ├── Emprendimiento.java ← Colección de objetos
│       ├── Nomina.java         ← Lógica de negocio
│       ├── ArchivoDAO.java     ← Persistencia en archivos
│       └── Main.java           ← Menú principal consola
│
├── backend/                    ← Servidor Node.js + Express
│   ├── server.js               ← Servidor principal (puerto 3000)
│   ├── database.js             ← Base de datos SQLite
│   └── routes/
│       ├── auth.js             ← Login y registro JWT
│       ├── emprendimientos.js  ← CRUD emprendimientos
│       ├── finanzas.js         ← Transacciones y presupuestos
│       └── nomina.js           ← Trabajadores y cargos
│
└── frontend/                   ← Interfaz web
├── index.html              ← Landing page pública
├── login.html              ← Inicio de sesión
├── registro.html           ← Registro de usuario
├── dashboard.html          ← Panel principal
├── finanzas.html           ← Módulo financiero
├── nomina.html             ← Módulo de nómina
├── css/styles.css          ← Estilos globales
└── js/
├── auth.js             ← Lógica de autenticación
├── dashboard.js        ← Lógica del dashboard
├── finanzas.js         ← Lógica financiera
├── nomina.js           ← Lógica de nómina
└── chatbot.js          ← Asistente virtual

---

## ☕ Módulo Java – Principios POO aplicados

### Clases implementadas

| Clase | Tipo | Principio POO |
|---|---|---|
| `Persona` | Abstracta | Abstracción |
| `Trabajador` | Concreta | **Herencia** (`extends Persona`) |
| `Cargo` | Concreta | **Encapsulamiento** (getters/setters) |
| `Emprendimiento` | Concreta | **Colecciones de objetos** |
| `Nomina` | Concreta | **Delegación y composición** |
| `ArchivoDAO` | Concreta | **Persistencia en archivos** |

### Pilares POO implementados

**1. Encapsulamiento**
```java
public class Cargo {
    private String nombre;
    private double salarioBase;

    public double getSalarioNeto() {
        return salarioBase * (1 - TOTAL_DEDUCCIONES);
    }
}
```

**2. Herencia**
```java
public class Trabajador extends Persona {
    // Hereda nombre, apellido, cédula de Persona
    // Agrega cargo, fechaIngreso, estado
}
```

**3. Polimorfismo**
```java
// Método abstracto en Persona
public abstract String getTipoPersona();

// Implementado en Trabajador
@Override
public String getTipoPersona() { return "Trabajador"; }
```

**4. Abstracción**
```java
public abstract class Persona {
    // Define estructura común para todos los tipos de persona
    public abstract String getTipoPersona();
}
```

### Persistencia en archivos (Unidad 4)

El módulo guarda y carga datos en archivos `.csv` dentro de la carpeta `datos/`:

datos/
├── emprendimientos.csv
├── cargos_1.csv
└── trabajadores_1.csv

### Cálculo automático de nómina

---

## 🌐 Módulo Web – Funcionalidades

### Autenticación
- Registro de usuarios con contraseña encriptada (bcryptjs)
- Inicio de sesión con token JWT (duración 7 días)
- Protección de rutas privadas

### Dashboard
- Vista general de todos los emprendimientos del usuario
- Estadísticas rápidas (total, activos, fecha de registro)
- Crear, editar y eliminar emprendimientos

### Módulo Financiero
- Registro de ingresos y gastos por categoría
- Presupuestos mensuales por categoría
- Balance general en tiempo real (ingresos − gastos)

### Módulo de Nómina Web
- Registro de cargos con salario base personalizable
- Registro de trabajadores asociados a un cargo
- Cálculo automático: mensual, quincenal, deducciones y neto
- Resumen de nómina total por emprendimiento

### Chatbot asistente
- Responde preguntas sobre el uso de la plataforma
- Brinda consejos de administración empresarial
- Disponible en todas las páginas del sistema

---

## 🚀 Cómo ejecutar el proyecto

### Módulo Java (consola)

```bash
# Desde la carpeta src/
cd src

# Compilar
javac -encoding UTF-8 sgape\Persona.java sgape\Cargo.java sgape\Trabajador.java sgape\Emprendimiento.java sgape\Nomina.java sgape\ArchivoDAO.java sgape\Main.java

# Ejecutar
java -cp . sgape.Main
```

### Módulo Web

```bash
# Instalar dependencias (solo la primera vez)
cd backend
npm install

# Iniciar el servidor
node server.js
```

Luego abre el navegador en: **http://localhost:3000**

---

## 🛠️ Tecnologías utilizadas

### Java (módulo de consola)
| Tecnología | Uso |
|---|---|
| Java 25 (OpenJDK) | Lenguaje principal del módulo POO |
| `java.io.File` | Lectura y escritura de archivos |
| `java.util.ArrayList` | Colecciones de objetos |
| `java.util.Scanner` | Entrada de datos por consola |

### Web (frontend + backend)
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor web y API REST |
| better-sqlite3 | Base de datos local |
| bcryptjs | Encriptación de contraseñas |
| jsonwebtoken | Sesiones de usuario |
| HTML5 + CSS3 | Interfaz de usuario |
| JavaScript ES6+ | Lógica del frontend |

---

## 📚 Unidades del plan de asignatura cubiertas

| Unidad | Tema | Implementación |
|---|---|---|
| Unidad 1 | Introducción a POO | Clases, objetos, paradigma OO en Java |
| Unidad 2 | Programación basada en objetos | `Persona`, `Cargo`, `Emprendimiento` con atributos y métodos |
| Unidad 3 | Herencia, polimorfismo e interfaces | `Trabajador extends Persona`, método abstracto `getTipoPersona()` |
| Unidad 4 | Persistencia de datos | `ArchivoDAO` con `FileWriter`, `BufferedReader`, archivos CSV |
| Unidad 5 | Interfaz gráfica de usuario | Frontend web con HTML/CSS/JS, navegación y gestión de eventos |

---

## 👥 Integrantes

| Rol | Nombre |
|---|---|
| Autor / Desarrollador | Alejandro Henríquez Quinchia |
| Docente | Amilkar José Hernández Oñate |
| Compañero | Olmer David Ramírez Trejos |

---

## 📄 Licencia

Proyecto académico – Universidad Popular del Cesar · 2024  
Todos los derechos reservados © Alejandro Henríquez Quinchia