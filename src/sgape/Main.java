package sgape;

import java.util.*;

public class Main {

    static Scanner scanner = new Scanner(System.in);
    static ArchivoDAO dao  = new ArchivoDAO();
    static List<Emprendimiento> emprendimientos = new ArrayList<>();
    static int contadorEmp   = 1;
    static int contadorCargo = 1;
    static int contadorTrab  = 1;

    public static void main(String[] args) {
        System.out.println("╔══════════════════════════════════════════╗");
        System.out.println("║   SGAPE - Sistema de Gestión de          ║");
        System.out.println("║   Administración de Emprendimientos       ║");
        System.out.println("║   Universidad Popular del Cesar · 2026   ║");
        System.out.println("║   Autor: Alejandro Henríquez Quinchia     ║");
        System.out.println("╚══════════════════════════════════════════╝");

        emprendimientos = dao.leerEmprendimientos();
        emprendimientos.forEach(e -> {
            if (e.getId() >= contadorEmp) contadorEmp = e.getId() + 1;
        });
        System.out.println("\n✅ " + emprendimientos.size() + " emprendimiento(s) cargado(s).");

        boolean salir = false;
        while (!salir) {
            System.out.println("\n══════════ MENÚ PRINCIPAL ══════════");
            System.out.println("1. Crear emprendimiento");
            System.out.println("2. Ver emprendimientos");
            System.out.println("3. Editar emprendimiento");
            System.out.println("4. Eliminar emprendimiento");
            System.out.println("5. Gestionar cargos");
            System.out.println("6. Gestionar trabajadores");
            System.out.println("7. Ver nómina completa");
            System.out.println("8. Guardar y salir");
            System.out.print("\nSelecciona una opción: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1" -> crearEmprendimiento();
                case "2" -> verEmprendimientos();
                case "3" -> editarEmprendimiento();
                case "4" -> eliminarEmprendimiento();
                case "5" -> menuCargos();
                case "6" -> menuTrabajadores();
                case "7" -> verNomina();
                case "8" -> { guardarTodo(); salir = true; }
                default  -> System.out.println("❌ Opción no válida.");
            }
        }
        System.out.println("\n¡Hasta luego! Datos guardados correctamente.");
    }

    // ══════════════════════════════════════════
    // EMPRENDIMIENTOS
    // ══════════════════════════════════════════

    static void crearEmprendimiento() {
        System.out.println("\n── NUEVO EMPRENDIMIENTO ──");
        System.out.print("Nombre: ");
        String nom = scanner.nextLine().trim();
        if (nom.isEmpty()) { System.out.println("❌ El nombre es obligatorio."); return; }

        System.out.print("Descripción: ");   String des = scanner.nextLine();
        System.out.print("Sector: ");        String sec = scanner.nextLine();
        System.out.print("Fecha inicio (YYYY-MM-DD): "); String fec = scanner.nextLine();

        Emprendimiento e = new Emprendimiento(contadorEmp++, nom, des, sec, fec, 1);
        emprendimientos.add(e);
        guardarTodo();
        System.out.println("✅ Emprendimiento '" + nom + "' creado correctamente.");
    }

    static void verEmprendimientos() {
        if (emprendimientos.isEmpty()) {
            System.out.println("\n⚠️  No hay emprendimientos registrados.");
            return;
        }
        System.out.println("\n── EMPRENDIMIENTOS ──");
        emprendimientos.forEach(e ->
                System.out.printf("  [ID %d] %s%n", e.getId(), e));
    }

