package sgape;

import java.io.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class GestorInventario {

    private static final String DIR = "datos/";

    // ══ PRODUCTOS ════════════════════════════════

    public List<Producto> leerProductos(String empId) {
        List<Producto> lista = new ArrayList<>();
        File f = new File(DIR + "productos_" + empId + ".csv");
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null)
                if (!linea.trim().isEmpty()) lista.add(Producto.fromCSV(linea));
        } catch (IOException e) {
            System.out.println("❌ Error leyendo productos: " + e.getMessage());
        }
        return lista;
    }

    public void guardarProductos(List<Producto> lista, String empId) {
        try (PrintWriter pw = new PrintWriter(new FileWriter(DIR + "productos_" + empId + ".csv"))) {
            for (Producto p : lista) pw.println(p.toCSV());
        } catch (IOException e) {
            System.out.println("❌ Error guardando productos: " + e.getMessage());
        }
    }

    // ══ VENTAS ═══════════════════════════════════

    public List<Venta> leerVentas(String empId) {
        List<Venta> lista = new ArrayList<>();
        File f = new File(DIR + "ventas_" + empId + ".csv");
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null)
                if (!linea.trim().isEmpty()) lista.add(Venta.fromCSV(linea));
        } catch (IOException e) {
            System.out.println("❌ Error leyendo ventas: " + e.getMessage());
        }
        return lista;
    }

    public void guardarVentas(List<Venta> lista, String empId) {
        try (PrintWriter pw = new PrintWriter(new FileWriter(DIR + "ventas_" + empId + ".csv"))) {
            for (Venta v : lista) pw.println(v.toCSV());
        } catch (IOException e) {
            System.out.println("❌ Error guardando ventas: " + e.getMessage());
        }
    }

    // ══ MOVIMIENTOS / HISTORIAL ═══════════════════

    public List<Movimiento> leerMovimientos(String empId) {
        List<Movimiento> lista = new ArrayList<>();
        File f = new File(DIR + "movimientos_" + empId + ".csv");
        if (!f.exists()) return lista;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            String linea;
            while ((linea = br.readLine()) != null)
                if (!linea.trim().isEmpty()) lista.add(Movimiento.fromCSV(linea));
        } catch (IOException e) {
            System.out.println("❌ Error leyendo historial: " + e.getMessage());
        }
        return lista;
    }

    public void guardarMovimientos(List<Movimiento> lista, String empId) {
        try (PrintWriter pw = new PrintWriter(new FileWriter(DIR + "movimientos_" + empId + ".csv"))) {
            for (Movimiento m : lista) pw.println(m.toCSV());
        } catch (IOException e) {
            System.out.println("❌ Error guardando historial: " + e.getMessage());
        }
    }

    public void registrarMovimiento(Movimiento.Tipo tipo, String desc,
                                    double monto, String empId, String ref) {
        List<Movimiento> lista = leerMovimientos(empId);
        lista.add(new Movimiento(
            String.valueOf(System.currentTimeMillis()),
            tipo, desc, monto, empId, ref));
        guardarMovimientos(lista, empId);
    }

    // ══ FACTURAS ════════════════════════════════

    public void generarFactura(Venta venta, Emprendimiento emp) {
        String dir = "facturas/";
        new File(dir).mkdirs();
        String archivo = dir + "factura_" + venta.getId() + ".txt";

        try (PrintWriter pw = new PrintWriter(new FileWriter(archivo))) {
            pw.println("╔══════════════════════════════════════════════════╗");
            pw.println("║              SGAPE – FACTURA DE VENTA            ║");
            pw.println("╚══════════════════════════════════════════════════╝");
            pw.println();
            pw.println("Emprendimiento : " + emp.getNombre());
            pw.println("Sector         : " + emp.getSector());
            pw.println("Fecha          : " + venta.getFecha());
            pw.println("Factura N°     : " + venta.getId());
            pw.println("Observación    : " + venta.getObservacion());
            pw.println();
            pw.println("─".repeat(52));
            pw.printf("  %-25s %6s %10s %12s%n", "PRODUCTO","CANT","PRECIO","SUBTOTAL");
            pw.println("─".repeat(52));
            for (DetalleVenta d : venta.getDetalles()) {
                pw.printf("  %-25s %6d %10s %12s%n",
                    d.getProductoNombre(), d.getCantidad(),
                    String.format("$%,.0f", d.getPrecioUnitario()),
                    String.format("$%,.0f", d.getSubtotal()));
            }
            pw.println("─".repeat(52));
            pw.printf("  %-25s %6d %10s %12s%n",
                "TOTAL", venta.getTotalProductos(), "",
                String.format("$%,.0f", venta.getTotal()));
            pw.println("─".repeat(52));
            pw.println();
            pw.println("  ¡Gracias por su compra!");
            pw.println();
            pw.println("  Universidad Popular del Cesar · SGAPE · 2026");
            pw.println("  Autor: Alejandro Henríquez Quinchia");

            System.out.println("✅ Factura generada: " + archivo);
        } catch (IOException e) {
            System.out.println("❌ Error generando factura: " + e.getMessage());
        }
    }

    // ══ ALERTAS ══════════════════════════════════

    public void verificarAlertas(List<Producto> productos) {
        List<Producto> bajos = productos.stream()
            .filter(Producto::tieneStockBajo)
            .collect(Collectors.toList());

        if (bajos.isEmpty()) return;

        System.out.println("\n" + "⚠️ ".repeat(20));
        System.out.println("  ALERTAS DE STOCK BAJO");
        System.out.println("⚠️ ".repeat(20));
        bajos.forEach(p -> System.out.printf(
            "  ❗ %-25s | Stock: %d | Mínimo: %d%n",
            p.getNombre(), p.getStock(), p.getStockMinimo()));
        System.out.println("⚠️ ".repeat(20));
    }
}