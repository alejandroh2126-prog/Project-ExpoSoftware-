package sgape;

import java.util.List;

public class Trabajador extends Persona {
    private int    id;
    private Cargo  cargo;
    private String fechaIngreso;
    private String estado;
    private int    emprendimientoId;

    public Trabajador(int id, String nombre, String apellido,
                      String cedula, Cargo cargo,
                      String fechaIngreso, int emprendimientoId) {
        super(nombre, apellido, cedula);
        this.id               = id;
        this.cargo            = cargo;
        this.fechaIngreso     = fechaIngreso;
        this.estado           = "activo";
        this.emprendimientoId = emprendimientoId;
    }

    // ── Getters ──────────────────────────────
    public int    getId()               { return id; }
    public Cargo  getCargo()            { return cargo; }
    public String getFechaIngreso()     { return fechaIngreso; }
    public String getEstado()           { return estado; }
    public int    getEmprendimientoId() { return emprendimientoId; }

    // ── Setters ──────────────────────────────
    public void setEstado(String estado)          { this.estado = estado; }
    public void setCargo(Cargo cargo)             { this.cargo = cargo; }
    public void setFechaIngreso(String fecha)     { this.fechaIngreso = fecha; }

    // ── Polimorfismo ─────────────────────────
    @Override
    public String getTipoPersona() { return "Trabajador"; }

    // ── Cálculos (delega al cargo) ────────────
    public double getSalarioMensual()   { return cargo.getSalarioMensual(); }
    public double getSalarioQuincenal() { return cargo.getSalarioQuincenal(); }
    public double getSalarioNeto()      { return cargo.getSalarioNeto(); }
    public double getTotalDeducciones() { return cargo.getTotalDeducciones(); }

    @Override
    public String toString() {
        return String.format(
                "%-25s | Cargo: %-20s | Mensual: $%,.0f | Neto: $%,.0f | %s",
                getNombreCompleto(), cargo.getNombre(),
                getSalarioMensual(), getSalarioNeto(), estado);
    }

    public String toCSV() {
        return id + "," + getNombre() + "," + getApellido() + "," +
                getCedula() + "," + cargo.getId() + "," +
                fechaIngreso + "," + estado + "," + emprendimientoId;
    }

    public static Trabajador fromCSV(String linea, List<Cargo> cargos) {
        String[] p = linea.split(",", -1);
        int cargoId = Integer.parseInt(p[4].trim());
        Cargo cargo = cargos.stream()
                .filter(c -> c.getId() == cargoId)
                .findFirst().orElse(null);
        if (cargo == null) return null;
        Trabajador t = new Trabajador(
                Integer.parseInt(p[0].trim()),
                p[1], p[2], p[3], cargo,
                p.length > 5 ? p[5] : "",
                p.length > 7 ? Integer.parseInt(p[7].trim()) : 1
        );
        if (p.length > 6) t.setEstado(p[6]);
        return t;
    }
}