    static void editarEmprendimiento() {
        verEmprendimientos();
        if (emprendimientos.isEmpty()) return;

        System.out.print("\nID del emprendimiento a editar: ");
        int id = leerEntero();
        Emprendimiento emp = buscarEmprendimiento(id);
        if (emp == null) { System.out.println("❌ No encontrado."); return; }

        System.out.println("\n── EDITAR: " + emp.getNombre() + " ──");
        System.out.println("(Presiona Enter para conservar el valor actual)");

        System.out.print("Nombre [" + emp.getNombre() + "]: ");
        String nom = scanner.nextLine().trim();
        if (!nom.isEmpty()) emp.setNombre(nom);

        System.out.print("Descripción [" + emp.getDescripcion() + "]: ");
        String des = scanner.nextLine().trim();
        if (!des.isEmpty()) emp.setDescripcion(des);

        System.out.print("Sector [" + emp.getSector() + "]: ");
        String sec = scanner.nextLine().trim();
        if (!sec.isEmpty()) emp.setSector(sec);

        System.out.print("Fecha inicio [" + emp.getFechaInicio() + "]: ");
        String fec = scanner.nextLine().trim();
        if (!fec.isEmpty()) emp.setFechaInicio(fec);

        System.out.print("Estado (activo/inactivo) [" + emp.getEstado() + "]: ");
        String est = scanner.nextLine().trim();
        if (!est.isEmpty()) emp.setEstado(est);

        guardarTodo();
        System.out.println("✅ Emprendimiento actualizado correctamente.");
    }

    static void eliminarEmprendimiento() {
        verEmprendimientos();
        if (emprendimientos.isEmpty()) return;

        System.out.print("\nID del emprendimiento a eliminar: ");
        int id = leerEntero();
        Emprendimiento emp = buscarEmprendimiento(id);
        if (emp == null) { System.out.println("❌ No encontrado."); return; }

        System.out.print("¿Seguro que deseas eliminar '" + emp.getNombre() +
                "' y todos sus datos? (s/n): ");
        if (!scanner.nextLine().trim().equalsIgnoreCase("s")) {
            System.out.println("Operación cancelada.");
            return;
        }

        emprendimientos.remove(emp);
        guardarTodo();
        System.out.println("✅ Emprendimiento eliminado.");
    }

    // ══════════════════════════════════════════
    // CARGOS
    // ══════════════════════════════════════════

