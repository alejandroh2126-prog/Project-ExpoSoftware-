package sgape;

import java.util.List;

// Clase Nómina - calcula y resume pagos
public class Nomina {
    private Emprendimiento emprendimiento;

    public Nomina(Emprendimiento emprendimiento) {
        this.emprendimiento = emprendimiento;
    }

    public double getTotalNominaMensual() {
        return emprendimiento.getNominaMensualTotal();
    }

    public double getTotalNominaQuincenal() {
        return getTotalNominaMensual() / 2;
    }

    public double getTotalDeducciones() {
        return emprendimiento.getTrabajadores().stream()
                .filter(t -> t.getEstado().equals("activo"))
                .mapToDouble(Trabajador::getTotalDeducciones)
                .sum();
    }

    public double getTotalNominaNet() {
        return getTotalNominaMensual() - getTotalDeducciones();
    }

    public void imprimirResumen() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("  RESUMEN DE NÓMINA: " + emprendimiento.getNombre());
        System.out.println("=".repeat(60));
        System.out.printf("  Trabajadores activos : %d%n",
                emprendimiento.getTotalTrabajadores());
        System.out.printf("  Nómina mensual bruta : $%,.2f%n",
                getTotalNominaMensual());
        System.out.printf("  Nómina quincenal     : $%,.2f%n",
                getTotalNominaQuincenal());
        System.out.printf("  Total deducciones    : $%,.2f%n",
                getTotalDeducciones());
        System.out.printf("  Nómina neta total    : $%,.2f%n",
                getTotalNominaNet());
        System.out.println("=".repeat(60));

        System.out.println("\n  DETALLE POR TRABAJADOR:");
        System.out.println("-".repeat(60));
        emprendimiento.getTrabajadores().stream()
                .filter(t -> t.getEstado().equals("activo"))
                .forEach(t -> {
                    System.out.printf("  %-25s%n", t.getNombreCompleto());
                    System.out.printf("    Cargo    : %s%n", t.getCargo().getNombre());
                    System.out.printf("    Mensual  : $%,.2f%n", t.getSalarioMensual());
                    System.out.printf("    Quincenal: $%,.2f%n", t.getSalarioQuincenal());
                    System.out.printf("    Neto     : $%,.2f%n", t.getSalarioNeto());
                    System.out.println();
                });
    }
}