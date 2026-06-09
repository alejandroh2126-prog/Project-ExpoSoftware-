package sgape;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class Venta {
    private String           id;
    private String           fecha;
    private String           emprendimientoId;
    private List<DetalleVenta> detalles;
    private String           observacion;

    public Venta(String id, String emprendimientoId, String observacion) {
        this.id               = id;
        this.emprendimientoId = emprendimientoId;
        this.fecha            = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        this.detalles         = new ArrayList<>();
        this.observacion      = observacion;
    }

    // Constructor para cargar de archivo
    public Venta(String id, String fecha, String emprendimientoId,
                 List<DetalleVenta> detalles, String observacion) {
        this.id               = id;
        this.fecha            = fecha;
        this.emprendimientoId = emprendimientoId;
        this.detalles         = detalles;
        this.observacion      = observacion;
    }

    public String             getId()               { return id; }
    public String             getFecha()            { return fecha; }
    public String             getEmprendimientoId() { return emprendimientoId; }
    public List<DetalleVenta> getDetalles()         { return detalles; }
    public String             getObservacion()      { return observacion; }

    public void agregarDetalle(DetalleVenta d) { detalles.add(d); }

    public double getTotal() {
        return detalles.stream().mapToDouble(DetalleVenta::getSubtotal).sum();
    }

    public int getTotalProductos() {
        return detalles.stream().mapToInt(DetalleVenta::getCantidad).sum();
    }

    @Override
    public String toString() {
        return String.format("Venta #%s | Fecha: %s | Productos: %d | Total: $%,.0f",
            id, fecha, getTotalProductos(), getTotal());
    }

    public String toCSV() {
        StringBuilder sb = new StringBuilder();
        sb.append(id).append(";")
          .append(fecha).append(";")
          .append(emprendimientoId).append(";")
          .append(observacion).append(";");
        List<String> dets = new ArrayList<>();
        for (DetalleVenta d : detalles) dets.add(d.toCSV());
        sb.append(String.join("~", dets));
        return sb.toString();
    }

    public static Venta fromCSV(String linea) {
        String[] p = linea.split(";", -1);
        List<DetalleVenta> detalles = new ArrayList<>();
        if (p.length > 4 && !p[4].isEmpty()) {
            for (String d : p[4].split("~")) {
                if (!d.trim().isEmpty()) detalles.add(DetalleVenta.fromCSV(d));
            }
        }
        return new Venta(p[0], p[1], p[2], detalles, p.length > 3 ? p[3] : "");
    }
}