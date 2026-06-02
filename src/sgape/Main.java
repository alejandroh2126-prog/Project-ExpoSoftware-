package sgape;

import java.util.*;

// Clase principal - menú de consola con POO completa
public class Main {

    static Scanner scanner = new Scanner(System.in);
    static ArchivoDAO dao  = new ArchivoDAO();
    static List<Emprendimiento> emprendimientos = new ArrayList<>();
    static int contadorEmp  = 1;
    static int contadorCargo= 1;
    static int contadorTrab = 1;

    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════╗");
        System.out.println("║   SGAPE - Sistema de Gestión de          ║");
        System.out.println("║   Administración de Emprendimientos       ║");
        System.out.println("║   Universidad Popular del Cesar           ║");
        System.out.println("║   Autor: Alejandro Henríquez Quinchia     ║");
        System.out.println("╚══════════════════════════════════════════╝");

        // Cargar datos guardados
        emprendimientos = dao.leerEmprendimientos();
        System.out.println("\n✅ " + emprendimientos.size() + " emprendimiento(s) cargado(s).");

        boolean salir = false;
        while (!salir) {
            System.out.println("\n══════════ MENÚ PRINCIPAL ══════════");
            System.out.println("1. Crear emprendimiento");
            System.out.println("2. Ver emprendimientos");
            System.out.println("3. Gestionar cargos");
            System.out.println("4. Gestionar trabajadores");
            System.out.println("5. Ver nómina completa");
            System.out.println("6. Guardar y salir");
            System.out.print("Selecciona una opción: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1" -> crearEmprendimiento();
                case "2" -> verEmprendimientos();
                case "3" -> menuCargos();
                case "4" -> menuTrabajadores();
                case "5" -> verNomina();
                case "6" -> { guardarTodo(); salir = true; }
                default  -> System.out.println("❌ Opción no válida.");
            }
        }
        System.out.println("\n¡Hasta luego! Datos guardados correctamente.");
    }

    static void crearEmprendimiento() {
        System.out.println("\n── NUEVO EMPRENDIMIENTO ──");
        System.out.print("Nombre: ");        String nom = scanner.nextLine();
        System.out.print("Descripción: ");   String des = scanner.nextLine();
        System.out.print("Sector: ");        String sec = scanner.nextLine();
        System.out.print("Fecha inicio (YYYY-MM-DD): "); String fec = scanner.nextLine();
        Emprendimiento e = new Emprendimiento(contadorEmp++, nom, des, sec, fec, 1);
        emprendimientos.add(e);
        System.out.println("✅ Emprendimiento '" + nom + "' creado.");
    }

    static void verEmprendimientos() {
        if (emprendimientos.isEmpty()) {
            System.out.println("No hay emprendimientos registrados.");
            return;
        }
        System.out.println("\n── EMPRENDIMIENTOS ──");
        emprendimientos.forEach(e -> System.out.println(e));
    }

    static Emprendimiento seleccionarEmprendimiento() {
        verEmprendimientos();
        if (emprendimientos.isEmpty()) return null;
        System.out.print("ID del emprendimiento: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        return emprendimientos.stream()
                .filter(e -> e.getId() == id).findFirst().orElse(null);
    }

    static void menuCargos() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) { System.out.println("❌ No encontrado."); return; }

        // Cargar cargos del archivo
        List<Cargo> cargos = dao.leerCargos(emp.getId());
        emp.getCargos().clear();
        cargos.forEach(emp::agregarCargo);

        System.out.println("\n── CARGOS de " + emp.getNombre() + " ──");
        System.out.println("1. Crear cargo");
        System.out.println("2. Ver cargos");
        System.out.print("Opción: ");
        String op = scanner.nextLine().trim();

        if (op.equals("1")) {
            System.out.print("Nombre del cargo: ");   String nom = scanner.nextLine();
            System.out.print("Salario base mensual: $"); double sal = Double.parseDouble(scanner.nextLine());
            System.out.print("Descripción: ");        String des = scanner.nextLine();
            Cargo c = new Cargo(contadorCargo++, nom, sal, des);
            emp.agregarCargo(c);
            dao.guardarCargos(emp.getCargos(), emp.getId());
            System.out.println("✅ Cargo creado.");
            System.out.println(c);
        } else {
            if (emp.getCargos().isEmpty()) System.out.println("Sin cargos.");
            else emp.getCargos().forEach(System.out::println);
        }
    }

    static void menuTrabajadores() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) { System.out.println("❌ No encontrado."); return; }

        List<Cargo> cargos = dao.leerCargos(emp.getId());
        emp.getCargos().clear();
        cargos.forEach(emp::agregarCargo);

        List<Trabajador> trabajadores = dao.leerTrabajadores(emp.getId(), cargos);
        emp.getTrabajadores().clear();
        trabajadores.forEach(emp::agregarTrabajador);

        System.out.println("\n── TRABAJADORES de " + emp.getNombre() + " ──");
        System.out.println("1. Registrar trabajador");
        System.out.println("2. Ver trabajadores");
        System.out.print("Opción: ");
        String op = scanner.nextLine().trim();

        if (op.equals("1")) {
            if (emp.getCargos().isEmpty()) {
                System.out.println("❌ Primero crea cargos para este emprendimiento.");
                return;
            }
            System.out.print("Nombre: ");    String nom = scanner.nextLine();
            System.out.print("Apellido: ");  String ape = scanner.nextLine();
            System.out.print("Cédula: ");    String ced = scanner.nextLine();
            System.out.println("Cargos disponibles:");
            emp.getCargos().forEach(c -> System.out.println("  ID " + c.getId() + ": " + c.getNombre()));
            System.out.print("ID del cargo: "); int cargoId = Integer.parseInt(scanner.nextLine().trim());
            Cargo cargo = emp.getCargos().stream()
                    .filter(c -> c.getId() == cargoId).findFirst().orElse(null);
            if (cargo == null) { System.out.println("❌ Cargo no encontrado."); return; }
            System.out.print("Fecha ingreso (YYYY-MM-DD): "); String fec = scanner.nextLine();
            Trabajador t = new Trabajador(contadorTrab++, nom, ape, ced, cargo, fec, emp.getId());
            emp.agregarTrabajador(t);
            dao.guardarTrabajadores(emp.getTrabajadores(), emp.getId());
            System.out.println("✅ Trabajador registrado: " + t);
        } else {
            if (emp.getTrabajadores().isEmpty()) System.out.println("Sin trabajadores.");
            else emp.getTrabajadores().forEach(System.out::println);
        }
    }

    static void verNomina() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) { System.out.println("❌ No encontrado."); return; }
        List<Cargo>      cargos      = dao.leerCargos(emp.getId());
        List<Trabajador> trabajadores = dao.leerTrabajadores(emp.getId(), cargos);
        emp.getCargos().clear();     cargos.forEach(emp::agregarCargo);
        emp.getTrabajadores().clear(); trabajadores.forEach(emp::agregarTrabajador);
        new Nomina(emp).imprimirResumen();
    }

    static void guardarTodo() {
        dao.guardarEmprendimientos(emprendimientos);
        emprendimientos.forEach(e -> {
            dao.guardarCargos(e.getCargos(), e.getId());
            dao.guardarTrabajadores(e.getTrabajadores(), e.getId());
        });
    }
}