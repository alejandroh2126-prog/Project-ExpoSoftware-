package sgape;

public class Cargo {
    private int    id;
    private String nombre;
    private double salarioBase;
    private String descripcion;

    public static final double PORCENTAJE_SALUD   = 0.04;
    public static final double PORCENTAJE_PENSION = 0.04;
    public static final double TOTAL_DEDUCCIONES  = PORCENTAJE_SALUD + PORCENTAJE_PENSION;

    public Cargo(int id, String nombre, double salarioBase, String descripcion) {
        this.id          = id;
        this.nombre      = nombre;
        this.salarioBase = salarioBase;
        this.descripcion = descripcion;
    }

    // ── Getters ──────────────────────────────
    public int    getId()          { return id; }
    public String getNombre()      { return nombre; }
    public double getSalarioBase() { return salarioBase; }
    public String getDescripcion() { return descripcion; }

    // ── Setters ──────────────────────────────
    public void setNombre(String nombre)           { this.nombre = nombre; }
    public void setSalarioBase(double salarioBase) { this.salarioBase = salarioBase; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    // ── Cálculos automáticos ─────────────────
    public double getSalarioMensual()   { return salarioBase; }
    public double getSalarioQuincenal() { return salarioBase / 2; }
    public double getDeduccionSalud()   { return salarioBase * PORCENTAJE_SALUD; }
    public double getDeduccionPension() { return salarioBase * PORCENTAJE_PENSION; }
    public double getTotalDeducciones() { return salarioBase * TOTAL_DEDUCCIONES; }
    public double getSalarioNeto()      { return salarioBase * (1 - TOTAL_DEDUCCIONES); }

    @Override
    public String toString() {
        return String.format(
                "%-20s | Base: $%,.0f | Quincenal: $%,.0f | Deducciones: $%,.0f | Neto: $%,.0f",
                nombre, salarioBase, getSalarioQuincenal(),
                getTotalDeducciones(), getSalarioNeto());
    }

    public String toCSV() {
        return id + "," + nombre + "," + salarioBase + "," + descripcion;
    }

    public static Cargo fromCSV(String linea) {
        String[] p = linea.split(",", -1);
        return new Cargo(
                Integer.parseInt(p[0].trim()),
                p.length > 1 ? p[1] : "",
                p.length > 2 ? Double.parseDouble(p[2].trim()) : 0,
                p.length > 3 ? p[3] : ""
        );
    }
}