    static void menuCargos() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) return;

        List<Cargo> cargos = dao.leerCargos(emp.getId());
        emp.getCargos().clear();
        cargos.forEach(emp::agregarCargo);

        boolean volver = false;
        while (!volver) {
            System.out.println("\n── CARGOS de: " + emp.getNombre() + " ──");
            System.out.println("1. Crear cargo");
            System.out.println("2. Ver cargos");
            System.out.println("3. Editar cargo");
            System.out.println("4. Eliminar cargo");
            System.out.println("5. Volver al menú principal");
            System.out.print("Opción: ");
            String op = scanner.nextLine().trim();
            switch (op) {
                case "1" -> crearCargo(emp);
                case "2" -> verCargos(emp);
                case "3" -> editarCargo(emp);
                case "4" -> eliminarCargo(emp);
                case "5" -> volver = true;
                default  -> System.out.println("❌ Opción no válida.");
            }
        }
    }

    static void crearCargo(Emprendimiento emp) {
        System.out.println("\n── NUEVO CARGO ──");
        System.out.print("Nombre del cargo: ");
        String nom = scanner.nextLine().trim();
        if (nom.isEmpty()) { System.out.println("❌ El nombre es obligatorio."); return; }

        System.out.print("Salario base mensual ($): ");
        double sal = leerDouble();
        if (sal <= 0) { System.out.println("❌ El salario debe ser mayor a 0."); return; }

        System.out.print("Descripción (opcional): ");
        String des = scanner.nextLine().trim();

        Cargo c = new Cargo(contadorCargo++, nom, sal, des);
        emp.agregarCargo(c);
        dao.guardarCargos(emp.getCargos(), emp.getId());

        System.out.println("✅ Cargo creado:");
        System.out.println("   " + c);
    }

    static void verCargos(Emprendimiento emp) {
        if (emp.getCargos().isEmpty()) {
            System.out.println("\n⚠️  Sin cargos registrados.");
            return;
        }
        System.out.println("\n── CARGOS ──");
        emp.getCargos().forEach(c ->
                System.out.printf("  [ID %d] %s%n", c.getId(), c));
    }

    static void editarCargo(Emprendimiento emp) {
        verCargos(emp);
        if (emp.getCargos().isEmpty()) return;

        System.out.print("\nID del cargo a editar: ");
        int id = leerEntero();
        Cargo cargo = emp.getCargos().stream()
                .filter(c -> c.getId() == id).findFirst().orElse(null);
        if (cargo == null) { System.out.println("❌ No encontrado."); return; }

        System.out.println("\n── EDITAR CARGO: " + cargo.getNombre() + " ──");
        System.out.println("(Presiona Enter para conservar el valor actual)");

        System.out.print("Nombre [" + cargo.getNombre() + "]: ");
        String nom = scanner.nextLine().trim();
        if (!nom.isEmpty()) cargo.setNombre(nom);

        System.out.print("Salario base [" + cargo.getSalarioBase() + "]: ");
        String salStr = scanner.nextLine().trim();
        if (!salStr.isEmpty()) {
            try {
                double nuevo = Double.parseDouble(salStr);
                if (nuevo > 0) cargo.setSalarioBase(nuevo);
                else System.out.println("⚠️  Valor inválido, se conserva el anterior.");
            } catch (NumberFormatException e) {
                System.out.println("⚠️  Valor inválido, se conserva el anterior.");
            }
        }

        System.out.print("Descripción [" + cargo.getDescripcion() + "]: ");
        String des = scanner.nextLine().trim();
        if (!des.isEmpty()) cargo.setDescripcion(des);

        dao.guardarCargos(emp.getCargos(), emp.getId());
        System.out.println("✅ Cargo actualizado:");
        System.out.println("   " + cargo);
    }

    static void eliminarCargo(Emprendimiento emp) {
        verCargos(emp);
        if (emp.getCargos().isEmpty()) return;

        System.out.print("\nID del cargo a eliminar: ");
        int id = leerEntero();
        Cargo cargo = emp.getCargos().stream()
                .filter(c -> c.getId() == id).findFirst().orElse(null);
        if (cargo == null) { System.out.println("❌ No encontrado."); return; }

        List<Trabajador> trabs = dao.leerTrabajadores(emp.getId(), emp.getCargos());
        boolean enUso = trabs.stream()
                .anyMatch(t -> t != null && t.getCargo().getId() == id);
        if (enUso) {
            System.out.println("❌ No puedes eliminar este cargo: tiene trabajadores asignados.");
            System.out.println("   Elimina o reasigna los trabajadores primero.");
            return;
        }

        System.out.print("¿Eliminar cargo '" + cargo.getNombre() + "'? (s/n): ");
        if (!scanner.nextLine().trim().equalsIgnoreCase("s")) {
            System.out.println("Operación cancelada.");
            return;
        }

        emp.getCargos().remove(cargo);
        dao.guardarCargos(emp.getCargos(), emp.getId());
        System.out.println("✅ Cargo eliminado.");
    }

    // ══════════════════════════════════════════
    // TRABAJADORES
    // ══════════════════════════════════════════

    static void menuTrabajadores() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) return;

        List<Cargo> cargos = dao.leerCargos(emp.getId());
        emp.getCargos().clear();
        cargos.forEach(emp::agregarCargo);

        List<Trabajador> trabajadores = dao.leerTrabajadores(emp.getId(), cargos);
        emp.getTrabajadores().clear();
        trabajadores.stream().filter(t -> t != null).forEach(emp::agregarTrabajador);

        boolean volver = false;
        while (!volver) {
            System.out.println("\n── TRABAJADORES de: " + emp.getNombre() + " ──");
            System.out.println("1. Registrar trabajador");
            System.out.println("2. Ver trabajadores");
            System.out.println("3. Editar trabajador");
            System.out.println("4. Eliminar trabajador");
            System.out.println("5. Volver al menú principal");
            System.out.print("Opción: ");
            String op = scanner.nextLine().trim();
            switch (op) {
                case "1" -> crearTrabajador(emp);
                case "2" -> verTrabajadores(emp);
                case "3" -> editarTrabajador(emp);
                case "4" -> eliminarTrabajador(emp);
                case "5" -> volver = true;
                default  -> System.out.println("❌ Opción no válida.");
            }
        }
    }

    static void crearTrabajador(Emprendimiento emp) {
        if (emp.getCargos().isEmpty()) {
            System.out.println("❌ Primero crea al menos un cargo para este emprendimiento.");
            return;
        }
        System.out.println("\n── NUEVO TRABAJADOR ──");
        System.out.print("Nombre: ");   String nom = scanner.nextLine().trim();
        System.out.print("Apellido: "); String ape = scanner.nextLine().trim();
        if (nom.isEmpty() || ape.isEmpty()) {
            System.out.println("❌ Nombre y apellido son obligatorios.");
            return;
        }
        System.out.print("Cédula: "); String ced = scanner.nextLine().trim();

        verCargos(emp);
        System.out.print("ID del cargo: ");
        int cargoId = leerEntero();
        Cargo cargo = emp.getCargos().stream()
                .filter(c -> c.getId() == cargoId).findFirst().orElse(null);
        if (cargo == null) { System.out.println("❌ Cargo no encontrado."); return; }

        System.out.print("Fecha de ingreso (YYYY-MM-DD): ");
        String fec = scanner.nextLine().trim();

        Trabajador t = new Trabajador(contadorTrab++, nom, ape, ced, cargo, fec, emp.getId());
        emp.agregarTrabajador(t);
        dao.guardarTrabajadores(emp.getTrabajadores(), emp.getId());
        System.out.println("✅ Trabajador registrado:");
        System.out.println("   " + t);
    }

    static void verTrabajadores(Emprendimiento emp) {
        if (emp.getTrabajadores().isEmpty()) {
            System.out.println("\n⚠️  Sin trabajadores registrados.");
            return;
        }
        System.out.println("\n── TRABAJADORES ──");
        emp.getTrabajadores().forEach(t ->
                System.out.printf("  [ID %d] %s%n", t.getId(), t));
    }

    static void editarTrabajador(Emprendimiento emp) {
        verTrabajadores(emp);
        if (emp.getTrabajadores().isEmpty()) return;

        System.out.print("\nID del trabajador a editar: ");
        int id = leerEntero();
        Trabajador trab = emp.getTrabajadores().stream()
                .filter(t -> t.getId() == id).findFirst().orElse(null);
        if (trab == null) { System.out.println("❌ No encontrado."); return; }

        System.out.println("\n── EDITAR: " + trab.getNombreCompleto() + " ──");
        System.out.println("(Presiona Enter para conservar el valor actual)");

        System.out.print("Nombre [" + trab.getNombre() + "]: ");
        String nom = scanner.nextLine().trim();
        if (!nom.isEmpty()) trab.setNombre(nom);

        System.out.print("Apellido [" + trab.getApellido() + "]: ");
        String ape = scanner.nextLine().trim();
        if (!ape.isEmpty()) trab.setApellido(ape);

        System.out.print("Cédula [" + trab.getCedula() + "]: ");
        String ced = scanner.nextLine().trim();
        if (!ced.isEmpty()) trab.setCedula(ced);

        System.out.print("Fecha ingreso [" + trab.getFechaIngreso() + "]: ");
        String fec = scanner.nextLine().trim();
        if (!fec.isEmpty()) trab.setFechaIngreso(fec);

        System.out.print("Estado (activo/inactivo) [" + trab.getEstado() + "]: ");
        String est = scanner.nextLine().trim();
        if (!est.isEmpty()) trab.setEstado(est);

        System.out.print("¿Cambiar cargo? (s/n): ");
        if (scanner.nextLine().trim().equalsIgnoreCase("s")) {
            verCargos(emp);
            System.out.print("ID del nuevo cargo: ");
            int cargoId = leerEntero();
            Cargo nuevoCargo = emp.getCargos().stream()
                    .filter(c -> c.getId() == cargoId).findFirst().orElse(null);
            if (nuevoCargo != null) {
                trab.setCargo(nuevoCargo);
                System.out.println("✅ Cargo cambiado a: " + nuevoCargo.getNombre());
            } else {
                System.out.println("⚠️  Cargo no encontrado, se conserva el anterior.");
            }
        }

        dao.guardarTrabajadores(emp.getTrabajadores(), emp.getId());
        System.out.println("✅ Trabajador actualizado:");
        System.out.println("   " + trab);
    }

    static void eliminarTrabajador(Emprendimiento emp) {
        verTrabajadores(emp);
        if (emp.getTrabajadores().isEmpty()) return;

        System.out.print("\nID del trabajador a eliminar: ");
        int id = leerEntero();
        Trabajador trab = emp.getTrabajadores().stream()
                .filter(t -> t.getId() == id).findFirst().orElse(null);
        if (trab == null) { System.out.println("❌ No encontrado."); return; }

        System.out.print("¿Eliminar a '" + trab.getNombreCompleto() + "'? (s/n): ");
        if (!scanner.nextLine().trim().equalsIgnoreCase("s")) {
            System.out.println("Operación cancelada.");
            return;
        }

        emp.getTrabajadores().remove(trab);
        dao.guardarTrabajadores(emp.getTrabajadores(), emp.getId());
        System.out.println("✅ Trabajador eliminado.");
    }

    // ══════════════════════════════════════════
    // NÓMINA
    // ══════════════════════════════════════════

    static void verNomina() {
        Emprendimiento emp = seleccionarEmprendimiento();
        if (emp == null) return;

        List<Cargo>      cargos      = dao.leerCargos(emp.getId());
        List<Trabajador> trabajadores = dao.leerTrabajadores(emp.getId(), cargos);
        emp.getCargos().clear();
        cargos.forEach(emp::agregarCargo);
        emp.getTrabajadores().clear();
        trabajadores.stream().filter(t -> t != null).forEach(emp::agregarTrabajador);

        new Nomina(emp).imprimirResumen();
    }

    // ══════════════════════════════════════════
    // UTILIDADES
    // ══════════════════════════════════════════

    static Emprendimiento seleccionarEmprendimiento() {
        verEmprendimientos();
        if (emprendimientos.isEmpty()) return null;
        System.out.print("\nID del emprendimiento: ");
        int id = leerEntero();
        Emprendimiento emp = buscarEmprendimiento(id);
        if (emp == null) System.out.println("❌ Emprendimiento no encontrado.");
        return emp;
    }

    static Emprendimiento buscarEmprendimiento(int id) {
        return emprendimientos.stream()
                .filter(e -> e.getId() == id).findFirst().orElse(null);
    }

    static int leerEntero() {
        try { return Integer.parseInt(scanner.nextLine().trim()); }
        catch (NumberFormatException e) { return -1; }
    }

    static double leerDouble() {
        try { return Double.parseDouble(scanner.nextLine().trim()); }
        catch (NumberFormatException e) { return 0; }
    }

    static void guardarTodo() {
        dao.guardarEmprendimientos(emprendimientos);
        emprendimientos.forEach(e -> {
            if (!e.getCargos().isEmpty())
                dao.guardarCargos(e.getCargos(), e.getId());
            if (!e.getTrabajadores().isEmpty())
                dao.guardarTrabajadores(e.getTrabajadores(), e.getId());
        });
    }
}