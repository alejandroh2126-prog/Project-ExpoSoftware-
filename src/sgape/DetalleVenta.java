package sgape;

public class DetalleVenta {
    private String productoId;
    private String productoNombre;
    private int    cantidad;
    private double precioUnitario;

    public DetalleVenta(String productoId, String productoNombre,
                        int cantidad, double precioUnitario) {
        this.productoId      = productoId;
        this.productoNombre  = productoNombre;
        this.cantidad        = cantidad;
        this.precioUnitario  = precioUnitario;
    }

    public String getProductoId()     { return productoId; }
    public String getProductoNombre() { return productoNombre; }
    public int    getCantidad()       { return cantidad; }
    public double getPrecioUnitario() { return precioUnitario; }
    public double getSubtotal()       { return cantidad * precioUnitario; }

    @Override
    public String toString() {
        return String.format("  %-25s x%d @ $%,.0f = $%,.0f",
            productoNombre, cantidad, precioUnitario, getSubtotal());
    }

    public String toCSV() {
        return productoId + "|" + productoNombre + "|" + cantidad + "|" + precioUnitario;
    }

    public static DetalleVenta fromCSV(String linea) {
        String[] p = linea.split("\\|", -1);
        return new DetalleVenta(p[0], p[1],
            Integer.parseInt(p[2].trim()),
            Double.parseDouble(p[3].trim()));
    }
}