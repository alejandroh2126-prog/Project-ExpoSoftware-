package sgape;

// Clase Cargo - Encapsulamiento
public class Cargo {
    private int id;
    private String nombre;
    private double salarioBase;
    private String descripcion;

    // Constantes de deducciones según ley colombiana
    public static final double PORCENTAJE_SALUD    = 0.04;
    public static final double PORCENTAJE_PENSION  = 0.04;
    public static final double TOTAL_DEDUCCIONES   = PORCENTAJE_SALUD + PORCENTAJE_PENSION;

    public Cargo(int id, String nombre, double salarioBase, String descripcion) {
        this.id          = id;
        this.nombre      = nombre;
        this.salarioBase = salarioBase;
        this.descripcion = descripcion;
    }

    // Getters
    public int    getId()          { return id; }
    public String getNombre()      { return nombre; }
    public double getSalarioBase() { return salarioBase; }
    public String getDescripcion() { return descripcion; }

    // Cálculos automáticos de nómina
    public double getSalarioMensual()   { return salarioBase; }
    public double getSalarioQuincenal() { return salarioBase / 2; }
    public double getDeduccionSalud()   { return salarioBase * PORCENTAJE_SALUD; }
    public double getDeduccionPension() { return salarioBase * PORCENTAJE_PENSION; }
    public double getTotalDeducciones() { return salarioBase * TOTAL_DEDUCCIONES; }
    public double getSalarioNeto()      { return salarioBase * (1 - TOTAL_DEDUCCIONES); }

    @Override
    public String toString() {
        return String.format("Cargo: %-20s | Base: $%,.0f | Quincenal: $%,.0f | Neto: $%,.0f",
                nombre, salarioBase, getSalarioQuincenal(), getSalarioNeto());
    }

    // Para guardar en archivo
    public String toCSV() {
        return id + "," + nombre + "," + salarioBase + "," + descripcion;
    }

    // Para leer de archivo
    public static Cargo fromCSV(String linea) {
        String[] partes = linea.split(",");
        return new Cargo(
                Integer.parseInt(partes[0]),
                partes[1],
                Double.parseDouble(partes[2]),
                partes.length > 3 ? partes[3] : ""
        );
    }
}