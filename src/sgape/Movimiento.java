package sgape;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Movimiento {
    public enum Tipo { VENTA, COMPRA, AJUSTE_STOCK, GASTO, INGRESO, FACTURA }

    private String id;
    private String fecha;
    private Tipo   tipo;
    private String descripcion;
    private double monto;
    private String emprendimientoId;
    private String referencia;

    public Movimiento(String id, Tipo tipo, String descripcion,
                      double monto, String emprendimientoId, String referencia) {
        this.id               = id;
        this.tipo             = tipo;
        this.descripcion      = descripcion;
        this.monto            = monto;
        this.emprendimientoId = emprendimientoId;
        this.referencia       = referencia;
        this.fecha            = LocalDateTime.now()
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    public Movimiento(String id, String fecha, Tipo tipo, String descripcion,
                      double monto, String emprendimientoId, String referencia) {
        this.id               = id;
        this.fecha            = fecha;
        this.tipo             = tipo;
        this.descripcion      = descripcion;
        this.monto            = monto;
        this.emprendimientoId = emprendimientoId;
        this.referencia       = referencia;
    }

    public String getId()               { return id; }
    public String getFecha()            { return fecha; }
    public Tipo   getTipo()             { return tipo; }
    public String getDescripcion()      { return descripcion; }
    public double getMonto()            { return monto; }
    public String getEmprendimientoId() { return emprendimientoId; }
    public String getReferencia()       { return referencia; }

    @Override
    public String toString() {
        return String.format("[%s] %-10s | %-35s | $%,.0f | Ref: %s",
            fecha, tipo, descripcion, monto, referencia);
    }

    public String toCSV() {
        return id + "," + fecha + "," + tipo.name() + "," +
               descripcion.replace(",", ";") + "," +
               monto + "," + emprendimientoId + "," + referencia;
    }

    public static Movimiento fromCSV(String linea) {
        String[] p = linea.split(",", -1);
        return new Movimiento(
            p[0], p[1], Tipo.valueOf(p[2]),
            p[3].replace(";", ","),
            Double.parseDouble(p[4].trim()),
            p[5], p.length > 6 ? p[6] : ""
        );
    }
}