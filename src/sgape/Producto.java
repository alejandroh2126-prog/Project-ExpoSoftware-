package sgape;

public class Producto {
    private String id;
    private String nombre;
    private String categoria;
    private double precioCompra;
    private double precioVenta;
    private int    stock;
    private int    stockMinimo;
    private String emprendimientoId;

    public Producto(String id, String nombre, String categoria,
                    double precioCompra, double precioVenta,
                    int stock, int stockMinimo, String emprendimientoId) {
        this.id               = id;
        this.nombre           = nombre;
        this.categoria        = categoria;
        this.precioCompra     = precioCompra;
        this.precioVenta      = precioVenta;
        this.stock            = stock;
        this.stockMinimo      = stockMinimo;
        this.emprendimientoId = emprendimientoId;
    }

    // Getters
    public String getId()               { return id; }
    public String getNombre()           { return nombre; }
    public String getCategoria()        { return categoria; }
    public double getPrecioCompra()     { return precioCompra; }
    public double getPrecioVenta()      { return precioVenta; }
    public int    getStock()            { return stock; }
    public int    getStockMinimo()      { return stockMinimo; }
    public String getEmprendimientoId() { return emprendimientoId; }

    // Setters
    public void setNombre(String n)           { this.nombre = n; }
    public void setCategoria(String c)        { this.categoria = c; }
    public void setPrecioCompra(double p)     { this.precioCompra = p; }
    public void setPrecioVenta(double p)      { this.precioVenta = p; }
    public void setStock(int s)               { this.stock = s; }
    public void setStockMinimo(int s)         { this.stockMinimo = s; }

    // Métodos de negocio
    public void agregarStock(int cantidad)    { this.stock += cantidad; }
    public void reducirStock(int cantidad)    { this.stock -= cantidad; }
    public boolean tieneStockBajo()           { return stock <= stockMinimo; }
    public boolean hayStock(int cantidad)     { return stock >= cantidad; }
    public double getMargenGanancia()         { return precioVenta - precioCompra; }
    public double getPorcentajeMargen() {
        if (precioCompra == 0) return 0;
        return ((precioVenta - precioCompra) / precioCompra) * 100;
    }

    @Override
    public String toString() {
        String alerta = tieneStockBajo() ? " ⚠️  STOCK BAJO" : "";
        return String.format(
            "%-25s | Cat: %-12s | Stock: %3d | Compra: $%,.0f | Venta: $%,.0f | Margen: %.1f%%%s",
            nombre, categoria, stock, precioCompra, precioVenta,
            getPorcentajeMargen(), alerta);
    }

    public String toCSV() {
        return id + "," + nombre + "," + categoria + "," +
               precioCompra + "," + precioVenta + "," +
               stock + "," + stockMinimo + "," + emprendimientoId;
    }

    public static Producto fromCSV(String linea) {
        String[] p = linea.split(",", -1);
        return new Producto(
            p[0].trim(), p[1], p[2],
            Double.parseDouble(p[3].trim()),
            Double.parseDouble(p[4].trim()),
            Integer.parseInt(p[5].trim()),
            Integer.parseInt(p[6].trim()),
            p[7]
        );
    }
}