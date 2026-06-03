package sgape;

import java.util.ArrayList;
import java.util.List;

public class Emprendimiento {
    private int    id;
    private String nombre;
    private String descripcion;
    private String sector;
    private String fechaInicio;
    private String estado;
    private int    usuarioId;
    private List<Trabajador> trabajadores;
    private List<Cargo>      cargos;

    public Emprendimiento(int id, String nombre, String descripcion,
                          String sector, String fechaInicio, int usuarioId) {
        this.id           = id;
        this.nombre       = nombre;
        this.descripcion  = descripcion;
        this.sector       = sector;
        this.fechaInicio  = fechaInicio;
        this.estado       = "activo";
        this.usuarioId    = usuarioId;
        this.trabajadores = new ArrayList<>();
        this.cargos       = new ArrayList<>();
    }

    // ── Getters ──────────────────────────────
    public int    getId()          { return id; }
    public String getNombre()      { return nombre; }
    public String getDescripcion() { return descripcion; }
    public String getSector()      { return sector; }
    public String getFechaInicio() { return fechaInicio; }
    public String getEstado()      { return estado; }
    public int    getUsuarioId()   { return usuarioId; }
    public List<Trabajador> getTrabajadores() { return trabajadores; }
    public List<Cargo>      getCargos()       { return cargos; }

    // ── Setters ──────────────────────────────
    public void setNombre(String nombre)           { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setSector(String sector)           { this.sector = sector; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }
    public void setEstado(String estado)           { this.estado = estado; }

    // ── Métodos ──────────────────────────────
    public void agregarTrabajador(Trabajador t) { trabajadores.add(t); }
    public void agregarCargo(Cargo c)           { cargos.add(c); }

    public int getTotalTrabajadores() {
        return (int) trabajadores.stream()
                .filter(t -> t.getEstado().equals("activo")).count();
    }

    public double getNominaMensualTotal() {
        return trabajadores.stream()
                .filter(t -> t.getEstado().equals("activo"))
                .mapToDouble(Trabajador::getSalarioMensual)
                .sum();
    }

    @Override
    public String toString() {
        return String.format(
                "%-25s | Sector: %-15s | Estado: %-8s | Trabajadores: %d | Nómina: $%,.0f",
                nombre, sector, estado, getTotalTrabajadores(), getNominaMensualTotal());
    }

    public String toCSV() {
        return id + "," + nombre + "," + descripcion + "," +
                sector + "," + fechaInicio + "," + estado + "," + usuarioId;
    }

    public static Emprendimiento fromCSV(String linea) {
        String[] p = linea.split(",", -1);
        Emprendimiento e = new Emprendimiento(
                Integer.parseInt(p[0].trim()),
                p.length > 1 ? p[1] : "",
                p.length > 2 ? p[2] : "",
                p.length > 3 ? p[3] : "",
                p.length > 4 ? p[4] : "",
                p.length > 6 ? Integer.parseInt(p[6].trim()) : 1
        );
        if (p.length > 5 && !p[5].isEmpty()) e.setEstado(p[5]);
        return e;
    }
}