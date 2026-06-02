package sgape;

// Herencia: Trabajador extiende Persona
public class Trabajador extends Persona {
    private int    id;
    private Cargo  cargo;
    private String fechaIngreso;
    private String estado;
    private int    emprendimientoId;

    public Trabajador(int id, String nombre, String apellido,
                      String cedula, Cargo cargo,
                      String fechaIngreso, int emprendimientoId) {
        super(nombre, apellido, cedula); // Llamada al constructor padre
        this.id               = id;
        this.cargo            = cargo;
        this.fechaIngreso     = fechaIngreso;
        this.estado           = "activo";
        this.emprendimientoId = emprendimientoId;
    }

    // Getters
    public int    getId()               { return id; }
    public Cargo  getCargo()            { return cargo; }
    public String getFechaIngreso()     { return fechaIngreso; }
    public String getEstado()           { return estado; }
    public int    getEmprendimientoId() { return emprendimientoId; }
    public void   setEstado(String e)   { this.estado = e; }

    // Polimorfismo - implementa método abstracto de Persona
    @Override
    public String getTipoPersona() { return "Trabajador"; }

    // Delegación al cargo para cálculos
    public double getSalarioMensual()   { return cargo.getSalarioMensual(); }
    public double getSalarioQuincenal() { return cargo.getSalarioQuincenal(); }
    public double getSalarioNeto()      { return cargo.getSalarioNeto(); }
    public double getTotalDeducciones() { return cargo.getTotalDeducciones(); }

    @Override
    public String toString() {
        return String.format("%-25s | %-20s | Mensual: $%,.0f | Neto: $%,.0f | %s",
                getNombreCompleto(), cargo.getNombre(),
                getSalarioMensual(), getSalarioNeto(), estado);
    }

    // Para guardar en archivo
    public String toCSV() {
        return id + "," + getNombre() + "," + getApellido() + "," +
                getCedula() + "," + cargo.getId() + "," +
                fechaIngreso + "," + estado + "," + emprendimientoId;
    }

    // Para leer de archivo (necesita lista de cargos)
    public static Trabajador fromCSV(String linea, java.util.List<Cargo> cargos) {
        String[] p = linea.split(",");
        int cargoId = Integer.parseInt(p[4]);
        Cargo cargo = cargos.stream()
                .filter(c -> c.getId() == cargoId)
                .findFirst()
                .orElse(null);
        Trabajador t = new Trabajador(
                Integer.parseInt(p[0]), p[1], p[2], p[3],
                cargo, p[5], Integer.parseInt(p[7])
        );
        t.setEstado(p[6]);
        return t;
    }
}